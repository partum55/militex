import React from 'react';
import { useTranslation } from 'react-i18next';

const VehicleDetailsStep = ({ formData, handleInputChange, nextStep }) => {
  const { t } = useTranslation();

  const validateStep = () => {
    // Required fields for this step
    const required = ['make', 'model', 'year', 'mileage', 'vehicle_type',
                     'condition', 'fuel_type', 'transmission'];

    return required.every(field => formData[field]);
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep()) {
      nextStep();
    } else {
      alert(t('forms.fillAllFields'));
    }
  };

  return (
    <form onSubmit={handleNext} className="px-2">
      <h2 className="text-xl font-semibold text-indigo-900 mb-4">{t('cars.vehicleDetails')}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
        {/* Make */}
        <div>
          <label className="block text-gray-700 mb-1 text-sm md:text-base" htmlFor="make">
            {t('cars.carMake')} *
          </label>
          <input
            type="text"
            id="make"
            name="make"
            value={formData.make}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
            required
          />
        </div>

        {/* Model */}
        <div>
          <label className="block text-gray-700 mb-1 text-sm md:text-base" htmlFor="model">
            {t('cars.carModel')} *
          </label>
          <input
            type="text"
            id="model"
            name="model"
            value={formData.model}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
            required
          />
        </div>

        {/* Year */}
        <div>
          <label className="block text-gray-700 mb-1 text-sm md:text-base" htmlFor="year">
            {t('cars.year')} *
          </label>
          <input
            type="number"
            id="year"
            name="year"
            value={formData.year}
            onChange={handleInputChange}
            min="1900"
            max={new Date().getFullYear()}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
            required
          />
        </div>

        {/* Mileage */}
        <div>
          <label className="block text-gray-700 mb-1 text-sm md:text-base" htmlFor="mileage">
            {t('cars.mileage')} *
          </label>
          <input
            type="number"
            id="mileage"
            name="mileage"
            value={formData.mileage}
            onChange={handleInputChange}
            min="0"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
            required
          />
        </div>

        {/* Vehicle Type */}
        <div>
          <label className="block text-gray-700 mb-1 text-sm md:text-base" htmlFor="vehicle_type">
            {t('cars.vehicleType')} *
          </label>
          <select
            id="vehicle_type"
            name="vehicle_type"
            value={formData.vehicle_type}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base bg-white"
            required
          >
            <option value="">{t('forms.select')}</option>
            <option value="car">Car</option>
            <option value="suv">SUV</option>
            <option value="truck">Truck</option>
            <option value="pickup">Pickup</option>
            <option value="van">Van</option>
            <option value="motorcycle">Motorcycle</option>
          </select>
        </div>

        {/* Condition */}
        <div>
          <label className="block text-gray-700 mb-1 text-sm md:text-base" htmlFor="condition">
            {t('cars.condition')} *
          </label>
          <select
            id="condition"
            name="condition"
            value={formData.condition}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base bg-white"
            required
          >
            <option value="">{t('forms.select')}</option>
            <option value="new">New</option>
            <option value="used">Used</option>
            <option value="damaged">Damaged</option>
          </select>
        </div>

        {/* Fuel Type */}
        <div>
          <label className="block text-gray-700 mb-1 text-sm md:text-base" htmlFor="fuel_type">
            {t('cars.fuelType')} *
          </label>
          <select
            id="fuel_type"
            name="fuel_type"
            value={formData.fuel_type}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base bg-white"
            required
          >
            <option value="">{t('forms.select')}</option>
            <option value="gasoline">Gasoline</option>
            <option value="diesel">Diesel</option>
            <option value="gas">Gas</option>
            <option value="electric">Electric</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>

        {/* Transmission */}
        <div>
          <label className="block text-gray-700 mb-1 text-sm md:text-base" htmlFor="transmission">
            {t('cars.transmission')} *
          </label>
          <select
            id="transmission"
            name="transmission"
            value={formData.transmission}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base bg-white"
            required
          >
            <option value="">{t('forms.select')}</option>
            <option value="manual">Manual</option>
            <option value="automatic">Automatic</option>
            <option value="semi-automatic">Semi-Automatic</option>
          </select>
        </div>

        {/* Body Type */}
        <div>
          <label className="block text-gray-700 mb-1 text-sm md:text-base" htmlFor="body_type">
            {t('cars.bodyType')}
          </label>
          <select
            id="body_type"
            name="body_type"
            value={formData.body_type}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base bg-white"
          >
            <option value="">{t('forms.select')}</option>
            <option value="sedan">Sedan</option>
            <option value="estate">Estate</option>
            <option value="suv">SUV</option>
            <option value="pickup">Pickup</option>
            <option value="hatchback">Hatchback</option>
            <option value="liftback">Liftback</option>
            <option value="coupe">Coupe</option>
            <option value="fastback">Fastback</option>
            <option value="hardtop">Hardtop</option>
          </select>
        </div>

        {/* Engine Size */}
        <div>
          <label className="block text-gray-700 mb-1 text-sm md:text-base" htmlFor="engine_size">
            {t('cars.engineSize')}
          </label>
          <input
            type="number"
            id="engine_size"
            name="engine_size"
            value={formData.engine_size}
            onChange={handleInputChange}
            min="0"
            step="0.1"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
          />
        </div>

        {/* Engine Power */}
        <div>
          <label className="block text-gray-700 mb-1 text-sm md:text-base" htmlFor="engine_power">
            {t('cars.enginePower')}
          </label>
          <input
            type="number"
            id="engine_power"
            name="engine_power"
            value={formData.engine_power}
            onChange={handleInputChange}
            min="0"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
          />
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          type="submit"
          className="bg-indigo-900 text-white px-4 py-2 rounded-lg hover:bg-indigo-800 transition duration-200 text-sm md:text-base"
        >
          {t('common.next')} →
        </button>
      </div>
    </form>
  );
};

export default VehicleDetailsStep;