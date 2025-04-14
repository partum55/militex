import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/';

// Функція для отримання cookie
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

// Створення інстансу axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // тайм-аут 30 секунд
  withCredentials: true, // необхідно для відправки cookie
});

// Додавання interceptor для запитів
api.interceptors.request.use(
  (config) => {
    // Отримуємо токен з localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Якщо метод POST, PUT, PATCH, DELETE, додаємо CSRF токен
    const csrfToken = getCookie('csrftoken');
    if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
      config.headers['X-CSRFToken'] = csrfToken;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Додавання interceptor для обробки відповідей
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const customError = {
      message: error.response?.data?.detail || 'An unexpected error occurred',
      status: error.response?.status || 500,
      data: error.response?.data || {},
      originalError: error,
    };

    const originalRequest = error.config;

    // Обробка помилок без відповіді (наприклад, проблеми з мережею)
    if (!error.response) {
      customError.message = 'Network error - please check your connection';
      return Promise.reject(customError);
    }

    // Якщо помилка 401 і запит ще не повторювався
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Спроба оновлення токена
        const response = await axios.post(`${API_URL}token/refresh/`, {
          refresh: refreshToken,
        });

        // Якщо токен оновлений, повторюємо запит
        const { access } = response.data;
        localStorage.setItem('token', access);

        originalRequest.headers['Authorization'] = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Якщо оновлення токена не вдалося, перенаправляємо на сторінку входу
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        customError.message = 'Your session has expired. Please log in again.';
        customError.isAuthError = true;

        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }

        return Promise.reject(customError);
      }
    }

    // Обробка стандартних помилок
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
        break;
    }

    // Обробка помилок валідації (якщо такі є)
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

// Експортуємо обробник помилок
export const handleApiError = (error, notifyFn = null) => {
  const message = error.message || 'An unexpected error occurred';
  const status = error.status || 500;

  console.error(`API Error (${status}):`, message, error);

  if (notifyFn && typeof notifyFn === 'function') {
    notifyFn({
      type: 'error',
      message: message,
      title: `Error ${status}`,
      duration: 5000,
    });
  }

  return {
    message,
    status,
    data: error.data || {},
    validationErrors: error.validationErrors || {},
    isAuthError: error.isAuthError || false,
  };
};

export default api;
