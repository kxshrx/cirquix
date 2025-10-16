import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { parseErrorMessage, hasValidPrice } from '../utils/helpers';
import Header from '../components/common/Header';
import ProductFilters from '../components/products/ProductFilters';
import ProductGrid from '../components/products/ProductGrid';
import ErrorMessage from '../components/common/ErrorMessage';

const parseSearchParams = (params) => {
  const search = params.get('search') || '';
  const category = params.get('category') || '';
  const pageValue = parseInt(params.get('page') || '1', 10);
  const page = Number.isNaN(pageValue) || pageValue < 1 ? 1 : pageValue;

  return {
    search,
    category,
    page
  };
};

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
  const searchParamsString = searchParams.toString();

  const [filters, setFilters] = useState(() => parseSearchParams(new URLSearchParams(searchParamsString)));
  const { search: currentSearch, category: currentCategory, page: currentPage } = filters;
  const limit = 20; // Products per page

  const requestIdRef = useRef(0);

  // Sync filters when URL changes (e.g., browser navigation)
  useEffect(() => {
    const params = new URLSearchParams(searchParamsString);
    const nextFilters = parseSearchParams(params);

    setFilters((prev) => {
      if (
        prev.search === nextFilters.search &&
        prev.category === nextFilters.category &&
        prev.page === nextFilters.page
      ) {
        return prev;
      }
      return nextFilters;
    });
  }, [searchParamsString]);

  // Keep URL updated with current filters
  useEffect(() => {
    const params = new URLSearchParams();

    if (currentSearch) params.set('search', currentSearch);
    if (currentCategory) params.set('category', currentCategory);
    if (currentPage > 1) params.set('page', currentPage.toString());

    const newSearch = params.toString();
    if (newSearch !== searchParamsString) {
      setSearchParams(params, { replace: true });
    }
  }, [currentSearch, currentCategory, currentPage, searchParamsString, setSearchParams]);

  const handleSearchChange = useCallback((search) => {
    setFilters((prev) => {
      if (prev.search === search) {
        if (prev.page === 1) {
          return prev;
        }
        return { ...prev, page: 1 };
      }
      return {
        ...prev,
        search,
        page: 1
      };
    });
  }, []);

  const handleCategoryChange = useCallback((category) => {
    setFilters((prev) => {
      if (prev.category === category) {
        if (prev.page === 1) {
          return prev;
        }
        return { ...prev, page: 1 };
      }
      return {
        ...prev,
        category,
        page: 1
      };
    });
  }, []);

  const handlePageChange = useCallback((page) => {
    setFilters((prev) => {
      if (prev.page === page) {
        return prev;
      }
      return {
        ...prev,
        page
      };
    });
  }, []);

  // Fetch products based on current filters
  const fetchProducts = useCallback(async (search, category, page) => {
    const requestId = ++requestIdRef.current;
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
      
      if (requestId === requestIdRef.current) {
        setProducts(productsWithPrices);
        setPagination({
          currentPage: page,
          totalPages: Math.ceil(data.total / limit),
          hasMore: data.has_more,
          total: data.total,
          filteredTotal: productsWithPrices.length
        });
      }
    } catch (err) {
      if (requestId === requestIdRef.current) {
        setError(parseErrorMessage(err));
        setProducts([]);
        setPagination({});
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [limit]);

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
    fetchProducts(currentSearch, currentCategory, currentPage);
  }, [currentSearch, currentCategory, currentPage, fetchProducts]);

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