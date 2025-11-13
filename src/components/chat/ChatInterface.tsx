import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '../../contexts/ChatContext';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import ChatActions from './ChatActions';
import CharacterInsightsPanel from './CharacterInsightsPanel'; // Import the CharacterInsightsPanel component
import UpgradeModal from '../modals/UpgradeModal';
import { usePremium } from '../../hooks/usePremium';
import { loadAccountTierSettings } from '../../utils/accountTier';
import { getSettings as getTierSettings } from '../../services/tierSettingsService';

/**
 * --------------------------------------------------------------------------
 * Utilities
 * --------------------------------------------------------------------------
 */

// Fallback avatar generator (ui-avatars with random background)
const generateFallbackAvatar = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name,
  )}&background=random`;

/**
 * Returns a “safe” avatar URL.
 * – Rejects obvious placeholders like `example.com/*`
 * – Falls back to the ui-avatar generator when URL is missing/invalid
 */
const getSafeAvatarUrl = (name: string, url?: string | null) => {
  if (!url) return generateFallbackAvatar(name);

  try {
    const { hostname } = new URL(url);
    // Treat `example.com` (and localhost placeholders) as invalid
    if (
      hostname === 'example.com' ||
      hostname.endsWith('.example.com') ||
      hostname === 'localhost'
    ) {
      return generateFallbackAvatar(name);
    }
    return url;
  } catch {
    // Malformed URL → fallback
    return generateFallbackAvatar(name);
  }
};

const ChatInterface: React.FC = () => {
  const { 
    character, 
    messages, 
    isLoading, 
    error, 
    isTyping, 
    retryLastMessage,
    resetChat
  } = useChat();
  const { isPremium } = usePremium();

  // State to track whether the insights panel is open
  const [showInsightsPanel, setShowInsightsPanel] = useState(false);
  // Upgrade modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeLimitType, setUpgradeLimitType] = useState<'message' | 'character' | 'study' | 'roundtable'>('character');
  const [messageLimit, setMessageLimit] = useState<number>(5);

  // Reference for auto-scrolling to the bottom of the chat
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Detect if this is a resumed chat (there are already messages present)
  const isResumed = messages.length > 0;

  // Keep messageLimit in sync with per‑org tier settings (local + remote)
  useEffect(() => {
    const updateFromLocal = () => {
      try {
        const s: any = loadAccountTierSettings();
        if (s && s.freeMessageLimit) setMessageLimit(s.freeMessageLimit);
      } catch {}
    };
    updateFromLocal();
    (async () => {
      try {
        const remote: any = await getTierSettings();
        if (remote && remote.freeMessageLimit) setMessageLimit(remote.freeMessageLimit);
      } catch {}
    })();
    const onStorage = (e: StorageEvent) => {
      if (e && e.key && String(e.key).startsWith('accountTierSettings')) {
        updateFromLocal();
      }
    };
    const onCustom = () => updateFromLocal();
    window.addEventListener('storage', onStorage);
    window.addEventListener('accountTierSettingsChanged', onCustom as any);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('accountTierSettingsChanged', onCustom as any);
    };
  }, []);

  // Derive user message count
  const userMessageCount = messages.filter((m) => m.role === 'user').length;

  // Defensive: open modal when limit reached
  useEffect(() => {
    if (!isPremium && userMessageCount >= messageLimit) {
      setUpgradeLimitType('message');
      setShowUpgradeModal(true);
    }
  }, [isPremium, userMessageCount, messageLimit]);

  // Listen for global upgrade events (emitted by ChatContext)
  useEffect(() => {
    const onUpgrade = (e: Event) => {
      try {
        const anyEvt = e as CustomEvent<any>;
        const detail = anyEvt?.detail || {};
        if (detail.limitType) setUpgradeLimitType(detail.limitType);
        if (typeof detail.messageLimit === 'number') setMessageLimit(detail.messageLimit);
        setShowUpgradeModal(true);
      } catch {}
    };
    window.addEventListener('upgrade:show', onUpgrade as any);
    return () => window.removeEventListener('upgrade:show', onUpgrade as any);
  }, []);

  // Auto-scroll to bottom when messages change or when typing
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, isTyping]); // key on length so first load scrolls too

  // Log resume information for debugging
  useEffect(() => {
    if (isResumed) {
      // eslint-disable-next-line no-console
      console.info('[ChatInterface] Rendering a resumed conversation');
    }
  }, [isResumed]);

  // If no character is selected, show a placeholder
  if (!character) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-16 w-16 mx-auto text-gray-400 mb-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Start a Conversation
          </h3>
          <p className="text-gray-500 max-w-sm">
            Select a Bible character from the list to begin your conversation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex h-full w-full flex-col ${
        isResumed ? 'bg-blue-50/20' : 'bg-white'
      }`}
    >
      {/* Chat Header */}
      <header className="flex items-center border-b border-gray-200 bg-white p-4 shadow-sm">
        {/* Back to Characters button */}
        <button
          onClick={resetChat}
          className="mr-3 flex items-center rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 transition-colors"
          aria-label="Back to characters"
          title="Back to characters"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
        
        <div className="flex items-center">
          {/*
            ----------------------------------------------------------------
            Unified avatar handling with robust fallback
            ----------------------------------------------------------------
          */}
          <img
            src={getSafeAvatarUrl(character.name, character.avatar_url)}
            alt={character.name}
            className="h-10 w-10 rounded-full object-cover border border-gray-200 mr-3"
            onError={(e) => {
              (e.target as HTMLImageElement).src = generateFallbackAvatar(
                character.name,
              );
            }}
          />
          <div>
            <div className="flex items-center">
              <h2 className="text-lg font-semibold text-gray-900">{character.name}</h2>
              {isResumed && (
                <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600">
                  Resumed
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 line-clamp-1">{character.description}</p>
          </div>
        </div>
        
        {/* Insights Panel Toggle Button */}
        <button
          onClick={() => setShowInsightsPanel(!showInsightsPanel)}
          className="ml-auto mr-3 flex items-center rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 transition-colors"
          aria-label="Toggle character insights"
          title="Toggle character insights"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Insights
        </button>

        <button 
          onClick={resetChat}
          className="flex items-center rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 transition-colors"
          aria-label="End conversation"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          End Chat
        </button>
      </header>

      {/* Chat Messages */}
      <div className="flex-grow overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full w-full items-center justify-center">
            <div className="text-center max-w-md">
              <p className="text-gray-500 mb-4">
                Start your conversation with {character.name}. Ask questions about their life, experiences, or seek their wisdom.
              </p>
              <div className="text-sm text-gray-400 italic">
                "Ask me anything..."
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Message bubbles */}
            {messages
              .filter((m) => m.content && m.content.trim() !== '')
              .map((message) => (
              <ChatBubble
                key={message.id}
                message={message}
                characterName={character.name}
                characterAvatar={character.avatar_url}
                isTyping={isTyping && message === messages[messages.length - 1] && message.role === 'assistant' && message.content === ''}
              />
            ))}
            
            {/* Typing indicator */}
            {isTyping && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 mr-2">
                  <img
                    src={getSafeAvatarUrl(character.name, character.avatar_url)}
                    alt={character.name}
                    className="h-10 w-10 rounded-full object-cover border border-gray-200"
                  />
                </div>
                <div className="text-sm text-gray-500">
                  {character.name} is responding...
                </div>
              </div>
            )}
            
            {/* Error message with retry button */}
            {error && !showUpgradeModal && (
              <div className="mx-auto my-4 max-w-md rounded-lg bg-red-50 p-4">
                <div className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm text-red-800">{typeof error === 'string' ? error : 'Sorry, something went wrong. Please try again.'}</p>
                    <button
                      onClick={retryLastMessage}
                      className="mt-2 rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      {/* Character Insights Panel */}
      <CharacterInsightsPanel
        character={character}
        isOpen={showInsightsPanel}
        onClose={() => setShowInsightsPanel(false)}
      />

      {/* Chat actions (save / favorite / delete etc.) */}
      {/* Rendered above the input so actions are always accessible */}
      {/* Compact mode is false here to show the full toolbar */}
      <ChatActions />

      {/* Chat Input */}
      <ChatInput 
        disabled={isLoading} 
        placeholder={`Ask ${character.name} anything...`}
      />

      {/* Upgrade Modal */}
      <UpgradeModal 
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        limitType={upgradeLimitType}
        characterName={character?.name}
        messageCount={userMessageCount}
        messageLimit={messageLimit}
      />
    </div>
  );
};

export default ChatInterface;
