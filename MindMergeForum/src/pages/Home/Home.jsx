import { useState, useEffect } from "react";
import { getTotalUsers } from "../../../services/user.services";
import { getPosts } from "../../../services/posts";
import { Box, Heading, Text, VStack } from "@chakra-ui/react";

export default function Home() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);

  useEffect(() => {
    async function fetchTotalUsersAndPosts() {
      const totalUsers = await getTotalUsers();
      setTotalUsers(totalUsers);
      const posts = await getPosts()
      const totalPosts = posts ? Object.keys(posts).length : 0;
      setTotalPosts(totalPosts);
    }
    fetchTotalUsersAndPosts();
  }, []);

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        <Heading as="h2">Welcome to MindMerge Forum!</Heading>
        <Text>
          Register and join our {totalUsers} registered users with more than {totalPosts} posts waiting for you and start sharing your experience with the world!
        </Text>
      </VStack>
    </Box>
  );
}