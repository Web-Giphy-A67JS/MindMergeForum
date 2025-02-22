import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPost } from "../../../services/posts";
import { auth } from "../../config/firebase.config";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (title.length < 16 || title.length > 64) {
      setError("The title must be between 16 and 64 characters!");
      return;
    }
    if (content.length < 32 || content.length > 8192) {
      setError("The content must be between 32 and 8192 characters!");
      return;
    }

    try {
      await createPost(title, content, auth.currentUser.uid);
      navigate("/forum");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Create new post</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleCreatePost}>
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <br/> <br/>
        <textarea placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} required />
        <br/> <br/>
        <button type="Submit">Post</button>
      </form>
    </div>
  );
}
