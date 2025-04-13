// frontend/src/pages/HomePage.js

import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const HomePage = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-indigo-900 text-white">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ 
            backgroundImage: "url('/images/military-vehicle-hero.jpg')",
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
              src="/images/military-humvee.jpg" 
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

      {/* CTA Section */}
      <section className="py-16 bg-indigo-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8">{t('home.builtForHeroes')}</h2>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <Link 
              to="/buy" 
              className="bg-white text-indigo-900 px-6 py-3 rounded-lg font-bold hover:bg-indigo-50 transition duration-300"
            >
              {t('common.buy')}
            </Link>
            <Link 
              to="/sell" 
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-bold hover:bg-white hover:text-indigo-900 transition duration-300"
            >
              {t('common.sell')}
            </Link>
            <Link 
              to="/fundraiser" 
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-bold hover:bg-white hover:text-indigo-900 transition duration-300"
            >
              {t('common.fundraiser')}
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Cars Section */}
      <section className="py-16 container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-indigo-900 mb-12">
          {t('home.featuredVehicles')}
        </h2>
        
        {/* This would be dynamically loaded from your API */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Placeholder card for design */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gray-300">
              <img 
                src="/images/jeep-placeholder.jpg" 
                alt="Jeep" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold text-indigo-900">Jeep Wrangler 2019</h3>
              <p className="text-gray-600">35,000 {t('cars.mileage')}</p>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-xl font-bold text-indigo-900">$28,500</span>
                <Link 
                  to="/buy" 
                  className="text-indigo-600 hover:underline"
                >
                  {t('common.viewDetails')}
                </Link>
              </div>
            </div>
          </div>
          
          {/* Repeat card pattern for the other 2 slots */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gray-300">
              <img 
                src="/images/truck-placeholder.jpg" 
                alt="Truck" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold text-indigo-900">Ford F-150 2020</h3>
              <p className="text-gray-600">28,000 {t('cars.mileage')}</p>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-xl font-bold text-indigo-900">$32,900</span>
                <Link 
                  to="/buy" 
                  className="text-indigo-600 hover:underline"
                >
                  {t('common.viewDetails')}
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gray-300">
              <img 
                src="/images/hummer-placeholder.jpg" 
                alt="Hummer" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold text-indigo-900">Hummer H1 2006</h3>
              <p className="text-gray-600">45,000 {t('cars.mileage')}</p>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-xl font-bold text-indigo-900">$64,500</span>
                <Link 
                  to="/buy" 
                  className="text-indigo-600 hover:underline"
                >
                  {t('common.viewDetails')}
                </Link>
              </div>
            </div>
          </div>
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
    </div>
  );
};

export default HomePage;
