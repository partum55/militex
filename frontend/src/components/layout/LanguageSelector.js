import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

function LanguageSelector() {
  const { i18n, t } = useTranslation();
  const [showDropdown, setShowDropdown] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'uk', name: 'Українська', flag: '🇺🇦' }
  ];

  const currentLang = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center text-gray-200 hover:text-white"
      >
        <span className="mr-1">{currentLang.flag}</span>
        <span className="hidden md:inline">{currentLang.name}</span>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
          {languages.map(lang => (
            <button
              key={lang.code}
              className={`block w-full text-left px-4 py-2 ${
                i18n.language === lang.code 
                  ? 'bg-indigo-100 text-indigo-900' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => changeLanguage(lang.code)}
            >
              <span className="mr-2">{lang.flag}</span>
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LanguageSelector;
