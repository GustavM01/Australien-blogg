import React from "react";
import PostList from "../components/PostList";
import "./Home.css";
import { useAuth } from "../hooks/useAuth";

export default function Home() {
  const user = useAuth();

  return (
    <div className="homeContainer">
      {user && <h2>Välkommen {user.displayName}</h2>}
      {!user && <p>Logga in för att se inläggen.</p>}
      {user && <PostList />}
    </div>
  );
}
