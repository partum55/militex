import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthService from '../../services/auth.service';
import CarService from '../../services/car.service';
import FundraiserService from '../../services/fundraiser.service';

const ProfilePage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState(null);
  const [userCars, setUserCars] = useState([]);
  const [userFundraisers, setUserFundraisers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        const userDataResponse = await AuthService.getCurrentUser();
        setUserData(userDataResponse);
        
        const carsResponse = await CarService.getMyListings();
        setUserCars(carsResponse.results || []);
        
        try {
          const fundraisersResponse = await FundraiserService.getMyFundraisers();
          setUserFundraisers(fundraisersResponse.results || []);
        } catch (err) {
          setUserFundraisers([]);
        }
        
      } catch (err) {
        setError('Failed to load profile data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleDeleteCar = async (carId) => {
    if (window.confirm(t('profile.confirmDeleteCar'))) {
      try {
        await CarService.deleteCar(carId);

        setUserCars(prevCars => prevCars.filter(car => car.id !== carId));
      } catch (err) {
        alert(t('profile.errorDeletingCar'));
        console.error(err);
      }
    }
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
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-indigo-900 text-white py-12">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl font-bold">{t('profile.myProfile')}</h1>
          {userData && (
            <p className="mt-2 text-indigo-200">
              {t('profile.welcome')}, {userData.first_name} {userData.last_name}
            </p>
          )}
        </div>
      </div>
      
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b">
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'profile'
                  ? 'border-b-2 border-indigo-900 text-indigo-900'
                  : 'text-gray-500 hover:text-indigo-900'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              {t('profile.personalInfo')}
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'cars'
                  ? 'border-b-2 border-indigo-900 text-indigo-900'
                  : 'text-gray-500 hover:text-indigo-900'
              }`}
              onClick={() => setActiveTab('cars')}
            >
              {t('profile.myVehicles')}
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'fundraisers'
                  ? 'border-b-2 border-indigo-900 text-indigo-900'
                  : 'text-gray-500 hover:text-indigo-900'
              }`}
              onClick={() => setActiveTab('fundraisers')}
            >
              {t('profile.myFundraisers')}
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && userData && (
              <div>
                <h2 className="text-xl font-bold text-indigo-900 mb-6">
                  {t('profile.personalInfo')}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {t('profile.contactInformation')}
                    </h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          {t('auth.username')}
                        </label>
                        <p className="mt-1 text-gray-900">{userData.username}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          {t('auth.name')}
                        </label>
                        <p className="mt-1 text-gray-900">{userData.first_name}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          {t('auth.surname')}
                        </label>
                        <p className="mt-1 text-gray-900">{userData.last_name}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          {t('auth.email')}
                        </label>
                        <p className="mt-1 text-gray-900">{userData.email}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          {t('auth.phoneNumber')}
                        </label>
                        <p className="mt-1 text-gray-900">
                          {userData.phone_number || t('profile.notProvided')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {t('profile.accountInformation')}
                    </h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          {t('profile.militaryStatus')}
                        </label>
                        <p className="mt-1 text-gray-900">
                          {userData.is_military ? t('profile.military') : t('profile.civilian')}
                        </p>
                      </div>
                      
                      {userData.is_military && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500">
                            {t('profile.verificationStatus')}
                          </label>
                          <p className="mt-1 text-gray-900">
                            {userData.is_verified ? (
                              <span className="text-green-600">{t('profile.verified')}</span>
                            ) : (
                              <span className="text-amber-600">{t('profile.notVerified')}</span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-6">
                      <Link
                        to="/profile/edit"
                        className="bg-indigo-900 text-white px-4 py-2 rounded-lg hover:bg-indigo-800 transition duration-200"
                      >
                        {t('profile.editProfile')}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* My Vehicles Tab */}
            {activeTab === 'cars' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-indigo-900">
                    {t('profile.myVehicles')}
                  </h2>
                  
                  <Link
                    to="/sell"
                    className="bg-indigo-900 text-white px-4 py-2 rounded-lg hover:bg-indigo-800 transition duration-200"
                  >
                    + {t('profile.addVehicle')}
                  </Link>
                </div>
                
                {userCars.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-4">{t('profile.noVehiclesListed')}</p>
                    <Link
                      to="/sell"
                      className="bg-indigo-900 text-white px-4 py-2 rounded-lg hover:bg-indigo-800 transition duration-200"
                    >
                      {t('profile.sellVehicle')}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userCars.map(car => {
                      // Get the primary image or use a placeholder
                      const carImage = car.images && car.images.length > 0
                        ? car.images[0].image
                        : '/images/car-placeholder.jpg';
                        
                      return (
                        <div key={car.id} className="flex flex-col md:flex-row bg-white border rounded-lg overflow-hidden">
                          <div className="md:w-1/4">
                            <img 
                              src={carImage} 
                              alt={`${car.year} ${car.make} ${car.model}`} 
                              className="w-full h-40 object-cover"
                            />
                          </div>
                          
                          <div className="p-4 md:w-3/4 flex flex-col">
                            <div className="flex justify-between items-start">
                              <h3 className="text-lg font-bold text-indigo-900">
                                {car.year} {car.make} {car.model}
                              </h3>
                              <span className="text-xl font-bold text-indigo-900">
                                ${car.price.toLocaleString()}
                              </span>
                            </div>
                            
                            <div className="mt-1 text-sm text-gray-600">
                              {car.mileage.toLocaleString()} km • {car.fuel_type} • {car.transmission}
                            </div>
                            
                            <div className="mt-2 text-sm">
                              <span className={`px-2 py-1 rounded-full ${
                                car.condition === 'new' ? 'bg-green-100 text-green-800' :
                                car.condition === 'used' ? 'bg-blue-100 text-blue-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {car.condition}
                              </span>
                            </div>
                            
                            <div className="mt-auto pt-4 flex justify-between items-center">
                              <div className="text-sm text-gray-500">
                                {t('profile.listedOn')}: {new Date(car.created_at).toLocaleDateString()}
                              </div>
                              
                              <div className="space-x-2">
                                <Link
                                  to={`/cars/${car.id}`}
                                  className="px-3 py-1 border border-indigo-900 text-indigo-900 rounded hover:bg-indigo-900 hover:text-white transition-colors duration-200"
                                >
                                  {t('common.view')}
                                </Link>
                                <Link
                                  to={`/cars/${car.id}/edit`}
                                  className="px-3 py-1 border border-indigo-900 text-indigo-900 rounded hover:bg-indigo-900 hover:text-white transition-colors duration-200"
                                >
                                  {t('common.edit')}
                                </Link>
                                <button
                                  onClick={() => handleDeleteCar(car.id)}
                                  className="px-3 py-1 border border-red-700 text-red-700 rounded hover:bg-red-700 hover:text-white transition-colors duration-200"
                                >
                                  {t('common.delete')}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            
            {/* My Fundraisers Tab */}
            {activeTab === 'fundraisers' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-indigo-900">
                    {t('profile.myFundraisers')}
                  </h2>
                  
                  <Link
                    to="/fundraiser"
                    className="bg-indigo-900 text-white px-4 py-2 rounded-lg hover:bg-indigo-800 transition duration-200"
                  >
                    + {t('profile.startFundraiser')}
                  </Link>
                </div>
                
                {userFundraisers.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-4">{t('profile.noFundraisers')}</p>
                    <Link
                      to="/fundraiser"
                      className="bg-indigo-900 text-white px-4 py-2 rounded-lg hover:bg-indigo-800 transition duration-200"
                    >
                      {t('profile.startFundraiser')}
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userFundraisers.map(fundraiser => (
                      <div key={fundraiser.id} className="bg-white border rounded-lg overflow-hidden">
                        <div className="h-40 bg-gray-200">
                          {fundraiser.image ? (
                            <img 
                              src={fundraiser.image} 
                              alt={fundraiser.title} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-indigo-100">
                              <span className="text-indigo-300 text-4xl font-bold">MILITEX</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4">
                          <h3 className="text-lg font-bold text-indigo-900 mb-2">
                            {fundraiser.title}
                          </h3>
                          
                          <div className="mb-4">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-indigo-900 h-2.5 rounded-full" 
                                style={{ width: `${fundraiser.progress_percentage}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between mt-2 text-sm">
                              <span className="font-medium">
                                ${fundraiser.current_amount.toLocaleString()}
                              </span>
                              <span className="text-gray-500">
                                {t('fundraiser.goalOf')} ${fundraiser.target_amount.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-500 mb-4">
                            {t('profile.startedOn')}: {new Date(fundraiser.created_at).toLocaleDateString()}
                          </div>
                          
                          <div className="flex justify-between">
                            <Link
                              to={`/fundraiser/${fundraiser.id}`}
                              className="px-3 py-1 border border-indigo-900 text-indigo-900 rounded hover:bg-indigo-900 hover:text-white transition-colors duration-200"
                            >
                              {t('common.view')}
                            </Link>
                            <button
                              className={`px-3 py-1 rounded ${
                                fundraiser.is_active
                                  ? 'border border-red-700 text-red-700 hover:bg-red-700 hover:text-white'
                                  : 'border border-green-700 text-green-700 hover:bg-green-700 hover:text-white'
                              } transition-colors duration-200`}
                            >
                              {fundraiser.is_active ? t('profile.deactivate') : t('profile.activate')}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
