import { useState } from 'react';
import { Search, User, ShoppingBag, LogOut, Menu, X } from 'lucide-react';

const Navigation = ({ 
  currentUser, 
  onLogout, 
  onSearch, 
  onCategoryFilter,
  categories = [],
  searchQuery = '',
  selectedCategory = ''
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(localSearch);
  };

  const handleCategoryClick = (category) => {
    onCategoryFilter(category === selectedCategory ? '' : category);
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b-2 border-gray-100 sticky top-0 z-50">
      <div className="container">
        <div className="flex items-center justify-between py-3">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <ShoppingBag size={28} className="text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">CircuiX</h1>
          </div>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="input pr-10"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Search size={20} />
              </button>
            </div>
          </form>

          {/* User Info & Menu */}
          <div className="flex items-center gap-4">
            {/* Desktop User Info */}
            {currentUser && (
              <div className="hidden md:flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <User size={16} className="text-gray-600" />
                  <span className="text-gray-700">
                    {currentUser.user_id.length > 15 
                      ? `${currentUser.user_id.substring(0, 15)}...` 
                      : currentUser.user_id
                    }
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="btn btn-secondary text-sm py-1 px-3"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="md:hidden pb-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="input pr-10"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              <Search size={20} />
            </button>
          </div>
        </form>

        {/* Category Pills - Desktop */}
        <div className="hidden md:flex gap-2 pb-3 overflow-x-auto">
          <button
            onClick={() => handleCategoryClick('')}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
              selectedCategory === '' 
                ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Products
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                selectedCategory === category 
                  ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="container py-4">
            {/* User Info - Mobile */}
            {currentUser && (
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-600" />
                    <span className="text-sm text-gray-700">{currentUser.user_id}</span>
                  </div>
                  <button
                    onClick={() => {
                      onLogout();
                      setIsMenuOpen(false);
                    }}
                    className="btn btn-secondary text-sm py-1 px-3"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              </div>
            )}

            {/* Categories - Mobile */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleCategoryClick('')}
                  className={`block w-full text-left px-3 py-2 rounded ${
                    selectedCategory === '' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  All Products
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => handleCategoryClick(category)}
                    className={`block w-full text-left px-3 py-2 rounded ${
                      selectedCategory === category 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;