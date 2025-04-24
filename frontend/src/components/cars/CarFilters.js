import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const CarFilters = ({ onFilterChange }) => {
  const { t } = useTranslation();
  
  const [filters, setFilters] = useState({
    min_price: '',
    max_price: '',
    min_year: '',
    max_year: '',
    min_mileage: '',
    max_mileage: '',
    make: '',
    model: '',
    fuel_type: '',
    transmission: '',
    body_type: '',
    condition: '',
    vehicle_type: '',
  });


  const makes = [
    'Ford', 'Toyota', 'Chevrolet', 'Honda', 'Jeep', 'BMW', 'Mercedes-Benz', 
    'Audi', 'Nissan', 'Volkswagen', 'Mitsubishi', 'Subaru', 'Hyundai', 'Kia'
  ];

  useEffect(() => {
    const handler = setTimeout(() => {
      const nonEmptyFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );
      
      onFilterChange(nonEmptyFilters);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [filters, onFilterChange]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked, value } = e.target;
    
    setFilters(prev => {
      if (name !== 'fuel_type' && name !== 'body_type') {
        return { ...prev, [name]: checked ? value : '' };
      }

      return prev;
    });
  };

  const resetFilters = () => {
    setFilters({
      min_price: '',
      max_price: '',
      min_year: '',
      max_year: '',
      min_mileage: '',
      max_mileage: '',
      make: '',
      model: '',
      fuel_type: '',
      transmission: '',
      body_type: '',
      condition: '',
      vehicle_type: '',
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-indigo-900">{t('cars.filters.title')}</h2>
        <button 
          onClick={resetFilters}
          className="text-indigo-600 hover:underline text-sm"
        >
          {t('cars.filters.reset')}
        </button>
      </div>
      
      {/* Price Range */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-700 mb-2">{t('cars.filters.priceRange')}</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <input
              type="number"
              name="min_price"
              placeholder={t('cars.filters.min')}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              value={filters.min_price}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <input
              type="number"
              name="max_price"
              placeholder={t('cars.filters.max')}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              value={filters.max_price}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
      
      {/* Year Range */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-700 mb-2">{t('cars.filters.yearRange')}</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <input
              type="number"
              name="min_year"
              placeholder={t('cars.filters.min')}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              min="1900"
              max={new Date().getFullYear()}
              value={filters.min_year}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <input
              type="number"
              name="max_year"
              placeholder={t('cars.filters.max')}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              min="1900"
              max={new Date().getFullYear()}
              value={filters.max_year}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
      
      {/* Mileage Range */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-700 mb-2">{t('cars.filters.mileageRange')}</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <input
              type="number"
              name="min_mileage"
              placeholder={t('cars.filters.min')}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              min="0"
              value={filters.min_mileage}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <input
              type="number"
              name="max_mileage"
              placeholder={t('cars.filters.max')}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              min="0"
              value={filters.max_mileage}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
      
      {/* Make Dropdown */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-700 mb-2">{t('cars.carMake')}</h3>
        <select
          name="make"
          className="w-full px-3 py-2 border rounded-lg text-sm"
          value={filters.make}
          onChange={handleInputChange}
        >
          <option value="">{t('cars.filters.all')}</option>
          {makes.map(make => (
            <option key={make} value={make}>{make}</option>
          ))}
        </select>
      </div>
      
      {/* Model Text Input */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-700 mb-2">{t('cars.carModel')}</h3>
        <input
          type="text"
          name="model"
          placeholder={t('cars.filters.enterModel')}
          className="w-full px-3 py-2 border rounded-lg text-sm"
          value={filters.model}
          onChange={handleInputChange}
        />
      </div>
      
      {/* Fuel Type */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-700 mb-2">{t('cars.fuelType')}</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              type="radio"
              id="fuel-any"
              name="fuel_type"
              value=""
              checked={filters.fuel_type === ''}
              onChange={handleInputChange}
              className="mr-2"
            />
            <label htmlFor="fuel-any" className="text-sm text-gray-700">
              {t('cars.filters.all')}
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="fuel-gasoline"
              name="fuel_type"
              value="gasoline"
              checked={filters.fuel_type === 'gasoline'}
              onChange={handleInputChange}
              className="mr-2"
            />
            <label htmlFor="fuel-gasoline" className="text-sm text-gray-700">
              {t('cars.filters.gasoline')}
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="fuel-diesel"
              name="fuel_type"
              value="diesel"
              checked={filters.fuel_type === 'diesel'}
              onChange={handleInputChange}
              className="mr-2"
            />
            <label htmlFor="fuel-diesel" className="text-sm text-gray-700">
              {t('cars.filters.diesel')}
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="fuel-electric"
              name="fuel_type"
              value="electric"
              checked={filters.fuel_type === 'electric'}
              onChange={handleInputChange}
              className="mr-2"
            />
            <label htmlFor="fuel-electric" className="text-sm text-gray-700">
              {t('cars.filters.electric')}
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="fuel-hybrid"
              name="fuel_type"
              value="hybrid"
              checked={filters.fuel_type === 'hybrid'}
              onChange={handleInputChange}
              className="mr-2"
            />
            <label htmlFor="fuel-hybrid" className="text-sm text-gray-700">
              {t('cars.filters.hybrid')}
            </label>
          </div>
        </div>
      </div>

      {/* Transmission */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-700 mb-2">{t('cars.transmission')}</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              type="radio"
              id="transmission-any"
              name="transmission"
              value=""
              checked={filters.transmission === ''}
              onChange={handleInputChange}
              className="mr-2"
            />
            <label htmlFor="transmission-any" className="text-sm text-gray-700">
              {t('cars.filters.all')}
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="transmission-manual"
              name="transmission"
              value="manual"
              checked={filters.transmission === 'manual'}
              onChange={handleInputChange}
              className="mr-2"
            />
            <label htmlFor="transmission-manual" className="text-sm text-gray-700">
              {t('cars.filters.manual')}
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="transmission-automatic"
              name="transmission"
              value="automatic"
              checked={filters.transmission === 'automatic'}
              onChange={handleInputChange}
              className="mr-2"
            />
            <label htmlFor="transmission-automatic" className="text-sm text-gray-700">
              {t('cars.filters.automatic')}
            </label>
          </div>
        </div>
      </div>
      
      {/* Vehicle Type */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-700 mb-2">{t('cars.vehicleType')}</h3>
        <select
          name="vehicle_type"
          className="w-full px-3 py-2 border rounded-lg text-sm"
          value={filters.vehicle_type}
          onChange={handleInputChange}
        >
          <option value="">{t('cars.filters.all')}</option>
          <option value="car">Car</option>
          <option value="suv">SUV</option>
          <option value="truck">Truck</option>
          <option value="pickup">Pickup</option>
          <option value="van">Van</option>
          <option value="motorcycle">Motorcycle</option>
        </select>
      </div>
      
      {/* Body Type */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-700 mb-2">{t('cars.bodyType')}</h3>
        <select
          name="body_type"
          className="w-full px-3 py-2 border rounded-lg text-sm"
          value={filters.body_type}
          onChange={handleInputChange}
        >
          <option value="">{t('cars.filters.all')}</option>
          <option value="sedan">Sedan</option>
          <option value="estate">Estate</option>
          <option value="suv">SUV</option>
          <option value="pickup">Pickup</option>
          <option value="hatchback">Hatchback</option>
          <option value="coupe">Coupe</option>
        </select>
      </div>
      
      {/* Condition */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-700 mb-2">{t('cars.condition')}</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              type="radio"
              id="condition-any"
              name="condition"
              value=""
              checked={filters.condition === ''}
              onChange={handleInputChange}
              className="mr-2"
            />
            <label htmlFor="condition-any" className="text-sm text-gray-700">
              {t('cars.filters.all')}
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="condition-new"
              name="condition"
              value="new"
              checked={filters.condition === 'new'}
              onChange={handleInputChange}
              className="mr-2"
            />
            <label htmlFor="condition-new" className="text-sm text-gray-700">
              {t('cars.filters.new')}
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="condition-used"
              name="condition"
              value="used"
              checked={filters.condition === 'used'}
              onChange={handleInputChange}
              className="mr-2"
            />
            <label htmlFor="condition-used" className="text-sm text-gray-700">
              {t('cars.filters.used')}
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="condition-damaged"
              name="condition"
              value="damaged"
              checked={filters.condition === 'damaged'}
              onChange={handleInputChange}
              className="mr-2"
            />
            <label htmlFor="condition-damaged" className="text-sm text-gray-700">
              {t('cars.filters.damaged')}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarFilters;
