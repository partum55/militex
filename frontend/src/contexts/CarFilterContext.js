import React, { createContext, useState, useContext, useEffect } from 'react';
import CarService from '../services/car.service';

const CarFilterContext = createContext();

export const useCarFilters = () => useContext(CarFilterContext);

export const CarFilterProvider = ({ children }) => {
  const [filters, setFilters] = useState({
    make: '',
    model: '',
    min_year: '',
    max_year: '',
    min_price: '',
    max_price: '',
    min_mileage: '',
    max_mileage: '',
    body_type: '',
    fuel_type: '',
    transmission: '',
    condition: '',
    vehicle_type: '',
  });
  const [makeOptions, setMakeOptions] = useState([]);
  const [modelOptions, setModelOptions] = useState([]);
  const [bodyTypes, setBodyTypes] = useState([]);
  const [fuelTypes, setFuelTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Load filter options on mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await CarService.getAllCars();
        const cars = response.results || [];

        // Extract unique makes
        const makes = [...new Set(cars.map(car => car.make))].sort();
        setMakeOptions(makes);

        // Extract unique body types
        const bodies = [...new Set(cars.map(car => car.body_type).filter(Boolean))].sort();
        setBodyTypes(bodies);

        // Extract unique fuel types
        const fuels = [...new Set(cars.map(car => car.fuel_type))].sort();
        setFuelTypes(fuels);
      } catch (error) {
        console.error('Failed to load filter options:', error);
      }
    };

    fetchFilterOptions();
  }, []);

  // Load models when make changes
  useEffect(() => {
    const fetchModelsForMake = async () => {
      if (!filters.make) {
        setModelOptions([]);
        return;
      }

      try {
        const response = await CarService.getAllCars({ make: filters.make });
        const cars = response.results || [];
        const models = [...new Set(cars.map(car => car.model))].sort();
        setModelOptions(models);
      } catch (error) {
        console.error('Failed to load models:', error);
      }
    };

    fetchModelsForMake();
  }, [filters.make]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      make: '',
      model: '',
      min_year: '',
      max_year: '',
      min_price: '',
      max_price: '',
      min_mileage: '',
      max_mileage: '',
      body_type: '',
      fuel_type: '',
      transmission: '',
      condition: '',
      vehicle_type: '',
    });
    setSearchTerm('');
  };

  return (
    <CarFilterContext.Provider value={{
      filters,
      handleFilterChange,
      resetFilters,
      makeOptions,
      modelOptions,
      bodyTypes,
      fuelTypes,
      searchTerm,
      setSearchTerm
    }}>
      {children}
    </CarFilterContext.Provider>
  );
};