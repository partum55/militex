import React from 'react';
import { useTranslation } from 'react-i18next';

const MaintenancePage = () => {
  const { t } = useTranslation();
  
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
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            ></path>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            ></path>
          </svg>
        </div>
        
        <h1 className="mt-5 text-3xl font-bold text-gray-900">
          {t('errors.maintenanceTitle')}
        </h1>
        
        <p className="mt-3 text-lg text-gray-600">
          {t('errors.maintenanceMessage')}
        </p>
        
        <div className="mt-6 flex items-center justify-center gap-3">
          <div className="w-3 h-3 bg-indigo-900 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-indigo-900 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-indigo-900 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
        
        <div className="mt-8">
          <p className="text-gray-600">
            {t('errors.checkBack')}
          </p>
          <div className="mt-4 flex justify-center">
            <a
              href="https://twitter.com/militex"
              target="_blank"
              rel="noopener noreferrer"
              className="mx-2 text-indigo-600 hover:text-indigo-800"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
              </svg>
            </a>
            
            <a
              href="https://facebook.com/militex"
              target="_blank"
              rel="noopener noreferrer"
              className="mx-2 text-indigo-600 hover:text-indigo-800"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path>
              </svg>
            </a>
            
            <a
              href="mailto:support@militex.com"
              className="mx-2 text-indigo-600 hover:text-indigo-800"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;