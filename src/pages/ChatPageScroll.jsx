import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useChat } from '../contexts/ChatContext.jsx';
import { useAuth } from '../contexts/AuthContext';
import { characterRepository } from '../repositories/characterRepository';
import { usePremium } from '../hooks/usePremium';
import { isCharacterFree } from '../utils/accountTier';
import { getSettings as getTierSettings } from '../services/tierSettingsService';
import UpgradeModal from '../components/modals/UpgradeModal';
import FooterScroll from '../components/FooterScroll';
import PreviewLayout from '../components/PreviewLayout';
import { ScrollWrap, ScrollDivider, ScrollBackground } from '../components/ScrollWrap';

const generateFallbackAvatar = (name) => 
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

// Character Card Component with scroll theme
const CharacterCard = ({ character, onSelect, isPremiumLocked, isFeatured, isFavorite, onToggleFavorite, onSetFeatured }) => {
  const [showInfo, setShowInfo] = useState(false);
  
  const handleInfoClick = (e) => {
    e.stopPropagation();
    setShowInfo(true);
  };
  
  const handleChatClick = (e) => {
    e.stopPropagation();
    onSelect(character);
  };
  
  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (onToggleFavorite) onToggleFavorite(character);
  };
  
  const handleFeaturedClick = (e) => {
    e.stopPropagation();
    if (onSetFeatured) onSetFeatured(character);
  };

  return (
    <>
      <div
        className={`
          relative rounded-xl overflow-hidden transition-all duration-300 flex flex-col
          ${isFeatured 
            ? 'bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-400 shadow-lg' 
            : 'bg-white/80 border border-amber-200 hover:bg-white hover:shadow-md hover:-translate-y-1'
          }
          ${isPremiumLocked ? 'opacity-80' : ''}
        `}
      >
        <div className="p-4 flex flex-col items-center text-center">
          {/* Avatar with star badge outside overflow-hidden */}
          <div className="relative mb-3">
            <div className={`
              w-20 h-20 rounded-full overflow-hidden
              ${isFeatured ? 'ring-4 ring-amber-400 ring-offset-2' : 'ring-2 ring-amber-300'}
            `}>
              <img
                src={character.avatar_url || generateFallbackAvatar(character.name)}
                alt={character.name}
                className="w-full h-full object-cover object-[center_20%]"
                onError={(e) => { e.target.src = generateFallbackAvatar(character.name); }}
              />
            </div>
            {isFeatured && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-md z-10">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            )}
          </div>
          
          {/* Name */}
          <h3 className="font-bold text-amber-900 text-lg mb-1" style={{ fontFamily: 'Cinzel, serif' }}>
            {character.name}
          </h3>
          
          {/* Description - fixed height with overflow hidden */}
          <p className="text-amber-700/80 text-sm line-clamp-2 mb-3 h-10 overflow-hidden">
            {character.description || character.scriptural_context || 'Biblical figure'}
          </p>
          
          {/* Action buttons row - Favorite, Featured, Info */}
          <div className="flex items-center justify-center gap-1 mb-3">
            {/* Favorite button */}
            <button
              onClick={handleFavoriteClick}
              className={`p-2 rounded-full transition-colors ${
                isFavorite 
                  ? 'bg-amber-200 text-amber-600' 
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-500'
              }`}
              title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            >
              <svg className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isFavorite ? "0" : "1.5"} viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
            
            {/* Featured/Bookmark button */}
            <button
              onClick={handleFeaturedClick}
              className={`p-2 rounded-full transition-colors ${
                isFeatured 
                  ? 'bg-amber-200 text-amber-600' 
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-500'
              }`}
              title={isFeatured ? "Currently Featured" : "Set as Featured"}
            >
              <svg className="w-5 h-5" fill={isFeatured ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isFeatured ? "0" : "1.5"} viewBox="0 0 20 20">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
            </button>
            
            {/* Info button */}
            <button
              onClick={handleInfoClick}
              className="p-2 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-600 transition-colors"
              title="More Info"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Chat button */}
          <button
            onClick={handleChatClick}
            disabled={isPremiumLocked}
            className={`
              w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2
              ${isPremiumLocked 
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                : 'bg-amber-600 hover:bg-amber-700 text-white shadow-md'
              }
            `}
          >
            {isPremiumLocked ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a4 4 0 00-4 4v2H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-1V6a4 4 0 00-4-4zM8 6a2 2 0 114 0v2H8V6z" />
                </svg>
                Premium
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                Chat Now
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Info Modal */}
      {showInfo && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setShowInfo(false)}
        >
          <div 
            className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5 max-w-sm w-full shadow-2xl border-2 border-amber-400"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowInfo(false)}
              className="absolute top-3 right-3 p-1 rounded-full bg-amber-200 hover:bg-amber-300 text-amber-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Avatar */}
            <div className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden ring-4 ring-amber-400">
              <img
                src={character.avatar_url || generateFallbackAvatar(character.name)}
                alt={character.name}
                className="w-full h-full object-cover object-[center_20%]"
              />
            </div>
            
            {/* Name */}
            <h2 className="text-xl font-bold text-amber-900 text-center mb-1" style={{ fontFamily: 'Cinzel, serif' }}>
              {character.name}
            </h2>
            
            {/* Divider */}
            <div className="h-0.5 w-16 bg-amber-400 rounded-full mx-auto mb-3" />
            
            {/* Scripture reference if available */}
            {character.bible_book && (
              <div className="bg-amber-200/50 rounded-lg p-3 mb-3">
                <h3 className="text-sm font-semibold text-amber-800 mb-1 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                  Scripture
                </h3>
                <div className="flex flex-wrap gap-1">
                  {character.bible_book.split(',').map((book, i) => (
                    <span key={i} className="bg-amber-600 text-white px-2 py-0.5 rounded-full text-xs">
                      {book.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Description */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-amber-800 mb-1 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                About
              </h3>
              <p className="text-amber-900/80 text-sm leading-relaxed">
                {character.description || 'A figure from biblical history.'}
              </p>
            </div>
            
            {/* Chat button */}
            <button
              onClick={() => { setShowInfo(false); onSelect(character); }}
              disabled={isPremiumLocked}
              className={`
                w-full py-2.5 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2
                ${isPremiumLocked 
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                  : 'bg-amber-600 hover:bg-amber-700 text-white shadow-md'
                }
              `}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              Chat with {character.name}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// Chat Message Bubble with scroll theme
const ChatBubble = ({ message, character }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden ring-2 ring-amber-300">
          <img
            src={character?.avatar_url || generateFallbackAvatar(character?.name || 'Guide')}
            alt={character?.name}
            className="w-full h-full object-cover object-[center_20%]"
          />
        </div>
      )}
      
      {/* Bubble */}
      <div className={`
        max-w-[80%] rounded-2xl px-4 py-3 shadow-sm
        ${isUser 
          ? 'bg-amber-600 text-white rounded-br-md' 
          : 'bg-white/90 text-amber-900 border border-amber-200 rounded-bl-md'
        }
      `}>
        {!isUser && (
          <p className="font-semibold text-amber-800 text-sm mb-1" style={{ fontFamily: 'Cinzel, serif' }}>
            {character?.name}
          </p>
        )}
        <p className="text-sm whitespace-pre-wrap" style={{ fontFamily: 'Georgia, serif' }}>
          {message.content}
        </p>
      </div>
    </div>
  );
};

// Main Chat Page Component
const ChatPageScroll = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium } = usePremium();
  const {
    character,
    messages,
    isLoading,
    isTyping,
    sendMessage,
    selectCharacter,
    resetChat,
  } = useChat();

  const [characters, setCharacters] = useState([]);
  const [featuredCharacter, setFeaturedCharacter] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [testament, setTestament] = useState('all');
  const [tierSettings, setTierSettings] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [loadingChars, setLoadingChars] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load characters
  useEffect(() => {
    const loadCharacters = async () => {
      setLoadingChars(true);
      try {
        const data = await characterRepository.getAll(false);
        setCharacters(data);
        
        // Set featured character (Jesus or first)
        const jesus = data.find(c => c.name?.toLowerCase().includes('jesus'));
        setFeaturedCharacter(jesus || data[0] || null);
        
        // Load tier settings
        const settings = await getTierSettings();
        setTierSettings(settings);
      } catch (err) {
        console.error('Failed to load characters:', err);
      } finally {
        setLoadingChars(false);
      }
    };
    loadCharacters();
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when character selected
  useEffect(() => {
    if (character) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [character]);

  // Filter characters
  const filteredCharacters = characters.filter(c => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!c.name?.toLowerCase().includes(q) && !c.description?.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (testament === 'old' && c.testament?.toLowerCase() !== 'old') return false;
    if (testament === 'new' && c.testament?.toLowerCase() !== 'new') return false;
    return true;
  });

  // Pagination - exclude featured from count
  const charactersWithoutFeatured = filteredCharacters.filter(c => c.id !== featuredCharacter?.id);
  const totalPages = Math.ceil(charactersWithoutFeatured.length / ITEMS_PER_PAGE);
  const paginatedCharacters = charactersWithoutFeatured.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, testament]);

  // Handle character selection
  const handleSelectCharacter = async (char) => {
    const canChat = isPremium || isCharacterFree(char, tierSettings);
    if (!canChat) {
      setShowUpgrade(true);
      return;
    }
    // Pass the full character object, not just the ID
    selectCharacter(char);
  };

  // Handle toggling favorite
  const handleToggleFavorite = (char) => {
    setFavoriteIds(prev => {
      if (prev.includes(char.id)) {
        return prev.filter(id => id !== char.id);
      }
      return [...prev, char.id];
    });
  };

  // Handle setting featured character
  const handleSetFeatured = (char) => {
    setFeaturedCharacter(char);
  };

  // Handle send message
  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    const msg = inputValue;
    setInputValue('');
    await sendMessage(msg);
  };

  // Handle back to characters
  const handleBackToCharacters = () => {
    resetChat();
  };

  // Render character selection view
  const renderCharacterSelection = () => (
    <ScrollWrap className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <Link
          to="/preview"
          className="inline-flex items-center text-amber-700 hover:text-amber-900 text-sm mb-4"
        >
          <svg className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Home
        </Link>
        
        <h1 className="text-3xl md:text-4xl font-bold text-amber-900 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
          Choose Your Biblical Guide
        </h1>
        <p className="text-amber-700/80 max-w-xl mx-auto">
          Select a character from Scripture to begin a conversation. Ask questions, seek wisdom, and explore their story.
        </p>
      </div>

      <ScrollDivider className="my-4" />

      {/* Featured Character */}
      {featuredCharacter && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-amber-800 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Featured Guide
          </h2>
          <CharacterCard 
            character={featuredCharacter} 
            onSelect={handleSelectCharacter}
            isPremiumLocked={!isPremium && !isCharacterFree(featuredCharacter, tierSettings)}
            isFeatured
            isFavorite={favoriteIds.includes(featuredCharacter?.id)}
            onToggleFavorite={handleToggleFavorite}
            onSetFeatured={handleSetFeatured}
          />
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search characters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-amber-300 rounded-full text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <svg className="absolute left-3.5 top-3 w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <div className="flex gap-2">
          {['all', 'old', 'new'].map((t) => (
            <button
              key={t}
              onClick={() => setTestament(t)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                testament === t
                  ? 'bg-amber-600 text-white'
                  : 'bg-white/60 text-amber-800 border border-amber-300 hover:bg-amber-100'
              }`}
            >
              {t === 'all' ? 'All' : t === 'old' ? 'Old Testament' : 'New Testament'}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loadingChars && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-700" />
        </div>
      )}

      {/* Character Grid */}
      {!loadingChars && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {paginatedCharacters.map((char) => (
            <CharacterCard
              key={char.id}
              character={char}
              onSelect={handleSelectCharacter}
              isPremiumLocked={!isPremium && !isCharacterFree(char, tierSettings)}
              isFeatured={featuredCharacter?.id === char.id}
              isFavorite={favoriteIds.includes(char.id)}
              onToggleFavorite={handleToggleFavorite}
              onSetFeatured={handleSetFeatured}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loadingChars && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {/* Previous button */}
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg border transition-colors ${
              currentPage === 1
                ? 'border-amber-200 text-amber-300 cursor-not-allowed'
                : 'border-amber-400 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
              // Show first, last, current, and adjacent pages
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-lg font-medium transition-colors ${
                      page === currentPage
                        ? 'bg-amber-600 text-white'
                        : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                    }`}
                    style={{ fontFamily: 'Cinzel, serif' }}
                  >
                    {page}
                  </button>
                );
              } else if (
                (page === currentPage - 2 && currentPage > 3) ||
                (page === currentPage + 2 && currentPage < totalPages - 2)
              ) {
                return <span key={page} className="text-amber-400 px-1">...</span>;
              }
              return null;
            })}
          </div>
          
          {/* Next button */}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg border transition-colors ${
              currentPage === totalPages
                ? 'border-amber-200 text-amber-300 cursor-not-allowed'
                : 'border-amber-400 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Results count */}
      {!loadingChars && charactersWithoutFeatured.length > 0 && (
        <p className="text-center text-amber-600 text-sm mt-4" style={{ fontFamily: 'Georgia, serif' }}>
          Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, charactersWithoutFeatured.length)} of {charactersWithoutFeatured.length} characters
        </p>
      )}

      {!loadingChars && filteredCharacters.length === 0 && (
        <div className="text-center py-12 text-amber-700">
          No characters found matching your search.
        </div>
      )}
    </ScrollWrap>
  );

  // Render chat view
  const renderChatView = () => (
    <div className="max-w-4xl mx-auto px-4">
      {/* Chat Header */}
      <div className="sticky top-16 z-20 py-3">
        <div className="bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 rounded-xl border border-amber-200 shadow-md px-4 py-3 flex items-center gap-4">
          <button
            onClick={handleBackToCharacters}
            className="p-2 hover:bg-amber-200/50 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-amber-400">
            <img
              src={character?.avatar_url || generateFallbackAvatar(character?.name || 'Guide')}
              alt={character?.name}
              className="w-full h-full object-cover object-[center_20%]"
            />
          </div>
          
          <div className="flex-1">
            <h2 className="font-bold text-amber-900" style={{ fontFamily: 'Cinzel, serif' }}>
              {character?.name}
            </h2>
            <p className="text-amber-600 text-sm truncate">
              {character?.description || 'Biblical Guide'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <ScrollWrap className="mt-4 mb-24">
        <div className="space-y-4 py-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-amber-700 italic" style={{ fontFamily: 'Georgia, serif' }}>
                Begin your conversation with {character?.name}. Ask about their life, seek wisdom, or explore Scripture together.
              </p>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <ChatBubble key={idx} message={msg} character={character} />
          ))}
          
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-amber-300">
                <img
                  src={character?.avatar_url || generateFallbackAvatar(character?.name)}
                  alt={character?.name}
                  className="w-full h-full object-cover object-[center_20%]"
                />
              </div>
              <div className="bg-white/90 border border-amber-200 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollWrap>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-amber-900 via-amber-900/95 to-transparent pt-8 pb-4 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={`Message ${character?.name}...`}
              rows={1}
              className="flex-1 resize-none bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 max-h-32"
              style={{ fontFamily: 'Georgia, serif' }}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="flex-shrink-0 w-12 h-12 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-300 text-white rounded-xl flex items-center justify-center transition-colors shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <PreviewLayout>
      <ScrollBackground>
        {character ? renderChatView() : renderCharacterSelection()}
      </ScrollBackground>
      
      {!character && <FooterScroll />}
      
      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        limitType="character"
        featureName="Premium Characters"
      />
    </PreviewLayout>
  );
};

export default ChatPageScroll;
