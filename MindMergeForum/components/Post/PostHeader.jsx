import {
  Heading,
  HStack,
  Text,
  Avatar,
  VStack,
  IconButton,
  Flex,
  Box,
  useColorModeValue,
} from '@chakra-ui/react';
import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import PropTypes from 'prop-types';

export const PostHeader = ({
  title,
  creatorHandle,
  createdOn,
  lastActivityDate,
  votesCount,
  hasUpvoted,
  hasDownvoted,
  onVote,
  currentUser,
}) => {
  const textColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Flex>
      {/* Vote Column */}
      <VStack spacing={1} mr={4} align="center" minW="40px">
        <IconButton
          icon={<ChevronUpIcon boxSize={6} />}
          variant="ghost"
          aria-label="Upvote"
          size="sm"
          isDisabled={!currentUser}
          color={hasUpvoted ? 'orange.500' : 'gray.400'}
          onClick={() => onVote(true)}
          _hover={{ color: 'orange.500' }}
        />
        <Text fontSize="xl" fontWeight="bold" color={textColor}>
          {votesCount}
        </Text>
        <IconButton
          icon={<ChevronDownIcon boxSize={6} />}
          variant="ghost"
          aria-label="Downvote"
          size="sm"
          isDisabled={!currentUser}
          color={hasDownvoted ? 'blue.500' : 'gray.400'}
          onClick={() => onVote(false)}
          _hover={{ color: 'blue.500' }}
        />
      </VStack>

      {/* Content Column */}
      <Box flex={1}>
        <Heading as="h1" size="lg" mb={2} color="orange.500">
          {title}
        </Heading>
        <HStack spacing={2} mb={4} color={textColor} fontSize="sm">
          <Avatar size="xs" name={creatorHandle} />
          <Text>{creatorHandle}</Text>
          <Text>•</Text>
          <Text>Posted {new Date(createdOn).toLocaleString()}</Text>
          {lastActivityDate && lastActivityDate !== createdOn && (
            <>
              <Text>•</Text>
              <Text>Last activity {new Date(lastActivityDate).toLocaleString()}</Text>
            </>
          )}
        </HStack>
      </Box>
    </Flex>
  );
};

PostHeader.propTypes = {
  title: PropTypes.string.isRequired,
  creatorHandle: PropTypes.string.isRequired,
  createdOn: PropTypes.number.isRequired,
  lastActivityDate: PropTypes.number,
  votesCount: PropTypes.number.isRequired,
  hasUpvoted: PropTypes.bool.isRequired,
  hasDownvoted: PropTypes.bool.isRequired,
  onVote: PropTypes.func.isRequired,
  currentUser: PropTypes.object
};

PostHeader.defaultProps = {
  lastActivityDate: null,
  currentUser: null
};