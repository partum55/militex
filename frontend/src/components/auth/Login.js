import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthService from '../../services/auth.service';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await AuthService.login(username, password);
      const user = await AuthService.getCurrentUser();
      navigate('/');
    } catch (error) {
      setError(
        error.response?.data?.detail || 
        'Failed to login. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    // Implement social login functionality
    alert(`${provider} login not implemented yet`);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-full md:w-1/2 bg-cover bg-center" 
           style={{ backgroundImage: "url('/images/military-vehicle.jpg')" }}>
      </div>
      
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-indigo-900 mb-8">{t('common.signIn')}</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="email">
                {t('auth.email')}
              </label>
              <input
                id="email"
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="password">
                {t('auth.password')}
              </label>
              <input
                id="password"
                type="password"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-indigo-900 text-white py-2 rounded-lg hover:bg-indigo-800 transition duration-200"
              disabled={loading}
            >
              {loading ? 'Loading...' : t('auth.login')}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600">{t('auth.or')}</p>
            
            <div className="flex justify-center mt-4 space-x-4">
              <button
                onClick={() => handleSocialLogin('Google')}
                className="p-2 rounded-full border hover:bg-gray-100"
              >
                <img src="/images/google-icon.svg" alt="Google" className="w-6 h-6" />
              </button>
              
              <button
                onClick={() => handleSocialLogin('Apple')}
                className="p-2 rounded-full border hover:bg-gray-100"
              >
                <img src="/images/apple-icon.svg" alt="Apple" className="w-6 h-6" />
              </button>
              
              <button
                onClick={() => handleSocialLogin('Facebook')}
                className="p-2 rounded-full border hover:bg-gray-100"
              >
                <img src="/images/facebook-icon.svg" alt="Facebook" className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              {t('auth.noAccount')}? <Link to="/register" className="text-indigo-600 hover:underline">{t('common.signUp')}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
