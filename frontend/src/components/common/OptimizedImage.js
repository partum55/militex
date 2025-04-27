import React, { useState, useEffect, memo } from 'react';
import { IMAGE_PATHS } from '../../utils/imagePaths';

// Base64 placeholder for immediate display while loading
const PLACEHOLDER_IMAGE_DATA = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNMTAwIDUwQzEwNy45NTYgNTAgMTE0LjYyIDQ1LjQ2MyAxMTQuNjIgMzguMzIxQzExMy40NDkgMzEuMzc4IDEwNy45NTYgMjUgMTAwIDI1QzkyLjA0MzkgMjUgODUuMzc5OSAzMS4zNzggODUuMzc5OSAzOC4zMjFDODUuMzc5OSA0NS40NjMgOTIuMDQzOSA1MCAxMDAgNTBaIiBmaWxsPSIjQTNBM0EzIi8+PHBhdGggZD0iTTEzNS40NDkgMTA1SDY0LjU1MDVDNjQuNTUwNSAxMDUuMDAyIDY0LjU1MDUgMTA1LjAwNSA2NC41NTA1IDEwNS4wMDhDNjQuNTUwNSA5My4wOTcgODAuMzczOCA4My4zNzUgMTAwIDgzLjM3NUMxMTkuNjI2IDgzLjM3NSAxMzUuNDQ5IDkzLjA5NyAxMzUuNDQ5IDEwNS4wMDhDMTM1LjQ0OSAxMDUuMDA1IDEzNS40NDkgMTA1LjAwMiAxMzUuNDQ5IDEwNVoiIGZpbGw9IiNBM0EzQTMiLz48dGV4dCB4PSIxMDAiIHk9IjEzNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNzE3MTcxIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';

/**
 * OptimizedImage component with loading and error handling
 * 
 * @param {string} src - The source URL for the image
 * @param {string} alt - Alt text for the image
 * @param {string} className - CSS classes for the image
 * @param {function} onError - Callback for when image fails to load
 * @param {string} fallbackSrc - Fallback image source if main source fails
 */
const OptimizedImage = memo(({ 
  src, 
  alt, 
  className = "", 
  onError = null,
  fallbackSrc = IMAGE_PATHS.CAR_PLACEHOLDER
}) => {
  const [imageSrc, setImageSrc] = useState(PLACEHOLDER_IMAGE_DATA);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!src) {
      setHasError(true);
      setImageSrc(fallbackSrc);
      return;
    }

    setHasError(false);
    setImageSrc(PLACEHOLDER_IMAGE_DATA); // Show placeholder while loading

    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
    };
    img.onerror = () => {
      setImageSrc(fallbackSrc);
      setHasError(true);
      if (onError) onError();
    };
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, onError, fallbackSrc]);

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={(e) => {
        e.currentTarget.src = fallbackSrc;
      }}
    />
  );
});

export default OptimizedImage;
