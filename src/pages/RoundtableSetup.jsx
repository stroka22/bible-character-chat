import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { characterRepository } from '../repositories/characterRepository';
import { useRoundtable } from '../contexts/RoundtableContext';
import Footer from '../components/Footer';
import { usePremium } from '../hooks/usePremium';
import UpgradeModal from '../components/modals/UpgradeModal';
import { getSettings as getTierSettings } from '../services/tierSettingsService';

const RoundtableSetup = () => {
  const navigate = useNavigate();
  const { startRoundtable, advanceRound } = useRoundtable();
  const { isPremium } = usePremium();
  
  // State
  const [characters, setCharacters] = useState([]);
  const [selectedCharacterIds, setSelectedCharacterIds] = useState([]);
  const [topic, setTopic] = useState('');
  const [repliesPerRound, setRepliesPerRound] = useState(3);
  const [premiumGates, setPremiumGates] = useState({ repliesPerRoundMin: null });
  const [showUpgrade, setShowUpgrade] = useState(false);
  // Auto-start toggle
  const [autoStart, setAutoStart] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLetter, setCurrentLetter] = useState('all');
  
  // Fetch characters on mount
  useEffect(() => {
    const fetchCharacters = async () => {
      setIsLoading(true);
      try {
        // Get all non-hidden characters
        const data = await characterRepository.getAll(false);
        setCharacters(data);
        // Load premium gates (per-org)
        try {
          const ts = await getTierSettings();
          if (ts && ts.premiumRoundtableGates) setPremiumGates(ts.premiumRoundtableGates);
        } catch {}
      } catch (err) {
        console.error('Failed to fetch characters:', err);
        setError('Failed to load characters. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCharacters();
  }, []);
  
  // Handle character selection
  const handleToggleCharacter = (characterId) => {
    setSelectedCharacterIds(prev => {
      if (prev.includes(characterId)) {
        return prev.filter(id => id !== characterId);
      } else {
        return [...prev, characterId];
      }
    });
  };
  
  // Filter characters based on search query and letter
  const filteredCharacters = characters.filter(character => {
    // Search filter
    const matchesSearch = !searchQuery || 
      character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (character.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    // Letter filter
    const matchesLetter = currentLetter === 'all' || 
      character.name.toUpperCase().startsWith(currentLetter);
    
    return matchesSearch && matchesLetter;
  }).sort((a, b) => a.name.localeCompare(b.name));
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedCharacterIds.length === 0) {
      setError('Please select at least one character for the roundtable');
      return;
    }
    
    if (!topic.trim()) {
      setError('Please provide a topic for the roundtable');
      return;
    }
    
    // Check if roundtables require premium
    if (!isPremium && premiumGates?.premiumOnly !== false) {
      setShowUpgrade(true);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const newId = await startRoundtable({
        participantIds: selectedCharacterIds,
        topic,
        repliesPerRound,
        autoStart
      });
      
      if (newId) {
        // Navigate directly to the Roundtable UI so we retain
        // in-memory participants and settings without relying on
        // DB hydration before any messages exist.
        const qp = new URLSearchParams();
        qp.set('conv', newId);
        navigate(`/roundtable?${qp.toString()}`);
      } else {
        setError('Failed to start roundtable. Please try again.');
      }
    } catch (err) {
      console.error('Error starting roundtable:', err);
      setError(`Failed to start roundtable: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  if (isLoading && characters.length === 0) {
    return (
      _jsx("div", {
        className: "min-h-screen bg-gradient-to-b from-blue-950 via-indigo-900 to-indigo-800 py-10 px-4 md:px-6",
        children: _jsxs("div", {
          className: "max-w-4xl mx-auto bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/15 shadow-xl",
          children: [
            _jsx("h1", {
              className: "text-3xl md:text-4xl font-bold text-center text-yellow-400 mb-6",
              style: { fontFamily: 'Cinzel, serif' },
              children: "Setting Up Roundtable"
            }),
            _jsxs("div", {
              className: "flex justify-center items-center py-12",
              children: [
                _jsx("div", {
                  className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"
                }),
                _jsx("span", {
                  className: "ml-3 text-white",
                  children: "Loading characters..."
                })
              ]
            })
          ]
        })
      })
    );
  }
  
  return (
    _jsxs("div", {
      className: "min-h-screen bg-gradient-to-b from-blue-950 via-indigo-900 to-indigo-800 py-10 px-4 md:px-6",
      children: [
        _jsx("div", {
          className: "max-w-4xl mx-auto bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/15 shadow-xl",
          children: _jsxs("form", {
            onSubmit: handleSubmit,
            className: "space-y-6",
            children: [
              _jsx("h1", {
                className: "text-3xl md:text-4xl font-bold text-center text-yellow-400 mb-6",
                style: { fontFamily: 'Cinzel, serif' },
                children: "Create a Biblical Roundtable"
              }),
              
              _jsx("p", {
                className: "text-white/80 text-center mb-8",
                children: "Select multiple biblical figures to discuss a topic together. They will respond to each other and to your messages."
              }),
              
              // Error message
              error && (
                _jsx("div", {
                  className: "bg-red-500/20 border border-red-500/50 text-white rounded-lg p-3 mb-4",
                  children: error
                })
              ),
              
              // Topic input
              _jsxs("div", {
                className: "mb-6",
                children: [
                  _jsx("label", {
                    htmlFor: "topic",
                    className: "block text-yellow-300 font-medium mb-2",
                    children: "Discussion Topic"
                  }),
                  _jsx("input", {
                    type: "text",
                    id: "topic",
                    value: topic,
                    onChange: (e) => setTopic(e.target.value),
                    placeholder: "e.g., The nature of faith, Forgiveness, God's plan for humanity...",
                    className: "w-full bg-white/10 border border-white/30 rounded-lg py-3 px-4 text-white placeholder-blue-100/70 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                  })
                ]
              }),
              
              // Replies per round
              _jsxs("div", {
                className: "mb-6",
                children: [
                  _jsxs("label", {
                    htmlFor: "repliesPerRound",
                    className: "block text-yellow-300 font-medium mb-2",
                    children: [
                      "Replies per Round: ",
                      _jsx("span", {
                        className: "text-white font-bold",
                        children: repliesPerRound
                      })
                    ]
                  }),
                  _jsxs("div", {
                    className: "flex items-center gap-4",
                    children: [
                      _jsx("span", {
                        className: "text-white/70 text-sm",
                        children: "1"
                      }),
                      _jsx("input", {
                        type: "range",
                        id: "repliesPerRound",
                        min: "1",
                        max: "5",
                        value: repliesPerRound,
                        onChange: (e) => {
                          const next = parseInt(e.target.value);
                          const gate = premiumGates?.repliesPerRoundMin;
                          if (!isPremium && gate != null && next > gate) {
                            setShowUpgrade(true);
                            setRepliesPerRound(gate);
                          } else {
                            setRepliesPerRound(next);
                          }
                        },
                        className: "flex-1 accent-yellow-400"
                      }),
                      _jsx("span", {
                        className: "text-white/70 text-sm",
                        children: "5"
                      })
                    ]
                  }),
                  _jsx("p", {
                    className: "text-white/60 text-sm mt-1",
                    children: "How many characters will respond in each round. If you select fewer characters than this number, all characters will respond."
                  })
                ]
              }),
              
              /* Auto-start toggle */
              _jsxs("div", {
                className: "mb-6 flex items-center gap-3",
                children: [
                  _jsx("input", {
                    type: "checkbox",
                    id: "autoStart",
                    checked: autoStart,
                    onChange: (e) => setAutoStart(e.target.checked),
                    className: "h-5 w-5 rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                  }),
                  _jsxs("label", {
                    htmlFor: "autoStart",
                    className: "text-yellow-300 font-medium select-none",
                    children: [
                      "Auto-start discussion ",
                      _jsx("span", {
                        className: "text-white/70 text-sm",
                        children: "(begins immediately after creation)"
                      })
                    ]
                  })
                ]
              }),

              // Character selection
              _jsxs("div", {
                className: "mb-6",
                children: [
                  _jsxs("div", {
                    className: "flex justify-between items-center mb-2",
                    children: [
                      _jsxs("label", {
                        className: "block text-yellow-300 font-medium",
                        children: [
                          "Select Characters ",
                          _jsxs("span", {
                            className: "text-white/70 text-sm",
                            children: [
                              "(",
                              selectedCharacterIds.length,
                              " selected)"
                            ]
                          })
                        ]
                      }),
                      selectedCharacterIds.length > 0 && (
                        _jsx("button", {
                          type: "button",
                          onClick: () => setSelectedCharacterIds([]),
                          className: "text-sm text-blue-300 hover:text-blue-200",
                          children: "Clear All"
                        })
                      )
                    ]
                  }),
                  
                  // Search input
                  _jsx("div", {
                    className: "mb-4",
                    children: _jsx("input", {
                      type: "text",
                      value: searchQuery,
                      onChange: (e) => setSearchQuery(e.target.value),
                      placeholder: "Search characters...",
                      className: "w-full bg-white/10 border border-white/30 rounded-full py-2 px-4 text-white placeholder-blue-100/70 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                    })
                  }),
                  
                  // Alphabet selector
                  _jsx("div", {
                    className: "mb-4 flex flex-wrap gap-0.5 justify-center",
                    children: [
                      _jsx("button", {
                        key: "all",
                        type: "button",
                        onClick: () => setCurrentLetter('all'),
                        className: `px-1.5 py-1 rounded text-xs font-medium ${
                          currentLetter === 'all' 
                            ? 'bg-yellow-400 text-blue-900' 
                            : 'text-white/70 hover:bg-white/20'
                        }`,
                        children: "All"
                      }),
                      ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => 
                        _jsx("button", {
                          key: letter,
                          type: "button",
                          onClick: () => setCurrentLetter(letter),
                          className: `w-6 h-6 rounded flex items-center justify-center text-xs font-medium ${
                            currentLetter === letter 
                              ? 'bg-yellow-400 text-blue-900' 
                              : 'text-white/70 hover:bg-white/20'
                          }`,
                          children: letter
                        })
                      )
                    ]
                  }),
                  
                  // Character list
                  _jsx("div", {
                    className: "bg-white/5 backdrop-blur-sm rounded-xl p-4 max-h-96 overflow-y-auto",
                    children: filteredCharacters.length > 0 ? (
                      _jsx("ul", {
                        className: "divide-y divide-white/10",
                        children: filteredCharacters.map(character => (
                          _jsxs("li", {
                            className: "py-3 px-2 flex items-center gap-3 hover:bg-white/5 rounded-lg cursor-pointer",
                            onClick: () => handleToggleCharacter(character.id),
                            children: [
                              _jsx("input", {
                                type: "checkbox",
                                id: `character-${character.id}`,
                                checked: selectedCharacterIds.includes(character.id),
                                onChange: () => handleToggleCharacter(character.id),
                                className: "h-5 w-5 rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                              }),
                              _jsx("div", {
                                className: "w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-white/30",
                                children: _jsx("img", {
                                  src: character.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=random`,
                                  alt: character.name,
                                  className: "w-full h-full object-cover",
                                  style: { objectPosition: 'center 0%' }
                                })
                              }),
                              _jsxs("div", {
                                className: "flex-1",
                                children: [
                                  _jsx("h3", {
                                    className: "text-white font-medium",
                                    children: character.name
                                  }),
                                  _jsx("p", {
                                    className: "text-white/70 text-sm line-clamp-1",
                                    children: character.description || character.scriptural_context || "Biblical figure"
                                  })
                                ]
                              })
                            ]
                          }, character.id)
                        ))
                      })
                    ) : (
                      _jsx("div", {
                        className: "text-center py-8 text-white/70",
                        children: "No characters found matching your search."
                      })
                    )
                  })
                ]
              }),
              
              // Submit button
              _jsx("div", {
                className: "flex justify-center mt-8",
                children: _jsx("button", {
                  type: "submit",
                  disabled: isLoading || selectedCharacterIds.length === 0 || !topic.trim(),
                  className: `
                    px-8 py-3 rounded-lg font-medium text-lg transition-colors
                    ${isLoading || selectedCharacterIds.length === 0 || !topic.trim()
                      ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                      : 'bg-yellow-400 hover:bg-yellow-500 text-blue-900'}
                  `,
                  children: isLoading ? "Setting up..." : "Start Roundtable"
                })
              })
            ]
          })
        }),
        _jsx(Footer, {})
        ,
        _jsx(UpgradeModal, { isOpen: showUpgrade, onClose: () => setShowUpgrade(false), limitType: 'roundtable', featureName: 'Roundtables' })
      ]
    })
  );
};

export default RoundtableSetup;
