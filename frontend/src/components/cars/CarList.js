import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import CarService from '../../services/car.service';
import CarFilters from './CarFilters';
import CarCard from './CarCard';

const CarList = () => {
  const { t } = useTranslation();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState('-created_at'); // Default sort by newest
  const [filters, setFilters] = useState({});

  useEffect(() => {
    // Reset pagination when filters change
    setPage(1);
    setCars([]);
    setHasMore(true);
    loadCars(1);
  }, [filters, sortBy]);

  const loadCars = async (pageNum) => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: pageNum,
        ordering: sortBy,
      };
      
      const response = await CarService.getAllCars(params);
      
      if (pageNum === 1) {
        setCars(response.results || response);
      } else {
        setCars(prev => [...prev, ...(response.results || response)]);
      }
      
      // Check if there are more pages
      if (response.next) {
        setHasMore(true);
      } else {
        setHasMore(false);
      }
      
      setError('');
    } catch (err) {
      setError('Failed to load vehicles. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadCars(nextPage);
    }
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
    setCars([]);
    setHasMore(true);
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
          {/* Sort options */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-indigo-900">{t('buy.availableVehicles')}</h2>
            <div className="flex items-center">
              <label htmlFor="sort" className="mr-2 text-gray-700">{t('common.sortBy')}:</label>
              <select
                id="sort"
                value={sortBy}
                onChange={handleSortChange}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="-created_at">{t('common.newest')}</option>
                <option value="price">{t('common.priceLowToHigh')}</option>
                <option value="-price">{t('common.priceHighToLow')}</option>
                <option value="-year">{t('common.yearNewToOld')}</option>
                <option value="year">{t('common.yearOldToNew')}</option>
                <option value="mileage">{t('common.mileageLowToHigh')}</option>
              </select>
            </div>
          </div>

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

          {/* Error message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <p>{error}</p>
            </div>
          )}

          {/* Car List */}
          {loading && page === 1 ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-900"></div>
            </div>
          ) : cars.length > 0 ? (
            <div className="space-y-4">
              {cars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">{t('common.noVehiclesFound')}</p>
            </div>
          )}

          {/* Loading indicator for more cars */}
          {loading && page > 1 && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-indigo-900"></div>
            </div>
          )}

          {/* Load more button */}
          {!loading && hasMore && cars.length > 0 && (
            <div className="text-center mt-8">
              <button
                onClick={loadMore}
                className="bg-indigo-900 text-white px-6 py-2 rounded-md hover:bg-indigo-800 transition-colors"
              >
                {t('common.loadMore')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarList;