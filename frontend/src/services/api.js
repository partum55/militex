import axios from 'axios';

// Create an axios instance for API calls
const api = axios.create({
  baseURL: '/api/',  // Use relative URL
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// Load token from localStorage on startup
const token = localStorage.getItem('militex_token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Add logging for debugging API requests
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.params || {});

    // Check token before each request
    const token = localStorage.getItem('militex_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh and error handling
api.interceptors.response.use(
  (response) => {
    // Optional: Log successful responses
    // console.log('API Response:', response.data);
    return response;
  },
  async (error) => {
    // Log the error for debugging
    console.error('API Error:', error.response?.data || error.message);

    const originalRequest = error.config;

    // If error is 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log('Attempting token refresh...');
        const refreshToken = localStorage.getItem('militex_refresh_token');

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post('/api/token/refresh/', {
          refresh: refreshToken
        }, {
          withCredentials: true // Ensure cookies are sent with this request too
        });

        if (response.data.access) {
          console.log('Token refresh successful');
          localStorage.setItem('militex_token', response.data.access);
          api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;

          // Update the authorization header in the original request
          originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;

          // Retry the original request
          return axios(originalRequest);
        } else {
          throw new Error('Access token not received');
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);

        // If refresh fails, clear tokens and redirect to login
        localStorage.removeItem('militex_token');
        localStorage.removeItem('militex_refresh_token');
        localStorage.removeItem('militex_user');

        // If we're not already on the login page, redirect
        if (!window.location.pathname.includes('/login')) {
          // Add a small delay before redirecting
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Export the api instance
export default api;