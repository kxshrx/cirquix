import axios from 'axios';

/**
 * API service for communicating with the backend
 * Base URL is configured based on environment:
 * - Production: Uses VITE_API_URL from .env.production
 * - Development: Uses /api proxy
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * User API methods
 */
export const userAPI = {
  /**
   * Validate and fetch user information
   * @param {string} userId - The user ID to validate
   * @returns {Promise<Object>} User data with interaction history
   */
  getUserInfo: async (userId) => {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  }
};

/**
 * Products API methods
 */
export const productsAPI = {
  /**
   * Get products catalog with pagination and filtering
   * @param {Object} params - Query parameters
   * @param {number} params.limit - Number of products to fetch
   * @param {number} params.offset - Number of products to skip
   * @param {string} params.search - Search query for product title
   * @param {string} params.category - Filter by category
   * @returns {Promise<Object>} Products data with pagination info
   */
  getProducts: async (params = {}) => {
    const response = await apiClient.get('/products/', { params });
    return response.data;
  },

  /**
   * Get detailed information for a specific product
   * @param {string} productId - The product ID
   * @returns {Promise<Object>} Product details
   */
  getProduct: async (productId) => {
    const response = await apiClient.get(`/products/${productId}`);
    return response.data;
  },

  /**
   * Get all available product categories
   * @returns {Promise<Array<string>>} List of categories
   */
  getCategories: async () => {
    const response = await apiClient.get('/products/categories');
    return response.data;
  },

  /**
   * Get products related to a specific product
   * @param {string} productId - The product ID
   * @param {number} limit - Number of related products to fetch
   * @returns {Promise<Array<Object>>} Related products
   */
  getRelatedProducts: async (productId, limit = 5) => {
    const response = await apiClient.get(`/products/${productId}/related`, {
      params: { limit }
    });
    return response.data;
  }
};

/**
 * Recommendations API methods
 */
export const recommendationsAPI = {
  /**
   * Get personalized recommendations for a user
   * @param {string} userId - The user ID
   * @param {Object} params - Query parameters
   * @param {number} params.limit - Number of recommendations to fetch
   * @param {boolean} params.use_llm - Whether to include LLM explanations
   * @param {string} params.product_id - Optional product ID for context-based recommendations
   * @returns {Promise<Object>} Recommendations with explanations
   */
  getRecommendations: async (userId, params = {}) => {
    const response = await apiClient.get(`/recommendations/${userId}`, { params });
    return response.data;
  }
};

export default apiClient;