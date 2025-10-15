import { Star, Package, Tag } from 'lucide-react';

const ProductCard = ({ 
  product, 
  explanation = null, 
  onClick = null, 
  isRecommendation = false,
  viewMode = 'grid' // 'grid' or 'list'
}) => {
  const {
    product_id,
    title = 'Unknown Product',
    category = 'Unknown',
    price = 'N/A',
    rating = 0,
    image_url = null,
    description = null,
    confidence = null
  } = product;

  const handleClick = () => {
    if (onClick) {
      onClick(product);
    }
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

  // List view layout
  if (viewMode === 'list' && !isRecommendation) {
    return (
      <div 
        className={`card p-4 ${onClick ? 'cursor-pointer hover:shadow-lg' : ''} transition-all`}
        onClick={handleClick}
      >
        <div className="flex gap-4">
          {/* Image */}
          <div className="flex-shrink-0">
            {image_url ? (
              <img 
                src={image_url} 
                alt={title}
                className="w-24 h-24 object-cover rounded"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="w-24 h-24 bg-gray-100 border border-gray-200 rounded flex items-center justify-center" 
              style={{ display: image_url ? 'none' : 'flex' }}
            >
              <Package size={20} className="text-gray-400" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
              {title}
            </h3>
            
            {description && (
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                {description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 mb-2">
              <span className="category-badge">
                <Tag size={14} />
                {category}
              </span>
              
              {rating > 0 && (
                <div className="flex items-center gap-1">
                  {renderStars(rating)}
                  <span className="text-sm text-gray-600 ml-1">
                    ({rating.toFixed(1)})
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="price-display">
                {formatPrice(price)}
              </span>
              
              {confidence && (
                <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {(confidence * 100).toFixed(0)}% match
                </span>
              )}
            </div>
            
            <div className="text-xs text-gray-500 mt-1">
              ID: {product_id}
            </div>
          </div>
        </div>

        {explanation && (
          <div className="recommendation-explanation mt-3">
            <strong>Why recommended:</strong> {explanation}
          </div>
        )}
      </div>
    );
  }

  // Grid view layout (default)
  const cardClass = isRecommendation 
    ? `card recommendation-card card-hover-effect ${onClick ? 'cursor-pointer' : ''}` 
    : `card product-card card-hover-effect ${onClick ? 'cursor-pointer' : ''}`;

  return (
    <div className={cardClass} onClick={handleClick}>
      {/* Product Image */}
      <div className="mb-4">
        {image_url ? (
          <img 
            src={image_url} 
            alt={title}
            className="product-image"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className="product-image-placeholder" 
          style={{ display: image_url ? 'none' : 'flex' }}
        >
          <Package size={24} />
          <span className="ml-2">No image available</span>
        </div>
      </div>

      {/* Product Info */}
      <div>
        <h3 className={isRecommendation ? 'text-lg font-semibold mb-2' : 'text-xl font-semibold mb-2'}>
          {title}
        </h3>
        
        {!isRecommendation && description && (
          <p className="text-gray-600 mb-3 text-sm line-clamp-3">{description}</p>
        )}

        <div className="product-meta">
          <span>
            <Tag size={16} />
            {category}
          </span>
          
          <span className="price-display">
            {formatPrice(price)}
          </span>
          
          {rating > 0 && (
            <div className="rating">
              {renderStars(rating)}
              <span className="ml-1 text-sm text-gray-600">
                ({rating.toFixed(1)})
              </span>
            </div>
          )}

          {confidence && (
            <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
              {(confidence * 100).toFixed(0)}% match
            </span>
          )}
        </div>

        {/* Product ID for demo */}
        <div className="mt-2">
          <span className="text-xs text-gray-500">
            ID: {product_id}
          </span>
        </div>

        {/* LLM Explanation */}
        {explanation && (
          <div className="recommendation-explanation">
            <strong>Why recommended:</strong> {explanation}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;