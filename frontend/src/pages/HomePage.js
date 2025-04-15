import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FeaturedCars from '../components/cars/FeaturedCars';

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

      {/* Featured Cars Section - Now using dynamic data from API */}
      <FeaturedCars />
    </div>
  );
};

export default HomePage;
