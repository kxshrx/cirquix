import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import { parseErrorMessage, isValidUserId } from '../../utils/helpers';
import { LogIn, User } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

/**
 * Login form component
 * Allows users to enter/select demo user ID for authentication
 */
const LoginForm = () => {
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  // Demo user IDs for quick selection (real users from database)
  const demoUsers = [
    'AHMNA5UK3V66O2V3DZSBJA4FYMOA',
    'AECTQQX663PTF5UQ2RA5TUL3BXVQ',
    'AEIIRIHLIYKQGI7ZOCIJTRDF5NPQ',
    'AGRHKDNSRJ3CT5ST75KGSCD4WA5A',
    'AG73BVBKUOH22USSFJA5ZWL7AKXA'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate user ID
    if (!isValidUserId(userId)) {
      setError('Please enter a valid User ID');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Validate user with backend
      const userData = await userAPI.getUserInfo(userId.trim());
      
      // Login successful
      login(userData);
      navigate('/products');
    } catch (err) {
      setError(parseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoUserSelect = (demoUserId) => {
    setUserId(demoUserId);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary-600 rounded-lg flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome to Cirquix
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your User ID to access personalized recommendations
          </p>
        </div>

        {/* Error message */}
        {error && (
          <ErrorMessage 
            message={error} 
            onDismiss={() => setError('')}
            title="Login Failed"
          />
        )}

        {/* Login form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
              User ID
            </label>
            <input
              id="userId"
              name="userId"
              type="text"
              required
              className="form-input"
              placeholder="Enter your User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !userId.trim()}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading ? (
              <LoadingSpinner size="small" />
            ) : (
              <>
                <LogIn className="h-5 w-5 mr-2" />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Demo users */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Try demo users</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2">
            {demoUsers.map((demoUserId) => (
              <button
                key={demoUserId}
                type="button"
                onClick={() => handleDemoUserSelect(demoUserId)}
                disabled={isLoading}
                className="w-full text-left px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200 disabled:opacity-50"
              >
                {demoUserId}
              </button>
            ))}
          </div>
        </div>

        {/* Info text */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            This is a demo application. Select a user ID to explore personalized recommendations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;