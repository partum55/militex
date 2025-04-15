import React, { Component, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import CarFilters from './CarFilters';
import CarCard from './CarCard';
import CarService from '../../services/car.service';

const CarList = () => {
  const { t } = useTranslation();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchCars();
  }, [JSON.stringify(filters), currentPage]);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        page: currentPage,
      };
  
      const response = await CarService.getAllCars(params);
      setCars(response.results || response);
      setPagination({
        count: response.count || (response.length ?? 0),
        next: response.next || null,
        previous: response.previous || null,
      });
    } catch (error) {
      setError('Failed to fetch cars. Please try again later.');
      console.error(error);
    } finally {
      setLoading(false); // ✅ виправлення
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePreviousPage = () => {
    if (pagination.previous) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.next) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters */}
        <div className="w-full md:w-1/4">
          <CarFilters onFilterChange={handleFilterChange} />
        </div>
        
        {/* Car Listings */}
        <div className="w-full md:w-3/4">
          {/* Search Bar */}
          <div className="mb-6 flex">
            <input
              type="text"
              placeholder={t('common.search')}
              className="w-full px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onChange={(e) => 
                handleFilterChange({ ...filters, search: e.target.value })
              }
            />
            <button className="bg-indigo-900 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </button>
          </div>
          
          {/* Cars Grid */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="loader"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : cars.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No cars found matching your criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          )}
          
          {/* Pagination */}
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
              Page {currentPage} of {Math.ceil(pagination.count / 10)}
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
        </div>
      </div>
    </div>
  );
};

export default CarList;
