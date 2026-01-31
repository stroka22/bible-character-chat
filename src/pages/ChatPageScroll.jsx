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
const CharacterCard = ({ character, onSelect, isPremiumLocked, isFeatured }) => {
  return (
    <button
      onClick={() => onSelect(character)}
      className={`
        relative w-full text-left rounded-xl overflow-hidden transition-all duration-300
        ${isFeatured 
          ? 'bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-400 shadow-lg' 
          : 'bg-white/80 border border-amber-200 hover:bg-white hover:shadow-md hover:-translate-y-1'
        }
        ${isPremiumLocked ? 'opacity-75' : ''}
      `}
    >
      <div className="p-4 flex items-center gap-4">
        {/* Avatar */}
        <div className={`
          relative flex-shrink-0 w-16 h-16 rounded-full overflow-hidden
          ${isFeatured ? 'ring-4 ring-amber-400 ring-offset-2' : 'ring-2 ring-amber-300'}
        `}>
          <img
            src={character.avatar_url || generateFallbackAvatar(character.name)}
            alt={character.name}
            className="w-full h-full object-cover object-[center_20%]"
            onError={(e) => { e.target.src = generateFallbackAvatar(character.name); }}
          />
          {isFeatured && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          )}
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-amber-900 text-lg truncate" style={{ fontFamily: 'Cinzel, serif' }}>
            {character.name}
          </h3>
          <p className="text-amber-700/80 text-sm line-clamp-2">
            {character.description || character.scriptural_context || 'Biblical figure'}
          </p>
        </div>
        
        {/* Arrow */}
        <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
      
      {/* Premium Lock Overlay */}
      {isPremiumLocked && (
        <div className="absolute inset-0 bg-amber-900/30 backdrop-blur-[2px] flex items-center justify-center">
          <span className="px-3 py-1.5 bg-amber-600 text-white text-sm font-medium rounded-full shadow">
            Premium
          </span>
        </div>
      )}
    </button>
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
  const [searchQuery, setSearchQuery] = useState('');
  const [testament, setTestament] = useState('all');
  const [tierSettings, setTierSettings] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [loadingChars, setLoadingChars] = useState(true);
  const [inputValue, setInputValue] = useState('');
  
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
          {filteredCharacters
            .filter(c => c.id !== featuredCharacter?.id)
            .map((char) => (
              <CharacterCard
                key={char.id}
                character={char}
                onSelect={handleSelectCharacter}
                isPremiumLocked={!isPremium && !isCharacterFree(char, tierSettings)}
              />
            ))}
        </div>
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
