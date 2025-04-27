import React from 'react';
import { useTranslation } from 'react-i18next';

const FundraiserCard = ({ fundraiser, onDonate }) => {
  const { t } = useTranslation();

  // Format currency display
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col transition hover:shadow-lg">
      {/* Fundraiser Image */}
      <div className="h-40 sm:h-48 bg-gray-200 relative">
        {fundraiser.image ? (
          <img
            src={fundraiser.image}
            alt={fundraiser.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-indigo-100">
            <span className="text-indigo-300 text-3xl font-bold">MILITEX</span>
          </div>
        )}
        {/* Progress Indicator Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 sm:p-2 flex justify-between">
          <span className="font-medium">{fundraiser.progress_percentage}%</span>
          <span>{formatCurrency(fundraiser.current_amount)} / {formatCurrency(fundraiser.target_amount)}</span>
        </div>
      </div>

      {/* Fundraiser Content */}
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-lg font-bold text-indigo-900 mb-2 line-clamp-2">{fundraiser.title}</h3>

        <div className="flex items-center text-xs text-gray-500 mb-3">
          <span>
            {t('fundraiser.by')} {fundraiser.created_by_username}
          </span>
          <span className="mx-2">•</span>
          <span>
            {new Date(fundraiser.created_at).toLocaleDateString()}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-900 h-2 rounded-full"
              style={{ width: `${fundraiser.progress_percentage}%` }}
            ></div>
          </div>
        </div>

        {/* Description (truncated) */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
          {fundraiser.description}
        </p>

        {/* Donate Button */}
        <button
          onClick={() => onDonate(fundraiser)}
          className="w-full bg-indigo-900 text-white py-2 rounded-lg hover:bg-indigo-800 transition duration-200 text-sm"
        >
          {t('fundraiser.donate')}
        </button>
      </div>
    </div>
  );
};

export default FundraiserCard;