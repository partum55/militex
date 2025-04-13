// frontend/src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to refresh token if needed
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Default error object to return
    const customError = {
      message: error.response?.data?.detail || 'An unexpected error occurred',
      status: error.response?.status || 500,
      data: error.response?.data || {},
      originalError: error
    };
    
    const originalRequest = error.config;
    
    // Network error
    if (!error.response) {
      customError.message = 'Network error - please check your connection';
      return Promise.reject(customError);
    }
    
    // If the error is 401 and hasn't been retried yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        // Try to get a new token
        const response = await axios.post(`${API_URL}token/refresh/`, {
          refresh: refreshToken,
        });
        
        // If refresh successful, update tokens and retry original request
        const { access } = response.data;
        localStorage.setItem('token', access);
        
        // Update the authorization header
        originalRequest.headers['Authorization'] = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        customError.message = 'Your session has expired. Please log in again.';
        customError.isAuthError = true;
        
        // Redirect to login only if in browser environment
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        return Promise.reject(customError);
      }
    }
    
    // Handle common HTTP error responses
    switch (error.response.status) {
      case 400:
        customError.message = 'Invalid request. Please check your data.';
        break;
      case 403:
        customError.message = 'You do not have permission to perform this action.';
        break;
      case 404:
        customError.message = 'The requested resource was not found.';
        break;
      case 429:
        customError.message = 'Too many requests. Please try again later.';
        break;
      case 500:
        customError.message = 'Server error. Please try again later.';
        break;
      default:
        // Keep default message
        break;
    }
    
    // Process validation errors (common in Django REST Framework)
    if (error.response.status === 400 && typeof error.response.data === 'object') {
      try {
        const messages = [];
        Object.entries(error.response.data).forEach(([field, errors]) => {
          if (Array.isArray(errors)) {
            messages.push(`${field}: ${errors.join(', ')}`);
          } else if (typeof errors === 'string') {
            messages.push(`${field}: ${errors}`);
          }
        });
        
        if (messages.length > 0) {
          customError.message = messages.join('\n');
          customError.validationErrors = error.response.data;
        }
      } catch (e) {
        console.error('Error processing validation errors', e);
      }
    }
    
    return Promise.reject(customError);
  }
);

/**
 * Global error handler to integrate with a notification system
 * @param {Error} error - Error object from API 
 * @param {Function} notifyFn - Optional notification function
 * @returns {Object} Standardized error object
 */
export const handleApiError = (error, notifyFn = null) => {
  // Extract the custom error properties we added in the interceptor
  const message = error.message || 'An unexpected error occurred';
  const status = error.status || 500;
  
  // Log the error to console (can be removed in production)
  console.error(`API Error (${status}):`, message, error);
  
  // If a notification function is provided, use it
  if (notifyFn && typeof notifyFn === 'function') {
    notifyFn({
      type: 'error',
      message: message,
      title: `Error ${status}`,
      duration: 5000
    });
  }
  
  return {
    message,
    status,
    data: error.data || {},
    validationErrors: error.validationErrors || {},
    isAuthError: error.isAuthError || false
  };
};

export default api;
