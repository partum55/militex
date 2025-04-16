// frontend/src/services/car.service.js
import api from './api';

const CarService = {
  // Get all cars with optional filters
  getAllCars: async (params = {}) => {
    try {
      const response = await api.get('cars/', { params });
      return response.data;
    } catch (error) {
      console.error('Error in getAllCars:', error);
      throw error;
    }
  },

  // Import cars from Auto.ria (admin only)
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
      // Log what's being sent for debugging
      console.log("Creating car with FormData containing:");
      if (carData instanceof FormData) {
        for (let key of carData.keys()) {
          const value = carData.get(key);
          if (value instanceof File) {
            console.log(`${key}: File - ${value.name} (${value.type}, ${value.size} bytes)`);
          } else {
            console.log(`${key}: ${value}`);
          }
        }
      }

      const response = await api.post('cars/', carData, {
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
      // If carData is a FormData object, use it directly
      // Otherwise, create one (for backward compatibility)
      let formDataObj = carData;

      if (!(carData instanceof FormData)) {
        formDataObj = new FormData();
        Object.keys(carData).forEach((key) => {
          if (key !== 'uploaded_images' && key !== 'existing_images' && key !== 'images_to_delete') {
            formDataObj.append(key, carData[key]);
          }
        });

        if (carData.uploaded_images?.length) {
          carData.uploaded_images.forEach((image) => {
            formDataObj.append('uploaded_images', image);
          });
        }

        if (carData.images_to_delete?.length) {
          formDataObj.append('images_to_delete', JSON.stringify(carData.images_to_delete));
        }
      }

      // Log what's being sent for debugging
      console.log(`Updating car ${id} with FormData containing:`);
      for (let key of formDataObj.keys()) {
        const value = formDataObj.get(key);
        if (value instanceof File) {
          console.log(`${key}: File - ${value.name} (${value.type}, ${value.size} bytes)`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      const response = await api.patch(`cars/${id}/`, formDataObj, {
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

  // Delete a specific car image
  deleteCarImage: async (imageId) => {
    try {
      await api.delete(`car-images/${imageId}/`);
      return true;
    } catch (error) {
      console.error(`Error deleting car image with ID ${imageId}:`, error);
      throw error;
    }
  }
};

export default CarService;