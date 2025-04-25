import api from './api';
import jwt_decode from 'jwt-decode';
import axios from 'axios';

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

const TOKEN_KEY = 'militex_token';
const REFRESH_TOKEN_KEY = 'militex_refresh_token';
const USER_KEY = 'militex_user';

const AuthService = {
  login: async (username, password) => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      await axios.get('/csrf/', { withCredentials: true });

      const csrftoken = getCookie('csrftoken');

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

      console.log("Login response:", response.data);

      if (response.data.access) {
        localStorage.setItem(TOKEN_KEY, response.data.access);
        localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refresh);

        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;

        try {
          const userData = await api.get('/users/me/');

          if (userData.data) {
            console.log("User data fetched:", userData.data);
            localStorage.setItem(USER_KEY, JSON.stringify(userData.data));
            return userData.data;
          } else {
            console.error("User data response empty");
            throw new Error("Failed to get user data");
          }
        } catch (userError) {
          console.error("Error fetching user data:", userError);
          throw userError;
        }
      } else {
        console.error("No access token in response");
        throw new Error("Authentication failed - no token received");
      }
    } catch (error) {
      console.error('Login error:', error);

      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    delete axios.defaults.headers.common['Authorization'];
    delete api.defaults.headers.common['Authorization'];

    console.log("User logged out, auth data cleared");
  },

  getCurrentUser: async () => {
    try {
      const userStr = localStorage.getItem(USER_KEY);
      if (userStr) {
        return JSON.parse(userStr);
      }

      const token = AuthService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const response = await api.get('/users/me/');
      if (response.data) {
        localStorage.setItem(USER_KEY, JSON.stringify(response.data));
        return response.data;
      } else {
        throw new Error("Failed to get user data");
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        try {
          await AuthService.refreshToken();
          const response = await api.get('/users/me/');
          localStorage.setItem(USER_KEY, JSON.stringify(response.data));
          return response.data;
        } catch (refreshError) {
          AuthService.logout();
          throw refreshError;
        }
      }
      AuthService.logout();
      throw error;
    }
  },

  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  getRefreshToken: () => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  refreshToken: async () => {
    try {
      const refreshToken = AuthService.getRefreshToken();

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

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

      if (response.data && response.data.access) {
        localStorage.setItem(TOKEN_KEY, response.data.access);

        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;

        return response.data.access;
      } else {
        throw new Error('Access token not received');
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      AuthService.logout();
      throw error;
    }
  },

  isTokenValid: (token) => {
    if (!token) return false;

    try {
      const decoded = jwt_decode(token);
      const currentTime = Date.now() / 1000;

      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  },

  isAuthenticated: () => {
    const token = AuthService.getToken();
    return !!token && AuthService.isTokenValid(token);
  }
};

export default AuthService;
