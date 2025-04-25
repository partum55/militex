import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'common.home' },
    { path: '/buy', label: 'common.buy' },
    { path: '/sell', label: 'common.sell' },
    { path: '/fundraiser', label: 'common.fundraiser' }
  ];
  
  return (
    <nav className="hidden md:flex space-x-6">
      {navLinks.map(link => (
        <Link 
          key={link.path}
          to={link.path}
          className={`hover:text-gray-300 transition-colors duration-200 ${
            location.pathname === link.path ? 'font-medium text-white' : 'text-gray-200'
          }`}
        >
          {t(link.label)}
        </Link>
      ))}
    </nav>
  );
};

export default Navbar;
