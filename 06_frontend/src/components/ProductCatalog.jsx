import { useState, useEffect } from 'react';
import { Package, Filter, Grid, List } from 'lucide-react';
import ProductCard from './ProductCard';
import apiService from '../api/api';

const ProductCatalog = ({ 
  onProductClick, 
  searchQuery = '', 
  selectedCategory = '',
  currentUser
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('rating'); // 'price', 'rating', 'name'

  useEffect(() => {
    loadProducts();
  }, [searchQuery, selectedCategory]);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to fetch from backend first, fall back to sample data
      const result = await apiService.getProducts({
        search: searchQuery,
        category: selectedCategory,
        limit: 50
      });
      
      setProducts(result.products || []);
    } catch (error) {
      console.error('Failed to load products:', error);
      setError('Failed to load products. Showing sample data.');
      
      // Fallback to sample products
      try {
        const sampleData = await apiService.getSampleProducts();
        let filteredProducts = sampleData.products;
        
        // Apply search filter
        if (searchQuery) {
          filteredProducts = filteredProducts.filter(product =>
            product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.category.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        
        // Apply category filter
        if (selectedCategory) {
          filteredProducts = filteredProducts.filter(product =>
            product.category === selectedCategory
          );
        }
        
        setProducts(filteredProducts);
      } catch (sampleError) {
        setError('Failed to load product catalog.');
        setProducts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const sortProducts = (products, sortBy) => {
    return [...products].sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return (a.price || 0) - (b.price || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  };

  const sortedProducts = sortProducts(products, sortBy);

  if (loading) {
    return (
      <div className="container">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="container">
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Found</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {searchQuery ? `Search Results for "${searchQuery}"` : 
             selectedCategory ? selectedCategory : 'All Products'}
          </h2>
          <p className="text-gray-600 mt-1">
            {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''} found
            {currentUser && ` for ${currentUser.user_id}`}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Sort */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="select text-sm"
              style={{ padding: '0.5rem', minWidth: '120px' }}
            >
              <option value="rating">Top Rated</option>
              <option value="price">Price: Low to High</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 rounded">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && products.length > 0 && (
        <div className="error mb-6">
          {error}
        </div>
      )}

      {/* Products Grid/List */}
      {sortedProducts.length > 0 ? (
        <div className={
          viewMode === 'grid' 
            ? 'recommendations-grid' 
            : 'space-y-4'
        }>
          {sortedProducts.map(product => (
            <ProductCard
              key={product.product_id}
              product={product}
              onClick={onProductClick}
              isRecommendation={false}
              viewMode={viewMode}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No products match your search</h3>
          <p className="text-gray-600">Try adjusting your search terms or browse all categories</p>
        </div>
      )}

      {/* Load More Button (placeholder for pagination) */}
      {sortedProducts.length >= 10 && (
        <div className="text-center mt-8">
          <button className="btn btn-secondary">
            Load More Products
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCatalog;