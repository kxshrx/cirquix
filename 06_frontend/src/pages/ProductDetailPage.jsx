import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { formatPrice, getPlaceholderImage, formatCategory, parseErrorMessage } from '../utils/helpers';
import Header from '../components/common/Header';
import StarRating from '../components/common/StarRating';
import RecommendationList from '../components/recommendations/RecommendationList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { ArrowLeft, Package, Tag } from 'lucide-react';

/**
 * Product detail page
 * Shows detailed product information and related recommendations
 */
const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch product details
  const fetchProduct = async () => {
    if (!productId) {
      setError('No product ID provided');
      return;
    }

    console.log(`Loading product detail for ID: ${productId}`);
    setLoading(true);
    setError('');
    setProduct(null);

    try {
      const productData = await productsAPI.getProduct(productId);
      console.log(`Product data loaded:`, productData);
      setProduct(productData);
    } catch (err) {
      console.error(`Error loading product ${productId}:`, err);
      setError(parseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log(`ProductDetailPage mounted with productId: ${productId}`);
    fetchProduct();
  }, [productId]);

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSpinner message="Loading product details..." />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorMessage 
            message={error} 
            title="Product not found"
          />
          <div className="mt-6">
            <button
              onClick={handleGoBack}
              className="btn-secondary"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Product not found
            </h3>
            <p className="text-gray-500 mb-6">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={handleGoBack}
              className="btn-primary"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <div className="mb-6">
          <button
            onClick={handleGoBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </button>
        </div>

        {/* Product details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 p-6">
            {/* Product image */}
            <div className="lg:col-span-1">
              <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={product.image_url || getPlaceholderImage(500, 500, product.title)}
                  alt={product.title}
                  className="w-full h-full object-cover object-center"
                  onError={(e) => {
                    e.target.src = getPlaceholderImage(500, 500, product.title);
                  }}
                />
              </div>
            </div>

            {/* Product information */}
            <div className="mt-6 lg:mt-0 lg:col-span-1">
              {/* Category */}
              <div className="flex items-center space-x-2 mb-3">
                <Tag className="h-4 w-4 text-primary-600" />
                <span className="text-sm font-medium text-primary-600 uppercase tracking-wide">
                  {formatCategory(product.category)}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.title}
              </h1>

              {/* Rating */}
              {product.rating && (
                <div className="flex items-center space-x-4 mb-4">
                  <StarRating rating={product.rating} size="large" />
                  {product.rating_count && (
                    <span className="text-sm text-gray-500">
                      ({product.rating_count.toLocaleString()} reviews)
                    </span>
                  )}
                </div>
              )}

              {/* Price */}
              <div className="mb-6">
                <div className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </div>
              </div>

              {/* Product ID */}
              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Product ID:</span> {product.product_id}
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Description
                  </h3>
                  <div className="text-gray-700 leading-relaxed">
                    {product.description.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-2">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <RecommendationList 
          productId={product.product_id}
          title="You might also like"
          limit={5}
        />
      </main>
    </div>
  );
};

export default ProductDetailPage;