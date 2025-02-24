import { useQuery } from '@tanstack/react-query';
import { getAllUsers, getAllUsersByEmail } from '../../services/user.services';

const useUsers = (search = '', searchMethod = 'username') => {
  return useQuery({
    queryKey: ['users', search, searchMethod],
    queryFn: async () => {
      if (searchMethod === 'email') {
        return getAllUsersByEmail(search);
      }
      return getAllUsers(search);
    },
    // Remove the enabled condition to always fetch users
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false // Disable automatic refetch on window focus
  });
};

export default useUsers;