import { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import apiService from '../api/api';

const UserSelector = ({ selectedUser, onUserChange }) => {
  const [users, setUsers] = useState([]);
  const [customUser, setCustomUser] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  useEffect(() => {
    const loadSampleUsers = async () => {
      try {
        const data = await apiService.getSampleData();
        setUsers(data.sampleUsers);
        
        // Set default user if none selected
        if (!selectedUser && data.defaultUser) {
          onUserChange(data.defaultUser);
        }
      } catch (error) {
        console.error('Failed to load sample users:', error);
        // Fallback sample users
        const fallbackUsers = [
          'AHMNA5UK3V66O2V3DZSBJA4FYMOA',
          'TEST_COLD_USER_123',
          'DEMO_USER_ACTIVE'
        ];
        setUsers(fallbackUsers);
        if (!selectedUser) {
          onUserChange(fallbackUsers[0]);
        }
      }
    };

    loadSampleUsers();
  }, [selectedUser, onUserChange]);

  const handleUserTypeChange = (e) => {
    const useCustom = e.target.value === 'custom';
    setIsCustom(useCustom);
    
    if (!useCustom && users.length > 0) {
      onUserChange(users[0]);
      setCustomUser('');
    }
  };

  const handleUserSelect = (e) => {
    const userId = e.target.value;
    if (userId) {
      onUserChange(userId);
    }
  };

  const handleCustomUserChange = (e) => {
    const userId = e.target.value;
    setCustomUser(userId);
    if (userId.trim()) {
      onUserChange(userId.trim());
    }
  };

  return (
    <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
      <div className="flex items-center gap-2 mb-3">
        <User size={20} />
        <h3 className="font-semibold">Demo User Selection</h3>
      </div>
      
      <div className="form-group">
        <label className="label">User Type:</label>
        <select 
          className="select mb-3" 
          onChange={handleUserTypeChange}
          value={isCustom ? 'custom' : 'sample'}
        >
          <option value="sample">Sample Users</option>
          <option value="custom">Custom User ID</option>
        </select>
      </div>

      {isCustom ? (
        <div className="form-group">
          <label className="label">Enter User ID:</label>
          <input
            type="text"
            className="input"
            placeholder="Enter any user ID..."
            value={customUser}
            onChange={handleCustomUserChange}
          />
          <p className="text-sm text-gray-500 mt-1">
            Try any user ID from your database or use a new one for cold-start demo
          </p>
        </div>
      ) : (
        <div className="form-group">
          <label className="label">Select Sample User:</label>
          <select 
            className="select" 
            value={selectedUser || ''} 
            onChange={handleUserSelect}
          >
            {users.map(userId => (
              <option key={userId} value={userId}>
                {userId}
                {userId.includes('COLD') && ' (Cold Start)'}
                {userId.includes('DEMO') && ' (Demo)'}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">
            These are sample user IDs for testing different recommendation scenarios
          </p>
        </div>
      )}

      {selectedUser && (
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-700">
            <strong>Current User:</strong> {selectedUser}
          </p>
        </div>
      )}
    </div>
  );
};

export default UserSelector;