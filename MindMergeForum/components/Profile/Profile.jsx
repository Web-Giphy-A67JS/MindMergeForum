import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../src/store/app.context';
import { updateUser } from '../../services/user.services';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Avatar,
  useColorModeValue,
  Divider,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Badge,
  Alert,
  AlertIcon,
  Spinner,
  useToast,
  IconButton,
  Flex,
} from '@chakra-ui/react';
import { EditIcon, CheckIcon, CloseIcon, LockIcon } from '@chakra-ui/icons';

const StatCard = ({ label, value }) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  
  return (
    <Box
      bg={useColorModeValue('gray.50', 'gray.700')}
      p={4}
      borderRadius="lg"
      border="1px"
      borderColor={borderColor}
    >
      <Stat>
        <StatLabel fontSize="sm" color={textColor}>
          {label}
        </StatLabel>
        <StatNumber fontSize="2xl" color="brand.primary">
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

export default function Profile() {
  const { userData, setAppState } = useContext(AppContext);
  const [state, setState] = useState({
    isEditing: false,
    firstName: '',
    lastName: '',
    phone: '',
    loading: true,
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  // Stack Overflow colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const pageBg = useColorModeValue('gray.50', 'gray.900');

  useEffect(() => {
    if (userData) {
      setState({
        isEditing: false,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phone: userData.phone || '',
        loading: false,
      });
    }
  }, [userData]);

  const handleEdit = () => {
    setState((prevState) => ({ ...prevState, isEditing: true }));
  };

  const handleSave = async () => {
    try {
      if (!userData || !userData.uid) {
        throw new Error('User data is not available');
      }
      if (state.firstName.length < 4 || state.firstName.length > 32) {
        setError('First name must be between 4 and 32 characters');
        return;
      }
      if (state.lastName.length < 4 || state.lastName.length > 32) {
        setError('Last name must be between 4 and 32 characters');
        return;
      }
      if (state.phone && isNaN(state.phone)) {
        setError('Please enter a valid phone number');
        return;
      }

      await updateUser(userData.handle, {
        firstName: state.firstName,
        lastName: state.lastName,
        phone: state.phone,
      });

      setAppState((prevState) => ({
        ...prevState,
        userData: {
          ...prevState.userData,
          firstName: state.firstName,
          lastName: state.lastName,
          phone: state.phone,
        },
      }));
      setState((prevState) => ({ ...prevState, isEditing: false }));
      setError('');
      
      toast({
        title: 'Profile updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      setError(error.message);
    }
  };

  const handleChangePassword = () => {
    navigate('/password-change');
  };

  const handleCancel = () => {
    setState({
      isEditing: false,
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      phone: userData.phone || '',
      loading: false,
    });
    setError('');
  };

  if (state.loading) {
    return (
      <Box textAlign="center" py={20}>
        <Spinner size="xl" color="brand.primary" />
      </Box>
    );
  }

  return (
    <Box pt="70px" minH="100vh" bg={pageBg}>
      <Container maxW="container.lg" py={12}>
        <VStack spacing={8} align="stretch">
          {/* Profile Header */}
          <Box
            bg={bgColor}
            p={8}
            borderRadius="lg"
            boxShadow="sm"
            border="1px"
            borderColor={borderColor}
          >
            <Flex direction={{ base: 'column', md: 'row' }} align="center" gap={8}>
              <Avatar
                size="2xl"
                name={userData.handle}
                src={userData.avatarUrl}
                bg="brand.primary"
              />
              <VStack align="start" flex={1} spacing={4}>
                <HStack justify="space-between" w="full">
                  <VStack align="start" spacing={1}>
                    <Heading size="lg" color="brand.primary">
                      {userData.handle}
                    </Heading>
                    <Text color={textColor}>
                      {userData.firstName} {userData.lastName}
                    </Text>
                  </VStack>
                  <Badge colorScheme="purple" px={2} py={1} borderRadius="full">
                    {userData.role}
                  </Badge>
                </HStack>
                <Text color={textColor}>{userData.email}</Text>
                {userData.phone && (
                  <Text color={textColor}>📞 {userData.phone}</Text>
                )}
              </VStack>
            </Flex>
          </Box>

          {/* Stats Section */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <StatCard label="Posts" value="0" />
            <StatCard label="Comments" value="0" />
            <StatCard label="Likes Received" value="0" />
          </SimpleGrid>

          {/* Edit Profile Section */}
          <Box
            bg={bgColor}
            p={8}
            borderRadius="lg"
            boxShadow="sm"
            border="1px"
            borderColor={borderColor}
          >
            <VStack spacing={6} align="stretch">
              <HStack justify="space-between">
                <Heading size="md" color="brand.primary">
                  Profile Settings
                </Heading>
                {!state.isEditing && (
                  <IconButton
                    icon={<EditIcon />}
                    onClick={handleEdit}
                    colorScheme="blue"
                    variant="ghost"
                    aria-label="Edit profile"
                  />
                )}
              </HStack>

              {error && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  {error}
                </Alert>
              )}

              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>First Name</FormLabel>
                  <Input
                    value={state.firstName}
                    onChange={(e) =>
                      setState({ ...state, firstName: e.target.value })
                    }
                    isReadOnly={!state.isEditing}
                    bg={state.isEditing ? 'white' : 'gray.50'}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Last Name</FormLabel>
                  <Input
                    value={state.lastName}
                    onChange={(e) =>
                      setState({ ...state, lastName: e.target.value })
                    }
                    isReadOnly={!state.isEditing}
                    bg={state.isEditing ? 'white' : 'gray.50'}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Phone Number (Optional)</FormLabel>
                  <Input
                    value={state.phone}
                    onChange={(e) => setState({ ...state, phone: e.target.value })}
                    isReadOnly={!state.isEditing}
                    bg={state.isEditing ? 'white' : 'gray.50'}
                  />
                </FormControl>

                {state.isEditing && (
                  <HStack justify="flex-end" pt={4}>
                    <Button
                      leftIcon={<CloseIcon />}
                      onClick={handleCancel}
                      variant="ghost"
                    >
                      Cancel
                    </Button>
                    <Button
                      leftIcon={<CheckIcon />}
                      onClick={handleSave}
                      colorScheme="blue"
                    >
                      Save Changes
                    </Button>
                  </HStack>
                )}
              </VStack>

              <Divider my={6} />

              <Box>
                <Button
                  leftIcon={<LockIcon />}
                  onClick={handleChangePassword}
                  variant="outline"
                  colorScheme="blue"
                >
                  Change Password
                </Button>
              </Box>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}