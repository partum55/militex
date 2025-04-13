import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthService from '../../services/auth.service';
import Navbar from './Navbar'; // Import the Navbar component

const Header = () => {
  const { t, i18n } = useTranslation();
  const [currentUser, setCurrentUser] = useState(null);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
    navigate('/');
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setShowLanguageDropdown(false);
  };

  return (
    <header className="bg-purple-900 text-white">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="mr-6">
            <img src="/logo.png" alt="Militex Logo" className="h-8" />
          </Link>

          {/* Use the Navbar component here */}
          <Navbar />
        </div>

        <div className="flex items-center space-x-4">
          {/* Dark mode toggle */}
          <button className="p-1 rounded-full text-gray-200 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
            </svg>
          </button>

          {/* Language selector */}
          <div className="relative">
            <button
              className="p-1 rounded-full text-gray-200 hover:text-white"
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path>
              </svg>
            </button>

            {showLanguageDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <button
                  onClick={() => changeLanguage('en')}
                  className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  <span className="mr-2">{i18n.language === 'en' ? '✓' : ''}</span>
                  {t('common.english')}
                </button>
                <button
                  onClick={() => changeLanguage('uk')}
                  className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  <span className="mr-2">{i18n.language === 'uk' ? '✓' : ''}</span>
                  {t('common.ukrainian')}
                </button>
              </div>
            )}
          </div>

          {/* User profile */}
          <div className="relative">
            <button
              className="p-1 rounded-full text-gray-200 hover:text-white"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                {currentUser ? (
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
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
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
};

export default Header;
