import api from './api';
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

const FundraiserService = {
  getAllFundraisers: async () => {
    try {
      const response = await api.get('fundraisers/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getFundraiserById: async (id) => {
    try {
      const response = await api.get(`fundraisers/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  createFundraiser: async (fundraiserData) => {
    const formData = new FormData();

    Object.keys(fundraiserData).forEach((key) => {
      formData.append(key, fundraiserData[key]);
    });

    try {
      // Спочатку отримай CSRF токен
      await axios.get('/csrf/', { withCredentials: true });
      const csrftoken = getCookie('csrftoken');

      // Потім зроби запит на створення
      const response = await api.post('fundraisers/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-CSRFToken': csrftoken,
        },
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  donate: async (fundraiserId, donationData) => {
    try {
      const response = await api.post(`fundraisers/${fundraiserId}/donate/`, donationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};


export default FundraiserService;
