import axios from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API service functions
export const apiService = {
  // Health check
  async checkHealth() {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  },

  // Get product details
  async getProduct(productId) {
    try {
      const response = await api.get(`/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch product:', error);
      throw error;
    }
  },

  // Get related products
  async getRelatedProducts(productId, limit = 5) {
    try {
      const response = await api.get(`/products/${productId}/related?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch related products:', error);
      throw error;
    }
  },

  // Get user details
  async getUser(userId) {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      throw error;
    }
  },

  // Get recommendations for a user
  async getRecommendations(userId, options = {}) {
    try {
      const { limit = 5, useLLM = true } = options;
      const response = await api.get(`/recommendations/${userId}`, {
        params: {
          limit,
          use_llm: useLLM,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      throw error;
    }
  },

  // Get LLM explanations
  async getLLMExplanations(data) {
    try {
      const response = await api.post('/llm/explain', data);
      return response.data;
    } catch (error) {
      console.error('Failed to get LLM explanations:', error);
      throw error;
    }
  },

  // Get LLM service status
  async getLLMStatus() {
    try {
      const response = await api.get('/llm/status');
      return response.data;
    } catch (error) {
      console.error('Failed to get LLM status:', error);
      throw error;
    }
  },

  // Get sample data for demo
  async getSampleData() {
    // This would ideally come from your backend, but for demo purposes
    // we'll provide some sample product IDs and user IDs
    return {
      sampleProducts: [
        'B01K8B8YA8', // Echo Dot
        'B075F9K5B9', // Some Electronics
        'B07DJKXH8D', // Another product
        'B08N5WRWNW', // Sample product
        'B01DFKC2SO', // Sample product
      ],
      sampleUsers: [
        'AHMNA5UK3V66O2V3DZSBJA4FYMOA',
        'A1234567890ABCDEFGHIJK',
        'A0987654321ZYXWVUTSRQP',
        'TEST_COLD_USER_123',
        'DEMO_USER_ACTIVE',
      ],
      defaultUser: 'AHMNA5UK3V66O2V3DZSBJA4FYMOA',
      defaultProduct: 'B01K8B8YA8',
    };
  },
};

export default apiService;