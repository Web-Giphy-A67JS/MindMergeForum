import { AppContext } from "../../store/app.context";
import { useContext, useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { registerUser } from "../../../services/auth.services";
import { createUserHandle, getUserByHandle } from "../../../services/user.services";
import { Roles } from "../../../common/roles.enum";
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
  SimpleGrid,
} from "@chakra-ui/react";
import {
  EmailIcon,
  LockIcon,
  PhoneIcon,
  AtSignIcon,
} from "@chakra-ui/icons";
import { FaGoogle, FaGithub, FaFacebook, FaUser } from "react-icons/fa";

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

export default function Register() {
  const { setAppState } = useContext(AppContext);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [user, setUser] = useState({
    handle: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: Roles.user,
    phone: "",
  });

  // Stack Overflow colors
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const updateUser = (prop) => (e) => {
    setUser({
      ...user,
      [prop]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!user.email || !user.password || !user.firstName || !user.lastName || !user.handle) {
      setError("Please fill in all required fields");
      return false;
    }

    if (user.firstName.length < 4 || user.firstName.length > 32) {
      setError("First name must be between 4 and 32 characters");
      return false;
    }

    if (user.lastName.length < 4 || user.lastName.length > 32) {
      setError("Last name must be between 4 and 32 characters");
      return false;
    }

    if (user.phone && isNaN(user.phone)) {
      setError("Please enter a valid phone number");
      return false;
    }

    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError("");

    try {
      const userFromDb = await getUserByHandle(user.handle);
      if (userFromDb) {
        setError(`User with username "${user.handle}" already exists`);
        return;
      }

      const userCredential = await registerUser(user.email, user.password);
      await createUserHandle(
        user.handle,
        userCredential.user.uid,
        user.email,
        user.firstName,
        user.lastName,
        user.phone,
        user.role
      );

      setAppState({
        user: userCredential.user,
        userData: null,
      });
      navigate("/");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setError("The email address is already in use by another account.");
      } else {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box pt="70px" minH="100vh" bg={useColorModeValue("gray.50", "gray.900")}>
      <Container maxW="lg" py={12}>
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
              Create your account
            </Heading>

            {error && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                {error}
              </Alert>
            )}

            <VStack as="form" spacing={4} w="full" onSubmit={handleRegister}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>First Name</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FaUser} color="gray.500" />
                    </InputLeftElement>
                    <Input
                      value={user.firstName}
                      onChange={updateUser("firstName")}
                      placeholder="John"
                    />
                  </InputGroup>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Last Name</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FaUser} color="gray.500" />
                    </InputLeftElement>
                    <Input
                      value={user.lastName}
                      onChange={updateUser("lastName")}
                      placeholder="Doe"
                    />
                  </InputGroup>
                </FormControl>
              </SimpleGrid>

              <FormControl isRequired>
                <FormLabel>Username</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <AtSignIcon color="gray.500" />
                  </InputLeftElement>
                  <Input
                    value={user.handle}
                    onChange={updateUser("handle")}
                    placeholder="johndoe"
                  />
                </InputGroup>
              </FormControl>

              <FormControl>
                <FormLabel>Phone (optional)</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <PhoneIcon color="gray.500" />
                  </InputLeftElement>
                  <Input
                    value={user.phone}
                    onChange={updateUser("phone")}
                    placeholder="123-456-7890"
                  />
                </InputGroup>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <EmailIcon color="gray.500" />
                  </InputLeftElement>
                  <Input
                    type="email"
                    value={user.email}
                    onChange={updateUser("email")}
                    placeholder="john.doe@example.com"
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
                    value={user.password}
                    onChange={updateUser("password")}
                    placeholder="Enter your password"
                  />
                </InputGroup>
              </FormControl>

              <Button
                type="submit"
                colorScheme="orange"
                size="lg"
                w="full"
                isLoading={isLoading}
                loadingText="Creating account..."
              >
                Sign up
              </Button>
            </VStack>

            <Box w="full">
              <Divider my={6} />

              <VStack spacing={4} w="full">
                <SocialButton
                  icon={FaGoogle}
                  colorScheme="red"
                >
                  Sign up with Google
                </SocialButton>

                <SocialButton
                  icon={FaGithub}
                  colorScheme="gray"
                >
                  Sign up with GitHub
                </SocialButton>

                <SocialButton
                  icon={FaFacebook}
                  colorScheme="facebook"
                >
                  Sign up with Facebook
                </SocialButton>
              </VStack>
            </Box>
          </VStack>
        </Box>

        <Text mt={8} textAlign="center" color={useColorModeValue("gray.600", "gray.400")}>
          Already have an account?{" "}
          <Link
            as={RouterLink}
            to="/login"
            color="orange.500"
            fontWeight="semibold"
            _hover={{ color: "orange.600" }}
          >
            Log in
          </Link>
        </Text>
      </Container>
    </Box>
  );
}