import { useQuery } from '@tanstack/react-query';
import { ref, onValue } from 'firebase/database';
import { db } from '../config/firebase.config';

const usePost = (id) => {
  return useQuery({
    queryKey: ['post', id],
    queryFn: () =>
      new Promise((resolve, reject) => {
        const postRef = ref(db, `posts/${id}`);
        const unsubscribe = onValue(
          postRef,
          (snapshot) => {
            if (!snapshot.exists()) {
              reject(new Error('Post not found'));
              return;
            }
            resolve(snapshot.val());
          },
          (error) => {
            reject(error);
          }
        );
        
        // Cleanup subscription on unmount or refetch
        return () => unsubscribe();
      }),
    enabled: !!id, // Only run query if id is provided
    refetchOnWindowFocus: false
  });
};

export default usePost;