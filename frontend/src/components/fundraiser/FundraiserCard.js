import React from 'react';
import { useTranslation } from 'react-i18next';

const FundraiserCard = ({ fundraiser, onDonate }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Fundraiser Image */}
      <div className="h-48 bg-gray-200">
        {fundraiser.image ? (
          <img
            src={fundraiser.image}
            alt={fundraiser.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-indigo-100">
            <span className="text-indigo-300 text-4xl font-bold">MILITEX</span>
          </div>
        )}
      </div>

      {/* Fundraiser Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-indigo-900 mb-2">{fundraiser.title}</h3>

        <div className="flex items-center text-sm text-gray-500 mb-4">
          <span>
            {t('fundraiser.by')} {fundraiser.created_by_username}
          </span>
          <span className="mx-2">•</span>
          <span>
            {new Date(fundraiser.created_at).toLocaleDateString()}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-indigo-900 h-2.5 rounded-full"
              style={{ width: `${fundraiser.progress_percentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className="font-medium">
              ${fundraiser.current_amount.toLocaleString()}
            </span>
            <span className="text-gray-500">
              {t('fundraiser.goalOf')} ${fundraiser.target_amount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Description (truncated) */}
        <p className="text-gray-600 mb-6 line-clamp-3">
          {fundraiser.description}
        </p>

        {/* Donate Button */}
        <button
          onClick={onDonate}
          className="w-full bg-indigo-900 text-white py-3 rounded-lg hover:bg-indigo-800 transition duration-200"
        >
          {t('fundraiser.donate')}
        </button>
      </div>
    </div>
  );
};

export default FundraiserCard;
