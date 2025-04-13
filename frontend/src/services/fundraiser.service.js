import api from './api';

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
    // Use FormData for image upload
    const formData = new FormData();
    
    Object.keys(fundraiserData).forEach((key) => {
      if (key === 'image') {
        formData.append(key, fundraiserData[key]);
      } else {
        formData.append(key, fundraiserData[key]);
      }
    });
    
    try {
      const response = await api.post('fundraisers/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
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
