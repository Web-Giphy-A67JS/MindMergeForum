import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserRole } from '../../services/user.services';

export const useUserMutations = () => {
  const queryClient = useQueryClient();

  const updateRoleMutation = useMutation({
    mutationFn: ({ uid, role }) => updateUserRole(uid, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  return {
    updateRole: updateRoleMutation.mutate,
    isUpdating: updateRoleMutation.isPending,
    error: updateRoleMutation.error
  };
};