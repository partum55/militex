// src/services/auth.service.js
import api from './api';
import jwt_decode from 'jwt-decode';
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

        // Set the token in the axios default headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;

        // Fetch user data immediately after login
        const userData = await api.get('/users/me/');
        localStorage.setItem(USER_KEY, JSON.stringify(userData.data));

        return userData.data;
      }

      return null;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    // Remove the Authorization header
    delete axios.defaults.headers.common['Authorization'];
    delete api.defaults.headers.common['Authorization'];
  },

  register: async (userData) => {
    try {
      // Get CSRF token
      await axios.get('/csrf/', { withCredentials: true });
      const csrftoken = getCookie('csrftoken');

      // Make registration request
      const response = await axios.post('/api/users/', userData, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken
        },
        withCredentials: true
      });

      return response.data;
    } catch (error) {
      // Format Django validation errors for better display
      if (error.response && error.response.data) {
        // Create a formatted error message
        const errorData = error.response.data;
        let formattedError = {};

        // Process each error field
        Object.keys(errorData).forEach(field => {
          if (Array.isArray(errorData[field])) {
            formattedError[field] = errorData[field].join(', ');
          } else if (typeof errorData[field] === 'string') {
            formattedError[field] = errorData[field];
          }
        });

        error.formattedErrors = formattedError;
      }

      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      // Check if we have a token first
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Set authorization header for both axios and api
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // First try to get user from local storage to reduce API calls
      const cachedUser = localStorage.getItem(USER_KEY);
      if (cachedUser) {
        return JSON.parse(cachedUser);
      }

      // If no cached user, fetch from API
      const response = await api.get('/users/me/');
      localStorage.setItem(USER_KEY, JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      // If 401 error, try to refresh token
      if (error.response && error.response.status === 401) {
        try {
          await AuthService.refreshToken();
          const response = await api.get('/users/me/');
          localStorage.setItem(USER_KEY, JSON.stringify(response.data));
          return response.data;
        } catch (refreshError) {
          // If refresh fails, logout and throw error
          AuthService.logout();
          throw refreshError;
        }
      }
      throw error;
    }
  },

  updateProfile: async (userData) => {
    try {
      // Get CSRF token
      await axios.get('/csrf/', { withCredentials: true });
      const csrftoken = getCookie('csrftoken');

      const response = await api.patch('/users/me/', userData, {
        headers: {
          'X-CSRFToken': csrftoken
        }
      });
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
      await axios.get('/csrf/', { withCredentials: true });
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

        // Update authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;

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
