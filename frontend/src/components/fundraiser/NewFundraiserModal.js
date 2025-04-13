import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDropzone } from 'react-dropzone';

const NewFundraiserModal = ({ onClose, onSubmit }) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxSize: 5242880, // 5MB
    maxFiles: 1
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (!title.trim()) {
      setError(t('fundraiser.titleRequired'));
      return;
    }

    if (!description.trim()) {
      setError(t('fundraiser.descriptionRequired'));
      return;
    }

    if (!targetAmount || isNaN(targetAmount) || parseFloat(targetAmount) <= 0) {
      setError(t('fundraiser.invalidAmount'));
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('target_amount', parseFloat(targetAmount));

    if (image) {
      formData.append('image', image);
    }

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-indigo-900">
              {t('fundraiser.startNewFundraiser')}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
                {error}
              </div>
            )}

            {/* Title Input */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="title">
                {t('fundraiser.title')} *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Target Amount Input */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="targetAmount">
                {t('fundraiser.targetAmount')} *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-700">
                  $
                </span>
                <input
                  type="number"
                  id="targetAmount"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Description Textarea */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="description">
                {t('fundraiser.description')} *
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="5"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              ></textarea>
            </div>

            {/* Image Upload */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">
                {t('fundraiser.uploadImage')} ({t('common.optional')})
              </label>

              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
                  isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-500'
                }`}
              >
                <input {...getInputProps()} />
                {imagePreview ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-32 max-w-full mb-2"
                    />
                    <p className="text-sm text-gray-500">
                      {t('common.clickToChange')}
                    </p>
                  </div>
                ) : isDragActive ? (
                  <p className="text-indigo-600">{t('common.dropFilesHere')}</p>
                ) : (
                  <div>
                    <p className="text-gray-600">{t('common.dragImageHere')}</p>
                    <p className="text-sm text-gray-500 mt-1">{t('common.orClickToSelect')}</p>
                    <p className="text-xs text-gray-400 mt-1">{t('common.maxFileSize')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="mr-2 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-900 text-white rounded-lg hover:bg-indigo-800 transition duration-200"
              >
                {t('fundraiser.createFundraiser')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewFundraiserModal;
