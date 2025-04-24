import axios from 'axios';

const api = axios.create({
  baseURL: '/api/',  // Use relative URL
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

const token = localStorage.getItem('militex_token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

api.interceptors.request.use(
  (config) => {
    if (config.headers['Content-Type'] === 'multipart/form-data') {
      console.log(`API File Upload Request: ${config.method?.toUpperCase()} ${config.url}`);

      if (config.data instanceof FormData) {
        // Count files and fields
        let fileCount = 0;
        let fieldCount = 0;
        const keys = new Set();

        for (let pair of config.data.entries()) {
          keys.add(pair[0]);
          if (pair[1] instanceof File || pair[1] instanceof Blob) {
            fileCount++;
          } else {
            fieldCount++;
          }
        }

        console.log(`FormData contains ${fileCount} file field(s) and ${fieldCount} regular field(s)`);
        console.log(`FormData keys: ${Array.from(keys).join(', ')}`);
      }
    } else {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.params || {});
    }

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

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.config?.headers?.['Content-Type'] === 'multipart/form-data') {
      console.error('File Upload Error:', {
        url: error.config.url,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
    } else {
      console.error('API Error:', error.response?.data || error.message);
    }

    const originalRequest = error.config;
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
          withCredentials: true
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

        localStorage.removeItem('militex_token');
        localStorage.removeItem('militex_refresh_token');
        localStorage.removeItem('militex_user');

        if (!window.location.pathname.includes('/login')) {
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
