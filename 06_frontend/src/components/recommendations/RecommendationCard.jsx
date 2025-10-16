import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatPrice, getPlaceholderImage, formatCategory } from '../../utils/helpers';
import StarRating from '../common/StarRating';
import { Lightbulb } from 'lucide-react';

/**
 * Recommendation card component
 * Displays recommended product with LLM-generated explanation
 */
const RecommendationCard = ({ recommendation }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/products/${recommendation.product_id}`);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={handleClick}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Product image */}
        <div className="sm:w-32 sm:h-32 w-full h-48 flex-shrink-0">
          <img
            src={recommendation.image_url || getPlaceholderImage(200, 200, recommendation.title)}
            alt={recommendation.title}
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              e.target.src = getPlaceholderImage(200, 200, recommendation.title);
            }}
          />
        </div>

        {/* Product info and explanation */}
        <div className="flex-1 p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              {/* Category */}
              <div className="text-xs text-primary-600 font-medium uppercase tracking-wide mb-1">
                {formatCategory(recommendation.category)}
              </div>

              {/* Title */}
              <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                {recommendation.title}
              </h3>

              {/* Rating and price */}
              <div className="flex items-center justify-between mb-3">
                {recommendation.rating && (
                  <StarRating rating={recommendation.rating} size="small" />
                )}
                <div className="text-lg font-bold text-gray-900">
                  {formatPrice(recommendation.price)}
                </div>
              </div>
            </div>

            {/* Confidence indicator */}
            {recommendation.confidence && (
              <div className="ml-2 text-right">
                <div className="text-xs text-gray-500 mb-1">Match</div>
                <div className="text-sm font-semibold text-primary-600">
                  {Math.round(recommendation.confidence * 100)}%
                </div>
              </div>
            )}
          </div>

          {/* LLM Explanation */}
          {recommendation.explanation && (
            <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-400">
              <div className="flex items-start space-x-2">
                <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-medium text-blue-800 mb-1">
                    Why this recommendation?
                  </h4>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    {recommendation.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* View button */}
          <div className="mt-3 flex justify-end">
            <span className="text-sm text-primary-600 font-medium hover:text-primary-700">
              View Product →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;