import React from 'react';
import { Star, StarHalf } from 'lucide-react';
import { getStarRating } from '../../utils/helpers';

/**
 * Star rating display component
 * Shows star rating with full, half, and empty stars
 */
const StarRating = ({ rating, showRating = true, size = 'medium' }) => {
  const { fullStars, hasHalfStar, emptyStars } = getStarRating(rating);
  
  const sizeClasses = {
    small: 'h-3 w-3',
    medium: 'h-4 w-4',
    large: 'h-5 w-5'
  };

  const starSize = sizeClasses[size];

  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center">
        {/* Full stars */}
        {[...Array(fullStars)].map((_, i) => (
          <Star
            key={`full-${i}`}
            className={`${starSize} text-yellow-400 fill-current`}
          />
        ))}
        
        {/* Half star */}
        {hasHalfStar && (
          <StarHalf className={`${starSize} text-yellow-400 fill-current`} />
        )}
        
        {/* Empty stars */}
        {[...Array(emptyStars)].map((_, i) => (
          <Star
            key={`empty-${i}`}
            className={`${starSize} text-gray-300`}
          />
        ))}
      </div>
      
      {showRating && (
        <span className="text-sm text-gray-600 ml-1">
          {Number(rating || 0).toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;