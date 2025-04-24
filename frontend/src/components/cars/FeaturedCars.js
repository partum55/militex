import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CarService from '../../services/car.service';

const FeaturedCars = () => {
  const { t } = useTranslation();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedCars = async () => {
      try {
        setLoading(true);
        const featuredCars = await CarService.getFeaturedCars(3);
        setCars(featuredCars);
      } catch (err) {
        console.error('Error fetching featured cars:', err);
        setError('Failed to load featured vehicles');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCars();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="loader mx-auto"></div>
        <p className="mt-4 text-gray-600">{t('common.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (cars.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">{t('cars.noFeaturedCarsAvailable')}</p>
      </div>
    );
  }

  const getCarImage = (car) => {
    if (car.images && car.images.length > 0) {
      const primaryImage = car.images.find(img => img.is_primary);
      return primaryImage ? primaryImage.image : car.images[0].image;
    }
    return '/images/car-placeholder.jpg';
  };

  return (
    <section className="py-16 container mx-auto px-6">
      <h2 className="text-3xl font-bold text-center text-indigo-900 mb-12">
        {t('home.featuredVehicles')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {cars.map((car) => (
          <div key={car.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gray-300">
              <img
                src={getCarImage(car)}
                alt={`${car.make} ${car.model}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold text-indigo-900">
                {car.year} {car.make} {car.model}
              </h3>
              <p className="text-gray-600">{car.mileage.toLocaleString()} {t('cars.mileage')}</p>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-xl font-bold text-indigo-900">${car.price.toLocaleString()}</span>
                <Link to={`/cars/${car.id}`} className="text-indigo-600 hover:underline">
                  {t('common.viewDetails')}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <Link
          to="/buy"
          className="bg-indigo-900 text-white px-6 py-3 rounded-lg inline-block font-bold hover:bg-indigo-800 transition duration-300"
        >
          {t('home.viewAllListings')}
        </Link>
      </div>
    </section>
  );
};

export default FeaturedCars;
