/**
 * Helper function to get the correct image path based on environment
 * @param {string} path - The image path relative to the public folder
 * @returns {string} - The correct image path for the current environment
 */
export const getImagePath = (path) => {
  // Remove any leading slash for consistency
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  // In development, images might be served directly from public
  // In production, they might be in /static
  const baseUrl = window.location.hostname === 'localhost' ? '' : '/static';
  
  return `${baseUrl}/${cleanPath}`;
};

// Common image paths used throughout the application
export const IMAGE_PATHS = {
  LOGO: 'logo.png',
  HERO_BG: 'images/military-vehicle-hero.jpg',
  MILITARY_HUMVEE: 'images/military-humvee.jpg',
  CAR_PLACEHOLDER: 'images/car-placeholder.jpg',
};
