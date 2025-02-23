import { ref, get } from 'firebase/database';
import { db } from '../../src/config/firebase.config';
import { SORT_CRITERIA, SORT_ORDERS, DATE_RANGE } from '../../common/constants/sorting.constants';

const getCommentCount = (post) => {
  if (post.comments) {
    return Object.keys(post.comments).length;
  }
  return post.commentCount || 0;
};

const getLikeCount = (post) => {
  if (post.likedBy && typeof post.likedBy === 'object') {
    return Object.keys(post.likedBy).length;
  }
  return post.likes || post.likeCount || 0;
};

export const getPostsSorted = async (
  criteria = SORT_CRITERIA.DATE,
  order = SORT_ORDERS.DESC,
  limit = 10,
  pagination = {
    lastCommentedPost: null,
    lastNewPost: null,
    lastSortedPost: null
  },
  dateRange = {},
  isGuest = false
) => {
  const postsRef = ref(db, 'posts');
  let sortField;
  
  switch (criteria) {
    case SORT_CRITERIA.DATE:
      sortField = 'createdOn';
      break;
    case SORT_CRITERIA.LIKES:
      sortField = 'likedBy';
      break;
    case SORT_CRITERIA.COMMENTS:
      sortField = 'commentCount';
      break;
    default:
      sortField = 'createdOn';
  }

  try {
    const snapshot = await get(postsRef);
    const allPosts = snapshot.val() || {};
    
    const filterByDateRange = (post) => {
      if (!post.createdOn) return false;

      const postDate = new Date(post.createdOn);
      const fromDate = dateRange[DATE_RANGE.FROM] ? new Date(dateRange[DATE_RANGE.FROM]) : null;
      const toDate = dateRange[DATE_RANGE.TO] ? new Date(dateRange[DATE_RANGE.TO]) : null;

      if (fromDate && isNaN(fromDate.getTime())) return true;
      if (toDate && isNaN(toDate.getTime())) return true;

      if (fromDate && postDate < fromDate) return false;
      if (toDate && postDate > toDate) return false;

      return true;
    };

    const allPostsArray = Object.entries(allPosts).filter(([, post]) => filterByDateRange(post));

    // Get most commented posts with pagination
    const commentedPosts = [...allPostsArray]
      .sort(([, a], [, b]) => getCommentCount(b) - getCommentCount(a))
      .filter(([, post]) => {
        if (!pagination.lastCommentedPost) return true;
        return getCommentCount(post) < getCommentCount(pagination.lastCommentedPost);
      })
      .slice(0, limit)
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    // Get newest posts with pagination
    const newPosts = [...allPostsArray]
      .sort(([, a], [, b]) => new Date(b.createdOn) - new Date(a.createdOn))
      .filter(([, post]) => {
        if (!pagination.lastNewPost) return true;
        return new Date(post.createdOn) < new Date(pagination.lastNewPost.createdOn);
      })
      .slice(0, limit)
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    const result = {
      topCommented: commentedPosts,
      topNew: newPosts,
      pagination: {
        lastCommentedPost: Object.values(commentedPosts).sort((a, b) =>
          getCommentCount(b) - getCommentCount(a)
        )[Object.keys(commentedPosts).length - 1] || null,
        lastNewPost: Object.values(newPosts).sort((a, b) =>
          new Date(b.createdOn) - new Date(a.createdOn)
        )[Object.keys(newPosts).length - 1] || null
      }
    };

    // For logged-in users, include sorted posts based on criteria
    if (!isGuest) {
      const sortedPosts = [...allPostsArray]
        .filter(([, post]) => {
          if (!pagination.lastSortedPost) return true;
          
          if (sortField === 'likedBy') {
            return getLikeCount(post) < getLikeCount(pagination.lastSortedPost);
          }
          if (sortField === 'commentCount') {
            return getCommentCount(post) < getCommentCount(pagination.lastSortedPost);
          }
          if (sortField === 'createdOn') {
            return new Date(post.createdOn) < new Date(pagination.lastSortedPost.createdOn);
          }
          return true;
        })
        .sort(([, a], [, b]) => {
          if (sortField === 'likedBy') {
            const likesA = getLikeCount(a);
            const likesB = getLikeCount(b);
            return order === SORT_ORDERS.ASC ? likesA - likesB : likesB - likesA;
          }
          if (sortField === 'commentCount') {
            const commentsA = getCommentCount(a);
            const commentsB = getCommentCount(b);
            return order === SORT_ORDERS.ASC ? commentsA - commentsB : commentsB - commentsA;
          }
          if (sortField === 'createdOn') {
            return order === SORT_ORDERS.ASC
              ? new Date(a[sortField]) - new Date(b[sortField])
              : new Date(b[sortField]) - new Date(a[sortField]);
          }
          return order === SORT_ORDERS.ASC
            ? a[sortField] - b[sortField]
            : b[sortField] - a[sortField];
        })
        .slice(0, limit)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

      result.sortedPosts = sortedPosts;
      result.pagination.lastSortedPost = Object.values(sortedPosts)[Object.keys(sortedPosts).length - 1] || null;
    }

    return result;
  } catch (error) {
    console.error('Error fetching sorted posts:', error);
    throw error;
  }
};