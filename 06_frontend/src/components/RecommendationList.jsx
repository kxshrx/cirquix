import ProductCard from './ProductCard';
import { Sparkles, AlertCircle } from 'lucide-react';

const RecommendationList = ({ 
  recommendations = [], 
  loading = false, 
  error = null, 
  onProductClick = null,
  strategy = 'hybrid'
}) => {
  if (loading) {
    return (
      <div className="card" style={{ padding: '2rem' }}>
        <div className="loading">
          <div className="spinner"></div>
          <span className="ml-2">Loading recommendations...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ padding: '1.5rem' }}>
        <div className="error">
          <AlertCircle size={20} />
          <span className="ml-2">
            Failed to load recommendations: {error.message || error}
          </span>
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <AlertCircle size={24} className="mx-auto mb-2 text-gray-400" />
        <p className="text-gray-600">No recommendations available</p>
        <p className="text-sm text-gray-500 mt-1">
          Try selecting a different user or product
        </p>
      </div>
    );
  }

  const getStrategyInfo = (strategy) => {
    const strategies = {
      'collaborative': {
        label: 'Collaborative Filtering',
        description: 'Based on similar users\' preferences',
        color: 'blue'
      },
      'popularity': {
        label: 'Popularity-Based',
        description: 'Most popular products in category',
        color: 'green'
      },
      'fallback': {
        label: 'Fallback Strategy',
        description: 'Cold start or emergency recommendations',
        color: 'orange'
      },
      'hybrid': {
        label: 'Hybrid System',
        description: 'Combined recommendation approach',
        color: 'purple'
      }
    };
    
    return strategies[strategy] || strategies['hybrid'];
  };

  const strategyInfo = getStrategyInfo(strategy);

  return (
    <div className="mt-6">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-4">
        <Sparkles size={24} className="text-blue-600" />
        <div>
          <h2 className="text-xl font-semibold">Recommended for You</h2>
          <div className="flex items-center gap-2 mt-1">
            <span 
              className={`status-indicator status-${strategyInfo.color === 'orange' ? 'error' : 'healthy'}`}
            >
              {strategyInfo.label}
            </span>
            <span className="text-sm text-gray-500">
              {strategyInfo.description}
            </span>
          </div>
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="recommendations-grid">
        {recommendations.map((recommendation, index) => {
          const product = {
            product_id: recommendation.product_id,
            title: recommendation.title || 'Unknown Product',
            category: recommendation.category || 'Unknown',
            price: recommendation.price || 'N/A',
            rating: recommendation.rating || 0,
            image_url: recommendation.image_url,
            confidence: recommendation.confidence
          };

          return (
            <div key={recommendation.product_id || index}>
              <ProductCard
                product={product}
                explanation={recommendation.explanation}
                onClick={onProductClick}
                isRecommendation={true}
              />
              
              {/* Confidence Score */}
              {recommendation.confidence && (
                <div className="mt-2 text-center">
                  <span className="text-xs text-gray-500">
                    Confidence: {(recommendation.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded text-center">
        <p className="text-sm text-gray-600">
          Showing {recommendations.length} recommendation{recommendations.length !== 1 ? 's' : ''} 
          {strategy && ` using ${strategyInfo.label.toLowerCase()}`}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Click on any product to explore its recommendations
        </p>
      </div>
    </div>
  );
};

export default RecommendationList;