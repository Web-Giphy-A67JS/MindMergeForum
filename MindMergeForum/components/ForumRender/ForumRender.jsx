import { useNavigate } from 'react-router-dom';
import { auth } from '../../src/config/firebase.config';
import { Roles } from '../../common/roles.enum';
import PropTypes from 'prop-types';
import {
  Box,
  Flex,
  Text,
  Button,
  Input,
  Textarea,
  VStack,
  HStack,
  IconButton,
  useColorModeValue,
  Badge,
  Heading,
  Avatar,
  Tooltip,
} from '@chakra-ui/react';
import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { useVoting } from '../../src/hooks/useVoting';

export default function ForumRender({
  postId,
  post,
  userHandles,
  editingPost,
  editedTitle,
  editedContent,
  setEditedTitle,
  setEditedContent,
  handleSaveEdit,
  handleCancelEdit,
  handleEdit,
  handleDelete,
  userData,
}) {
  const navigate = useNavigate();
  const { votesCount, hasUpvoted, hasDownvoted, handleVote } = useVoting(postId, {
    upvotes: post?.upvotes || {},
    downvotes: post?.downvotes || {}
  });
  
  // Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const metaColor = useColorModeValue('gray.500', 'gray.400');

  const isCurrentUserAuthor = auth.currentUser && auth.currentUser.uid === post.userId;
  const isAdmin = userData && userData.role === Roles.admin;
  const canEditDelete = isCurrentUserAuthor || isAdmin;

  // Format dates
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLastActivityDate = () => {
    const dates = [post.createdOn];
    
    if (post.lastActivityDate) {
      dates.push(post.lastActivityDate);
    }
    
    if (post.comments) {
      const commentDates = Object.values(post.comments).map(c => c.createdOn);
      dates.push(...commentDates);
    }
    
    return Math.max(...dates);
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg={bgColor}
      borderColor={borderColor}
      _hover={{ borderColor: 'orange.500' }}
      transition="all 0.2s"
    >
      <Flex p={4}>
        {/* Vote Column */}
        <VStack spacing={1} mr={4} align="center" minW="40px">
          <IconButton
            icon={<ChevronUpIcon boxSize={6} />}
            variant="ghost"
            aria-label="Upvote"
            size="sm"
            isDisabled={!auth.currentUser}
            color={hasUpvoted(auth.currentUser?.uid) ? 'orange.500' : 'gray.400'}
            onClick={() => handleVote(auth.currentUser?.uid, true)}
            _hover={{ color: 'orange.500' }}
          />
          <Text
            fontSize="xl"
            fontWeight="bold"
            color={votesCount > 0 ? 'orange.500' : votesCount < 0 ? 'blue.500' : textColor}
          >
            {votesCount}
          </Text>
          <IconButton
            icon={<ChevronDownIcon boxSize={6} />}
            variant="ghost"
            aria-label="Downvote"
            size="sm"
            isDisabled={!auth.currentUser}
            color={hasDownvoted(auth.currentUser?.uid) ? 'blue.500' : 'gray.400'}
            onClick={() => handleVote(auth.currentUser?.uid, false)}
            _hover={{ color: 'blue.500' }}
          />
        </VStack>

        {/* Content Column */}
        <Box flex="1">
          {editingPost === postId ? (
            <VStack spacing={4} align="stretch">
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                placeholder="Edit title"
                size="lg"
                fontWeight="bold"
              />
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                placeholder="Edit content"
                size="md"
                rows={4}
              />
              <HStack spacing={2}>
                <Button
                  colorScheme="orange"
                  onClick={() => handleSaveEdit(postId)}
                >
                  Save
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
              </HStack>
            </VStack>
          ) : (
            <Box>
              <Flex justify="space-between" align="flex-start" mb={2}>
                <Heading
                  as="h3"
                  size="md"
                  color="orange.500"
                  _hover={{ color: 'orange.600' }}
                  cursor="pointer"
                  onClick={() => navigate(`/posts/${postId}`)}
                  flex="1"
                >
                  {post.title}
                </Heading>
                <HStack spacing={2} ml={4}>
                  <Avatar size="sm" name={userHandles[post.userId]} />
                  <Text color={metaColor} fontWeight="medium">
                    {userHandles[post.userId]}
                  </Text>
                </HStack>
              </Flex>
              
              <Text
                noOfLines={3}
                mb={4}
                color={textColor}
              >
                {post.content}
              </Text>

              <Flex
                justify="space-between"
                align="center"
                wrap="wrap"
                gap={2}
              >
                <HStack spacing={4}>
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="orange"
                    onClick={() => navigate(`/posts/${postId}`)}
                  >
                    See More
                  </Button>
                  {canEditDelete && (
                    <>
                      {isCurrentUserAuthor && (
                        <Button
                          size="sm"
                          variant="ghost"
                          colorScheme="orange"
                          onClick={() => handleEdit(postId, post.title, post.content)}
                        >
                          Edit
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleDelete(postId)}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </HStack>

                <VStack align="flex-end" spacing={1}>
                  <Badge colorScheme="orange">
                    💬 {post.comments ? Object.keys(post.comments).length : 0}
                  </Badge>
                  <HStack spacing={2} color={metaColor} fontSize="sm">
                    <Tooltip label={`Created: ${formatDate(post.createdOn)}`}>
                      <Text>
                        Posted {formatDate(post.createdOn)}
                      </Text>
                    </Tooltip>
                    {post.lastActivityDate && post.lastActivityDate !== post.createdOn && (
                      <Tooltip label={`Last Activity: ${formatDate(getLastActivityDate())}`}>
                        <Text>
                          • Modified {formatDate(getLastActivityDate())}
                        </Text>
                      </Tooltip>
                    )}
                  </HStack>
                </VStack>
              </Flex>
            </Box>
          )}
        </Box>
      </Flex>
    </Box>
  );
}

ForumRender.propTypes = {
  postId: PropTypes.string.isRequired,
  post: PropTypes.shape({
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    userId: PropTypes.string.isRequired,
    createdOn: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]).isRequired,
    lastActivityDate: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
    upvotes: PropTypes.object,
    downvotes: PropTypes.object,
    comments: PropTypes.object,
  }).isRequired,
  userHandles: PropTypes.object.isRequired,
  editingPost: PropTypes.string,
  editedTitle: PropTypes.string.isRequired,
  editedContent: PropTypes.string.isRequired,
  setEditedTitle: PropTypes.func.isRequired,
  setEditedContent: PropTypes.func.isRequired,
  handleSaveEdit: PropTypes.func.isRequired,
  handleCancelEdit: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  userData: PropTypes.shape({
    role: PropTypes.string,
  }),
};