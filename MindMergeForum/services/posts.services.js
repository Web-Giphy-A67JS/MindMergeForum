import { ref, push, get, remove, update } from "firebase/database";
import { db } from "../src/config/firebase.config";

export const createPost = async (title, content, userId) => {
  try {
    const postsRef = ref(db, "posts");
    const now = Date.now();
    await push(postsRef, {
      title,
      content,
      userId,
      likes: 0,
      comments: [],
      createdOn: now,
      lastActivityDate: now,
    });
    console.log("The post was created successfully!");
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

export const getPosts = async () => {
  const snapshot = await get(ref(db, 'posts'));
  if (!snapshot.exists) {
    return {};
  }

  return snapshot.val();
};

export const likePost = async(userId, postId, value = 1) => {
  const now = Date.now();
  const updates = {
    [`posts/${postId}/likedBy/${userId}`]: value,
    [`posts/${postId}/lastActivityDate`]: now,
  };

  return update(ref(db), updates);
};

export const unlikePost = async(userId, postId) => {
  const now = Date.now();
  const updates = {
    [`posts/${postId}/likedBy/${userId}`]: null,
    [`posts/${postId}/lastActivityDate`]: now,
  };

  return update(ref(db), updates);
};

export const deletePost = async (postId) => {
  try {
    await remove(ref(db, `posts/${postId}`));
    console.log("The post was deleted successfully!");
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
};

export const updatePost = async (postId, updatedData) => {
  const postRef = ref(db, `posts/${postId}`);
  // Always update lastActivityDate when modifying a post
  const now = Date.now();
  await update(postRef, {
    ...updatedData,
    lastActivityDate: now,
  });
};