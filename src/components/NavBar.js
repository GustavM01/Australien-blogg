import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserRole } from "../hooks/useUserRole";
import { useAuth } from "../hooks/useAuth";
import LogOut from "./LogOut";
import { AiFillHome } from "react-icons/ai";

import "./NavBar.css";

export default function NavBar() {
  const role = useUserRole();
  const user = useAuth();
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <AiFillHome
          onClick={() => {
            navigate("/");
          }}
          className="home-icon"
        />
      </div>
      <div className={`navbar-center ${menuOpen ? "open" : ""}`} ref={menuRef}>
        <div className="close-container">
          <button className="close-btn" onClick={() => setMenuOpen(false)}>
            ✕
          </button>
        </div>
        <Link to="/" onClick={() => setMenuOpen(false)}>
          Hem
        </Link>

        <Link to="/about" onClick={() => setMenuOpen(false)}>
          Om
        </Link>
        {role === "admin" && (
          <Link to="/createPost" onClick={() => setMenuOpen(false)}>
            Skapa inlägg
          </Link>
        )}
        {!user && (
          <Link to="/login" onClick={() => setMenuOpen(false)}>
            Logga in
          </Link>
        )}
      </div>
      <div className="navbar-right">
        {user && <LogOut />}
        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Öppna meny"
        >
          ☰
        </button>
      </div>
    </nav>
  );
}
