import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import UserSelector from '../components/UserSelector';
import ProductSelector from '../components/ProductSelector';
import RecommendationList from '../components/RecommendationList';
import apiService from '../api/api';

const ProductPage = () => {
  // State management
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [currentProduct, setCurrentProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState({
    product: false,
    recommendations: false
  });
  const [error, setError] = useState({
    product: null,
    recommendations: null
  });
  const [apiStatus, setApiStatus] = useState({
    backend: null,
    llm: null
  });

  // Check API status on mount
  useEffect(() => {
    checkApiStatus();
  }, []);

  // Auto-load product and recommendations when both user and product are selected
  useEffect(() => {
    if (selectedUser && selectedProduct) {
      loadProductAndRecommendations();
    }
  }, [selectedUser, selectedProduct]);

  const checkApiStatus = async () => {
    try {
      // Check backend health
      const healthResponse = await apiService.checkHealth();
      setApiStatus(prev => ({ 
        ...prev, 
        backend: healthResponse.status === 'healthy' ? 'healthy' : 'error' 
      }));

      // Check LLM status
      try {
        const llmResponse = await apiService.getLLMStatus();
        setApiStatus(prev => ({ 
          ...prev, 
          llm: llmResponse.status === 'available' ? 'available' : 'error' 
        }));
      } catch (llmError) {
        setApiStatus(prev => ({ ...prev, llm: 'error' }));
      }
    } catch (error) {
      setApiStatus(prev => ({ ...prev, backend: 'error' }));
      console.error('API status check failed:', error);
    }
  };

  const loadProductAndRecommendations = async () => {
    if (!selectedUser || !selectedProduct) return;

    // Clear previous errors
    setError({ product: null, recommendations: null });

    // Load product details
    setLoading(prev => ({ ...prev, product: true }));
    try {
      const productData = await apiService.getProduct(selectedProduct);
      setCurrentProduct(productData);
    } catch (error) {
      console.error('Failed to load product:', error);
      setError(prev => ({ ...prev, product: error }));
      // Create fallback product data
      setCurrentProduct({
        product_id: selectedProduct,
        title: `Product ${selectedProduct}`,
        category: 'Unknown',
        price: 'N/A',
        rating: 0,
        description: 'Product details could not be loaded from the database.'
      });
    } finally {
      setLoading(prev => ({ ...prev, product: false }));
    }

    // Load recommendations
    setLoading(prev => ({ ...prev, recommendations: true }));
    try {
      const recommendationsData = await apiService.getRecommendations(selectedUser, {
        limit: 6,
        useLLM: true
      });
      setRecommendations(recommendationsData.recommendations || []);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      setError(prev => ({ ...prev, recommendations: error }));
      setRecommendations([]);
    } finally {
      setLoading(prev => ({ ...prev, recommendations: false }));
    }
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product.product_id);
  };

  const renderApiStatus = () => (
    <div className="card mb-4" style={{ padding: '1rem' }}>
      <h3 className="font-semibold mb-2">API Status</h3>
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          {apiStatus.backend === 'healthy' ? (
            <CheckCircle size={16} className="text-green-600" />
          ) : apiStatus.backend === 'error' ? (
            <XCircle size={16} className="text-red-600" />
          ) : (
            <AlertCircle size={16} className="text-yellow-600" />
          )}
          <span className="text-sm">
            Backend: {apiStatus.backend || 'Checking...'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {apiStatus.llm === 'available' ? (
            <CheckCircle size={16} className="text-green-600" />
          ) : apiStatus.llm === 'error' ? (
            <XCircle size={16} className="text-red-600" />
          ) : (
            <AlertCircle size={16} className="text-yellow-600" />
          )}
          <span className="text-sm">
            LLM Service: {apiStatus.llm || 'Checking...'}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <h1>E-commerce Recommendation Demo</h1>
        <p>Experience AI-powered product recommendations with explanations</p>
      </header>

      {/* API Status */}
      {renderApiStatus()}

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <UserSelector 
          selectedUser={selectedUser}
          onUserChange={setSelectedUser}
        />
        <ProductSelector 
          selectedProduct={selectedProduct}
          onProductChange={setSelectedProduct}
          onLoadProduct={loadProductAndRecommendations}
        />
      </div>

      {/* Current Product Display */}
      {currentProduct && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Current Product</h2>
          {loading.product ? (
            <div className="card" style={{ padding: '2rem' }}>
              <div className="loading">
                <div className="spinner"></div>
                <span className="ml-2">Loading product details...</span>
              </div>
            </div>
          ) : (
            <ProductCard product={currentProduct} />
          )}
          
          {error.product && (
            <div className="error">
              <AlertCircle size={20} />
              <span className="ml-2">
                Product details unavailable: {error.product.message || 'Unknown error'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Recommendations */}
      {selectedUser && selectedProduct && (
        <RecommendationList
          recommendations={recommendations}
          loading={loading.recommendations}
          error={error.recommendations}
          onProductClick={handleProductClick}
          strategy="hybrid"
        />
      )}

      {/* Instructions */}
      {!selectedUser || !selectedProduct ? (
        <div className="card mt-6" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3 className="text-lg font-semibold mb-2">Getting Started</h3>
          <p className="text-gray-600 mb-4">
            Select a user and product above to see personalized recommendations with AI explanations
          </p>
          <div className="text-sm text-gray-500">
            <p>🤖 This demo showcases:</p>
            <ul className="mt-2 space-y-1">
              <li>• Hybrid recommendation algorithms</li>
              <li>• AI-generated explanations via LLM</li>
              <li>• Cold-start user handling</li>
              <li>• Real-time product recommendations</li>
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ProductPage;