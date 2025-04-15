// BuyPage.js
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import CarList from '../components/cars/CarList';
import CarService from '../services/car.service';

const BuyPage = () => {
  const { t } = useTranslation();
  const [makeOptions, setMakeOptions] = useState([]);
  const [modelOptions, setModelOptions] = useState([]);
  const [bodyTypes, setBodyTypes] = useState([]);
  const [fuelTypes, setFuelTypes] = useState([]);
  const [filters, setFilters] = useState({
    make: '',
    model: '',
    min_year: '',
    max_year: '',
    min_price: '',
    max_price: '',
    body_type: '',
    fuel_type: '',
    transmission: '',
    condition: '',
  });
  const [loading, setLoading] = useState(false);

  // Load unique values for filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
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
        const response = await CarService.getCars({ make: filters.make });
        const cars = response.results || [];
        const models = [...new Set(cars.map(car => car.model))].sort();
        setModelOptions(models);
      } catch (error) {
        console.error('Failed to load models:', error);
      }
    };

    fetchModelsForMake();
  }, [filters.make]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));

    // Reset model if make changes
    if (name === 'make') {
      setFilters(prev => ({
        ...prev,
        model: ''
      }));
    }
  };

  const resetFilters = () => {
    setFilters({
      make: '',
      model: '',
      min_year: '',
      max_year: '',
      min_price: '',
      max_price: '',
      body_type: '',
      fuel_type: '',
      transmission: '',
      condition: '',
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-indigo-900 text-white py-12">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl font-bold">{t('common.buy')}</h1>
          <p className="mt-2 text-indigo-200">
            {t('buy.findYourPerfectVehicle')}
          </p>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="container mx-auto px-6 py-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-indigo-900 mb-4">{t('buy.filterVehicles')}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Make */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('cars.make')}</label>
              <select
                name="make"
                value={filters.make}
                onChange={handleFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">{t('common.all')}</option>
                {makeOptions.map(make => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </select>
            </div>

            {/* Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('cars.model')}</label>
              <select
                name="model"
                value={filters.model}
                onChange={handleFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                disabled={!filters.make}
              >
                <option value="">{t('common.all')}</option>
                {modelOptions.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>

            {/* Year Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('cars.yearRange')}</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  name="min_year"
                  value={filters.min_year}
                  onChange={handleFilterChange}
                  placeholder={t('common.from')}
                  className="w-1/2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <input
                  type="number"
                  name="max_year"
                  value={filters.max_year}
                  onChange={handleFilterChange}
                  placeholder={t('common.to')}
                  className="w-1/2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('cars.priceRange')}</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  name="min_price"
                  value={filters.min_price}
                  onChange={handleFilterChange}
                  placeholder={t('common.from')}
                  className="w-1/2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <input
                  type="number"
                  name="max_price"
                  value={filters.max_price}
                  onChange={handleFilterChange}
                  placeholder={t('common.to')}
                  className="w-1/2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Body Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('cars.bodyType')}</label>
              <select
                name="body_type"
                value={filters.body_type}
                onChange={handleFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">{t('common.all')}</option>
                {bodyTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Fuel Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('cars.fuelType')}</label>
              <select
                name="fuel_type"
                value={filters.fuel_type}
                onChange={handleFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">{t('common.all')}</option>
                {fuelTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Transmission */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('cars.transmission')}</label>
              <select
                name="transmission"
                value={filters.transmission}
                onChange={handleFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">{t('common.all')}</option>
                <option value="manual">{t('cars.manual')}</option>
                <option value="automatic">{t('cars.automatic')}</option>
                <option value="semi-automatic">{t('cars.semiAutomatic')}</option>
              </select>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('cars.condition')}</label>
              <select
                name="condition"
                value={filters.condition}
                onChange={handleFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">{t('common.all')}</option>
                <option value="new">{t('cars.new')}</option>
                <option value="used">{t('cars.used')}</option>
                <option value="damaged">{t('cars.damaged')}</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={resetFilters}
              className="py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              {t('common.reset')}
            </button>
          </div>
        </div>
      </div>

      <CarList filters={filters} />
    </div>
  );
};

export default BuyPage;
