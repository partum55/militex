// frontend/src/services/car.service.js
import api from './api';

const CarService = {
  // Get all cars with optional filters
  etAllCars: async (params = {}) => {
    try {
      const response = await api.get('cars/', { params });
      return response.data;
    } catch (error) {
      console.error('Error in getAllCars:', error);
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

  // Create a new car listing
  createCar: async (carData) => {
    try {
      // For file uploads, use FormData
      const formData = new FormData();

      // Add car data to formData
      Object.keys(carData).forEach((key) => {
        if (key !== 'uploaded_images') {
          formData.append(key, carData[key]);
        }
      });

      // Add images to formData
      if (carData.uploaded_images && carData.uploaded_images.length > 0) {
        carData.uploaded_images.forEach((image) => {
          formData.append('uploaded_images', image);
        });
      }

      const response = await api.post('cars/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
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
      // Similar to createCar, use FormData for updates with images
      const formData = new FormData();

      Object.keys(carData).forEach((key) => {
        if (key !== 'uploaded_images') {
          formData.append(key, carData[key]);
        }
      });

      if (carData.uploaded_images && carData.uploaded_images.length > 0) {
        carData.uploaded_images.forEach((image) => {
          formData.append('uploaded_images', image);
        });
      }

      const response = await api.patch(`cars/${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
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

  // Get user's car listings
  getMyListings: async () => {
    try {
      const response = await api.get('cars/my_listings/');
      return response.data;
    } catch (error) {
      console.error('Error fetching my listings:', error);
      throw error;
    }
  },
  
  // Search cars by query
  searchCars: async (searchQuery) => {
    try {
      const response = await api.get('cars/', { 
        params: { 
          search: searchQuery 
        } 
      });
      return response.data;
    } catch (error) {
      console.error('Error searching cars:', error);
      throw error;
    }
  },
  
  // Filter cars by multiple criteria
  filterCars: async (filters) => {
    try {
      const response = await api.get('cars/', { 
        params: filters 
      });
      return response.data;
    } catch (error) {
      console.error('Error filtering cars:', error);
      throw error;
    }
  },
  
  // Get featured cars for homepage
  getFeaturedCars: async (limit = 3) => {
    try {
      const response = await api.get('cars/', { 
        params: {
          limit: limit,
          ordering: '-created_at'  // Get newest cars
        }
      });
      return response.data.results;
    } catch (error) {
      console.error('Error fetching featured cars:', error);
      throw error;
    }
  }
};

export default CarService;
