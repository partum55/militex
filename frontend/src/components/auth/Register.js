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
    is_military: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const nextStep = (e) => {
    e.preventDefault();
    if (!validateStep1()) return;
    setStep(2);
  };

  const prevStep = () => setStep(1);

  const validateStep1 = () => {
    if (!formData.first_name || !formData.last_name || !formData.email) {
      setError(t('auth.fillAllRequiredFields'));
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError(t('auth.invalidEmail'));
      return false;
    }

    setError('');
    return true;
  };

  const validateStep2 = () => {
    if (!formData.username || !formData.password || !formData.confirmPassword) {
      setError(t('auth.fillAllRequiredFields'));
      return false;
    }

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

    if (!validateStep2()) return;

    setLoading(true);
    setError('');

    try {
      // Extract data for registration (excluding confirmPassword)
      const { confirmPassword, ...userData } = formData;
      
      // Use AuthService for registration
      await AuthService.register(userData);
      
      // If registration successful, log the user in
      await AuthService.login(formData.username, formData.password);
      
      // Navigate to home page
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      
      // Format error message from API response if available
      if (err.response?.data) {
        const errorMessages = [];
        
        // Handle Django validation errors (can be nested objects)
        Object.entries(err.response.data).forEach(([field, message]) => {
          if (Array.isArray(message)) {
            errorMessages.push(`${field}: ${message.join(', ')}`);
          } else if (typeof message === 'string') {
            errorMessages.push(`${field}: ${message}`);
          } else if (typeof message === 'object') {
            // Handle nested error objects
            Object.entries(message).forEach(([nestedField, nestedMessage]) => {
              errorMessages.push(`${field}.${nestedField}: ${nestedMessage}`);
            });
          }
        });
        
        setError(errorMessages.join('\n') || t('auth.registrationFailed'));
      } else {
        setError(t('auth.registrationFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div 
        className="w-full md:w-1/2 bg-cover bg-center" 
        style={{ backgroundImage: "url('/images/military-vehicle.jpg')" }}
      ></div>
      
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-indigo-900 mb-8">{t('common.signUp')}</h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error.split('\n').map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={nextStep} className="space-y-4">
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="first_name">
                  {t('auth.name')} *
                </label>
                <input
                  type="text"
                  id="first_name"
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
                  type="text"
                  id="last_name"
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
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="phone_number">
                  {t('auth.phoneNumber')}
                </label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-indigo-900 text-white py-2 rounded-lg hover:bg-indigo-800 transition duration-200"
              >
                {t('common.next')} →
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="username">
                  {t('auth.username')} *
                </label>
                <input
                  type="text"
                  id="username"
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
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="confirmPassword">
                  {t('auth.confirmPassword')} *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  id="is_military"
                  name="is_military"
                  checked={formData.is_military}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label className="text-gray-700" htmlFor="is_military">
                  {t('auth.iAmMilitary')}
                </label>
              </div>
              
              <div className="flex justify-between gap-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="w-1/2 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 transition duration-200"
                >
                  ← {t('common.back')}
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-indigo-900 text-white py-2 rounded-lg hover:bg-indigo-800 transition duration-200"
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
        </div>
      </div>
    </div>
  );
};

export default Register;
