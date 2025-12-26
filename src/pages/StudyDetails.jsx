import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { bibleStudiesRepository } from '../repositories/bibleStudiesRepository';
import { characterRepository } from '../repositories/characterRepository';
import { chatRepository } from '../repositories/chatRepository';
import { usePremium } from '../hooks/usePremium';
import { useAuth } from '../contexts/AuthContext';
import UpgradeModal from '../components/modals/UpgradeModal';
import Footer from '../components/Footer';
import FloatingHomeButton from '../components/layout/FloatingHomeButton';

const StudyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [study, setStudy] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [character, setCharacter] = useState(null);
  const [lessonCharacters, setLessonCharacters] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { isPremium } = usePremium();
  const [progress, setProgress] = useState(null);
  const [togglingLesson, setTogglingLesson] = useState(null);
  const [studyChats, setStudyChats] = useState([]);

  useEffect(() => {
    const fetchStudyDetails = async () => {
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
          // Still show details but will gate lesson access
        }
        
        // Fetch lessons
        const lessonsData = await bibleStudiesRepository.listLessons(id);
        setLessons(lessonsData);

        // Fetch user progress
        // Fetch user progress (non-blocking)
        if (user?.id) {
          try {
            const p = await bibleStudiesRepository.getProgress({ userId: user.id, studyId: id });
            setProgress(p);
          } catch (progressErr) {
            console.warn('Could not fetch progress:', progressErr);
            setProgress(null);
          }
        } else {
          setProgress(null);
        }
        
        // Fetch study's default character if available
        if (studyData.character_id) {
          const characterData = await characterRepository.getById(studyData.character_id);
          setCharacter(characterData);
        }
        
        // Fetch lesson-specific characters (for lessons with character_id overrides)
        const lessonCharIds = [...new Set(
          lessonsData
            .filter(l => l.character_id && l.character_id !== studyData.character_id)
            .map(l => l.character_id)
        )];
        if (lessonCharIds.length > 0) {
          const charMap = {};
          await Promise.all(lessonCharIds.map(async (cid) => {
            try {
              const c = await characterRepository.getById(cid);
              if (c) charMap[cid] = c;
            } catch {}
          }));
          setLessonCharacters(charMap);
        }
        
        // Fetch conversation history for this study (non-blocking)
        if (user?.id) {
          try {
            const chats = await chatRepository.getChatsByStudy(id);
            setStudyChats(chats || []);
          } catch (chatErr) {
            console.warn('Could not fetch study chats:', chatErr);
            setStudyChats([]);
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching study details:', err);
        setError('Failed to load study details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchStudyDetails();
    }
  }, [id, isPremium, user?.id]);

  const nextLessonIndex = useMemo(() => {
    if (!lessons || lessons.length === 0) return 0;
    if (!progress) return 0;
    const completed = Array.isArray(progress.completed_lessons) ? progress.completed_lessons : [];
    // find first not in completed
    for (let i = 0; i < lessons.length; i++) {
      if (!completed.includes(i)) return i;
    }
    return Math.min(progress.current_lesson_index ?? 0, lessons.length - 1);
  }, [lessons, progress]);

  // Group chats by lesson_id for easy lookup
  const chatsByLesson = useMemo(() => {
    const map = {};
    for (const chat of studyChats) {
      const lessonId = chat.lesson_id;
      if (lessonId) {
        if (!map[lessonId]) map[lessonId] = [];
        map[lessonId].push(chat);
      }
    }
    // Also track chats without lesson_id (study-level intro chats)
    map['_intro'] = studyChats.filter(c => !c.lesson_id);
    return map;
  }, [studyChats]);

  const handleToggleComplete = async (e, lessonIndex) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user?.id || togglingLesson !== null) return;
    setTogglingLesson(lessonIndex);
    try {
      const completed = Array.isArray(progress?.completed_lessons) ? [...progress.completed_lessons] : [];
      const idx = completed.indexOf(lessonIndex);
      if (idx >= 0) {
        completed.splice(idx, 1);
      } else {
        completed.push(lessonIndex);
        completed.sort((a, b) => a - b);
      }
      const updated = await bibleStudiesRepository.saveProgress({
        userId: user.id,
        studyId: id,
        completedLessons: completed
      });
      setProgress(updated);
    } catch (err) {
      console.error('Error toggling lesson completion:', err);
    } finally {
      setTogglingLesson(null);
    }
  };

  const handleLessonClick = (lessonIndex) => {
    if (study?.is_premium && !isPremium) {
      setShowUpgrade(true);
      return;
    }
    
    // Navigation happens via Link component
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
              /* Back button */
              _jsx("div", {
                className: "mb-6",
                children: _jsxs("button", {
                  onClick: () => navigate('/studies'),
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
                    "Back to Studies"
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
                        children: "Loading study details..."
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
                        onClick: () => navigate('/studies'),
                        className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors",
                        children: "Return to Studies"
                      })
                    ]
                  })
                })
              ),

              /* Study details */
              !isLoading && !error && study && (
                _jsxs("div", {
                  className: "mb-8",
                  children: [
                    /* Study header */
                    _jsxs("div", {
                      className: "bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/15 mb-6",
                      children: [
                        /* Premium badge */
                        study.is_premium && (
                          _jsx("div", {
                            className: "mb-4",
                            children: _jsx("span", {
                              className: `
                                inline-block px-3 py-1 text-xs font-medium rounded-full
                                ${isPremium 
                                  ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/30' 
                                  : 'bg-gray-400/20 text-gray-300 border border-gray-400/30'}
                              `,
                              children: isPremium ? "Premium" : "Premium Only"
                            })
                          })
                        ),

                    /* Title + progress + resume */
                    _jsxs("div", { children: [
                          _jsx("h1", {
                            className: "text-3xl md:text-4xl font-extrabold text-yellow-400 tracking-tight",
                            style: { fontFamily: 'Cinzel, serif' },
                            children: study.title
                          }),
                      _jsxs("div", { className: "mt-3 flex flex-wrap items-center gap-2", children: [
                            (user && lessons.length > 0) && (
                              _jsx("span", { className: "text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-100 border border-blue-400/30", children: `${Array.isArray(progress?.completed_lessons) ? progress.completed_lessons.length : 0} of ${lessons.length} complete` })
                            ),
                        // Show Resume if there's progress, otherwise show Start
                        (user && lessons.length > 0 && progress) ? (
                          _jsx(Link, {
                            to: `/studies/${id}/lesson/${nextLessonIndex}`,
                            onClick: (e) => {
                              if (study.is_premium && !isPremium) {
                                e.preventDefault();
                                setShowUpgrade(true);
                              }
                            },
                            className: "text-xs px-3 py-1.5 rounded-md bg-yellow-400 text-blue-900 font-semibold hover:bg-yellow-300",
                            children: "Resume"
                          })
                        ) : (
                          _jsx(Link, {
                            to: `/studies/${id}/lesson/0`,
                            onClick: (e) => {
                              if (study.is_premium && !isPremium) {
                                e.preventDefault();
                                setShowUpgrade(true);
                              }
                            },
                            className: "text-xs px-3 py-1.5 rounded-md bg-yellow-400 text-blue-900 font-semibold hover:bg-yellow-300",
                            children: "Start"
                          })
                        )
                          ]})
                        ]}),

                        /* Description */
                        _jsx("p", {
                          className: "text-blue-100 mb-6",
                          children: study.description
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

                    /* Lessons list */
                    _jsxs("div", {
                      className: "bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/15",
                      children: [
                        _jsx("h2", {
                          className: "text-2xl font-bold text-yellow-400 mb-6",
                          children: "Lessons"
                        }),

                        lessons.length === 0 ? (
                          _jsx("p", {
                            className: "text-blue-100 text-center py-4",
                            children: "No lessons available yet. Check back soon!"
                          })
                        ) : (
                          _jsx("div", {
                            className: "space-y-4",
                            children: lessons.map((lesson, index) => (
                              _jsx(Link, {
                                to: `/studies/${id}/lesson/${lesson.order_index}`,
                                onClick: (e) => {
                                  if (study.is_premium && !isPremium) {
                                    e.preventDefault();
                                    handleLessonClick(lesson.order_index);
                                  }
                                },
                                className: `
                                  block p-4 rounded-lg transition-all
                                  ${study.is_premium && !isPremium
                                    ? 'bg-gray-700/30 border border-gray-600/30 cursor-not-allowed'
                                    : 'bg-blue-800/30 border border-blue-700/30 hover:bg-blue-700/40'}
                                `,
                                children: _jsxs("div", {
                                  children: [
                                    _jsxs("div", {
                                      className: "flex justify-between items-center mb-2",
                                      children: [
                                        _jsxs("h3", {
                                          className: `font-semibold ${study.is_premium && !isPremium ? 'text-gray-400' : 'text-yellow-300'}`,
                                          children: [
                                            "Lesson ", lesson.order_index + 1, ": ", lesson.title
                                          ]
                                        }),
                                        
                                        _jsxs("div", { className: "flex items-center gap-2", children: [
                                          /* Toggle complete button */
                                          (user && !(study.is_premium && !isPremium)) && (() => {
                                            const isComplete = Array.isArray(progress?.completed_lessons) && progress.completed_lessons.includes(lesson.order_index);
                                            const isToggling = togglingLesson === lesson.order_index;
                                            return _jsx("button", {
                                              onClick: (e) => handleToggleComplete(e, lesson.order_index),
                                              disabled: isToggling,
                                              className: `text-[11px] px-2 py-0.5 rounded-full transition-colors ${
                                                isComplete 
                                                  ? 'bg-green-500/20 text-green-200 border border-green-500/30 hover:bg-green-500/30' 
                                                  : 'bg-blue-500/20 text-blue-200 border border-blue-400/30 hover:bg-blue-500/30'
                                              }`,
                                              children: isToggling ? '...' : (isComplete ? 'Completed' : 'Mark Complete')
                                            });
                                          })(),
                                          /* Lock icon for premium */
                                          (study.is_premium && !isPremium) && (
                                            _jsx("svg", {
                                              xmlns: "http://www.w3.org/2000/svg",
                                              className: "h-5 w-5 text-gray-400",
                                              viewBox: "0 0 20 20",
                                              fill: "currentColor",
                                              children: _jsx("path", {
                                                fillRule: "evenodd",
                                                d: "M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z",
                                                clipRule: "evenodd"
                                              })
                                            })
                                          )
                                        ]})
                                      ]
                                    }),
                                    
                                    /* Scripture references */
                                    lesson.scripture_refs && lesson.scripture_refs.length > 0 && (
                                      _jsx("p", {
                                        className: `text-sm ${study.is_premium && !isPremium ? 'text-gray-500' : 'text-blue-200'}`,
                                        children: lesson.scripture_refs.join(', ')
                                      })
                                    ),
                                    
                                    /* Lesson guide (character) */
                                    (() => {
                                      const lessonChar = lesson.character_id 
                                        ? (lessonCharacters[lesson.character_id] || (lesson.character_id === study.character_id ? character : null))
                                        : character;
                                      if (!lessonChar) return null;
                                      return _jsxs("div", {
                                        className: "flex items-center gap-2 mt-2",
                                        children: [
                                          _jsx("img", {
                                            src: lessonChar.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(lessonChar.name)}&background=random`,
                                            alt: lessonChar.name,
                                            className: "w-5 h-5 rounded-full object-cover border border-yellow-400/30"
                                          }),
                                          _jsx("span", {
                                            className: `text-xs ${study.is_premium && !isPremium ? 'text-gray-500' : 'text-blue-200'}`,
                                            children: `Guide: ${lessonChar.name}`
                                          })
                                        ]
                                      });
                                    })(),
                                    
                                    /* Summary preview */
                                    _jsx("p", {
                                      className: `mt-2 line-clamp-2 ${study.is_premium && !isPremium ? 'text-gray-500' : 'text-blue-100/80'}`,
                                      children: lesson.summary || "Start this lesson to begin your study."
                                    }),
                                    
                                    /* Previous conversations for this lesson */
                                    (() => {
                                      const lessonChats = chatsByLesson[lesson.id] || [];
                                      if (lessonChats.length === 0) return null;
                                      return _jsxs("div", {
                                        className: "mt-3 pt-3 border-t border-blue-700/30",
                                        children: [
                                          _jsx("p", {
                                            className: "text-xs text-blue-300/70 mb-2",
                                            children: `${lessonChats.length} previous conversation${lessonChats.length > 1 ? 's' : ''}`
                                          }),
                                          _jsx("div", {
                                            className: "flex flex-wrap gap-2",
                                            children: lessonChats.slice(0, 3).map(chat => (
                                              _jsx(Link, {
                                                to: `/chat/${chat.id}`,
                                                onClick: (e) => e.stopPropagation(),
                                                className: "text-xs px-2 py-1 rounded bg-blue-600/30 text-blue-200 hover:bg-blue-500/40 transition-colors",
                                                children: new Date(chat.updated_at).toLocaleDateString()
                                              }, chat.id)
                                            ))
                                          }),
                                          lessonChats.length > 3 && _jsx("span", {
                                            className: "text-xs text-blue-400/60 ml-2",
                                            children: `+${lessonChats.length - 3} more`
                                          })
                                        ]
                                      });
                                    })()
                                  ]
                                })
                              }, lesson.id)
                            ))
                          })
                        )
                      ]
                    }),

                    /* Premium upgrade CTA */
                    (study.is_premium && !isPremium) && (
                      _jsx("div", {
                        className: "mt-8 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 backdrop-blur-sm rounded-xl p-6 border border-yellow-500/30",
                        children: _jsxs("div", {
                          className: "text-center",
                          children: [
                            _jsx("h3", {
                              className: "text-xl font-bold text-yellow-300 mb-2",
                              children: "Unlock This Bible Study"
                            }),
                            _jsx("p", {
                              className: "text-blue-100 mb-4",
                              children: "Upgrade to premium to access this character-directed Bible study and deepen your understanding of scripture."
                            }),
                            _jsx("button", {
                              onClick: () => setShowUpgrade(true),
                              className: "px-6 py-3 bg-yellow-400 text-blue-900 font-medium rounded-lg hover:bg-yellow-300 transition-colors",
                              children: "Upgrade Now"
                            })
                          ]
                        })
                      })
                    )
                  ]
                })
              ),

              /* Empty state */
              !isLoading && !error && !study && (
                _jsx("div", {
                  className: "bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center my-8",
                  children: _jsxs("div", {
                    children: [
                      _jsx("h3", {
                        className: "text-2xl font-bold text-yellow-400 mb-4",
                        children: "Study Not Found"
                      }),
                      _jsx("p", {
                        className: "text-blue-100 mb-6",
                        children: "The Bible study you're looking for doesn't exist or has been removed."
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

        /* Floating Home Button */
        _jsx(FloatingHomeButton, {}),

        /* Upgrade Modal */
        _jsx(UpgradeModal, {
          isOpen: showUpgrade,
          onClose: () => setShowUpgrade(false),
          message: "Upgrade to access premium Bible studies and deepen your understanding with character-guided lessons."
        })
      ]
    })
  );
};

export default StudyDetails;
