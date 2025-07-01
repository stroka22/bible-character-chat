import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { 
  generateCharacterResponse, 
  streamCharacterResponse, 
  formatMessagesForOpenAI, 
  type Message 
} from '../services/openai';
import { characterRepository } from '../repositories/characterRepository';
import { chatRepository } from '../repositories/chatRepository';
import { type Character, type ChatMessage } from '../services/supabase';
import { useAuth } from './AuthContext';

// Interface for locally stored conversations in bypass mode
interface LocalChat {
  id: string;
  character_name: string;
  conversation_title: string;
  messages: { role: string; content: string }[];
  timestamp: string;
  is_favorite?: boolean;
}

// Define types for our chat context
interface ChatContextType {
  // Current state
  character: Character | null;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  chatId: string | null;
  isTyping: boolean;
  
  // Actions
  selectCharacter: (characterId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  resetChat: () => void;
  retryLastMessage: () => Promise<void>;
  saveChatTitle: (title: string) => Promise<void>;
  toggleFavorite: (isFavorite: boolean) => Promise<void>;
  /* --- added ----- */
  saveChat: (title?: string) => Promise<void>;
  deleteCurrentChat: () => Promise<void>;
  loadChat: (chatId: string) => Promise<void>;
  resumeLocalChat: (localChatId: string) => Promise<boolean>; // New method
  isChatSaved: boolean;
  isFavorite: boolean;
}

// Create the context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Props for the ChatProvider component
interface ChatProviderProps {
  children: ReactNode;
}

// Provider component
export function ChatProvider({ children }: ChatProviderProps) {
  // State
  const [character, setCharacter] = useState<Character | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [currentResponse, setCurrentResponse] = useState<string>('');
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  
  // Get the current user from auth context
  const { user } = useAuth();
  
  // Select a Bible character to chat with
  const selectCharacter = useCallback(async (characterId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch character data
      const characterData = await characterRepository.getById(characterId);
      
      if (!characterData) {
        throw new Error('Character not found');
      }
      
      setCharacter(characterData);
      
      // Reset messages
      setMessages([]);
      
      // Create a new chat in the database if user is authenticated
      if (user) {
        const newChat = await chatRepository.createChat(
          user.id,
          characterId,
          `Chat with ${characterData.name}`
        );
        
        setChatId(newChat.id);
        setIsFavorite(newChat.is_favorite ?? false);
        
        // If character has an opening line, add it as the first message
        if (characterData.opening_line) {
          const openingMessage = await chatRepository.addMessage(
            newChat.id,
            characterData.opening_line,
            'assistant'
          );
          
          setMessages([openingMessage]);
        }
      } else {
        // For non-authenticated users, just show the opening line locally
        if (characterData.opening_line) {
          const localOpeningMessage: ChatMessage = {
            id: 'local-opening',
            chat_id: 'local-chat',
            content: characterData.opening_line,
            role: 'assistant',
            created_at: new Date().toISOString()
          };
          
          setMessages([localOpeningMessage]);
        }
      }
    } catch (error) {
      console.error('Error selecting character:', error);
      setError(error instanceof Error ? error.message : 'Failed to select character');
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  /* -------------------------------------------------- */
  /* Load an existing chat by id                         */
  /* -------------------------------------------------- */
  const loadChat = useCallback(
    async (existingChatId: string) => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch chat meta
        const chat = await chatRepository.getChatById(existingChatId);
        if (!chat) throw new Error('Chat not found');

        // Fetch character
        const chatCharacter = await characterRepository.getById(chat.character_id);
        if (!chatCharacter) throw new Error('Character not found');

        // Fetch messages
        const chatMsgs = await chatRepository.getChatMessages(existingChatId);

        // Apply to state
        setCharacter(chatCharacter);
        setMessages(chatMsgs);
        setChatId(chat.id);
        setIsFavorite(chat.is_favorite ?? false);
      } catch (e) {
        console.error('Error loading chat:', e);
        setError(e instanceof Error ? e.message : 'Failed to load chat');
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Send a message and get a response from the character
  const sendMessage = useCallback(async (content: string) => {
    if (!character) {
      setError('Please select a character first');
      return;
    }
    
    try {
      setIsTyping(true);
      setError(null);
      
      // Create user message
      const userMessage: ChatMessage = {
        id: `local-${Date.now()}`,
        chat_id: chatId || 'local-chat',
        content,
        role: 'user',
        created_at: new Date().toISOString()
      };
      
      // Add user message to UI immediately
      setMessages(prev => [...prev, userMessage]);
      
      // Save message to database if authenticated
      let savedUserMessage = userMessage;
      if (user && chatId) {
        savedUserMessage = await chatRepository.addMessage(
          chatId,
          content,
          'user'
        );
      }
      
      // Create placeholder for assistant response
      const assistantMessagePlaceholder: ChatMessage = {
        id: `local-response-${Date.now()}`,
        chat_id: chatId || 'local-chat',
        content: '',
        role: 'assistant',
        created_at: new Date().toISOString()
      };
      
      // Add placeholder to messages
      setMessages(prev => [...prev, assistantMessagePlaceholder]);
      
      // Reset current response
      setCurrentResponse('');
      
      // Format messages for OpenAI
      const messageHistory = formatMessagesForOpenAI(messages.concat(savedUserMessage));
      
      // Stream the response
      await streamCharacterResponse(
        character.name,
        character.persona_prompt,
        messageHistory,
        (chunk) => {
          setCurrentResponse(prev => prev + chunk);
          
          // Update the placeholder message with the current response
          setMessages(prev => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            updated[lastIndex] = {
              ...updated[lastIndex],
              content: updated[lastIndex].content + chunk
            };
            return updated;
          });
        }
      );
      
      // Get the final response
      const finalResponse = messages[messages.length - 1].content;
      
      // Save the assistant's response to the database if authenticated
      if (user && chatId) {
        await chatRepository.addMessage(
          chatId,
          finalResponse,
          'assistant'
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error instanceof Error ? error.message : 'Failed to send message');
      
      // Remove the placeholder message if there was an error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsTyping(false);
      setCurrentResponse('');
    }
  }, [character, messages, chatId, user]);
  
  // Reset the current chat
  const resetChat = useCallback(() => {
    setCharacter(null);
    setMessages([]);
    setChatId(null);
    setError(null);
    setIsLoading(false);
    setIsTyping(false);
    setCurrentResponse('');
    setIsFavorite(false); // Reset favorite status
  }, []);

  // Expose resetChat to the window object for debug purposes
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      (window as any).resetChat = resetChat;
    }
  }, [resetChat]);
  
  // Retry the last message if there was an error
  const retryLastMessage = useCallback(async () => {
    if (messages.length < 2) {
      return; // Nothing to retry
    }
    
    // Get the last user message
    const lastUserMessageIndex = [...messages].reverse().findIndex(m => m.role === 'user');
    if (lastUserMessageIndex === -1) {
      return; // No user messages to retry
    }
    
    const lastUserMessage = messages[messages.length - 1 - lastUserMessageIndex];
    
    // Remove any failed assistant response
    if (messages[messages.length - 1].role === 'assistant') {
      setMessages(prev => prev.slice(0, -1));
    }
    
    // Retry sending the message
    await sendMessage(lastUserMessage.content);
  }, [messages, sendMessage]);
  
  // Save a title for the current chat
  const saveChatTitle = useCallback(async (title: string) => {
    if (!chatId || !user) {
      return;
    }
    
    try {
      await chatRepository.updateChat(chatId, { title });
    } catch (error) {
      console.error('Error saving chat title:', error);
      setError(error instanceof Error ? error.message : 'Failed to save chat title');
    }
  }, [chatId, user]);
  
  // Toggle favorite status for the current chat
  const toggleFavorite = useCallback(async (isFavorite: boolean) => {
    if (!chatId || !user) {
      return;
    }
    
    try {
      await chatRepository.toggleFavorite(chatId, isFavorite);
      setIsFavorite(isFavorite); // Update local state
    } catch (error) {
      console.error('Error toggling favorite status:', error);
      setError(error instanceof Error ? error.message : 'Failed to update favorite status');
    }
  }, [chatId, user]);
  
  /* -------------------------------------------------- */
  /* Save current chat (for anonymous or if not yet in DB) */
  /* -------------------------------------------------- */
  const saveChat = useCallback(
    async (title = 'Untitled Chat') => {
      if (chatId) return; // already saved

      try {
        if (user) {
          // create chat
          const newChat = await chatRepository.createChat(
            user.id,
            character!.id,
            title,
          );
          setChatId(newChat.id);
          setIsFavorite(newChat.is_favorite ?? false);

          // persist existing messages
          for (const m of messages) {
            await chatRepository.addMessage(newChat.id, m.content, m.role as any);
          }
        } else {
          // anonymous – simple localStorage save
          const stored = JSON.parse(localStorage.getItem('savedChats') || '[]');
          stored.push({
            id: `local-${Date.now()}`,
            character_name: character?.name,
            conversation_title: title,
            // Persist full message data so we can perfectly restore later
            messages: messages.map(({ id, role, content, created_at }) => ({
              id,
              role,
              content,
              created_at,
            })),
            timestamp: new Date().toISOString(),
            is_favorite: false, // Default to not favorite when saving
          });
          localStorage.setItem('savedChats', JSON.stringify(stored));
        }
      } catch (e) {
        console.error('Error saving chat:', e);
        setError(e instanceof Error ? e.message : 'Failed to save chat');
      }
    },
    [chatId, user, character, messages],
  );

  /* -------------------------------------------------- */
  /* Delete current chat                                */
  /* -------------------------------------------------- */
  const deleteCurrentChat = useCallback(async () => {
    if (!chatId) return resetChat();
    try {
      if (user) {
        await chatRepository.deleteChat(chatId);
      }
      resetChat();
    } catch (e) {
      console.error('Error deleting chat:', e);
      setError(e instanceof Error ? e.message : 'Failed to delete chat');
    }
  }, [chatId, user, resetChat]);

  /* -------------------------------------------------- */
  /* Resume a local chat directly from localStorage     */
  /* -------------------------------------------------- */
  const resumeLocalChat = useCallback(async (localChatId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const savedChatsJson = localStorage.getItem('savedChats');
      if (!savedChatsJson) {
        setError('No saved conversations found in local storage.');
        return false;
      }

      // Parse saved chats from localStorage
      const savedChats: LocalChat[] = JSON.parse(savedChatsJson);
      
      // Find the specific chat by ID
      const localChat = savedChats.find(chat => chat.id === localChatId);
      if (!localChat) {
        setError(`Conversation with ID ${localChatId} not found.`);
        return false;
      }

      // Find the character by name
      const characters = await characterRepository.getAll();
      const matchingCharacter = characters.find(c => c.name === localChat.character_name);
      
      if (!matchingCharacter) {
        setError(`Character "${localChat.character_name}" not found.`);
        return false;
      }

      // Set character first
      setCharacter(matchingCharacter);
      
      // Convert the messages to the right format
      const formattedMessages: ChatMessage[] = localChat.messages.map((msg, index) => {
        // If the stored message already has an id & created_at we use them,
        // otherwise we create synthetic ones for backward-compatibility.
        if ('id' in msg && 'created_at' in msg) {
          return {
            ...(msg as any),
            chat_id: localChatId, // ensure chat_id is consistent
          };
        }
        // Legacy (role/content only) format fallback
        return {
          id: `local-${localChatId}-${index}`,
          chat_id: localChatId,
          content: (msg as any).content,
          role: (msg as any).role as 'user' | 'assistant' | 'system',
          created_at: new Date(localChat.timestamp).toISOString(),
        };
      });
      
      // Set all state variables directly
      setMessages(formattedMessages);
      setChatId(localChatId);
      setIsFavorite(localChat.is_favorite || false);
      
      console.info(`[ChatContext] Successfully resumed local chat: ${localChat.conversation_title}`);
      return true;
    } catch (error) {
      console.error('Error resuming local chat:', error);
      setError(error instanceof Error ? error.message : 'Failed to resume conversation');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create the value object that will be provided to consumers
  const value = {
    character,
    messages,
    isLoading,
    error,
    chatId,
    isTyping,
    isChatSaved: chatId !== null,
    isFavorite,
    selectCharacter,
    sendMessage,
    resetChat,
    retryLastMessage,
    saveChatTitle,
    toggleFavorite,
    saveChat,
    deleteCurrentChat,
    loadChat,
    resumeLocalChat, // New method exposed
  };
  
  // Provide the chat context to children components
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

// Custom hook to use the chat context
export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
