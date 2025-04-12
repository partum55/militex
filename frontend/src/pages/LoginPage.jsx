// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./LoginPage.css"; // Ensure this path is correct
import axios from 'axios';

// Get CSRF token from cookies
const getCookie = (name) => {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

const csrfToken = getCookie('csrftoken');

// Set axios default header for CSRF token
axios.defaults.headers.common["X-CSRFToken"] = csrfToken;


const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:8000/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        navigate("/"); // Navigate to home page upon successful login
      } else {
        alert("Login failed: " + JSON.stringify(data));
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2 className="login-title">Log In</h2>
        <form onSubmit={handleLogin} className="login-form">
          <label className="login-label">Username</label>
          <input
            type="text"
            className="login-input"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label className="login-label">Password</label>
          <input
            type="password"
            className="login-input"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="login-button">
            Log In
          </button>
        </form>
        <p className="login-switch">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
