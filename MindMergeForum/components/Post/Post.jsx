import PropTypes from 'prop-types';
import {
  Flex,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";

const PostCard = ({ postId, post, userHandles, onDelete, canDelete, onSeeMore }) => {
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const metaColor = useColorModeValue("gray.600", "gray.400");
  const statsColor = useColorModeValue("gray.500", "gray.400");
  const commentColor = useColorModeValue("green.600", "green.400");

  const commentCount = post.comments ? Object.keys(post.comments).length : (post.commentCount || 0);
  const likeCount = post.likedBy ? Object.keys(post.likedBy).length : (post.likes || 0);

  return (
    <Flex
      borderBottom="1px"
      borderColor={borderColor}
      py={4}
      w="100%"
    >
      {/* Stats Column */}
      <VStack
        minW="120px"
        spacing={2}
        align="center"
        pr={4}
      >
        <VStack spacing={0}>
          <Text fontWeight="bold" fontSize="xl">
            {likeCount}
          </Text>
          <Text fontSize="sm" color={statsColor}>
            likes
          </Text>
        </VStack>
        <VStack spacing={0}>
          <Text
            fontWeight="bold"
            fontSize="xl"
            color={commentCount > 0 ? commentColor : statsColor}
          >
            {commentCount}
          </Text>
          <Text fontSize="sm" color={statsColor}>
            answers
          </Text>
        </VStack>
      </VStack>

      {/* Content Column */}
      <VStack align="flex-start" flex={1} spacing={2}>
        <Heading
          as="h3"
          size="md"
          color="blue.600"
          cursor="pointer"
          onClick={() => onSeeMore(postId)}
          _hover={{ color: "blue.500" }}
        >
          {post.title}
        </Heading>
        <Text noOfLines={2} color={metaColor}>
          {post.content}
        </Text>
        <HStack
          spacing={4}
          fontSize="sm"
          color={metaColor}
          mt="auto"
          w="100%"
          justify="space-between"
        >
          <Text>
            Asked by {userHandles[post.userId] || 'Unknown User'} on{' '}
            {new Date(post.createdOn).toLocaleDateString()}
          </Text>
          {canDelete && (
            <Button
              size="xs"
              colorScheme="red"
              variant="outline"
              onClick={() => onDelete(postId)}
            >
              Delete
            </Button>
          )}
        </HStack>
      </VStack>
    </Flex>
  );
};

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

export default PostCard;
