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
          aria-label={showMobileMenu ? t('common.closeMenu') : t('common.openMenu')}
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
              title={isAuthenticated ? t('common.account') : t('common.signIn')}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              <span className="ml-1 hidden md:inline">
                {isAuthenticated ? (currentUser?.username || t('common.account')) : t('common.account')}
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
                      className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      {t('common.profile')}
                    </Link>
                    <Link
                      to="/profile/cars"
                      className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                      </svg>
                      {t('profile.myVehicles')}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                      </svg>
                      {t('common.signOut')}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                      </svg>
                      {t('common.signIn')}
                    </Link>
                    <Link
                      to="/register"
                      className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                      </svg>
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
              <div className="py-2 flex items-center">
                <span className="text-gray-300 mr-2">{t('common.language')}:</span>
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
