import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Star, Tag, ShoppingCart, Heart, Share2, AlertCircle } from 'lucide-react';
import RecommendationList from '../components/RecommendationList';
import apiService from '../api/api';

const ProductDetail = ({ currentUser }) => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState({
    product: true,
    recommendations: false,
    related: false
  });
  const [error, setError] = useState({
    product: null,
    recommendations: null,
    related: null
  });

  useEffect(() => {
    if (productId) {
      loadProductDetails();
      if (currentUser) {
        loadRecommendations();
      }
      loadRelatedProducts();
    }
  }, [productId, currentUser]);

  const loadProductDetails = async () => {
    setLoading(prev => ({ ...prev, product: true }));
    setError(prev => ({ ...prev, product: null }));

    try {
      const productData = await apiService.getProduct(productId);
      setProduct(productData);
    } catch (error) {
      console.error('Failed to load product:', error);
      setError(prev => ({ ...prev, product: error }));
      
      // Create fallback product
      setProduct({
        product_id: productId,
        title: `Product ${productId}`,
        category: 'Unknown',
        price: 'N/A',
        rating: 0,
        description: 'Product details could not be loaded from the database.',
        image_url: null
      });
    } finally {
      setLoading(prev => ({ ...prev, product: false }));
    }
  };

  const loadRecommendations = async () => {
    if (!currentUser) return;

    setLoading(prev => ({ ...prev, recommendations: true }));
    setError(prev => ({ ...prev, recommendations: null }));

    try {
      const recommendationsData = await apiService.getRecommendations(currentUser.user_id, {
        limit: 6,
        useLLM: true,
        productId: productId
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

  const loadRelatedProducts = async () => {
    setLoading(prev => ({ ...prev, related: true }));
    setError(prev => ({ ...prev, related: null }));

    try {
      const relatedData = await apiService.getRelatedProducts(productId, 4);
      setRelatedProducts(relatedData.related_products || []);
    } catch (error) {
      console.error('Failed to load related products:', error);
      setError(prev => ({ ...prev, related: error }));
      setRelatedProducts([]);
    } finally {
      setLoading(prev => ({ ...prev, related: false }));
    }
  };

  const handleProductClick = (product) => {
    navigate(`/product/${product.product_id}`);
  };

  const handleBackClick = () => {
    navigate('/');
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="star" fill="currentColor" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="star" fill="currentColor" style={{ opacity: 0.5 }} />);
    }
    
    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="star" style={{ opacity: 0.3 }} />);
    }
    
    return stars;
  };

  const formatPrice = (price) => {
    if (price === 'N/A' || price === null || price === undefined) {
      return 'Price not available';
    }
    return `$${typeof price === 'string' ? price : price.toFixed(2)}`;
  };

  if (loading.product) {
    return (
      <div className="container">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container">
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Not Found</h3>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
          <button onClick={handleBackClick} className="btn btn-primary">
            <ArrowLeft size={16} />
            Back to Catalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Back Button */}
      <button 
        onClick={handleBackClick}
        className="btn btn-secondary mb-6 inline-flex items-center gap-2"
      >
        <ArrowLeft size={16} />
        Back to Catalog
      </button>

      {/* Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Product Image */}
        <div>
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.title}
              className="w-full h-96 object-cover rounded-lg border border-gray-200"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className="w-full h-96 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center flex-col" 
            style={{ display: product.image_url ? 'none' : 'flex' }}
          >
            <Package size={48} className="text-gray-400 mb-2" />
            <span className="text-gray-500">No image available</span>
          </div>
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-4">
            <span className="inline-flex items-center gap-1 text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
              <Tag size={14} />
              {product.category}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {product.title}
          </h1>

          {product.rating > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {renderStars(product.rating)}
              </div>
              <span className="text-lg text-gray-600">
                {product.rating.toFixed(1)} out of 5
              </span>
            </div>
          )}

          <div className="text-3xl font-bold text-gray-900 mb-6">
            {formatPrice(product.price)}
          </div>

          {product.description && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button className="btn btn-primary flex-1">
              <ShoppingCart size={16} />
              Add to Cart
            </button>
            <button className="btn btn-secondary">
              <Heart size={16} />
            </button>
            <button className="btn btn-secondary">
              <Share2 size={16} />
            </button>
          </div>

          {/* Product Details */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Product Details</h3>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-gray-600">Product ID:</dt>
                <dd className="text-gray-900 font-mono text-sm">{product.product_id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Category:</dt>
                <dd className="text-gray-900">{product.category}</dd>
              </div>
              {product.rating > 0 && (
                <div className="flex justify-between">
                  <dt className="text-gray-600">Rating:</dt>
                  <dd className="text-gray-900">{product.rating.toFixed(1)}/5.0</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {error.product && (
        <div className="error mb-6">
          <AlertCircle size={20} />
          <span className="ml-2">
            Product details may be incomplete: {error.product.message || 'Unknown error'}
          </span>
        </div>
      )}

      {/* Personalized Recommendations */}
      {currentUser && (
        <RecommendationList
          recommendations={recommendations}
          loading={loading.recommendations}
          error={error.recommendations}
          onProductClick={handleProductClick}
          strategy="hybrid"
        />
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Customers Also Viewed</h2>
          <div className="recommendations-grid">
            {relatedProducts.map(relatedProduct => (
              <div key={relatedProduct.product_id}>
                <div 
                  className="card recommendation-card cursor-pointer"
                  onClick={() => handleProductClick(relatedProduct)}
                >
                  {/* Simple related product card */}
                  <div className="mb-3">
                    <div className="product-image-placeholder">
                      <Package size={24} />
                      <span className="ml-2">No image</span>
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2">{relatedProduct.title || relatedProduct.product_id}</h3>
                  <p className="text-sm text-gray-600">Related Product</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Login Prompt for Non-authenticated Users */}
      {!currentUser && (
        <div className="card mt-8" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3 className="text-lg font-semibold mb-2">Want Personalized Recommendations?</h3>
          <p className="text-gray-600 mb-4">
            Sign in to see products recommended just for you based on your preferences and browsing history.
          </p>
          <button 
            onClick={handleBackClick}
            className="btn btn-primary"
          >
            Sign In for Recommendations
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;