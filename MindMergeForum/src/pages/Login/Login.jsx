import { useContext, useState } from "react";
import { loginUser } from "../../../services/auth.services";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { AppContext } from "../../store/app.context";
import { Roles } from "../../../common/roles.enum";
import { getUserData } from "../../../services/user.services";
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Link,
  Alert,
  AlertIcon,
  Divider,
  useColorModeValue,
  InputGroup,
  InputLeftElement,
  Icon,
} from "@chakra-ui/react";
import { EmailIcon, LockIcon } from "@chakra-ui/icons";
import { FaGoogle, FaGithub, FaFacebook } from "react-icons/fa";

const SocialButton = ({ icon, children, colorScheme }) => (
  <Button
    w="full"
    colorScheme={colorScheme}
    leftIcon={<Icon as={icon} />}
    variant="outline"
  >
    {children}
  </Button>
);

SocialButton.propTypes = {
  icon: PropTypes.elementType.isRequired,
  children: PropTypes.node.isRequired,
  colorScheme: PropTypes.string.isRequired,
};

export default function Login() {
  const { setAppState } = useContext(AppContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Stack Overflow colors
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const userCredential = await loginUser(email, password);
      const user = userCredential.user;
      const userData = await getUserData(user.uid);
      const userRole = userData[Object.keys(userData)[0]].role;

      setAppState({
        user,
        userData: userData[Object.keys(userData)[0]],
      });

      if (userRole === Roles.banned) {
        navigate("/banned");
      } else {
        navigate("/forum");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box pt="70px" minH="100vh" bg={useColorModeValue("gray.50", "gray.900")}>
      <Container maxW="md" py={12}>
        <Box
          bg={bgColor}
          p={8}
          borderRadius="lg"
          boxShadow="sm"
          border="1px"
          borderColor={borderColor}
        >
          <VStack spacing={6}>
            <Heading
              as="h1"
              size="xl"
              color="orange.500"
              textAlign="center"
            >
              Log in
            </Heading>

            {error && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                {error}
              </Alert>
            )}

            <VStack as="form" spacing={4} w="full" onSubmit={handleLogin}>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <EmailIcon color="gray.500" />
                  </InputLeftElement>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </InputGroup>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <LockIcon color="gray.500" />
                  </InputLeftElement>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </InputGroup>
              </FormControl>

              <Button
                type="submit"
                colorScheme="orange"
                size="lg"
                w="full"
                isLoading={isLoading}
                loadingText="Logging in..."
              >
                Log in
              </Button>
            </VStack>

            <Box w="full">
              <Divider my={6} />

              <VStack spacing={4} w="full">
                <SocialButton
                  icon={FaGoogle}
                  colorScheme="red"
                >
                  Continue with Google
                </SocialButton>

                <SocialButton
                  icon={FaGithub}
                  colorScheme="gray"
                >
                  Continue with GitHub
                </SocialButton>

                <SocialButton
                  icon={FaFacebook}
                  colorScheme="facebook"
                >
                  Continue with Facebook
                </SocialButton>
              </VStack>
            </Box>
          </VStack>
        </Box>

        <Text mt={8} textAlign="center" color={useColorModeValue("gray.600", "gray.400")}>
          Don&apos;t have an account?{" "}
          <Link
            as={RouterLink}
            to="/register"
            color="orange.500"
            fontWeight="semibold"
            _hover={{ color: "orange.600" }}
          >
            Sign up
          </Link>
        </Text>
      </Container>
    </Box>
  );
}
