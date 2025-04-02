import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaMoon, FaSun, FaGlobe, FaUser } from "react-icons/fa";
import "./Navbar.css";

const Navbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    // Example: Toggle dark mode class on document body
    document.body.classList.toggle("dark-mode", !isDarkMode);
  };

  const handleLanguageChange = () => {
    // Implement your language change logic
    alert("Language change not implemented yet!");
  };

  const handleProfileClick = () => {
    // Implement profile navigation or dropdown
    alert("Profile clicked!");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="logo-link">
          <img
            src="/logo.png"  // Place your logo in frontend/src/public or adjust path accordingly
            alt="Militex Logo"
            className="logo-image"
          />
          <span className="logo-text">Militex</span>
        </Link>
      </div>

      <ul className="navbar-links">
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/buy">Buy</Link>
        </li>
        <li>
          <Link to="/sell">Sell</Link>
        </li>
        <li>
          <Link to="/tuning">Tuning</Link>
        </li>
      </ul>

      <div className="navbar-right">
        <button onClick={handleThemeToggle} className="icon-button">
          {isDarkMode ? <FaSun /> : <FaMoon />}
        </button>
        <button onClick={handleLanguageChange} className="icon-button">
          <FaGlobe />
        </button>
        <button onClick={handleProfileClick} className="icon-button">
          <FaUser />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
