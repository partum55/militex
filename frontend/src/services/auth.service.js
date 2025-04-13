import api from './api';
import jwt_decode from 'jwt-decode';

const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

const AuthService = {
  login: async (username, password) => {
    try {
      const response = await api.post('token/', {
        username,
        password,
      });

      if (response.data.access) {
        localStorage.setItem(TOKEN_KEY, response.data.access);
        localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refresh);
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  register: async (userData) => {
    return api.post('users/', userData);
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('users/me/');
      localStorage.setItem(USER_KEY, JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateProfile: async (userData) => {
    try {
      const response = await api.patch('users/me/', userData);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  getRefreshToken: () => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  isTokenValid: (token) => {
    if (!token) return false;

    try {
      const decoded = jwt_decode(token);
      const currentTime = Date.now() / 1000;

      // Check if token is expired
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  },

  refreshToken: async () => {
    try {
      const refreshToken = AuthService.getRefreshToken();

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post('token/refresh/', {
        refresh: refreshToken,
      });

      if (response.data.access) {
        localStorage.setItem(TOKEN_KEY, response.data.access);
        return response.data.access;
      } else {
        throw new Error('Access token not received');
      }
    } catch (error) {
      // Clear tokens on refresh failure
      AuthService.logout();
      throw error;
    }
  },

  /**
   * Ensures a valid token is available
   * @returns {Promise<string>} Valid access token
   */
  ensureValidToken: async () => {
    const token = AuthService.getToken();

    if (!token) {
      throw new Error('Not authenticated');
    }

    if (!AuthService.isTokenValid(token)) {
      // Token expired, try to refresh
      return await AuthService.refreshToken();
    }

    return token;
  },

  /**
   * Checks if the user is authenticated with a valid token
   * @returns {boolean} Authentication status
   */
  isAuthenticated: () => {
    const token = AuthService.getToken();
    return !!token && AuthService.isTokenValid(token);
  }
};

export default AuthService;
