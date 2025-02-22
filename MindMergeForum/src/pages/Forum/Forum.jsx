import { useContext } from "react";
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { auth } from "../../config/firebase.config";
import { deletePost } from "../../../services/posts";
import { Roles } from "../../../common/roles.enum";
import { AppContext } from "../../store/app.context";
import { SortingControls } from "../../../components/SortingControls/SortingControls";
import { useSortedPosts } from "../../hooks/useSortedPosts";
import { Box, Heading, Text, Button, VStack, HStack, Spinner, Divider } from "@chakra-ui/react";

const PostCard = ({ postId, post, userHandles, onDelete, canDelete, onSeeMore }) => (
  <Box key={postId} borderWidth={1} borderRadius="lg" p={4}>
    <Heading as="h3" size="md">{post.title}</Heading>
    <Text fontSize="sm" color="gray.500">
      Created by: {userHandles[post.userId] || 'Unknown User'} |
      Created on: {new Date(post.createdOn).toLocaleString()}
    </Text>
    <Text mt={2} noOfLines={3}>{post.content}</Text>
    <HStack mt={2}>
      <Text>❤️ {post.likedBy ? Object.keys(post.likedBy).length : (post.likes || 0)}</Text>
      <Text>💬 {post.comments ? Object.keys(post.comments).length : (post.commentCount || 0)}</Text>
    </HStack>
    <HStack mt={2}>
      <Button
        colorScheme="blue"
        onClick={() => onSeeMore(postId)}
      >
        See More
      </Button>
      {canDelete && (
        <Button
          colorScheme="red"
          onClick={() => onDelete(postId)}
        >
          Delete
        </Button>
      )}
    </HStack>
  </Box>
);

PostCard.propTypes = {
  postId: PropTypes.string.isRequired,
  post: PropTypes.shape({
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    userId: PropTypes.string.isRequired,
    createdOn: PropTypes.string.isRequired,
    likedBy: PropTypes.object,
    likes: PropTypes.number,
    comments: PropTypes.object,
    commentCount: PropTypes.number
  }).isRequired,
  userHandles: PropTypes.objectOf(PropTypes.string).isRequired,
  onDelete: PropTypes.func,
  canDelete: PropTypes.bool.isRequired,
  onSeeMore: PropTypes.func.isRequired
};

PostCard.defaultProps = {
  onDelete: () => {}
};

export default function Forum() {
  const { userData } = useContext(AppContext);
  const navigation = useNavigate();
  const {
    posts,
    userHandles,
    sortCriteria,
    updateSortCriteria,
    dateRange,
    updateDateRange,
    loading,
    error,
    isGuest
  } = useSortedPosts();

  const handleDelete = async (postId) => {
    try {
      await deletePost(postId);
    } catch (error) {
      console.error("Error deleting post:", error.message);
    }
  };

  const handleSeeMore = (postId) => {
    navigation(`/posts/${postId}`);
  };

  const canDeletePost = (post) => {
    return (auth.currentUser && auth.currentUser.uid === post.userId) ||
           (userData && userData.role === Roles.admin);
  };

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <Text color="red.500">Error: {error}</Text>;
  }

  if (isGuest) {
    return (
      <Box>
        <Heading as="h2" mb={4}>Welcome to the Forum</Heading>
        <Text mb={4} color="gray.600">
          Sign in to see all posts and participate in discussions.
        </Text>

        <Box mb={8}>
          <Heading as="h3" size="lg" mb={4}>Most Discussed Posts</Heading>
          <VStack spacing={4} align="stretch">
            {Object.entries(posts.topCommented).map(([postId, post]) => (
              <PostCard
                key={postId}
                postId={postId}
                post={post}
                userHandles={userHandles}
                onSeeMore={handleSeeMore}
                canDelete={false}
              />
            ))}
          </VStack>
        </Box>

        <Divider my={8} />

        <Box>
          <Heading as="h3" size="lg" mb={4}>Latest Posts</Heading>
          <VStack spacing={4} align="stretch">
            {Object.entries(posts.topNew).map(([postId, post]) => (
              <PostCard
                key={postId}
                postId={postId}
                post={post}
                userHandles={userHandles}
                onSeeMore={handleSeeMore}
                canDelete={false}
              />
            ))}
          </VStack>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Heading as="h2" mb={4}>Forum</Heading>
      
      <SortingControls
        sortCriteria={sortCriteria}
        onSortCriteriaChange={updateSortCriteria}
        dateRange={dateRange}
        onDateRangeChange={updateDateRange}
      />

      {Object.keys(posts).length === 0 ? (
        <Text>No posts available</Text>
      ) : (
        <VStack spacing={4} align="stretch">
          {Object.entries(posts).map(([postId, post]) => (
            <PostCard
              key={postId}
              postId={postId}
              post={post}
              userHandles={userHandles}
              onDelete={handleDelete}
              onSeeMore={handleSeeMore}
              canDelete={canDeletePost(post)}
            />
          ))}
        </VStack>
      )}
    </Box>
  );
}