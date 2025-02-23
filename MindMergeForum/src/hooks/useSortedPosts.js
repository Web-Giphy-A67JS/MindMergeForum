import { useState, useEffect, useContext, useMemo } from 'react';
import { getPostsSorted } from '../../services/posts';
import { SORT_CRITERIA, SORT_ORDERS, DATE_RANGE } from '../../common/constants/sorting.constants';
import { getUserById } from '../../services/user.services';
import { AppContext } from '../store/app.context';
import { auth } from '../config/firebase.config';

export const useSortedPosts = () => {
  const { userData } = useContext(AppContext);
  const [posts, setPosts] = useState({ topCommented: {}, topNew: {}, sortedPosts: {} });
  const [userHandles, setUserHandles] = useState({});
  const [sortCriteria, setSortCriteria] = useState(SORT_CRITERIA.DATE);
  const [sortOrder, setSortOrder] = useState(SORT_ORDERS.DESC);
  const [dateRange, setDateRange] = useState({
    [DATE_RANGE.FROM]: '',
    [DATE_RANGE.TO]: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(true);
  const [loadingState, setLoadingState] = useState({
    comments: false,
    new: false,
    sorted: false
  });
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    lastCommentedPost: null,
    lastNewPost: null,
    lastSortedPost: null
  });
  const [hasMore, setHasMore] = useState({
    comments: true,
    new: true,
    sorted: true
  });

  const [searchQuery, setSearchQuery] = useState('');

  const isGuest = !auth.currentUser && !userData;

    const filteredPosts = useMemo(() => {
    if (!searchQuery) {
      return posts.sortedPosts;
    }

    const lowerCaseQuery = searchQuery.toLowerCase();

    const filtered = {};
    for (const postId in posts.sortedPosts) {
      const post = posts.sortedPosts[postId];
      if (
        post.title.toLowerCase().includes(lowerCaseQuery) ||
        post.content.toLowerCase().includes(lowerCaseQuery)
      ) {
        filtered[postId] = post;
      }
    }
    return filtered;
  }, [posts.sortedPosts, searchQuery]);

  const fetchSortedPosts = async (section = null) => {
    try {
      if (section) {
        setLoadingState(prev => ({ ...prev, [section]: true }));
      } else {
        setLoading(true);
      }
      setError(null);
      
      const result = await getPostsSorted(
        sortCriteria,
        sortOrder,
        10,
        section ? pagination : {  // Fix: Pass empty pagination object instead of null
          lastCommentedPost: null,
          lastNewPost: null,
          lastSortedPost: null
        },
        dateRange,
        isGuest
      );

      setPosts(prevPosts => ({
        topCommented: section === 'comments'
          ? { ...prevPosts.topCommented, ...result.topCommented }
          : result.topCommented,
        topNew: section === 'new'
          ? { ...prevPosts.topNew, ...result.topNew }
          : result.topNew,
        sortedPosts: section === 'sorted'
          ? { ...prevPosts.sortedPosts, ...result.sortedPosts }
          : (result.sortedPosts || {})
      }));

      setPagination(result.pagination);
      setHasMore({
        comments: !!result.pagination.lastCommentedPost,
        new: !!result.pagination.lastNewPost,
        sorted: !isGuest && !!result.pagination.lastSortedPost
      });

      // Fetch user handles
      const handles = {};
      const postsToProcess = {
        ...result.topCommented,
        ...result.topNew,
        ...(result.sortedPosts || {})
      };
      
      for (const postId in postsToProcess) {
        const post = postsToProcess[postId];
        if (!userHandles[post.userId]) {
          const userData = await getUserById(post.userId);
          handles[post.userId] = userData ? userData.handle : "Unknown User";
        }
      }
      setUserHandles(prevHandles => ({ ...prevHandles, ...handles }));
    } catch (err) {
      console.error('Error fetching sorted posts:', err);
      setError(err.message);
    } finally {
      if (section) {
        setLoadingState(prev => ({ ...prev, [section]: false }));
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    setPagination({
      lastCommentedPost: null,
      lastNewPost: null,
      lastSortedPost: null
    });
    setHasMore({
      comments: true,
      new: true,
      sorted: true
    });
    fetchSortedPosts();
  }, [sortCriteria, sortOrder, dateRange, isGuest]);

  const loadMore = (section) => {
    if (hasMore[section] && !loadingState[section]) {
      fetchSortedPosts(section);
    }
  };

  const updateSortCriteria = (newCriteria) => {
    if (newCriteria !== sortCriteria) {
      setSortCriteria(newCriteria);
      const [, order] = newCriteria.split('_');
      setSortOrder(order || SORT_ORDERS.DESC);
    }
  };

  const updateDateRange = (newDateRange) => {
    setDateRange(newDateRange);
  };

  return {
    posts,
    userHandles,
    sortCriteria,
    updateSortCriteria,
    sortOrder,
    setSortOrder,
    dateRange,
    updateDateRange,
    loading,
    loadingState,
    error,
    isGuest,
    hasMore,
    loadMore,
    sortedPosts: filteredPosts,
    setSearchQuery,
    searchQuery
  };
};