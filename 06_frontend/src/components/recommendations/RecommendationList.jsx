import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { recommendationsAPI } from '../../services/api';
import { parseErrorMessage } from '../../utils/helpers';
import RecommendationCard from './RecommendationCard';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import { Sparkles, RefreshCw } from 'lucide-react';

/**
 * Recommendation list component
 * Displays personalized recommendations with LLM explanations
 */
const RecommendationList = ({ 
  productId = null, 
  title = 'Personalized Recommendations',
  limit = 5 
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const lastRequestKeyRef = React.useRef('');

  const fetchRecommendations = async () => {
    if (!user?.user_id) return;

    setLoading(true);
    setError('');

    try {
      const params = {
        limit,
        use_llm: true
      };

      // Add product context if provided
      if (productId) {
        params.product_id = productId;
      }

      const data = await recommendationsAPI.getRecommendations(user.user_id, params);
      setRecommendations(data.recommendations || []);
    } catch (err) {
      setError(parseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.user_id) {
      return;
    }

    const requestKey = `${user.user_id}-${productId ?? 'none'}-${limit}`;

    if (lastRequestKeyRef.current === requestKey) {
      return;
    }

    lastRequestKeyRef.current = requestKey;
    fetchRecommendations();
  }, [user?.user_id, productId, limit]);

  const handleRefresh = () => {
    if (user?.user_id) {
      lastRequestKeyRef.current = `${user.user_id}-${productId ?? 'none'}-${limit}-${Date.now()}`;
    }
    fetchRecommendations();
  };

  if (!user) {
    return null;
  }

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-primary-600" />
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        </div>
        
        {!loading && (
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-primary-600 transition-colors duration-200"
            title="Refresh recommendations"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <ErrorMessage 
          message={error} 
          onDismiss={() => setError('')}
          title="Failed to load recommendations"
        />
      )}

      {/* Loading state */}
      {loading && (
        <LoadingSpinner message="Generating personalized recommendations..." />
      )}

      {/* Recommendations list */}
      {!loading && !error && (
        <>
          {recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.map((recommendation, index) => (
                <RecommendationCard 
                  key={`${recommendation.product_id}-${index}`} 
                  recommendation={recommendation} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Sparkles className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No recommendations available
              </h3>
              <p className="text-gray-500">
                We couldn't generate recommendations at this time. Try refreshing or browse more products to improve your recommendations.
              </p>
              <button
                onClick={handleRefresh}
                className="mt-4 btn-primary"
              >
                Try Again
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RecommendationList;