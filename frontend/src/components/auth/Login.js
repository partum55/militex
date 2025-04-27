import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthService from '../../services/auth.service';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { from } = location.state || { from: { pathname: '/' } };

  useEffect(() => {
    if (error) setError('');
  }, [username, password]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password) {
      setError(t('auth.fillAllFields'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      await AuthService.login(username, password);

      const user = await AuthService.getCurrentUser();

      navigate(from.pathname);
    } catch (error) {
      console.error('Login error:', error);

      if (error.response) {
        switch (error.response.status) {
          case 400:
            if (error.response.data.detail) {
              setError(error.response.data.detail);
            } else if (error.response.data.non_field_errors) {
              setError(error.response.data.non_field_errors.join(', '));
            } else {
              setError(t('auth.invalidCredentials'));
            }
            break;
          case 401:
            setError(t('auth.invalidCredentials'));
            break;
          case 403:
            setError(t('auth.accountLocked'));
            break;
          case 429:
            setError(t('auth.tooManyAttempts'));
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            setError(t('errors.serverError'));
            break;
          default:
            setError(t('auth.loginFailed'));
        }
      } else if (error.request) {
        setError(t('errors.networkError'));
      } else {
        setError(t('auth.loginFailed'));
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
          <h2 className="text-2xl md:text-3xl font-bold text-indigo-900 mb-6">{t('common.signIn')}</h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2 text-sm md:text-base" htmlFor="username">
                {t('auth.username')}
              </label>
              <input
                id="username"
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-sm md:text-base" htmlFor="password">
                {t('auth.password')}
              </label>
              <input
                id="password"
                type="password"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-900 text-white py-2 rounded-lg hover:bg-indigo-800 transition duration-200 mt-6 text-sm md:text-base flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('common.loading')}
                </>
              ) : t('auth.login')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm md:text-base">
              {t('auth.noAccount')}? <Link to="/register" className="text-indigo-600 hover:underline">{t('common.signUp')}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;