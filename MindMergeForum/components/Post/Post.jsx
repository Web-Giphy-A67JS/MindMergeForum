import { useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../src/store/app.context";
import { ref, update, push } from "firebase/database";
import { db } from "../../src/config/firebase.config";
import { getUserById } from "../../services/user.services";
import usePost from "../../src/hooks/usePost";
import {
  Box,
  Container,
  VStack,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";

import { PostHeader } from "./PostHeader";
import { PostContent } from "./PostContent";
import { CommentList } from "./CommentList";
import { CommentForm } from "./CommentForm";
import { useVoting } from "../../src/hooks/useVoting";

export default function Post() {
  const { id } = useParams();
  const { user } = useContext(AppContext);
  const { data: post, isLoading, error } = usePost(id);
  const [comment, setComment] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [userHandle, setUserHandle] = useState("");
  const [postCreatorHandle, setPostCreatorHandle] = useState("");

  const pageBg = useColorModeValue("gray.50", "gray.900");
  const boxBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  
  // Use the voting system with up/down votes
  const { votesCount, hasUpvoted, hasDownvoted, handleVote } = useVoting(id, {
    upvotes: post?.upvotes || {},
    downvotes: post?.downvotes || {}
  });

  useEffect(() => {
    if (post?.userId) {
      getUserById(post.userId).then((userData) => {
        if (userData) {
          setPostCreatorHandle(userData.handle);
        }
      });
    }
  }, [post?.userId]);

  useEffect(() => {
    if (user) {
      getUserById(user.uid).then((userData) => {
        if (userData) {
          setUserHandle(userData.handle);
        }
      });
    }
  }, [user]);

  const handleCommentSubmit = () => {
    if (!user || comment.trim() === "") return;

    const commentsRef = ref(db, `posts/${id}/comments`);
    const newComment = {
      text: comment,
      userId: user.uid,
      userHandle: userHandle,
      createdOn: Date.now(),
    };

    const updates = {};
    const newCommentRef = push(commentsRef);
    updates[`/posts/${id}/comments/${newCommentRef.key}`] = newComment;
    updates[`/posts/${id}/lastActivityDate`] = Date.now();

    update(ref(db), updates)
      .then(() => {
        setComment("");
      })
      .catch((error) => {
        console.error("Error adding comment:", error.message);
      });
  };

  const handleSaveEdit = (commentId) => {
    if (editedText.trim() === "") return;

    const updates = {};
    updates[`/posts/${id}/comments/${commentId}/text`] = editedText;
    updates[`/posts/${id}/lastActivityDate`] = Date.now();

    update(ref(db), updates)
      .then(() => {
        setEditingComment(null);
        setEditedText("");
      })
      .catch((error) => {
        console.error("Error saving comment:", error.message);
      });
  };

  if (isLoading) {
    return (
      <Box textAlign="center" py={20} bg={pageBg}>
        <Spinner size="xl" color="orange.500" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box pt="70px" bg={pageBg}>
        <Container maxW="container.md">
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        </Container>
      </Box>
    );
  }

  if (!post) {
    return (
      <Box pt="70px" bg={pageBg}>
        <Container maxW="container.md">
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            Post not found
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box pt="70px" minH="100vh" bg={pageBg}>
      <Container maxW="container.md" py={8}>
        <VStack spacing={8} align="stretch">
          <Box
            bg={boxBg}
            p={6}
            borderRadius="lg"
            boxShadow="sm"
            border="1px"
            borderColor={borderColor}
          >
            <PostHeader
              title={post.title}
              creatorHandle={postCreatorHandle}
              createdOn={post.createdOn}
              lastActivityDate={post.lastActivityDate}
              votesCount={votesCount}
              hasUpvoted={hasUpvoted(user?.uid)}
              hasDownvoted={hasDownvoted(user?.uid)}
              onVote={(isUpvote) => handleVote(user?.uid, isUpvote)}
              currentUser={user}
            />
            <PostContent content={post.content} />
          </Box>

          {user && (
            <CommentForm
              comment={comment}
              setComment={setComment}
              handleCommentSubmit={handleCommentSubmit}
            />
          )}

          <CommentList
            comments={post.comments}
            currentUser={user}
            editingComment={editingComment}
            editedText={editedText}
            setEditingComment={setEditingComment}
            setEditedText={setEditedText}
            handleSaveEdit={handleSaveEdit}
          />
        </VStack>
      </Container>
    </Box>
  );
}