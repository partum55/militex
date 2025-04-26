import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CarService from '../services/car.service';

const HomePage = () => {
  const { t } = useTranslation();
  const [featuredCars, setFeaturedCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedCars = async () => {
      try {
        setLoading(true);
        const response = await CarService.getAllCars({
          limit: 6,
          ordering: '-created_at'
        });
        setFeaturedCars(response.results || []);
      } catch (error) {
        console.error('Error fetching featured cars:', error);
        setError('Failed to load featured vehicles');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCars();
  }, []);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-indigo-900 text-white">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/static/images/military-vehicle-hero.jpg')",
            backgroundBlendMode: "overlay",
            backgroundColor: "rgba(49, 46, 129, 0.7)"
          }}
        ></div>

        <div className="container mx-auto px-6 py-24 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {t('home.welcome')} <span className="text-indigo-200">MILITEX</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              {t('home.tagline')}
            </p>
            <Link
              to="/buy"
              className="bg-white text-indigo-900 px-8 py-4 rounded-lg font-bold text-lg inline-block hover:bg-indigo-50 transition duration-300"
            >
              {t('home.browseBtn')}
            </Link>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold text-indigo-900 mb-4">
              {t('home.mission')}
            </h2>
            <p className="text-lg text-gray-700 mb-4">
              {t('home.missionText')}
            </p>
          </div>
          <div className="md:w-1/2">
            <img
              src="/static/images/military-humvee.jpg"
              alt="Military Humvee"
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-indigo-900 mb-12">
            <span className="text-indigo-900">{t('home.simple')}</span> •
            <span className="text-indigo-900"> {t('home.transparent')}</span> •
            <span className="text-indigo-900"> {t('home.tailored')}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-indigo-900 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">1</div>
              <h3 className="text-xl font-bold text-indigo-900 mb-2">{t('home.step1')}</h3>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-indigo-900 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">2</div>
              <h3 className="text-xl font-bold text-indigo-900 mb-2">{t('home.step2')}</h3>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-indigo-900 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">3</div>
              <h3 className="text-xl font-bold text-indigo-900 mb-2">{t('home.step3')}</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cars Section */}
      <section className="py-16 container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-indigo-900 mb-12">
          {t('home.featuredVehicles')}
        </h2>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-900"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600">
            {error}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredCars.map(car => (
                <div key={car.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-48 bg-gray-300">
                    {car.images && car.images.length > 0 ? (
                      <img
                        src={car.images[0].image}
                        alt={`${car.year} ${car.make} ${car.model}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src="/static/images/car-placeholder.jpg"
                        alt="Car placeholder"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-indigo-900">
                      {car.year} {car.make} {car.model}
                    </h3>
                    <p className="text-gray-600">{car.mileage.toLocaleString()} {t('cars.mileage')}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-xl font-bold text-indigo-900">${car.price.toLocaleString()}</span>
                      <Link
                        to={`/cars/${car.id}`}
                        className="text-indigo-600 hover:underline"
                      >
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
          </>
        )}
      </section>
    </div>
  );
};

export default HomePage;
