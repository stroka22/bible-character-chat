import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { useChat } from '../../contexts/ChatContext.jsx';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useConversation } from '../../contexts/ConversationContext.jsx';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import ChatActions from './ChatActions';
import CharacterInsightsPanel from './CharacterInsightsPanel';
import { characterRepository } from '../../repositories/characterRepository';
import UpgradeModal from '../modals/UpgradeModal';
import { usePremium } from '../../hooks/usePremium';
import { bibleStudiesRepository } from '../../repositories/bibleStudiesRepository';
import { bibleSeriesRepository } from '../../repositories/bibleSeriesRepository';

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

const SimpleChatWithHistory = () => {
    const navigate   = useNavigate();
    const location   = useLocation();
    const { user, isAuthenticated } = useAuth();
    const { isPremium } = usePremium();
    const { 
        character, 
        messages, 
        isLoading, 
        error, 
        isTyping, 
        retryLastMessage, 
        resetChat, 
        chatId, 
        isChatSaved, 
        saveChat, 
        sendMessage,
        selectCharacter,
        hydrateFromConversation,
        setLessonContext,
        postAssistantMessage
    } = useChat();

    /* ------------------------------------------------------------------
     * Conversation context – for fetching existing conversations
     * ----------------------------------------------------------------*/
    const {
        fetchConversationWithMessages,
        isLoading: convLoading,
        error: convError
    } = useConversation();

    const [showInsightsPanel, setShowInsightsPanel] = useState(false);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [conversationTitle, setConversationTitle] = useState('');
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgradeLimitType, setUpgradeLimitType] = useState('character');
    const [messageLimit, setMessageLimit] = useState(5);
    const [studyMeta, setStudyMeta] = useState(null);
    const [lessonMeta, setLessonMeta] = useState(null);
    const [seriesMeta, setSeriesMeta] = useState(null);
    const messagesEndRef = useRef(null);
    const isResumed = messages.length > 0;

    const { conversationId } = useParams();

    /* ------------------------------------------------------------------
     * Inject lesson context when URL contains ?study=<id>&lesson=<index>
     * ----------------------------------------------------------------*/
    useEffect(() => {
      const applyLessonContext = async () => {
        // Need a selected character before we inject context
        if (!character) return;

        const params = new URLSearchParams(location.search);
        const studyId  = params.get('study');
        const lessonIx = params.get('lesson');

        // If params absent, clear any previous context
        if (!studyId || lessonIx === null) {
          setLessonContext(null);
          setStudyMeta(null);
          setLessonMeta(null);
          return;
        }

        try {
          const study  = await bibleStudiesRepository.getStudyById(studyId);
          const lesson = await bibleStudiesRepository.getLessonByIndex(
            studyId,
            parseInt(lessonIx, 10)
          );

          if (!study || !lesson) {
            setLessonContext(null);
            setStudyMeta(null);
            setLessonMeta(null);
            return;
          }

          setStudyMeta(study);
          setLessonMeta(lesson);

          const ctx = `You are guiding a Bible study conversation. ` +
            `Study: ${study.title}. ` +
            `Lesson ${lesson.order_index + 1}: ${lesson.title}. ` +
            `Scripture: ${Array.isArray(lesson.scripture_refs) && lesson.scripture_refs.length > 0 ? lesson.scripture_refs.join(', ') : 'N/A'}. ` +
            `Summary: ${lesson.summary ?? ''}`.trim();

          setLessonContext(ctx);
        } catch (err) {
          console.warn('[SimpleChatWithHistory] Failed to fetch lesson context:', err);
          setLessonContext(null);
          setStudyMeta(null);
          setLessonMeta(null);
        }
      };

      applyLessonContext();
      // Clear context when component unmounts
      return () => {
        setLessonContext(null);
        setStudyMeta(null);
        setLessonMeta(null);
        setSeriesMeta(null);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search, character]);

    /* ------------------------------------------------------------------
     * Inject series introduction context when URL contains ?series=<slug>
     * (and no study param). Also auto-post an intro assistant message.
     * ----------------------------------------------------------------*/
    useEffect(() => {
      const run = async () => {
        if (!character) return;
        const params = new URLSearchParams(location.search);
        if (params.get('study')) return; // handled by lesson context
        const seriesSlug = params.get('series');
        if (!seriesSlug) return;

        try {
          const s = await bibleSeriesRepository.getBySlug(seriesSlug);
          if (!s) return;
          setSeriesMeta(s);
          const ctx = `You are guiding an introductory conversation for a Bible study series. ` +
            `Series: ${s.title}. ` +
            `${s.description ? `Description: ${s.description}` : ''}`.trim();
          setLessonContext(ctx);

          // If no user messages yet, post an intro assistant message
          if (!messages.some(m => m.role === 'user')) {
            let intro = `Welcome! I am here to introduce the series "${s.title}".`;
            if (s.description) {
              intro += `\n\n${s.description}`;
            }
            intro += `\n\nWhat would you like to focus on as we begin this series?`;
            postAssistantMessage(intro);
          }
        } catch (err) {
          console.warn('[SimpleChatWithHistory] Failed to inject series context:', err);
        }
      };
      run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search, character, messages.length]);

    useEffect(() => {
      try {
        const s = localStorage.getItem('accountTierSettings');
        if (s) {
          const j = JSON.parse(s);
          if (j.freeMessageLimit) setMessageLimit(j.freeMessageLimit);
        }
      } catch {}
    }, []);
    
    useEffect(() => {
      if (!error || typeof error !== 'string') return;
      const lower = error.toLowerCase();
      if (lower.includes('premium character')) {
        setUpgradeLimitType('character');
        setShowUpgradeModal(true);
      } else if (lower.includes('message limit') || lower.includes('free conversation limit')) {
        setUpgradeLimitType('message');
        setShowUpgradeModal(true);
      }
    }, [error]);
    
    const userMessageCount = messages.filter((m) => m.role === 'user').length;

    /* ------------------------------------------------------------------
     * Auto-save conversation when launched from a Bible-study link
     * ----------------------------------------------------------------*/
    const autoSavedRef = useRef(false);
    const introPostedRef = useRef(false);

    useEffect(() => {
      // Already handled or impossible to save
      if (autoSavedRef.current || isChatSaved !== false) return;
      if (!character || !isAuthenticated) return;
      if (messages.length === 0) return; // avoid saving empty chat

      const params = new URLSearchParams(location.search);
      if (!params.get('study')) return; // only auto-save when coming from a study

      // All conditions met – save once
      saveChat();          // title auto-generated by saveChat()
      autoSavedRef.current = true;
    }, [
      character,
      isChatSaved,
      isAuthenticated,
      messages.length,
      location.search,
      saveChat
    ]);

    /* ------------------------------------------------------------------
     * Auto-post introduction when launched from a Bible-study link
     * ----------------------------------------------------------------*/
    useEffect(() => {
      // Skip if intro already posted or impossible to post
      if (introPostedRef.current || !character) return;
      
      // Check if we have study context from URL
      const params = new URLSearchParams(location.search);
      const hasStudyContext = params.get('study') && params.get('lesson');
      if (!hasStudyContext) return;
      
      // Check if we have study and lesson metadata loaded
      if (!studyMeta || !lessonMeta) return;
      
      // Skip if there are user messages already
      if (messages.some(m => m.role === 'user')) return;
      
      // Build the introduction message
      let introText = `Greetings! I'm ${character.name}, and I'll be guiding you through this Bible study.\n\n`;
      
      // Add study title and description
      introText += `**${studyMeta.title}**\n`;
      if (studyMeta.description) {
        introText += `${studyMeta.description}\n\n`;
      }
      
      // Add lesson info
      introText += `**Lesson ${lessonMeta.order_index + 1}: ${lessonMeta.title}**\n\n`;
      
      // Add scripture references if available
      if (Array.isArray(lessonMeta.scripture_refs) && lessonMeta.scripture_refs.length > 0) {
        introText += `*Scripture: ${lessonMeta.scripture_refs.join(', ')}*\n\n`;
      }
      
      // Add lesson summary if available
      if (lessonMeta.summary) {
        introText += `${lessonMeta.summary}\n\n`;
      }
      
      // Add outline from prompts (up to 6 points)
      if (Array.isArray(lessonMeta.prompts) && lessonMeta.prompts.length > 0) {
        introText += `**Key points we'll explore:**\n`;
        
        // Extract text from prompts (handle both string and object formats)
        const outlinePoints = lessonMeta.prompts
          .slice(0, 6)
          .map(p => typeof p === 'string' ? p : (p.text || ''))
          .filter(text => text.trim() !== '');
        
        outlinePoints.forEach(point => {
          introText += `• ${point}\n`;
        });
        
        introText += '\n';
      }
      
      // Add guidance about Q&A format
      introText += `Feel free to ask questions as we go through this study. I'm here to help you understand the scripture and apply its teachings to your life.\n\n`;
      
      // Add warm opening question
      introText += `What aspect of this lesson are you most interested in exploring today?`;
      
      // Post the message and mark intro as posted
      postAssistantMessage(introText);
      introPostedRef.current = true;
      
    }, [character, studyMeta, lessonMeta, location.search, messages, postAssistantMessage]);

    /* ------------------------------------------------------------------
     * Auto-select character from query string (?character=<id>)
     * ----------------------------------------------------------------*/
    useEffect(() => {
        (async () => {
            // Already have a character selected -> nothing to do
            if (character) return;

            // If we are restoring by conversationId, skip auto-selection
            if (conversationId) return;

            const params = new URLSearchParams(location.search);
            const charId = params.get('character');
            if (!charId) return;

            try {
                const fetched = await characterRepository.getById(charId);
                if (fetched) {
                    selectCharacter(fetched);
                } else {
                    console.warn(`[SimpleChatWithHistory] Character id ${charId} not found`);
                }
            } catch (err) {
                console.warn('[SimpleChatWithHistory] Failed to fetch character from query param:', err);
            }
        })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search, character, conversationId]);

    /* ------------------------------------------------------------------
     * Load existing conversation when /chat/:conversationId route used
     * ----------------------------------------------------------------*/
    useEffect(() => {
        const loadExisting = async () => {
            if (!conversationId) return;

            try {
                const conv = await fetchConversationWithMessages(conversationId);
                if (conv) {
                    hydrateFromConversation(conv);
                }
            } catch (err) {
                console.error('[SimpleChatWithHistory] Failed to load conversation:', err);
            }
        };
        loadExisting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversationId]);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages.length, isTyping]);

    // Log when conversation is resumed
    useEffect(() => {
        if (isResumed) {
            console.info('[SimpleChatWithHistory] Rendering a resumed conversation');
        }
    }, [isResumed]);

    // Set default conversation title based on character name
    useEffect(() => {
        if (character && !conversationTitle) {
            setConversationTitle(`Conversation with ${character.name}`);
        }
    }, [character, conversationTitle]);

    // Handle saving the conversation
    const handleSaveConversation = () => {
        if (!isAuthenticated) {
            alert('Please sign in to save conversations');
            return;
        }

        if (!character) {
            alert('Please select a character first');
            return;
        }

        if (isChatSaved) {
            alert('This conversation is already saved');
            return;
        }

        if (messages.length === 0) {
            alert('Cannot save an empty conversation');
            return;
        }

        // If we have a title, save directly, otherwise show dialog
        if (conversationTitle) {
            saveChat(conversationTitle);
            alert('Conversation saved!');
        } else {
            setShowSaveDialog(true);
        }
    };

    // Handle submitting the save dialog
    const handleSaveSubmit = () => {
        if (!conversationTitle.trim()) {
            alert('Please enter a title for your conversation');
            return;
        }

        saveChat(conversationTitle);
        setShowSaveDialog(false);
        alert('Conversation saved!');
    };

    // Navigate to conversations page
    const goToConversations = () => {
        navigate('/conversations');
    };

    const loadingConversation = convLoading && !character;

    return (
        _jsxs("div", {
            className: "relative min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700",
            children: [
                /* Background layers (stars / gradient blobs) */
                _jsxs("div", { 
                    className: "fixed inset-0", 
                    children: [
                        _jsx("div", { className: "absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-200/20 via-transparent to-transparent opacity-30" }),
                        _jsx("div", { className: "absolute top-1/4 left-1/4 w-64 h-24 bg-white rounded-full blur-3xl opacity-15 animate-float" }),
                        _jsx("div", { className: "absolute top-1/3 right-1/4 w-80 h-32 bg-white rounded-full blur-3xl opacity-10 animate-float-delayed" }),
                        _jsx("div", { className: "absolute bottom-1/4 left-1/3 w-72 h-28 bg-white rounded-full blur-3xl opacity-5 animate-float-slow" })
                    ]
                }),

                /* Glass container wrapping either selection or chat */
                _jsx("div", { 
                    className: "relative z-10 flex items-start justify-center pt-24 md:pt-32 pb-10", 
                    children: _jsx("div", { 
                        className: "chat-container w-full max-w-6xl h-[calc(100svh-7rem)] md:h-[88vh] mx-4 md:mx-6 bg-white/5 backdrop-blur-md border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col", 
                        children: loadingConversation ? (
                            /* Simple loading state */
                            _jsx("div", {
                                className: "flex h-full w-full items-center justify-center text-yellow-300 text-lg",
                                children: "Loading conversation..."
                            })
                        ) : !character ? (
                            /* Empty state - no character selected */
                            _jsxs("div", { 
                                className: "flex h-full w-full flex-col items-center justify-center p-4 text-white", 
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
                        ) : (
                            /* Chat interface when character is selected */
                            _jsxs("div", { 
                                className: `flex h-full w-full flex-col ${showInsightsPanel ? 'panel-open' : ''}`, 
                                children: [
                                    // Breadcrumb + Back button + My Conversations
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
                                                className: "flex flex-wrap gap-2",
                                                children: [
                                                    _jsx("button", { 
                                                        onClick: resetChat, 
                                                        id: "backBtn", 
                                                        className: "text-xs md:text-sm px-2 md:px-3 py-1 rounded bg-[rgba(250,204,21,.15)] border border-yellow-400 hover:bg-yellow-400 hover:text-[#0a0a2a] transition",
                                                        children: "Back to Characters" 
                                                    })
                                                ] 
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
                                                    _jsxs("div", {
                                                        children: [
                                                            _jsx("h2", { 
                                                                className: "text-xl font-bold text-yellow-400", 
                                                                style: { fontFamily: 'Cinzel, serif' },
                                                                children: `Chat with ${character.name}` 
                                                            }),
                                                            chatId && (
                                                                _jsx("div", {
                                                                    className: "text-sm text-blue-200",
                                                                    children: "Saved conversation"
                                                                })
                                                            )
                                                        ]
                                                    })
                                                ]
                                            }),
                                            _jsxs("div", { 
                                                className: "flex flex-wrap gap-2",
                                                children: [
                                                    // Upgrade button for non-premium users
                                                    !isPremium ? _jsx("a", {
                                                      href: "https://faithtalkai.com/pricing",
                                                      className: "flex items-center gap-1 px-2 md:px-3 py-1.5 md:py-2 rounded-lg bg-yellow-400 text-blue-900 font-semibold border border-yellow-500 shadow hover:bg-yellow-300 transition-all text-xs md:text-sm",
                                                      children: "Upgrade"
                                                    }) : null,
                                                    
                                                    // Save button (only show if not already saved and user is authenticated)
                                                    isAuthenticated && !isChatSaved && messages.length > 0 && (
                                                        _jsxs("button", {
                                                            onClick: handleSaveConversation,
                                                            className: "flex items-center gap-1 px-2 md:px-3 py-1.5 md:py-2 rounded-lg bg-[rgba(250,204,21,.2)] border border-yellow-400 text-yellow-400 font-semibold transition-all hover:bg-yellow-400 hover:text-blue-900 text-xs md:text-sm",
                                                            children: [
                                                                _jsx("svg", {
                                                                    xmlns: "http://www.w3.org/2000/svg",
                                                                    className: "h-5 w-5",
                                                                    viewBox: "0 0 20 20",
                                                                    fill: "currentColor",
                                                                    children: _jsx("path", {
                                                                        d: "M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293z"
                                                                    })
                                                                }),
                                                                "Save"
                                                            ]
                                                        })
                                                    ),
                                                    
                                                    // Insights button
                                                    _jsxs("button", { 
                                                        id: "insightsToggle", 
                                                        onClick: () => setShowInsightsPanel(!showInsightsPanel),
                                                        className: `insights-toggle-button flex items-center gap-1 px-2 md:px-3 py-1.5 md:py-2 rounded-lg ${showInsightsPanel ? 'bg-yellow-400 text-blue-900' : 'bg-[rgba(250,204,21,.2)] border border-yellow-400 text-yellow-400'} font-semibold transition-all hover:bg-yellow-400 hover:text-blue-900 text-xs md:text-sm`,
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
                                                    
                                                    // Simple share button (no persistence)
                                                    _jsxs("button", { 
                                                        id: "shareBtn", 
                                                        className: "insights-toggle-button flex items-center gap-1 px-2 md:px-3 py-1.5 md:py-2 rounded-lg bg-[rgba(250,204,21,.2)] border border-yellow-400 text-yellow-400 font-semibold transition-all hover:bg-yellow-400 hover:text-blue-900 text-xs md:text-sm",
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
                                                        
                                                        error && !showUpgradeModal && (
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
                                                                                    children: error 
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
                                    
                                    // Chat actions
                                    _jsx(ChatActions, {}),
                                    
                                    // Save Dialog Modal
                                    showSaveDialog && (
                                        _jsx("div", {
                                            className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50",
                                            children: _jsxs("div", {
                                                className: "bg-blue-800 rounded-lg shadow-lg p-6 max-w-md w-full",
                                                children: [
                                                    _jsx("h3", {
                                                        className: "text-xl font-semibold text-yellow-300 mb-4",
                                                        children: "Save Conversation"
                                                    }),
                                                    _jsx("p", {
                                                        className: "text-blue-100 mb-4",
                                                        children: "Give your conversation a title to save it for later."
                                                    }),
                                                    _jsx("input", {
                                                        type: "text",
                                                        value: conversationTitle,
                                                        onChange: (e) => setConversationTitle(e.target.value),
                                                        placeholder: `Conversation with ${character.name}`,
                                                        className: "w-full px-3 py-2 mb-4 bg-[rgba(255,255,255,.1)] border border-[rgba(255,255,255,.2)] rounded-md text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                                    }),
                                                    _jsxs("div", {
                                                        className: "flex justify-end space-x-3",
                                                        children: [
                                                            _jsx("button", {
                                                                onClick: () => setShowSaveDialog(false),
                                                                className: "px-4 py-2 bg-[rgba(255,255,255,.1)] text-white rounded-md hover:bg-[rgba(255,255,255,.2)] transition-colors",
                                                                children: "Cancel"
                                                            }),
                                                            _jsx("button", {
                                                                onClick: handleSaveSubmit,
                                                                className: "px-4 py-2 bg-yellow-400 text-blue-900 rounded-md font-semibold hover:bg-yellow-300 transition-colors",
                                                                children: "Save"
                                                            })
                                                        ]
                                                    })
                                                ]
                                            })
                                        })
                                    ),
                                    
                                    // Upgrade Modal
                                    _jsx(UpgradeModal, {
                                      isOpen: showUpgradeModal,
                                      onClose: () => setShowUpgradeModal(false),
                                      limitType: upgradeLimitType,
                                      characterName: character?.name,
                                      messageCount: userMessageCount,
                                      messageLimit: messageLimit
                                    })
                                ] 
                            })
                        )
                    })
                })
            ]
        })
    );
};

export default SimpleChatWithHistory;
