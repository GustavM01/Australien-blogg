import React, { useEffect, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase";
import ImageUploader from "../components/ImageUploader";
import { useUserRole } from "../hooks/useUserRole";

import "./CreatePost.css";
import { useNavigate } from "react-router-dom";

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]); // Array med {url, path}

  const role = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (role && role !== "admin") {
      navigate("/");
    }
  }, [role, navigate]);

  useEffect(() => {
    console.log("Uppdaterade bilder:", images);
  }, [images]);

  if (!role) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Sparas i Firestore:", images);

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("Du måste vara inloggad för att skapa ett inlägg.");
      return;
    }

    const post = {
      title,
      content,
      images,
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
      setImages([]);
      navigate("/");
    } catch (error) {
      console.error("Fel vid sparande:", error);
      alert("Något gick fel när inlägget skulle sparas.");
    }
  };

  return (
    <div className="create-post-container">
      <h2>Skapa nytt inlägg</h2>
      <form onSubmit={handleSubmit} className="create-post-form">
        <input
          className="create-post-title"
          type="text"
          placeholder="Titel"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className="create-post-text"
          placeholder="Skriv ditt inlägg här..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={6}
        />
        <ImageUploader
          onUpload={(uploadedImages) =>
            setImages((prev) => [...prev, ...uploadedImages])
          }
        />

        {images.length > 0 && (
          <div style={{ marginTop: "10px" }}>
            <p>Förhandsvisning av uppladdade bilder:</p>
            <div className="preview-img">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img.url}
                  alt={`Uppladdad bild ${index + 1}`}
                  style={{ maxWidth: "150px", borderRadius: "8px" }}
                />
              ))}
            </div>
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
