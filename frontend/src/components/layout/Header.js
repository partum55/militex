import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import LanguageSelector from './LanguageSelector';

function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, logout } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

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

          {/* Main Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="hover:text-gray-300">{t('common.home')}</Link>
            <Link to="/buy" className="hover:text-gray-300">{t('common.buy')}</Link>
            <Link to="/sell" className="hover:text-gray-300">{t('common.sell')}</Link>
            <Link to="/fundraiser" className="hover:text-gray-300">{t('common.fundraiser')}</Link>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <LanguageSelector />

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center text-gray-200 hover:text-white focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              <span className="ml-1 hidden md:inline">
                {isAuthenticated ? currentUser?.username : t('common.account')}
              </span>
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
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
    </header>
  );
}

export default Header;
