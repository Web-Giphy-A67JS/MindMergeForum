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

export const getPostsSorted = async (criteria, order = SORT_ORDERS.DESC, limit = 50, dateRange = {}, isGuest = false) => {
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
    
    const filteredPosts = Object.entries(allPosts).filter(([, post]) => {
      if (!post.createdOn) return false;

      const postDate = new Date(post.createdOn);
      const fromDate = dateRange[DATE_RANGE.FROM] ? new Date(dateRange[DATE_RANGE.FROM]) : null;
      const toDate = dateRange[DATE_RANGE.TO] ? new Date(dateRange[DATE_RANGE.TO]) : null;

      if (fromDate && isNaN(fromDate.getTime())) return true;
      if (toDate && isNaN(toDate.getTime())) return true;

      if (fromDate && postDate < fromDate) return false;
      if (toDate && postDate > toDate) return false;
      return true;
    });

    if (isGuest) {
      // For guest users, return both top commented and newest posts
      const topCommented = [...filteredPosts]
        .sort(([, a], [, b]) => getCommentCount(b) - getCommentCount(a))
        .slice(0, 10)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

      const topNew = [...filteredPosts]
        .sort(([, a], [, b]) => new Date(b.createdOn) - new Date(a.createdOn))
        .slice(0, 10)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

      return {
        topCommented,
        topNew
      };
    }

    // For logged-in users, return sorted posts based on criteria
    const sortedPosts = filteredPosts
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
    
    return sortedPosts;
  } catch (error) {
    console.error('Error fetching sorted posts:', error);
    throw error;
  }
};