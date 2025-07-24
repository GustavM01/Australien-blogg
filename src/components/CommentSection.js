import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import "./CommentSection.css";
import { formatTimestamp } from "../utils/formatTimestamp";

export default function CommentSection({ postId }) {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const commentsRef = collection(db, "posts", postId, "comments");
    const q = query(commentsRef, orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(data);
    });
    return () => unsubscribe();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return alert("Du måste vara inloggad för att kommentera");

    const comment = {
      text: commentText.trim(),
      userId: user.uid,
      userName: user.displayName,
      timestamp: serverTimestamp(),
    };
    try {
      await addDoc(collection(db, "posts", postId, "comments"), comment);
      setCommentText("");
    } catch (err) {
      console.error("Kunde inte lägga till kommentar", err);
    }
  };

  return (
    <div className="comment-section">
      <h3 className="comment-title">Kommentarer</h3>
      <ul className="comment-list">
        {comments.map((comment) => (
          <li key={comment.id} className="comment">
            <strong>{comment.userName}</strong>
            <span className="time">{formatTimestamp(comment.timestamp)}</span>
            <p>{comment.text}</p>
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit} className="comment-form">
        <textarea
          name="comment"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Skriv en kommentar..."
          required
        />
        <button type="submit">Skicka</button>
      </form>
    </div>
  );
}
