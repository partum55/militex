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
  
  // Get base URL from environment or use current domain
  const baseUrl = process.env.REACT_APP_API_BASE_URL || '';
  
  // If the image path starts with /media, append it to the base URL
  if (imagePath.startsWith('/media/')) {
    return `${baseUrl}${imagePath}`;
  }

  // If the path is relative, make it absolute
  if (!imagePath.startsWith('/')) {
    return `${baseUrl}/media/${imagePath}`;
  }
  
  return `${baseUrl}${imagePath}`;
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
 * Debug uploaded files to see what's being sent in form data
 * @param {FormData} formData - The FormData object to debug
 * @param {Function} logger - Logging function (defaults to console.log)
 */
export const debugFormData = (formData, logger = console.log) => {
  if (!formData || !(formData instanceof FormData)) {
    logger('Not a valid FormData object');
    return;
  }

  logger('--- FormData Debug Start ---');
  // Log each entry in the FormData object
  for (let pair of formData.entries()) {
    const [key, value] = pair;
    if (value instanceof File) {
      logger(`${key}: File object - name: ${value.name}, size: ${value.size} bytes, type: ${value.type}`);
    } else {
      logger(`${key}: ${value}`);
    }
  }
  logger('--- FormData Debug End ---');
};

/**
 * Check if the browser fully supports FormData functionality
 * @returns {Object} Support status report
 */
export const checkBrowserFormDataSupport = () => {
  const supportReport = {
    formDataSupported: typeof FormData !== 'undefined',
    fileReaderSupported: typeof FileReader !== 'undefined',
    fileSupported: typeof File !== 'undefined',
    blobSupported: typeof Blob !== 'undefined'
  };

  console.log('Browser FormData support:', supportReport);

  // Create a test FormData to check if it works correctly
  try {
    const testData = new FormData();
    const testBlob = new Blob(['test'], { type: 'text/plain' });
    testData.append('testFile', testBlob, 'test.txt');
    testData.append('testField', 'test value');

    supportReport.canCreateFormData = true;
    supportReport.canAppendToFormData = true;

    // Check if we can read back the data
    const testFile = testData.get('testFile');
    supportReport.canRetrieveFile = testFile instanceof File || testFile instanceof Blob;
    supportReport.canRetrieveField = testData.get('testField') === 'test value';

    console.log('FormData functionality check:', supportReport);
    return supportReport;
  } catch (error) {
    console.error('Error testing FormData functionality:', error);
    supportReport.error = error.message;
    return supportReport;
  }
};

/**
 * Formats currency values
 * @param {number} value - The value to format
 * @param {string} currency - The currency code (default: USD)
 * @returns {string} Formatted currency value
 */
export const formatCurrency = (value, currency = 'USD') => {
  if (typeof value !== 'number') {
    value = parseFloat(value) || 0;
  }

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

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Return original if not valid date
    }

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch (e) {
    console.error('Date formatting error:', e);
    return dateString;
  }
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