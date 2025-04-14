// services/csrf.js
import api from './api';

/**
 * Fetches a CSRF token from the server and sets it as a cookie
 * This should be called when the app initializes
 */
const getCSRFToken = async () => {
  try {
    // Try to get CSRF token
    await api.get('/csrf/');
    return true;
  } catch (error) {
    console.warn('CSRF token fetch failed, app will continue with reduced security', error);
    return false;
  }
};

export default getCSRFToken;
