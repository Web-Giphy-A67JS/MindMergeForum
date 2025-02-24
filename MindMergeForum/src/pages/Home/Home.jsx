import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { getTotalUsers } from "../../../services/user.services";
import { getPosts } from "../../../services/posts.services";
import { AppContext } from "../../store/app.context";
import PropTypes from 'prop-types';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Button,
  VStack,
  useColorModeValue,
  Flex,
} from "@chakra-ui/react";

const StatCard = ({ label, value }) => {
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.400");
  
  return (
    <Box
      bg={useColorModeValue("gray.50", "gray.700")}
      p={4}
      borderRadius="lg"
      border="1px"
      borderColor={borderColor}
    >
      <Stat>
        <StatLabel fontSize="sm" color={textColor}>
          {label}
        </StatLabel>
        <StatNumber fontSize="2xl" color="orange.500">
          {value}
        </StatNumber>
      </Stat>
    </Box>
  );
};

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default function Home() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const navigate = useNavigate();
  const { user } = useContext(AppContext);

  // Stack Overflow colors
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.400");
  const pageBg = useColorModeValue("gray.50", "gray.900");

  useEffect(() => {
    async function fetchTotalUsersAndPosts() {
      const totalUsers = await getTotalUsers();
      setTotalUsers(totalUsers);
      const posts = await getPosts();
      const totalPosts = posts ? Object.keys(posts).length : 0;
      setTotalPosts(totalPosts);
    }
    fetchTotalUsersAndPosts();
  }, []);

  const handleJoinCommunity = () => {
    if (user) {
      navigate("/user-profile");
    } else {
      navigate("/register");
    }
  };

  return (
    <Box pt="70px" minH="100vh" bg={pageBg}>
      <Container maxW="container.xl" py={12}>
        <VStack spacing={12} align="stretch">
          {/* Hero Section */}
          <Box textAlign="center" py={12}>
            <Heading
              as="h1"
              size="2xl"
              mb={6}
              color="orange.500"
            >
              Welcome to MindMerge Forum
            </Heading>
            <Text
              fontSize="xl"
              color={textColor}
              maxW="2xl"
              mx="auto"
              mb={8}
            >
              Join our community of developers, share your knowledge, and learn from others.
            </Text>
            <Flex justify="center" gap={4}>
              <Button
                size="lg"
                colorScheme="orange"
                onClick={handleJoinCommunity}
              >
                {user ? "Go to Profile" : "Join the Community"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                colorScheme="orange"
                onClick={() => navigate("/forum")}
              >
                Browse Forum
              </Button>
            </Flex>
          </Box>

          {/* Stats Section */}
          <Box>
            <Heading
              as="h2"
              size="lg"
              mb={8}
              textAlign="center"
              color={useColorModeValue("gray.700", "gray.300")}
            >
              Community Stats
            </Heading>
            <SimpleGrid
              columns={{ base: 1, md: 2 }}
              spacing={8}
              maxW="4xl"
              mx="auto"
            >
              <StatCard label="Registered Users" value={totalUsers} />
              <StatCard label="Total Posts" value={totalPosts} />
            </SimpleGrid>
          </Box>

          {/* Features Section */}
          <Box bg={useColorModeValue("gray.50", "gray.700")} py={12} mt={12}>
            <Container maxW="container.xl">
              <Heading
                as="h2"
                size="lg"
                mb={8}
                textAlign="center"
                color={useColorModeValue("gray.700", "gray.300")}
              >
                Why Join MindMerge?
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
                <Box
                  bg={bgColor}
                  p={6}
                  borderRadius="lg"
                  border="1px"
                  borderColor={borderColor}
                >
                  <Heading size="md" mb={4} color="orange.500">
                    Share Knowledge
                  </Heading>
                  <Text color={textColor}>
                    Share your expertise and help others learn from your experience.
                  </Text>
                </Box>
                <Box
                  bg={bgColor}
                  p={6}
                  borderRadius="lg"
                  border="1px"
                  borderColor={borderColor}
                >
                  <Heading size="md" mb={4} color="orange.500">
                    Learn Together
                  </Heading>
                  <Text color={textColor}>
                    Learn from a diverse community of developers and tech enthusiasts.
                  </Text>
                </Box>
                <Box
                  bg={bgColor}
                  p={6}
                  borderRadius="lg"
                  border="1px"
                  borderColor={borderColor}
                >
                  <Heading size="md" mb={4} color="orange.500">
                    Build Connections
                  </Heading>
                  <Text color={textColor}>
                    Connect with like-minded individuals and grow your network.
                  </Text>
                </Box>
              </SimpleGrid>
            </Container>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}