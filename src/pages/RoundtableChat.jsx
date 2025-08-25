import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRoundtable } from '../contexts/RoundtableContext';
import Footer from '../components/Footer';

const RoundtableChat = () => {
  const navigate = useNavigate();
  const {
    participants,
    topic,
    messages,
    isTyping,
    sendUserMessage,
    advanceRound,
    error,
    clearError,
    // Optional helper (may be undefined in older context versions)
    consumeAutoStartFlag
  } = useRoundtable();
  
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const transcriptRef = useRef(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Redirect to setup if no participants
  useEffect(() => {
    if (!participants || participants.length === 0) {
      navigate('/roundtable/setup');
    }
  }, [participants, navigate]);
  
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
  
  // Find character by ID
  const getCharacterById = (id) => {
    return participants.find(p => p.id === id);
  };
  
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
              className: "sticky top-16 md:top-20 z-10 mb-4 -mx-4 md:-mx-6 px-4 md:px-6 pt-2 pb-3 bg-white/10 backdrop-blur-sm border-b border-white/10 rounded-t-2xl",
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
                  className: "flex justify-center gap-4 mb-4",
                  children: [
                    _jsx("button", {
                      onClick: () => navigate('/roundtable/setup'),
                      className: "px-3 py-1.5 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors",
                      children: "New Roundtable"
                    }),
                    _jsx("button", {
                      onClick: handleAdvanceRound,
                      disabled: isTyping,
                      className: `px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isTyping
                          ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                          : 'bg-yellow-400 hover:bg-yellow-500 text-blue-900'
                      }`,
                      children: isTyping ? "Characters Responding..." : "Advance Round"
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
                                    children: message.content || (
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
                  disabled: isTyping,
                  className: `flex-1 bg-white/10 border border-white/30 rounded-full py-3 px-4 text-white placeholder-blue-100/70 
                    focus:outline-none focus:ring-2 focus:ring-yellow-400/50
                    ${isTyping ? 'opacity-50 cursor-not-allowed' : ''}
                  `
                }),
                _jsx("button", {
                  type: "submit",
                  disabled: isTyping || !inputValue.trim(),
                  className: `px-4 py-2 rounded-full transition-colors flex items-center justify-center
                    ${isTyping || !inputValue.trim()
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
