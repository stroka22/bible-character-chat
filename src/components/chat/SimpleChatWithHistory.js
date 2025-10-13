import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { useChat } from '../../contexts/ChatContext.jsx';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useConversation } from '../../contexts/ConversationContext.jsx';
import { useRoundtable } from '../../contexts/RoundtableContext.jsx';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import ChatActions from './ChatActions';
import CharacterInsightsPanel from './CharacterInsightsPanel';
import { characterRepository } from '../../repositories/characterRepository';
import UpgradeModal from '../modals/UpgradeModal';
import { usePremium } from '../../hooks/usePremium';
import { bibleStudiesRepository } from '../../repositories/bibleStudiesRepository';
import { bibleSeriesRepository } from '../../repositories/bibleSeriesRepository';

// Feature flag: enable/disable local chat cache usage for resume fallback
const ENABLE_LOCAL_CHAT_CACHE = false;

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
        error: convError,
        shareConversation,
        getSharedConversation,
    } = useConversation();
    const { hydrateFromConversation: hydrateRoundtable } = useRoundtable();

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

    const { conversationId, shareCode } = useParams();

    /* ------------------------------------------------------------------
     * Inject lesson context when URL contains ?study=<id>&lesson=<index>
     * ----------------------------------------------------------------*/
    useEffect(() => {
      const applyLessonContext = async () => {
        // Need a selected character before we inject context
        if (!character) return;
        // Do not modify context for shared view
        if (shareCode) return;

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
    }, [location.search, character, shareCode]);

    /* ------------------------------------------------------------------
     * Inject series introduction context when URL contains ?series=<slug>
     * (and no study param). Also auto-post an intro assistant message.
     * ----------------------------------------------------------------*/
    useEffect(() => {
      const run = async () => {
        if (!character) return;
        // Shared view: do not inject series intro
        if (shareCode) return;
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
    }, [location.search, character, messages.length, shareCode]);

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

    const autoSavedRef = useRef(false); // retained but unused with autosave disabled
    const introPostedRef = useRef(false);

    /* ------------------------------------------------------------------
     * Auto-post introduction when launched from a Bible-study link
     * ----------------------------------------------------------------*/
    useEffect(() => {
      // Skip if intro already posted or impossible to post
      if (introPostedRef.current || !character) return;
      // Shared view should not auto-post intro
      if (shareCode) return;
      
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
      
    }, [character, studyMeta, lessonMeta, location.search, messages, postAssistantMessage, shareCode]);

    /* ------------------------------------------------------------------
     * Auto-select character from query string (?character=<id>)
     * ----------------------------------------------------------------*/
    useEffect(() => {
        (async () => {
            // Already have a character selected -> nothing to do
            if (character) return;

            // If we are restoring by conversationId, skip auto-selection
            if (conversationId) return;
            // Shared view: never auto-select from query
            if (shareCode) return;

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
    }, [location.search, character, conversationId, shareCode]);

    /* ------------------------------------------------------------------
     * Load existing conversation when /chat/:conversationId route used
     * ----------------------------------------------------------------*/
    useEffect(() => {
        const loadExisting = async () => {
            if (!conversationId) return;

            try {
                const conv = await fetchConversationWithMessages(conversationId);
                if (conv) {
                    // If this is a roundtable conversation, hydrate roundtable and redirect
                    const convType = (conv.type || conv.conversation_type || '').toLowerCase();
                    const isRoundtableByTitle = typeof conv.title === 'string' && conv.title.startsWith('Roundtable: ');
                    // Heuristic: consider as roundtable if multiple participants OR
                    // any assistant message has a speaker id OR looks like "Name:"
                    const msgs = Array.isArray(conv.messages) ? conv.messages : [];
                    const hasSpeakerIds = msgs.some(m => m?.role === 'assistant' && m?.metadata?.speakerCharacterId);
                    const namePrefixRx = /^\s*[A-Z][A-Za-z\s\-']{1,40}\s*[:\-–—]\s+/;
                    const hasNamePrefixes = msgs.some(m => m?.role === 'assistant' && typeof m.content === 'string' && namePrefixRx.test(m.content));
                    const manyParticipants = Array.isArray(conv.participants) && conv.participants.length > 1;
                    let shouldTreatAsRoundtable = (convType === 'roundtable' || isRoundtableByTitle || manyParticipants || hasSpeakerIds || hasNamePrefixes);
                    // Optional override: URL param participants=Name1,Name2 to backfill participants by name
                    // Useful for older conversations that predate participants metadata
                    const params = new URLSearchParams(location.search);
                    const participantsParam = params.get('participants') || params.get('rt');
                    let participantsFromParam = [];
                    let convWithParticipants = conv;
                    if (participantsParam && (!conv.participants || conv.participants.length === 0)) {
                        const names = participantsParam.split(',').map(s => s.trim()).filter(Boolean);
                        if (names.length) {
                            const resolveByName = async (n) => {
                                try {
                                    const exact = await characterRepository.getByName?.(n);
                                    if (exact) return exact.id;
                                } catch {}
                                try {
                                    const results = await characterRepository.search?.(n);
                                    if (Array.isArray(results) && results.length > 0) {
                                        const lower = n.toLowerCase();
                                        const best = results.find(r => String(r.name).toLowerCase() === lower)
                                          || results.find(r => String(r.name).toLowerCase().startsWith(lower))
                                          || results[0];
                                        return best?.id || null;
                                    }
                                } catch {}
                                return null;
                            };
                            for (const nm of names) {
                                const id = await resolveByName(nm);
                                if (id) participantsFromParam.push(id);
                            }
                            if (participantsFromParam.length) {
                                convWithParticipants = { ...conv, participants: participantsFromParam };
                                if (participantsFromParam.length > 1) shouldTreatAsRoundtable = true;
                            }
                        }
                    }
                    if (shouldTreatAsRoundtable && typeof hydrateRoundtable === 'function') {
                        try { await hydrateRoundtable(convWithParticipants); } catch {}
                        navigate('/roundtable', { replace: true });
                        return;
                    }
                    // Fallback: if no messages returned (e.g., due to RLS),
                    // try to hydrate from local cache written during save/send.
                    if (ENABLE_LOCAL_CHAT_CACHE) {
                      let finalConv = conv;
                      try {
                        if (!conv.messages || conv.messages.length === 0) {
                          const cacheKey = `chat-cache-${conversationId}`;
                          const cached = localStorage.getItem(cacheKey);
                          if (cached) {
                            const parsed = JSON.parse(cached);
                            if (Array.isArray(parsed) && parsed.length > 0) {
                              finalConv = { ...conv, messages: parsed };
                            }
                          }
                        }
                      } catch (e) {
                        console.warn('[SimpleChatWithHistory] Cache hydration failed:', e);
                      }
                      hydrateFromConversation(finalConv);
                    } else {
                      hydrateFromConversation(conv);
                    }
                }
            } catch (err) {
                console.error('[SimpleChatWithHistory] Failed to load conversation:', err);
            }
        };
        loadExisting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversationId, hydrateRoundtable, navigate]);

    /* ------------------------------------------------------------------
     * Load shared conversation when /shared/:shareCode route is used
     * ----------------------------------------------------------------*/
    useEffect(() => {
        const loadShared = async () => {
            if (!shareCode) return;
            try {
                const conv = await getSharedConversation(shareCode);
                if (conv) {
                    const convType = (conv.type || conv.conversation_type || '').toLowerCase();
                    const isRoundtableByTitle = typeof conv.title === 'string' && conv.title.startsWith('Roundtable: ');
                    // Optional participants backfill via URL param
                    const params = new URLSearchParams(location.search);
                    const participantsParam = params.get('participants') || params.get('rt');
                    let convWithParticipants = conv;
                    if (participantsParam && (!conv.participants || conv.participants.length === 0)) {
                        const names = participantsParam.split(',').map(s => s.trim()).filter(Boolean);
                        if (names.length) {
                            const resolveByName = async (n) => {
                                try {
                                    const exact = await characterRepository.getByName?.(n);
                                    if (exact) return exact.id;
                                } catch {}
                                try {
                                    const results = await characterRepository.search?.(n);
                                    if (Array.isArray(results) && results.length > 0) {
                                        const lower = n.toLowerCase();
                                        const best = results.find(r => String(r.name).toLowerCase() === lower)
                                          || results.find(r => String(r.name).toLowerCase().startsWith(lower))
                                          || results[0];
                                        return best?.id || null;
                                    }
                                } catch {}
                                return null;
                            };
                            const ids = [];
                            for (const nm of names) {
                                const id = await resolveByName(nm);
                                if (id) ids.push(id);
                            }
                            if (ids.length) {
                                convWithParticipants = { ...conv, participants: ids };
                            }
                        }
                    }
                    if ((convType === 'roundtable' || isRoundtableByTitle || (Array.isArray(convWithParticipants.participants) && convWithParticipants.participants.length > 1)) && typeof hydrateRoundtable === 'function') {
                        try { await hydrateRoundtable(convWithParticipants); } catch {}
                        return navigate('/roundtable?shared=1', { replace: true });
                    }
                    hydrateFromConversation(convWithParticipants);
                }
            } catch (err) {
                console.error('[SimpleChatWithHistory] Failed to load shared conversation:', err);
            }
        };
        loadShared();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shareCode, hydrateRoundtable, navigate]);

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

    // Set default conversation title based on character name or study context
    useEffect(() => {
        if (!character) return;
        if (shareCode) return; // do not auto-title for shared view

        const params = new URLSearchParams(location.search);
        const fromStudy = params.get('study') && params.get('lesson');

        // Prefer study-based title when available
        if (fromStudy && studyMeta && lessonMeta) {
            const title = `[Study] ${studyMeta.title} – Lesson ${
              (lessonMeta.order_index ?? parseInt(params.get('lesson') || '0', 10)) + 1
            }`;
            // Only set if empty or still the generic default
            if (!conversationTitle || conversationTitle.startsWith('Conversation with ')) {
                setConversationTitle(title);
            }
            return;
        }

        // Fallback generic default
        if (!conversationTitle) {
            setConversationTitle(`Conversation with ${character.name}`);
        }
    }, [character, conversationTitle, location.search, studyMeta, lessonMeta, shareCode]);

    // Keep URL synced with saved chat id so shared links hydrate the correct conversation
    // IMPORTANT: Do NOT rewrite /shared/:code to /chat/:id. Shared view must remain stable
    useEffect(() => {
        // If we're on a public share page, never replace the URL
        if (shareCode) return;
        try {
            if (chatId && conversationId !== chatId) {
                navigate(`/chat/${chatId}${location.search}`, { replace: true });
            }
        } catch {}
    }, [chatId, conversationId, location.search, navigate, shareCode]);

    // Handle saving the conversation
    const handleSaveConversation = () => {
        if (!isAuthenticated) {
            // Silent fail in shared view / unauthenticated: no intrusive alerts
            return;
        }

        if (!character) {
            return;
        }

        if (isChatSaved) {
            return;
        }

        if (messages.length === 0) {
            return;
        }

        // If we have a title, save directly, otherwise show dialog
        if (conversationTitle) {
            saveChat(conversationTitle);
            // no popup
        } else {
            setShowSaveDialog(true);
        }
    };

    // Handle submitting the save dialog
    const handleSaveSubmit = () => {
        if (!conversationTitle.trim()) {
            return;
        }

        saveChat(conversationTitle);
        setShowSaveDialog(false);
        // no popup
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
                    className: "relative z-10 flex items-start justify-center pt-20 md:pt-32 pb-8", 
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
                                        className: "flex items-center justify-between px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm bg-[rgba(255,255,255,.03)] border-b border-[rgba(255,255,255,.08)]",
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
                                        className: "chat-header flex items-center justify-between p-2 md:p-4 border-b border-[rgba(255,255,255,.1)] bg-[rgba(255,255,255,.05)]",
                                        children: [
                                            _jsxs("div", { 
                                                className: "flex items-center",
                                                children: [
                                                    _jsx("img", { 
                                                        src: getSafeAvatarUrl(character.name, character.avatar_url), 
                                                        alt: character.name, 
                                                        className: "h-10 w-10 md:h-12 md:w-12 rounded-full object-cover border-2 border-yellow-400 mr-2 md:mr-3",
                                                        onError: (e) => {
                                                            e.target.src = generateFallbackAvatar(character.name);
                                                        }
                                                    }),
                                                    _jsxs("div", {
                                                        children: [
                                                            _jsx("h2", { 
                                                                className: "text-base md:text-xl font-bold text-yellow-400", 
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
                                                    
                                                    // Share button – public view via share_code only (no non-public fallbacks)
                                                    _jsxs("button", { 
                                                        id: "shareBtn", 
                                                        className: "insights-toggle-button flex items-center gap-1 px-2 md:px-3 py-1.5 md:py-2 rounded-lg bg-[rgba(250,204,21,.2)] border border-yellow-400 text-yellow-400 font-semibold transition-all hover:bg-yellow-400 hover:text-blue-900 text-xs md:text-sm",
                                                        onClick: async () => {
                                                            const origin = window.location.origin;
                                                            const params = new URLSearchParams(location.search);

                                                            // If no saved chat yet but we can save, do so to generate a stable /chat/:id URL
                                                            if (!chatId && isAuthenticated && messages.length > 0) {
                                                                try {
                                                                    const title = conversationTitle && conversationTitle.trim()
                                                                      ? conversationTitle.trim()
                                                                      : `Conversation with ${character.name}`;
                                                                    await saveChat(title);
                                                                    // Allow state + route sync effect to run
                                                                    await new Promise(r => setTimeout(r, 800));
                                                                } catch (e) {
                                                                    console.warn('[Share] Auto-save before share failed:', e);
                                                                }
                                                            }

                                                            // Generate a public share_code via ConversationContext
                                                            let shareUrl;
                                                            try {
                                                              if (chatId && typeof shareConversation === 'function') {
                                                                const code = await shareConversation(chatId);
                                                                if (code) {
                                                                  shareUrl = `${origin}/shared/${code}`;
                                                                }
                                                              }
                                                            } catch (e) {
                                                              console.warn('[Share] share_code generation failed; falling back:', e);
                                                            }

                                                            // If no public share URL, do nothing (avoid non-public fallbacks)
                                                            if (!shareUrl) return;
                                                            // If no public share URL, do nothing (avoid non-public fallbacks)
                                                            if (!shareUrl) return;

                                                    // Prefer native share sheet when available
                                                    try {
                                                      if (navigator.share) {
                                                        await navigator.share({
                                                          title: 'FaithTalk AI Conversation',
                                                          text: `Chat with ${character.name}`,
                                                          url: shareUrl,
                                                        });
                                                      } else {
                                                        await navigator.clipboard.writeText(shareUrl);
                                                      }
                                                    } catch (e) {
                                                      // Fallback to clipboard if user cancels or share not supported
                                                      try { await navigator.clipboard.writeText(shareUrl); } catch {}
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
                                    
                                    // Chat actions – compact icons on mobile, full on desktop
                                    _jsxs(_Fragment, {
                                        children: [
                                            _jsx("div", { className: "md:hidden px-3 py-2 border-t border-white/10 bg-white/5", children: _jsx(ChatActions, { compact: true, className: "justify-center w-full" }) }),
                                            _jsx("div", { className: "hidden md:block", children: _jsx(ChatActions, {}) })
                                        ]
                                    }),
                                    
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
