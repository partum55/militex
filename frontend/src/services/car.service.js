import api from './api';

const CarService = {
  getAllCars: async (params) => {
    try {
      const response = await api.get('cars/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  importFromAutoria: async (limit = 5) => {
    try {
      const response = await api.post('cars/import_from_autoria/', { limit });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCarById: async (id) => {
    try {
      const response = await api.get(`cars/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createCar: async (carData) => {
    // For file uploads, use FormData
    const formData = new FormData();

    // Add car data to formData
    Object.keys(carData).forEach((key) => {
      if (key !== 'uploaded_images') {
        formData.append(key, carData[key]);
      }
    });

    // Add images to formData
    if (carData.uploaded_images) {
      carData.uploaded_images.forEach((image) => {
        formData.append('uploaded_images', image);
      });
    }

    try {
      const response = await api.post('cars/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateCar: async (id, carData) => {
    // Similar to createCar, use FormData for updates with images
    const formData = new FormData();

    Object.keys(carData).forEach((key) => {
      if (key !== 'uploaded_images') {
        formData.append(key, carData[key]);
      }
    });

    if (carData.uploaded_images) {
      carData.uploaded_images.forEach((image) => {
        formData.append('uploaded_images', image);
      });
    }

    try {
      const response = await api.patch(`cars/${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteCar: async (id) => {
    try {
      await api.delete(`cars/${id}/`);
      return true;
    } catch (error) {
      throw error;
    }
  },

  getMyListings: async () => {
    try {
      const response = await api.get('cars/my_listings/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default CarService;
