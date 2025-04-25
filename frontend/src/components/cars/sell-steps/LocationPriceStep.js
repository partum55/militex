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
    <form onSubmit={handleNext}>
      <h2 className="text-xl font-semibold text-indigo-900 mb-4">{t('cars.locationPriceDetails')}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Country */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="country">
            {t('cars.country')} *
          </label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        {/* City/Region */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="city">
            {t('cars.city')} *
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        {/* Price */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="price">
            {t('cars.price')} *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            min="0"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        {/* Negotiable */}
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            id="negotiable"
            name="negotiable"
            checked={formData.negotiable}
            onChange={handleInputChange}
            className="mr-2"
          />
          <label className="text-gray-700" htmlFor="negotiable">
            {t('cars.negotiable')}
          </label>
        </div>
      </div>

      {/* Description */}
      <div className="mb-6">
        <label className="block text-gray-700 mb-2" htmlFor="description">
          {t('cars.description')}
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows="4"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        ></textarea>
      </div>

      {/* Existing Photos (when editing) */}
      {isEditing && existingImages && existingImages.length > 0 && (
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">
            {t('cars.existingPhotos')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {existingImages.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={getImageUrl(image.image)}
                  alt={`Existing preview ${index}`}
                  className="w-full h-24 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photo Upload */}
      <div className="mb-6">
        <label className="block text-gray-700 mb-2">
          {isEditing ? t('cars.addMorePhotos') : t('cars.uploadPhoto')}
          {!isEditing && " *"}
        </label>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
            isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-500'
          }`}
        >
          <input {...getInputProps()} accept="image/*" />
          {isDragActive ? (
            <p className="text-indigo-600">{t('forms.dropFilesHere')}</p>
          ) : (
            <div>
              <p className="text-gray-600">{t('cars.dragPhoto')}</p>
              <p className="text-sm text-gray-500 mt-1">{t('forms.orClickToSelect')}</p>
              <p className="text-xs text-gray-400 mt-1">{t('forms.maxFileSize')}</p>
            </div>
          )}
        </div>

        {/* Preview uploaded images */}
        {uploadedImages.length > 0 && (
          <div className="mt-4">
            <h3 className="text-gray-700 mb-2">{t('forms.uploadedImages')}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {uploadedImages.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={file.preview}
                    alt={`Preview ${index}`}
                    className="w-full h-24 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
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
          className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400 transition duration-200"
        >
          ← {t('common.back')}
        </button>
        <button
          type="submit"
          className="bg-indigo-900 text-white px-6 py-2 rounded-lg hover:bg-indigo-800 transition duration-200"
        >
          {t('common.next')} →
        </button>
      </div>
    </form>
  );
};

export default LocationPriceStep;