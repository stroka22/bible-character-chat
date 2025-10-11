import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRoundtable } from '../contexts/RoundtableContext';
import { useConversation } from '../contexts/ConversationContext.jsx';
import Footer from '../components/Footer';

const RoundtableChat = () => {
  const navigate = useNavigate();
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
    consumeAutoStartFlag
  } = useRoundtable();
  const { shareConversation } = useConversation();
  
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const transcriptRef = useRef(null);
  const headerRef = useRef(null);
  const [headerPad, setHeaderPad] = useState(128);
  const [stickyTop, setStickyTop] = useState(96);
  const [isSharedView, setIsSharedView] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get('shared') === '1';
    } catch { return false; }
  });
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Redirect to setup if no participants
  useEffect(() => {
    // For shared views, never redirect to setup
    if (isSharedView) return;
    // Only redirect to setup if there are no participants AND no messages
    if ((!participants || participants.length === 0) && (!messages || messages.length === 0)) {
      navigate('/roundtable/setup');
    }
  }, [participants, messages, navigate, isSharedView]);
  
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
        advanceRound();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participants]);

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
    try {
      if (typeof raw === 'string' && raw.trim().startsWith('{')) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.content === 'string') {
          raw = parsed.content;
        }
      }
    } catch {/* ignore parse errors */}
    if (typeof raw === 'string') {
      // Strip any known participant name prefixes (e.g., "Isaiah: ", "Jesus: ")
      const names = Array.isArray(participants) ? participants.map(p => p.name).filter(Boolean) : [];
      for (const name of names) {
        const px = `${name}: `;
        if (raw.startsWith(px)) {
          raw = raw.slice(px.length);
          break;
        }
      }
    }
    return raw;
  };

  // Find character by ID
  const getCharacterById = (id) => {
    const found = participants.find(p => p.id === id);
    if (found) return found;
    try {
      const fallback = (window.__rt_backfill || []).find(p => p.id === id);
      return fallback || null;
    } catch { return null; }
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
            .map(m => m?.metadata?.speakerCharacterId)
            .filter(Boolean)
        ));
        if (ids.length === 0) return;
        const { characterRepository } = await import('../repositories/characterRepository');
        const fetched = await Promise.all(ids.map(id => characterRepository.getById(id)));
        const valid = fetched.filter(Boolean);
        if (valid.length > 0) {
          // We do not have direct setter here; rely on RoundtableContext.hydration normally.
          // As a fallback for shared view, temporarily map names for display by mutating a local ref
          // but since participants come from context, we cannot set it here. Instead, we attach
          // a minimal map via window for RoundtableContext to possibly consume in future updates.
          try { window.__rt_backfill = valid; } catch {}
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
              className: "sticky z-20 mb-4 -mx-4 md:-mx-6 px-4 md:px-6 pt-2 pb-3 bg-white/10 backdrop-blur-sm border-b border-white/10 rounded-t-2xl",
              style: { top: stickyTop },
              children: [
                /* Home link */
                _jsx("div", {
                  className: "mb-2",
                  children: _jsxs(Link, {
                    to: "/",
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
                            className: "w-full h-full object-cover"
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
                          if (!conversationId) return;
                          const shareCode = await shareConversation?.(conversationId);
                          if (!shareCode) return;
                          const url = `${window.location.origin}/shared/${shareCode}`;
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
            
            // Spacer to keep content below sticky header
            _jsx("div", { "aria-hidden": true, style: { height: headerPad } }),

            // Transcript
            _jsxs("div", {
              ref: transcriptRef,
              className: "bg-white/5 backdrop-blur-sm rounded-xl p-4 mb-4 h-[50vh] md:h-[60vh] overflow-y-auto",
              children: [
                messages.length === 0 ? (
                  _jsx("div", {
                    className: "flex items-center justify-center h-full text-white/50 text-center",
                    children: "The roundtable discussion will begin when you send a message or advance the round."
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
                        const speakerId = message.metadata?.speakerCharacterId;
                        const speaker = speakerId ? getCharacterById(speakerId) : null;
                        
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
                                      className: "w-full h-full object-cover"
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
