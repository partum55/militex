// frontend/src/services/car.service.js
import api from './api';

const CarService = {
  // Get all cars with optional filters (фільтрація)
  getAllCars: async (params = {}) => {
    try {
      const response = await api.get('cars/', { params });
      return response.data;
    } catch (error) {
      console.error('Error in getAllCars:', error);
      throw error;
    }
  },

  // Import cars from Auto.ria (тільки для адмінів)
  importFromAutoria: async (limit = 10) => {
    try {
      const response = await api.post('cars/import_from_autoria/', { limit });
      return response.data;
    } catch (error) {
      console.error('Error importing from Auto.ria:', error);
      throw error;
    }
  },

  // Get car by ID
  getCarById: async (id) => {
    try {
      const response = await api.get(`cars/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching car with ID ${id}:`, error);
      throw error;
    }
  },

  // Create a new car listing
  createCar: async (carData) => {
    try {
      const formData = new FormData();
      Object.keys(carData).forEach((key) => {
        if (key !== 'uploaded_images') {
          formData.append(key, carData[key]);
        }
      });

      if (carData.uploaded_images?.length) {
        carData.uploaded_images.forEach((image) => {
          formData.append('uploaded_images', image);
        });
      }

      const response = await api.post('cars/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating car listing:', error);
      throw error;
    }
  },

  // Update an existing car listing
  updateCar: async (id, carData) => {
    try {
      const formData = new FormData();
      Object.keys(carData).forEach((key) => {
        if (key !== 'uploaded_images') {
          formData.append(key, carData[key]);
        }
      });

      if (carData.uploaded_images?.length) {
        carData.uploaded_images.forEach((image) => {
          formData.append('uploaded_images', image);
        });
      }

      const response = await api.patch(`cars/${id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating car with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete a car listing
  deleteCar: async (id) => {
    try {
      await api.delete(`cars/${id}/`);
      return true;
    } catch (error) {
      console.error(`Error deleting car with ID ${id}:`, error);
      throw error;
    }
  },

  // Get user's own listings
  getMyListings: async () => {
    try {
      const response = await api.get('cars/my_listings/');
      return response.data;
    } catch (error) {
      console.error('Error fetching my listings:', error);
      throw error;
    }
  },

  // Search cars by keyword
  searchCars: async (searchQuery) => {
    try {
      const response = await api.get('cars/', {
        params: { search: searchQuery },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching cars:', error);
      throw error;
    }
  },

  // Filter cars with multiple criteria
  filterCars: async (filters) => {
    try {
      const response = await api.get('cars/', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error filtering cars:', error);
      throw error;
    }
  },

  // Get featured (latest) cars
  getFeaturedCars: async (limit = 3) => {
    try {
      const response = await api.get('cars/', {
        params: {
          limit: limit,
          ordering: '-created_at',
        },
      });
      return response.data.results;
    } catch (error) {
      console.error('Error fetching featured cars:', error);
      throw error;
    }
  },
};

export default CarService;
