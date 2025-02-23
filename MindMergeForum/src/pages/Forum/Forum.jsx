import { useContext, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { auth } from "../../config/firebase.config";
import { deletePost } from "../../../services/posts";
import { Roles } from "../../../common/roles.enum";
import { AppContext } from "../../store/app.context";
import { SortingControls } from "../../../components/SortingControls/SortingControls";
import { useSortedPosts } from "../../hooks/useSortedPosts";
import PostCard from "../../../components/Post/Post";
import {
  Box,
  Container,
  Heading,
  Button,
  VStack,
  HStack,
  Spinner,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";

export default function Forum() {
  const { userData } = useContext(AppContext);
  const navigation = useNavigate();
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const noResultsColor = useColorModeValue("gray.600", "gray.400");

  const {
    posts,
    userHandles,
    sortCriteria,
    updateSortCriteria,
    dateRange,
    updateDateRange,
    loading,
    loadingState,
    error,
    isGuest,
    hasMore,
    loadMore,
    sortedPosts,
    setSearchQuery,
    searchQuery
  } = useSortedPosts();

  const handleDelete = async (postId) => {
    try {
      await deletePost(postId);
    } catch (error) {
      console.error("Error deleting post:", error.message);
    }
  };

  const handleSeeMore = (postId) => {
    navigation(`/posts/${postId}`);
  };

  const canDeletePost = (post) => {
    return (auth.currentUser && auth.currentUser.uid === post.userId) ||
           (userData && userData.role === Roles.admin);
  };

  const handleSearchChange = (query) => {
    setIsSearching(true);
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    setSearchTimeout(setTimeout(() => {
      setSearchQuery(query);
      setIsSearching(false);
    }, 500));
  };

  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  if (error) {
    return (
      <Container maxW="1200px" py={8}>
        <Text color="red.500">Error: {error}</Text>
      </Container>
    );
  }

  const renderPosts = (postsObj, section, showLoadMore = false) => (
    <VStack spacing={0} align="stretch" divider={<Divider />}>
      {Object.entries(postsObj).map(([postId, post]) => (
        <PostCard
          key={postId}
          postId={postId}
          post={post}
          userHandles={userHandles}
          onDelete={handleDelete}
          onSeeMore={handleSeeMore}
          canDelete={!isGuest && canDeletePost(post)}
        />
      ))}
      {showLoadMore && hasMore[section] && (
        <Box py={4} textAlign="center">
          <Button
            onClick={() => loadMore(section)}
            isLoading={loadingState[section]}
            loadingText="Loading more..."
            colorScheme="blue"
            size="sm"
          >
            Load more
          </Button>
        </Box>
      )}
    </VStack>
  );

  return (
    <Container maxW="1200px" py={8}>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">Questions</Heading>
        <Button
          as="a"
          href="/create-post"
          colorScheme="orange"
          size="md"
        >
          Ask Question
        </Button>
      </HStack>

      <Tabs variant="soft-rounded" colorScheme="orange" mb={6}>
        <TabList mb={4}>
          <Tab>Latest</Tab>
          <Tab>Top Discussed</Tab>
          <Tab>All Posts</Tab>
        </TabList>

        <TabPanels>
          {/* Latest Posts Tab */}
          <TabPanel px={0}>
            {loading ? (
              <Box textAlign="center" py={8}>
                <Spinner size="lg" color="orange.500" />
              </Box>
            ) : (
              renderPosts(posts.topNew, "new", true)
            )}
          </TabPanel>

          {/* Top Discussed Tab */}
          <TabPanel px={0}>
            {loading ? (
              <Box textAlign="center" py={8}>
                <Spinner size="lg" color="orange.500" />
              </Box>
            ) : (
              renderPosts(posts.topCommented, "comments", true)
            )}
          </TabPanel>

          {/* All Posts Tab */}
          <TabPanel px={0}>
            <Box mb={6}>
              <SortingControls
                sortCriteria={sortCriteria}
                onSortCriteriaChange={updateSortCriteria}
                dateRange={dateRange}
                onDateRangeChange={updateDateRange}
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
              />
            </Box>

            {isSearching ? (
              <Box textAlign="center" py={8}>
                <Spinner size="lg" color="orange.500" />
              </Box>
            ) : loading ? (
              <Box textAlign="center" py={8}>
                <Spinner size="lg" color="orange.500" />
              </Box>
            ) : Object.keys(sortedPosts).length === 0 ? (
              <Text textAlign="center" color={noResultsColor} py={8}>
                No questions found
              </Text>
            ) : (
              renderPosts(sortedPosts, "sorted", true)
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
}