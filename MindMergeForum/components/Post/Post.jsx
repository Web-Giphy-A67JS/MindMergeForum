import { useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../src/store/app.context";
import { ref, onValue, update, push } from "firebase/database";
import { db } from "../../src/config/firebase.config";

export default function Post() {
  const { id } = useParams();
  const { user } = useContext(AppContext);
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editedText, setEditedText] = useState("");

  useEffect(() => {
    const postRef = ref(db, `posts/${id}`);
    const unsubscribe = onValue(
      postRef,
      (snapshot) => {
        const postData = snapshot.val();
        if (postData) {
          setPost(postData);
        } else {
          setPost(null);
        }
      },
      (error) => {
        console.error(error.message);
        setPost(null);
      }
    );

    return () => unsubscribe();
  }, [id]);

  if (post === null) {
    return <div>Loading...</div>;
  }

  const handleLike = () => {
    if (!user) return;

    const postRef = ref(db, `posts/${id}`);
    const userLiked = post.likedBy && post.likedBy[user.uid];

    const updates = {
      [`likedBy/${user.uid}`]: !userLiked ? true : null,
    };

    update(postRef, updates).then(() => {
      setPost((prevPost) => {
        const newLikedBy = { ...prevPost.likedBy };
        if (!userLiked) {
          newLikedBy[user.uid] = true;
        } else {
          delete newLikedBy[user.uid];
        }
        return { ...prevPost, likedBy: newLikedBy };
      });
    });
  };

  const handleCommentSubmit = () => {
    if (!user || comment.trim() === "") return;

    const commentsRef = ref(db, `posts/${id}/comments`);
    const newComment = {
      text: comment,
      userId: user.uid,
      createdOn: Date.now(),
    };

    push(commentsRef, newComment).then(() => {
      setComment("");
    });
  };

  const handleEditComment = (commentId, currentText) => {
    setEditingComment(commentId);
    setEditedText(currentText);
  };

  const handleSaveEdit = (commentId) => {
    if (editedText.trim() === "") return;

    const commentRef = ref(db, `posts/${id}/comments/${commentId}`);
    update(commentRef, { text: editedText }).then(() => {
      setEditingComment(null);
      setEditedText("");
    });
  };

  return (
    <div>
      <h2>{post.title}</h2>
      <p>{post.content}</p>
      <small>Created by: {post.userId}</small>
      <small>Created on: {new Date(post.createdOn).toLocaleDateString()}</small>
      <p>❤️ {post.likedBy ? Object.keys(post.likedBy).length : 0} 💬 {post.comments ? Object.keys(post.comments).length : 0}</p>
      {user && (
        <button onClick={handleLike}>
          {post.likedBy && post.likedBy[user.uid] ? "Unlike" : "Like"}
        </button>
      )}

      {user && (
        <div>
          <button onClick={handleCommentSubmit}>Add a comment</button>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write here..."
          />
        </div>
      )}

      <h3>Comments</h3>
      {post.comments ? (
        Object.entries(post.comments).map(([commentId, commentData]) => (
          <div key={commentId}>
            {editingComment === commentId ? (
              <>
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                />
                <button onClick={() => handleSaveEdit(commentId)}>Save</button>
                <button onClick={() => setEditingComment(null)}>Close</button>
              </>
            ) : (
              <>
                <p>{commentData.text}</p>
                <small>User: {commentData.userId}</small>
                <small>
                  {" "}
                  | Date: {new Date(commentData.createdOn).toLocaleString()}
                </small>
                {user && user.uid === commentData.userId && (
                  <button
                    onClick={() =>
                      handleEditComment(commentId, commentData.text)
                    }
                  >
                    Edit
                  </button>
                )}
              </>
            )}
          </div>
        ))
      ) : (
        <p>No comments yet.</p>
      )}
    </div>
  );
}
