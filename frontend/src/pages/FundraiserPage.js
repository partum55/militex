import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import FundraiserService from '../services/fundraiser.service';
import FundraiserCard from '../components/fundraiser/FundraiserCard';
import DonationModal from '../components/fundraiser/DonationModal';
import NewFundraiserModal from '../components/fundraiser/NewFundraiserModal';

const FundraiserPage = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [fundraisers, setFundraisers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFundraiser, setSelectedFundraiser] = useState(null);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showNewFundraiserModal, setShowNewFundraiserModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchFundraisers = async () => {
      try {
        setLoading(true);
        const response = await FundraiserService.getAllFundraisers();
        setFundraisers(response.results || []);
      } catch (error) {
        setError('Failed to load fundraisers. Please try again later.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchFundraisers();
  }, []);

  const handleDonate = (fundraiser) => {
    setSelectedFundraiser(fundraiser);
    setShowDonationModal(true);
  };

  const handleDonationSubmit = async (donationData) => {
    try {
      await FundraiserService.donate(selectedFundraiser.id, donationData);

      const response = await FundraiserService.getAllFundraisers();
      setFundraisers(response.results || []);

      setShowDonationModal(false);
      setSelectedFundraiser(null);

      setSuccessMessage(t('fundraiser.donationSuccess'));
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error(error);
      setError(t('fundraiser.donationError'));
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleNewFundraiserSubmit = async (fundraiserData) => {
    try {
      await FundraiserService.createFundraiser(fundraiserData);

      const response = await FundraiserService.getAllFundraisers();
      setFundraisers(response.results || []);

      setShowNewFundraiserModal(false);

      setSuccessMessage(t('fundraiser.createSuccess'));
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error(error);
      setError(t('fundraiser.createError'));
      setTimeout(() => setError(''), 5000);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-indigo-900 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('fundraiser.title')}</h1>
          <p className="text-xl text-indigo-200 max-w-2xl mx-auto mb-8">
            {t('fundraiser.subtitle')}
          </p>

          {isAuthenticated && (
            <button
              onClick={() => setShowNewFundraiserModal(true)}
              className="bg-white text-indigo-900 px-6 py-3 rounded-lg font-bold hover:bg-indigo-50 transition duration-300"
            >
              {t('fundraiser.startFundraiser')}
            </button>
          )}
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-900"></div>
          </div>
        ) : fundraisers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">{t('fundraiser.noFundraisers')}</p>
            {isAuthenticated && (
              <button
                onClick={() => setShowNewFundraiserModal(true)}
                className="bg-indigo-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-800 transition duration-300"
              >
                {t('fundraiser.startFundraiser')}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {fundraisers.map((fundraiser) => (
              <FundraiserCard
                key={fundraiser.id}
                fundraiser={fundraiser}
                onDonate={() => handleDonate(fundraiser)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Donation Modal */}
      {showDonationModal && selectedFundraiser && (
        <DonationModal
          fundraiser={selectedFundraiser}
          onClose={() => {
            setShowDonationModal(false);
            setSelectedFundraiser(null);
          }}
          onSubmit={handleDonationSubmit}
          isAuthenticated={isAuthenticated}
        />
      )}

      {/* New Fundraiser Modal */}
      {showNewFundraiserModal && (
        <NewFundraiserModal
          onClose={() => setShowNewFundraiserModal(false)}
          onSubmit={handleNewFundraiserSubmit}
        />
      )}
    </div>
  );
};

export default FundraiserPage;
