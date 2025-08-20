import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { bibleStudiesRepository } from '../repositories/bibleStudiesRepository';
import { characterRepository } from '../repositories/characterRepository';
import { usePremium } from '../hooks/usePremium';
import UpgradeModal from '../components/modals/UpgradeModal';
import Footer from '../components/Footer';

const StudyLesson = () => {
  const { id, lessonIndex } = useParams();
  const navigate = useNavigate();
  const [study, setStudy] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [character, setCharacter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { isPremium } = usePremium();

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch the study
        const studyData = await bibleStudiesRepository.getStudyById(id);
        if (!studyData) {
          setError('Study not found');
          setIsLoading(false);
          return;
        }
        
        setStudy(studyData);
        
        // Check premium access
        if (studyData.is_premium && !isPremium) {
          setShowUpgrade(true);
          setIsLoading(false);
          return;
        }
        
        // Fetch the specific lesson
        const lessonData = await bibleStudiesRepository.getLessonByIndex(id, parseInt(lessonIndex, 10));
        if (!lessonData) {
          setError('Lesson not found');
          setIsLoading(false);
          return;
        }
        
        setLesson(lessonData);
        
        // Fetch character if available
        if (studyData.character_id) {
          const characterData = await characterRepository.getById(studyData.character_id);
          setCharacter(characterData);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching lesson data:', err);
        setError('Failed to load lesson. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id && lessonIndex !== undefined) {
      fetchLessonData();
    }
  }, [id, lessonIndex, isPremium]);

  const handleStartChat = () => {
    if (study?.is_premium && !isPremium) {
      setShowUpgrade(true);
      return;
    }
    
    if (character) {
      // Navigate to chat with query params for character and study context
      const queryParams = new URLSearchParams({
        character: character.id,
        study: id,
        lesson: lessonIndex
      }).toString();
      
      navigate(`/chat?${queryParams}`);
    }
  };

  return (
    _jsxs(_Fragment, {
      children: [
        /* Background gradient */
        _jsx("div", {
          className: "fixed inset-0 z-0 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700",
          children: _jsx("div", {
            className: "absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-200/20 via-transparent to-transparent opacity-30"
          })
        }),

        /* Main content */
        _jsx("div", {
          className: "relative z-10 min-h-screen pt-24 pb-16 px-4 md:px-6",
          children: _jsxs("div", {
            className: "max-w-4xl mx-auto",
            children: [
              /* Back button */
              _jsx("div", {
                className: "mb-6",
                children: _jsxs("button", {
                  onClick: () => navigate(`/studies/${id}`),
                  className: "flex items-center text-blue-100 hover:text-yellow-300 transition-colors",
                  children: [
                    _jsx("svg", {
                      xmlns: "http://www.w3.org/2000/svg",
                      className: "h-5 w-5 mr-1",
                      viewBox: "0 0 20 20",
                      fill: "currentColor",
                      children: _jsx("path", {
                        fillRule: "evenodd",
                        d: "M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z",
                        clipRule: "evenodd"
                      })
                    }),
                    "Back to Study"
                  ]
                })
              }),

              /* Loading state */
              isLoading && (
                _jsx("div", {
                  className: "flex justify-center items-center py-20",
                  children: _jsxs("div", {
                    className: "text-center",
                    children: [
                      _jsx("div", {
                        className: "inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"
                      }),
                      _jsx("p", {
                        className: "mt-4 text-blue-100",
                        children: "Loading lesson..."
                      })
                    ]
                  })
                })
              ),

              /* Error state */
              error && (
                _jsx("div", {
                  className: "bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center my-8",
                  children: _jsxs("div", {
                    children: [
                      _jsx("p", {
                        className: "text-red-300 mb-4",
                        children: error
                      }),
                      _jsx("button", {
                        onClick: () => navigate(`/studies/${id}`),
                        className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors",
                        children: "Return to Study"
                      })
                    ]
                  })
                })
              ),

              /* Lesson content */
              !isLoading && !error && study && lesson && (
                _jsxs("div", {
                  className: "mb-8",
                  children: [
                    /* Lesson header */
                    _jsxs("div", {
                      className: "bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/15 mb-6",
                      children: [
                        /* Title with lesson number */
                        _jsxs("h1", {
                          className: "text-3xl md:text-4xl font-extrabold text-yellow-400 mb-4 tracking-tight",
                          style: { fontFamily: 'Cinzel, serif' },
                          children: [
                            "Lesson ", parseInt(lessonIndex, 10) + 1, ": ", lesson.title
                          ]
                        }),

                        /* Study title */
                        _jsx("p", {
                          className: "text-blue-200 mb-6",
                          children: study.title
                        }),

                        /* Character guide */
                        character && (
                          _jsxs("div", {
                            className: "flex items-center mt-4",
                            children: [
                              _jsx("div", {
                                className: "w-12 h-12 rounded-full overflow-hidden border-2 border-yellow-400/50",
                                children: _jsx("img", {
                                  src: character.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=random`,
                                  alt: character.name,
                                  className: "w-full h-full object-cover"
                                })
                              }),
                              _jsxs("div", {
                                className: "ml-4",
                                children: [
                                  _jsx("p", {
                                    className: "text-sm text-blue-200",
                                    children: "Guided by"
                                  }),
                                  _jsx("p", {
                                    className: "text-yellow-300 font-semibold",
                                    children: character.name
                                  })
                                ]
                              })
                            ]
                          })
                        )
                      ]
                    }),

                    /* Scripture references */
                    lesson.scripture_refs && lesson.scripture_refs.length > 0 && (
                      _jsxs("div", {
                        className: "bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/15 mb-6",
                        children: [
                          _jsx("h2", {
                            className: "text-xl font-bold text-yellow-400 mb-4",
                            children: "Scripture References"
                          }),
                          _jsx("div", {
                            className: "flex flex-wrap gap-2",
                            children: lesson.scripture_refs.map((ref, index) => (
                              _jsx("span", {
                                className: "px-3 py-1 bg-blue-800/30 text-blue-100 rounded-full border border-blue-700/30",
                                children: ref
                              }, `ref-${index}`)
                            ))
                          })
                        ]
                      })
                    ),

                    /* Lesson summary */
                    _jsxs("div", {
                      className: "bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/15 mb-6",
                      children: [
                        _jsx("h2", {
                          className: "text-xl font-bold text-yellow-400 mb-4",
                          children: "Lesson Summary"
                        }),
                        _jsx("div", {
                          className: "prose prose-invert prose-yellow max-w-none",
                          children: _jsx("p", {
                            className: "text-blue-100",
                            children: lesson.summary || "No summary available for this lesson."
                          })
                        })
                      ]
                    }),

                    /* Chat with character button */
                    character && (
                      _jsx("div", {
                        className: "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 backdrop-blur-sm rounded-xl p-6 border border-yellow-500/30 text-center",
                        children: _jsxs("div", {
                          children: [
                            _jsx("h3", {
                              className: "text-xl font-bold text-yellow-300 mb-2",
                              children: "Ready to Explore This Lesson?"
                            }),
                            _jsx("p", {
                              className: "text-blue-100 mb-4",
                              children: `Start a conversation with ${character.name} to discuss this lesson and deepen your understanding.`
                            }),
                            _jsx("button", {
                              onClick: handleStartChat,
                              className: "px-6 py-3 bg-yellow-400 text-blue-900 font-medium rounded-lg hover:bg-yellow-300 transition-colors",
                              children: `Chat with ${character.name}`
                            })
                          ]
                        })
                      })
                    )
                  ]
                })
              ),

              /* Empty state */
              !isLoading && !error && (!study || !lesson) && (
                _jsx("div", {
                  className: "bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center my-8",
                  children: _jsxs("div", {
                    children: [
                      _jsx("h3", {
                        className: "text-2xl font-bold text-yellow-400 mb-4",
                        children: "Lesson Not Found"
                      }),
                      _jsx("p", {
                        className: "text-blue-100 mb-6",
                        children: "The lesson you're looking for doesn't exist or has been removed."
                      }),
                      _jsx(Link, {
                        to: "/studies",
                        className: "px-6 py-3 bg-yellow-400 text-blue-900 font-medium rounded-lg hover:bg-yellow-300 transition-colors",
                        children: "Browse Studies"
                      })
                    ]
                  })
                })
              )
            ]
          })
        }),

        /* Footer */
        _jsx(Footer, {}),

        /* Upgrade Modal */
        _jsx(UpgradeModal, {
          isOpen: showUpgrade,
          onClose: () => setShowUpgrade(false),
          message: "Upgrade to access premium Bible study lessons and learn from biblical characters."
        })
      ]
    })
  );
};

export default StudyLesson;
