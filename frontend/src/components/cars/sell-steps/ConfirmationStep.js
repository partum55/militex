import React from 'react';
import { useTranslation } from 'react-i18next';

const ConfirmationStep = ({ formData, handleSubmit, prevStep, loading }) => {
  const { t } = useTranslation();

  return (
    <div className="px-2">
      <h2 className="text-xl font-semibold text-indigo-900 mb-4">{t('cars.allRight')}</h2>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-medium text-lg mb-3 text-center">
          {formData.year} {formData.make} {formData.model}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="space-y-2">
            <p className="text-gray-600 text-sm md:text-base">
              <span className="font-medium">{t('cars.mileage')}:</span> {formData.mileage.toLocaleString()} km
            </p>
            <p className="text-gray-600 text-sm md:text-base">
              <span className="font-medium">{t('cars.vehicleType')}:</span> {formData.vehicle_type}
            </p>
            <p className="text-gray-600 text-sm md:text-base">
              <span className="font-medium">{t('cars.condition')}:</span> {formData.condition}
            </p>
            <p className="text-gray-600 text-sm md:text-base">
              <span className="font-medium">{t('cars.fuelType')}:</span> {formData.fuel_type}
            </p>
            <p className="text-gray-600 text-sm md:text-base">
              <span className="font-medium">{t('cars.transmission')}:</span> {formData.transmission}
            </p>
            {formData.body_type && (
              <p className="text-gray-600 text-sm md:text-base">
                <span className="font-medium">{t('cars.bodyType')}:</span> {formData.body_type}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-gray-600 text-sm md:text-base">
              <span className="font-medium">{t('cars.country')}:</span> {formData.country}
            </p>
            <p className="text-gray-600 text-sm md:text-base">
              <span className="font-medium">{t('cars.city')}:</span> {formData.city}
            </p>
            <p className="text-gray-600 text-sm md:text-base">
              <span className="font-medium">{t('cars.price')}:</span> ${formData.price.toLocaleString()}
            </p>
            <p className="text-gray-600 text-sm md:text-base">
              <span className="font-medium">{t('cars.negotiable')}:</span> {formData.negotiable ? t('common.yes') : t('common.no')}
            </p>
            {formData.engine_size && (
              <p className="text-gray-600 text-sm md:text-base">
                <span className="font-medium">{t('cars.engineSize')}:</span> {formData.engine_size}
              </p>
            )}
            {formData.engine_power && (
              <p className="text-gray-600 text-sm md:text-base">
                <span className="font-medium">{t('cars.enginePower')}:</span> {formData.engine_power}
              </p>
            )}
          </div>
        </div>

        {formData.description && (
          <div className="mb-4">
            <h4 className="font-medium text-sm md:text-base">{t('cars.description')}:</h4>
            <p className="text-gray-600 text-sm md:text-base bg-white p-2 rounded-md mt-1 border border-gray-200">{formData.description}</p>
          </div>
        )}

        {/* Image preview section */}
        <div className="space-y-3">
          {/* Existing images (when editing) */}
          {formData.existing_images && formData.existing_images.length > 0 && (
            <div>
              <h4 className="font-medium text-sm md:text-base mb-2">{t('cars.existingPhotos')}:</h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                {formData.existing_images.map((image, index) => (
                  <div key={`existing-${index}`} className="relative">
                    <img
                      src={image.image}
                      alt={`Car image ${index + 1}`}
                      className="w-full h-16 object-cover rounded border border-gray-200"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New uploaded images */}
          {formData.uploaded_images.length > 0 && (
            <div>
              <h4 className="font-medium text-sm md:text-base mb-2">{t('forms.uploadedImages')}:</h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                {formData.uploaded_images.map((file, index) => (
                  <div key={`new-${index}`} className="relative">
                    <img
                      src={file.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-16 object-cover rounded border border-gray-200"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0 mt-6">
        <button
          type="button"
          onClick={prevStep}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition duration-200 order-2 sm:order-1 text-sm md:text-base"
          disabled={loading}
        >
          ← {t('common.back')}
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className={`${
            loading ? 'bg-indigo-700' : 'bg-indigo-900 hover:bg-indigo-800'
          } text-white px-4 py-2 rounded-lg transition duration-200 order-1 sm:order-2 text-sm md:text-base flex items-center justify-center`}
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('common.submitting')}
            </>
          ) : t('cars.sellCar')}
        </button>
      </div>
    </div>
  );
};

export default ConfirmationStep;