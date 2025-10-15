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

  // Get product catalog with search and filters
  async getProducts(options = {}) {
    try {
      const { search, category, limit = 50, offset = 0 } = options;
      
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString()
      });
      
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      
      const response = await api.get(`/products?${params}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch products catalog:', error);
      throw error;
    }
  },

  // Get categories for filtering
  async getCategories() {
    try {
      const response = await api.get('/products/categories');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Fallback categories
      return [
        'All Electronics',
        'Computers', 
        'Cell Phones & Accessories',
        'Sports & Outdoors',
        'AMAZON FASHION',
        'Portable Audio & Accessories'
      ];
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
      const { limit = 5, useLLM = true, productId = null } = options;
      const params = {
        limit,
        use_llm: useLLM,
      };
      
      if (productId) {
        params.current_product = productId;
      }
      
      const response = await api.get(`/recommendations/${userId}`, { params });
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
    // Use real user IDs from the database for better demo experience
    return {
      sampleProducts: [
        'B01K8B8YA8', // Echo Dot
        'B075X8471B', // Fire TV Stick
        'B07DJKXH8D', // Another product
        'B08N5WRWNW', // Sample product
        'B01DFKC2SO', // Sample product
      ],
      sampleUsers: [
        'AHMNA5UK3V66O2V3DZSBJA4FYMOA', // Real user with 419 interactions
        'AEIIRIHLIYKQGI7ZOCIJTRDF5NPQ', // Real user with 461 interactions
        'AHSV5AUFONH7QMMUPF7M6FUJRJ6Q_1', // Real user with 361 interactions
        'AECTQQX663PTF5UQ2RA5TUL3BXVQ', // Real user with 349 interactions
        'AFTZWAK3ZHAPCNSOT5GCKQDECBTQ', // Real user with 328 interactions
      ],
      defaultUser: 'AHMNA5UK3V66O2V3DZSBJA4FYMOA',
      defaultProduct: 'B01K8B8YA8',
    };
  },

  // User authentication (demo)
  async loginUser(userId) {
    try {
      const response = await api.get(`/users/${userId}`);
      return {
        success: true,
        user: response.data
      };
    } catch (error) {
      console.error('Login failed:', error);
      // For demo purposes, allow any user ID
      return {
        success: true,
        user: {
          user_id: userId,
          total_purchases: 0,
          purchase_history: []
        }
      };
    }
  },
};

export default apiService;