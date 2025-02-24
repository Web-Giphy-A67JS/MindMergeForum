import { useState, useContext, useMemo } from "react";
import {
  Box,
  Container,
  Heading,
  RadioGroup,
  Radio,
  Stack,
  HStack,
  Text,
  Flex,
  useColorModeValue,
  Divider,
  Spinner,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { AppContext } from "../../store/app.context";
import ForumRender from "../../../components/ForumRender/ForumRender";
import usePosts from "../../hooks/usePosts";
import { usePostMutations } from "../../hooks/usePostMutations";

export default function Forum() {
  const { userData } = useContext(AppContext);
  const { data, isLoading, error } = usePosts();
  const { deletePost, updatePost } = usePostMutations();
  const [editingPost, setEditingPost] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [sortCriteria, setSortCriteria] = useState("createdDate");
  const [sortDirection, setSortDirection] = useState("desc");

  // Background colors
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const posts = data?.posts || {};
  const userHandles = data?.userHandles || {};

  const sortedPosts = useMemo(() => {
    const postsArray = Object.entries(posts);
    const sortModifier = sortDirection === 'asc' ? 1 : -1;
  
    switch (sortCriteria) {
      case 'comments':
        return [...postsArray].sort((a, b) => {
          const aCount = a[1].comments ? Object.keys(a[1].comments).length : 0;
          const bCount = b[1].comments ? Object.keys(b[1].comments).length : 0;
          return (bCount - aCount) * sortModifier;
        });
      
      case 'createdDate':
        return [...postsArray].sort((a, b) => {
          const aDate = new Date(a[1].createdOn).getTime();
          const bDate = new Date(b[1].createdOn).getTime();
          return (bDate - aDate) * sortModifier;
        });
      
      default:
        return postsArray;
    }
  }, [posts, sortCriteria, sortDirection]);

  const handleDelete = (postId) => {
    deletePost(postId);
  };

  const handleEdit = (postId, title, content) => {
    setEditingPost(postId);
    setEditedTitle(title);
    setEditedContent(content);
  };

  const handleSaveEdit = (postId) => {
    updatePost({
      postId,
      updates: {
        title: editedTitle,
        content: editedContent,
        lastActivityDate: Date.now()
      }
    });
    setEditingPost(null);
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
  };

  if (isLoading) {
    return (
      <Box textAlign="center" py={20}>
        <Spinner size="xl" color="orange.500" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box pt={8}>
        <Container maxW="container.xl">
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            Error loading posts: {error.message}
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8}>
        <Heading as="h1" size="xl" mb={6} color="orange.500">
          Forum
        </Heading>
        
        <Box 
          bg={bgColor} 
          p={4} 
          borderRadius="md" 
          boxShadow="sm"
          border="1px"
          borderColor={borderColor}
          mb={6}
        >
          <Flex 
            direction={{ base: "column", md: "row" }} 
            gap={6}
            align={{ base: "stretch", md: "center" }}
          >
            <Box flex="1">
              <Text fontWeight="medium" mb={2}>Sort by</Text>
              <RadioGroup value={sortCriteria} onChange={setSortCriteria}>
                <Stack direction={{ base: "column", sm: "row" }} spacing={4}>
                  <Radio value="createdDate" colorScheme="orange">Created Date</Radio>
                  <Radio value="comments" colorScheme="orange">Comments</Radio>
                </Stack>
              </RadioGroup>
            </Box>
            
            <Divider display={{ base: "block", md: "none" }} />
            
            <Box flex="1">
              <Text fontWeight="medium" mb={2}>Order</Text>
              <RadioGroup value={sortDirection} onChange={setSortDirection}>
                <HStack spacing={4}>
                  <Radio value="desc" colorScheme="orange">Older First</Radio>
                  <Radio value="asc" colorScheme="orange">Newest First</Radio>
                </HStack>
              </RadioGroup>
            </Box>
          </Flex>
        </Box>
      </Box>

      <Stack spacing={4}>
        {sortedPosts.length === 0 ? (
          <Text fontSize="lg" textAlign="center" color="gray.600">
            No posts available
          </Text>
        ) : (
          sortedPosts.map(([postId, post]) => (
            <ForumRender
              key={postId}
              postId={postId}
              post={post}
              userHandles={userHandles}
              editingPost={editingPost}
              editedTitle={editedTitle}
              editedContent={editedContent}
              setEditedTitle={setEditedTitle}
              setEditedContent={setEditedContent}
              handleSaveEdit={handleSaveEdit}
              handleCancelEdit={handleCancelEdit}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              userData={userData}
            />
          ))
        )}
      </Stack>
    </Container>
  );
}
