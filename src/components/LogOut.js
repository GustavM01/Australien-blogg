import React from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

import "./LogOut.css";

export default function LogOut() {
  const navigate = useNavigate();

  const handleSignOut = () => {
    auth.signOut();
    navigate("/login");
  };
  return (
    <div className="logout-container">
      <button className="logout-btn" onClick={() => handleSignOut()}>
        Logga ut
      </button>
    </div>
  );
}
