import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { MdArrowBack } from "react-icons/md";
import CommentSection from "../components/CommentSection";

import "./Post.css";
import { formatTimestamp } from "../utils/formatTimestamp";

export default function Post() {
  const { postId } = useParams();

  const [post, setPost] = useState(null);
  const [showFullImage, setShowFullImage] = useState(false);

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
  if (!post) return <p>Laddar...</p>;

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
      <div className="single-post-container">
        <h1 className="single-post-title">{post.title}</h1>
        <p className="single-post-content">{post.content}</p>
        {post.imageUrl && (
          <>
            <img
              className="single-post-img"
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
        <p className="single-post-footer">
          <p className="post-author">{post.author.name}</p>
          <p className="post-time">
            {post.createdAt && formatTimestamp(post.createdAt)}
          </p>
        </p>
        <CommentSection postId={postId} />
      </div>
    </div>
  );
}
