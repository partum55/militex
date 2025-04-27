/**
 * Helper function to get the correct image path based on environment
 * @param {string} path - The image path relative to the public folder
 * @returns {string} - The correct image path for the current environment
 */
export const getImagePath = (path) => {
  if (!path) {
    return IMAGE_PATHS.CAR_PLACEHOLDER;
  }

  // If it's already a full URL
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // If it's a media path from Django
  if (path.startsWith('/media/')) {
    return process.env.REACT_APP_API_BASE_URL 
      ? `${process.env.REACT_APP_API_BASE_URL}${path}`
      : path;
  }

  // If it's a relative path without leading slash
  if (!path.startsWith('/')) {
    return `/${path}`;
  }

  return path;
};

/**
 * Check if an image exists at the provided URL
 * @param {string} url - Image URL to check
 * @returns {Promise<boolean>} - Promise resolving to true if image exists
 */
export const checkImageExists = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

// Image path constants
export const IMAGE_PATHS = {
  CAR_PLACEHOLDER: '/static/images/car-placeholder.jpg',
};
