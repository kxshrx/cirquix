import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoadingSpinner from './components/common/LoadingSpinner';

/**
 * Protected route component
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

/**
 * App router component
 * Handles routing logic and authentication checks
 */
const AppRouter = () => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message="Loading..." />
      </div>
    );
  }

  return (
    <Routes>
      {/* Login route */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to="/products" replace /> : <LoginPage />
        } 
      />
      
      {/* Protected routes */}
      <Route 
        path="/products" 
        element={
          <ProtectedRoute>
            <ProductsPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/products/:productId" 
        element={
          <ProtectedRoute>
            <ProductDetailPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Root redirect */}
      <Route 
        path="/" 
        element={
          <Navigate to={isAuthenticated ? "/products" : "/login"} replace />
        } 
      />
      
      {/* Catch all - redirect based on auth status */}
      <Route 
        path="*" 
        element={
          <Navigate to={isAuthenticated ? "/products" : "/login"} replace />
        } 
      />
    </Routes>
  );
};

/**
 * Main App component
 * Provides authentication context and routing
 */
function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppRouter />
      </div>
    </AuthProvider>
  );
}

export default App;