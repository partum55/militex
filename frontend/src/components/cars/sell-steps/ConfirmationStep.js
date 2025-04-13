import React from 'react';
import { useTranslation } from 'react-i18next';

const ConfirmationStep = ({ formData, handleSubmit, prevStep, loading }) => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h2 className="text-xl font-semibold text-indigo-900 mb-4">{t('cars.allRight')}</h2>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-medium text-lg mb-2">
          {formData.year} {formData.make} {formData.model}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-gray-600">{t('cars.mileage')}: {formData.mileage}</p>
            <p className="text-gray-600">{t('cars.vehicleType')}: {formData.vehicle_type}</p>
            <p className="text-gray-600">{t('cars.condition')}: {formData.condition}</p>
            <p className="text-gray-600">{t('cars.fuelType')}: {formData.fuel_type}</p>
            <p className="text-gray-600">{t('cars.transmission')}: {formData.transmission}</p>
            {formData.body_type && (
              <p className="text-gray-600">{t('cars.bodyType')}: {formData.body_type}</p>
            )}
          </div>
          
          <div>
            <p className="text-gray-600">{t('cars.country')}: {formData.country}</p>
            <p className="text-gray-600">{t('cars.city')}: {formData.city}</p>
            <p className="text-gray-600">{t('cars.price')}: ${formData.price}</p>
            <p className="text-gray-600">{t('cars.negotiable')}: {formData.negotiable ? t('common.yes') : t('common.no')}</p>
            {formData.engine_size && (
              <p className="text-gray-600">{t('cars.engineSize')}: {formData.engine_size}</p>
            )}
            {formData.engine_power && (
              <p className="text-gray-600">{t('cars.enginePower')}: {formData.engine_power}</p>
            )}
          </div>
        </div>
        
        {formData.description && (
          <div className="mb-4">
            <h4 className="font-medium">{t('cars.description')}:</h4>
            <p className="text-gray-600">{formData.description}</p>
          </div>
        )}
        
        {formData.uploaded_images.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">{t('forms.uploadedImages')}:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {formData.uploaded_images.map((file, index) => (
                <img
                  key={index}
                  src={file.preview}
                  alt={`Preview ${index}`}
                  className="w-full h-16 object-cover rounded"
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={prevStep}
          className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400 transition duration-200"
          disabled={loading}
        >
          ← {t('common.back')}
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className={`${
            loading ? 'bg-indigo-700' : 'bg-indigo-900 hover:bg-indigo-800'
          } text-white px-6 py-2 rounded-lg transition duration-200`}
          disabled={loading}
        >
          {loading ? t('common.submitting') : t('cars.sellCar')}
        </button>
      </div>
    </div>
  );
};

export default ConfirmationStep;
