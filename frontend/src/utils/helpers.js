// frontend/src/utils/helpers.js

/**
 * Helper functions for the application
 */

/**
 * Gets the full image URL by appending the base API URL if needed
 * @param {string} imagePath - The image path from the API
 * @param {string} fallbackImage - Fallback image to use if imagePath is empty
 * @returns {string} Complete image URL
 */
export const getImageUrl = (imagePath, fallbackImage = '/images/placeholder.jpg') => {
  if (!imagePath) {
    return fallbackImage;
  }
  
  // If the image path already starts with http, it's already a complete URL
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If the image path starts with a slash, it's a relative path from the root
  if (imagePath.startsWith('/')) {
    return `${window.location.origin}${imagePath}`;
  }
  
  // Otherwise, prepend the API URL
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  return `${API_URL}${imagePath}`;
};

/**
 * Creates an object URL for a file object
 * @param {File} file - The file object to create a URL for
 * @returns {string} Object URL
 */
export const createFilePreview = (file) => {
  if (file && typeof file === 'object') {
    return URL.createObjectURL(file);
  }
  return null;
};

/**
 * Revokes an object URL to prevent memory leaks
 * @param {string} url - The object URL to revoke
 */
export const revokeFilePreview = (url) => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};

/**
 * Formats currency values
 * @param {number} value - The value to format
 * @param {string} currency - The currency code (default: USD)
 * @returns {string} Formatted currency value
 */
export const formatCurrency = (value, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Formats dates in a user-friendly way
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

/**
 * Truncates text to a specific length with ellipsis
 * @param {string} text - The text to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, length = 100) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};
