import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';

/**
 * Product filters component
 * Provides search and category filtering for products
 */
const ProductFilters = ({ 
  onSearchChange, 
  onCategoryChange, 
  categories = [], 
  currentCategory = '',
  currentSearch = '' 
}) => {
  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearchChange(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, onSearchChange]);

  useEffect(() => {
    setSearchTerm(currentSearch);
  }, [currentSearch]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (category) => {
    onCategoryChange(category);
    setIsFiltersOpen(false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    onSearchChange('');
    onCategoryChange('');
    setIsFiltersOpen(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Category filter */}
        <div className="flex items-center space-x-4">
          {/* Mobile filter toggle */}
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="lg:hidden flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isFiltersOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Desktop category dropdown */}
          <div className="hidden lg:block relative">
            <select
              value={currentCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Clear filters button */}
          {(currentSearch || currentCategory) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Mobile filters dropdown */}
      {isFiltersOpen && (
        <div className="lg:hidden mt-4 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Category</h3>
          <div className="space-y-2">
            <button
              onClick={() => handleCategoryChange('')}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                !currentCategory 
                  ? 'bg-primary-100 text-primary-800' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                  currentCategory === category 
                    ? 'bg-primary-100 text-primary-800' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilters;