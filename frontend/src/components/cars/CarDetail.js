import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const CarDetail = ({ car, onContactSeller }) => {
  const { t } = useTranslation();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!car) return null;

  const handleImageClick = (index) => {
    setActiveImageIndex(index);
  };

  const handleContactSellerClick = () => {
    // If this is an imported car with an original URL, open the original listing
    if (car.is_imported && car.original_url) {
      window.open(car.original_url, '_blank');
    } else {
      // Otherwise use the regular contact seller functionality
      onContactSeller(car);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Image Gallery */}
      <div className="relative">
        {car.images && car.images.length > 0 ? (
          <>
            <div className="h-96">
              <img
                src={car.images[activeImageIndex].image}
                alt={`${car.year} ${car.make} ${car.model}`}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Thumbnails */}
            {car.images.length > 1 && (
              <div className="flex mt-2 overflow-x-auto">
                {car.images.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleImageClick(idx)}
                    className={`w-20 h-16 mr-2 cursor-pointer ${activeImageIndex === idx ? 'ring-2 ring-indigo-900' : ''}`}
                  >
                    <img
                      src={img.image}
                      alt={`${car.make} ${car.model} thumbnail ${idx}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="h-96 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">{t('cars.noImages')}</span>
          </div>
        )}
      </div>

      {/* Car Details */}
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-bold text-indigo-900">
            {car.year} {car.make} {car.model}
          </h2>
          <div className="text-2xl font-bold text-indigo-900">
            ${car.price.toLocaleString()}
            {car.negotiable && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({t('cars.negotiable')})
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-y-2">
          <div><span className="text-gray-600">{t('cars.mileage')}:</span> {car.mileage.toLocaleString()} km</div>
          <div><span className="text-gray-600">{t('cars.condition')}:</span> {car.condition}</div>
          <div><span className="text-gray-600">{t('cars.fuelType')}:</span> {car.fuel_type}</div>
          <div><span className="text-gray-600">{t('cars.transmission')}:</span> {car.transmission}</div>
          <div><span className="text-gray-600">{t('cars.location')}:</span> {car.city}, {car.country}</div>
          <div><span className="text-gray-600">{t('cars.vehicleType')}:</span> {car.vehicle_type}</div>
        </div>

        <div className="mt-6">
          <h3 className="font-bold text-lg mb-2">{t('cars.description')}</h3>
          <p className="text-gray-700">{car.description || t('cars.noDescription')}</p>
        </div>

        <button
          onClick={handleContactSellerClick}
          className="mt-6 w-full bg-indigo-900 text-white py-3 rounded-lg hover:bg-indigo-800 transition duration-200"
        >
          {car.is_imported && car.original_url ? t('cars.viewOriginalAd') : t('cars.contactSeller')}
        </button>
      </div>
    </div>
  );
};

export default CarDetail;