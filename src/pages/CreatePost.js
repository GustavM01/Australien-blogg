import React, { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase";
import ImageUploader from "../components/ImageUploader";

import "./CreatePost.css";
import { useNavigate } from "react-router-dom";

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePath, setImagePath] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("Du måste vara inloggad för att skapa ett inlägg.");
      return;
    }

    const post = {
      title,
      content,
      imageUrl,
      imagePath,
      createdAt: serverTimestamp(),
      author: {
        uid: user.uid,
        name: user.displayName,
      },
    };

    try {
      await addDoc(collection(db, "posts"), post);
      setTitle("");
      setContent("");
      setImageUrl("");
    } catch (error) {
      console.error("Fel vid sparande:", error);
      alert("Något gick fel när inlägget skulle sparas.");
    }
    navigate("/");
  };

  return (
    <div className="create-post-container">
      <h2>Skapa nytt inlägg</h2>
      <form onSubmit={handleSubmit} className="create-post-form">
        <input
          className="create-post-title"
          name="post title"
          type="text"
          placeholder="Titel"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className="create-post-text"
          name="post text"
          placeholder="Skriv ditt inlägg här..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={6}
        />
        <ImageUploader
          onUpload={({ url, path }) => {
            setImageUrl(url);
            setImagePath(path);
          }}
        />
        {imageUrl && (
          <div>
            <p>Förhandsvisning:</p>
            <img
              src={imageUrl}
              alt="Uppladdad"
              style={{ maxWidth: "300px", marginTop: "10px" }}
            />
          </div>
        )}
        <button className="create-post-btn" type="submit">
          Publicera
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
