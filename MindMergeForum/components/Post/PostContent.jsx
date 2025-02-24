import { Text, useColorModeValue } from '@chakra-ui/react';
import PropTypes from 'prop-types';

export const PostContent = ({ content }) => {
  const textColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Text whiteSpace="pre-wrap" color={textColor}>
      {content}
    </Text>
  );
};

PostContent.propTypes = {
  content: PropTypes.string.isRequired
};