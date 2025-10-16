/**
 * Utility functions for common operations
 */

/**
 * Format price string for display
 * @param {string|number} price - Price value
 * @returns {string} Formatted price string
 */
export const formatPrice = (price) => {
  if (!price) return 'Price not available';
  
  // Remove any existing currency symbols and parse
  const numericPrice = parseFloat(price.toString().replace(/[^0-9.-]+/g, ''));
  
  if (isNaN(numericPrice)) return 'Price not available';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numericPrice);
};

/**
 * Format rating for display
 * @param {number} rating - Rating value
 * @returns {string} Formatted rating string
 */
export const formatRating = (rating) => {
  if (!rating) return '0.0';
  return Number(rating).toFixed(1);
};

/**
 * Generate star rating component props
 * @param {number} rating - Rating value (0-5)
 * @returns {Object} Star rating configuration
 */
export const getStarRating = (rating) => {
  const numRating = Number(rating) || 0;
  const fullStars = Math.floor(numRating);
  const hasHalfStar = numRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return {
    fullStars,
    hasHalfStar,
    emptyStars,
    rating: numRating
  };
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

/**
 * Check if a string is a valid user ID format
 * @param {string} userId - User ID to validate
 * @returns {boolean} Whether the user ID is valid
 */
export const isValidUserId = (userId) => {
  if (!userId || typeof userId !== 'string') return false;
  return userId.trim().length > 0;
};

/**
 * Generate a placeholder image URL
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {string} text - Placeholder text
 * @returns {string} Placeholder image URL
 */
export const getPlaceholderImage = (width = 300, height = 300, text = 'Product') => {
  return `https://via.placeholder.com/${width}x${height}/e5e7eb/6b7280?text=${encodeURIComponent(text)}`;
};

/**
 * Format category name for display
 * @param {string} category - Category name
 * @returns {string} Formatted category name
 */
export const formatCategory = (category) => {
  if (!category || category.trim() === '') return 'Uncategorized';
  
  // Categories are already properly formatted in the metadata (e.g., "Camera & Photo", "Cell Phones & Accessories")
  // Just clean up any extra whitespace and return as-is
  return category.trim();
};

/**
 * Generate URL slug from text
 * @param {string} text - Text to convert to slug
 * @returns {string} URL-safe slug
 */
export const generateSlug = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Check if product has a valid price
 * @param {Object} product - Product object
 * @returns {boolean} Whether the product has a valid price
 */
export const hasValidPrice = (product) => {
  if (!product || !product.price) return false;
  const numericPrice = parseFloat(product.price.toString().replace(/[^0-9.-]+/g, ''));
  return !isNaN(numericPrice) && numericPrice > 0;
};

/**
 * Parse error message from API response
 * @param {Error} error - Error object
 * @returns {string} User-friendly error message
 */
export const parseErrorMessage = (error) => {
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
};