import React from 'react';
import { useTranslation } from 'react-i18next';
import CarList from '../components/cars/CarList';

const BuyPage = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-indigo-900 text-white py-12">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl font-bold">{t('common.buy')}</h1>
          <p className="mt-2 text-indigo-200">
            {t('buy.findYourPerfectVehicle')}
          </p>
        </div>
      </div>

      {/* CarList component now includes filters */}
      <CarList />
    </div>
  );
};

export default BuyPage;
