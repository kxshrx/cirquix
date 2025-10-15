import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Homepage from './pages/Homepage';
import ProductDetail from './pages/ProductDetail';
import Navigation from './components/Navigation';
import apiService from './api/api';
import './styles/globals.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Check for saved user session
    const savedUser = localStorage.getItem('cirquix_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('cirquix_user');
      }
    }

    // Load categories
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const categoriesData = await apiService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setCategories(['Amazon Devices', 'Electronics', 'Computers', 'Home & Kitchen']);
    }
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('cirquix_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('cirquix_user');
  };

  return (
    <Router>
      <div className="App" style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <Routes>
          <Route 
            path="/" 
            element={
              <Homepage 
                currentUser={currentUser}
                onLogin={handleLogin}
                onLogout={handleLogout}
              />
            } 
          />
          <Route 
            path="/product/:productId" 
            element={
              <div>
                {currentUser && (
                  <Navigation
                    currentUser={currentUser}
                    onLogout={handleLogout}
                    onSearch={() => {}}
                    onCategoryFilter={() => {}}
                    categories={categories}
                    searchQuery=""
                    selectedCategory=""
                    showBackButton={true}
                  />
                )}
                <main style={{ paddingTop: currentUser ? '2rem' : '0', paddingBottom: '4rem' }}>
                  <ProductDetail currentUser={currentUser} />
                </main>
              </div>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
