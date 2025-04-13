import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ErrorPage = ({ code = 404, message = '' }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const getErrorTitle = () => {
    switch (code) {
      case 403:
        return t('errors.forbidden');
      case 500:
        return t('errors.serverError');
      case 503:
        return t('errors.serviceUnavailable');
      default:
        return t('errors.pageNotFound');
    }
  };
  
  const getErrorMessage = () => {
    if (message) return message;
    
    switch (code) {
      case 403:
        return t('errors.forbiddenMessage');
      case 500:
        return t('errors.serverErrorMessage');
      case 503:
        return t('errors.serviceUnavailableMessage');
      default:
        return t('errors.pageNotFoundMessage');
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="text-center">
        <div className="flex justify-center">
          <svg
            className="w-24 h-24 text-indigo-900"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            ></path>
          </svg>
        </div>
        
        <h1 className="mt-5 text-3xl font-bold text-gray-900">
          {code} - {getErrorTitle()}
        </h1>
        
        <p className="mt-3 text-lg text-gray-600">
          {getErrorMessage()}
        </p>
        
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-200"
          >
            &larr; {t('common.back')}
          </button>
          
          <Link
            to="/"
            className="px-4 py-2 bg-indigo-900 text-white rounded-lg hover:bg-indigo-800 transition duration-200"
          >
            {t('common.backToHome')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
