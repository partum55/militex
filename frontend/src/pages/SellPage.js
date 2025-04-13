import React from 'react';
import { useTranslation } from 'react-i18next';
import SellCarForm from '../components/cars/SellCarForm';

const SellPage = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-indigo-900 mb-8">{t('cars.sellCar')}</h1>
      <SellCarForm />
    </div>
  );
};

export default SellPage;