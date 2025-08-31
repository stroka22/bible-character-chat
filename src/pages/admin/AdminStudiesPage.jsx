import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { bibleStudiesRepository } from '../../repositories/bibleStudiesRepository';
import { characterRepository } from '../../repositories/characterRepository';
import { getOwnerSlug } from '../../services/tierSettingsService';

/**
 * AdminStudiesPage
 *
 * Renders Bible-study administration UI.  When used inside the main
 * Admin tabs it can be embedded (`embedded` prop) so we skip the
 * full-screen gradient scaffolding and header.  When rendered as a
 * standalone page (default) we keep the existing look and also show
 * a breadcrumb back-link.
 */
const AdminStudiesPage = ({ embedded = false }) => {
  // Main data states
  const [studies, setStudies] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showStudyForm, setShowStudyForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [ownerSlug, setOwnerSlug] = useState(getOwnerSlug());
  
  // Form states
  const [studyForm, setStudyForm] = useState({
    id: null,
    owner_slug: ownerSlug,
    title: '',
    description: '',
    subject: '',
    character_instructions: '',
    character_id: '',
    cover_image_url: '',
    visibility: 'public',
    is_premium: false
  });
  
  const [lessonForm, setLessonForm] = useState({
    id: null,
    study_id: '',
    order_index: 0,
    title: '',
    scripture_refs: [],
    summary: '',
    prompts: []
  });
  
  // Load studies on mount
  useEffect(() => {
    fetchStudies();
    fetchCharacters();
  }, []);
  
  // Load lessons when a study is selected
  useEffect(() => {
    if (selectedStudy) {
      fetchLessons(selectedStudy.id);
    } else {
      setLessons([]);
    }
  }, [selectedStudy]);
  
  // Fetch all studies for current owner
  const fetchStudies = async () => {
    setIsLoading(true);
    try {
      const data = await bibleStudiesRepository.listStudies({ 
        ownerSlug, 
        includePrivate: true 
      });
      setStudies(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching studies:', err);
      setError('Failed to load studies. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch characters for dropdown
  const fetchCharacters = async () => {
    try {
      const data = await characterRepository.getAll();
      setCharacters(data);
    } catch (err) {
      console.error('Error fetching characters:', err);
    }
  };
  
  // Fetch lessons for a study
  const fetchLessons = async (studyId) => {
    try {
      const data = await bibleStudiesRepository.listLessons(studyId);
      setLessons(data);
    } catch (err) {
      console.error('Error fetching lessons:', err);
    }
  };
  
  // Create or update a study
  const handleSaveStudy = async () => {
    try {
      const payload = { ...studyForm };
      
      // Convert boolean string to actual boolean
      if (typeof payload.is_premium === 'string') {
        payload.is_premium = payload.is_premium === 'true';
      }
      
      await bibleStudiesRepository.upsertStudy(payload);
      await fetchStudies();
      setShowStudyForm(false);
      resetStudyForm();
    } catch (err) {
      console.error('Error saving study:', err);
      setError('Failed to save study: ' + err.message);
    }
  };
  
  // Create or update a lesson
  const handleSaveLesson = async () => {
    try {
      const payload = { ...lessonForm };
      
      // Ensure order_index is a number
      payload.order_index = parseInt(payload.order_index, 10);
      
      // Convert scripture_refs string to array if needed
      if (typeof payload.scripture_refs === 'string') {
        payload.scripture_refs = payload.scripture_refs
          .split(',')
          .map(ref => ref.trim())
          .filter(ref => ref);
      }
      
      // Handle prompts as array of objects
      if (typeof payload.prompts === 'string') {
        try {
          payload.prompts = JSON.parse(payload.prompts);
        } catch (e) {
          // If not valid JSON, convert to array of text objects
          payload.prompts = payload.prompts
            .split('\n')
            .map(line => line.trim())
            .filter(line => line)
            .map(text => ({ text }));
        }
      }
      
      await bibleStudiesRepository.upsertLesson(payload);
      await fetchLessons(selectedStudy.id);
      setShowLessonForm(false);
      resetLessonForm();
    } catch (err) {
      console.error('Error saving lesson:', err);
      setError('Failed to save lesson: ' + err.message);
    }
  };
  
  // Delete a study
  const handleDeleteStudy = async (studyId) => {
    if (!window.confirm('Are you sure you want to delete this study? This action cannot be undone.')) {
      return;
    }
    
    try {
      const success = await bibleStudiesRepository.deleteStudy(studyId);
      if (success) {
        if (selectedStudy && selectedStudy.id === studyId) {
          setSelectedStudy(null);
        }
        await fetchStudies();
      } else {
        setError('Failed to delete study. You may not have permission.');
      }
    } catch (err) {
      console.error('Error deleting study:', err);
      setError('Failed to delete study: ' + err.message);
    }
  };
  
  // Delete a lesson
  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
      return;
    }
    
    try {
      const success = await bibleStudiesRepository.deleteLesson(lessonId);
      if (success) {
        if (selectedLesson && selectedLesson.id === lessonId) {
          setSelectedLesson(null);
        }
        await fetchLessons(selectedStudy.id);
      } else {
        setError('Failed to delete lesson. You may not have permission.');
      }
    } catch (err) {
      console.error('Error deleting lesson:', err);
      setError('Failed to delete lesson: ' + err.message);
    }
  };
  
  // Reset study form to defaults
  const resetStudyForm = () => {
    setStudyForm({
      id: null,
      owner_slug: ownerSlug,
      title: '',
      description: '',
      subject: '',
      character_instructions: '',
      character_id: '',
      cover_image_url: '',
      visibility: 'public',
      is_premium: false
    });
  };
  
  // Reset lesson form to defaults
  const resetLessonForm = () => {
    setLessonForm({
      id: null,
      study_id: selectedStudy ? selectedStudy.id : '',
      order_index: lessons.length,
      title: '',
      scripture_refs: [],
      summary: '',
      prompts: []
    });
  };
  
  // Edit an existing study
  const handleEditStudy = (study) => {
    setStudyForm({
      ...study,
      subject: study.subject || '',
      character_instructions: study.character_instructions || '',
      is_premium: study.is_premium ? 'true' : 'false'
    });
    setShowStudyForm(true);
  };
  
  // Edit an existing lesson
  const handleEditLesson = (lesson) => {
    // Format prompts for editing
    let formattedPrompts = lesson.prompts;
    if (Array.isArray(lesson.prompts)) {
      if (lesson.prompts.length > 0 && typeof lesson.prompts[0] === 'object') {
        formattedPrompts = lesson.prompts
          .map(p => p.text || '')
          .join('\n');
      }
    }
    
    setLessonForm({
      ...lesson,
      prompts: formattedPrompts
    });
    setShowLessonForm(true);
  };
  
  // Create a new study
  const handleNewStudy = () => {
    resetStudyForm();
    setShowStudyForm(true);
  };
  
  // Create a new lesson
  const handleNewLesson = () => {
    resetLessonForm();
    setShowLessonForm(true);
  };
  
  /* ------------------------------------------------------------------
   *  Render helpers
   * ------------------------------------------------------------------ */
  const inner = (
    _jsxs("div", {
      className: "max-w-6xl mx-auto",
      children: [
        /* Optional breadcrumb when standalone */
        !embedded && (
          _jsx("div", {
            className: "mb-4",
            children: _jsx("a", {
              href: "/admin",
              className: "text-blue-200 hover:text-yellow-300",
              children: "← Back to Admin"
            })
          })
        ),

        /* Header */
        _jsxs("div", {
          className: "mb-8",
          children: [
            _jsx("h1", {
              className: `text-3xl md:text-4xl font-extrabold ${embedded ? 'text-gray-800' : 'text-yellow-400'} mb-2 tracking-tight drop-shadow-lg`,
              style: { fontFamily: 'Cinzel, serif' },
              children: "Bible Studies Administration"
            }),
            _jsx("p", {
              className: `${embedded ? 'text-gray-600' : 'text-blue-100'}`,
              children: "Manage character-directed Bible studies and lessons"
            })
          ]
        }),
        
        /* Error message – enhanced visibility + RLS guidance */
        error &&
          (() => {
            const lower = String(error).toLowerCase();
            const isRls =
              lower.includes('row level security') ||
              lower.includes('permission') ||
              lower.includes('rls');
            const baseClasses = embedded
              ? 'bg-red-100 border border-red-300 text-red-700'
              : 'bg-red-500/20 border border-red-500/50 text-red-200';

            return (
              _jsxs("div", {
                className: `${baseClasses} px-4 py-3 rounded-lg mb-6`,
                children: [
                  _jsx("p", { children: error }),
                  isRls && (
                    _jsxs("div", {
                      className: `${
                        embedded
                          ? 'bg-red-50 text-red-700'
                          : 'bg-red-900/30 text-red-200'
                      } mt-4 p-3 rounded-lg`,
                      children: [
                        _jsx("h4", {
                          className: "font-semibold mb-2",
                          children: "Permission help"
                        }),
                        _jsxs("ul", {
                          className: "list-disc list-inside space-y-1 text-sm",
                          children: [
                            _jsx("li", {
                              children:
                                "Ensure you are logged in as an admin with the correct organization"
                            }),
                            _jsx("li", {
                              children:
                                "Set owner_slug in the form to your organization (e.g., grace-church)"
                            }),
                            _jsx("li", {
                              children:
                                "In Supabase, add an INSERT policy on bible_studies allowing admins to insert rows where owner_slug = auth.jwt() ->> 'owner_slug' OR matches the user's profile"
                            }),
                            _jsx("li", {
                              children:
                                "After updating policies, reload this page"
                            })
                          ]
                        })
                      ]
                    })
                  )
                ]
              })
            );
          })(),
        
        /* Main content area */
        _jsxs("div", {
          className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
          children: [
            /* Studies list panel */
            _jsxs("div", {
              className: embedded ? "bg-white rounded-lg p-6 border border-gray-200 shadow-md" : "bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/15 shadow-lg",
              children: [
                _jsxs("div", {
                  className: "flex justify-between items-center mb-4",
                  children: [
                    _jsx("h2", {
                      className: `text-xl font-bold ${embedded ? 'text-gray-800' : 'text-yellow-400'}`,
                      children: "Bible Studies"
                    }),
                    _jsx("button", {
                      onClick: handleNewStudy,
                      className: `${embedded ? 'bg-primary-600 hover:bg-primary-700' : 'bg-green-600 hover:bg-green-700'} text-white px-3 py-1 rounded-lg text-sm flex items-center`,
                      children: _jsxs(_Fragment, {
                        children: [
                          _jsx("svg", {
                            xmlns: "http://www.w3.org/2000/svg",
                            className: "h-4 w-4 mr-1",
                            viewBox: "0 0 20 20",
                            fill: "currentColor",
                            children: _jsx("path", {
                              fillRule: "evenodd",
                              d: "M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z",
                              clipRule: "evenodd"
                            })
                          }),
                          "New Study"
                        ]
                      })
                    })
                  ]
                }),
                
                /* Studies list */
                isLoading ? (
                  _jsx("div", {
                    className: "flex justify-center py-8",
                    children: _jsx("div", {
                      className: "animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-400"
                    })
                  })
                ) : studies.length === 0 ? (
                  _jsx("div", {
                    className: `text-center py-8 ${embedded ? 'text-gray-600' : 'text-blue-100'}`,
                    children: "No studies found. Create your first study!"
                  })
                ) : (
                  _jsx("div", {
                    className: "space-y-3 max-h-[60vh] overflow-y-auto pr-2",
                    children: studies.map(study => (
                      _jsxs("div", {
                        className: `
                          p-4 rounded-lg border transition-all cursor-pointer
                          ${selectedStudy?.id === study.id 
                            ? embedded ? 'bg-blue-50 border-primary-400' : 'bg-blue-700/50 border-yellow-400/50' 
                            : embedded ? 'bg-white border-gray-200 hover:bg-gray-50' : 'bg-white/5 border-white/10 hover:bg-white/10'}
                        `,
                        onClick: () => setSelectedStudy(study),
                        children: [
                          _jsxs("div", {
                            className: "flex justify-between items-start",
                            children: [
                              _jsx("h3", {
                                className: `font-semibold ${embedded ? 'text-gray-800' : 'text-yellow-300'} mb-1`,
                                children: study.title
                              }),
                              _jsxs("div", {
                                className: "flex space-x-1",
                                children: [
                                  _jsx("button", {
                                    onClick: (e) => {
                                      e.stopPropagation();
                                      handleEditStudy(study);
                                    },
                                    className: `${embedded ? 'text-blue-600 hover:text-blue-800' : 'text-blue-300 hover:text-blue-200'} p-1`,
                                    title: "Edit study",
                                    children: _jsx("svg", {
                                      xmlns: "http://www.w3.org/2000/svg",
                                      className: "h-4 w-4",
                                      viewBox: "0 0 20 20",
                                      fill: "currentColor",
                                      children: _jsx("path", {
                                        d: "M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                                      })
                                    })
                                  }),
                                  _jsx("button", {
                                    onClick: (e) => {
                                      e.stopPropagation();
                                      handleDeleteStudy(study.id);
                                    },
                                    className: "text-red-400 hover:text-red-300 p-1",
                                    title: "Delete study",
                                    children: _jsx("svg", {
                                      xmlns: "http://www.w3.org/2000/svg",
                                      className: "h-4 w-4",
                                      viewBox: "0 0 20 20",
                                      fill: "currentColor",
                                      children: _jsx("path", {
                                        fillRule: "evenodd",
                                        d: "M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z",
                                        clipRule: "evenodd"
                                      })
                                    })
                                  })
                                ]
                              })
                            ]
                          }),
                          _jsx("p", {
                            className: `text-sm ${embedded ? 'text-gray-600' : 'text-blue-100'} line-clamp-2 mb-2`,
                            children: study.description
                          }),
                          _jsxs("div", {
                            className: "flex flex-wrap gap-2 mt-2",
                            children: [
                              _jsx("span", {
                                className: `text-xs px-2 py-0.5 rounded-full ${
                                  embedded 
                                    ? (study.visibility === 'public' 
                                        ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                                        : 'bg-gray-100 text-gray-800 border border-gray-200')
                                    : (study.visibility === 'public'
                                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30')
                                }`,
                                children: study.visibility
                              }),
                              study.is_premium && (
                                _jsx("span", {
                                  className: `text-xs px-2 py-0.5 rounded-full ${
                                    embedded 
                                      ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                                      : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                  }`,
                                  children: "Premium"
                                })
                              )
                            ]
                          })
                        ]
                      }, study.id)
                    ))
                  })
                )
              ]
            }),
            
            /* Lessons panel (shows when study is selected) */
            _jsxs("div", {
              className: "lg:col-span-2",
              children: [
                selectedStudy ? (
                  _jsxs("div", {
                    className: embedded ? "bg-white rounded-lg p-6 border border-gray-200 shadow-md" : "bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/15 shadow-lg",
                    children: [
                      _jsxs("div", {
                        className: "flex justify-between items-center mb-6",
                        children: [
                          _jsxs("div", {
                            children: [
                              _jsx("h2", {
                                className: `text-xl font-bold ${embedded ? 'text-gray-800' : 'text-yellow-400'}`,
                                children: "Lessons"
                              }),
                              _jsxs("p", {
                                className: `${embedded ? 'text-gray-500' : 'text-blue-200'}`,
                                children: [
                                  "Study: ",
                                  _jsx("span", {
                                    className: "font-semibold",
                                    children: selectedStudy.title
                                  })
                                ]
                              })
                            ]
                          }),
                          _jsx("button", {
                            onClick: handleNewLesson,
                            className: `${embedded ? 'bg-primary-600 hover:bg-primary-700' : 'bg-green-600 hover:bg-green-700'} text-white px-3 py-1 rounded-lg text-sm flex items-center`,
                            children: _jsxs(_Fragment, {
                              children: [
                                _jsx("svg", {
                                  xmlns: "http://www.w3.org/2000/svg",
                                  className: "h-4 w-4 mr-1",
                                  viewBox: "0 0 20 20",
                                  fill: "currentColor",
                                  children: _jsx("path", {
                                    fillRule: "evenodd",
                                    d: "M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z",
                                    clipRule: "evenodd"
                                  })
                                }),
                                "New Lesson"
                              ]
                            })
                          })
                        ]
                      }),
                      
                      /* Lessons list */
                      lessons.length === 0 ? (
                        _jsx("div", {
                          className: `text-center py-8 ${embedded ? 'text-gray-600' : 'text-blue-100'}`,
                          children: "No lessons found. Create your first lesson!"
                        })
                      ) : (
                        _jsx("div", {
                          className: "space-y-4 max-h-[60vh] overflow-y-auto pr-2",
                          children: lessons
                            .sort((a, b) => a.order_index - b.order_index)
                            .map(lesson => (
                            _jsxs("div", {
                              className: embedded ? "bg-gray-50 rounded-lg p-4 border border-gray-200" : "bg-white/5 rounded-lg p-4 border border-white/10",
                              children: [
                                _jsxs("div", {
                                  className: "flex justify-between items-start",
                                  children: [
                                    _jsxs("h3", {
                                      className: `font-semibold ${embedded ? 'text-gray-800' : 'text-yellow-300'} mb-1`,
                                      children: [
                                        "Lesson ", lesson.order_index + 1, ": ", lesson.title
                                      ]
                                    }),
                                    _jsxs("div", {
                                      className: "flex space-x-1",
                                      children: [
                                        _jsx("button", {
                                          onClick: () => handleEditLesson(lesson),
                                          className: `${embedded ? 'text-blue-600 hover:text-blue-800' : 'text-blue-300 hover:text-blue-200'} p-1`,
                                          title: "Edit lesson",
                                          children: _jsx("svg", {
                                            xmlns: "http://www.w3.org/2000/svg",
                                            className: "h-4 w-4",
                                            viewBox: "0 0 20 20",
                                            fill: "currentColor",
                                            children: _jsx("path", {
                                              d: "M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                                            })
                                          })
                                        }),
                                        _jsx("button", {
                                          onClick: () => handleDeleteLesson(lesson.id),
                                          className: "text-red-400 hover:text-red-300 p-1",
                                          title: "Delete lesson",
                                          children: _jsx("svg", {
                                            xmlns: "http://www.w3.org/2000/svg",
                                            className: "h-4 w-4",
                                            viewBox: "0 0 20 20",
                                            fill: "currentColor",
                                            children: _jsx("path", {
                                              fillRule: "evenodd",
                                              d: "M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z",
                                              clipRule: "evenodd"
                                            })
                                          })
                                        })
                                      ]
                                    })
                                  ]
                                }),
                                
                                /* Scripture references */
                                lesson.scripture_refs && lesson.scripture_refs.length > 0 && (
                                  _jsxs("div", {
                                    className: "mt-2",
                                    children: [
                                      _jsx("span", {
                                        className: `text-xs ${embedded ? 'text-blue-600' : 'text-blue-300'}`,
                                        children: "Scripture:"
                                      }),
                                      _jsx("div", {
                                        className: "flex flex-wrap gap-1 mt-1",
                                        children: lesson.scripture_refs.map((ref, idx) => (
                                          _jsx("span", {
                                            className: embedded ? "bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full border border-blue-200" : "bg-blue-500/20 text-blue-200 text-xs px-2 py-0.5 rounded-full",
                                            children: ref
                                          }, `ref-${idx}`)
                                        ))
                                      })
                                    ]
                                  })
                                ),
                                
                                /* Summary */
                                _jsx("p", {
                                  className: `text-sm ${embedded ? 'text-gray-600' : 'text-blue-100'} mt-2 line-clamp-2`,
                                  children: lesson.summary
                                }),
                                
                                /* Prompts count */
                                _jsxs("div", {
                                  className: `mt-2 text-xs ${embedded ? 'text-gray-500' : 'text-blue-300'}`,
                                  children: [
                                    "Prompts: ",
                                    Array.isArray(lesson.prompts) ? lesson.prompts.length : 0
                                  ]
                                })
                              ]
                            }, lesson.id)
                          ))
                        })
                      )
                    ]
                  })
                ) : (
                  _jsx("div", {
                    className: embedded ? "bg-white rounded-lg p-8 border border-gray-200 shadow-md flex items-center justify-center h-full" : "bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/15 shadow-lg flex items-center justify-center h-full",
                    children: _jsx("p", {
                      className: `${embedded ? 'text-gray-500' : 'text-blue-200'} text-center`,
                      children: "Select a study to manage its lessons"
                    })
                  })
                )
              ]
            })
          ]
        })
      ]
    })
  );

  const page = embedded 
    ? inner 
    : (_jsx("div", {
        className: "min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700 py-8 px-4 md:px-6",
        children: inner
      }));

  return (
    _jsxs(_Fragment, {
      children: [
        page,
        showStudyForm ? (
          _jsx("div", {
            className: "fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4",
            children: _jsxs("div", {
              className: "bg-blue-900 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto",
              children: [
                _jsxs("div", {
                  className: "flex justify-between items-center mb-6",
                  children: [
                    _jsx("h2", {
                      className: "text-2xl font-bold text-yellow-400",
                      children: studyForm.id ? "Edit Study" : "Create New Study"
                    }),
                    _jsx("button", {
                      onClick: () => setShowStudyForm(false),
                      className: "text-white hover:text-yellow-300",
                      children: _jsx("svg", {
                        xmlns: "http://www.w3.org/2000/svg",
                        className: "h-6 w-6",
                        fill: "none",
                        viewBox: "0 0 24 24",
                        stroke: "currentColor",
                        children: _jsx("path", {
                          strokeLinecap: "round",
                          strokeLinejoin: "round",
                          strokeWidth: 2,
                          d: "M6 18L18 6M6 6l12 12"
                        })
                      })
                    })
                  ]
                }),
                
                _jsxs("form", {
                  onSubmit: (e) => {
                    e.preventDefault();
                    handleSaveStudy();
                  },
                  className: "space-y-4",
                  children: [
                    _jsxs("div", {
                      children: [
                        _jsx("label", {
                          className: "block text-blue-200 mb-1",
                          children: "Title"
                        }),
                        _jsx("input", {
                          type: "text",
                          value: studyForm.title,
                          onChange: (e) => setStudyForm({...studyForm, title: e.target.value}),
                          className: "w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:border-primary-500 focus:ring-primary-500",
                          required: true
                        })
                      ]
                    }),
                    
                    _jsxs("div", {
                      children: [
                        _jsx("label", {
                          className: "block text-blue-200 mb-1",
                          children: "Description"
                        }),
                        _jsx("textarea", {
                          value: studyForm.description,
                          onChange: (e) => setStudyForm({...studyForm, description: e.target.value}),
                          className: "w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:border-primary-500 focus:ring-primary-500 h-24",
                          required: true
                        })
                      ]
                    }),
                    
                    /* Subject */
                    _jsxs("div", {
                      children: [
                        _jsx("label", {
                          className: "block text-blue-200 mb-1",
                          children: "Subject"
                        }),
                        _jsx("input", {
                          type: "text",
                          value: studyForm.subject,
                          onChange: (e) => setStudyForm({...studyForm, subject: e.target.value}),
                          className: "w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:border-primary-500 focus:ring-primary-500",
                          placeholder: "e.g., Sermon on the Mount"
                        })
                      ]
                    }),
                    
                    /* Character Instructions */
                    _jsxs("div", {
                      children: [
                        _jsx("label", {
                          className: "block text-blue-200 mb-1",
                          children: "Character Instructions"
                        }),
                        _jsx("textarea", {
                          value: studyForm.character_instructions,
                          onChange: (e) => setStudyForm({...studyForm, character_instructions: e.target.value}),
                          className: "w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:border-primary-500 focus:ring-primary-500 h-24",
                          placeholder: "Special guidance or persona prompt for the guiding character"
                        })
                      ]
                    }),
                    
                    _jsxs("div", {
                      children: [
                        _jsx("label", {
                          className: "block text-blue-200 mb-1",
                          children: "Character Guide"
                        }),
                        _jsxs("select", {
                          value: studyForm.character_id || '',
                          onChange: (e) => setStudyForm({...studyForm, character_id: e.target.value}),
                          className: "w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:border-primary-500 focus:ring-primary-500",
                          children: [
                            _jsx("option", { value: "", children: "-- Select a character --" }),
                            characters.map(character => (
                              _jsx("option", {
                                value: character.id,
                                children: character.name
                              }, character.id)
                            ))
                          ]
                        })
                      ]
                    }),
                    
                    _jsxs("div", {
                      children: [
                        _jsx("label", {
                          className: "block text-blue-200 mb-1",
                          children: "Cover Image URL"
                        }),
                        _jsx("input", {
                          type: "text",
                          value: studyForm.cover_image_url || '',
                          onChange: (e) => setStudyForm({...studyForm, cover_image_url: e.target.value}),
                          className: "w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:border-primary-500 focus:ring-primary-500",
                          placeholder: "https://example.com/image.jpg"
                        })
                      ]
                    }),
                    
                    _jsxs("div", {
                      className: "flex gap-6",
                      children: [
                        _jsxs("div", {
                          className: "flex-1",
                          children: [
                            _jsx("label", {
                              className: "block text-blue-200 mb-1",
                              children: "Visibility"
                            }),
                            _jsxs("select", {
                              value: studyForm.visibility,
                              onChange: (e) => setStudyForm({...studyForm, visibility: e.target.value}),
                              className: "w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:border-primary-500 focus:ring-primary-500",
                              children: [
                                _jsx("option", { value: "public", children: "Public" }),
                                _jsx("option", { value: "private", children: "Private" })
                              ]
                            })
                          ]
                        }),
                        
                        _jsxs("div", {
                          className: "flex-1",
                          children: [
                            _jsx("label", {
                              className: "block text-blue-200 mb-1",
                              children: "Premium"
                            }),
                            _jsxs("select", {
                              value: String(studyForm.is_premium),
                              onChange: (e) => setStudyForm({...studyForm, is_premium: e.target.value}),
                              className: "w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:border-primary-500 focus:ring-primary-500",
                              children: [
                                _jsx("option", { value: "false", children: "Free" }),
                                _jsx("option", { value: "true", children: "Premium Only" })
                              ]
                            })
                          ]
                        })
                      ]
                    }),
                    
                    _jsxs("div", {
                      className: "flex justify-end gap-3 pt-4",
                      children: [
                        _jsx("button", {
                          type: "button",
                          onClick: () => setShowStudyForm(false),
                          className: "px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg",
                          children: "Cancel"
                        }),
                        _jsx("button", {
                          type: "submit",
                          className: "px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg",
                          children: "Save Study"
                        })
                      ]
                    })
                  ]
                })
              ]
            })
          })
        ) : null,
        
        showLessonForm ? (
          _jsx("div", {
            className: "fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4",
            children: _jsxs("div", {
              className: "bg-blue-900 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto",
              children: [
                _jsxs("div", {
                  className: "flex justify-between items-center mb-6",
                  children: [
                    _jsx("h2", {
                      className: "text-2xl font-bold text-yellow-400",
                      children: lessonForm.id ? "Edit Lesson" : "Create New Lesson"
                    }),
                    _jsx("button", {
                      onClick: () => setShowLessonForm(false),
                      className: "text-white hover:text-yellow-300",
                      children: _jsx("svg", {
                        xmlns: "http://www.w3.org/2000/svg",
                        className: "h-6 w-6",
                        fill: "none",
                        viewBox: "0 0 24 24",
                        stroke: "currentColor",
                        children: _jsx("path", {
                          strokeLinecap: "round",
                          strokeLinejoin: "round",
                          strokeWidth: 2,
                          d: "M6 18L18 6M6 6l12 12"
                        })
                      })
                    })
                  ]
                }),
                
                _jsxs("form", {
                  onSubmit: (e) => {
                    e.preventDefault();
                    handleSaveLesson();
                  },
                  className: "space-y-4",
                  children: [
                    _jsxs("div", {
                      className: "flex gap-4",
                      children: [
                        _jsxs("div", {
                          className: "flex-1",
                          children: [
                            _jsx("label", {
                              className: "block text-blue-200 mb-1",
                              children: "Title"
                            }),
                            _jsx("input", {
                              type: "text",
                              value: lessonForm.title,
                              onChange: (e) => setLessonForm({...lessonForm, title: e.target.value}),
                              className: "w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:border-primary-500 focus:ring-primary-500",
                              required: true
                            })
                          ]
                        }),
                        
                        _jsxs("div", {
                          className: "w-24",
                          children: [
                            _jsx("label", {
                              className: "block text-blue-200 mb-1",
                              children: "Order"
                            }),
                            _jsx("input", {
                              type: "number",
                              min: "0",
                              value: lessonForm.order_index,
                              onChange: (e) => setLessonForm({...lessonForm, order_index: e.target.value}),
                              className: "w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:border-primary-500 focus:ring-primary-500",
                              required: true
                            })
                          ]
                        })
                      ]
                    }),
                    
                    _jsxs("div", {
                      children: [
                        _jsx("label", {
                          className: "block text-blue-200 mb-1",
                          children: "Scripture References (comma separated)"
                        }),
                        _jsx("input", {
                          type: "text",
                          value: Array.isArray(lessonForm.scripture_refs) 
                            ? lessonForm.scripture_refs.join(', ')
                            : lessonForm.scripture_refs || '',
                          onChange: (e) => setLessonForm({...lessonForm, scripture_refs: e.target.value}),
                          className: "w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:border-primary-500 focus:ring-primary-500",
                          placeholder: "Matthew 5:1-12, John 3:16"
                        })
                      ]
                    }),
                    
                    _jsxs("div", {
                      children: [
                        _jsx("label", {
                          className: "block text-blue-200 mb-1",
                          children: "Summary"
                        }),
                        _jsx("textarea", {
                          value: lessonForm.summary || '',
                          onChange: (e) => setLessonForm({...lessonForm, summary: e.target.value}),
                          className: "w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:border-primary-500 focus:ring-primary-500 h-24",
                          required: true
                        })
                      ]
                    }),
                    
                    _jsxs("div", {
                      children: [
                        _jsxs("label", {
                          className: "block text-blue-200 mb-1",
                          children: [
                            "Prompts (one per line, or JSON array of objects with 'text' property)"
                          ]
                        }),
                        _jsx("textarea", {
                          value: typeof lessonForm.prompts === 'string'
                            ? lessonForm.prompts
                            : Array.isArray(lessonForm.prompts)
                              ? lessonForm.prompts.map(p => typeof p === 'object' ? p.text : p).join('\n')
                              : '',
                          onChange: (e) => setLessonForm({...lessonForm, prompts: e.target.value}),
                          className: "w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 focus:border-primary-500 focus:ring-primary-500 h-32 font-mono text-sm",
                          placeholder: "What does this passage teach us about God?\nHow can we apply this to our lives today?"
                        }),
                        _jsx("p", {
                          className: "text-xs text-blue-300 mt-1",
                          children: "These will be used as suggested questions for the character to discuss with the user."
                        })
                      ]
                    }),
                    
                    _jsxs("div", {
                      className: "flex justify-end gap-3 pt-4",
                      children: [
                        _jsx("button", {
                          type: "button",
                          onClick: () => setShowLessonForm(false),
                          className: "px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg",
                          children: "Cancel"
                        }),
                        _jsx("button", {
                          type: "submit",
                          className: "px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg",
                          children: "Save Lesson"
                        })
                      ]
                    })
                  ]
                })
              ]
            })
          })
        ) : null
      ]
    })
  );
};

export default AdminStudiesPage;
