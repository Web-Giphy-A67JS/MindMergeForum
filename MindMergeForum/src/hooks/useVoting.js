import { ref, runTransaction, onValue } from 'firebase/database';
import { db } from '../config/firebase.config';
import { useState, useEffect } from 'react';

export const useVoting = (postId, initialVotes = { upvotes: {}, downvotes: {} }) => {
  const [votes, setVotes] = useState({
    upvotes: initialVotes?.upvotes || {},
    downvotes: initialVotes?.downvotes || {}
  });

  useEffect(() => {
    const postRef = ref(db, `posts/${postId}`);
    const unsubscribe = onValue(postRef, (snapshot) => {
      const post = snapshot.val();
      if (post) {
        setVotes({
          upvotes: post.upvotes || {},
          downvotes: post.downvotes || {}
        });
      } else {
        setVotes({ upvotes: {}, downvotes: {} });
      }
    });

    return () => unsubscribe();
  }, [postId]);

  const handleVote = async (userId, isUpvote) => {
    if (!userId) return;

    const postRef = ref(db, `posts/${postId}`);

    try {
      await runTransaction(postRef, (post) => {
        if (!post) return null;

        // Initialize vote objects if they don't exist
        if (!post.upvotes) post.upvotes = {};
        if (!post.downvotes) post.downvotes = {};

        // Check current vote status
        const hasUpvoted = post.upvotes[userId];
        const hasDownvoted = post.downvotes[userId];

        // Remove any existing votes
        delete post.upvotes[userId];
        delete post.downvotes[userId];

        // If clicking the same vote type, it just removes the vote
        // If clicking different vote type or first time voting, add the new vote
        if (isUpvote && !hasUpvoted) {
          post.upvotes[userId] = true;
        } else if (!isUpvote && !hasDownvoted) {
          post.downvotes[userId] = true;
        }

        post.lastActivityDate = Date.now();
        return post;
      });

      return true;
    } catch (error) {
      console.error('Error updating votes:', error);
      return false;
    }
  };

  // Ensure we're working with objects before calling Object.keys
  const upvotes = votes?.upvotes || {};
  const downvotes = votes?.downvotes || {};
  
  const votesCount = Object.keys(upvotes).length - Object.keys(downvotes).length;
  const hasUpvoted = (userId) => Boolean(userId && upvotes[userId]);
  const hasDownvoted = (userId) => Boolean(userId && downvotes[userId]);

  return {
    votesCount,
    hasUpvoted,
    hasDownvoted,
    handleVote
  };
};