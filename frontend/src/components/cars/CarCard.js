import React, { useState, useEffect, useRef, memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Create a placeholder image data URL to avoid network requests
const PLACEHOLDER_IMAGE_DATA = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNMTAwIDUwQzEwNy45NTYgNTAgMTE0LjYyIDQ1LjQ2MyAxMTQuNjIgMzguMzIxQzExMy40NDkgMzEuMzc4IDEwNy45NTYgMjUgMTAwIDI1QzkyLjA0MzkgMjUgODUuMzc5OSAzMS4zNzggODUuMzc5OSAzOC4zMjFDODUuMzc5OSA0NS40NjMgOTIuMDQzOSA1MCAxMDAgNTBaIiBmaWxsPSIjQTNBM0EzIi8+PHBhdGggZD0iTTEzNS40NDkgMTA1SDY0LjU1MDVDNjQuNTUwNSAxMDUuMDAyIDY0LjU1MDUgMTA1LjAwNSA2NC41NTA1IDEwNS4wMDhDNjQuNTUwNSA5My4wOTcgODAuMzczOCA4My4zNzUgMTAwIDgzLjM3NUMxMTkuNjI2IDgzLjM3NSAxMzUuNDQ5IDkzLjA5NyAxMzUuNDQ5IDEwNS4wMDhDMTM1LjQ0OSAxMDUuMDA1IDEzNS40NDkgMTA1LjAwMiAxMzUuNDQ5IDEwNVoiIGZpbGw9IiNBM0EzQTMiLz48dGV4dCB4PSIxMDAiIHk9IjEzNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNzE3MTcxIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';

// This component will only render once for each image and won't re-render unless props actually change
const OptimizedImage = memo(({ src, alt, className, onError }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [hasError, setHasError] = useState(false);
  const imageLoaded = useRef(false);

  useEffect(() => {
    // Skip if we've already loaded this image
    if (imageLoaded.current) {
      return;
    }

    // Skip if src is empty or null
    if (!src) {
      setImageSrc(PLACEHOLDER_IMAGE_DATA);
      return;
    }

    // Load the image
    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      imageLoaded.current = true;
    };
    img.onerror = () => {
      setImageSrc(PLACEHOLDER_IMAGE_DATA);
      setHasError(true);
      if (onError) onError();
    };
    img.src = src;

    // Set initial value to placeholder while loading
    setImageSrc(PLACEHOLDER_IMAGE_DATA);

    // Cleanup
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, onError]);

  return <img src={imageSrc} alt={alt} className={className} />;
});

// Main car card component
const CarCard = ({ car }) => {
  const { t } = useTranslation();

  // Handle missing car data gracefully
  if (!car || !car.id) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 h-48 flex items-center justify-center">
        <p className="text-gray-500">{t('errors.missingCarData')}</p>
      </div>
    );
  }

  // Get primary image URL
  const getPrimaryImageUrl = () => {
    if (car.images && car.images.length > 0) {
      const primaryImage = car.images.find(img => img.is_primary);
      return primaryImage ? primaryImage.image : car.images[0].image;
    }
    return null;
  };

  // Handle price and mileage formatting
  const priceFormatted = typeof car.price === 'number'
    ? car.price.toLocaleString()
    : Number(car.price).toLocaleString() || 'N/A';

  const mileageFormatted = typeof car.mileage === 'number'
    ? car.mileage.toLocaleString()
    : Number(car.mileage).toLocaleString() || 'N/A';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
      <Link to={`/cars/${car.id}`} className="block">
        {/* Car Image - Using the optimized image component */}
        <div className="relative">
          <OptimizedImage
            src={getPrimaryImageUrl()}
            alt={`${car.year} ${car.make} ${car.model}`}
            className="w-full h-48 object-cover"
          />
          {/* Price overlay for mobile */}
          <div className="md:hidden absolute bottom-0 right-0 bg-indigo-900 text-white px-3 py-1 rounded-tl-lg font-bold">
            ${priceFormatted}
          </div>
        </div>

        {/* Car Details */}
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                {car.make} {car.model} {car.year}
              </h3>
              <p className="text-gray-600 text-sm">
                {mileageFormatted} {t('cars.mileage')}
              </p>
            </div>
            {/* Price for desktop */}
            <div className="hidden md:block text-xl font-bold text-indigo-900">
              ${priceFormatted}
            </div>
          </div>

          {/* Car Specs */}
          <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
            <div className="truncate">
              <span className="text-gray-500">{t('cars.fuelType')}:</span>{' '}
              <span className="font-medium">{car.fuel_type || 'N/A'}</span>
            </div>
            <div className="truncate">
              <span className="text-gray-500">{t('cars.transmission')}:</span>{' '}
              <span className="font-medium">{car.transmission || 'N/A'}</span>
            </div>
            <div className="truncate">
              <span className="text-gray-500">{t('cars.condition')}:</span>{' '}
              <span className="font-medium">{car.condition || 'N/A'}</span>
            </div>
            <div className="truncate">
              <span className="text-gray-500">{t('cars.vehicleType')}:</span>{' '}
              <span className="font-medium">{car.vehicle_type || 'N/A'}</span>
            </div>
          </div>

          {/* Bottom section with location and view details */}
          <div className="mt-3 flex justify-between items-center text-sm">
            <div className="text-gray-500 truncate max-w-[70%]">
              {car.city || 'N/A'}, {car.country || 'N/A'}
            </div>
            <div className="text-indigo-600 font-medium">
              {t('common.viewDetails')}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default memo(CarCard);