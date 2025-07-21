import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { useChat } from '../../contexts/MockChatContext.jsx';
import { Link } from 'react-router-dom';
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
        sendMessage           // <-- needed for ChatInput
    } = useChat();
    const [showInsightsPanel, setShowInsightsPanel] = useState(false);
    const messagesEndRef = useRef(null);
    const isResumed = messages.length > 0;

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages.length, isTyping]);

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
                        _jsx("button", { 
                            onClick: resetChat, 
                            id: "backBtn", 
                            className: "text-sm px-3 py-1 rounded bg-[rgba(250,204,21,.15)] border border-yellow-400 hover:bg-yellow-400 hover:text-[#0a0a2a] transition",
                            children: "Back to Characters" 
                        })
                    ]
                }),
                
                // Chat header with character info and action buttons
                _jsxs("div", { 
                    className: "chat-header flex items-center justify-between p-4 border-b border-[rgba(255,255,255,.1)] bg-[rgba(255,255,255,.05)]",
                    children: [
                        _jsxs("div", { 
                            className: "flex items-center",
                            children: [
                                _jsx("img", { 
                                    src: getSafeAvatarUrl(character.name, character.avatar_url), 
                                    alt: character.name, 
                                    className: "h-12 w-12 rounded-full object-cover border-2 border-yellow-400 mr-3",
                                    onError: (e) => {
                                        e.target.src = generateFallbackAvatar(character.name);
                                    }
                                }),
                                _jsx("h2", { 
                                    className: "text-xl font-bold text-yellow-400", 
                                    style: { fontFamily: 'Cinzel, serif' },
                                    children: `Chat with ${character.name}` 
                                })
                            ]
                        }),
                        _jsxs("div", { 
                            className: "flex space-x-2",
                            children: [
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
                                _jsxs("button", { 
                                    id: "shareBtn", 
                                    className: "insights-toggle-button flex items-center gap-1 px-3 py-2 rounded-lg bg-[rgba(250,204,21,.2)] border border-yellow-400 text-yellow-400 font-semibold transition-all hover:bg-yellow-400 hover:text-blue-900",
                                    onClick: () => {
                                        if (navigator.share) {
                                            navigator.share({
                                                title: `Chat with ${character.name}`,
                                                text: 'Check out my conversation!',
                                                url: window.location.href
                                            }).catch(err => {
                                                console.log('Share failed:', err);
                                                alert('Link copied to clipboard');
                                            });
                                        } else {
                                            alert('Link copied to clipboard');
                                        }
                                    },
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
                                        "Share"
                                    ]
                                })
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
                                        .map((message) => (
                                            _jsx(ChatBubble, { 
                                                message: message, 
                                                characterName: character.name, 
                                                characterAvatar: character.avatar_url, 
                                                isTyping: isTyping && message === messages[messages.length - 1] && 
                                                        message.role === 'assistant' && message.content === '' 
                                            }, message.id)
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
                        onSendMessage: sendMessage,
                        disabled: isLoading, 
                        placeholder: `Ask ${character.name} anything...`,
                        className: "bg-[rgba(255,255,255,.15)] border border-[rgba(255,255,255,.3)] rounded-lg text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30"
                    })
                }),
                
                // Chat actions (if needed)
                _jsx(ChatActions, {})
            ] 
        })
    );
};

export default ChatInterface;
