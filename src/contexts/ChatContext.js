import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { streamCharacterResponse, formatMessagesForOpenAI } from '../services/openai';
import { characterRepository } from '../repositories/characterRepository';
import { chatRepository } from '../repositories/chatRepository';
import { useAuth } from './AuthContext';
const ChatContext = createContext(undefined);
export function ChatProvider({ children }) {
    const [character, setCharacter] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [chatId, setChatId] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [, setCurrentResponse] = useState('');
    const [isFavorite, setIsFavorite] = useState(false);
    const { user } = useAuth();
    const selectCharacter = useCallback(async (characterId) => {
        try {
            setIsLoading(true);
            setError(null);
            const characterData = await characterRepository.getById(characterId);
            if (!characterData) {
                throw new Error('Character not found');
            }
            setCharacter(characterData);
            setMessages([]);
            if (user) {
                const newChat = await chatRepository.createChat(user.id, characterId, `Chat with ${characterData.name}`);
                setChatId(newChat.id);
                setIsFavorite(newChat.is_favorite ?? false);
                if (characterData.opening_line) {
                    const openingMessage = await chatRepository.addMessage(newChat.id, characterData.opening_line, 'assistant');
                    setMessages([openingMessage]);
                }
            }
            else {
                if (characterData.opening_line) {
                    const localOpeningMessage = {
                        id: 'local-opening',
                        chat_id: 'local-chat',
                        content: characterData.opening_line,
                        role: 'assistant',
                        created_at: new Date().toISOString()
                    };
                    setMessages([localOpeningMessage]);
                }
            }
        }
        catch (error) {
            console.error('Error selecting character:', error);
            setError(error instanceof Error ? error.message : 'Failed to select character');
        }
        finally {
            setIsLoading(false);
        }
    }, [user]);
    const loadChat = useCallback(async (existingChatId) => {
        try {
            setIsLoading(true);
            setError(null);
            const chat = await chatRepository.getChatById(existingChatId);
            if (!chat)
                throw new Error('Chat not found');
            const chatCharacter = await characterRepository.getById(chat.character_id);
            if (!chatCharacter)
                throw new Error('Character not found');
            const chatMsgs = await chatRepository.getChatMessages(existingChatId);
            setCharacter(chatCharacter);
            setMessages(chatMsgs);
            setChatId(chat.id);
            setIsFavorite(chat.is_favorite ?? false);
        }
        catch (e) {
            console.error('Error loading chat:', e);
            setError(e instanceof Error ? e.message : 'Failed to load chat');
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    const sendMessage = useCallback(async (content) => {
        if (!character) {
            setError('Please select a character first');
            return;
        }
        try {
            setIsTyping(true);
            setError(null);
            const userMessage = {
                id: `local-${Date.now()}`,
                chat_id: chatId || 'local-chat',
                content,
                role: 'user',
                created_at: new Date().toISOString()
            };
            setMessages(prev => [...prev, userMessage]);
            let savedUserMessage = userMessage;
            if (user && chatId) {
                savedUserMessage = await chatRepository.addMessage(chatId, content, 'user');
            }
            const assistantMessagePlaceholder = {
                id: `local-response-${Date.now()}`,
                chat_id: chatId || 'local-chat',
                content: '',
                role: 'assistant',
                created_at: new Date().toISOString()
            };
            setMessages(prev => [...prev, assistantMessagePlaceholder]);
            setCurrentResponse('');
            const messageHistory = formatMessagesForOpenAI(messages.concat(savedUserMessage));
            // We accumulate the assistant's response so we can persist it later
            let assistantContent = '';

            await streamCharacterResponse(character.name, character.persona_prompt, messageHistory, (chunk) => {
                setCurrentResponse(prev => prev + chunk);
                setMessages(prev => {
                    const updated = [...prev];
                    const lastIndex = updated.length - 1;
                    updated[lastIndex] = {
                        ...updated[lastIndex],
                        content: updated[lastIndex].content + chunk
                    };
                    return updated;
                });
                assistantContent += chunk;
            });
            const finalResponse = assistantContent.trim();
            if (finalResponse && user && chatId) {
                await chatRepository.addMessage(chatId, finalResponse, 'assistant');
            }
        }
        catch (error) {
            console.error('Error sending message:', error);
            setError(error instanceof Error ? error.message : 'Failed to send message');
            // Remove the assistant placeholder if it exists
            setMessages(prev => (prev.length ? prev.slice(0, -1) : prev));
        }
        finally {
            setIsTyping(false);
            setCurrentResponse('');
        }
    }, [character, messages, chatId, user]);
    const resetChat = useCallback(() => {
        setCharacter(null);
        setMessages([]);
        setChatId(null);
        setError(null);
        setIsLoading(false);
        setIsTyping(false);
        setCurrentResponse('');
        setIsFavorite(false);
    }, []);
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            window.resetChat = resetChat;
        }
    }, [resetChat]);
    const retryLastMessage = useCallback(async () => {
        if (messages.length < 2) {
            return;
        }
        const lastUserMessageIndex = [...messages].reverse().findIndex(m => m.role === 'user');
        if (lastUserMessageIndex === -1) {
            return;
        }
        const lastUserMessage = messages[messages.length - 1 - lastUserMessageIndex];
        if (messages[messages.length - 1].role === 'assistant') {
            setMessages(prev => prev.slice(0, -1));
        }
        await sendMessage(lastUserMessage.content);
    }, [messages, sendMessage]);
    const saveChatTitle = useCallback(async (title) => {
        if (!chatId || !user) {
            return;
        }
        try {
            await chatRepository.updateChat(chatId, { title });
        }
        catch (error) {
            console.error('Error saving chat title:', error);
            setError(error instanceof Error ? error.message : 'Failed to save chat title');
        }
    }, [chatId, user]);
    const toggleFavorite = useCallback(async (isFavorite) => {
        if (!chatId || !user) {
            return;
        }
        try {
            await chatRepository.toggleFavorite(chatId, isFavorite);
            setIsFavorite(isFavorite);
        }
        catch (error) {
            console.error('Error toggling favorite status:', error);
            setError(error instanceof Error ? error.message : 'Failed to update favorite status');
        }
    }, [chatId, user]);
    const saveChat = useCallback(async (title = 'Untitled Chat') => {
        if (chatId)
            return;
        try {
            if (user) {
                const newChat = await chatRepository.createChat(user.id, character.id, title);
                setChatId(newChat.id);
                setIsFavorite(newChat.is_favorite ?? false);
                for (const m of messages) {
                    await chatRepository.addMessage(newChat.id, m.content, m.role);
                }
            }
            else {
                const stored = JSON.parse(localStorage.getItem('savedChats') || '[]');
                stored.push({
                    id: `local-${Date.now()}`,
                    character_name: character?.name,
                    conversation_title: title,
                    messages: messages.map(({ id, role, content, created_at }) => ({
                        id,
                        role,
                        content,
                        created_at,
                    })),
                    timestamp: new Date().toISOString(),
                    is_favorite: false,
                });
                localStorage.setItem('savedChats', JSON.stringify(stored));
            }
        }
        catch (e) {
            console.error('Error saving chat:', e);
            setError(e instanceof Error ? e.message : 'Failed to save chat');
        }
    }, [chatId, user, character, messages]);
    const deleteCurrentChat = useCallback(async () => {
        if (!chatId)
            return resetChat();
        try {
            if (user) {
                await chatRepository.deleteChat(chatId);
            }
            resetChat();
        }
        catch (e) {
            console.error('Error deleting chat:', e);
            setError(e instanceof Error ? e.message : 'Failed to delete chat');
        }
    }, [chatId, user, resetChat]);
    const resumeLocalChat = useCallback(async (localChatId) => {
        try {
            setIsLoading(true);
            setError(null);
            const savedChatsJson = localStorage.getItem('savedChats');
            if (!savedChatsJson) {
                setError('No saved conversations found in local storage.');
                return false;
            }
            const savedChats = JSON.parse(savedChatsJson);
            const localChat = savedChats.find(chat => chat.id === localChatId);
            if (!localChat) {
                setError(`Conversation with ID ${localChatId} not found.`);
                return false;
            }
            const characters = await characterRepository.getAll();
            const matchingCharacter = characters.find(c => c.name === localChat.character_name);
            if (!matchingCharacter) {
                setError(`Character "${localChat.character_name}" not found.`);
                return false;
            }
            setCharacter(matchingCharacter);
            const formattedMessages = localChat.messages.map((msg, index) => {
                if ('id' in msg && 'created_at' in msg) {
                    return {
                        ...msg,
                        chat_id: localChatId,
                    };
                }
                return {
                    id: `local-${localChatId}-${index}`,
                    chat_id: localChatId,
                    content: msg.content,
                    role: msg.role,
                    created_at: new Date(localChat.timestamp).toISOString(),
                };
            });
            setMessages(formattedMessages);
            setChatId(localChatId);
            setIsFavorite(localChat.is_favorite || false);
            console.info(`[ChatContext] Successfully resumed local chat: ${localChat.conversation_title}`);
            return true;
        }
        catch (error) {
            console.error('Error resuming local chat:', error);
            setError(error instanceof Error ? error.message : 'Failed to resume conversation');
            return false;
        }
        finally {
            setIsLoading(false);
        }
    }, []);
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
        resumeLocalChat,
    };
    return _jsx(ChatContext.Provider, { value: value, children: children });
}
export function useChat() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
}
