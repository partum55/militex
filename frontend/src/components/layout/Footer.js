import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-indigo-900 text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center mb-4">
              <img src="/logo.png" alt="Militex Logo" className="h-8" />
            </Link>
            <p className="text-indigo-200 mb-4">
              {t('footer.about')}
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-indigo-200 hover:text-white">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-indigo-200 hover:text-white">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-indigo-200 hover:text-white">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465.668.252 1.22.6 1.772 1.153a4.974 4.974 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.214c0 2.717-.012 3.056-.06 4.122-.049 1.064-.218 1.791-.465 2.427a4.971 4.971 0 01-1.153 1.772 4.973 4.973 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.214c-2.717 0-3.056-.012-4.122-.06-1.064-.049-1.791-.218-2.427-.465a4.973 4.973 0 01-1.772-1.153 4.971 4.971 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.214c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.971 4.971 0 011.153-1.772A4.973 4.973 0 015.45 3.525c.636-.247 1.363-.416 2.427-.465C8.901 3.013 9.256 3 11.685 3h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.802.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                </svg>
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-indigo-200 hover:text-white transition duration-150">
                  {t('common.home')}
                </Link>
              </li>
              <li>
                <Link to="/buy" className="text-indigo-200 hover:text-white transition duration-150">
                  {t('common.buy')}
                </Link>
              </li>
              <li>
                <Link to="/sell" className="text-indigo-200 hover:text-white transition duration-150">
                  {t('common.sell')}
                </Link>
              </li>
              <li>
                <Link to="/fundraiser" className="text-indigo-200 hover:text-white transition duration-150">
                  {t('common.fundraiser')}
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h3 className="text-lg font-bold mb-4">{t('footer.resources')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-indigo-200 hover:text-white transition duration-150">
                  {t('footer.aboutUs')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-indigo-200 hover:text-white transition duration-150">
                  {t('footer.contactUs')}
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-indigo-200 hover:text-white transition duration-150">
                  {t('footer.faq')}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-indigo-200 hover:text-white transition duration-150">
                  {t('footer.privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-indigo-200 hover:text-white transition duration-150">
                  {t('footer.termsOfService')}
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">{t('footer.contact')}</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span className="text-indigo-200">
                  123 Military Drive, Kyiv, 01001, Ukraine
                </span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <span className="text-indigo-200">
                  support@militex.com
                </span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                <span className="text-indigo-200">
                  +380 44 123 4567
                </span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-indigo-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-indigo-300 text-sm mb-4 md:mb-0">
            &copy; {currentYear} MILITEX. {t('footer.allRightsReserved')}
          </p>
          
          <div className="flex space-x-4">
            <Link to="/privacy" className="text-indigo-300 text-sm hover:text-white transition duration-150">
              {t('footer.privacyPolicy')}
            </Link>
            <Link to="/terms" className="text-indigo-300 text-sm hover:text-white transition duration-150">
              {t('footer.termsOfService')}
            </Link>
            <Link to="/cookies" className="text-indigo-300 text-sm hover:text-white transition duration-150">
              {t('footer.cookiePolicy')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
