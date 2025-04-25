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
              <label className="block text-gray-700 mb-2" htmlFor="username">
                {t('auth.username')}
              </label>
              <input
                id="username"
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
              {loading ? t('common.loading') : t('auth.login')}
            </button>
          </form>

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
