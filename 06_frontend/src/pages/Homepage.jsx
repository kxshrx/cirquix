import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from '../components/Login';
import Navigation from '../components/Navigation';
import ProductCatalog from '../components/ProductCatalog';
import apiService from '../api/api';

const Homepage = ({ currentUser, onLogin, onLogout }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const categoriesData = await apiService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load categories:', error);
      // Fallback categories
      setCategories([
        'Amazon Devices',
        'Electronics', 
        'Computers',
        'Home & Kitchen'
      ]);
    }
  };

  const handleLogout = () => {
    onLogout();
    setSearchQuery('');
    setSelectedCategory('');
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setSelectedCategory(''); // Clear category filter when searching
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    setSearchQuery(''); // Clear search when filtering by category
  };

  const handleProductClick = (product) => {
    navigate(`/product/${product.product_id}`);
  };

  // Show login screen if no user is logged in
  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <Login onLogin={onLogin} currentUser={currentUser} />
      </div>
    );
  }

  // Show main application
  return (
    <div style={{ minHeight: '100vh' }}>
      <Navigation
        currentUser={currentUser}
        onLogout={handleLogout}
        onSearch={handleSearch}
        onCategoryFilter={handleCategoryFilter}
        categories={categories}
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
      />
      
      <main style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <ProductCatalog
          onProductClick={handleProductClick}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          currentUser={currentUser}
        />
      </main>
    </div>
  );
};

export default Homepage;