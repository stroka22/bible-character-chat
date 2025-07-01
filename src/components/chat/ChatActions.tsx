import React, { useState, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';

interface ChatActionsProps {
  className?: string;
  compact?: boolean; // For smaller version of the actions
}

/**
 * Component that provides actions for the current chat:
 * - Save chat
 * - Rename chat
 * - Favorite chat
 * - Delete chat
 * - Export chat (copy to clipboard)
 */
const ChatActions: React.FC<ChatActionsProps> = ({ className = '', compact = false }) => {
  // Get chat context and auth state
  const { 
    character, 
    chatId, 
    messages, 
    saveChatTitle, 
    toggleFavorite,
    saveChat,
    deleteCurrentChat,
    isChatSaved,
    isFavorite
  } = useChat();
  const { user } = useAuth();
  
  // Check for bypass mode
  const [bypassMode, setBypassMode] = useState<boolean>(false);
  
  useEffect(() => {
    const bypass = localStorage.getItem('bypass_auth') === 'true';
    setBypassMode(bypass);
  }, []);

  // Local state
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showSaveSuccess, setShowSaveSuccess] = useState<boolean>(false);
  const [showCopySuccess, setShowCopySuccess] = useState<boolean>(false);
  const [localFavorite, setLocalFavorite] = useState<boolean>(isFavorite);

  // Update local favorite state when isFavorite changes
  useEffect(() => {
    setLocalFavorite(isFavorite);
  }, [isFavorite]);

  // Don't render anything if there's no character or no messages
  if (!character || messages.length === 0) {
    return null;
  }

  // Format conversation as text for export
  const formatConversationAsText = () => {
    if (!character || messages.length === 0) return '';
    
    const title = `Conversation with ${character.name}\n`;
    const date = `Date: ${new Date().toLocaleDateString()}\n\n`;
    
    const formattedMessages = messages.map(message => {
      const timestamp = new Date(message.created_at).toLocaleTimeString();
      const speaker = message.role === 'user' ? 'You' : character.name;
      return `[${timestamp}] ${speaker}:\n${message.content}\n`;
    }).join('\n');
    
    return `${title}${date}${formattedMessages}`;
  };

  // Handle copying conversation to clipboard
  const handleExportConversation = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const text = formatConversationAsText();
      await navigator.clipboard.writeText(text);
      
      // Show success message
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 3000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      setError('Failed to copy conversation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle saving a chat
  const handleSaveChat = async () => {
    if (!character) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Generate a default title if none provided
      const defaultTitle = `Chat with ${character.name} - ${new Date().toLocaleDateString()}`;
      
      // Save the chat
      await saveChat(defaultTitle);
      
      // Show success message
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving chat:', error);
      setError('Failed to save chat. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle renaming a chat
  const handleRenameChat = async () => {
    if (!chatId || !newTitle.trim()) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      await saveChatTitle(newTitle.trim());
      setIsRenaming(false);
      setNewTitle('');
    } catch (error) {
      console.error('Error renaming chat:', error);
      setError('Failed to rename chat. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle toggling favorite status with local state update
  const handleToggleFavorite = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Update local state immediately for better UI feedback
      const newFavoriteState = !localFavorite;
      setLocalFavorite(newFavoriteState);
      
      // If in bypass mode and chat isn't saved yet, store favorite in localStorage
      if (bypassMode && !chatId) {
        const chatKey = `temp_favorite_${character.id}`;
        localStorage.setItem(chatKey, newFavoriteState ? 'true' : 'false');
      } else if (chatId) {
        // Otherwise update via context (which will handle DB or localStorage)
        await toggleFavorite(newFavoriteState);
      }
    } catch (error) {
      console.error('Error toggling favorite status:', error);
      setError('Failed to update favorite status. Please try again.');
      // Revert local state on error
      setLocalFavorite(!localFavorite);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle deleting the current chat
  const handleDeleteChat = async () => {
    if (!chatId) return;
    
    // Ask for confirmation
    const confirmed = window.confirm(
      'Are you sure you want to delete this conversation? This action cannot be undone.'
    );
    
    if (!confirmed) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      await deleteCurrentChat();
    } catch (error) {
      console.error('Error deleting chat:', error);
      setError('Failed to delete chat. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render a compact version of the actions (for mobile or inline use)
  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {/* Export button */}
        <button
          onClick={handleExportConversation}
          disabled={isLoading}
          className="rounded-full p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          aria-label="Copy conversation to clipboard"
          title="Copy conversation to clipboard"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
          </svg>
        </button>
        
        {/* Favorite button */}
        <button
          onClick={handleToggleFavorite}
          disabled={isLoading}
          className={`rounded-full p-2 ${
            localFavorite ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'
          } hover:bg-gray-200 transition-colors`}
          aria-label={localFavorite ? 'Remove from favorites' : 'Add to favorites'}
          title={localFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        
        {!isChatSaved && (
          <button
            onClick={handleSaveChat}
            disabled={isLoading}
            className="rounded-full p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            aria-label="Save conversation"
            title="Save conversation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
            </svg>
          </button>
        )}
        
        {isChatSaved && (
          <>
            <button
              onClick={() => setIsRenaming(true)}
              disabled={isLoading}
              className="rounded-full p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              aria-label="Rename conversation"
              title="Rename conversation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            
            <button
              onClick={handleDeleteChat}
              disabled={isLoading}
              className="rounded-full p-2 bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
              aria-label="Delete conversation"
              title="Delete conversation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </>
        )}
      </div>
    );
  }

  // Render the full version of the actions
  return (
    <div className={`border-t border-gray-200 bg-white p-4 ${className}`}>
      {/* Error message */}
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
          <div className="flex">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-red-500 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Success messages */}
      {showSaveSuccess && (
        <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-800">
          <div className="flex">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-green-500 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Conversation saved successfully!</span>
          </div>
        </div>
      )}

      {showCopySuccess && (
        <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-800">
          <div className="flex">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-green-500 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Conversation copied to clipboard!</span>
          </div>
        </div>
      )}

      {/* Rename form */}
      {isRenaming && (
        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter conversation title"
              className="flex-grow rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              autoFocus
            />
            <button
              onClick={handleRenameChat}
              disabled={isLoading || !newTitle.trim()}
              className="rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 transition-colors disabled:bg-gray-300"
            >
              Save
            </button>
            <button
              onClick={() => setIsRenaming(false)}
              className="rounded-md bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {!user && !bypassMode && !isChatSaved && (
          <div className="w-full mb-2 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
            <div className="flex">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-yellow-500 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Sign in to save your conversations and access them later.</span>
            </div>
          </div>
        )}

        {/* Export button - always visible */}
        <button
          onClick={handleExportConversation}
          disabled={isLoading}
          className="flex items-center rounded-md bg-blue-100 px-4 py-2 text-blue-800 hover:bg-blue-200 transition-colors disabled:bg-gray-100"
          aria-label="Copy conversation to clipboard"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-blue-600"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
          </svg>
          Copy to Clipboard
        </button>

        {/* Favorite button - always visible */}
        <button
          onClick={handleToggleFavorite}
          disabled={isLoading}
          className={`flex items-center rounded-md px-4 py-2 transition-colors disabled:bg-gray-100 ${
            localFavorite
              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
          aria-label={localFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 mr-2 ${localFavorite ? 'text-yellow-600' : 'text-gray-600'}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
              clipRule="evenodd"
            />
          </svg>
          {localFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        </button>

        {!isChatSaved ? (
          <button
            onClick={handleSaveChat}
            disabled={isLoading}
            className="flex items-center rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 transition-colors disabled:bg-gray-300"
            aria-label="Save conversation"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
            </svg>
            Save Conversation
          </button>
        ) : (
          <>
            {!isRenaming && (
              <button
                onClick={() => setIsRenaming(true)}
                disabled={isLoading}
                className="flex items-center rounded-md bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300 transition-colors disabled:bg-gray-100"
                aria-label="Rename conversation"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Rename
              </button>
            )}

            <button
              onClick={handleDeleteChat}
              disabled={isLoading}
              className="flex items-center rounded-md bg-red-100 px-4 py-2 text-red-800 hover:bg-red-200 transition-colors disabled:bg-gray-100"
              aria-label="Delete conversation"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-red-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Delete Conversation
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatActions;
