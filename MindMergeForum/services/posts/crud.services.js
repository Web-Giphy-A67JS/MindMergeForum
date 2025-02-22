import { ref, push, get, remove, update } from "firebase/database";
import { db } from "../../src/config/firebase.config";

export const createPost = async (title, content, userId) => {
  try {
    const postsRef = ref(db, "posts");
    await push(postsRef, {
      title,
      content,
      userId,
      likedBy: {},
      commentCount: 0,
      createdOn: new Date().toISOString(),
    });
    console.log("The post was created successfully!");
  } catch (error) {
    console.error("Error creating post:", error);
  }
};

export const getPosts = async () => {
  const snapshot = await get(ref(db, 'posts'));
  if (!snapshot.exists) {
    return {};
  }
  return snapshot.val();
};

export const likePost = async(handle, postId) => {
  const postRef = ref(db, `posts/${postId}`);
  const snapshot = await get(postRef);
  const post = snapshot.val();
  const currentLikeCount = post.likedBy || 0;

  const updatedPost = {
    [`posts/${postId}/likedBy`]: currentLikeCount + 1,
    [`users/${handle}/likedPosts/${postId}`]: true,
  };

  return update(ref(db), updatedPost);
};

export const unlikePost = async(handle, postId) => {
  const postRef = ref(db, `posts/${postId}`);
  const snapshot = await get(postRef);
  const post = snapshot.val();
  const currentLikeCount = post.likedBy || 1;

  const updatedPost = {
    [`posts/${postId}/likedBy`]: Math.max(0, currentLikeCount - 1),
    [`users/${handle}/likedPosts/${postId}`]: null,
  };

  return update(ref(db), updatedPost);
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