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
import { loadAccountTierSettings } from '../../utils/accountTier';
import { getSettings as getTierSettings } from '../../services/tierSettingsService';
import FloatingHomeButton from '../layout/FloatingHomeButton';

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
    const [messageLimit, setMessageLimit] = useState(100);
    const [premiumStudyIds, setPremiumStudyIds] = useState([]);
    const [studyMeta, setStudyMeta] = useState(null);
    const [lessonMeta, setLessonMeta] = useState(null);
    // Series feature deprecated; keep studies functionality intact
    const messagesEndRef = useRef(null);
    const isResumed = messages.length > 0;

    const { conversationId, shareCode } = useParams();

    // Measure header and lead-capture banner to prevent overlap on mobile
    const [headerPad, setHeaderPad] = useState(96);
    useEffect(() => {
      const measure = () => {
        try {
          const headerEl = document.querySelector('header');
          const fixedHeaderH = headerEl ? headerEl.getBoundingClientRect().height : 64;
          const banner = document.getElementById('lead-banner');
          let top = fixedHeaderH + 8;
          if (banner) {
            const rect = banner.getBoundingClientRect();
            const belowBanner = Math.max(0, rect.bottom + 8);
            top = Math.max(top, belowBanner);
          }
          // add a small cushion for mobile
          const cushion = window.innerWidth < 768 ? 40 : 56;
          setHeaderPad(top + cushion);
        } catch {}
      };
      measure();
      const t1 = setTimeout(measure, 100);
      const t2 = setTimeout(measure, 400);
      let rafId; let frames = 0;
      const sample = () => { measure(); if (frames++ < 120) rafId = requestAnimationFrame(sample); };
      rafId = requestAnimationFrame(sample);
      window.addEventListener('resize', measure);
      window.addEventListener('scroll', measure);
      let bodyObserver;
      try {
        if ('MutationObserver' in window) {
          bodyObserver = new MutationObserver(measure);
          bodyObserver.observe(document.body, { attributes: true, childList: true, subtree: true });
        }
      } catch {}
      return () => {
        clearTimeout(t1); clearTimeout(t2);
        try { cancelAnimationFrame(rafId); } catch {}
        window.removeEventListener('resize', measure);
        window.removeEventListener('scroll', measure);
        try { bodyObserver && bodyObserver.disconnect(); } catch {}
      };
    }, []);

    /* ------------------------------------------------------------------
     * Inject lesson context when URL contains ?study=<id>&lesson=<index>
     * ----------------------------------------------------------------*/
    useEffect(() => {
      const applyLessonContext = async () => {
        console.log('[SimpleChatWithHistory] applyLessonContext called', { 
          hasCharacter: !!character, 
          characterName: character?.name,
          shareCode,
          search: location.search 
        });
        
        // Need a selected character before we inject context
        if (!character) {
          console.log('[SimpleChatWithHistory] No character yet, skipping context');
          return;
        }
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
          const idxNum = parseInt(lessonIx, 10);
          let lesson = await bibleStudiesRepository.getLessonByIndex(studyId, idxNum);

          if (!study) {
            setLessonContext(null);
            setStudyMeta(null);
            setLessonMeta(null);
            return;
          }

          // Fallback: if lesson not found and index=0, synthesize an Introduction
          if (!lesson && idxNum === 0 && (study?.description || '').trim().length) {
            lesson = {
              id: 'synthetic-intro',
              study_id: studyId,
              order_index: 0,
              title: 'Introduction',
              scripture_refs: [],
              summary: study.description,
              prompts: [],
              character_id: study.character_id || null,
            };
          }

          if (!lesson) {
            setLessonContext(null);
            setStudyMeta(null);
            setLessonMeta(null);
            return;
          }

          setStudyMeta(study);
          setLessonMeta(lesson);

          // If lesson has a specific character, switch the chat guide to it.
          // Skip default greeting - the AI will generate a study-specific intro
          try {
            const targetCharId = lesson.character_id || study.character_id || null;
            if (targetCharId && (!character || character.id !== targetCharId)) {
              const nextChar = await characterRepository.getById(targetCharId);
              if (nextChar) {
                selectCharacter(nextChar, { skipGreeting: true });
              }
            }
          } catch (e) {
            console.warn('[SimpleChatWithHistory] Failed to apply lesson character:', e);
          }

          // Build lesson prompts string from the prompts array
          const lessonPrompts = Array.isArray(lesson.prompts) && lesson.prompts.length > 0
            ? lesson.prompts.map(p => typeof p === 'string' ? p : p?.text || '').filter(Boolean).join('\n\n')
            : '';

          const ctx = [
            `You are guiding a Bible study conversation.`,
            `Study: ${study.title}.`,
            `Lesson ${lesson.order_index + 1}: ${lesson.title}.`,
            `Scripture: ${Array.isArray(lesson.scripture_refs) && lesson.scripture_refs.length > 0 ? lesson.scripture_refs.join(', ') : 'N/A'}.`,
            lesson.summary ? `Summary: ${lesson.summary}` : '',
            lessonPrompts ? `Lesson Instructions:\n${lessonPrompts}` : '',
            study.character_instructions ? `Study Prompt: ${study.character_instructions}` : ''
          ].filter(Boolean).join('\n\n').trim();

          console.log('[SimpleChatWithHistory] Lesson context built:', {
            lessonTitle: lesson.title,
            hasLessonPrompts: lessonPrompts.length > 0,
            hasStudyInstructions: !!study.character_instructions,
            contextLength: ctx.length,
            contextPreview: ctx.substring(0, 500)
          });

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
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search, character, shareCode]);

    // Study-only context (no lesson param): build intro based on study_type and study prompt
    useEffect(() => {
      (async () => {
        if (!character) return;
        if (shareCode) return;
        const params = new URLSearchParams(location.search);
        const studyId = params.get('study');
        const lessonIx = params.get('lesson');
        if (!studyId || lessonIx !== null) return; // handled by lesson effect or nothing to do

        try {
          const study = await bibleStudiesRepository.getStudyById(studyId);
          if (!study) return;
          setStudyMeta(study);

          // Build lightweight context for the chat model
          const ctx = `You are guiding a Bible study conversation. Study: ${study.title}. ` +
            `${study.description ? `Description: ${study.description}` : ''} ` +
            `${study.character_instructions ? `Study Prompt: ${study.character_instructions}` : ''}`.trim();
          setLessonContext(ctx);

          // Only auto-post an intro if user hasn't spoken yet
          if (messages.some(m => m.role === 'user')) return;

          // Determine intro based on study_type
          const stype = (study.study_type || 'standalone').toLowerCase();
          let intro = `Hi, I'm ${character.name}. Let's begin the study: "${study.title}".`;
          if (study.description) intro += `\n\n${study.description}`;

          if (stype === 'introduction') {
            intro += `\n\nThis is an introduction to a series of lessons. I'll explain the big picture and help you get ready for what's ahead.`;
          } else {
            intro += `\n\nThis is a standalone study. I’ll guide the discussion and answer your questions as we go.`;
          }

          // Guiding prompt is injected via system context only; do not show in intro

          intro += `\n\nWhat would you like to focus on first?`;

          postAssistantMessage(intro);
        } catch (err) {
          console.warn('[SimpleChatWithHistory] Failed to inject study-only context:', err);
        }
      })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search, character, shareCode, messages.length]);

    // Keep messageLimit and premiumStudyIds in sync with per‑org tier settings (local + remote)
    useEffect(() => {
      const updateFromLocal = () => {
        try {
          const s = loadAccountTierSettings();
          if (s && s.freeMessageLimit) setMessageLimit(s.freeMessageLimit);
          if (Array.isArray(s?.premiumStudyIds)) setPremiumStudyIds(s.premiumStudyIds);
        } catch {}
      };

      updateFromLocal();

      // Hydrate from Supabase once to ensure correctness without hard refresh
      (async () => {
        try {
          const remote = await getTierSettings();
          if (remote && remote.freeMessageLimit) setMessageLimit(remote.freeMessageLimit);
          if (Array.isArray(remote?.premiumStudyIds)) setPremiumStudyIds(remote.premiumStudyIds);
        } catch {}
      })();

      // Listen for updates from admin page (same tab or other tabs)
      const onStorage = (e) => {
        if (e && e.key && String(e.key).startsWith('accountTierSettings')) {
          updateFromLocal();
        }
      };
      const onCustom = () => updateFromLocal();
      window.addEventListener('storage', onStorage);
      window.addEventListener('accountTierSettingsChanged', onCustom);
      return () => {
        window.removeEventListener('storage', onStorage);
        window.removeEventListener('accountTierSettingsChanged', onCustom);
      };
    }, []);

    // Gate premium studies: if non-premium user attempts to open a gated study, show modal
    useEffect(() => {
      if (!studyMeta) return;
      if (isPremium) return;
      try {
        const id = studyMeta.id;
        if (id && Array.isArray(premiumStudyIds) && premiumStudyIds.includes(id)) {
          setUpgradeLimitType('study');
          setShowUpgradeModal(true);
        }
      } catch {}
    }, [studyMeta, isPremium, premiumStudyIds]);
    
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

    // Compute user message count early so effects can depend on it safely
    const userMessageCount = messages.filter((m) => m.role === 'user').length;

    // Defensive: also trigger modal based on computed counts/limits
    useEffect(() => {
      if (!isPremium && userMessageCount >= messageLimit) {
        setUpgradeLimitType('message');
        setShowUpgradeModal(true);
      }
    }, [isPremium, userMessageCount, messageLimit]);

    // Listen for explicit upgrade events from ChatContext (e.g., message limit reached)
    useEffect(() => {
      const onUpgrade = (e) => {
        try {
          const detail = e?.detail || {};
          if (detail.limitType) setUpgradeLimitType(detail.limitType);
          if (typeof detail.messageLimit === 'number') setMessageLimit(detail.messageLimit);
          setShowUpgradeModal(true);
        } catch {}
      };
      window.addEventListener('upgrade:show', onUpgrade);
      return () => window.removeEventListener('upgrade:show', onUpgrade);
    }, []);

    const autoSavedRef = useRef(false); // retained but unused with autosave disabled
    const introPostedRef = useRef(false);

    /* ------------------------------------------------------------------
     * Auto-generate introduction when launched from a Bible-study link
     * Uses AI to generate intro that follows the study's character_instructions
     * ----------------------------------------------------------------*/
    useEffect(() => {
      const generateStudyIntro = async () => {
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
        
        // Skip if there are already messages
        if (messages.length > 0) return;
        
        // Mark as posted immediately to prevent duplicate calls
        introPostedRef.current = true;
        
        // If study has character_instructions, generate intro via AI
        if (studyMeta.character_instructions && studyMeta.character_instructions.trim()) {
          try {
            // Import the API function
            const { generateCharacterResponse } = await import('../../services/openai.js');
            
            // Build the system context (same as what's used in chat)
            const lessonPrompts = Array.isArray(lessonMeta.prompts) && lessonMeta.prompts.length > 0
              ? lessonMeta.prompts.map(p => typeof p === 'string' ? p : p?.text || '').filter(Boolean).join('\n\n')
              : '';

            const systemContext = [
              `You are guiding a Bible study conversation.`,
              `Study: ${studyMeta.title}.`,
              `Lesson ${lessonMeta.order_index + 1}: ${lessonMeta.title}.`,
              `Scripture: ${Array.isArray(lessonMeta.scripture_refs) && lessonMeta.scripture_refs.length > 0 ? lessonMeta.scripture_refs.join(', ') : 'N/A'}.`,
              lessonMeta.summary ? `Summary: ${lessonMeta.summary}` : '',
              lessonPrompts ? `Lesson Instructions:\n${lessonPrompts}` : '',
              studyMeta.character_instructions ? `Study Prompt: ${studyMeta.character_instructions}` : ''
            ].filter(Boolean).join('\n\n').trim();
            
            const persona = character.description || 
              `a biblical figure known for ${character.scriptural_context || 'wisdom'}`;
            
            // Ask AI to generate the opening following the study instructions
            const introResponse = await generateCharacterResponse(
              character.name,
              persona,
              [
                { role: 'system', content: systemContext },
                { role: 'user', content: 'Begin this Bible study session now. IMPORTANT: Follow the MANDATORY STRUCTURE in the Study Prompt exactly - if it says to open with prayer, you MUST start with a prayer. Do not skip or reorder any required steps.' }
              ]
            );
            
            if (introResponse && !introResponse.includes('error occurred')) {
              postAssistantMessage(introResponse);
              return;
            }
          } catch (err) {
            console.warn('[SimpleChatWithHistory] Failed to generate AI intro, falling back to template:', err);
          }
        }
        
        // Fallback: use template-based intro if no character_instructions or AI fails
        let introText = `Greetings! I'm ${character.name}, and I'll be guiding you through this Bible study.\n\n`;
        introText += `**${studyMeta.title}**\n`;
        if (studyMeta.description) {
          introText += `${studyMeta.description}\n\n`;
        }
        introText += `**Lesson ${lessonMeta.order_index + 1}: ${lessonMeta.title}**\n\n`;
        if (Array.isArray(lessonMeta.scripture_refs) && lessonMeta.scripture_refs.length > 0) {
          introText += `*Scripture: ${lessonMeta.scripture_refs.join(', ')}*\n\n`;
        }
        if (lessonMeta.summary) {
          introText += `${lessonMeta.summary}\n\n`;
        }
        introText += `Feel free to ask questions as we go through this study. I'm here to help you understand the scripture and apply its teachings to your life.\n\n`;
        introText += `What aspect of this lesson are you most interested in exploring today?`;
        
        postAssistantMessage(introText);
      };
      
      generateStudyIntro();
      
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
            
            // If this is a Bible study, skip the default greeting - AI will generate intro
            const isBibleStudy = params.get('study') && params.get('lesson') !== null;

            try {
                const fetched = await characterRepository.getById(charId);
                if (fetched) {
                    selectCharacter(fetched, { skipGreeting: isBibleStudy });
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
                    const hasSpeakerIds = msgs.some(m => m?.role === 'assistant' && (m?.metadata?.speakerCharacterId || m?.metadata?.speaker_id || m?.metadata?.speakerId));
                    const namePrefixRx = /^\s*[A-Z][A-Za-z\s\-']{1,40}\s*[:\-–—]\s+/;
                    const hasNamePrefixes = msgs.some(m => m?.role === 'assistant' && typeof m.content === 'string' && namePrefixRx.test(m.content));
                    const manyParticipants = Array.isArray(conv.participants) && conv.participants.length > 1;
                    let shouldTreatAsRoundtable = (convType === 'roundtable' || isRoundtableByTitle || manyParticipants);
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
                        // Keep a specific, self-describing URL when moving to roundtable UI
                        const qp = new URLSearchParams(location.search);
                        qp.set('conv', conversationId);
                        navigate(`/roundtable?${qp.toString()}`, { replace: true });
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
                    
                    // If this is a Bible study conversation, restore study context
                    if (conv.study_id) {
                      try {
                        const study = await bibleStudiesRepository.getStudyById(conv.study_id);
                        if (study) {
                          setStudyMeta(study);
                          // If there's a lesson_id, load the lesson too
                          if (conv.lesson_id) {
                            const lessons = await bibleStudiesRepository.listLessons(conv.study_id);
                            const lesson = lessons?.find(l => l.id === conv.lesson_id);
                            if (lesson) {
                              setLessonMeta(lesson);
                              // Build the lesson context
                              const lessonPrompts = Array.isArray(lesson.prompts) && lesson.prompts.length > 0
                                ? lesson.prompts.map(p => typeof p === 'string' ? p : p?.text || '').filter(Boolean).join('\n\n')
                                : '';
                              const ctx = [
                                `You are guiding a Bible study lesson.`,
                                `Study: ${study.title}.`,
                                `Lesson ${lesson.order_index + 1}: ${lesson.title}.`,
                                `Scripture: ${Array.isArray(lesson.scripture_refs) && lesson.scripture_refs.length > 0 ? lesson.scripture_refs.join(', ') : 'N/A'}.`,
                                lesson.summary ? `Summary: ${lesson.summary}` : '',
                                lessonPrompts ? `Lesson Instructions:\n${lessonPrompts}` : '',
                                study.character_instructions ? `Study Prompt: ${study.character_instructions}` : ''
                              ].filter(Boolean).join('\n\n').trim();
                              setLessonContext(ctx);
                            }
                          } else {
                            // Study-level intro (no specific lesson)
                            const ctx = `You are guiding a Bible study conversation. Study: ${study.title}. ` +
                              `${study.description ? `Description: ${study.description}` : ''} ` +
                              `${study.character_instructions ? `Study Prompt: ${study.character_instructions}` : ''}`.trim();
                            setLessonContext(ctx);
                          }
                        }
                      } catch (studyErr) {
                        console.warn('[SimpleChatWithHistory] Failed to restore study context:', studyErr);
                      }
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
                        // Preserve share code in URL for clarity when showing roundtable UI
                        const qp = new URLSearchParams(location.search);
                        qp.set('shared', '1');
                        qp.set('code', shareCode);
                        return navigate(`/roundtable?${qp.toString()}`, { replace: true });
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
            try {
                const { scrollToBottom } = require('../../utils/safeScroll');
                scrollToBottom(messagesEndRef.current);
            } catch {
                try { messagesEndRef.current.scrollIntoView({ behavior: 'auto' }); } catch {}
            }
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

    // Helper to get study options for saveChat
    const getStudyOptions = () => {
        const opts = {};
        if (studyMeta?.id) opts.studyId = studyMeta.id;
        if (lessonMeta?.id && lessonMeta.id !== 'synthetic-intro') opts.lessonId = lessonMeta.id;
        // Get progressId from URL params
        const params = new URLSearchParams(location.search);
        const progressId = params.get('progress');
        if (progressId) opts.progressId = progressId;
        return opts;
    };

    // Auto-save for Bible study conversations after messages change
    useEffect(() => {
        // Only auto-save for Bible study chats
        if (!studyMeta) return;
        // Must be authenticated
        if (!isAuthenticated) return;
        // Must have a character and messages
        if (!character || messages.length < 2) return;
        // Don't save if already saving or loading
        if (isLoading) return;
        // Already saved - just need to add new messages
        if (isChatSaved && chatId) {
            // Messages are added via addMessage in ChatContext when the chat is saved
            return;
        }
        // Not saved yet - auto-save with study context
        if (!isChatSaved && conversationTitle) {
            console.log('[SimpleChatWithHistory] Auto-saving Bible study conversation');
            saveChat(conversationTitle, getStudyOptions());
        }
    }, [studyMeta, isAuthenticated, character, messages.length, isLoading, isChatSaved, chatId, conversationTitle, saveChat]);

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
            saveChat(conversationTitle, getStudyOptions());
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

        saveChat(conversationTitle, getStudyOptions());
        setShowSaveDialog(false);
        // no popup
    };

    // Navigate to conversations page
    const goToConversations = () => {
        navigate('/conversations');
    };

    const loadingConversation = convLoading && !character;

    const paramsForHomeBtn = new URLSearchParams(location.search);
    const showFloatingHome = !!paramsForHomeBtn.get('study');

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
                    className: "relative z-10 flex items-start justify-center pb-8", style: { paddingTop: headerPad }, 
                    children: _jsx("div", { 
                        className: "chat-container w-full max-w-6xl h-[calc(100dvh-7rem)] md:h-[88vh] mx-4 md:mx-6 bg-white/5 backdrop-blur-md border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col", 
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
                                                    _jsx(Link, { 
                                                        to: "/", 
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
                                                    
                                                    // Copy Transcript
                                                    _jsx("button", {
                                                        onClick: async () => {
                                                            try {
                                                                const lines = [];
                                                                if (character?.name) {
                                                                    lines.push(`Conversation with ${character.name}`);
                                                                    lines.push('');
                                                                }
                                                                for (const m of messages) {
                                                                    if (!m?.content || m.content.trim() === '') continue;
                                                                    if (m.role === 'user') {
                                                                        lines.push(`You: ${m.content}`);
                                                                    } else {
                                                                        lines.push(`${character?.name || 'Assistant'}: ${m.content}`);
                                                                    }
                                                                }
                                                                const text = lines.join('\n');
                                                                await navigator.clipboard.writeText(text);
                                                            } catch (e) {
                                                                console.warn('[SimpleChatWithHistory] Copy transcript failed:', e);
                                                            }
                                                        },
                                                        className: "flex items-center gap-1 px-2 md:px-3 py-1.5 md:py-2 rounded-lg bg-[rgba(250,204,21,.2)] border border-yellow-400 text-yellow-400 font-semibold transition-all hover:bg-yellow-400 hover:text-blue-900 text-xs md:text-sm",
                                                        children: "Copy Transcript"
                                                    }),
                                                    
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
                                                    
                                                                                                        // Invite button – private participant invite with write access
                                                    _jsxs("button", { 
                                                        id: "inviteBtn", 
                                                        className: "insights-toggle-button flex items-center gap-1 px-2 md:px-3 py-1.5 md:py-2 rounded-lg bg-[rgba(250,204,21,.2)] border border-yellow-400 text-yellow-400 font-semibold transition-all hover:bg-yellow-400 hover:text-blue-900 text-xs md:text-sm",
                                                        onClick: async () => {
                                                            try {
                                                                let id = chatId;
                                                                if (!id) {
                                                                    if (isAuthenticated && messages.length > 0) {
                                                                        const title = conversationTitle && conversationTitle.trim()
                                                                          ? conversationTitle.trim()
                                                                          : `Conversation with ${character.name}`;
                                                                        await saveChat(title, getStudyOptions());
                                                                        await new Promise(r => setTimeout(r, 600));
                                                                        id = chatId;
                                                                    } else {
                                                                        return;
                                                                    }
                                                                }
                                                                if (!id) return;
                                                                const svc = await import('../../services/chatInvitesService');
                                                                const { data, error } = await svc.createChatInvite(id);
                                                                if (error || !data?.code) return;
                                                                const url = `${window.location.origin}/join/${data.code}`;
                                                                const title = 'Join my chat';
                                                                const text = `Join my chat with ${character?.name}`;
                                                                if (navigator.share) {
                                                                    try { await navigator.share({ title, text, url }); return; } catch {}
                                                                }
                                                                try {
                                                                  await navigator.clipboard.writeText(url);
                                                                  try { alert('Invite link copied to clipboard'); } catch {}
                                                                } catch (clipErr) {
                                                                  try { window.prompt('Copy this invite link:', url); } catch {}
                                                                }
                                                            } catch (e) {
                                                                console.error('[Invite] Failed to create invite:', e);
                                                            }
                                                        },
                                                        children: [
                                                            _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: _jsx("path", { d: "M12 5v14m7-7H5" }) }),
                                                            "Invite"
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
                                                                    await saveChat(title, getStudyOptions());
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
                                                      try { await navigator.clipboard.writeText(shareUrl); alert('Share link copied to clipboard'); } catch { try { window.prompt('Copy this link:', shareUrl); } catch {} }
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
                                                            .filter((m) => {
                                                                const content = (m?.content ?? '').toString();
                                                                // Hide system messages and any legacy intro lines containing the label
                                                                if (m?.role === 'system') return false;
                                                                if (content.includes('[Guiding Prompt]')) return false;
                                                                return content.trim() !== '';
                                                            })
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
                                            _jsx("div", { className: "md:hidden px-3 py-2 border-t border-white/10 bg-white/5", children: _jsx(ChatActions, { compact: true, className: "justify-center w-full", hideSave: !!studyMeta }) }),
                                            _jsx("div", { className: "hidden md:block", children: _jsx(ChatActions, { hideSave: !!studyMeta }) })
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
                                      messageLimit: messageLimit,
                                      studyTitle: studyMeta?.title || ''
                                    })
                                ] 
                            })
                        )
                    })
                })
                ,
                // Floating Home button (only when launched from a study)
                showFloatingHome && _jsx(FloatingHomeButton, {})
            ]
        })
    );
};

export default SimpleChatWithHistory;
