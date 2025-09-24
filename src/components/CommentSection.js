import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import "./CommentSection.css";
import { formatTimestamp } from "../utils/formatTimestamp";
import { useAuth } from "../hooks/useAuth";
import { TiDelete } from "react-icons/ti";
import { GoReply } from "react-icons/go";

export default function CommentSection({ postId }) {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);

  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  const user = useAuth();

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

  const handleDeleteComment = async (commentId) => {
    try {
      if (!window.confirm("Vill du ta bort kommentaren?")) return;
      const commentRef = doc(db, "posts", postId, "comments", commentId);

      await deleteDoc(commentRef);
    } catch (err) {
      console.error("Kunde inte ta bort kommentaren", err);
    }
  };

  const handleSubmitReply = async (e, commentId) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (!user) return alert("Du måste vara inloggad för att svara");

    const reply = {
      text: replyText.trim(),
      userId: user.uid,
      userName: user.displayName,
      timestamp: new Date(),
    };

    try {
      const commentRef = doc(db, "posts", postId, "comments", commentId);
      await updateDoc(commentRef, {
        replies: arrayUnion(reply),
      });

      setReplyText("");
      setReplyTo(null);
    } catch (err) {
      console.error("Kunde inte lägga till svar", err);
    }
  };

  const handleDeleteReply = async (commentId, reply) => {
    try {
      if (!window.confirm("Vill du ta bort svaret?")) return;

      const commentRef = doc(db, "posts", postId, "comments", commentId);

      await updateDoc(commentRef, {
        replies: arrayRemove(reply),
      });
    } catch (err) {
      console.error("Kunde inte ta bort svaret", err);
    }
  };

  return (
    <div className="comment-section">
      <h3 className="comment-title">Kommentarer</h3>
      <ul className="comment-list">
        {comments.map((comment) => (
          <li key={comment.id} className="comment">
            {user.uid === comment.userId && (
              <TiDelete
                title="Ta bort kommentar"
                className="delete-comment"
                onClick={() => handleDeleteComment(comment.id)}
              />
            )}
            <strong>{comment.userName}</strong>
            <span className="time">{formatTimestamp(comment.timestamp)}</span>
            <p>{comment.text}</p>

            {comment.replies
              ?.slice()
              .sort(
                (a, b) =>
                  new Date(b.timestamp.seconds * 1000) -
                  new Date(a.timestamp.seconds * 1000)
              )
              .map((reply, i) => (
                <div key={i} className="reply">
                  {user.uid === reply.userId && (
                    <TiDelete
                      title="Ta bort svar"
                      className="reply-delete"
                      onClick={() => handleDeleteReply(comment.id, reply)}
                    />
                  )}
                  <strong className="reply-author">{reply.userName}</strong>
                  <span className="time">
                    {formatTimestamp(reply.timestamp)}
                  </span>
                  <p className="reply-text">{reply.text}</p>
                </div>
              ))}

            <GoReply
              className="reply-btn"
              title="Svara på kommentar"
              onClick={() => {
                setReplyTo((prev) => (prev === comment.id ? null : comment.id));
              }}
            />

            {replyTo === comment.id && (
              <form
                className="reply-form"
                onSubmit={(e) => handleSubmitReply(e, comment.id)}
              >
                <textarea
                  autoFocus
                  className="reply-textarea"
                  value={replyText}
                  placeholder="Svara..."
                  onChange={(e) => setReplyText(e.target.value)}
                />

                <button className="reply-submit-btn" type="submit">
                  Svara
                </button>
              </form>
            )}
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
