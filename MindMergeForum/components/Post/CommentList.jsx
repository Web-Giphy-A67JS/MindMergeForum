import {
  VStack,
  Box,
  Text,
  Button,
  Textarea,
  HStack,
  Avatar,
  Heading,
  useColorModeValue
} from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';
import PropTypes from 'prop-types';

export const CommentList = ({
  comments,
  currentUser,
  editingComment,
  editedText,
  setEditingComment,
  setEditedText,
  handleSaveEdit
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  if (!comments || Object.keys(comments).length === 0) {
    return (
      <VStack spacing={4} align="stretch">
        <Heading size="md" color="orange.500">
          0 Answers
        </Heading>
        <Text color={textColor} textAlign="center" py={4}>
          No answers yet. Be the first to answer!
        </Text>
      </VStack>
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      <Heading size="md" color="orange.500">
        {Object.keys(comments).length} Answers
      </Heading>
      
      {Object.entries(comments).map(([commentId, commentData]) => (
        <Box
          key={commentId}
          bg={bgColor}
          p={6}
          borderRadius="lg"
          boxShadow="sm"
          border="1px"
          borderColor={borderColor}
        >
          {editingComment === commentId ? (
            <VStack spacing={4} align="stretch">
              <Textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                minH="200px"
              />
              <HStack spacing={2}>
                <Button
                  colorScheme="orange"
                  onClick={() => handleSaveEdit(commentId)}
                >
                  Save
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setEditingComment(null)}
                >
                  Cancel
                </Button>
              </HStack>
            </VStack>
          ) : (
            <>
              <HStack spacing={2} mb={4} color={textColor} fontSize="sm">
                <Avatar size="xs" name={commentData.userHandle} />
                <Text>{commentData.userHandle}</Text>
                <Text>•</Text>
                <Text>{new Date(commentData.createdOn).toLocaleString()}</Text>
              </HStack>
              <Text whiteSpace="pre-wrap" color={textColor}>
                {commentData.text}
              </Text>
              {currentUser && currentUser.uid === commentData.userId && (
                <Button
                  leftIcon={<EditIcon />}
                  variant="ghost"
                  size="sm"
                  mt={4}
                  onClick={() => setEditingComment(commentId, commentData.text)}
                >
                  Edit
                </Button>
              )}
            </>
          )}
        </Box>
      ))}
    </VStack>
  );
};

CommentList.propTypes = {
  comments: PropTypes.objectOf(PropTypes.shape({
    text: PropTypes.string.isRequired,
    userId: PropTypes.string.isRequired,
    userHandle: PropTypes.string.isRequired,
    createdOn: PropTypes.number.isRequired
  })),
  currentUser: PropTypes.object,
  editingComment: PropTypes.string,
  editedText: PropTypes.string.isRequired,
  setEditingComment: PropTypes.func.isRequired,
  setEditedText: PropTypes.func.isRequired,
  handleSaveEdit: PropTypes.func.isRequired
};

CommentList.defaultProps = {
  comments: null,
  currentUser: null,
  editingComment: null
};