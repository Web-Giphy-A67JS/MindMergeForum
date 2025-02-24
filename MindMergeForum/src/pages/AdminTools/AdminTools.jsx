import useUsers from "../../hooks/useUsers";
import { useUserMutations } from "../../hooks/useUserMutations";
import { useSearchParams } from "react-router-dom";
import { Roles } from "../../../common/roles.enum";
import {
  Box,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Input,
  VStack,
  HStack,
  Radio,
  RadioGroup,
  Badge,
  useColorModeValue,
  InputGroup,
  InputLeftElement,
  Alert,
  AlertIcon,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";

export default function AdminTools() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const searchMethod = searchParams.get("method") || "username";
  const toast = useToast();

  const { data: users = [], isLoading, error } = useUsers(search, searchMethod);
  const { updateRole, isUpdating } = useUserMutations();

  // Stack Overflow colors
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.400");

  const handleBan = (uid) => {
    const user = users.find((u) => u.uid === uid);
    const newRole = user.role === Roles.banned ? Roles.user : Roles.banned;
    
    updateRole(
      { uid, role: newRole },
      {
        onSuccess: () => {
          toast({
            title: `User ${newRole === Roles.banned ? "banned" : "unbanned"}`,
            status: newRole === Roles.banned ? "error" : "success",
            duration: 3000,
            isClosable: true,
          });
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message,
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      }
    );
  };

  const getRoleBadge = (role) => {
    const props = {
      banned: { colorScheme: "red", label: "Banned" },
      admin: { colorScheme: "purple", label: "Admin" },
      user: { colorScheme: "green", label: "User" },
    };

    return (
      <Badge
        colorScheme={props[role]?.colorScheme || "gray"}
        variant="subtle"
        px={2}
        py={1}
        borderRadius="full"
      >
        {props[role]?.label || role}
      </Badge>
    );
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
              Admin Tools
            </Heading>
            <Text color={textColor}>
              Manage users and maintain community standards
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
            <VStack spacing={6}>
              <HStack w="full" spacing={8}>
                <RadioGroup
                  value={searchMethod}
                  onChange={(value) =>
                    setSearchParams({ method: value, search })
                  }
                >
                  <HStack spacing={4}>
                    <Radio value="username" colorScheme="orange">
                      Username
                    </Radio>
                    <Radio value="email" colorScheme="orange">
                      Email
                    </Radio>
                  </HStack>
                </RadioGroup>

                <InputGroup flex={1}>
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="gray.500" />
                  </InputLeftElement>
                  <Input
                    value={search}
                    onChange={(e) =>
                      setSearchParams({
                        method: searchMethod,
                        search: e.target.value,
                      })
                    }
                    placeholder={`Search by ${searchMethod}...`}
                  />
                </InputGroup>
              </HStack>

              {error && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  {error}
                </Alert>
              )}

              {isLoading ? (
                <Box textAlign="center" py={8}>
                  <Spinner size="xl" color="orange.500" />
                </Box>
              ) : users.length > 0 ? (
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Username</Th>
                      <Th>Email</Th>
                      <Th>Role</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {users.map((user) => (
                      <Tr key={user.uid}>
                        <Td fontWeight="medium">{user.handle}</Td>
                        <Td>{user.email}</Td>
                        <Td>{getRoleBadge(user.role)}</Td>
                        <Td>
                          <Button
                            size="sm"
                            colorScheme={user.role === Roles.banned ? "green" : "red"}
                            onClick={() => handleBan(user.uid)}
                            isLoading={isUpdating}
                            loadingText={user.role === Roles.banned ? "Unbanning..." : "Banning..."}
                          >
                            {user.role === Roles.banned ? "Unban" : "Ban"}
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              ) : (
                <Box textAlign="center" py={8}>
                  <Text color={textColor}>
                    No users found matching your search criteria
                  </Text>
                </Box>
              )}
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}