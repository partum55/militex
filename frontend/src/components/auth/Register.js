import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthService from '../../services/auth.service';
import axios from 'axios';

// Helper function to get CSRF token
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

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
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [step, setStep] = useState(1);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear errors for this field when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const nextStep = (e) => {
    e.preventDefault();
    if (!validateStep1()) return;
    setStep(2);
    setGeneralError('');
    // Scroll to top on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setStep(1);
    setGeneralError('');
    // Scroll to top on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = t('auth.firstNameRequired');
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = t('auth.lastNameRequired');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('auth.emailRequired');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = t('auth.invalidEmail');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = t('auth.usernameRequired');
    }

    if (!formData.password) {
      newErrors.password = t('auth.passwordRequired');
    } else if (formData.password.length < 8) {
      newErrors.password = t('auth.passwordTooShort');
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.confirmPasswordRequired');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.passwordsDoNotMatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateStep2()) return;

    setLoading(true);
    setGeneralError('');
    setErrors({});

    try {
      // Extract data for registration (excluding confirmPassword)
      const { confirmPassword, ...userData } = formData;

      // Get CSRF token first
      await axios.get('/csrf/', { withCredentials: true });
      const csrftoken = getCookie('csrftoken');

      // Make registration request with CSRF token
      const response = await axios.post('/api/users/', userData, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken
        },
        withCredentials: true
      });

      console.log("Registration successful:", response.data);

      // If registration successful, log the user in
      try {
        await AuthService.login(formData.username, formData.password);

        // Navigate to home page
        navigate('/');
      } catch (loginError) {
        console.error("Login after registration failed:", loginError);
        // Even if login fails, we'll consider registration successful and redirect to login
        setGeneralError(t('auth.registrationSuccessLoginFailed'));
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      console.error('Registration error:', err);

      // Format error message from API response if available
      if (err.response?.data) {
        const newErrors = {};

        // Process each error field from the API response
        Object.entries(err.response.data).forEach(([field, message]) => {
          if (Array.isArray(message)) {
            newErrors[field] = message.join(', ');
          } else if (typeof message === 'string') {
            newErrors[field] = message;
          } else if (typeof message === 'object') {
            // For nested error objects
            Object.entries(message).forEach(([nestedField, nestedMessage]) => {
              newErrors[`${field}.${nestedField}`] = nestedMessage;
            });
          }
        });

        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
        } else {
          setGeneralError(t('auth.registrationFailed'));
        }
      } else {
        setGeneralError(t('auth.registrationFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <div className="hidden md:block md:w-1/2 bg-cover bg-center"
           style={{ backgroundImage: "url('/images/military-vehicle.jpg')" }}>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          <h2 className="text-2xl md:text-3xl font-bold text-indigo-900 mb-6">{t('common.signUp')}</h2>

          {generalError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {generalError}
            </div>
          )}

          {/* Progress steps indicator */}
          <div className="mb-6">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                step >= 1 ? 'bg-indigo-900 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                1
              </div>
              <div className={`h-1 flex-1 ${
                step >= 2 ? 'bg-indigo-900' : 'bg-gray-300'
              }`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                step >= 2 ? 'bg-indigo-900 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-500">{t('auth.personalInfo')}</span>
              <span className="text-xs text-gray-500">{t('auth.accountDetails')}</span>
            </div>
          </div>

          {step === 1 ? (
            <form onSubmit={nextStep} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2 text-sm md:text-base" htmlFor="first_name">
                  {t('auth.name')} *
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base ${
                    errors.first_name ? 'border-red-500' : ''
                  }`}
                />
                {errors.first_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 mb-2 text-sm md:text-base" htmlFor="last_name">
                  {t('auth.surname')} *
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base ${
                    errors.last_name ? 'border-red-500' : ''
                  }`}
                />
                {errors.last_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 mb-2 text-sm md:text-base" htmlFor="email">
                  {t('auth.email')} *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base ${
                    errors.email ? 'border-red-500' : ''
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 mb-2 text-sm md:text-base" htmlFor="phone_number">
                  {t('auth.phoneNumber')}
                </label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-900 text-white py-2 rounded-lg hover:bg-indigo-800 transition duration-200 mt-4 text-sm md:text-base"
              >
                {t('common.next')} →
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2 text-sm md:text-base" htmlFor="username">
                  {t('auth.username')} *
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base ${
                    errors.username ? 'border-red-500' : ''
                  }`}
                />
                {errors.username && (
                  <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 mb-2 text-sm md:text-base" htmlFor="password">
                  {t('auth.password')} *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base ${
                    errors.password ? 'border-red-500' : ''
                  }`}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 mb-2 text-sm md:text-base" htmlFor="confirmPassword">
                  {t('auth.confirmPassword')} *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base ${
                    errors.confirmPassword ? 'border-red-500' : ''
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_military"
                  name="is_military"
                  checked={formData.is_military}
                  onChange={handleInputChange}
                  className="mr-2 h-4 w-4"
                />
                <label className="text-gray-700 text-sm md:text-base" htmlFor="is_military">
                  {t('auth.iAmMilitary')}
                </label>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0 mt-6">
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 transition duration-200 text-sm md:text-base order-2 sm:order-1 sm:w-1/2"
                  disabled={loading}
                >
                  ← {t('common.back')}
                </button>
                <button
                  type="submit"
                  className="bg-indigo-900 text-white py-2 rounded-lg hover:bg-indigo-800 transition duration-200 text-sm md:text-base order-1 sm:order-2 sm:w-1/2 flex items-center justify-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('auth.registering')}
                    </>
                  ) : t('common.signUp')}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm md:text-base">
              {t('auth.alreadyAccount')}? <Link to="/login" className="text-indigo-600 hover:underline">{t('common.signIn')}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;