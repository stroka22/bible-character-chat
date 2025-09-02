import React, { useState, useEffect, useMemo } from 'react';
import { characterRepository } from '../../repositories/characterRepository';

/**
 * AdminFavorites Component
 * 
 * Allows administrators to manage and view user favorites with the following features:
 * - List view of user favorite character selections
 * - Statistics about which characters are most favorited
 * - A chart visualization of favorite trends
 * - The ability to view favorites by user
 * - Favorite reset functionality
 */
const AdminFavorites = () => {
  // State for characters and favorites data
  const [characters, setCharacters] = useState([]);
  const [favoriteData, setFavoriteData] = useState({});
  const [selectedUser, setSelectedUser] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Mock users for the placeholder implementation
  // In a real implementation, this would come from a users API
  const mockUsers = [
    { id: 'user1', name: 'John Doe', email: 'john@example.com' },
    { id: 'user2', name: 'Jane Smith', email: 'jane@example.com' },
    { id: 'user3', name: 'Pastor Mike', email: 'pastor@church.org' },
    { id: 'user4', name: 'Bible Study Group', email: 'group@church.org' }
  ];
  
  // Mock favorite data - in real implementation this would come from the backend
  const mockFavoriteData = {
    user1: ['1', '3', '5'],  // IDs of characters
    user2: ['2', '5', '7'],
    user3: ['1', '4', '6', '8'],
    user4: ['1', '2', '3', '4', '5']
  };
  
  // Fetch characters and initialize favorite data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch all characters
        const data = await characterRepository.getAll();
        setCharacters(data);
        
        // In a real implementation, we would fetch favorite data from the backend
        // For now, we'll use mock data and localStorage
        
        // Try to get any real favorites from localStorage
        let realFavorites = {};
        try {
          const savedFavorites = localStorage.getItem('favoriteCharacters');
          if (savedFavorites) {
            // For the placeholder, we'll treat localStorage favorites as belonging to 'currentUser'
            realFavorites = { currentUser: JSON.parse(savedFavorites) };
          }
        } catch (err) {
          console.error('Error loading favorite characters:', err);
        }
        
        // Combine real and mock data
        setFavoriteData({ ...mockFavoriteData, ...realFavorites });
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load characters or favorite data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Calculate favorite statistics
  const favoriteStats = useMemo(() => {
    if (!characters.length) return [];
    
    // Count favorites for each character
    const counts = {};
    Object.values(favoriteData).forEach(userFavorites => {
      userFavorites.forEach(charId => {
        counts[charId] = (counts[charId] || 0) + 1;
      });
    });
    
    // Map character IDs to character objects with count
    return Object.entries(counts)
      .map(([charId, count]) => {
        const character = characters.find(c => c.id.toString() === charId);
        if (!character) {
          // Skip IDs that no longer exist in the character list
          return null;
        }
        return {
          id: charId,
          name: character.name,
          avatar: character.avatar_url,
          count
        };
      })
      // Remove null placeholders (unknown IDs)
      .filter(Boolean)
      .sort((a, b) => b.count - a.count); // Sort by count descending
  }, [characters, favoriteData]);
  
  // Get favorites for selected user
  const userFavorites = useMemo(() => {
    if (selectedUser === 'all') {
      // Return all favorites
      return Object.values(favoriteData).flat();
    }
    
    return favoriteData[selectedUser] || [];
  }, [favoriteData, selectedUser]);
  
  // Get character objects for the selected user's favorites
  const userFavoriteCharacters = useMemo(() => {
    return userFavorites
      .map(charId => characters.find(c => c.id.toString() === charId) || null)
      .filter(Boolean); // Exclude unknown IDs
  }, [characters, userFavorites]);
  
  // Handle resetting favorites for a user
  const handleResetFavorites = (userId) => {
    if (!window.confirm(`Are you sure you want to reset favorites for ${userId === 'all' ? 'ALL USERS' : userId}? This action cannot be undone.`)) {
      return;
    }
    
    setError(null);
    setSuccessMessage(null);
    
    try {
      if (userId === 'all') {
        // Reset all favorites
        setFavoriteData({});
        localStorage.removeItem('favoriteCharacters');
        setSuccessMessage('All user favorites have been reset.');
      } else {
        // Reset favorites for specific user
        const newFavoriteData = { ...favoriteData };
        delete newFavoriteData[userId];
        setFavoriteData(newFavoriteData);
        
        // If this is the current user, also update localStorage
        if (userId === 'currentUser') {
          localStorage.removeItem('favoriteCharacters');
        }
        
        setSuccessMessage(`Favorites for ${userId} have been reset.`);
      }
    } catch (err) {
      setError('Failed to reset favorites. Please try again.');
      console.error('Error resetting favorites:', err);
    }
  };
  
  // Find the maximum count for chart scaling
  const maxCount = favoriteStats.length > 0 ? favoriteStats[0].count : 0;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">User Favorites Management</h2>
      <p className="text-gray-600 mb-6">
        View and manage character favorites across all users. See which characters are most popular
        and manage user favorite selections.
      </p>
      
      {/* Status Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          Success: {successMessage}
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Most Favorited Characters */}
          <section className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-xl font-medium text-gray-700 mb-4">Most Favorited Characters</h3>
            
            {favoriteStats.length === 0 ? (
              <p className="text-gray-500 italic text-center py-4">
                No favorite data available yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Character</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Favorites Count</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% of Users</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {favoriteStats.slice(0, 10).map((stat, index) => (
                      <tr key={stat.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img 
                                className="h-10 w-10 rounded-full object-cover border border-gray-200" 
                                src={stat.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(stat.name)}&background=random`}
                                alt={stat.name}
                                onError={(e) => {
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(stat.name)}&background=random`;
                                }}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{stat.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.count}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {Math.round((stat.count / Object.keys(favoriteData).length) * 100)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          
          {/* Visualization */}
          <section className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-xl font-medium text-gray-700 mb-4">Favorite Trends Visualization</h3>
            
            {favoriteStats.length === 0 ? (
              <p className="text-gray-500 italic text-center py-4">
                No data available for visualization.
              </p>
            ) : (
              <div className="h-64 flex items-end space-x-2 pt-4 pb-2">
                {favoriteStats.slice(0, 10).map(stat => (
                  <div key={stat.id} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-yellow-400 rounded-t-sm hover:bg-yellow-500 transition-all relative group"
                      style={{ 
                        height: `${Math.max(5, (stat.count / maxCount) * 100)}%`,
                      }}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-blue-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {stat.name}: {stat.count} favorites
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 truncate w-full text-center" title={stat.name}>
                      {stat.name.length > 6 ? `${stat.name.substring(0, 6)}...` : stat.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4 text-xs text-gray-500 text-center">
              Chart shows the top 10 most favorited characters
            </div>
          </section>
          
          {/* User Favorites */}
          <section className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-xl font-medium text-gray-700 mb-4">User Favorites</h3>
            
            <div className="mb-4 flex flex-wrap items-center gap-4">
              <div className="w-full md:w-auto">
                <label htmlFor="userSelect" className="block text-sm font-medium text-gray-700 mb-1">
                  Select User
                </label>
                <select
                  id="userSelect"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="mt-1 block w-full md:w-64 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="all">All Users</option>
                  <option value="currentUser">Current User (Browser)</option>
                  {mockUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={() => handleResetFavorites(selectedUser)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 mt-6 md:mt-0"
              >
                Reset Favorites {selectedUser === 'all' ? 'for All Users' : ''}
              </button>
            </div>
            
            {userFavoriteCharacters.length === 0 ? (
              <p className="text-gray-500 italic text-center py-4">
                No favorites found for the selected user.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {userFavoriteCharacters.map(character => (
                  <div key={character.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-4 flex items-center">
                      <img
                        src={character.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=random`}
                        alt={character.name}
                        className="h-12 w-12 rounded-full object-cover mr-4 border border-gray-200"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=random`;
                        }}
                      />
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{character.name}</h4>
                        {character.bible_book && (
                          <p className="text-sm text-gray-500">{character.bible_book}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
          
          {/* Future Enhancements */}
          <section className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-medium text-blue-800 mb-2">Future Enhancements</h3>
            <p className="text-blue-700 mb-2">
              This is a placeholder component that will be expanded with the following features:
            </p>
            <ul className="list-disc list-inside text-blue-700 space-y-1 ml-4">
              <li>Integration with user authentication system</li>
              <li>Real-time data from database instead of localStorage</li>
              <li>Advanced analytics and trend analysis</li>
              <li>Time-based visualizations (favorites over time)</li>
              <li>Export functionality for favorite data</li>
              <li>Notification system for trending characters</li>
            </ul>
          </section>
        </div>
      )}
    </div>
  );
};

export default AdminFavorites;
