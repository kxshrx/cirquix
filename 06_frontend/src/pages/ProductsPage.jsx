import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { parseErrorMessage, hasValidPrice } from '../utils/helpers';
import Header from '../components/common/Header';
import ProductFilters from '../components/products/ProductFilters';
import ProductGrid from '../components/products/ProductGrid';
import ErrorMessage from '../components/common/ErrorMessage';

/**
 * Products catalog page
 * Displays products with search, filtering, and pagination
 */
const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});
  
  // URL search parameters for sharing and bookmarking
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get current filter values from URL (memoized for stability)
  const currentSearch = useMemo(() => searchParams.get('search') || '', [searchParams]);
  const currentCategory = useMemo(() => searchParams.get('category') || '', [searchParams]);
  const currentPage = useMemo(() => parseInt(searchParams.get('page') || '1', 10), [searchParams]);
  const limit = 20; // Products per page

  // Update URL when filters change
  const paramsString = useMemo(() => searchParams.toString(), [searchParams]);

  const updateURL = useCallback((search, category, page = 1) => {
    const params = new URLSearchParams();
    
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (page > 1) params.set('page', page.toString());
    
    const newSearch = params.toString();
    if (newSearch === paramsString) {
      return;
    }

    setSearchParams(params);
  }, [paramsString, setSearchParams]);

  // Fetch products based on current filters
  const fetchProducts = async (search = currentSearch, category = currentCategory, page = currentPage) => {
    setLoading(true);
    setError('');

    try {
      const offset = (page - 1) * limit;
      const params = {
        limit,
        offset,
        ...(search && { search }),
        ...(category && { category })
      };

      const data = await productsAPI.getProducts(params);
      
      // Filter out products without valid prices
      const productsWithPrices = (data.products || []).filter(hasValidPrice);
      
      setProducts(productsWithPrices);
      setPagination({
        currentPage: page,
        totalPages: Math.ceil(data.total / limit),
        hasMore: data.has_more,
        total: data.total,
        filteredTotal: productsWithPrices.length
      });
    } catch (err) {
      setError(parseErrorMessage(err));
      setProducts([]);
      setPagination({});
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories for filter dropdown
  const fetchCategories = async () => {
    try {
      const categoryList = await productsAPI.getCategories();
      setCategories(categoryList || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  // Load initial data and categories
  useEffect(() => {
    fetchCategories();
  }, []);

  // Load products when search params change
  useEffect(() => {
    fetchProducts();
  }, [currentSearch, currentCategory, currentPage]);

  // Handle filter changes
  const handleSearchChange = useCallback((search) => {
    updateURL(search, currentCategory, 1);
  }, [updateURL, currentCategory]);

  const handleCategoryChange = useCallback((category) => {
    updateURL(currentSearch, category, 1);
  }, [updateURL, currentSearch]);

  const handlePageChange = useCallback((page) => {
    updateURL(currentSearch, currentCategory, page);
  }, [updateURL, currentSearch, currentCategory]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Products Catalog
          </h1>
          <p className="text-gray-600">
            Discover amazing products with personalized recommendations
          </p>
        </div>

        {/* Error message */}
        {error && (
          <ErrorMessage 
            message={error} 
            onDismiss={() => setError('')}
            title="Failed to load products"
          />
        )}

        {/* Filters */}
        <ProductFilters
          onSearchChange={handleSearchChange}
          onCategoryChange={handleCategoryChange}
          categories={categories}
          currentCategory={currentCategory}
          currentSearch={currentSearch}
        />

        {/* Products grid */}
        <ProductGrid
          products={products}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </main>
    </div>
  );
};

export default ProductsPage;