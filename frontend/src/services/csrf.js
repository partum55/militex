import api from './api';


const getCSRFToken = async () => {
  try {
    await api.get('/csrf/');
    return true;
  } catch (error) {
    console.warn('CSRF token fetch failed, app will continue with reduced security', error);
    return false;
  }
};

export default getCSRFToken;
