// src/services/auth.service.js
import api from './api';
import jwt_decode from 'jwt-decode';
import axios from 'axios'; // Add this import

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

const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

const AuthService = {
  login: async (username, password) => {
    try {
      // Get CSRF token first
      await axios.get('/csrf/', { withCredentials: true });
      
      // Get CSRF token from cookie
      const csrftoken = getCookie('csrftoken');
      
      // Make login request with CSRF token
      const response = await axios.post('/api/token/', {
        username,
        password,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken
        },
        withCredentials: true
      });

      if (response.data.access) {
        localStorage.setItem(TOKEN_KEY, response.data.access);
        localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refresh);
      }

      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  register: async (userData) => {
    // Get CSRF token
    const csrftoken = getCookie('csrftoken');
    
    return axios.post('/api/users/', userData, {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken
      },
      withCredentials: true
    });
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

      // Get CSRF token
      const csrftoken = getCookie('csrftoken');
      
      const response = await axios.post('/api/token/refresh/', {
        refresh: refreshToken,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken
        },
        withCredentials: true
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

  isAuthenticated: () => {
    const token = AuthService.getToken();
    return !!token && AuthService.isTokenValid(token);
  }
};

export default AuthService;
