import {
  Box,
  VStack,
  Heading,
  Textarea,
  Button,
  useColorModeValue
} from '@chakra-ui/react';
import PropTypes from 'prop-types';

export const CommentForm = ({
  comment,
  setComment,
  handleCommentSubmit
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      bg={bgColor}
      p={6}
      borderRadius="lg"
      boxShadow="sm"
      border="1px"
      borderColor={borderColor}
    >
      <VStack spacing={4} align="stretch">
        <Heading size="sm" color="orange.500">
          Your Answer
        </Heading>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write your answer here..."
          minH="200px"
          resize="vertical"
        />
        <Button
          colorScheme="orange"
          onClick={handleCommentSubmit}
          isDisabled={!comment.trim()}
        >
          Post Your Answer
        </Button>
      </VStack>
    </Box>
  );
};

CommentForm.propTypes = {
  comment: PropTypes.string.isRequired,
  setComment: PropTypes.func.isRequired,
  handleCommentSubmit: PropTypes.func.isRequired
};