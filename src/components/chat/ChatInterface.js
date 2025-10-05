import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState, useCallback } from 'react';
import { useChat } from '../../contexts/ChatContext.jsx';
import { useConversation } from '../../contexts/ConversationContext.jsx';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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

const ChatInterface = () => {
    const { 
        character,
        messages,
        isLoading,
        error,
        isTyping,
        retryLastMessage,
        resetChat,
        sendMessage,          // <-- needed for ChatInput
        chatId,
        isChatSaved,
        saveChat
    } = useChat();
    const { shareConversation } = useConversation();
    const { isAuthenticated } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [showInsightsPanel, setShowInsightsPanel] = useState(false);
    /* Compact actions pop-up on mobile */
    const [showMobileActions, setShowMobileActions] = useState(false);
    const messagesEndRef = useRef(null);
    const isResumed = messages.length > 0;

    // Performance optimized handlers
    const handleResetChat = useCallback((e) => {
        if (e) e.preventDefault();
        // Use setTimeout to defer execution and prevent UI blocking
        setTimeout(() => resetChat(), 0);
    }, [resetChat]);

    const handleToggleInsights = useCallback(() => {
        // Use setTimeout to defer execution and prevent UI blocking
        setTimeout(() => setShowInsightsPanel(prev => !prev), 0);
    }, []);

    const handleShare = useCallback(async () => {
        const origin = window.location.origin;
        const params = new URLSearchParams(location.search);

        // If not yet saved, attempt to save (auth required in production)
        if (!chatId && isAuthenticated && messages.length > 0 && character) {
            try {
                const title = `Conversation with ${character.name}`;
                await saveChat(title);
                // Give state/route a brief moment to update
                await new Promise(r => setTimeout(r, 600));
            } catch (e) {
                console.warn('[ChatInterface] Auto-save before share failed:', e);
            }
        }

        let url;
        // Prefer public share link with share_code; do not fall back to /chat/:id
        try {
            if (typeof shareConversation === 'function' && (chatId || window.__lastChatId)) {
                const id = chatId || window.__lastChatId;
                const code = await shareConversation(id);
                if (code) {
                    url = `${origin}/shared/${code}`;
                }
            }
        } catch (e) {
            console.warn('[ChatInterface] share_code generation failed:', e);
        }

        // If we do not have a public URL, exit silently (no non-public fallback)
        if (!url) return;

        // If we now have a chatId but URL bar isn't at /chat/:id yet, sync it for consistency
        try {
            if (chatId && !window.location.pathname.startsWith(`/chat/${chatId}`)) {
                navigate(`/chat/${chatId}${location.search}`, { replace: true });
            }
        } catch {}

        // Share or copy
        try {
            if (navigator.share) {
                await navigator.share({
                    title: `Chat with ${character?.name}`,
                    text: 'Check out my conversation!',
                    url
                });
            } else {
                await navigator.clipboard.writeText(url);
                // silent copy
            }
        } catch (err) {
            console.log('Share failed:', err);
            try {
                await navigator.clipboard.writeText(url);
                // silent copy
            } catch {
                // ignore
            }
        }
    }, [character?.name, chatId, isAuthenticated, messages.length, location.search, navigate, saveChat, shareConversation]);

    const handleRetryLastMessage = useCallback((e) => {
        if (e) e.preventDefault();
        // Use setTimeout to defer execution and prevent UI blocking
        setTimeout(() => retryLastMessage(), 0);
    }, [retryLastMessage]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages.length, isTyping]);

    /* Close mobile actions when messages list changes (e.g., send/receive). */
    useEffect(() => {
        setShowMobileActions(false);
    }, [messages.length]);

    useEffect(() => {
        if (isResumed) {
            console.info('[ChatInterface] Rendering a resumed conversation');
        }
    }, [isResumed]);

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
                                d: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
                                style: { pointerEvents: 'none' }
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
                /* ------------------------------------------------------------------
                 * Breadcrumb / back-to-characters bar
                 * • Hidden on small screens to free up vertical space
                 * • Displays from md breakpoint upwards
                 * ------------------------------------------------------------------ */
                _jsxs("div", { 
                    className: "hidden md:flex items-center justify-between px-4 py-2 text-sm bg-[rgba(255,255,255,.03)] border-b border-[rgba(255,255,255,.08)]",
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
                        _jsxs("button", { 
                            onClick: handleResetChat, 
                            id: "backBtn", 
                            className: "insights-toggle-button flex items-center gap-1 px-3 py-2 rounded-lg bg-[rgba(250,204,21,.2)] border border-yellow-400 text-yellow-400 font-semibold transition-all hover:bg-yellow-400 hover:text-blue-900",
                            children: [
                                /* Left-arrow icon */
                                _jsx("svg", { 
                                    xmlns: "http://www.w3.org/2000/svg", 
                                    className: "h-5 w-5", 
                                    viewBox: "0 0 20 20", 
                                    fill: "currentColor",
                                    children: _jsx("path", { 
                                        fillRule: "evenodd", 
                                        d: "M12.707 15.707a1 1 0 01-1.414 0L5.586 10l5.707-5.707a1 1 0 011.414 1.414L8.414 10l4.293 4.293a1 1 0 010 1.414z", 
                                        clipRule: "evenodd",
                                        style: { pointerEvents: 'none' }
                                    })
                                }),
                                "Back to Characters"
                            ] 
                        })
                    ]
                }),
                
                // Chat header with character info and action buttons
                /* ------------------------------------------------------------------
                 * Chat header
                 * • Stacks vertically on small screens to avoid overlapping
                 * • Switches to row layout from md breakpoint
                 * ------------------------------------------------------------------ */
                _jsxs("div", { 
                    /* Compact header on mobile : smaller gaps & padding */
                    className: "chat-header flex flex-col md:flex-row items-start md:items-center justify-between gap-2 p-2 md:p-4 border-b border-[rgba(255,255,255,.1)] bg-[rgba(255,255,255,.05)]",
                    children: [
                        _jsxs("div", { 
                            className: "flex items-center",
                            children: [
                                /* Smaller avatar on mobile */
                                _jsx("img", { 
                                    src: getSafeAvatarUrl(character.name, character.avatar_url), 
                                    alt: character.name, 
                                    className: "h-8 w-8 md:h-12 md:w-12 rounded-full object-cover border-2 border-yellow-400 mr-2 md:mr-3",
                                    onError: (e) => {
                                        e.target.src = generateFallbackAvatar(character.name);
                                    }
                                }),
                                /* Smaller title on mobile */
                                _jsx("h2", { 
                                    className: "text-lg md:text-xl font-bold text-yellow-400", 
                                    style: { fontFamily: 'Cinzel, serif' },
                                    children: `Chat with ${character.name}` 
                                })
                            ]
                        }),
                        /* ------------------------------------------------------------------
                         * Action buttons
                         * • Stack vertically on mobile (w-full) so they don't cover title
                         * • Horizontal layout from sm breakpoint
                         * ------------------------------------------------------------------ */
                        _jsxs("div", { 
                            className: "flex flex-col sm:flex-row gap-2 w-full md:w-auto",
                            children: [
                                _jsxs("button", { 
                                    id: "insightsToggle", 
                                    onClick: handleToggleInsights,
                                    /* Smaller buttons on mobile */
                                    className: `insights-toggle-button flex items-center gap-1 px-2 py-1 text-xs md:px-3 md:py-2 md:text-sm rounded-lg ${showInsightsPanel ? 'bg-yellow-400 text-blue-900' : 'bg-[rgba(250,204,21,.2)] border border-yellow-400 text-yellow-400'} font-semibold transition-all hover:bg-yellow-400 hover:text-blue-900`,
                                    children: [
                                        _jsx("svg", { 
                                            xmlns: "http://www.w3.org/2000/svg", 
                                            className: "h-5 w-5", 
                                            viewBox: "0 0 20 20", 
                                            fill: "currentColor",
                                            children: _jsx("path", { 
                                                fillRule: "evenodd", 
                                                d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z", 
                                                clipRule: "evenodd",
                                                style: { pointerEvents: 'none' }
                                            })
                                        }),
                                        "Insights"
                                    ]
                                }),
                                _jsxs("button", { 
                                    id: "shareBtn", 
                                    className: "insights-toggle-button flex items-center gap-1 px-2 py-1 text-xs md:px-3 md:py-2 md:text-sm rounded-lg bg-[rgba(250,204,21,.2)] border border-yellow-400 text-yellow-400 font-semibold transition-all hover:bg-yellow-400 hover:text-blue-900",
                                    onClick: handleShare,
                                    children: [
                                        _jsx("svg", { 
                                            xmlns: "http://www.w3.org/2000/svg", 
                                            className: "h-5 w-5", 
                                            viewBox: "0 0 20 20", 
                                            fill: "currentColor",
                                            children: _jsx("path", { 
                                                d: "M15 8a3 3 0 100-6 3 3 0 000 6zM15 18a3 3 0 100-6 3 3 0 000 6zM5 13a3 3 0 100-6 3 3 0 000 6z",
                                                style: { pointerEvents: 'none' }
                                            })
                                        }),
                                        "Share"
                                    ]
                                })
                            ]
                        })
                    ]
                }),
                
                // Feature image banner (if available)
                character.feature_image_url && (_jsxs("div", {
                    className: "hidden md:block relative w-full h-64 overflow-hidden border-b border-[rgba(255,255,255,.1)]",
                    children: [
                        _jsx("img", {
                            src: getSafeAvatarUrl(character.name, character.feature_image_url),
                            alt: `${character.name} banner`,
                            className: "w-full h-full object-cover",
                            onError: (e) => {
                                // hide banner if image fails
                                if (e?.target?.parentElement) {
                                    e.target.parentElement.style.display = 'none';
                                }
                            }
                        }),
                        /* dark gradient for text readability */
                        _jsx("div", {
                            className: "absolute inset-0 bg-gradient-to-t from-[rgba(10,10,42,0.9)] via-[rgba(10,10,42,0.4)] to-transparent"
                        }),
                        character.opening_line && (_jsx("div", {
                            className: "absolute bottom-0 left-0 w-full p-4",
                            children: _jsx("h3", {
                                className: "text-xl font-bold text-yellow-400 drop-shadow-lg",
                                children: character.opening_line
                            })
                        }))
                    ]
                })),

                // Mobile-only back button (breadcrumb is hidden on small screens)
                _jsx("div", {
                    className: "md:hidden sticky top-0 z-30 px-4 py-2 bg-blue-900/80 backdrop-blur border-b border-[rgba(255,255,255,.15)]",
                    children: _jsxs("button", {
                        onClick: handleResetChat,
                        className: "flex items-center gap-2 text-yellow-300 hover:text-yellow-200 text-base font-semibold",
                        children: [
                            _jsx("svg", {
                                xmlns: "http://www.w3.org/2000/svg",
                                className: "h-4 w-4",
                                viewBox: "0 0 20 20",
                                fill: "currentColor",
                                children: _jsx("path", {
                                    fillRule: "evenodd",
                                    d: "M12.707 15.707a1 1 0 01-1.414 0L5.586 10l5.707-5.707a1 1 0 011.414 1.414L8.414 10l4.293 4.293a1 1 0 010 1.414z",
                                    clipRule: "evenodd",
                                    style: { pointerEvents: 'none' }
                                })
                            }),
                            "← Back to Characters"
                        ]
                    })
                }),

                // Chat messages area
                _jsxs("div", { 
                    className: "chat-messages flex-grow overflow-y-auto p-2 md:p-5 flex flex-col gap-3 md:gap-4",
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
                                                            clipRule: "evenodd",
                                                            style: { pointerEvents: 'none' }
                                                        }) 
                                                    }),
                                                    _jsxs("div", { 
                                                        children: [
                                                            _jsx("p", { 
                                                                className: "text-sm text-red-200", 
                                                                children: "Sorry, something went wrong. Please try again." 
                                                            }),
                                                            _jsx("button", { 
                                                                onClick: handleRetryLastMessage, 
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
                    className: "chat-input-area border-t border-[rgba(255,255,255,.1)] bg-[rgba(255,255,255,.05)] p-2 md:p-4 pb-[max(env(safe-area-inset-bottom),0.5rem)]",
                    children: _jsx(ChatInput, { 
                        onSendMessage: sendMessage,
                        disabled: isLoading, 
                        placeholder: `Ask ${character.name} anything...`,
                        className: "bg-[rgba(255,255,255,.15)] border border-[rgba(255,255,255,.3)] rounded-lg text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30"
                    })
                }),
                
                /* ------------------------------------------------------------
                 * Mobile compact ChatActions toggle (floating bottom-right)
                 * ---------------------------------------------------------- */
                _jsxs("div", { 
                    className: "md:hidden fixed right-3 bottom-24 z-40 flex flex-col items-end",
                    children: [
                        _jsx("button", { 
                            onClick: () => setShowMobileActions(v => !v),
                            "aria-label": "Conversation actions",
                            className: "rounded-full p-2 bg-blue-800/80 backdrop-blur border border-yellow-400/30 text-yellow-200 shadow-md hover:bg-blue-700/80 transition-colors",
                            children: _jsx("svg", { 
                                xmlns: "http://www.w3.org/2000/svg", 
                                className: "h-5 w-5", 
                                viewBox: "0 0 20 20", 
                                fill: "currentColor",
                                children: _jsx("path", { d: "M10 3a2 2 0 110 4 2 2 0 010-4zm0 5a2 2 0 110 4 2 2 0 010-4zm0 5a2 2 0 110 4 2 2 0 010-4z" })
                            })
                        }),
                        showMobileActions && _jsx("div", { 
                            className: "mt-2 rounded-lg bg-blue-900/90 backdrop-blur border border-yellow-400/30 p-1 shadow-xl",
                            children: _jsx(ChatActions, { compact: true, basicOnly: true })
                        })
                    ]
                }),

                // Chat actions (hidden on mobile)
                _jsx("div", { className: "hidden md:block", children: _jsx(ChatActions, {}) })
            ] 
        })
    );
};

export default ChatInterface;
