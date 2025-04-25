import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CarService from '../services/car.service';
import SellCarForm from '../components/cars/SellCarForm';

const CarEditPage = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [carData, setCarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCarData = async () => {
      try {
        setLoading(true);
        const data = await CarService.getCarById(id);

        setCarData({
          ...data,
          uploaded_images: []
        });
      } catch (err) {
        setError('Failed to load vehicle data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCarData();
  }, [id]);

  const handleUpdateSuccess = () => {
    navigate(`/cars/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error!</p>
          <p>{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="text-indigo-600 hover:underline mt-2 inline-block"
          >
            &larr; {t('common.back')}
          </button>
        </div>
      </div>
    );
  }

  if (!carData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p className="font-bold">Vehicle Not Found</p>
          <p>The vehicle you're trying to edit doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate(-1)}
            className="text-indigo-600 hover:underline mt-2 inline-block"
          >
            &larr; {t('common.back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-indigo-900 text-white py-12">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl font-bold">{t('cars.editVehicle')}</h1>
          <p className="mt-2 text-indigo-200">
            {carData.year} {carData.make} {carData.model}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <SellCarForm
          initialData={carData}
          isEditing={true}
          carId={id}
          onSuccess={handleUpdateSuccess}
        />
      </div>
    </div>
  );
};

export default CarEditPage;
