import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { scrollToBottom } from '../utils/safeScroll';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRoundtable } from '../contexts/RoundtableContext';
import { useConversation } from '../contexts/ConversationContext.jsx';
import Footer from '../components/Footer';

const RoundtableChat = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    participants,
    topic,
    messages,
    isTyping,
    conversationId,
    sendUserMessage,
    advanceRound,
    error,
    clearError,
    // Optional helper (may be undefined in older context versions)
    consumeAutoStartFlag,
    hydrateFromConversation
  } = useRoundtable();
  const { shareConversation, fetchConversationWithMessages, getSharedConversation } = useConversation();
  
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const transcriptRef = useRef(null);
  const headerRef = useRef(null);
  const [headerPad, setHeaderPad] = useState(128);
  const [stickyTop, setStickyTop] = useState(96);
  // Ensure we kick off the first round automatically when a new
  // conversation is opened and there are no assistant messages yet.
  const autoKickedRef = useRef(false);
  const [isSharedView, setIsSharedView] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get('shared') === '1';
    } catch { return false; }
  });
  // Lowercase name -> id map for resolving prefixes in shared views
  const [nameMap, setNameMap] = useState({});
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      scrollToBottom(messagesEndRef.current);
    }
  }, [messages]);
  
  // No auto-redirect to setup: stay on Chat and show a friendly empty state instead
  useEffect(() => {
    // Intentionally left blank (we do not navigate away automatically)
  }, [participants, messages, isSharedView]);

  // Hydrate when opened directly with ?code=<shareCode> or ?conv=<conversationId>
  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const convId = params.get('conv');
        const participantsParam = params.get('participants') || params.get('rt');
        // IMPORTANT: If we already have local messages (e.g., placeholders
        // created by advanceRound just before navigation), do NOT hydrate yet.
        // Hydration would overwrite local placeholders with an empty DB state
        // and break the in-flight round generation.
        if (convId && Array.isArray(messages) && messages.length > 0 && !code) {
          return;
        }
        // Require login to view saved conversations by ID
        if (convId && !isAuthenticated) {
          const ret = encodeURIComponent(window.location.pathname + window.location.search);
          return navigate(`/login?return=${ret}`, { replace: false });
        }
        let conv = null;
        if (code && typeof getSharedConversation === 'function') {
          conv = await getSharedConversation(code);
        } else if (convId && typeof fetchConversationWithMessages === 'function') {
          conv = await fetchConversationWithMessages(convId);
        }
        if (!conv) return;
        let convWithParticipants = conv;
        // 0) LocalStorage backfill: if participants missing, use what Setup stashed
        try {
          if ((!conv.participants || conv.participants.length === 0) && conv.id) {
            const raw = localStorage.getItem(`rt_participants_${conv.id}`);
            if (raw) {
              const ids = JSON.parse(raw);
              if (Array.isArray(ids) && ids.length > 0) {
                convWithParticipants = { ...convWithParticipants, participants: ids };
              }
            }
          }
        } catch {}
        // 1) Backfill from URL participants param when conversation lacks participants
        if (participantsParam && (!conv.participants || conv.participants.length === 0)) {
          const names = participantsParam.split(',').map(s => s.trim()).filter(Boolean);
          if (names.length) {
            try {
              const { characterRepository } = await import('../repositories/characterRepository');
              const resolveByName = async (n) => {
                try { const exact = await characterRepository.getByName?.(n); if (exact) return exact.id; } catch {}
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
              if (ids.length) convWithParticipants = { ...conv, participants: ids };
            } catch {}
          }
        }
        // 2) If still missing participants, derive from message metadata (support legacy keys)
        if ((!convWithParticipants.participants || convWithParticipants.participants.length === 0) && Array.isArray(convWithParticipants.messages)) {
          const ids = Array.from(new Set(
            convWithParticipants.messages
              .map(m => (
                m?.metadata?.speakerCharacterId ??
                m?.metadata?.speaker_id ??
                m?.metadata?.speakerId
              ))
              .filter(Boolean)
          ));
          if (ids.length) {
            convWithParticipants = { ...convWithParticipants, participants: ids };
          }
        }
        if (typeof hydrateFromConversation === 'function') {
          await hydrateFromConversation(convWithParticipants);
        }
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Measure header + lead banner to prevent overlap (robust to late insertions)
  useEffect(() => {
    const measure = () => {
      try {
        const headerEl = document.querySelector('header');
        const fixedHeaderH = headerEl ? headerEl.getBoundingClientRect().height : 64;
        const h = headerRef.current?.offsetHeight || 96;
        const banner = document.getElementById('lead-banner');
        let top = fixedHeaderH + 8; // default under header
        if (banner) {
          const rect = banner.getBoundingClientRect();
          const belowBanner = Math.max(0, rect.bottom + 8);
          top = Math.max(top, belowBanner);
        }
        setStickyTop(top);
        const cushion = window.innerWidth < 768 ? 40 : 56;
        setHeaderPad(h + cushion);
      } catch {}
    };

    // Initial + staged re-measurements
    measure();
    const t1 = setTimeout(measure, 100);
    const t2 = setTimeout(measure, 400);

    // Short RAF sampling window to catch animated header/menu and late banner mount
    let rafId;
    let frames = 0;
    const sample = () => {
      measure();
      if (frames++ < 120) rafId = requestAnimationFrame(sample); // ~2s at 60fps
    };
    rafId = requestAnimationFrame(sample);

    // Respond to viewport changes
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure);

    // Observe DOM for banner insertion/removal and header mutations
    let bodyObserver;
    let bannerObserver;
    try {
      if ('MutationObserver' in window) {
        bodyObserver = new MutationObserver(() => {
          measure();
          const b = document.getElementById('lead-banner');
          if (b && !bannerObserver) {
            bannerObserver = new MutationObserver(measure);
            bannerObserver.observe(b, { attributes: true, childList: true, subtree: true });
          }
        });
        bodyObserver.observe(document.body, { childList: true, subtree: true });

        const headerEl = document.querySelector('header');
        if (headerEl) {
          const headerObserver = new MutationObserver(measure);
          headerObserver.observe(headerEl, { attributes: true, childList: true, subtree: true });
        }
      }
    } catch {}

    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure);
      clearTimeout(t1);
      clearTimeout(t2);
      if (rafId) cancelAnimationFrame(rafId);
      bodyObserver?.disconnect();
      bannerObserver?.disconnect();
    };
  }, []);

  // Keep isSharedView in sync if URL changes
  useEffect(() => {
    const onPop = () => {
      try { setIsSharedView(new URLSearchParams(window.location.search).get('shared') === '1'); } catch {}
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  
  // Auto-start the first round if the flag was set during setup
  useEffect(() => {
    if (participants && participants.length > 0) {
      const shouldStart =
        typeof consumeAutoStartFlag === 'function'
          ? consumeAutoStartFlag()
          : false;
      if (shouldStart) {
        // Mark as kicked to prevent fallback from triggering a second time
        autoKickedRef.current = true;
        advanceRound();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participants]);

  // Fallback auto-start: if we land on a conversation with no assistant
  // messages yet (freshly created) and not in shared view, kick off one round.
  useEffect(() => {
    if (isSharedView) return;
    if (autoKickedRef.current) return;
    if (!conversationId) return;
    const hasAssistant = Array.isArray(messages) && messages.some(m => m.role === 'assistant');
    if (!hasAssistant && Array.isArray(participants) && participants.length > 0) {
      autoKickedRef.current = true;
      advanceRound();
    }
  }, [conversationId, participants?.length, messages?.length, isSharedView]);

  // Handle message submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    await sendUserMessage(inputValue);
    setInputValue('');
  };
  
  // Handle advance round
  const handleAdvanceRound = async () => {
    await advanceRound();
  };
  
  // Normalize content (strip accidental JSON wrapper and redundant speaker names)
  const normalizeContent = (raw, speakerName) => {
    if (raw == null) return raw;
    let txt = String(raw).trim();

    // Strip code fences
    const fence = txt.match(/```(?:json|javascript)?\n([\s\S]*?)```/i);
    if (fence && fence[1]) {
      txt = fence[1].trim();
    }

    // Attempt to parse JSON wrappers
    try {
      if (txt.startsWith('{') || txt.startsWith('[')) {
        const parsed = JSON.parse(txt);
        if (parsed) {
          if (typeof parsed.content === 'string') return parsed.content;
          if (Array.isArray(parsed)) {
            const item = parsed.find(m => typeof m?.content === 'string') || null;
            if (item) return item.content;
          }
          // Fallback: look for "content": "..." pattern
          const m = txt.match(/"content"\s*:\s*"([\s\S]*?)"/);
          if (m && m[1]) {
            try { return JSON.parse(`"${m[1]}"`); } catch { return m[1]; }
          }
        }
      }
    } catch { /* ignore */ }

    // Strip any known participant name prefixes (e.g., "Isaiah:", "Jesus – ")
    try {
      const backfill = (() => { try { return window.__rt_backfill || []; } catch { return []; } })();
      const names = [
        ...(Array.isArray(participants) ? participants.map(p => p.name) : []),
        ...backfill.map(p => p.name)
      ].filter(Boolean);
      const patterns = [];
      for (const n of names) {
        patterns.push(new RegExp(`^\n?\s*${n}\s*[:\-–—]\s+`, 'i'));
      }
      if (speakerName) {
        patterns.push(new RegExp(`^\n?\s*${speakerName}\s*[:\-–—]\s+`, 'i'));
      }
      for (const rx of patterns) {
        if (rx.test(txt)) {
          txt = txt.replace(rx, '');
          break;
        }
      }
    } catch { /* ignore */ }

    return txt;
  };

  const normalizeId = (v) => v == null ? null : String(v);
  // Find character by ID (normalize to strings for robust compare)
  const getCharacterById = (id) => {
    const nid = normalizeId(id);
    const found = participants.find(p => normalizeId(p.id) === nid);
    if (found) return found;
    try {
      const fallback = (window.__rt_backfill || []).find(p => normalizeId(p.id) === nid);
      return fallback || null;
    } catch { return null; }
  };

  // Helper: parse leading name prefix
  const parseNamePrefix = (content) => {
    if (typeof content !== 'string') return null;
    const m = content.match(/^\s*([A-Z][A-Za-z\s\-']{1,40})\s*[:\-–—]\s+/);
    return m ? m[1] : null;
  };

  // Backfill participants from message metadata when missing (e.g., older shared conversations)
  useEffect(() => {
    (async () => {
      try {
        if (participants && participants.length > 0) return;
        if (!Array.isArray(messages) || messages.length === 0) return;
        // Collect unique speaker ids from metadata
        const ids = Array.from(new Set(
          messages
            .map(m => (
              m?.metadata?.speakerCharacterId ??
              m?.metadata?.speaker_id ??
              m?.metadata?.speakerId
            ))
            .filter(Boolean)
        ));
        const { characterRepository } = await import('../repositories/characterRepository');
        if (ids.length > 0) {
          const fetched = await Promise.all(ids.map(id => characterRepository.getById(id)));
          const valid = fetched.filter(Boolean);
          if (valid.length > 0) {
            try { window.__rt_backfill = valid; } catch {}
            const map = Object.fromEntries(valid.map(v => [String(v.name).toLowerCase(), v.id]));
            setNameMap(map);
            return;
          }
        }
        // Fallback: derive names from prefixes and fetch by name
        const names = Array.from(new Set(
          messages
            .filter(m => m.role === 'assistant' && typeof m.content === 'string')
            .map(m => parseNamePrefix(m.content))
            .filter(Boolean)
        ));
        if (names.length > 0) {
          const fetchedByName = await Promise.all(names.map(n => characterRepository.getByName?.(n)));
          const validByName = (fetchedByName || []).filter(Boolean);
          if (validByName.length > 0) {
            try { window.__rt_backfill = validByName; } catch {}
            const map = Object.fromEntries(validByName.map(v => [String(v.name).toLowerCase(), v.id]));
            setNameMap(map);
          }
        }
      } catch {
        /* ignore */
      }
    })();
  }, [participants?.length, messages?.length]);
  
  // Clear error on click
  const handleClearError = () => {
    if (clearError) clearError();
  };
  
  return (
    _jsxs("div", {
      className: "min-h-screen bg-gradient-to-b from-blue-950 via-indigo-900 to-indigo-800 py-6 px-4 md:px-6",
      children: [
        _jsxs("div", {
          className: "max-w-4xl mx-auto bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/15 shadow-xl",
          children: [
            // Header with topic and participants
            _jsxs("div", {
              ref: headerRef,
              className: `z-20 mb-4 -mx-4 md:-mx-6 px-4 md:px-6 pt-2 pb-3 bg-white/10 backdrop-blur-sm border-b border-white/10 rounded-t-2xl`,
              style: undefined,
              children: [
                /* Home link */
                _jsx("div", {
                  className: "mb-2",
                  children: _jsxs(Link, {
                    to: "/?view=characters",
                    className: "inline-flex items-center text-blue-100 hover:text-yellow-300 text-sm",
                    children: [
                      _jsx("svg", {
                        xmlns: "http://www.w3.org/2000/svg",
                        className: "h-4 w-4 mr-1",
                        viewBox: "0 0 20 20",
                        fill: "currentColor",
                        children: _jsx("path", {
                          fillRule: "evenodd",
                          d: "M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z",
                          clipRule: "evenodd"
                        })
                      }),
                      "Home"
                    ]
                  })
                }),
                _jsx("h1", {
                  className: "text-2xl md:text-3xl font-bold text-center text-yellow-400 mb-2",
                  style: { fontFamily: 'Cinzel, serif' },
                  children: "Biblical Roundtable"
                }),
                _jsx("p", {
                  className: "text-white/90 text-center font-medium mb-4",
                  children: topic
                }),
                
                // Participants avatars
                _jsx("div", {
                  className: "flex flex-wrap justify-center gap-3 mb-4",
                  children: participants.map(participant => (
                    _jsxs("div", {
                      className: "flex flex-col items-center",
                      children: [
                        _jsx("div", {
                          className: "w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 border-yellow-400/50",
                          children: _jsx("img", {
                            src: participant.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(participant.name)}&background=random`,
                            alt: participant.name,
                            className: "w-full h-full object-cover",
                            style: { objectPosition: 'center 8%' }
                          })
                        }),
                        _jsx("span", {
                          className: "text-white text-xs mt-1 text-center",
                          children: participant.name
                        })
                      ]
                    }, participant.id)
                  ))
                }),
                
                // Controls
                _jsxs("div", {
                  className: "flex justify-center gap-3 md:gap-4 mb-4 flex-wrap",
                  children: [
                    _jsx("button", {
                      onClick: () => navigate('/roundtable/setup'),
                      className: "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors bg-yellow-400 hover:bg-yellow-500 text-blue-900",
                      children: "New Roundtable"
                    }),
                    _jsx("button", {
                      onClick: handleAdvanceRound,
                      disabled: isTyping || isSharedView,
                      className: `px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        (isTyping || isSharedView)
                          ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                          : 'bg-yellow-400 hover:bg-yellow-500 text-blue-900'
                      }`,
                      children: isTyping ? "Characters Responding..." : "Advance Round"
                    }),
                    _jsx("button", {
                      onClick: async () => {
                        try {
                          const lines = [];
                          if (topic) lines.push(`Roundtable: ${topic}`);
                          const names = (participants && participants.length)
                            ? participants.map(p => p.name)
                            : (Array.isArray(window.__rt_backfill) ? window.__rt_backfill.map(p => p.name) : []);
                          if (names.length) lines.push(`Participants: ${names.join(', ')}`);
                          if (lines.length) lines.push('');
                          const norm = (raw, n) => normalizeContent(raw, n);
                          const resolveSpeakerName = (message) => {
                            let speakerId = message?.metadata?.speakerCharacterId;
                            let speaker = speakerId ? getCharacterById(speakerId) : null;
                            if (speaker) return speaker.name;
                            if (message?.metadata?.speakerName) return message.metadata.speakerName;
                            const nm = parseNamePrefix(message?.content);
                            return nm || 'Unknown';
                          };
                          for (const m of messages) {
                            if (m.role === 'system') continue;
                            if (m.role === 'user') {
                              lines.push(`You: ${m.content}`);
                            } else {
                              const nm = resolveSpeakerName(m);
                              lines.push(`${nm}: ${norm(m.content, nm)}`);
                            }
                          }
                          const text = lines.join('\n');
                          await navigator.clipboard.writeText(text);
                        } catch (e) {
                          console.error('Failed to copy conversation:', e);
                        }
                      },
                      className: "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors bg-yellow-400 hover:bg-yellow-500 text-blue-900",
                      children: "Copy Transcript"
                    }),
                    _jsx("button", {
                      onClick: async () => {
                        try {
                          if (!conversationId) return;
                          const res = await (await import('../services/chatInvitesService')).createChatInvite(conversationId);
                          if (res.error || !res.data) return;
                          const url = `${window.location.origin}/join/${res.data.code}`;
                          const title = `Join Roundtable: ${topic || 'Discussion'}`;
                          const text = `Join this roundtable on "${topic}"`;
                          if (navigator.share) {
                            try { await navigator.share({ title, text, url }); return; } catch {}
                          }
                          await navigator.clipboard.writeText(url);
                        } catch (e) {
                          console.error('Failed to create invite:', e);
                        }
                      },
                      className: "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors bg-yellow-400 hover:bg-yellow-500 text-blue-900",
                      children: "Invite"
                    }),
                    _jsx("button", {
                      onClick: async () => {
                        try {
                          if (!conversationId) return;
                          const shareCode = await shareConversation?.(conversationId);
                          if (!shareCode) return;
                          // Include participants in the share URL so shared views can hydrate names/avatars
                          const names = (participants && participants.length)
                            ? participants.map(p => p.name)
                            : (Array.isArray(window.__rt_backfill) ? window.__rt_backfill.map(p => p.name) : []);
                          const qp = (names && names.length)
                            ? `?participants=${encodeURIComponent(names.join(','))}`
                            : '';
                          const url = `${window.location.origin}/shared/${shareCode}${qp}`;
                          const title = `Roundtable: ${topic || 'Discussion'}`;
                          const text = `Join this roundtable on \"${topic}\"`;
                          if (navigator.share) {
                            try {
                              await navigator.share({ title, text, url });
                              return;
                            } catch {/* fallthrough */}
                          }
                          await navigator.clipboard.writeText(url);
                        } catch (e) {
                          console.error('Failed to share roundtable:', e);
                        }
                      },
                      className: "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors bg-yellow-400 hover:bg-yellow-500 text-blue-900",
                      children: "Share"
                    })
                  ]
                })
              ]
            }),
            
            // Error message
            error && (
              _jsx("div", {
                className: "bg-red-500/20 border border-red-500/50 text-white rounded-lg p-3 mb-4 cursor-pointer",
                onClick: handleClearError,
                children: error
              })
            ),
            
            // Spacer not needed (header is no longer sticky)
            null,

            // Transcript
            _jsxs("div", {
              ref: transcriptRef,
              className: "bg-white/5 backdrop-blur-sm rounded-xl p-4 mb-4 h-[50vh] md:h-[60vh] overflow-y-auto",
              children: [
                messages.length === 0 ? (
                  _jsxs("div", {
                    className: "flex flex-col items-center justify-center h-full text-white/80 text-center gap-4",
                    children: [
                      _jsx("div", {
                        className: "text-white/70",
                        children: (participants && participants.length > 0)
                          ? "The roundtable will begin when you send a message or advance the round."
                          : "No roundtable is active yet. Start one to begin the discussion."
                      }),
                      _jsx("button", {
                        onClick: () => navigate('/roundtable/setup'),
                        className: "px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-yellow-400 hover:bg-yellow-500 text-blue-900",
                        children: "Start a Roundtable"
                      })
                    ]
                  })
                ) : (
                  _jsxs(_Fragment, {
                    children: [
                      messages.map((message, index) => {
                        // Skip system messages
                        if (message.role === 'system') return null;
                        
                        // User message
                        if (message.role === 'user') {
                          return (
                            _jsx("div", {
                              className: "flex justify-end mb-4",
                              children: _jsx("div", {
                                className: "bg-blue-600/70 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-[80%] shadow-md",
                                children: message.content
                              })
                            }, message.id || `user-msg-${index}`)
                          );
                        }
                        
                        // Assistant message (character speaking)
                        let speakerId = (
                          message?.metadata?.speakerCharacterId ??
                          message?.metadata?.speaker_id ??
                          message?.metadata?.speakerId
                        );
                        let speaker = speakerId ? getCharacterById(speakerId) : null;
                        if (!speaker) {
                          // Prefer explicitly derived speakerName from metadata when id is missing
                          const metaName = message?.metadata?.speakerName;
                          if (metaName) {
                            speaker = { name: metaName };
                          } else {
                            const nm = parseNamePrefix(message.content);
                            if (nm) {
                              const id = nameMap[nm.toLowerCase()] || null;
                              if (id) speaker = getCharacterById(id);
                              if (!speaker) speaker = { name: nm };
                            }
                          }
                        }
                        
                        return (
                          _jsxs("div", {
                            className: "flex gap-3 mb-4",
                            children: [
                              // Speaker avatar
                              _jsx("div", {
                                className: "flex-shrink-0",
                                children: _jsx("div", {
                                  className: "w-10 h-10 rounded-full overflow-hidden border border-white/30",
                                  children: speaker ? (
                                    _jsx("img", {
                                      src: speaker.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(speaker.name)}&background=random`,
                                      alt: speaker.name,
                                      className: "w-full h-full object-cover",
                                      style: { objectPosition: 'center 8%' }
                                    })
                                  ) : (
                                    _jsx("div", {
                                      className: "w-full h-full bg-gray-600 flex items-center justify-center text-white text-xs",
                                      children: "?"
                                    })
                                  )
                                })
                              }),
                              
                              // Message content
                              _jsxs("div", {
                                className: "flex-1",
                                children: [
                                  _jsx("div", {
                                    className: "text-yellow-300 text-sm font-medium mb-1",
                                    children: speaker ? speaker.name : "Unknown"
                                  }),
                                  _jsx("div", {
                                    className: "bg-white/10 text-white rounded-2xl rounded-tl-none px-4 py-3 shadow-md",
                                    children: normalizeContent(message.content, speaker?.name) || (
                                      _jsx("span", {
                                        className: "text-white/50 italic",
                                        children: "Thinking..."
                                      })
                                    )
                                  })
                                ]
                              })
                            ]
                          }, message.id || `assistant-msg-${index}`)
                        );
                      }),
                      
                      // Typing indicator
                      isTyping && (
                        _jsxs("div", {
                          className: "flex items-center gap-2 text-white/70 mt-2",
                          children: [
                            _jsx("div", {
                              className: "w-2 h-2 rounded-full bg-yellow-400 animate-pulse"
                            }),
                            _jsx("div", {
                              className: "w-2 h-2 rounded-full bg-yellow-400 animate-pulse delay-100"
                            }),
                            _jsx("div", {
                              className: "w-2 h-2 rounded-full bg-yellow-400 animate-pulse delay-200"
                            }),
                            _jsx("span", {
                              className: "text-sm",
                              children: "Characters are responding..."
                            })
                          ]
                        })
                      ),
                      
                      // Invisible element for scrolling
                      _jsx("div", {
                        ref: messagesEndRef
                      })
                    ]
                  })
                )
              ]
            }),
            
            // Message input
            _jsx("form", {
              onSubmit: handleSubmit,
              className: "flex gap-2",
              children: [
                _jsx("input", {
                  type: "text",
                  value: inputValue,
                  onChange: (e) => setInputValue(e.target.value),
                  placeholder: "Type your message...",
                  disabled: isTyping || isSharedView,
                  className: `flex-1 bg-white/10 border border-white/30 rounded-full py-3 px-4 text-white placeholder-blue-100/70 
                    focus:outline-none focus:ring-2 focus:ring-yellow-400/50
                    ${(isTyping || isSharedView) ? 'opacity-50 cursor-not-allowed' : ''}
                  `
                }),
                _jsx("button", {
                  type: "submit",
                  disabled: isTyping || !inputValue.trim() || isSharedView,
                  className: `px-4 py-2 rounded-full transition-colors flex items-center justify-center
                    ${(isTyping || !inputValue.trim() || isSharedView)
                      ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                      : 'bg-yellow-400 hover:bg-yellow-500 text-blue-900'}
                  `,
                  children: _jsx("svg", {
                    xmlns: "http://www.w3.org/2000/svg",
                    className: "h-5 w-5",
                    viewBox: "0 0 20 20",
                    fill: "currentColor",
                    children: _jsx("path", {
                      d: "M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"
                    })
                  })
                })
              ]
            })
          ]
        }),
        _jsx(Footer, {})
      ]
    })
  );
};

export default RoundtableChat;
