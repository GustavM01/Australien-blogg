import { collection, getDocs, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { Link } from "react-router-dom";
import { formatTimestamp } from "../utils/formatTimestamp";
import { FaArrowUp } from "react-icons/fa";

import "./PostList.css";

export default function PostList() {
  const [posts, setPosts] = useState([]);
  const [reverseOrder, setReverseOrder] = useState(() => {
    const stored = localStorage.getItem("reverseOrder");
    return stored === "true";
  });

  useEffect(() => {
    localStorage.setItem("reverseOrder", reverseOrder);
  }, [reverseOrder]);

  useEffect(() => {
    const loadPosts = async () => {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const allPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(allPosts);
    };
    loadPosts();
  }, []);

  const displayedPosts = reverseOrder ? [...posts].reverse() : posts;

  if (!posts) return <p>Det finns tyvärr inga inlägg just nu</p>;
  return (
    <div className="postlist-container">
      <button
        className="reverse-btn"
        onClick={() => setReverseOrder((prev) => !prev)}
      >
        {reverseOrder ? "Visa nyast först " : "Visa äldst först "}
        <FaArrowUp className={`arrow-icon ${reverseOrder ? "rotated" : ""}`} />
      </button>
      {displayedPosts.map((post) => (
        <Link
          className="post-link"
          key={post.id}
          style={{ color: "black", textDecoration: "none" }}
          to={`/post/${post.id}`}
        >
          <div className="post-container">
            <h3 className="post-title">{post.title}</h3>
            <p className="post-content">{post.content}</p>
            {post.imageUrl && (
              <div className="image-wrapper">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="post-image"
                />
              </div>
            )}
            <div className="post-footer">
              <p className="post-author">Skrivet av: {post.author.name}</p>
              {post.createdAt && (
                <p className="post-time">
                  {post.createdAt && formatTimestamp(post.createdAt)}
                </p>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
