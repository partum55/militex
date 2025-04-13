import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const DonationModal = ({ fundraiser, onClose, onSubmit, isAuthenticated }) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [error, setError] = useState('');

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
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-indigo-900">
              {t('fundraiser.donateToFundraiser')}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <h3 className="font-bold text-lg mb-2">{fundraiser.title}</h3>

          {!isAuthenticated ? (
            <div className="bg-yellow-50 p-4 rounded-lg mb-6">
              <p className="text-yellow-700">
                {t('fundraiser.loginToDonate')}
              </p>
              <div className="mt-2">
                <Link
                  to="/login"
                  className="text-indigo-600 hover:underline mr-4"
                >
                  {t('common.signIn')}
                </Link>
                <Link
                  to="/register"
                  className="text-indigo-600 hover:underline"
                >
                  {t('common.signUp')}
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
                  {error}
                </div>
              )}

              {/* Amount Input */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="amount">
                  {t('fundraiser.donationAmount')} *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-700">
                    $
                  </span>
                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* Message Input */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="message">
                  {t('fundraiser.message')} ({t('common.optional')})
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              {/* Anonymous Option */}
              <div className="mb-6 flex items-center">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                  className="mr-2"
                />
                <label className="text-gray-700" htmlFor="anonymous">
                  {t('fundraiser.donateAnonymously')}
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="mr-2 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-900 text-white rounded-lg hover:bg-indigo-800 transition duration-200"
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
