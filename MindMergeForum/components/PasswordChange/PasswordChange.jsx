import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../src/config/firebase.config";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import {
  Box,
  Container,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Alert,
  AlertIcon,
  useColorModeValue,
  Text,
  List,
  ListItem,
  ListIcon,
  HStack,
  useToast,
  InputGroup,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon, CheckIcon, WarningIcon } from "@chakra-ui/icons";

export default function PasswordChange() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  // Stack Overflow colors
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.400");

  const handleChangePassword = async () => {
    setError("");
    setIsLoading(true);

    if (currentPassword === newPassword) {
      setError("The new password must not match the previous password");
      setIsLoading(false);
      return;
    }
    if (newPassword === "") {
      setError("Please fill in the new password field");
      setIsLoading(false);
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      
      toast({
        title: "Password updated",
        description: "Your password has been successfully changed.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      navigate("/user-profile");
    } catch (error) {
      let errorMessage = error.message;
      if (error.code === "auth/wrong-password") {
        errorMessage = "Current password is incorrect";
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/user-profile");
  };

  const passwordRequirements = [
    {
      text: "At least 8 characters long",
      met: newPassword.length >= 8,
    },
    {
      text: "Different from current password",
      met: currentPassword && newPassword && currentPassword !== newPassword,
    },
  ];

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
              color="brand.primary"
              textAlign="center"
            >
              Change Password
            </Heading>

            {error && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                {error}
              </Alert>
            )}

            <VStack spacing={4} w="full">
              <FormControl isRequired>
                <FormLabel>Current Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <InputRightElement>
                    <IconButton
                      size="sm"
                      variant="ghost"
                      icon={showCurrentPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>New Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <InputRightElement>
                    <IconButton
                      size="sm"
                      variant="ghost"
                      icon={showNewPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <Box w="full" py={4}>
                <Text fontWeight="medium" mb={2} color={textColor}>
                  Password Requirements:
                </Text>
                <List spacing={2}>
                  {passwordRequirements.map((req, index) => (
                    <ListItem
                      key={index}
                      color={req.met ? "green.500" : textColor}
                      display="flex"
                      alignItems="center"
                    >
                      <ListIcon
                        as={req.met ? CheckIcon : WarningIcon}
                        color={req.met ? "green.500" : "orange.500"}
                      />
                      {req.text}
                    </ListItem>
                  ))}
                </List>
              </Box>

              <HStack spacing={4} w="full" pt={4}>
                <Button
                  variant="ghost"
                  onClick={handleCancel}
                  isDisabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={handleChangePassword}
                  isLoading={isLoading}
                  loadingText="Changing..."
                  flex={1}
                >
                  Change Password
                </Button>
              </HStack>
            </VStack>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}