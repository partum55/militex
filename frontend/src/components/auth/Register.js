import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthService from '../../services/auth.service';

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    password: '',
    confirmPassword: '',
    is_military: false
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const nextStep = (e) => {
    e.preventDefault();
    setStep(2);
  };
  
  const prevStep = () => {
    setStep(1);
  };
  
  const validateStep1 = () => {
    // Add validation for step 1 fields
    if (!formData.first_name || !formData.last_name || !formData.email) {
      setError(t('auth.fillAllRequiredFields'));
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError(t('auth.invalidEmail'));
      return false;
    }
    
    setError('');
    return true;
  };
  
  const validateStep2 = () => {
    // Add validation for step 2 fields
    if (!formData.username || !formData.password || !formData.confirmPassword) {
      setError(t('auth.fillAllRequiredFields'));
      return false;
    }
    
    // Password validation
    if (formData.password.length < 8) {
      setError(t('auth.passwordTooShort'));
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordsDoNotMatch'));
      return false;
    }
    
    setError('');
    return true;
  };
  
  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateStep2()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const { confirmPassword, ...userData } = formData;
      await AuthService.register(userData);
      
      // Login the user after successful registration
      await AuthService.login(formData.username, formData.password);
      
      // Get current user data
      await AuthService.getCurrentUser();
      
      // Redirect to homepage
      navigate('/');
    } catch (error) {
      let errorMessage = t('auth.registrationFailed');
      
      if (error.response?.data) {
        // Format Django REST framework validation errors
        const errors = error.response.data;
        const errorKeys = Object.keys(errors);
        
        if (errorKeys.length > 0) {
          const firstError = errors[errorKeys[0]];
          errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-full md:w-1/2 bg-cover bg-center" 
           style={{ backgroundImage: "url('/images/military-vehicle.jpg')" }}>
      </div>
      
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-indigo-900 mb-8">{t('common.signUp')}</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {step === 1 ? (
            <form onSubmit={nextStep}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="first_name">
                  {t('auth.name')} *
                </label>
                <input
                  id="first_name"
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="last_name">
                  {t('auth.surname')} *
                </label>
                <input
                  id="last_name"
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="email">
                  {t('auth.email')} *
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 mb-2" htmlFor="phone_number">
                  {t('auth.phoneNumber')}
                </label>
                <input
                  id="phone_number"
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-indigo-900 text-white py-2 rounded-lg hover:bg-indigo-800 transition duration-200"
                onClick={() => validateStep1()}
              >
                {t('common.next')} →
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="username">
                  {t('auth.username')} *
                </label>
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="password">
                  {t('auth.password')} *
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  {t('auth.passwordRequirements')}
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="confirmPassword">
                  {t('auth.confirmPassword')} *
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div className="mb-6 flex items-center">
                <input
                  id="is_military"
                  type="checkbox"
                  name="is_military"
                  checked={formData.is_military}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label className="text-gray-700" htmlFor="is_military">
                  {t('auth.iAmMilitary')}
                </label>
              </div>
              
              <div className="flex mb-6">
                <button
                  type="button"
                  onClick={prevStep}
                  className="w-1/2 mr-2 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 transition duration-200"
                >
                  ← {t('common.back')}
                </button>
                <button
                  type="submit"
                  className="w-1/2 ml-2 bg-indigo-900 text-white py-2 rounded-lg hover:bg-indigo-800 transition duration-200"
                  disabled={loading}
                >
                  {loading ? t('auth.registering') : t('common.signUp')}
                </button>
              </div>
            </form>
          )}
          
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              {t('auth.alreadyAccount')}? <Link to="/login" className="text-indigo-600 hover:underline">{t('common.signIn')}</Link>
            </p>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">{t('auth.or')}</p>
            
            <div className="flex justify-center space-x-4">
              <button
                className="p-2 rounded-full border hover:bg-gray-100"
                onClick={() => alert('Google OAuth not implemented')}
              >
                <img src="/images/google-icon.svg" alt="Google" className="w-6 h-6" />
              </button>
              
              <button
                className="p-2 rounded-full border hover:bg-gray-100"
                onClick={() => alert('Apple OAuth not implemented')}
              >
                <img src="/images/apple-icon.svg" alt="Apple" className="w-6 h-6" />
              </button>
              
              <button
                className="p-2 rounded-full border hover:bg-gray-100"
                onClick={() => alert('Facebook OAuth not implemented')}
              >
                <img src="/images/facebook-icon.svg" alt="Facebook" className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
