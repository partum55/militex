import React, { useState, useEffect, useRef, memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const PLACEHOLDER_IMAGE_DATA = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNMTAwIDUwQzEwNy45NTYgNTAgMTE0LjYyIDQ1LjQ2MyAxMTQuNjIgMzguMzIxQzExMy40NDkgMzEuMzc4IDEwNy45NTYgMjUgMTAwIDI1QzkyLjA0MzkgMjUgODUuMzc5OSAzMS4zNzggODUuMzc5OSAzOC4zMjFDODUuMzc5OSA0NS40NjMgOTIuMDQzOSA1MCAxMDAgNTBaIiBmaWxsPSIjQTNBM0EzIi8+PHBhdGggZD0iTTEzNS40NDkgMTA1SDY0LjU1MDVDNjQuNTUwNSAxMDUuMDAyIDY0LjU1MDUgMTA1LjAwNSA2NC41NTA1IDEwNS4wMDhDNjQuNTUwNSA5My4wOTcgODAuMzczOCA4My4zNzUgMTAwIDgzLjM3NUMxMTkuNjI2IDgzLjM3NSAxMzUuNDQ5IDkzLjA5NyAxMzUuNDQ5IDEwNS4wMDhDMTM1LjQ0OSAxMDUuMDA1IDEzNS40NDkgMTA1LjAwMiAxMzUuNDQ5IDEwNVoiIGZpbGw9IiNBM0EzQTMiLz48dGV4dCB4PSIxMDAiIHk9IjEzNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNzE3MTcxIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';

const OptimizedImage = memo(({ src, alt, className, onError }) => {
  const [imageSrc, setImageSrc] = useState(PLACEHOLDER_IMAGE_DATA);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!src) {
      setHasError(true);
      setImageSrc(PLACEHOLDER_IMAGE_DATA);
      return;
    }

    setHasError(false);
    setImageSrc(PLACEHOLDER_IMAGE_DATA); // Show placeholder while loading

    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
    };
    img.onerror = () => {
      setImageSrc(PLACEHOLDER_IMAGE_DATA);
      setHasError(true);
      if (onError) onError();
    };
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, onError]);

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={(e) => {
        e.currentTarget.src = PLACEHOLDER_IMAGE_DATA;
      }}
    />
  );
});
const CarCard = ({ car }) => {
  const { t } = useTranslation();

  if (!car || !car.id) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 h-48 flex items-center justify-center">
        <p className="text-gray-500">{t('errors.missingCarData')}</p>
      </div>
    );
  }
  const BASE_IMAGE_URL = 'http://127.0.0.1:8000'; 
  const getPrimaryImageUrl = () => {
    if (car.images && car.images.length > 0) {
      const primaryImage = car.images.find(img => img.is_primary);
      const imagePath = primaryImage ? primaryImage.image : car.images[0].image;
  
      if (!imagePath) return null;
  
      if (imagePath.startsWith('http')) {
        return imagePath;
      }
  
      // Додаємо слеш, якщо його нема
      const normalizedPath = imagePath.startsWith('/')
        ? imagePath
        : `/${imagePath}`;
  
      return `${BASE_IMAGE_URL}${normalizedPath}`;
    }
    return null;
  };

  const priceFormatted = typeof car.price === 'number'
    ? car.price.toLocaleString()
    : Number(car.price).toLocaleString() || 'N/A';

  const mileageFormatted = typeof car.mileage === 'number'
    ? car.mileage.toLocaleString()
    : Number(car.mileage).toLocaleString() || 'N/A';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg">
      <Link to={`/cars/${car.id}`} className="flex flex-col md:flex-row">
        {/* Car Image - Using the optimized image component */}
        <div className="md:w-1/3">
          <OptimizedImage
            src={getPrimaryImageUrl()}
            alt={`${car.year} ${car.make} ${car.model}`}
            className="w-full h-48 md:h-full object-cover"
          />
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

export default memo(CarCard);
