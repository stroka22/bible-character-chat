import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../contexts/MockChatContext.jsx';

const CharacterCard = ({ character }) => {
  const navigate = useNavigate();
  const { selectCharacter } = useChat();

  const handleSelectCharacter = () => {
    try {
      // Select the character using our mock context
      selectCharacter(character);
      
      // Navigate to the chat route
      navigate('/chat');
    } catch (error) {
      console.error('Error selecting character:', error);
      alert('Failed to start chat. Please try again.');
    }
  };

  // Generate a fallback avatar if the character doesn't have one
  const getAvatarUrl = () => {
    if (!character.avatar_url) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=random`;
    }
    
    // Check if the URL is valid
    try {
      const { hostname } = new URL(character.avatar_url);
      if (hostname === 'example.com' || hostname.endsWith('.example.com') || hostname === 'localhost') {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=random`;
      }
      return character.avatar_url;
    } catch {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=random`;
    }
  };

  // Get the testament badge color
  const getTestamentBadgeColor = () => {
    return character.testament === 'old' 
      ? 'bg-amber-700/60 text-amber-100' 
      : 'bg-blue-700/60 text-blue-100';
  };

  return (
    <div 
      className="character-card bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg overflow-hidden hover:border-yellow-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/10 cursor-pointer"
      onClick={handleSelectCharacter}
    >
      {/* Character Image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={getAvatarUrl()} 
          alt={character.name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=random`;
          }}
        />
        {/* Testament Badge */}
        {character.testament && (
          <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${getTestamentBadgeColor()}`}>
            {character.testament === 'old' ? 'Old Testament' : 'New Testament'}
          </div>
        )}
      </div>
      
      {/* Character Info */}
      <div className="p-4">
        <h3 className="text-xl font-bold text-yellow-400 mb-1" style={{ fontFamily: 'Cinzel, serif' }}>
          {character.name}
        </h3>
        
        {character.bible_book && (
          <p className="text-sm text-blue-200 mb-2">
            {character.bible_book}
          </p>
        )}
        
        <p className="text-sm text-gray-300 line-clamp-3 mb-4">
          {character.description || "A biblical figure with a unique perspective and story to share."}
        </p>
        
        <button 
          className="w-full bg-[rgba(250,204,21,0.2)] hover:bg-yellow-400 text-yellow-400 hover:text-blue-900 font-semibold py-2 px-4 rounded-md transition-colors duration-300"
        >
          Chat with {character.name}
        </button>
      </div>
    </div>
  );
};

export default CharacterCard;
