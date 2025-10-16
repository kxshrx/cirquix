import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, ShoppingBag, LogOut } from 'lucide-react';

/**
 * Header component with navigation and user information
 * Displays site branding, user info, and logout functionality
 */
const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and site title */}
          <div className="flex items-center space-x-3">
            <div className="bg-primary-600 p-2 rounded-lg">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Cirquix</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Smart Shopping Recommendations</p>
            </div>
          </div>

          {/* User info and logout */}
          {user && (
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                <User className="h-4 w-4 text-gray-600" />
                <div className="text-sm">
                  <p className="font-medium text-gray-900">User: {user.user_id}</p>
                  <p className="text-gray-500">{user.interaction_count} interactions</p>
                </div>
              </div>
              
              {/* Mobile user info */}
              <div className="sm:hidden flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">{user.user_id}</span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-red-50"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;