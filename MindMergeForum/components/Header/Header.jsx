import { NavLink, useNavigate } from "react-router-dom";
import { AppContext } from "../../src/store/app.context";
import { useContext } from "react";
import { logoutUser } from "../../services/auth.services";
import { Roles } from "../../common/roles.enum";
import { Box, Flex, Heading, Button, Text, Link, HStack } from "@chakra-ui/react";

export default function Header() {

  const { user, userData, setAppState } = useContext(AppContext)
  const navigate = useNavigate();

  const logout = () => {
    logoutUser()
      .then(() => {
        setAppState({
          user: null,
          userData: null,
        });
        navigate('/')
      })
      .catch((error) => console.error(error.message))
  }

  return (
    <Box as="header" bg="gray.100" py={4}>
      <Flex maxW="container.xl" mx="auto" alignItems="center" justifyContent="space-between">
        <Heading as="h1" size="lg">MindMerge Forum</Heading>
        <HStack as="nav" spacing={4}>
          <Link as={NavLink} to="/">Home</Link>
          <Link as={NavLink} to="/forum">Forum</Link>
          {user && userData && userData.role === Roles.admin && (
            <>
              <Link as={NavLink} to="/user-profile">My Profile</Link>
              <Link as={NavLink} to="/create-post">Create Post</Link>
              <Link as={NavLink} to="/admin-tools">Admin Tools</Link>
            </>
          )}
          {user && userData && userData.role === Roles.user && (
            <>
              <Link as={NavLink} to="/user-profile">My Profile</Link>
              <Link as={NavLink} to="/create-post">Create Post</Link>
            </>
          )}
          {!user && <Link as={NavLink} to="/login">Log in</Link>}
          {!user && <Link as={NavLink} to="/register">Register</Link>}
        </HStack>
        <Flex alignItems="center">
          {user && <Button onClick={logout} mr={4}>Log Out</Button>}
          {userData && <Text>Welcome, {userData.handle}</Text>}
        </Flex>
      </Flex>
    </Box>
  );
}