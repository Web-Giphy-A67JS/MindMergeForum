import { useState, useEffect, useContext } from 'react';
import { getPostsSorted } from '../../services/posts';
import { searchPosts } from '../../services/posts/crud.services';
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
  const [isSearching, setIsSearching] = useState(false);

  const isGuest = !auth.currentUser && !userData;

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
        section ? pagination : {
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

      await fetchUserHandles({
        ...result.topCommented,
        ...result.topNew,
        ...(result.sortedPosts || {})
      });
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

  const fetchUserHandles = async (postsToProcess) => {
    const handles = {};
    for (const postId in postsToProcess) {
      const post = postsToProcess[postId];
      if (!userHandles[post.userId]) {
        const userData = await getUserById(post.userId);
        handles[post.userId] = userData ? userData.handle : "Unknown User";
      }
    }
    setUserHandles(prevHandles => ({ ...prevHandles, ...handles }));
  };

  const performSearch = async (query) => {
    if (!query) {
      fetchSortedPosts();
      return;
    }

    try {
      setIsSearching(true);
      setError(null);
      const searchResults = await searchPosts(query);
      setPosts(prev => ({
        ...prev,
        sortedPosts: searchResults
      }));
      await fetchUserHandles(searchResults);
    } catch (err) {
      console.error('Error searching posts:', err);
      setError(err.message);
    } finally {
      setIsSearching(false);
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
    if (!searchQuery) {
      fetchSortedPosts();
    }
  }, [sortCriteria, sortOrder, dateRange, isGuest]);

  useEffect(() => {
    if (searchQuery) {
      performSearch(searchQuery);
    }
  }, [searchQuery]);

  const loadMore = (section) => {
    if (hasMore[section] && !loadingState[section] && !searchQuery) {
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
    loading: loading || isSearching,
    loadingState,
    error,
    isGuest,
    hasMore,
    loadMore,
    sortedPosts: posts.sortedPosts,
    setSearchQuery,
    searchQuery
  };
};