import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db, storage } from "../firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { MdArrowBack } from "react-icons/md";
import CommentSection from "../components/CommentSection";
import { formatTimestamp } from "../utils/formatTimestamp";
import { useUserRole } from "../hooks/useUserRole";
import { deleteObject, ref } from "firebase/storage";

import "./Post.css";

export default function Post() {
  const { postId } = useParams();
  const role = useUserRole();

  const [post, setPost] = useState(null);
  const [showFullImage, setShowFullImage] = useState(false);

  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      const ref = doc(db, "posts", postId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setPost({ id: snap.id, ...snap.data() });
      } else {
        console.error("Inlägget finns inte.");
      }
    };

    fetchPost();
  }, [postId]);

  useEffect(() => {
    if (showEditPopup) {
      // Lås scroll
      document.body.style.overflow = "hidden";
    } else {
      // Återställ scroll
      document.body.style.overflow = "";
    }

    // Säkerställ att scrollen återställs även om komponenten tas bort
    return () => {
      document.body.style.overflow = "";
    };
  }, [showEditPopup]);

  if (!post) return <p>Laddar...</p>;

  const handleDeletePost = async () => {
    try {
      if (!window.confirm("Vill du ta bort inlägget?")) return;

      const postRef = doc(db, "posts", postId);
      const postSnap = await getDoc(postRef);

      if (postSnap.exists()) {
        const postData = postSnap.data();

        if (postData.imagePath) {
          const imageRef = ref(storage, postData.imagePath);
          await deleteObject(imageRef);
          console.log("Bilden togs bort från Storage.");
        }

        const commentsRef = collection(db, "posts", postId, "comments");
        const commentSnapshots = await getDocs(commentsRef);
        const deletePromises = commentSnapshots.docs.map((docSnap) =>
          deleteDoc(docSnap.ref)
        );
        await Promise.all(deletePromises);

        await deleteDoc(postRef);
        console.log("Inlägget togs bort.");
        navigate("/");
      } else {
        console.warn("Inlägget kunde inte hittas.");
      }
    } catch (err) {
      console.error("Fel vid borttagning:", err);
    }
  };

  const handleUpdatePost = async () => {
    try {
      const ref = doc(db, "posts", postId);
      await updateDoc(ref, {
        title: editedTitle.trim(),
        content: editedContent.trim(),
      });
      setPost((prev) => ({
        ...prev,
        title: editedTitle,
        content: editedContent,
      }));
      setShowEditPopup(false);
    } catch (err) {
      console.error("Kunde inte uppdatera inlägget", err);
    }
  };

  return (
    <div className="post-page-container">
      <button
        className="back-btn"
        onClick={() => {
          navigate(-1);
        }}
      >
        <MdArrowBack className="back-icon" /> Tillbaka
      </button>
      {role === "admin" && (
        <>
          <button className="delete-btn" onClick={handleDeletePost}>
            Ta bort inlägg
          </button>
          <button
            className="edit-btn"
            onClick={() => {
              setShowEditPopup(true);
              setEditedTitle(post.title);
              setEditedContent(post.content);
            }}
          >
            Ändra
          </button>
        </>
      )}
      <div className="single-post-container">
        <h1 className="single-post-title">{post.title}</h1>
        <p className="single-post-content">{post.content}</p>
        {post.imageUrl && (
          <>
            <img
              className="single-post-img"
              title="Klicka för storbild"
              src={post.imageUrl}
              alt={post.title}
              onClick={() => setShowFullImage(true)}
            />
            {showFullImage && (
              <div className="overlay" onClick={() => setShowFullImage(false)}>
                <img
                  className="full-image"
                  src={post.imageUrl}
                  alt={post.title}
                />
                <span className="close">&times;</span>
              </div>
            )}
          </>
        )}
        <div className="single-post-footer">
          <p className="post-author">{post.author.name}</p>
          <p className="post-time">
            {post.createdAt && formatTimestamp(post.createdAt)}
          </p>
        </div>
        <CommentSection postId={postId} />
      </div>
      {showEditPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>Redigera inlägg</h2>
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
            />
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
            />
            <div className="popup-buttons">
              <button onClick={() => setShowEditPopup(false)}>Avbryt</button>
              <button onClick={handleUpdatePost}>Spara</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
