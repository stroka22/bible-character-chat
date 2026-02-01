import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useChat } from '../contexts/ChatContext.jsx';
import { useConversation } from '../contexts/ConversationContext.jsx';
import { useAuth } from '../contexts/AuthContext';
import { characterRepository } from '../repositories/characterRepository';
import { groupRepository } from '../repositories/groupRepository';
import { usePremium } from '../hooks/usePremium';
import { isCharacterFree } from '../utils/accountTier';
import { getSettings as getTierSettings, getOwnerSlug } from '../services/tierSettingsService';
import { userSettingsRepository } from '../repositories/userSettingsRepository';
import userFavoritesRepository from '../repositories/userFavoritesRepository';
import siteSettingsRepository from '../repositories/siteSettingsRepository';
import UpgradeModal from '../components/modals/UpgradeModal';
import FooterScroll from '../components/FooterScroll';
import PreviewLayout from '../components/PreviewLayout';
import { ScrollWrap, ScrollDivider, ScrollBackground } from '../components/ScrollWrap';
import { createChatInvite } from '../services/chatInvitesService';

// Bible books for filtering
const BIBLE_BOOKS = {
  oldTestament: [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
    'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings',
    '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job',
    'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah',
    'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel',
    'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah',
    'Haggai', 'Zechariah', 'Malachi'
  ],
  newTestament: [
    'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians',
    '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians',
    '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus',
    'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John',
    '3 John', 'Jude', 'Revelation'
  ]
};

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const generateFallbackAvatar = (name) => 
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

// Character Card Component with scroll theme
const CharacterCard = ({ character, onSelect, isPremiumLocked, isFeatured, isFavorite, onToggleFavorite, onSetFeatured, isSelected, viewMode }) => {
  const [showInfo, setShowInfo] = useState(false);
  
  const handleInfoClick = (e) => {
    e.stopPropagation();
    setShowInfo(true);
  };
  
  const handleChatClick = (e) => {
    e.stopPropagation();
    if (!isPremiumLocked) onSelect(character);
  };
  
  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (onToggleFavorite) onToggleFavorite(character);
  };
  
  const handleFeaturedClick = (e) => {
    e.stopPropagation();
    if (onSetFeatured) onSetFeatured(character);
  };

  // List view layout
  if (viewMode === 'list') {
    return (
      <>
        <div
          onClick={handleChatClick}
          className={`
            flex items-center gap-4 p-4 rounded-xl transition-all duration-300 cursor-pointer
            ${isSelected 
              ? 'bg-amber-200 border-2 border-amber-500' 
              : 'bg-white/80 border border-amber-200 hover:bg-amber-50'
            }
            ${isPremiumLocked ? 'opacity-70' : ''}
          `}
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-amber-300">
              <img
                src={character.avatar_url || generateFallbackAvatar(character.name)}
                alt={character.name}
                className="w-full h-full object-cover object-[center_20%]"
                onError={(e) => { e.target.src = generateFallbackAvatar(character.name); }}
              />
            </div>
            {isFavorite && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            )}
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-amber-900 text-lg" style={{ fontFamily: 'Cinzel, serif' }}>
              {character.name}
            </h3>
            <p className="text-amber-700/80 text-sm line-clamp-2">
              {character.description || 'Biblical figure'}
            </p>
            {character.bible_book && (
              <p className="text-amber-600/60 text-xs mt-1">{character.bible_book}</p>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            <button onClick={handleFavoriteClick} className={`p-2 rounded-full transition-colors ${isFavorite ? 'bg-amber-200 text-amber-600' : 'bg-amber-100 text-amber-400 hover:bg-amber-200'}`} title="Favorite">
              <svg className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
            <button onClick={handleInfoClick} className="p-2 rounded-full bg-amber-100 text-amber-600 hover:bg-amber-200 transition-colors" title="Info">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={handleChatClick}
              disabled={isPremiumLocked}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                isPremiumLocked 
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                  : isSelected
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-500 hover:bg-amber-600 text-white'
              }`}
            >
              {isPremiumLocked ? 'Premium' : isSelected ? 'Continue' : 'Chat'}
            </button>
          </div>
        </div>
        
        {/* Info Modal */}
        {showInfo && <CharacterInfoModal character={character} onClose={() => setShowInfo(false)} onSelect={onSelect} isPremiumLocked={isPremiumLocked} />}
      </>
    );
  }

  // Grid view layout (default)
  return (
    <>
      <div
        className={`
          relative rounded-xl overflow-visible transition-all duration-300 flex flex-col
          ${isFeatured 
            ? 'bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-400 shadow-lg' 
            : isSelected
              ? 'bg-amber-100 border-2 border-amber-500 shadow-lg'
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
      {showInfo && <CharacterInfoModal character={character} onClose={() => setShowInfo(false)} onSelect={onSelect} isPremiumLocked={isPremiumLocked} />}
    </>
  );
};

// Character Info Modal Component
const CharacterInfoModal = ({ character, onClose, onSelect, isPremiumLocked }) => (
  <div 
    className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
    onClick={onClose}
  >
    <div 
      className="relative bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5 max-w-sm w-full shadow-2xl border-2 border-amber-400"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close button */}
      <button
        onClick={onClose}
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
        onClick={() => { onClose(); onSelect(character); }}
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
);

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
  const location = useLocation();
  const { conversationId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { isPremium } = usePremium();
  const {
    character,
    messages,
    isLoading,
    isTyping,
    sendMessage,
    selectCharacter,
    resetChat,
    chatId,
    isChatSaved,
    saveChat,
    saveChatTitle,
    deleteCurrentChat,
    toggleFavorite,
    isFavorite: isChatFavorite,
    hydrateFromConversation,
  } = useChat();
  
  // Conversation context for sharing and fetching
  const { shareConversation, fetchConversationWithMessages } = useConversation();

  // Character data
  const [characters, setCharacters] = useState([]);
  const [featuredCharacter, setFeaturedCharacter] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [groups, setGroups] = useState([]);
  const [tierSettings, setTierSettings] = useState(null);
  const [loadingChars, setLoadingChars] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [testament, setTestament] = useState('all');
  const [bookFilter, setBookFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [currentLetter, setCurrentLetter] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // View options
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;
  
  // UI state
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  
  // Load conversation from URL if conversationId or character param exists
  useEffect(() => {
    const loadFromUrl = async () => {
      const params = new URLSearchParams(location.search);
      const charParam = params.get('character');
      
      // If there's a conversationId in URL, load that conversation
      if (conversationId && fetchConversationWithMessages && hydrateFromConversation) {
        try {
          const conv = await fetchConversationWithMessages(conversationId);
          if (conv) {
            await hydrateFromConversation(conv);
          }
        } catch (err) {
          console.error('Failed to load conversation:', err);
        }
      }
      // If there's a character param, select that character
      else if (charParam && characters.length > 0) {
        const char = characters.find(c => 
          String(c.id) === charParam || 
          c.name.toLowerCase() === charParam.toLowerCase()
        );
        if (char) {
          const canChat = isPremium || isCharacterFree(char, tierSettings);
          if (canChat) {
            selectCharacter(char);
          }
        }
      }
    };
    loadFromUrl();
  }, [conversationId, location.search, characters, tierSettings, isPremium]);

  // Update URL when chat is saved (so refresh will reload conversation)
  useEffect(() => {
    if (chatId && character && !conversationId) {
      // Chat was saved, update URL to include conversation ID
      const newUrl = `/chat/${chatId}`;
      window.history.replaceState(null, '', newUrl);
    }
  }, [chatId, character, conversationId]);

  // Load characters
  useEffect(() => {
    const loadCharacters = async () => {
      setLoadingChars(true);
      try {
        const data = await characterRepository.getAll(false);
        setCharacters(data);
        
        // Resolve featured character
        const params = new URLSearchParams(window.location.search);
        const featuredParam = params.get('featured');
        
        if (featuredParam) {
          const byName = data.find(c => c.name.toLowerCase() === featuredParam.toLowerCase());
          const byId = data.find(c => String(c.id) === String(featuredParam));
          if (byName || byId) {
            setFeaturedCharacter(byName || byId);
            return;
          }
        }
        
        // Try site settings
        const owner = getOwnerSlug();
        try {
          const settings = await siteSettingsRepository.getSettings(owner);
          if (settings?.defaultId) {
            const c = data.find(c => String(c.id) === String(settings.defaultId));
            if (c) {
              setFeaturedCharacter(c);
              return;
            }
          }
        } catch {}
        
        // Try user preference
        if (user?.id) {
          try {
            const userFeaturedId = await userSettingsRepository.getFeaturedCharacterId(user.id);
            if (userFeaturedId) {
              const c = data.find(c => String(c.id) === String(userFeaturedId));
              if (c) {
                setFeaturedCharacter(c);
                return;
              }
            }
          } catch {}
        }
        
        // Fallback to Jesus or first
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
  }, [user?.id]);

  // Load groups
  useEffect(() => {
    (async () => {
      try {
        const all = await groupRepository.getAllGroups();
        setGroups(all);
      } catch (e) {
        console.error('Failed to fetch character groups:', e);
      }
    })();
  }, []);

  // Load favorites
  useEffect(() => {
    (async () => {
      if (!user?.id) {
        setFavoriteIds([]);
        return;
      }
      try {
        const ids = await userFavoritesRepository.getFavoriteIds(user.id);
        setFavoriteIds(ids || []);
      } catch {
        setFavoriteIds([]);
      }
    })();
  }, [user?.id]);

  // Removed duplicate scroll effect - handled by scrollToBottom callback below

  // Focus input when character selected
  useEffect(() => {
    if (character) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [character]);

  // Filter characters
  const filteredCharacters = useMemo(() => {
    let result = [...characters];
    
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q)
      );
    }
    
    // Testament filter
    if (testament !== 'all') {
      result = result.filter(c => {
        const text = `${c.description || ''} ${c.bible_book || ''} ${c.scriptural_context || ''}`.toLowerCase();
        return testament === 'old'
          ? /(genesis|exodus|leviticus|numbers|deuteronomy|joshua|judges|ruth|samuel|kings|chronicles|ezra|nehemiah|esther|job|psalms|proverbs|ecclesiastes|song of solomon|isaiah|jeremiah|lamentations|ezekiel|daniel|hosea|joel|amos|obadiah|jonah|micah|nahum|habakkuk|zephaniah|haggai|zechariah|malachi|old testament)/i.test(text)
          : /(matthew|mark|luke|john|acts|romans|corinthians|galatians|ephesians|philippians|colossians|thessalonians|timothy|titus|philemon|hebrews|james|peter|john|jude|revelation|new testament)/i.test(text);
      });
    }
    
    // Book filter
    if (bookFilter !== 'all') {
      result = result.filter(c => {
        const text = `${c.description || ''} ${c.bible_book || ''} ${c.scriptural_context || ''}`.toLowerCase();
        return text.includes(bookFilter.toLowerCase());
      });
    }
    
    // Group filter
    if (groupFilter !== 'all') {
      result = result.filter(c => {
        const text = `${c.description || ''}`.toLowerCase();
        return text.includes(groupFilter.toLowerCase());
      });
    }
    
    // Alphabetical filter
    if (currentLetter !== 'all') {
      result = result.filter(c => c.name?.toUpperCase().startsWith(currentLetter));
    }
    
    // Favorites only
    if (showFavoritesOnly) {
      result = result.filter(c => favoriteIds.includes(c.id));
    }
    
    // Sort alphabetically
    result.sort((a, b) => a.name.localeCompare(b.name));
    
    return result;
  }, [characters, searchQuery, testament, bookFilter, groupFilter, currentLetter, showFavoritesOnly, favoriteIds]);

  // Pagination
  const totalPages = Math.ceil(filteredCharacters.length / ITEMS_PER_PAGE);
  const paginatedCharacters = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCharacters.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCharacters, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, testament, bookFilter, groupFilter, currentLetter, showFavoritesOnly]);

  // Active filters for display
  const activeFilters = useMemo(() => {
    const filters = [];
    if (testament !== 'all') filters.push({ type: 'testament', value: testament === 'old' ? 'Old Testament' : 'New Testament' });
    if (bookFilter !== 'all') filters.push({ type: 'book', value: bookFilter });
    if (groupFilter !== 'all') filters.push({ type: 'group', value: groupFilter });
    if (searchQuery) filters.push({ type: 'search', value: `"${searchQuery}"` });
    if (currentLetter !== 'all') filters.push({ type: 'letter', value: `Letter "${currentLetter}"` });
    if (showFavoritesOnly) filters.push({ type: 'favorites', value: 'Favorites Only' });
    return filters;
  }, [testament, bookFilter, groupFilter, searchQuery, currentLetter, showFavoritesOnly]);

  // Remove filter
  const removeFilter = (type) => {
    switch(type) {
      case 'testament': setTestament('all'); break;
      case 'book': setBookFilter('all'); break;
      case 'group': setGroupFilter('all'); break;
      case 'search': setSearchQuery(''); break;
      case 'letter': setCurrentLetter('all'); break;
      case 'favorites': setShowFavoritesOnly(false); break;
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setTestament('all');
    setBookFilter('all');
    setGroupFilter('all');
    setSearchQuery('');
    setCurrentLetter('all');
    setShowFavoritesOnly(false);
    setCurrentPage(1);
  };

  // Handle character selection
  const handleSelectCharacter = async (char) => {
    const canChat = isPremium || isCharacterFree(char, tierSettings);
    if (!canChat) {
      setShowUpgrade(true);
      return;
    }
    selectCharacter(char);
  };

  // Handle toggling favorite
  const handleToggleFavorite = async (char) => {
    if (!user?.id) return;
    const isFav = favoriteIds.includes(char.id);
    await userFavoritesRepository.setFavorite(user.id, char.id, !isFav);
    try {
      const ids = await userFavoritesRepository.getFavoriteIds(user.id);
      setFavoriteIds(ids || []);
    } catch {}
  };

  // Handle setting featured character
  const handleSetFeatured = async (char) => {
    setFeaturedCharacter(char);
    if (user?.id) {
      try {
        await userSettingsRepository.setFeaturedCharacterId(user.id, char.id);
      } catch {}
    }
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

  // Show action message helper
  const showActionMessage = (text, type = 'success') => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage(null), 3000);
  };

  // Format conversation for copying
  const formatConversationAsText = () => {
    if (!character || messages.length === 0) return '';
    const title = `Conversation with ${character.name}\n`;
    const date = `Date: ${new Date().toLocaleDateString()}\n\n`;
    const formatted = messages.map(m => {
      const speaker = m.role === 'user' ? 'You' : character.name;
      return `${speaker}:\n${m.content}\n`;
    }).join('\n');
    return `${title}${date}${formatted}`;
  };

  // Handle save chat
  const handleSaveChat = async () => {
    if (!character || messages.length === 0) return;
    setIsSaving(true);
    try {
      const success = await saveChat();
      if (success) {
        showActionMessage('Conversation saved!');
      } else {
        showActionMessage('Failed to save conversation', 'error');
      }
    } catch (err) {
      showActionMessage('Failed to save conversation', 'error');
    } finally {
      setIsSaving(false);
      setShowActionsMenu(false);
    }
  };

  // Handle copy transcript
  const handleCopyTranscript = async () => {
    try {
      const text = formatConversationAsText();
      await navigator.clipboard.writeText(text);
      showActionMessage('Copied to clipboard!');
    } catch (err) {
      showActionMessage('Failed to copy', 'error');
    }
    setShowActionsMenu(false);
  };

  // Handle share conversation
  const handleShareConversation = async () => {
    try {
      // Save first if not saved
      if (!chatId) {
        const ok = await saveChat();
        if (!ok) {
          showActionMessage('Please save the conversation first', 'error');
          return;
        }
      }
      const code = await shareConversation(chatId || window.__lastChatId || '');
      if (!code) {
        showActionMessage('Failed to generate share link', 'error');
        return;
      }
      const url = `${window.location.origin}/shared/${code}`;
      const shareText = `You are being invited to join a Bible Chat on Faith Talk AI!\n\nView my conversation with ${character?.name}:\n${url}`;
      
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Bible Chat on Faith Talk AI',
            text: shareText,
            url,
          });
          showActionMessage('Shared successfully!');
        } catch (shareErr) {
          // User cancelled share - not an error, just copy to clipboard
          if (shareErr.name !== 'AbortError') {
            await navigator.clipboard.writeText(shareText);
            showActionMessage('Share link copied!');
          }
        }
      } else {
        await navigator.clipboard.writeText(shareText);
        showActionMessage('Share link copied!');
      }
    } catch (err) {
      console.error('Share error:', err);
      showActionMessage('Failed to share', 'error');
    }
    setShowActionsMenu(false);
  };

  // Handle toggle chat favorite
  const handleToggleChatFavorite = async () => {
    try {
      await toggleFavorite();
      showActionMessage(isChatFavorite ? 'Removed from favorites' : 'Added to favorites!');
    } catch (err) {
      showActionMessage('Failed to update favorite', 'error');
    }
    setShowActionsMenu(false);
  };

  // Handle rename conversation
  const handleRenameChat = async () => {
    if (!chatId || !renameValue.trim()) return;
    try {
      await saveChatTitle(renameValue.trim());
      showActionMessage('Conversation renamed!');
      setShowRenameModal(false);
      setRenameValue('');
    } catch (err) {
      showActionMessage('Failed to rename conversation', 'error');
    }
  };

  // Handle delete conversation
  const handleDeleteChat = async () => {
    if (!chatId) return;
    try {
      await deleteCurrentChat();
      showActionMessage('Conversation deleted');
      setShowDeleteConfirm(false);
      // Go back to character selection
      resetChat();
    } catch (err) {
      showActionMessage('Failed to delete conversation', 'error');
    }
  };

  // Handle invite to chat
  const handleInviteToChat = async () => {
    try {
      let id = chatId;
      // Save first if not saved
      if (!id && isAuthenticated && messages.length > 0) {
        const savedId = await saveChat();
        if (!savedId) {
          showActionMessage('Please save the conversation first', 'error');
          return;
        }
        // Use the returned ID directly instead of waiting for state
        id = typeof savedId === 'string' ? savedId : chatId;
        // Small delay to ensure DB write completes
        await new Promise(r => setTimeout(r, 200));
      }
      if (!id) {
        showActionMessage('Please start a conversation first', 'error');
        return;
      }
      const { data, error } = await createChatInvite(id);
      if (error || !data?.code) {
        showActionMessage('Failed to create invite', 'error');
        return;
      }
      const url = `${window.location.origin}/join/${data.code}`;
      const inviteText = `You are being invited to join a Bible Chat on Faith Talk AI!\n\nJoin my conversation with ${character?.name}:\n${url}`;
      
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Join my Bible Chat on Faith Talk AI',
            text: inviteText,
            url,
          });
          showActionMessage('Invite shared!');
        } catch (shareErr) {
          // User cancelled or share failed - try clipboard
          if (shareErr.name !== 'AbortError') {
            await navigator.clipboard.writeText(inviteText);
            showActionMessage('Invite link copied!');
          }
        }
      } else {
        await navigator.clipboard.writeText(inviteText);
        showActionMessage('Invite link copied!');
      }
    } catch (err) {
      console.error('Failed to create invite:', err);
      showActionMessage('Failed to create invite', 'error');
    }
    setShowActionsMenu(false);
  };

  // Scroll to bottom smoothly without jumping
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      // Use scrollTop instead of scrollIntoView to prevent page-level jumps
      const container = messagesContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  // Track previous message count to only scroll on new messages
  const prevMessageCount = useRef(messages.length);
  
  // Scroll on new messages only (not on every render)
  useEffect(() => {
    // Only scroll if messages were added (not on initial load hydration)
    if (messages.length > prevMessageCount.current || isTyping) {
      // Small delay to let DOM update
      const timer = setTimeout(scrollToBottom, 50);
      prevMessageCount.current = messages.length;
      return () => clearTimeout(timer);
    }
    prevMessageCount.current = messages.length;
  }, [messages.length, isTyping, scrollToBottom]);

  // Render alphabetical navigation (horizontal)
  const renderAlphaNav = () => (
    <div className="flex items-center justify-center gap-0.5 mb-4 p-2 bg-amber-50/80 rounded-xl border border-amber-200 overflow-x-auto">
      <button
        onClick={() => { setCurrentLetter('all'); setCurrentPage(1); }}
        className={`px-2 py-1 rounded text-xs font-medium transition-colors flex-shrink-0 ${
          currentLetter === 'all' ? 'bg-amber-600 text-white' : 'bg-white text-amber-700 border border-amber-300 hover:bg-amber-100'
        }`}
      >
        All
      </button>
      {ALPHABET.map(letter => (
        <button
          key={letter}
          onClick={() => { setCurrentLetter(letter); setCurrentPage(1); }}
          className={`w-7 h-7 rounded text-xs font-medium transition-colors flex-shrink-0 ${
            currentLetter === letter ? 'bg-amber-600 text-white' : 'bg-white text-amber-700 border border-amber-300 hover:bg-amber-100'
          }`}
        >
          {letter}
        </button>
      ))}
    </div>
  );

  // Render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    return (
      <div className="flex items-center justify-center gap-2 mt-6">
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
            currentPage === 1 ? 'bg-amber-100 text-amber-300 cursor-not-allowed' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
          }`}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        
        {startPage > 1 && (
          <>
            <button onClick={() => setCurrentPage(1)} className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200">1</button>
            {startPage > 2 && <span className="text-amber-400">...</span>}
          </>
        )}
        
        {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(page => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`w-10 h-10 rounded-lg font-medium transition-colors ${
              currentPage === page ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
            }`}
          >
            {page}
          </button>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="text-amber-400">...</span>}
            <button onClick={() => setCurrentPage(totalPages)} className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200">{totalPages}</button>
          </>
        )}
        
        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
            currentPage === totalPages ? 'bg-amber-100 text-amber-300 cursor-not-allowed' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
          }`}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    );
  };

  // Render character selection view
  const renderCharacterSelection = () => (
    <ScrollWrap className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-amber-900 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
          Choose Your Biblical Guide
        </h1>
        <p className="text-amber-700" style={{ fontFamily: 'Georgia, serif' }}>
          Select a character to begin your conversation
        </p>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        <Link
          to="/roundtable/setup"
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-full font-medium transition-colors shadow-md"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
          Roundtable Discussion
        </Link>
        <Link
          to="/studies"
          className="flex items-center gap-2 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-full font-medium transition-colors border border-amber-300"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
          </svg>
          Guided Bible Studies
        </Link>
      </div>

      <ScrollDivider />

      {/* Featured Character */}
      {featuredCharacter && !showFavoritesOnly && activeFilters.length === 0 && (
        <div className="mb-8 text-center">
          <h2 className="flex items-center justify-center gap-2 text-xl font-bold text-amber-800 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
            <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Featured Guide
          </h2>
          
          <div className="inline-block">
            <div className="relative mb-4">
              <div className="absolute -inset-4 rounded-full bg-amber-300 blur-xl opacity-30"></div>
              <div className="relative w-28 h-28 mx-auto rounded-full overflow-hidden ring-4 ring-amber-400 shadow-xl">
                <img
                  src={featuredCharacter.avatar_url || generateFallbackAvatar(featuredCharacter.name)}
                  alt={featuredCharacter.name}
                  className="w-full h-full object-cover object-[center_20%]"
                />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-amber-900 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
              {featuredCharacter.name}
            </h3>
            <p className="text-amber-700/80 max-w-md mx-auto mb-4" style={{ fontFamily: 'Georgia, serif' }}>
              {featuredCharacter.description}
            </p>
            <button
              onClick={() => handleSelectCharacter(featuredCharacter)}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all hover:scale-105"
            >
              Chat with {featuredCharacter.name}
            </button>
          </div>
          
          <p className="mt-6 text-amber-600 text-sm">Or select another character below</p>
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-amber-50/80 rounded-xl p-4 mb-6 border border-amber-200">
        <div className="flex flex-col gap-4">
          {/* Row 1: Search + Testament */}
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search characters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-amber-300 rounded-full text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <svg className="absolute left-3.5 top-3 w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {/* Testament filter */}
            <div className="flex gap-2">
              {['all', 'old', 'new'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTestament(t)}
                  className={`px-4 py-2 rounded-full font-medium transition-colors ${
                    testament === t
                      ? 'bg-amber-600 text-white'
                      : 'bg-white text-amber-700 border border-amber-300 hover:bg-amber-100'
                  }`}
                >
                  {t === 'all' ? 'All' : t === 'old' ? 'Old' : 'New'}
                </button>
              ))}
            </div>
          </div>
          
          {/* Row 2: Book, Group, Favorites, View Toggle */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Book filter */}
            <select
              value={bookFilter}
              onChange={(e) => setBookFilter(e.target.value)}
              className="bg-white border border-amber-300 rounded-full py-2 px-4 text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Books</option>
              <optgroup label="Old Testament">
                {BIBLE_BOOKS.oldTestament.map(book => (
                  <option key={book} value={book}>{book}</option>
                ))}
              </optgroup>
              <optgroup label="New Testament">
                {BIBLE_BOOKS.newTestament.map(book => (
                  <option key={book} value={book}>{book}</option>
                ))}
              </optgroup>
            </select>
            
            {/* Group filter */}
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="bg-white border border-amber-300 rounded-full py-2 px-4 text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Groups</option>
              <option value="Prophets">Prophets</option>
              <option value="Apostles">Apostles</option>
              <option value="Kings">Kings</option>
              <option value="Women">Women of the Bible</option>
              {groups.map(group => (
                <option key={group.id} value={group.name}>{group.name}</option>
              ))}
            </select>
            
            {/* Favorites toggle */}
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${
                showFavoritesOnly
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-amber-700 border border-amber-300 hover:bg-amber-100'
              }`}
            >
              <svg className="w-5 h-5" fill={showFavoritesOnly ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Favorites
            </button>
            
            {/* Spacer */}
            <div className="flex-1" />
            
            {/* View toggle */}
            <div className="flex gap-1 bg-white rounded-lg p-1 border border-amber-300">
              <button
                onClick={() => setViewMode('grid')}
                className={`w-9 h-9 rounded-md flex items-center justify-center transition-colors ${
                  viewMode === 'grid' ? 'bg-amber-600 text-white' : 'text-amber-600 hover:bg-amber-100'
                }`}
                title="Grid view"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`w-9 h-9 rounded-md flex items-center justify-center transition-colors ${
                  viewMode === 'list' ? 'bg-amber-600 text-white' : 'text-amber-600 hover:bg-amber-100'
                }`}
                title="List view"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-amber-100/50 rounded-lg">
          <span className="text-amber-700 text-sm font-medium">Active Filters:</span>
          {activeFilters.map((filter, i) => (
            <div key={i} className="flex items-center gap-1 bg-amber-200 text-amber-800 px-3 py-1 rounded-full text-sm">
              <span>{filter.value}</span>
              <button onClick={() => removeFilter(filter.type)} className="w-4 h-4 rounded-full bg-amber-300 hover:bg-amber-400 flex items-center justify-center">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <button onClick={clearAllFilters} className="text-amber-600 hover:text-amber-800 text-sm font-medium ml-auto">
            Clear All
          </button>
        </div>
      )}

      {/* Alphabetical Navigation (horizontal) */}
      {renderAlphaNav()}

      {/* Results count */}
      <div className="text-center text-amber-600 text-sm mb-4">
        Showing {paginatedCharacters.length} of {filteredCharacters.length} characters
      </div>

      {/* Loading */}
      {loadingChars && (
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
          <p className="mt-4 text-amber-700" style={{ fontFamily: 'Cinzel, serif' }}>Loading characters...</p>
        </div>
      )}

      {/* No results */}
      {!loadingChars && filteredCharacters.length === 0 && (
        <div className="text-center py-12 bg-amber-50/50 rounded-xl">
          <svg className="w-16 h-16 mx-auto text-amber-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-xl text-amber-700 mb-4">No characters found matching your criteria.</p>
          <button onClick={clearAllFilters} className="text-amber-600 hover:text-amber-800 font-medium">
            Clear all filters
          </button>
        </div>
      )}

      {/* Character Grid/List */}
      {!loadingChars && filteredCharacters.length > 0 && (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'flex flex-col gap-3'
        }>
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
              isSelected={character?.id === char.id}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {renderPagination()}
    </ScrollWrap>
  );

  // Render chat view
  // Render Character Insights panel
  const renderInsightsPanel = () => {
    if (!showInsights || !character) return null;
    
    let relationships = {};
    if (character.relationships) {
      try {
        relationships = typeof character.relationships === 'string' 
          ? JSON.parse(character.relationships) 
          : character.relationships;
      } catch {}
    }
    
    return (
      <>
        {/* Backdrop - click to close on all screens */}
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowInsights(false)}
        />
        {/* Panel - starts below header on mobile */}
        <div className="fixed right-0 top-16 sm:top-0 bottom-0 w-full sm:w-[350px] z-50 overflow-y-auto bg-gradient-to-b from-amber-100 to-amber-200 border-l border-amber-300 shadow-lg">
          {/* Close button row */}
          <div className="flex justify-end p-3">
            <button
              onClick={() => setShowInsights(false)}
              className="w-12 h-12 rounded-full bg-black text-white font-bold text-3xl flex items-center justify-center hover:bg-gray-800 transition-colors shadow-lg"
            >
              ×
            </button>
          </div>
          
          <div className="px-5 pb-5">
            {/* Avatar - centered */}
            <div className="flex justify-center mb-4">
              <img
                src={character.avatar_url || generateFallbackAvatar(character.name)}
                alt={character.name}
                className="w-[130px] h-[130px] rounded-full object-cover object-center border-4 border-amber-500"
              />
            </div>
            
            <h3 className="text-2xl font-extrabold text-amber-200 text-center mb-1" style={{ fontFamily: 'Cinzel, serif' }}>
              {character.name}
            </h3>
            {(character.title || character.role) && (
              <p className="text-amber-300 text-center text-sm mb-4">{character.title || character.role}</p>
            )}
          
          {/* Historical Context */}
          <section className="mb-4 bg-white/50 rounded-lg p-4 border border-amber-200">
            <h4 className="text-lg text-amber-800 font-bold mb-2 border-b border-amber-200 pb-1">Historical Context</h4>
            <p className="text-amber-900 text-sm mb-2"><strong>Time Period:</strong> {character.timeline_period || "Unknown"}</p>
            <p className="text-amber-900 text-sm mb-2"><strong>Location:</strong> {character.geographic_location || "Unknown"}</p>
            <p className="text-amber-800 text-sm">{character.historical_context || "No historical context available."}</p>
          </section>
          
          {/* Key Scripture */}
          <section className="mb-4 bg-white/50 rounded-lg p-4 border border-amber-200">
            <h4 className="text-lg text-amber-800 font-bold mb-2 border-b border-amber-200 pb-1">Key Scripture References</h4>
            {character.key_scripture_references ? (
              <ul className="text-amber-800 text-sm list-disc pl-4 space-y-1">
                {character.key_scripture_references.split(/[;,]/).map((ref, i) => (
                  <li key={i}>{ref.trim()}</li>
                ))}
              </ul>
            ) : (
              <p className="text-amber-700 text-sm">No key scripture references available.</p>
            )}
          </section>
          
          {/* Theological Significance */}
          <section className="mb-4 bg-white/50 rounded-lg p-4 border border-amber-200">
            <h4 className="text-lg text-amber-800 font-bold mb-2 border-b border-amber-200 pb-1">Theological Significance</h4>
            <p className="text-amber-800 text-sm">{character.theological_significance || "No theological significance provided."}</p>
          </section>
          
          {/* Relationships */}
          {Object.keys(relationships).length > 0 && (
            <section className="mb-4 bg-white/50 rounded-lg p-4 border border-amber-200">
              <h4 className="text-lg text-amber-800 font-bold mb-2 border-b border-amber-200 pb-1">Relationships</h4>
              {Object.entries(relationships).map(([type, members]) => (
                <div key={type} className="mb-2">
                  <h5 className="font-semibold text-amber-700 text-sm mb-1">{type.charAt(0).toUpperCase() + type.slice(1)}</h5>
                  <div className="flex flex-wrap gap-1">
                    {(Array.isArray(members) ? members : [members]).map((name, i) => (
                      <span key={i} className="bg-amber-200 text-amber-800 text-xs px-2 py-1 rounded-full">{name}</span>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          )}
          
          {/* Study Questions */}
          {character.study_questions && (
            <section className="mb-4 bg-white/50 rounded-lg p-4 border border-amber-200">
              <h4 className="text-lg text-amber-800 font-bold mb-2 border-b border-amber-200 pb-1">Study Questions</h4>
              <ul className="text-amber-800 text-sm list-disc pl-4 space-y-1">
                {character.study_questions.split('\n').map((q, i) => q.trim() && (
                  <li key={i}>{q.trim()}</li>
                ))}
              </ul>
            </section>
          )}
          </div>
        </div>
      </>
    );
  };

  const renderChatView = () => (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 flex flex-col h-[100dvh] sm:h-[calc(100vh-4rem)]">
      {/* Action message toast */}
      {actionMessage && (
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg ${
          actionMessage.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
        }`}>
          {actionMessage.text}
        </div>
      )}

      {/* Character Insights Panel */}
      {renderInsightsPanel()}

      {/* Chat Header with Actions - clean minimal styling */}
      <div className="flex items-center gap-2 sm:gap-3 py-2 sm:py-3 border-b border-amber-200/30">
        <button
          onClick={handleBackToCharacters}
          className="p-1.5 sm:p-2 hover:bg-amber-100 rounded-full transition-colors flex-shrink-0"
          title="Back to characters"
        >
          <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden ring-2 ring-amber-300 flex-shrink-0">
          <img
            src={character?.avatar_url || generateFallbackAvatar(character?.name || 'Guide')}
            alt={character?.name}
            className="w-full h-full object-cover object-[center_20%]"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h2 className="font-extrabold text-amber-200 truncate text-sm sm:text-base" style={{ fontFamily: 'Cinzel, serif' }}>
            {character?.name}
          </h2>
          <p className="text-amber-300 text-xs">
            {isChatSaved ? 'Saved' : messages.length > 1 ? 'Unsaved' : 'New chat'}
          </p>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
          {/* Info button */}
          <button
            onClick={() => setShowInsights(true)}
            className="p-1.5 sm:p-2 hover:bg-amber-100 rounded-full transition-colors text-amber-500 flex-shrink-0"
            title="Character Insights"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </button>
          
          {/* Save button */}
          {messages.length > 0 && (
            <button
              onClick={handleSaveChat}
              disabled={isSaving || isChatSaved}
              className={`p-1.5 sm:p-2 rounded-full transition-colors flex-shrink-0 ${
                isChatSaved 
                  ? 'bg-green-100 text-green-600' 
                  : 'hover:bg-amber-100 text-amber-500'
              }`}
              title={isChatSaved ? 'Saved' : 'Save conversation'}
            >
              {isSaving ? (
                <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill={isChatSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              )}
            </button>
          )}
          
          {/* Mobile: More options button */}
          {messages.length > 0 && (
            <div className="relative sm:hidden">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-1.5 hover:bg-amber-100 rounded-full transition-colors text-amber-500 flex-shrink-0"
                title="More options"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
              
              {/* Mobile dropdown menu */}
              {showMobileMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMobileMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-amber-200 py-1 z-50 min-w-[160px]">
                    <button
                      onClick={() => { handleInviteToChat(); setShowMobileMenu(false); }}
                      className="w-full px-4 py-2 text-left text-amber-800 hover:bg-amber-50 flex items-center gap-2 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Invite
                    </button>
                    <button
                      onClick={() => { handleShareConversation(); setShowMobileMenu(false); }}
                      className="w-full px-4 py-2 text-left text-amber-800 hover:bg-amber-50 flex items-center gap-2 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share
                    </button>
                    <button
                      onClick={() => { handleCopyTranscript(); setShowMobileMenu(false); }}
                      className="w-full px-4 py-2 text-left text-amber-800 hover:bg-amber-50 flex items-center gap-2 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </button>
                    <button
                      onClick={() => { handleToggleChatFavorite(); setShowMobileMenu(false); }}
                      className="w-full px-4 py-2 text-left text-amber-800 hover:bg-amber-50 flex items-center gap-2 text-sm"
                    >
                      <svg className="w-4 h-4" fill={isChatFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      {isChatFavorite ? 'Unfavorite' : 'Favorite'}
                    </button>
                    {isChatSaved && (
                      <>
                        <div className="border-t border-amber-100 my-1" />
                        <button
                          onClick={() => { setShowRenameModal(true); setShowMobileMenu(false); }}
                          className="w-full px-4 py-2 text-left text-amber-800 hover:bg-amber-50 flex items-center gap-2 text-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Rename
                        </button>
                        <button
                          onClick={() => { setShowDeleteConfirm(true); setShowMobileMenu(false); }}
                          className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 text-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
          
          {/* Desktop: Show all buttons inline */}
          <div className="hidden sm:flex items-center gap-1">
            {/* Invite button */}
            {messages.length > 0 && (
              <button
                onClick={handleInviteToChat}
                className="p-2 hover:bg-amber-100 rounded-full transition-colors text-amber-500 flex-shrink-0"
                title="Invite to chat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </button>
            )}
            
            {/* Share button */}
            {messages.length > 0 && (
              <button
                onClick={handleShareConversation}
                className="p-2 hover:bg-amber-100 rounded-full transition-colors text-amber-500 flex-shrink-0"
                title="Share conversation"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            )}
            {/* Copy button */}
            {messages.length > 0 && (
              <button
                onClick={handleCopyTranscript}
                className="p-2 hover:bg-amber-100 rounded-full transition-colors text-amber-500 flex-shrink-0"
                title="Copy transcript"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            )}
            
            {/* Favorite button */}
            {messages.length > 0 && (
              <button
                onClick={handleToggleChatFavorite}
                className={`p-2 rounded-full transition-colors flex-shrink-0 ${
                  isChatFavorite 
                    ? 'bg-amber-200 text-amber-600' 
                    : 'hover:bg-amber-100 text-amber-500'
                }`}
                title={isChatFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <svg className="w-5 h-5" fill={isChatFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>
            )}
            
            {/* Rename button (only for saved chats) */}
            {isChatSaved && (
              <button
                onClick={() => setShowRenameModal(true)}
                className="p-2 hover:bg-amber-100 rounded-full transition-colors text-amber-500 flex-shrink-0"
                title="Rename conversation"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            
            {/* Delete button (only for saved chats) */}
            {isChatSaved && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 hover:bg-red-100 rounded-full transition-colors text-red-400 flex-shrink-0"
                title="Delete conversation"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Rename Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowRenameModal(false)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-amber-900 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>Rename Conversation</h3>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="Enter new name..."
              className="w-full px-4 py-3 rounded-lg border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 mb-4"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowRenameModal(false); setRenameValue(''); }}
                className="px-4 py-2 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRenameChat}
                disabled={!renameValue.trim()}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-amber-300 transition-colors"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-amber-900 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>Delete Conversation?</h3>
            <p className="text-amber-700 mb-4">This action cannot be undone. Are you sure you want to delete this conversation?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteChat}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages - scrollable area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto py-4 space-y-4 px-1"
      >
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div key={msg.id || idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'} pl-1`}>
              <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
                {!isUser && (
                  <div className="w-10 h-10 min-w-[2.5rem] rounded-full overflow-hidden ring-2 ring-amber-300 flex-shrink-0">
                    <img
                      src={character?.avatar_url || generateFallbackAvatar(character?.name || 'Guide')}
                      alt={character?.name}
                      className="w-full h-full object-cover object-[center_20%]"
                    />
                  </div>
                )}
                <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  {!isUser && (
                    <span className="text-amber-200 text-sm font-bold mb-1 ml-1">{character?.name}</span>
                  )}
                  <div className={`rounded-2xl px-4 py-3 ${
                    isUser 
                      ? 'bg-amber-600 text-white rounded-br-md' 
                      : 'bg-white/90 border border-amber-200 text-amber-900 rounded-bl-md'
                  }`} style={{ fontFamily: 'Georgia, serif' }}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-3 pl-1">
            <div className="w-10 h-10 min-w-[2.5rem] rounded-full overflow-hidden ring-2 ring-amber-300 flex-shrink-0">
              <img
                src={character?.avatar_url || generateFallbackAvatar(character?.name || 'Guide')}
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

      {/* Input Area - minimal styling */}
      <div className="py-2 sm:py-3 pb-safe">
        <div className="flex gap-2 sm:gap-3">
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
            className="flex-1 resize-none rounded-xl border border-amber-300 bg-white px-3 sm:px-4 py-2 sm:py-3 text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-base"
            style={{ fontFamily: 'Georgia, serif' }}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white rounded-xl font-medium transition-colors flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <PreviewLayout>
      <ScrollBackground className={character ? "h-screen overflow-hidden" : "min-h-screen py-6 px-4"}>
        {character ? renderChatView() : renderCharacterSelection()}
      </ScrollBackground>
      
      {/* Upgrade Modal */}
      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        title="Upgrade to chat with premium characters"
        message="This character is premium. Upgrade to unlock all characters and features."
      />
      
      {/* Hide footer during active chat for more message space */}
      {!character && <FooterScroll />}
    </PreviewLayout>
  );
};

export default ChatPageScroll;
