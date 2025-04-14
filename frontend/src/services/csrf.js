// src/services/csrf.js
import api from './api';

const getCSRFToken = async () => {
  try {
    await api.get('/csrf/');
  } catch (error) {
    console.error('Failed to get CSRF token:', error);
  }
};

export default getCSRFToken;
