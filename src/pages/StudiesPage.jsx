import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bibleStudiesRepository } from '../repositories/bibleStudiesRepository';
import { usePremium } from '../hooks/usePremium';
import UpgradeModal from '../components/modals/UpgradeModal';
import Footer from '../components/Footer';

const StudiesPage = () => {
  const [studies, setStudies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { isPremium } = usePremium();

  useEffect(() => {
    const fetchStudies = async () => {
      try {
        setIsLoading(true);
        const data = await bibleStudiesRepository.listStudies();
        setStudies(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching Bible studies:', err);
        setError('Failed to load Bible studies. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudies();
  }, []);

  const handleStudyClick = (study) => {
    if (study.is_premium && !isPremium) {
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
            className: "max-w-6xl mx-auto",
            children: [
              /* Header */
              _jsxs("div", {
                className: "text-center mb-12",
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
                    className: "text-4xl md:text-5xl font-extrabold text-yellow-400 mb-4 tracking-tight drop-shadow-lg",
                    style: { fontFamily: 'Cinzel, serif' },
                    children: "Character-Directed Bible Studies"
                  }),
                  _jsx("p", {
                    className: "text-blue-100 text-lg max-w-3xl mx-auto",
                    children: "Explore the Bible through guided studies led by biblical characters. Deepen your understanding with scripture-based lessons and reflections."
                  })
                ]
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
                        children: "Loading Bible studies..."
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
                        onClick: () => window.location.reload(),
                        className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors",
                        children: "Try Again"
                      })
                    ]
                  })
                })
              ),

              /* Empty state */
              !isLoading && !error && studies.length === 0 && (
                _jsx("div", {
                  className: "bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center my-8",
                  children: _jsxs("div", {
                    children: [
                      _jsx("h3", {
                        className: "text-2xl font-bold text-yellow-400 mb-4",
                        children: "Coming Soon!"
                      }),
                      _jsx("p", {
                        className: "text-blue-100 mb-6",
                        children: "We're preparing character-directed Bible studies for you. Check back soon for new content!"
                      }),
                      _jsx(Link, {
                        to: "/",
                        className: "px-6 py-3 bg-yellow-400 text-blue-900 font-medium rounded-lg hover:bg-yellow-300 transition-colors",
                        children: "Return Home"
                      })
                    ]
                  })
                })
              ),

              /* Studies grid */
              !isLoading && !error && studies.length > 0 && (
                _jsx("div", {
                  className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8",
                  children: studies.map(study => (
                    _jsx(Link, {
                      to: `/studies/${study.id}`,
                      onClick: (e) => {
                        if (study.is_premium && !isPremium) {
                          e.preventDefault();
                          handleStudyClick(study);
                        }
                      },
                      className: `
                        block bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden
                        border border-white/15 transition-all duration-300
                        hover:bg-white/15 hover:shadow-lg hover:-translate-y-1
                        ${study.is_premium && !isPremium ? 'relative' : ''}
                      `,
                      children: _jsxs("div", {
                        children: [
                          /* Study image */
                          study.cover_image_url && (
                            _jsx("div", {
                              className: "h-48 overflow-hidden",
                              children: _jsx("img", {
                                src: study.cover_image_url,
                                alt: study.title,
                                className: "w-full h-full object-cover"
                              })
                            })
                          ),

                          /* Study content */
                          _jsxs("div", {
                            className: "p-6",
                            children: [
                              _jsx("h3", {
                                className: "text-xl font-bold text-yellow-400 mb-2",
                                children: study.title
                              }),
                              _jsx("p", {
                                className: "text-blue-100 mb-4 line-clamp-2",
                                children: study.description
                              }),
                              
                              /* Premium badge */
                              study.is_premium && (
                                _jsx("span", {
                                  className: `
                                    inline-block px-3 py-1 text-xs font-medium rounded-full
                                    ${isPremium 
                                      ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/30' 
                                      : 'bg-gray-400/20 text-gray-300 border border-gray-400/30'}
                                  `,
                                  children: isPremium ? "Premium" : "Premium Only"
                                })
                              )
                            ]
                          }),

                          /* Premium overlay */
                          (study.is_premium && !isPremium) && (
                            _jsx("div", {
                              className: "absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center",
                              children: _jsx("div", {
                                className: "px-4 py-2 bg-yellow-400 text-blue-900 font-medium rounded-lg",
                                children: "Upgrade to Access"
                              })
                            })
                          )
                        ]
                      })
                    }, study.id)
                  ))
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
          message: "Upgrade to access premium Bible studies led by biblical characters."
        })
      ]
    })
  );
};

export default StudiesPage;
