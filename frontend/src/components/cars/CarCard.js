import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '../../utils/helpers';

const CarCard = ({ car }) => {
  const { t } = useTranslation();
  const [imageSrc, setImageSrc] = useState(null);

  // Load image only once when component mounts
  useEffect(() => {
    // Function to get the primary image or use a placeholder
    const loadPrimaryImage = () => {
      if (car.images && car.images.length > 0) {
        const primaryImage = car.images.find(img => img.is_primary);
        return getImageUrl(primaryImage ? primaryImage.image : car.images[0].image);
      }
      return '/images/car-placeholder.jpg'; // Fallback image
    };

    setImageSrc(loadPrimaryImage());
  }, [car.id]); // Only re-run if car.id changes

  // Handle missing car data gracefully
  if (!car || !car.id) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 h-48 flex items-center justify-center">
        <p className="text-gray-500">{t('errors.missingCarData')}</p>
      </div>
    );
  }

  // Handle price and mileage formatting
  const priceFormatted = typeof car.price === 'number'
    ? car.price.toLocaleString()
    : Number(car.price).toLocaleString() || 'N/A';

  const mileageFormatted = typeof car.mileage === 'number'
    ? car.mileage.toLocaleString()
    : Number(car.mileage).toLocaleString() || 'N/A';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg">
      <Link to={`/cars/${car.id}`} className="flex flex-col md:flex-row">
        {/* Car Image */}
        <div className="md:w-1/3">
          {imageSrc && (
            <img
              src={imageSrc}
              alt={`${car.year} ${car.make} ${car.model}`}
              className="w-full h-48 md:h-full object-cover"
              onError={(e) => {
                e.target.onerror = null; // Prevent infinite loop
                e.target.src = '/images/car-placeholder.jpg';
              }}
            />
          )}
        </div>

        {/* Car Details */}
        <div className="p-4 md:w-2/3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {car.make} {car.model} {car.year}
              </h3>
              <p className="text-gray-600">
                {mileageFormatted} {t('cars.mileage')}
              </p>
            </div>
            <div className="text-2xl font-bold text-indigo-900">
              ${priceFormatted}
            </div>
          </div>

          {/* Car Specs */}
          <div className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
            <div>
              <span className="text-gray-500">{t('cars.fuelType')}:</span>{' '}
              <span className="font-medium">{car.fuel_type || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-500">{t('cars.transmission')}:</span>{' '}
              <span className="font-medium">{car.transmission || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-500">{t('cars.condition')}:</span>{' '}
              <span className="font-medium">{car.condition || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-500">{t('cars.vehicleType')}:</span>{' '}
              <span className="font-medium">{car.vehicle_type || 'N/A'}</span>
            </div>
          </div>

          {/* Car Description (truncated) */}
          <p className="mt-3 text-gray-600 line-clamp-2">
            {car.description ? car.description : t('cars.noDescription')}
          </p>

          {/* Location and Seller */}
          <div className="mt-3 flex justify-between text-sm">
            <div className="text-gray-500">
              {car.city || 'N/A'}, {car.country || 'N/A'}
            </div>
            <div className="text-indigo-600">
              {t('common.viewDetails')}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default CarCard;