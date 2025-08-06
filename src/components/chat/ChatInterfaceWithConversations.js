import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState, useCallback } from 'react';
import { useChat } from '../../contexts/ChatContext.jsx';
import { useConversation } from '../../contexts/ConversationContext';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import ChatActions from './ChatActions';
import CharacterInsightsPanel from './CharacterInsightsPanel';

const generateFallbackAvatar = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

const getSafeAvatarUrl = (name, url) => {
    if (!url)
        return generateFallbackAvatar(name);
    try {
        const { hostname } = new URL(url);
        if (hostname === 'example.com' ||
            hostname.endsWith('.example.com') ||
            hostname === 'localhost') {
            return generateFallbackAvatar(name);
        }
        return url;
    }
    catch {
        return generateFallbackAvatar(name);
    }
};

const ChatInterfaceWithConversations = () => {
    const navigate = useNavigate();
    const { conversationId } = useParams();
    const { user, isAuthenticated } = useAuth();
    
    // Chat context for message handling
    const { 
        character, 
        messages, 
        isLoading: chatLoading, 
        error: chatError, 
        isTyping, 
        retryLastMessage, 
        resetChat,
        sendMessage
    } = useChat();
    
    // Conversation context for persistence
    const {
        activeConversation,
        fetchConversationWithMessages,
        createConversation,
        updateConversation,
        addMessage,
        shareConversation,
        stopSharing,
        isLoading: convLoading,
        error: convError
    } = useConversation();

    // UI state
    const [showInsightsPanel, setShowInsightsPanel] = useState(false);
    const [showConversationHistory, setShowConversationHistory] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingTitle, setEditingTitle] = useState(false);
    const [conversationTitle, setConversationTitle] = useState('');
    const [shareUrl, setShareUrl] = useState('');
    const [showShareModal, setShowShareModal] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    
    const messagesEndRef = useRef(null);
    const titleInputRef = useRef(null);
    const isResumed = messages.length > 0;
    const isLoading = chatLoading || convLoading;
    const error = chatError || convError;
    // ------------------------------------------------------------------
    // Derived values (helps keep JSX clean & avoids optional-chaining
    // that some older build steps choke on).
    // ------------------------------------------------------------------
    const isFavorite = activeConversation && activeConversation.is_favorite;
    const isShared   = activeConversation && activeConversation.is_shared;

    // Load conversation if ID is provided
    useEffect(() => {
        if (conversationId && isAuthenticated) {
            fetchConversationWithMessages(conversationId);
        }
    }, [conversationId, isAuthenticated, fetchConversationWithMessages]);

    // Update title when active conversation changes
    useEffect(() => {
        if (activeConversation) {
            setConversationTitle(activeConversation.title);
        } else if (character) {
            setConversationTitle(`Conversation with ${character.name}`);
        }
    }, [activeConversation, character]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages.length, isTyping]);

    // Focus on title input when editing
    useEffect(() => {
        if (editingTitle && titleInputRef.current) {
            titleInputRef.current.focus();
        }
    }, [editingTitle]);

    // Log when conversation is resumed
    useEffect(() => {
        if (isResumed) {
            console.info('[ChatInterface] Rendering a resumed conversation');
        }
    }, [isResumed]);

    // Handle sending a message with persistence
    const handleSendMessage = useCallback(async (content) => {
        if (!character) return;

        try {
            // If no active conversation, create one
            if (!activeConversation && isAuthenticated) {
                setIsSaving(true);
                const newConversation = await createConversation(character.id);
                setIsSaving(false);
                
                // Add the message to the new conversation
                await addMessage(content, 'user');
                
                // Update URL to include conversation ID without reloading
                navigate(`/chat/${newConversation.id}`, { replace: true });
            } else if (activeConversation) {
                // Add message to existing conversation
                await addMessage(content, 'user');
            }
            
            // Process the message through the chat system
            await sendMessage(content);
            
            // If the message generated a response, save that too
            if (activeConversation && messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
                await addMessage(messages[messages.length - 1].content, 'assistant');
            }
        } catch (err) {
            console.error('Error sending/saving message:', err);
        }
    }, [character, activeConversation, isAuthenticated, createConversation, addMessage, sendMessage, messages, navigate]);

    // Save or update conversation title
    const handleSaveTitle = useCallback(async () => {
        if (!activeConversation || !conversationTitle.trim()) return;
        
        setIsSaving(true);
        try {
            await updateConversation(activeConversation.id, { title: conversationTitle });
            setEditingTitle(false);
        } catch (err) {
            console.error('Error saving title:', err);
        } finally {
            setIsSaving(false);
        }
    }, [activeConversation, conversationTitle, updateConversation]);

    // Toggle favorite status
    const handleToggleFavorite = useCallback(async () => {
        if (!activeConversation) {
            // If no active conversation, show save modal first
            setShowSaveModal(true);
            return;
        }
        
        setIsSaving(true);
        try {
            await updateConversation(activeConversation.id, { 
                is_favorite: !(activeConversation.is_favorite || false) 
            });
        } catch (err) {
            console.error('Error toggling favorite:', err);
        } finally {
            setIsSaving(false);
        }
    }, [activeConversation, updateConversation]);

    // Share conversation
    const handleShareConversation = useCallback(async () => {
        if (!activeConversation) {
            // If no active conversation, show save modal first
            setShowSaveModal(true);
            return;
        }
        
        // If already shared, just show the modal
        if (activeConversation.is_shared && activeConversation.share_code) {
            setShareUrl(`${window.location.origin}/shared/${activeConversation.share_code}`);
            setShowShareModal(true);
            return;
        }
        
        // Otherwise, generate a share code
        setIsSaving(true);
        try {
            const shareCode = await shareConversation(activeConversation.id);
            if (shareCode) {
                setShareUrl(`${window.location.origin}/shared/${shareCode}`);
                setShowShareModal(true);
            }
        } catch (err) {
            console.error('Error sharing conversation:', err);
        } finally {
            setIsSaving(false);
        }
    }, [activeConversation, shareConversation]);

    // Stop sharing conversation
    const handleStopSharing = useCallback(async () => {
        if (!activeConversation) return;
        
        setIsSaving(true);
        try {
            await stopSharing(activeConversation.id);
            setShowShareModal(false);
        } catch (err) {
            console.error('Error stopping sharing:', err);
        } finally {
            setIsSaving(false);
        }
    }, [activeConversation, stopSharing]);

    // Copy share URL to clipboard
    const copyShareUrl = useCallback(() => {
        if (!shareUrl) return;
        
        navigator.clipboard.writeText(shareUrl)
            .then(() => {
                // Show a temporary "Copied!" message
                const copyButton = document.getElementById('copy-share-button');
                if (copyButton) {
                    const originalText = copyButton.textContent;
                    copyButton.textContent = 'Copied!';
                    setTimeout(() => {
                        copyButton.textContent = originalText;
                    }, 2000);
                }
            })
            .catch(err => {
                console.error('Failed to copy:', err);
            });
    }, [shareUrl]);

    // Save conversation (for new conversations)
    const handleSaveConversation = useCallback(async (title) => {
        if (!character || !isAuthenticated) return;
        
        setIsSaving(true);
        try {
            const newConversation = await createConversation(character.id, title);
            
            // Add all existing messages to the conversation
            for (const msg of messages) {
                await addMessage(msg.content, msg.role);
            }
            
            // Update URL to include conversation ID without reloading
            navigate(`/chat/${newConversation.id}`, { replace: true });
            setShowSaveModal(false);
        } catch (err) {
            console.error('Error saving conversation:', err);
        } finally {
            setIsSaving(false);
        }
    }, [character, isAuthenticated, createConversation, messages, addMessage, navigate]);

    // Go to conversations page
    const goToConversations = useCallback(() => {
        navigate('/conversations');
    }, [navigate]);

    // Handle back button with confirmation if needed
    const handleBack = useCallback(() => {
        // If there are unsaved changes, confirm before leaving
        if (!activeConversation && messages.length > 0 && isAuthenticated) {
            if (window.confirm('Do you want to save this conversation before leaving?')) {
                setShowSaveModal(true);
                return;
            }
        }
        resetChat();
        navigate('/');
    }, [activeConversation, messages.length, isAuthenticated, resetChat, navigate]);

    if (!character) {
        return (
            _jsx("div", { 
                className: "flex h-full w-full flex-col items-center justify-center bg-blue-900 p-4 text-white", 
                children: _jsxs("div", { 
                    className: "text-center", 
                    children: [
                        _jsx("svg", { 
                            xmlns: "http://www.w3.org/2000/svg", 
                            className: "h-16 w-16 mx-auto text-yellow-400 mb-4", 
                            fill: "none", 
                            viewBox: "0 0 24 24", 
                            stroke: "currentColor", 
                            children: _jsx("path", { 
                                strokeLinecap: "round", 
                                strokeLinejoin: "round", 
                                strokeWidth: 1.5, 
                                d: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                            }) 
                        }),
                        _jsx("h3", { 
                            className: "text-xl font-semibold text-yellow-300 mb-2", 
                            children: "Start a Conversation" 
                        }),
                        _jsx("p", { 
                            className: "text-blue-100 max-w-sm", 
                            children: "Select a Bible character from the list to begin your conversation." 
                        })
                    ] 
                }) 
            })
        );
    }

    return (
        _jsxs("div", { 
            className: `flex h-full w-full flex-col ${showInsightsPanel ? 'panel-open' : ''}`, 
            children: [
                // Breadcrumb + Back button
                _jsxs("div", { 
                    className: "flex items-center justify-between px-4 py-2 text-sm bg-[rgba(255,255,255,.03)] border-b border-[rgba(255,255,255,.08)]",
                    children: [
                        _jsxs("div", { 
                            className: "breadcrumb space-x-1",
                            children: [
                                _jsx(Link, { 
                                    to: "/", 
                                    className: "text-gray-300 hover:text-yellow-400", 
                                    children: "Home" 
                                }),
                                _jsx("span", { children: ">" }),
                                _jsx(Link, { 
                                    to: "/", 
                                    className: "text-gray-300 hover:text-yellow-400", 
                                    children: "Characters" 
                                }),
                                _jsx("span", { children: ">" }),
                                _jsx("span", { 
                                    className: "text-yellow-400 font-semibold", 
                                    children: character.name 
                                })
                            ]
                        }),
                        _jsxs("div", {
                            className: "flex space-x-2",
                            children: [
                                isAuthenticated && (
                                    _jsx("button", {
                                        onClick: goToConversations,
                                        className: "text-sm px-3 py-1 rounded bg-[rgba(250,204,21,.15)] border border-yellow-400 hover:bg-yellow-400 hover:text-[#0a0a2a] transition",
                                        children: "My Conversations"
                                    })
                                ),
                                _jsx("button", { 
                                    onClick: handleBack, 
                                    id: "backBtn", 
                                    className: "text-sm px-3 py-1 rounded bg-[rgba(250,204,21,.15)] border border-yellow-400 hover:bg-yellow-400 hover:text-[#0a0a2a] transition",
                                    children: "Back to Characters" 
                                })
                            ]
                        })
                    ]
                }),
                
                // Chat header with character info, conversation title, and action buttons
                _jsxs("div", { 
                    className: "chat-header flex flex-col md:flex-row md:items-center justify-between p-4 border-b border-[rgba(255,255,255,.1)] bg-[rgba(255,255,255,.05)]",
                    children: [
                        _jsxs("div", { 
                            className: "flex items-center mb-2 md:mb-0",
                            children: [
                                _jsx("img", { 
                                    src: getSafeAvatarUrl(character.name, character.avatar_url), 
                                    alt: character.name, 
                                    className: "h-12 w-12 rounded-full object-cover border-2 border-yellow-400 mr-3",
                                    onError: (e) => {
                                        e.target.src = generateFallbackAvatar(character.name);
                                    }
                                }),
                                _jsxs("div", {
                                    children: [
                                        _jsx("h2", { 
                                            className: "text-xl font-bold text-yellow-400", 
                                            style: { fontFamily: 'Cinzel, serif' },
                                            children: character.name
                                        }),
                                        editingTitle ? (
                                            _jsxs("div", {
                                                className: "flex items-center mt-1",
                                                children: [
                                                    _jsx("input", {
                                                        ref: titleInputRef,
                                                        type: "text",
                                                        value: conversationTitle,
                                                        onChange: (e) => setConversationTitle(e.target.value),
                                                        onKeyDown: (e) => e.key === 'Enter' && handleSaveTitle(),
                                                        className: "bg-[rgba(255,255,255,.1)] border border-[rgba(255,255,255,.3)] rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-400 mr-2",
                                                        placeholder: "Enter conversation title..."
                                                    }),
                                                    _jsx("button", {
                                                        onClick: handleSaveTitle,
                                                        disabled: isSaving,
                                                        className: "text-xs px-2 py-1 bg-yellow-400 text-blue-900 rounded hover:bg-yellow-300 transition-colors",
                                                        children: isSaving ? "Saving..." : "Save"
                                                    }),
                                                    _jsx("button", {
                                                        onClick: () => setEditingTitle(false),
                                                        className: "text-xs px-2 py-1 ml-1 bg-[rgba(255,255,255,.1)] text-white rounded hover:bg-[rgba(255,255,255,.2)] transition-colors",
                                                        children: "Cancel"
                                                    })
                                                ]
                                            })
                                        ) : (
                                            _jsxs("div", {
                                                className: "flex items-center",
                                                children: [
                                                    _jsx("h3", {
                                                        className: "text-sm text-blue-200",
                                                        children: activeConversation?.title || `New conversation with ${character.name}`
                                                    }),
                                                    _jsx("button", {
                                                        onClick: () => setEditingTitle(true),
                                                        className: "ml-2 text-xs text-blue-300 hover:text-yellow-400",
                                                        children: _jsx("svg", {
                                                            xmlns: "http://www.w3.org/2000/svg",
                                                            className: "h-3 w-3",
                                                            fill: "none",
                                                            viewBox: "0 0 24 24",
                                                            stroke: "currentColor",
                                                            children: _jsx("path", {
                                                                strokeLinecap: "round",
                                                                strokeLinejoin: "round",
                                                                strokeWidth: 2,
                                                                d: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                                            })
                                                        })
                                                    })
                                                ]
                                            })
                                        )
                                    ]
                                })
                            ]
                        }),
                        _jsxs("div", { 
                            className: "flex flex-wrap gap-2",
                            children: [
                                // Conversation status indicator
                                isSaving && (
                                    _jsxs("div", {
                                        className: "flex items-center text-xs text-blue-200 px-2 py-1 bg-[rgba(255,255,255,.05)] rounded-lg",
                                        children: [
                                            _jsx("div", {
                                                className: "animate-pulse h-2 w-2 bg-blue-400 rounded-full mr-2"
                                            }),
                                            "Saving..."
                                        ]
                                    })
                                ),
                                
                                // Favorite button
                                isAuthenticated && (
                                    _jsx("button", {
                                        onClick: handleToggleFavorite,
                                        className: `flex items-center gap-1 px-3 py-2 rounded-lg ${
                                            isFavorite 
                                                ? 'bg-yellow-400 text-blue-900' 
                                                : 'bg-[rgba(250,204,21,.2)] border border-yellow-400 text-yellow-400'
                                        } font-semibold transition-all hover:bg-yellow-400 hover:text-blue-900`,
                                        title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                                        children: [
                                            _jsx("svg", {
                                                xmlns: "http://www.w3.org/2000/svg",
                                                className: "h-5 w-5",
                                                fill: isFavorite ? "currentColor" : "none",
                                                viewBox: "0 0 24 24",
                                                stroke: "currentColor",
                                                children: _jsx("path", {
                                                    strokeLinecap: "round",
                                                    strokeLinejoin: "round",
                                                    strokeWidth: isFavorite ? 0 : 2,
                                                    d: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                                })
                                            }),
                                            "Favorite"
                                        ]
                                    })
                                ),
                                
                                // Insights button
                                _jsxs("button", { 
                                    id: "insightsToggle", 
                                    onClick: () => setShowInsightsPanel(!showInsightsPanel),
                                    className: `insights-toggle-button flex items-center gap-1 px-3 py-2 rounded-lg ${showInsightsPanel ? 'bg-yellow-400 text-blue-900' : 'bg-[rgba(250,204,21,.2)] border border-yellow-400 text-yellow-400'} font-semibold transition-all hover:bg-yellow-400 hover:text-blue-900`,
                                    children: [
                                        _jsx("svg", { 
                                            xmlns: "http://www.w3.org/2000/svg", 
                                            className: "h-5 w-5", 
                                            viewBox: "0 0 20 20", 
                                            fill: "currentColor",
                                            children: _jsx("path", { 
                                                fillRule: "evenodd", 
                                                d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z", 
                                                clipRule: "evenodd" 
                                            })
                                        }),
                                        "Insights"
                                    ]
                                }),
                                
                                // Share button
                                isAuthenticated && (
                                    _jsxs("button", { 
                                        onClick: handleShareConversation, 
                                        className: `insights-toggle-button flex items-center gap-1 px-3 py-2 rounded-lg ${
                                            isShared
                                                ? 'bg-yellow-400 text-blue-900' 
                                                : 'bg-[rgba(250,204,21,.2)] border border-yellow-400 text-yellow-400'
                                        } font-semibold transition-all hover:bg-yellow-400 hover:text-blue-900`,
                                        children: [
                                            _jsx("svg", { 
                                                xmlns: "http://www.w3.org/2000/svg", 
                                                className: "h-5 w-5", 
                                                viewBox: "0 0 20 20", 
                                                fill: "currentColor",
                                                children: _jsx("path", { 
                                                    d: "M15 8a3 3 0 100-6 3 3 0 000 6zM15 18a3 3 0 100-6 3 3 0 000 6zM5 13a3 3 0 100-6 3 3 0 000 6z" 
                                                })
                                            }),
                                            isShared ? "Shared" : "Share"
                                        ]
                                    })
                                ),
                                
                                // Save button (for new conversations)
                                isAuthenticated && !activeConversation && messages.length > 0 && (
                                    _jsxs("button", {
                                        onClick: () => setShowSaveModal(true),
                                        className: "flex items-center gap-1 px-3 py-2 rounded-lg bg-[rgba(250,204,21,.2)] border border-yellow-400 text-yellow-400 font-semibold transition-all hover:bg-yellow-400 hover:text-blue-900",
                                        children: [
                                            _jsx("svg", {
                                                xmlns: "http://www.w3.org/2000/svg",
                                                className: "h-5 w-5",
                                                viewBox: "0 0 20 20",
                                                fill: "currentColor",
                                                children: _jsx("path", {
                                                    d: "M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z"
                                                })
                                            }),
                                            "Save"
                                        ]
                                    })
                                )
                            ]
                        })
                    ]
                }),
                
                // Chat messages area
                _jsxs("div", { 
                    className: "chat-messages flex-grow overflow-y-auto p-5 flex flex-col gap-4",
                    children: [
                        messages.length === 0 ? (
                            _jsx("div", { 
                                className: "flex h-full w-full items-center justify-center", 
                                children: _jsxs("div", { 
                                    className: "text-center max-w-md", 
                                    children: [
                                        _jsxs("p", { 
                                            className: "text-blue-100 mb-4", 
                                            children: [
                                                "Start your conversation with ", 
                                                character.name, 
                                                ". Ask questions about their life, experiences, or seek their wisdom."
                                            ] 
                                        }),
                                        _jsx("div", { 
                                            className: "text-sm text-blue-200 italic", 
                                            children: "\"Ask me anything...\"" 
                                        })
                                    ] 
                                }) 
                            })
                        ) : (
                            _jsxs(_Fragment, { 
                                children: [
                                    messages
                                        .filter((m) => m.content && m.content.trim() !== '')
                                        .map((message, index) => (
                                            _jsx(ChatBubble, { 
                                                message: message, 
                                                characterName: character.name, 
                                                characterAvatar: character.avatar_url, 
                                                isTyping: isTyping && message === messages[messages.length - 1] && 
                                                        message.role === 'assistant' && message.content === '' 
                                            }, message?.id || `message-${index}`)
                                        )),
                                    
                                    isTyping && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
                                        _jsxs("div", { 
                                            className: "flex items-center mb-4", 
                                            children: [
                                                _jsx("div", { 
                                                    className: "flex-shrink-0 mr-2", 
                                                    children: _jsx("img", { 
                                                        src: getSafeAvatarUrl(character.name, character.avatar_url), 
                                                        alt: character.name, 
                                                        className: "h-10 w-10 rounded-full object-cover border-2 border-yellow-400" 
                                                    }) 
                                                }),
                                                _jsxs("div", { 
                                                    className: "text-sm text-blue-200", 
                                                    children: [character.name, " is responding..."] 
                                                })
                                            ] 
                                        })
                                    ),
                                    
                                    error && (
                                        _jsx("div", { 
                                            className: "mx-auto my-4 max-w-md rounded-lg bg-red-900/50 border border-red-500 p-4", 
                                            children: _jsxs("div", { 
                                                className: "flex", 
                                                children: [
                                                    _jsx("svg", { 
                                                        xmlns: "http://www.w3.org/2000/svg", 
                                                        className: "h-5 w-5 text-red-400 mr-2", 
                                                        viewBox: "0 0 20 20", 
                                                        fill: "currentColor", 
                                                        children: _jsx("path", { 
                                                            fillRule: "evenodd", 
                                                            d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", 
                                                            clipRule: "evenodd" 
                                                        }) 
                                                    }),
                                                    _jsxs("div", { 
                                                        children: [
                                                            _jsx("p", { 
                                                                className: "text-sm text-red-200", 
                                                                children: "Sorry, something went wrong. Please try again." 
                                                            }),
                                                            _jsx("button", { 
                                                                onClick: retryLastMessage, 
                                                                className: "mt-2 rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-500 transition-colors", 
                                                                children: "Retry" 
                                                            })
                                                        ] 
                                                    })
                                                ] 
                                            }) 
                                        })
                                    )
                                ] 
                            })
                        ),
                        _jsx("div", { ref: messagesEndRef })
                    ] 
                }),
                
                // Insights panel
                _jsx(CharacterInsightsPanel, { 
                    character: character, 
                    isOpen: showInsightsPanel, 
                    onClose: () => setShowInsightsPanel(false) 
                }),
                
                // Chat input area
                _jsx("div", { 
                    className: "chat-input-area border-t border-[rgba(255,255,255,.1)] bg-[rgba(255,255,255,.05)] p-4",
                    children: _jsx(ChatInput, { 
                        onSendMessage: handleSendMessage,
                        disabled: isLoading, 
                        placeholder: `Ask ${character.name} anything...`,
                        className: "bg-[rgba(255,255,255,.15)] border border-[rgba(255,255,255,.3)] rounded-lg text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30"
                    })
                }),
                
                // Chat actions (if needed)
                _jsx(ChatActions, {}),
                
                {/* Save Modal */}
                showSaveModal && (
                    _jsx("div", {
                        className: "fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50",
                        children: _jsxs("div", {
                            className: "bg-blue-800 rounded-lg shadow-xl max-w-md w-full p-6",
                            children: [
                                _jsx("h3", {
                                    className: "text-xl font-semibold text-yellow-300 mb-4",
                                    children: "Save Conversation"
                                }),
                                _jsx("p", {
                                    className: "text-blue-100 mb-4",
                                    children: "Give your conversation a title to save it:"
                                }),
                                _jsx("input", {
                                    type: "text",
                                    value: conversationTitle,
                                    onChange: (e) => setConversationTitle(e.target.value),
                                    className: "w-full px-3 py-2 bg-[rgba(255,255,255,.1)] border border-[rgba(255,255,255,.2)] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-4",
                                    placeholder: `Conversation with ${character.name}`
                                }),
                                _jsxs("div", {
                                    className: "flex justify-end space-x-3",
                                    children: [
                                        _jsx("button", {
                                            onClick: () => setShowSaveModal(false),
                                            className: "px-4 py-2 bg-[rgba(255,255,255,.1)] text-white rounded-md hover:bg-[rgba(255,255,255,.2)] transition-colors",
                                            children: "Cancel"
                                        }),
                                        _jsx("button", {
                                            onClick: () => handleSaveConversation(conversationTitle),
                                            disabled: isSaving,
                                            className: "px-4 py-2 bg-yellow-400 text-blue-900 rounded-md font-semibold hover:bg-yellow-300 transition-colors",
                                            children: isSaving ? "Saving..." : "Save"
                                        })
                                    ]
                                })
                            ]
                        })
                    })
                ),
                
                {/* Share Modal */}
                showShareModal && (
                    _jsx("div", {
                        className: "fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50",
                        children: _jsxs("div", {
                            className: "bg-blue-800 rounded-lg shadow-xl max-w-md w-full p-6",
                            children: [
                                _jsx("h3", {
                                    className: "text-xl font-semibold text-yellow-300 mb-4",
                                    children: "Share Conversation"
                                }),
                                _jsx("p", {
                                    className: "text-blue-100 mb-4",
                                    children: "Share this link with others to let them view this conversation:"
                                }),
                                _jsxs("div", {
                                    className: "flex mb-4",
                                    children: [
                                        _jsx("input", {
                                            type: "text",
                                            readOnly: true,
                                            value: shareUrl,
                                            className: "flex-1 px-3 py-2 bg-[rgba(255,255,255,.1)] border border-[rgba(255,255,255,.2)] rounded-l-md text-white focus:outline-none"
                                        }),
                                        _jsx("button", {
                                            id: "copy-share-button",
                                            onClick: copyShareUrl,
                                            className: "px-4 py-2 bg-yellow-400 text-blue-900 rounded-r-md font-semibold hover:bg-yellow-300 transition-colors",
                                            children: "Copy"
                                        })
                                    ]
                                }),
                                _jsxs("div", {
                                    className: "flex justify-between",
                                    children: [
                                        _jsx("button", {
                                            onClick: handleStopSharing,
                                            className: "px-4 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-500 transition-colors",
                                            children: "Stop Sharing"
                                        }),
                                        _jsx("button", {
                                            onClick: () => setShowShareModal(false),
                                            className: "px-4 py-2 bg-[rgba(255,255,255,.1)] text-white rounded-md hover:bg-[rgba(255,255,255,.2)] transition-colors",
                                            children: "Close"
                                        })
                                    ]
                                })
                            ]
                        })
                    })
                )
            ] 
        })
    );
};

export default ChatInterfaceWithConversations;
