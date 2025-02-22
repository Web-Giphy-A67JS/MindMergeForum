import { useState, useEffect, useContext } from 'react';
import { getPostsSorted } from '../../services/posts';
import { SORT_CRITERIA, SORT_ORDERS, DATE_RANGE } from '../../common/constants/sorting.constants';
import { getUserById } from '../../services/user.services';
import { AppContext } from '../store/app.context';
import { auth } from '../config/firebase.config';

export const useSortedPosts = () => {
  const { userData } = useContext(AppContext);
  const [posts, setPosts] = useState({});
  const [userHandles, setUserHandles] = useState({});
  const [sortCriteria, setSortCriteria] = useState(SORT_CRITERIA.DATE);
  const [sortOrder, setSortOrder] = useState(SORT_ORDERS.DESC);
  const [dateRange, setDateRange] = useState({
    [DATE_RANGE.FROM]: '',
    [DATE_RANGE.TO]: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isGuest = !auth.currentUser && !userData;

  useEffect(() => {
    const fetchSortedPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch sorted posts
        const sortedPosts = await getPostsSorted(sortCriteria, sortOrder, 50, dateRange, isGuest);
        setPosts(sortedPosts);

        // Fetch user handles for the posts
        const handles = {};
        const postsToProcess = isGuest ? { ...sortedPosts.topCommented, ...sortedPosts.topNew } : sortedPosts;
        
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
        setLoading(false);
      }
    };

    fetchSortedPosts();
  }, [sortCriteria, sortOrder, dateRange, isGuest]);

  const updateSortCriteria = (newCriteria) => {
    if (newCriteria !== sortCriteria) {
      setSortCriteria(newCriteria);
      // Set the appropriate order based on the new criteria
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
    error,
    isGuest
  };
};