import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthService from '../../services/auth.service';
import axios from 'axios';

// Helper to get CSRF token from cookies
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
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const nextStep = async (e) => {
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
      const { confirmPassword, ...userData } = formData;

      // Get CSRF token
      const csrftoken = getCookie('csrftoken');

      // Use axios directly for the registration request
      const response = await axios.post('/api/users/', userData, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken
        },
        withCredentials: true
      });

      if (response.status >= 200 && response.status < 300) {
        // Optional: call AuthService.login afterwards
        await AuthService.login(formData.username, formData.password);
        await AuthService.getCurrentUser();
        navigate('/');
      } else {
        setError(t('auth.registrationFailed'));
      }
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response?.data) {
        // Format Django validation errors
        const errors = [];
        Object.entries(err.response.data).forEach(([field, errorMessages]) => {
          if (Array.isArray(errorMessages)) {
            errors.push(`${field}: ${errorMessages.join(', ')}`);
          } else if (typeof errorMessages === 'string') {
            errors.push(`${field}: ${errorMessages}`);
          }
        });
        setError(errors.join('\n') || t('auth.registrationFailed'));
      } else {
        setError(t('auth.registrationFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-full md:w-1/2 bg-cover bg-center" style={{ backgroundImage: "url('/images/military-vehicle.jpg')" }}></div>
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-indigo-900 mb-8">{t('common.signUp')}</h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
          )}

          {step === 1 ? (
            <form onSubmit={nextStep}>
              <input name="first_name" value={formData.first_name} onChange={handleInputChange} className="input" placeholder={t('auth.name')} required />
              <input name="last_name" value={formData.last_name} onChange={handleInputChange} className="input" placeholder={t('auth.surname')} required />
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="input" placeholder={t('auth.email')} required />
              <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleInputChange} className="input" placeholder={t('auth.phoneNumber')} />
              <button type="submit" className="btn-primary">{t('common.next')} →</button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <input name="username" value={formData.username} onChange={handleInputChange} className="input" placeholder={t('auth.username')} required />
              <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="input" placeholder={t('auth.password')} required />
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className="input" placeholder={t('auth.confirmPassword')} required />
              <label>
                <input type="checkbox" name="is_military" checked={formData.is_military} onChange={handleInputChange} /> {t('auth.iAmMilitary')}
              </label>
              <div className="flex gap-2">
                <button type="button" onClick={prevStep} className="btn-secondary">← {t('common.back')}</button>
                <button type="submit" className="btn-primary" disabled={loading}>{loading ? t('auth.registering') : t('common.signUp')}</button>
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
