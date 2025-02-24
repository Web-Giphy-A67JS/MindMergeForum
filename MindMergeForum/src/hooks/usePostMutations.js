import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePost, updatePost } from '../../services/posts.services';

export const usePostMutations = () => {
  const queryClient = useQueryClient();

  const deletePostMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });

  const updatePostMutation = useMutation({
    mutationFn: ({ postId, updates }) => updatePost(postId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });

  return {
    deletePost: deletePostMutation.mutate,
    updatePost: updatePostMutation.mutate,
    isDeleting: deletePostMutation.isPending,
    isUpdating: updatePostMutation.isPending,
    deleteError: deletePostMutation.error,
    updateError: updatePostMutation.error
  };
};