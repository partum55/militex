import React from 'react';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '../../../utils/helpers';

const LocationPriceStep = ({
  formData,
  handleInputChange,
  getRootProps,
  getInputProps,
  isDragActive,
  uploadedImages,
  existingImages = [],
  removeImage,
  removeExistingImage,
  nextStep,
  prevStep,
  isEditing = false
}) => {
  const { t } = useTranslation();

  const validateStep = () => {
    // Required fields for this step
    const required = ['country', 'city', 'price'];

    const isValid = required.every(field => formData[field]);

    if (!isValid) {
      alert(t('forms.fillAllFields'));
      return false;
    }

    if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      alert(t('cars.validPriceRequired'));
      return false;
    }

    // When creating a new car, require at least one image
    if (!isEditing && uploadedImages.length === 0) {
      alert('Please upload at least one image of your vehicle');
      return false;
    }

    // When editing, make sure there's at least one image (either existing or new)
    if (isEditing && existingImages.length === 0 && uploadedImages.length === 0) {
      alert('Please keep at least one image or upload a new one');
      return false;
    }

    return true;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep()) {
      nextStep();
    }
  };

  return (
    <form onSubmit={handleNext} className="px-2">
      <h2 className="text-xl font-semibold text-indigo-900 mb-4">{t('cars.locationPriceDetails')}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
        {/* Country */}
        <div>
          <label className="block text-gray-700 mb-1 text-sm md:text-base" htmlFor="country">
            {t('cars.country')} *
          </label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
            required
          />
        </div>

        {/* City/Region */}
        <div>
          <label className="block text-gray-700 mb-1 text-sm md:text-base" htmlFor="city">
            {t('cars.city')} *
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
            required
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-gray-700 mb-1 text-sm md:text-base" htmlFor="price">
            {t('cars.price')} *
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              min="0"
              className="w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
              required
            />
          </div>
        </div>

        {/* Negotiable */}
        <div className="flex items-center h-full pt-6">
          <input
            type="checkbox"
            id="negotiable"
            name="negotiable"
            checked={formData.negotiable}
            onChange={handleInputChange}
            className="mr-2 h-4 w-4"
          />
          <label className="text-gray-700 text-sm md:text-base" htmlFor="negotiable">
            {t('cars.negotiable')}
          </label>
        </div>
      </div>

      {/* Description */}
      <div className="mt-4">
        <label className="block text-gray-700 mb-1 text-sm md:text-base" htmlFor="description">
          {t('cars.description')}
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows="3"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
        ></textarea>
      </div>

      {/* Existing Photos (when editing) */}
      {isEditing && existingImages && existingImages.length > 0 && (
        <div className="mt-6">
          <label className="block text-gray-700 mb-2 text-sm md:text-base">
            {t('cars.existingPhotos')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {existingImages.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={getImageUrl(image.image)}
                  alt={`Existing preview ${index}`}
                  className="w-full h-24 object-cover rounded border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow"
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photo Upload */}
      <div className="mt-6">
        <label className="block text-gray-700 mb-2 text-sm md:text-base">
          {isEditing ? t('cars.addMorePhotos') : t('cars.uploadPhoto')}
          {!isEditing && " *"}
        </label>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition ${
            isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-500'
          }`}
        >
          <input {...getInputProps()} accept="image/*" />
          {isDragActive ? (
            <p className="text-indigo-600 text-sm md:text-base">{t('forms.dropFilesHere')}</p>
          ) : (
            <div>
              <p className="text-gray-600 text-sm md:text-base">{t('cars.dragPhoto')}</p>
              <p className="text-xs text-gray-500 mt-1">{t('forms.orClickToSelect')}</p>
              <p className="text-xs text-gray-400 mt-1">{t('forms.maxFileSize')}</p>
            </div>
          )}
        </div>

        {/* Preview uploaded images */}
        {uploadedImages.length > 0 && (
          <div className="mt-4">
            <h3 className="text-gray-700 mb-2 text-sm md:text-base">{t('forms.uploadedImages')}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {uploadedImages.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={file.preview}
                    alt={`Preview ${index}`}
                    className="w-full h-24 object-cover rounded border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={prevStep}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition duration-200 text-sm md:text-base"
        >
          ← {t('common.back')}
        </button>
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

export default LocationPriceStep;