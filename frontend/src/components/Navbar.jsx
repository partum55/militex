import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="logo">
        <img src="/api/placeholder/40/40" alt="Logo" className="logo-img" />
      </div>

      {/* Navigation Links - Desktop */}
      <div className={`nav-links ${isMobileMenuOpen ? 'mobile-active' : ''}`}>
        <a href="" className="nav-link">Home</a>
        <a href="api/cars/buy" className="nav-link">Buy</a>
        <a href="api/cars/sell" className="nav-link">Sell</a>
        <a href="#" className="nav-link">Fundraiser</a>
      </div>

      {/* Actions */}
      <div className="nav-actions">
        {/* Dark Mode Button */}
        <button className="icon-btn">
          <i className="moon-icon">🌙</i>
        </button>

        {/* Language Button */}
        <button className="icon-btn">
          <i className="globe-icon">🌐</i>
        </button>

        {/* Account Dropdown */}
        <div className="account-dropdown" ref={menuRef}>
          <button className="icon-btn" onClick={toggleMenu}>
            <i className="user-icon">👤</i>
          </button>

          {isMenuOpen && (
            <div className="dropdown-menu">
              {isLoggedIn ? (
                <>
                  <a href="#" className="dropdown-item">
                    <i className="profile-icon">👤</i> Profile
                  </a>
                  <a href="" className="dropdown-item" onClick={handleLogout}>
                    <i className="signout-icon">🚪</i> Sign Out
                  </a>
                </>
              ) : (
                <>
                  <a href="api/acoounts/login" className="dropdown-item" onClick={handleLogin}>
                    <i className="login-icon">🔑</i> Login
                  </a>
                  <a href="api/accounts/signup" className="dropdown-item">
                    <i className="signup-icon">📝</i> Sign Up
                  </a>
                </>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          <i className="menu-icon">☰</i>
        </button>
      </div>

      {/* CSS */}
      <style jsx>{`
        /* Navbar Styles */
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #4a148c;
          color: white;
          padding: 1rem;
          position: relative;
        }
        
        /* Logo */
        .logo-img {
          height: 40px;
          width: 40px;
          border-radius: 50%;
        }
        
        /* Navigation Links */
        .nav-links {
          display: flex;
          gap: 2rem;
        }
        
        .nav-link {
          color: white;
          text-decoration: none;
          transition: color 0.3s ease;
        }
        
        .nav-link:hover {
          color: #ce93d8;
        }
        
        /* Actions */
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .icon-btn {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.3s ease;
          font-size: 1.2rem;
        }
        
        .icon-btn:hover {
          background-color: #6a1b9a;
        }
        
        /* Account Dropdown */
        .account-dropdown {
          position: relative;
        }
        
        .dropdown-menu {
          position: absolute;
          right: 0;
          top: 100%;
          margin-top: 0.5rem;
          width: 200px;
          background-color: white;
          color: #333;
          border-radius: 0.375rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          z-index: 10;
        }
        
        .dropdown-item {
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          text-decoration: none;
          color: #333;
          transition: background-color 0.3s ease;
        }
        
        .dropdown-item i {
          margin-right: 0.5rem;
          font-size: 0.875rem;
        }
        
        .dropdown-item:hover {
          background-color: #f5f5f5;
        }
        
        /* Mobile Menu */
        .mobile-menu-btn {
          display: none;
        }
        
        /* Media Queries */
        @media (max-width: 768px) {
          .nav-links {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background-color: #4a148c;
            flex-direction: column;
            padding: 1rem;
            display: none;
            z-index: 5;
          }
          
          .nav-links.mobile-active {
            display: flex;
          }
          
          .mobile-menu-btn {
            display: flex;
          }
        }
      `}</style>
    </nav>
  );
}