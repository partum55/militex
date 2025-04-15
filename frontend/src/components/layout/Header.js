import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import LanguageSelector from '../common/LanguageSelector';

function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, logout } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const userDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userDropdownRef]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setShowUserDropdown(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-indigo-900 text-white">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="mr-6">
            <img src="/logo.png" alt="Militex Logo" className="h-8" />
          </Link>

          {/* Main Navigation - Desktop */}
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="hover:text-gray-300">{t('common.home')}</Link>
            <Link to="/buy" className="hover:text-gray-300">{t('common.buy')}</Link>
            <Link to="/sell" className="hover:text-gray-300">{t('common.sell')}</Link>
            <Link to="/fundraiser" className="hover:text-gray-300">{t('common.fundraiser')}</Link>
          </nav>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            {showMobileMenu ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>

        <div className="hidden md:flex items-center space-x-4">
          {/* Language Selector */}
          <LanguageSelector />

          {/* User Menu */}
          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center text-gray-200 hover:text-white focus:outline-none"
              aria-expanded={showUserDropdown}
            >
              <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              <span className="ml-1 hidden md:inline">
                {isAuthenticated ? currentUser?.username || t('common.account') : t('common.account')}
              </span>
              <svg
                className="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={showUserDropdown ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
                ></path>
              </svg>
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      {t('common.profile')}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                    >
                      {t('common.signOut')}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      {t('common.signIn')}
                    </Link>
                    <Link
                      to="/register"
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      {t('common.signUp')}
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-indigo-800 p-4">
          <nav className="flex flex-col space-y-2">
            <Link to="/" className="py-2" onClick={() => setShowMobileMenu(false)}>
              {t('common.home')}
            </Link>
            <Link to="/buy" className="py-2" onClick={() => setShowMobileMenu(false)}>
              {t('common.buy')}
            </Link>
            <Link to="/sell" className="py-2" onClick={() => setShowMobileMenu(false)}>
              {t('common.sell')}
            </Link>
            <Link to="/fundraiser" className="py-2" onClick={() => setShowMobileMenu(false)}>
              {t('common.fundraiser')}
            </Link>

            <div className="border-t border-indigo-700 my-2 pt-2">
              {/* Language picker for mobile */}
              <div className="py-2">
                <LanguageSelector />
              </div>

              {/* User actions for mobile */}
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="block py-2" onClick={() => setShowMobileMenu(false)}>
                    {t('common.profile')}
                  </Link>
                  <button onClick={handleLogout} className="block py-2 text-left w-full">
                    {t('common.signOut')}
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block py-2" onClick={() => setShowMobileMenu(false)}>
                    {t('common.signIn')}
                  </Link>
                  <Link to="/register" className="block py-2" onClick={() => setShowMobileMenu(false)}>
                    {t('common.signUp')}
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;
