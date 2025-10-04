import React, { useState, useEffect, useMemo } from 'react';
import { characterRepository } from '../../repositories/characterRepository';
import { useAuth } from '../../contexts/AuthContext';
import { getOwnerSlug } from '../../services/tierSettingsService';
import siteSettingsRepository from '../../repositories/siteSettingsRepository';

/**
 * AdminFeaturedCharacter Component
 * 
 * Allows administrators to control which character is featured by default on the home page
 */
const AdminFeaturedCharacter = () => {
  // ------------------------------------------------------------------
  // Auth / role helpers
  // ------------------------------------------------------------------
  const { isAdmin } = useAuth();
  const isAdminUser = isAdmin && isAdmin();

  // State for characters and selection
  const [characters, setCharacters] = useState([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Constants
  const DEFAULT_CHARACTER_NAME = 'Jesus';
  
  // Fetch characters on component mount
  useEffect(() => {
    const fetchCharacters = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Pass admin flag so repository returns hidden chars for admins only
        const data = await characterRepository.getAll(isAdminUser);
        setCharacters(data);
        
        // Load server-backed admin default
        const owner = getOwnerSlug();
        try {
          const defId = await siteSettingsRepository.getDefaultFeaturedCharacterId(owner);
          if (defId) {
            const character = data.find(c => `${c.id}` === `${defId}`);
            if (character) setSelectedCharacterId(character.id);
          }
        } catch (e) {
          /* ignore */
        }

        if (!selectedCharacterId) {
          // Find Jesus as the default
          const defaultCharacter = data.find(c => 
            c.name.toLowerCase() === DEFAULT_CHARACTER_NAME.toLowerCase()
          );
          
          if (defaultCharacter) {
            setSelectedCharacterId(defaultCharacter.id);
          } else if (data.length > 0) {
            // Fallback to first character
            setSelectedCharacterId(data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch characters:', err);
        setError('Failed to load characters. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCharacters();
  }, [isAdminUser]);
  
  // Filter characters based on search query
  const filteredCharacters = useMemo(() => {
    if (!searchQuery.trim()) return characters;
    
    return characters.filter(character => 
      character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (character.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (character.bible_book || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [characters, searchQuery]);
  
  // Get the selected character object
  const selectedCharacter = useMemo(() => {
    return characters.find(c => c.id === selectedCharacterId);
  }, [characters, selectedCharacterId]);
  
  // Handle setting featured character
  const handleSetFeatured = async () => {
    setError(null);
    setSuccessMessage(null);
    
    try {
      if (!selectedCharacterId) {
        throw new Error('Please select a character first.');
      }
      const owner = getOwnerSlug();
      await siteSettingsRepository.setDefaultFeaturedCharacterId(owner, selectedCharacterId);
      const character = characters.find(c => c.id === selectedCharacterId);
      setSuccessMessage(`${character?.name || 'Character'} is now set as the default featured character (server-backed).`);
    } catch (err) {
      setError(err.message || 'Failed to set featured character.');
    }
  };
  
  // Handle resetting to default (Jesus)
  const handleResetToDefault = async () => {
    setError(null);
    setSuccessMessage(null);
    
    try {
      const owner = getOwnerSlug();
      await siteSettingsRepository.setDefaultFeaturedCharacterId(owner, null);

      // Reset to Jesus
      const defaultCharacter = characters.find(c => 
        c.name.toLowerCase() === DEFAULT_CHARACTER_NAME.toLowerCase()
      );
      
      if (defaultCharacter) {
        setSelectedCharacterId(defaultCharacter.id);
        setSuccessMessage(`Reset to default: ${defaultCharacter.name} is now the featured character (server default cleared).`);
      } else {
        throw new Error(`Default character (${DEFAULT_CHARACTER_NAME}) not found.`);
      }
    } catch (err) {
      setError(err.message || 'Failed to reset featured character.');
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Featured Character Management</h2>
      <p className="text-gray-600 mb-6">
        Select which character should be featured by default on the home page. 
        Users can override this with their own selection, but new visitors will see your chosen character.
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Character Selection */}
          <div className="lg:col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search characters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div className="max-h-[400px] overflow-y-auto pr-2">
              {filteredCharacters.length === 0 ? (
                <p className="text-gray-500 italic text-center py-4">
                  No characters found matching your search.
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredCharacters.map((character, index) => (
                    <label 
                      key={character?.id || `character-${index}`}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedCharacterId === character.id 
                          ? 'bg-yellow-100 border border-yellow-300' 
                          : 'hover:bg-gray-100 border border-transparent'
                      }`}
                    >
                      <input
                        type="radio"
                        name="featuredCharacter"
                        value={character.id}
                        checked={selectedCharacterId === character.id}
                        onChange={() => setSelectedCharacterId(character.id)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 mr-3"
                      />
                      
                      <div className="flex items-center">
                        <img
                          src={character.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=random`}
                          alt={character.name}
                          className="h-10 w-10 rounded-full object-cover mr-3 border border-gray-200"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=random`;
                          }}
                        />
                        
                        <div>
                          <h3 className="font-medium text-gray-900">{character.name}</h3>
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {character.bible_book || ''}
                          </p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Preview */}
          <div className="bg-blue-900 p-4 rounded-lg flex flex-col items-center">
            <h3 className="text-lg font-medium text-white mb-4">Preview</h3>
            
            {selectedCharacter ? (
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="absolute -inset-4 rounded-full bg-yellow-300 blur-xl opacity-30"></div>
                  <div className="relative z-0 w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-300 shadow-xl bg-blue-50">
                    <img
                      src={selectedCharacter.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCharacter.name)}&background=random`}
                      alt={selectedCharacter.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCharacter.name)}&background=random`;
                      }}
                    />
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2 text-center">
                  {selectedCharacter.name}
                </h2>
                
                <p className="text-blue-100 text-center mb-4 max-w-xs">
                  {selectedCharacter.description}
                </p>
                
                <div className="mt-4 text-sm text-blue-200 text-center">
                  This is how the featured character will appear on the home page.
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-white">
                <p>No character selected</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Actions */}
      <div className="mt-6 flex flex-wrap gap-4">
        <button
          onClick={handleSetFeatured}
          disabled={isLoading || !selectedCharacterId}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Set as Default Featured Character
        </button>
        
        <button
          onClick={handleResetToDefault}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          Reset to Default (Jesus)
        </button>
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-lg font-medium text-blue-800 mb-2">How Featured Characters Work</h3>
        <ul className="list-disc list-inside text-blue-700 space-y-2">
          <li>The default featured character is shown to all new visitors</li>
          <li>Users can set their own featured character by clicking the bookmark icon on any character card</li>
          <li>URL parameters can override both settings (example: <code>?featured=Moses</code>)</li>
          <li>The priority order is: URL parameter → User preference → Admin default → Jesus → First character</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminFeaturedCharacter;
