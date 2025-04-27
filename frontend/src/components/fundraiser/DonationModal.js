import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const DonationModal = ({ fundraiser, onClose, onSubmit, isAuthenticated }) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [error, setError] = useState('');
  const modalRef = useRef(null);
  const amountInputRef = useRef(null);

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Focus amount input on open
  useEffect(() => {
    if (amountInputRef.current) {
      amountInputRef.current.focus();
    }
  }, []);

  // Handle escape key to close
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError(t('fundraiser.invalidAmount'));
      return;
    }

    onSubmit({
      amount: parseFloat(amount),
      message,
      anonymous,
      fundraiser: fundraiser.id
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 px-4">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md animate-fadeIn"
      >
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-indigo-900">
              {t('fundraiser.donateToFundraiser')}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <h3 className="font-bold text-base sm:text-lg mb-3">{fundraiser.title}</h3>

          {/* Progress indicator */}
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-900 h-2 rounded-full"
                style={{ width: `${fundraiser.progress_percentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>${fundraiser.current_amount.toLocaleString()}</span>
              <span>{t('fundraiser.goalOf')} ${fundraiser.target_amount.toLocaleString()}</span>
            </div>
          </div>

          {!isAuthenticated ? (
            <div className="bg-yellow-50 p-4 rounded-lg mb-4">
              <p className="text-yellow-700 text-sm sm:text-base">
                {t('fundraiser.loginToDonate')}
              </p>
              <div className="mt-3 flex gap-3">
                <Link
                  to="/login"
                  className="text-indigo-600 hover:underline text-sm sm:text-base flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                  </svg>
                  {t('common.signIn')}
                </Link>
                <Link
                  to="/register"
                  className="text-indigo-600 hover:underline text-sm sm:text-base flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                  </svg>
                  {t('common.signUp')}
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm">
                  {error}
                </div>
              )}

              {/* Amount Input */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm sm:text-base" htmlFor="amount">
                  {t('fundraiser.donationAmount')} *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-600">
                    $
                  </span>
                  <input
                    type="number"
                    id="amount"
                    ref={amountInputRef}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[5, 10, 25, 50, 100].map(value => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setAmount(value.toString())}
                    className={`py-1 px-2 rounded border text-sm ${
                      parseFloat(amount) === value
                        ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                        : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    ${value}
                  </button>
                ))}
              </div>

              {/* Message Input */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm sm:text-base" htmlFor="message">
                  {t('fundraiser.message')} ({t('common.optional')})
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                ></textarea>
              </div>

              {/* Anonymous Option */}
              <div className="mb-5 flex items-center">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                  className="mr-2 h-4 w-4"
                />
                <label className="text-gray-700 text-sm sm:text-base" htmlFor="anonymous">
                  {t('fundraiser.donateAnonymously')}
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2 px-4 border rounded-lg text-gray-700 hover:bg-gray-100 text-sm sm:text-base order-2 sm:order-1"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-indigo-900 text-white rounded-lg hover:bg-indigo-800 transition duration-200 text-sm sm:text-base order-1 sm:order-2"
                >
                  {t('fundraiser.donate')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonationModal;