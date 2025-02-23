import { NavLink, useNavigate } from "react-router-dom";
import { AppContext } from "../../src/store/app.context";
import { useContext } from "react";
import { logoutUser } from "../../services/auth.services";
import { Roles } from "../../common/roles.enum";
import {
  Box,
  Flex,
  Heading,
  Button,
  HStack,
  useColorModeValue,
  Container,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";

export default function Header() {
  const { user, userData, setAppState } = useContext(AppContext);
  const navigate = useNavigate();

  const bgColor = useColorModeValue("gray.100", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const logout = () => {
    logoutUser()
      .then(() => {
        setAppState({
          user: null,
          userData: null,
        });
        navigate("/");
      })
      .catch((error) => console.error(error.message));
  };

  return (
    <Box
      as="header"
      position="sticky"
      top={0}
      zIndex="sticky"
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
    >
      <Container maxW="1200px" py={2}>
        <Flex alignItems="center" justify="space-between">
          <HStack spacing={8}>
            <Heading
              as={NavLink}
              to="/"
              size="xl"
              color="orange.500"
              fontWeight="bold"
              _hover={{ textDecoration: "none" }}
            >
              MindOverflow
            </Heading>
            <Button
              as={NavLink}
              to="/forum"
              variant="ghost"
              color="gray.600"
              size="sm"
            >
              Questions
            </Button>
          </HStack>

          <HStack spacing={4} flex={1} mx={8}>
            <InputGroup maxW="600px">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search..."
                bg={useColorModeValue("white", "gray.800")}
                borderColor={borderColor}
              />
            </InputGroup>
          </HStack>

          <HStack spacing={4}>
            {!user && (
              <>
                <Button
                  as={NavLink}
                  to="/login"
                  variant="ghost"
                  colorScheme="blue"
                  size="sm"
                >
                  Log in
                </Button>
                <Button
                  as={NavLink}
                  to="/register"
                  colorScheme="blue"
                  size="sm"
                >
                  Sign up
                </Button>
              </>
            )}
            {user && (
              <>
                {userData && userData.role === Roles.admin && (
                  <Button
                    as={NavLink}
                    to="/admin-tools"
                    variant="ghost"
                    size="sm"
                    colorScheme="red"
                  >
                    Admin
                  </Button>
                )}
                <Button
                  as={NavLink}
                  to="/user-profile"
                  variant="ghost"
                  size="sm"
                >
                  {userData?.handle}
                </Button>
                <Button
                  onClick={logout}
                  variant="ghost"
                  colorScheme="red"
                  size="sm"
                >
                  Log Out
                </Button>
              </>
            )}
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}