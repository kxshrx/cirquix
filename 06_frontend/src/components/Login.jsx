import { useState, useEffect } from 'react';
import { User, LogIn, UserCheck } from 'lucide-react';
import apiService from '../api/api';

const Login = ({ onLogin, currentUser }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [customUser, setCustomUser] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSampleUsers();
  }, []);

  const loadSampleUsers = async () => {
    try {
      const data = await apiService.getSampleData();
      setUsers(data.sampleUsers);
      setSelectedUser(data.defaultUser);
    } catch (error) {
      console.error('Failed to load sample users:', error);
      setUsers(['AHMNA5UK3V66O2V3DZSBJA4FYMOA', 'TEST_COLD_USER_123']);
      setSelectedUser('AHMNA5UK3V66O2V3DZSBJA4FYMOA');
    }
  };

  const handleLogin = async () => {
    const userId = isCustom ? customUser.trim() : selectedUser;
    
    if (!userId) {
      setError('Please select or enter a user ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await apiService.loginUser(userId);
      if (result.success) {
        onLogin(result.user);
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (error) {
      setError('Login failed. Please check your user ID.');
    } finally {
      setLoading(false);
    }
  };

  const handleUserTypeChange = (e) => {
    const useCustom = e.target.value === 'custom';
    setIsCustom(useCustom);
    setError(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  if (currentUser) {
    return (
      <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
        <UserCheck size={20} className="text-green-600" />
        <div>
          <p className="font-semibold text-green-800">
            Welcome, {currentUser.user_id}
          </p>
          <p className="text-sm text-green-600">
            {currentUser.total_purchases || 0} purchases
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: '2rem', maxWidth: '500px', margin: '2rem auto' }}>
      <div className="text-center mb-6">
        <div className="flex justify-center mb-3">
          <div className="p-3 bg-blue-100 rounded-full">
            <User size={32} className="text-blue-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">Welcome to CircuiX</h2>
        <p className="text-gray-600">Sign in to get personalized recommendations</p>
      </div>

      <div className="form-group">
        <label className="label">Account Type:</label>
        <select 
          className="select mb-4" 
          onChange={handleUserTypeChange}
          value={isCustom ? 'custom' : 'demo'}
        >
          <option value="demo">Demo Account</option>
          <option value="custom">Custom User ID</option>
        </select>
      </div>

      {isCustom ? (
        <div className="form-group">
          <label className="label">Enter User ID:</label>
          <input
            type="text"
            className="input"
            placeholder="Enter your user ID..."
            value={customUser}
            onChange={(e) => setCustomUser(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <p className="text-sm text-gray-500 mt-1">
            Enter any user ID from the system
          </p>
        </div>
      ) : (
        <div className="form-group">
          <label className="label">Select Demo Account:</label>
          <select 
            className="select" 
            value={selectedUser} 
            onChange={(e) => setSelectedUser(e.target.value)}
            disabled={loading}
          >
            {users.map(userId => (
              <option key={userId} value={userId}>
                {userId}
                {userId.includes('COLD') && ' (New User)'}
                {userId.includes('DEMO') && ' (Demo User)'}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Try different user profiles to see personalized recommendations
          </p>
        </div>
      )}

      {error && (
        <div className="error mb-4">
          {error}
        </div>
      )}

      <button 
        className="btn btn-primary w-full"
        onClick={handleLogin}
        disabled={loading || (!selectedUser && !customUser.trim())}
      >
        {loading ? (
          <>
            <div className="spinner"></div>
            Signing in...
          </>
        ) : (
          <>
            <LogIn size={16} />
            Sign In
          </>
        )}
      </button>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-700">
          <strong>Demo Tip:</strong> Try different user accounts to see how recommendations 
          change based on purchase history and preferences.
        </p>
      </div>
    </div>
  );
};

export default Login;