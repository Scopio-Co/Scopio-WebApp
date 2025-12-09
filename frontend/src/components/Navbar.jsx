import React, { useState, useEffect } from "react";
import "./Navbar.css";

const Navbar = ({ onLogout, onNavigateToLearning, onNavigateToExplore }) => {
  // ✅ Initialize dark mode state from localStorage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // ✅ Apply dark mode class to body and save to localStorage
  useEffect(() => {
    document.body.classList.toggle("dark-mode", isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // ✅ Initialize theme on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      const isDark = savedTheme === 'dark';
      setIsDarkMode(isDark);
      document.body.classList.toggle("dark-mode", isDark);
    }
  }, []);

  const handleNavItemClick = (item) => {
    if (item === "Learning" && onNavigateToLearning) {
      onNavigateToLearning();
    } else if (item === "Explore" && onNavigateToExplore) {
      onNavigateToExplore();
    }
  };

  const navigationItems = [
    "Home",
    "Learning",
    "Explore",
    "Leaderboards",
    "Hands ON",
    "Settings",
  ];

  const favoriteItems = [
    "Kick Like Benz",
    "Uno dos tres",
    "Connect it",
    "Mini Integration",
    "Forge theory",
  ];

  return (
    <div className="navbar">
      {/* Profile Section */}
      <div className="profile-section">
        <div className="profile-info">
          <div className="profile-avatar">
            <img
              src="../../../src/assets/img/Ellipse 8.png"
              alt="Profile"
              className="avatar-image"
            />
          </div>
          <div className="profile-text">
            <h3>Profile</h3>
            <p>Log in / Sign up</p>
          </div>
        </div>

        {/* ✅ Dark Mode Toggle */}
        <div className="toggle-switch">
          <label className="switch">
            <input
              type="checkbox"
              checked={isDarkMode}
              onChange={toggleDarkMode}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="navigation-section">
        <ul className="nav-list">
          {navigationItems.map((item, index) => (
            <li key={index} className="nav-item">
              <a 
                href="#" 
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavItemClick(item);
                }}
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Favorites Section */}
      <div className="favorites-section">
        <ul className="favorites-list">
          <div className="favorites-header">
            <span className="favorites-badge">Favorites</span>
          </div>
          {favoriteItems.map((item, index) => (
            <li key={index} className="favorite-item">
              <a href="#" className="favorite-link">
                {item}
              </a>
            </li>
          ))}
          <li className="show-more">
            <a href="#" className="show-more-link">
              Show more
            </a>
          </li>
        </ul>
      </div>

      {/* Logout Button */}
      <div className="logout-section">
        <button
          className="logout-button"
          onClick={() => {
            if (typeof onLogout === 'function') onLogout();
            else console.log('Logout clicked!');
          }}
        >
          <span>Log Out</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="29"
            height="29"
            viewBox="0 0 29 29"
            fill="none"
          >
            <path
              d="M18.0191 9.12107V8.03257C18.0191 5.6584 16.0941 3.7334 13.7199 3.7334H8.03237C5.65937 3.7334 3.73438 5.6584 3.73438 8.03257V14.5251"    
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M18.0191 19.9302V21.0304C18.0191 23.3976 16.0987 25.3167 13.7316 25.3167H8.03237C5.65937 25.3167 3.73438 23.3917 3.73438 21.0176V18.938"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M25.9444 14.525H11.8965"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M22.5283 11.124L23.3823 11.9742M25.9443 14.5249L22.5283 17.9269"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Navbar;
