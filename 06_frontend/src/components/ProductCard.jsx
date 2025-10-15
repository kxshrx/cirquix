import { Star, Package, Tag } from 'lucide-react';

const ProductCard = ({ 
  product, 
  explanation = null, 
  onClick = null, 
  isRecommendation = false 
}) => {
  const {
    product_id,
    title = 'Unknown Product',
    category = 'Unknown',
    price = 'N/A',
    rating = 0,
    image_url = null,
    description = null
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

  const cardClass = isRecommendation 
    ? `card recommendation-card ${onClick ? 'cursor-pointer' : ''}` 
    : 'card product-card';

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
          <p className="text-gray-600 mb-3 text-sm">{description}</p>
        )}

        <div className="product-meta">
          <span>
            <Tag size={16} />
            {category}
          </span>
          
          {price !== 'N/A' && (
            <span className="font-semibold">
              ${typeof price === 'string' ? price : price.toFixed(2)}
            </span>
          )}
          
          {rating > 0 && (
            <div className="rating">
              {renderStars(rating)}
              <span className="ml-1 text-sm text-gray-600">
                ({rating.toFixed(1)})
              </span>
            </div>
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