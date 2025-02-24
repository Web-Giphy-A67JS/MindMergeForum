import { NavLink, useNavigate } from "react-router-dom";
import { AppContext } from "../../src/store/app.context";
import { useContext } from "react";
import { logoutUser } from "../../services/auth.services";
import { Roles } from "../../common/roles.enum";
import PropTypes from 'prop-types';
import {
  Box,
  Flex,
  Container,
  Button,
  Text,
  HStack,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  IconButton,
  Divider,
  Show,
  Hide,
  useColorMode,
} from "@chakra-ui/react";
import { HamburgerIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";

const NavItem = ({ to, children }) => {
  const navBgColor = useColorModeValue("gray.50", "gray.800");
  const navHoverBg = useColorModeValue("gray.100", "gray.700");
  
  return (
    <NavLink to={to}>
      {({ isActive }) => (
        <Button
          variant="ghost"
          color={isActive ? "orange.500" : "gray.600"}
          bg={isActive ? navBgColor : "transparent"}
          _hover={{ bg: navHoverBg }}
          size="sm"
        >
          {children}
        </Button>
      )}
    </NavLink>
  );
};

NavItem.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default function Header() {
  const { user, userData, setAppState } = useContext(AppContext);
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();

  // Stack Overflow colors
  const bgColor = useColorModeValue("white", "gray.900");
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
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={1000}
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
    >
      <Container maxW="container.xl">
        <Flex py={2} align="center" justify="space-between">
          {/* Logo and Navigation */}
          <Flex align="center">
            <NavLink to="/">
              <Text
                fontSize="xl"
                fontWeight="bold"
                color="orange.500"
                mr={8}
              >
                MindMerge
              </Text>
            </NavLink>

            {/* Desktop Navigation */}
            <Hide below="md">
              <HStack spacing={1}>
                <NavItem to="/">Home</NavItem>
                {user && userData && (
                  <>
                    <NavItem to="/forum">Forum</NavItem>
                    <NavItem to="/create-post">Create Post</NavItem>
                    {userData.role === Roles.admin && (
                      <NavItem to="/admin-tools">Admin Tools</NavItem>
                    )}
                  </>
                )}
              </HStack>
            </Hide>
          </Flex>

          {/* User Section */}
          <HStack spacing={4}>
            {/* Theme Toggle Button */}
            <IconButton
              size="sm"
              aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
              icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
              variant="ghost"
              _hover={{ bg: useColorModeValue("gray.100", "gray.700") }}
            />

            {user && userData ? (
              <>
                <Hide below="md">
                  <Menu>
                    <MenuButton
                      as={Button}
                      variant="ghost"
                      size="sm"
                      rightIcon={<Avatar size="xs" name={userData.handle} />}
                    >
                      {userData.handle}
                    </MenuButton>
                    <MenuList>
                      <MenuItem onClick={() => navigate("/user-profile")}>
                        My Profile
                      </MenuItem>
                      <MenuItem onClick={logout}>Log Out</MenuItem>
                    </MenuList>
                  </Menu>
                </Hide>
              </>
            ) : (
              <Hide below="md">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/login")}
                >
                  Log in
                </Button>
                <Button
                  colorScheme="orange"
                  size="sm"
                  onClick={() => navigate("/register")}
                >
                  Sign up
                </Button>
              </Hide>
            )}

            {/* Mobile Menu */}
            <Show below="md">
              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<HamburgerIcon />}
                  variant="ghost"
                  aria-label="Open menu"
                />
                <MenuList>
                  <MenuItem onClick={() => navigate("/")}>Home</MenuItem>
                  {user && userData && (
                    <>
                      <MenuItem onClick={() => navigate("/forum")}>
                        Forum
                      </MenuItem>
                      <MenuItem onClick={() => navigate("/create-post")}>
                        Create Post
                      </MenuItem>
                      <MenuItem onClick={() => navigate("/user-profile")}>
                        My Profile
                      </MenuItem>
                      {userData.role === Roles.admin && (
                        <MenuItem onClick={() => navigate("/admin-tools")}>
                          Admin Tools
                        </MenuItem>
                      )}
                      <Divider />
                      <MenuItem onClick={logout}>Log Out</MenuItem>
                    </>
                  )}
                  {!user && (
                    <>
                      <MenuItem onClick={() => navigate("/login")}>
                        Log in
                      </MenuItem>
                      <MenuItem onClick={() => navigate("/register")}>
                        Sign up
                      </MenuItem>
                    </>
                  )}
                </MenuList>
              </Menu>
            </Show>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}