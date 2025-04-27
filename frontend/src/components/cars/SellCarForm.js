import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDropzone } from 'react-dropzone';
import CarService from '../../services/car.service';
import { createFilePreview, revokeFilePreview } from '../../utils/helpers';

// Step components
import VehicleDetailsStep from './sell-steps/VehicleDetailsStep';
import LocationPriceStep from './sell-steps/LocationPriceStep';
import ConfirmationStep from './sell-steps/ConfirmationStep';

const SellCarForm = ({ initialData, isEditing = false, carId, onSuccess }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Form data state with default values or initial data if editing
  const [formData, setFormData] = useState({
    make: initialData?.make || '',
    model: initialData?.model || '',
    year: initialData?.year || '',
    mileage: initialData?.mileage || '',
    vehicle_type: initialData?.vehicle_type || '',
    condition: initialData?.condition || '',
    fuel_type: initialData?.fuel_type || '',
    transmission: initialData?.transmission || '',
    body_type: initialData?.body_type || '',
    country: initialData?.country || '',
    city: initialData?.city || '',
    price: initialData?.price || '',
    negotiable: initialData?.negotiable || false,
    engine_size: initialData?.engine_size || '',
    engine_power: initialData?.engine_power || '',
    description: initialData?.description || '',
    uploaded_images: [],
    existing_images: initialData?.images || [],
    images_to_delete: [] // Track IDs of images to delete during update
  });

  // UI state
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // File upload handling
  const onDrop = useCallback((acceptedFiles) => {
    // Create proper File objects with previews
    const filesWithPreviews = acceptedFiles.map(file =>
      Object.assign(file, {
        preview: createFilePreview(file)
      })
    );

    setFormData(prevData => ({
      ...prevData,
      uploaded_images: [
        ...prevData.uploaded_images,
        ...filesWithPreviews
      ]
    }));

    console.log(`Dropped ${acceptedFiles.length} files. Total images: ${formData.uploaded_images.length + acceptedFiles.length}`);
  }, [formData.uploaded_images.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 5242880, // 5MB
  });

  // Clean up previews on unmount
  useEffect(() => {
    return () => {
      formData.uploaded_images.forEach(file => {
        if (file.preview) {
          revokeFilePreview(file.preview);
        }
      });
    };
  }, [formData.uploaded_images]);

  const removeImage = (index) => {
    setFormData(prevData => {
      const newImages = [...prevData.uploaded_images];
      const removed = newImages.splice(index, 1)[0];

      // Revoke the object URL to avoid memory leaks
      if (removed.preview) {
        revokeFilePreview(removed.preview);
      }

      return {
        ...prevData,
        uploaded_images: newImages
      };
    });
  };

  const removeExistingImage = (index) => {
    setFormData(prevData => {
      const newImages = [...prevData.existing_images];
      const removedImage = newImages.splice(index, 1)[0];

      // If the image has an ID, add it to the list of images to delete
      const imagesToDelete = [...prevData.images_to_delete];
      if (removedImage && removedImage.id) {
        imagesToDelete.push(removedImage.id);
      }

      return {
        ...prevData,
        existing_images: newImages,
        images_to_delete: imagesToDelete
      };
    });
  };

  // Form handling
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const nextStep = () => {
    window.scrollTo(0, 0);
    setCurrentStep(prevStep => prevStep + 1);
  };

  const prevStep = () => {
    window.scrollTo(0, 0);
    setCurrentStep(prevStep => prevStep - 1);
  };

  const validateForm = () => {
    // Base required fields
    const requiredFields = [
      'make', 'model', 'year', 'mileage', 'vehicle_type',
      'condition', 'fuel_type', 'transmission', 'country',
      'city', 'price'
    ];

    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return false;
    }

    // Validate numeric fields
    if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      setError('Please enter a valid price');
      return false;
    }

    if (isNaN(parseInt(formData.year)) || parseInt(formData.year) < 1900 || parseInt(formData.year) > new Date().getFullYear()) {
      setError('Please enter a valid year');
      return false;
    }

    if (isNaN(parseInt(formData.mileage)) || parseInt(formData.mileage) < 0) {
      setError('Please enter a valid mileage');
      return false;
    }

    // Validate that there's at least one image when creating a new car
    if (!isEditing && formData.uploaded_images.length === 0) {
      setError('Please upload at least one image of your vehicle');
      return false;
    }

    // When editing, ensure there's at least one image remaining
    if (isEditing && formData.existing_images.length === 0 && formData.uploaded_images.length === 0) {
      setError('Please keep at least one image or upload a new one');
      return false;
    }

    return true;
  };

  // Helper function to debug FormData
  const debugFormData = (formData) => {
    console.log('--- FormData Debug Start ---');
    for (let pair of formData.entries()) {
      const [key, value] = pair;
      if (value instanceof File) {
        console.log(`${key}: File object - name: ${value.name}, size: ${value.size} bytes, type: ${value.type}`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }
    console.log('--- FormData Debug End ---');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      window.scrollTo(0, 0);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare data for submission
      const formDataToSubmit = new FormData();

      // Add simple fields
      Object.entries(formData).forEach(([key, value]) => {
        // Skip special fields that need special handling
        if (
          key !== 'uploaded_images' &&
          key !== 'existing_images' &&
          key !== 'images_to_delete' &&
          value !== ''
        ) {
          formDataToSubmit.append(key, value);
        }
      });

      // Add uploaded images
      formData.uploaded_images.forEach((image) => {
        formDataToSubmit.append('uploaded_images', image);
      });

      // Add image IDs to delete when editing
      if (isEditing && formData.images_to_delete.length > 0) {
        formDataToSubmit.append('images_to_delete', JSON.stringify(formData.images_to_delete));
      }

      // Debug what's being sent
      console.log(`Submitting form with ${formData.uploaded_images.length} new images and ${formData.images_to_delete.length} images to delete`);
      debugFormData(formDataToSubmit);

      if (isEditing && carId) {
        // For editing, we'll need to handle existing images differently
        await CarService.updateCar(carId, formDataToSubmit);
      } else {
        // For creating new
        await CarService.createCar(formDataToSubmit);
      }

      setSuccess(true);

      // Clean up previews
      formData.uploaded_images.forEach(file => {
        if (file.preview) {
          revokeFilePreview(file.preview);
        }
      });

      if (onSuccess) {
        onSuccess();
      } else {
        // Redirect after a delay
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      }
    } catch (error) {
      console.error('Submission error:', error);
      let errorMessage = 'Failed to submit. Please check your information and try again.';

      // Try to extract more detailed error messages
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      }

      setError(errorMessage);
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  // Render appropriate step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <VehicleDetailsStep
            formData={formData}
            handleInputChange={handleInputChange}
            nextStep={nextStep}
            isEditing={isEditing}
          />
        );
      case 2:
        return (
          <LocationPriceStep
            formData={formData}
            handleInputChange={handleInputChange}
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            isDragActive={isDragActive}
            uploadedImages={formData.uploaded_images}
            existingImages={formData.existing_images}
            removeImage={removeImage}
            removeExistingImage={removeExistingImage}
            nextStep={nextStep}
            prevStep={prevStep}
            isEditing={isEditing}
          />
        );
      case 3:
        return (
          <ConfirmationStep
            formData={formData}
            handleSubmit={handleSubmit}
            prevStep={prevStep}
            loading={loading}
            isEditing={isEditing}
          />
        );
      default:
        return <div>Invalid step</div>;
    }
  };

  if (success) {
    return (
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
        <p className="font-bold">Success!</p>
        <p>
          {isEditing
            ? t('cars.carUpdatedSuccess')
            : t('cars.carCreatedSuccess')
          }
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-lg shadow-md p-4 md:p-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Progress indicator */}
      <div className="mb-6 px-2">
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep >= 1 ? 'bg-indigo-900 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            1
          </div>
          <div className={`h-1 flex-1 ${
            currentStep >= 2 ? 'bg-indigo-900' : 'bg-gray-300'
          }`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep >= 2 ? 'bg-indigo-900 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            2
          </div>
          <div className={`h-1 flex-1 ${
            currentStep >= 3 ? 'bg-indigo-900' : 'bg-gray-300'
          }`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep >= 3 ? 'bg-indigo-900 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            3
          </div>
        </div>

        {/* Step labels - only visible on larger screens */}
        <div className="hidden md:flex justify-between mt-2 text-xs text-gray-500">
          <span className="w-8 text-center">{t('cars.vehicleDetails')}</span>
          <span className="flex-1"></span>
          <span className="w-8 text-center">{t('cars.locationPriceDetails')}</span>
          <span className="flex-1"></span>
          <span className="w-8 text-center">{t('cars.allRight')}</span>
        </div>
      </div>

      {renderStep()}
    </div>
  );
};

export default SellCarForm;