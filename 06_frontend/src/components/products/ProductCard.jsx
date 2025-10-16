import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice, truncateText, getPlaceholderImage, formatCategory } from '../../utils/helpers';
import StarRating from '../common/StarRating';

/**
 * Product card component
 * Displays product information in a card format with click navigation
 */
const ProductCard = ({ product }) => {
  if (!product?.product_id) {
    return null;
  }

  const encodedProductId = encodeURIComponent(product.product_id);

  return (
    <Link 
      to={`/products/${encodedProductId}`}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 block group"
    >
      {/* Product image */}
      <div className="aspect-w-1 aspect-h-1 bg-gray-200">
        <img
          src={product.image_url || getPlaceholderImage(300, 300, product.title)}
          alt={product.title}
          className="w-full h-48 object-cover object-center"
          onError={(e) => {
            e.target.src = getPlaceholderImage(300, 300, product.title);
          }}
        />
      </div>

      {/* Product information */}
      <div className="p-4">
        {/* Category */}
        <div className="text-xs text-primary-600 font-medium uppercase tracking-wide mb-2">
          {formatCategory(product.category)}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
          {truncateText(product.title, 80)}
        </h3>

        {/* Rating */}
        {product.rating && (
          <div className="mb-2">
            <StarRating rating={product.rating} size="small" />
            {product.rating_count && (
              <span className="text-xs text-gray-500 ml-1">
                ({product.rating_count})
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-gray-900">
            {formatPrice(product.price)}
          </div>
          
          {/* View button - appears on hover */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="text-sm text-primary-600 font-medium">
              View Details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;