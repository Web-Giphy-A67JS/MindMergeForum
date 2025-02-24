import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ref, onValue } from 'firebase/database';
import { db } from '../config/firebase.config';
import { getUserById } from '../../services/user.services';

const usePosts = () => {
  return useQuery({
    queryKey: ['posts'],
    queryFn: () =>
      new Promise((resolve, reject) => {
        const postsRef = ref(db, 'posts');
        const unsubscribe = onValue(
          postsRef,
          async (snapshot) => {
            try {
              const data = snapshot.val() || {};
              const handles = {};
              
              // Fetch user handles for all posts
              await Promise.all(
                Object.values(data).map(async (post) => {
                  const userData = await getUserById(post.userId);
                  handles[post.userId] = userData ? userData.handle : 'Unknown User';
                })
              );

              resolve({ posts: data, userHandles: handles });
            } catch (error) {
              reject(error);
            }
          },
          (error) => {
            reject(error);
          }
        );

        // Cleanup subscription on unmount or refetch
        return () => unsubscribe();
      }),
    refetchOnWindowFocus: false
  });
};

export default usePosts;