import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPost } from "../../../services/posts.services";
import { auth } from "../../config/firebase.config";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  Heading,
  Alert,
  AlertIcon,
  useColorModeValue,
  Text,
  List,
  ListItem,
  ListIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  useToast,
} from "@chakra-ui/react";
import { CheckIcon, InfoIcon } from "@chakra-ui/icons";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  // Stack Overflow colors
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.400");

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (title.length < 16 || title.length > 64) {
      setError("The title must be between 16 and 64 characters!");
      setIsLoading(false);
      return;
    }
    if (content.length < 32 || content.length > 8192) {
      setError("The content must be between 32 and 8192 characters!");
      setIsLoading(false);
      return;
    }

    try {
      await createPost(title, content, auth.currentUser.uid);
      
      toast({
        title: "Post created successfully!",
        description: "Redirecting to forum...",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      // Short delay to show the success message
      setTimeout(() => {
        navigate("/forum");
      }, 1000);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      
      toast({
        title: "Error creating post",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box pt="70px" minH="100vh" bg={useColorModeValue("gray.50", "gray.900")}>
      <Container maxW="container.xl" py={12}>
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading
              as="h1"
              size="xl"
              color="orange.500"
              mb={4}
            >
              Ask a Question
            </Heading>
            <Text color={textColor}>
              Get help from the community by following these guidelines for a good question.
            </Text>
          </Box>

          <Box
            bg={bgColor}
            p={6}
            borderRadius="lg"
            boxShadow="sm"
            border="1px"
            borderColor={borderColor}
          >
            <VStack spacing={6} align="stretch">
              <Box>
                <Heading size="md" mb={4} color="orange.500">
                  Writing a good question
                </Heading>
                <List spacing={3} color={textColor}>
                  <ListItem>
                    <ListIcon as={CheckIcon} color="green.500" />
                    Summarize your problem in a clear, one-line title
                  </ListItem>
                  <ListItem>
                    <ListIcon as={CheckIcon} color="green.500" />
                    Describe what you&apos;ve tried and what you expected to happen
                  </ListItem>
                  <ListItem>
                    <ListIcon as={CheckIcon} color="green.500" />
                    Add relevant code or error messages if applicable
                  </ListItem>
                  <ListItem>
                    <ListIcon as={InfoIcon} color="orange.500" />
                    Title must be 16-64 characters
                  </ListItem>
                  <ListItem>
                    <ListIcon as={InfoIcon} color="orange.500" />
                    Content must be 32-8192 characters
                  </ListItem>
                </List>
              </Box>

              <Divider />

              {error && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  {error}
                </Alert>
              )}

              <form onSubmit={handleCreatePost}>
                <VStack spacing={6}>
                  <FormControl isRequired>
                    <FormLabel>Title</FormLabel>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. How to implement authentication in React?"
                      size="lg"
                      isInvalid={title.length > 0 && (title.length < 16 || title.length > 64)}
                    />
                    <Text 
                      fontSize="sm" 
                      color={
                        title.length === 0 ? textColor :
                        title.length >= 16 && title.length <= 64 ? "green.500" : "red.500"
                      } 
                      mt={2}
                    >
                      {title.length}/64 characters
                    </Text>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Content</FormLabel>
                    <Tabs variant="enclosed">
                      <TabList>
                        <Tab>Write</Tab>
                        <Tab>Preview</Tab>
                      </TabList>
                      <TabPanels>
                        <TabPanel p={0} pt={4}>
                          <Textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Describe your question in detail..."
                            minH="300px"
                            size="lg"
                            isInvalid={content.length > 0 && (content.length < 32 || content.length > 8192)}
                          />
                        </TabPanel>
                        <TabPanel p={4}>
                          <Box
                            minH="300px"
                            p={4}
                            border="1px"
                            borderColor={borderColor}
                            borderRadius="md"
                            whiteSpace="pre-wrap"
                          >
                            {content || "Your content preview will appear here..."}
                          </Box>
                        </TabPanel>
                      </TabPanels>
                    </Tabs>
                    <Text 
                      fontSize="sm" 
                      color={
                        content.length === 0 ? textColor :
                        content.length >= 32 && content.length <= 8192 ? "green.500" : "red.500"
                      } 
                      mt={2}
                    >
                      {content.length}/8192 characters
                    </Text>
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="orange"
                    size="lg"
                    isLoading={isLoading}
                    loadingText="Posting..."
                    w="full"
                    isDisabled={
                      title.length < 16 || 
                      title.length > 64 || 
                      content.length < 32 || 
                      content.length > 8192
                    }
                  >
                    Post Your Question
                  </Button>
                </VStack>
              </form>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
