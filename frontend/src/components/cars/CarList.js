import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import CarCard from './CarCard';
import CarService from '../../services/car.service';

const CarList = () => {
  const { t } = useTranslation();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter state
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
  });

  // Filter visibility state
  const [showFilters, setShowFilters] = useState(false);

  // Options for filters
  const [makeOptions, setMakeOptions] = useState([]);
  const [modelOptions, setModelOptions] = useState([]);
  const [bodyTypes, setBodyTypes] = useState([]);
  const [fuelTypes, setFuelTypes] = useState([]);

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

  // Fetch cars when filters, pagination, or search term change
  useEffect(() => {
    fetchCars();
  }, [filters, currentPage, searchTerm]);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: currentPage,
        search: searchTerm
      };

      // Remove empty filter values
      Object.keys(params).forEach(key => {
        if (params[key] === '') {
          delete params[key];
        }
      });

      const response = await CarService.getAllCars(params);
      setCars(response.results || []);
      setPagination({
        count: response.count || 0,
        next: response.next || null,
        previous: response.previous || null,
      });
    } catch (error) {
      setError('Failed to fetch cars. Please try again later.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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

    // Reset to first page on filter change
    setCurrentPage(1);
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
    });
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handlePreviousPage = () => {
    if (pagination.previous) {
      setCurrentPage(currentPage - 1);
      // Scroll to top on mobile
      if (window.innerWidth < 768) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleNextPage = () => {
    if (pagination.next) {
      setCurrentPage(currentPage + 1);
      // Scroll to top on mobile
      if (window.innerWidth < 768) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Mobile Filter Toggle Button */}
      <div className="md:hidden mb-4">
        <button
          onClick={toggleFilters}
          className="w-full bg-indigo-900 text-white py-2 px-4 rounded-lg flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          {showFilters ? t('common.hideFilters') : t('common.showFilters')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filters Section - Mobile (Collapsible) & Desktop (Always Visible) */}
        <div className={`md:col-span-1 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white rounded-lg shadow p-6 mb-6 sticky top-20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-800">{t('cars.filters.title')}</h2>
              <button
                onClick={resetFilters}
                className="text-indigo-600 hover:underline text-sm"
              >
                {t('cars.filters.reset')}
              </button>
            </div>

            {/* Make */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('cars.carMake')}</label>
              <select
                name="make"
                value={filters.make}
                onChange={handleFilterChange}
                className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">{t('common.all')}</option>
                {makeOptions.map(make => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </select>
            </div>

            {/* Model - Only show if make is selected */}
            {filters.make && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('cars.carModel')}</label>
                <select
                  name="model"
                  value={filters.model}
                  onChange={handleFilterChange}
                  className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">{t('common.all')}</option>
                  {modelOptions.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Year Range */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('cars.yearRange')}</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  name="min_year"
                  value={filters.min_year}
                  onChange={handleFilterChange}
                  placeholder={t('common.from')}
                  className="w-1/2 rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <input
                  type="number"
                  name="max_year"
                  value={filters.max_year}
                  onChange={handleFilterChange}
                  placeholder={t('common.to')}
                  className="w-1/2 rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('cars.priceRange')}</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  name="min_price"
                  value={filters.min_price}
                  onChange={handleFilterChange}
                  placeholder={t('common.from')}
                  className="w-1/2 rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <input
                  type="number"
                  name="max_price"
                  value={filters.max_price}
                  onChange={handleFilterChange}
                  placeholder={t('common.to')}
                  className="w-1/2 rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Fuel Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('cars.fuelType')}</label>
              <select
                name="fuel_type"
                value={filters.fuel_type}
                onChange={handleFilterChange}
                className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">{t('common.all')}</option>
                <option value="gasoline">{t('cars.gasoline')}</option>
                <option value="diesel">{t('cars.diesel')}</option>
                <option value="electric">{t('cars.electric')}</option>
                <option value="hybrid">{t('cars.hybrid')}</option>
                <option value="gas">{t('cars.gas')}</option>
              </select>
            </div>

            {/* Transmission */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('cars.transmission')}</label>
              <select
                name="transmission"
                value={filters.transmission}
                onChange={handleFilterChange}
                className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">{t('common.all')}</option>
                <option value="manual">{t('cars.manual')}</option>
                <option value="automatic">{t('cars.automatic')}</option>
                <option value="semi-automatic">{t('cars.semiAutomatic')}</option>
              </select>
            </div>

            {/* Condition */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('cars.condition')}</label>
              <select
                name="condition"
                value={filters.condition}
                onChange={handleFilterChange}
                className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">{t('common.all')}</option>
                <option value="new">{t('cars.new')}</option>
                <option value="used">{t('cars.used')}</option>
                <option value="damaged">{t('cars.damaged')}</option>
              </select>
            </div>

            {/* Mobile only: Close filters button */}
            <div className="md:hidden mt-6">
              <button
                onClick={toggleFilters}
                className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition duration-200"
              >
                {t('common.applyFilters')}
              </button>
            </div>
          </div>
        </div>

        {/* Car List */}
        <div className="md:col-span-3">
          {/* Search Bar */}
          <div className="mb-6 flex">
            <input
              type="text"
              placeholder={t('common.search')}
              className="w-full px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onChange={handleSearchChange}
              value={searchTerm}
            />
            <button className="bg-indigo-900 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-800 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </button>
          </div>

          {/* Cars Grid */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-900"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : cars.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-600">{t('cars.noResults')}</p>
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 bg-indigo-900 text-white rounded-lg hover:bg-indigo-800 transition duration-200"
              >
                {t('cars.filters.reset')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6">
              {cars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && cars.length > 0 && (
            <div className="flex justify-between items-center mt-8">
              <button
                onClick={handlePreviousPage}
                disabled={!pagination.previous}
                className={`px-4 py-2 rounded ${
                  pagination.previous ? 'bg-indigo-900 text-white hover:bg-indigo-800' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {t('common.previous')}
              </button>

              <span className="text-gray-600">
                {t('pagination.page')} {currentPage} {t('pagination.of')} {Math.ceil(pagination.count / 10) || 1}
              </span>

              <button
                onClick={handleNextPage}
                disabled={!pagination.next}
                className={`px-4 py-2 rounded ${
                  pagination.next ? 'bg-indigo-900 text-white hover:bg-indigo-800' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {t('common.next')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarList;