import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const PastorsPage = () => {
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
        _jsxs("div", {
          className: "relative z-10 min-h-screen pt-24 pb-16",
          children: [
            /* Hero section */
            _jsx("section", {
              className: "px-4 md:px-8 max-w-6xl mx-auto mb-20",
              children: _jsxs("div", {
                className: "text-center",
                children: [
                  _jsx("h1", {
                    className: "text-4xl md:text-5xl lg:text-6xl font-extrabold text-yellow-400 mb-6 tracking-tight drop-shadow-lg",
                    style: { fontFamily: 'Cinzel, serif' },
                    children: "Equip your church with guided, Scripture‑anchored conversations"
                  }),
                  _jsx("p", {
                    className: "text-xl text-blue-100 max-w-3xl mx-auto mb-10",
                    children: "Bible Character Chat helps small groups and individuals go deeper with Scripture—safely, at scale, and with biblical guidance."
                  }),
                  _jsxs("div", {
                    className: "flex flex-col sm:flex-row justify-center gap-4",
                    children: [
                      _jsx(Link, {
                        to: "/contact?subject=Demo+Request",
                        className: "px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold rounded-lg text-lg transition-colors shadow-lg",
                        children: "Book a Demo"
                      }),
                      _jsx(Link, {
                        to: "/contact",
                        className: "px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg text-lg transition-colors border border-white/20",
                        children: "Contact Us"
                      })
                    ]
                  })
                ]
              })
            }),

            /* Pilot cohort banner */
            _jsx("section", {
              className: "bg-yellow-400/20 backdrop-blur-sm py-4 mb-20",
              children: _jsx("div", {
                className: "max-w-6xl mx-auto px-4 md:px-8 text-center",
                children: _jsx("p", {
                  className: "text-lg font-medium text-yellow-300",
                  children: "Pilot cohort now forming: Limited to 10 churches"
                })
              })
            }),

            /* Value propositions */
            _jsx("section", {
              className: "px-4 md:px-8 max-w-6xl mx-auto mb-20",
              children: _jsxs("div", {
                children: [
                  _jsx("h2", {
                    className: "text-3xl md:text-4xl font-bold text-yellow-400 mb-12 text-center",
                    style: { fontFamily: 'Cinzel, serif' },
                    children: "Why pastors choose FaithTalkAI"
                  }),
                  _jsx("div", {
                    className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8",
                    children: [
                      _jsxs("div", {
                        className: "bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/15 shadow-lg",
                        children: [
                          _jsx("div", {
                            className: "w-12 h-12 bg-yellow-400/20 rounded-full flex items-center justify-center mb-4",
                            children: _jsx("svg", {
                              xmlns: "http://www.w3.org/2000/svg",
                              className: "h-6 w-6 text-yellow-400",
                              fill: "none",
                              viewBox: "0 0 24 24",
                              stroke: "currentColor",
                              children: _jsx("path", {
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                strokeWidth: 2,
                                d: "M12 6v6m0 0v6m0-6h6m-6 0H6"
                              })
                            })
                          }),
                          _jsx("h3", {
                            className: "text-xl font-bold text-yellow-300 mb-2",
                            children: "Deepen engagement"
                          }),
                          _jsx("p", {
                            className: "text-blue-100",
                            children: "Members explore Scripture through guided Q&A with trusted biblical voices, creating meaningful connections to God's Word."
                          })
                        ]
                      }),
                      _jsxs("div", {
                        className: "bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/15 shadow-lg",
                        children: [
                          _jsx("div", {
                            className: "w-12 h-12 bg-yellow-400/20 rounded-full flex items-center justify-center mb-4",
                            children: _jsx("svg", {
                              xmlns: "http://www.w3.org/2000/svg",
                              className: "h-6 w-6 text-yellow-400",
                              fill: "none",
                              viewBox: "0 0 24 24",
                              stroke: "currentColor",
                              children: _jsx("path", {
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                strokeWidth: 2,
                                d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                              })
                            })
                          }),
                          _jsx("h3", {
                            className: "text-xl font-bold text-yellow-300 mb-2",
                            children: "Small groups ready"
                          }),
                          _jsx("p", {
                            className: "text-blue-100",
                            children: "Prebuilt studies and lessons with prompts for leaders and participants make group facilitation simple and effective."
                          })
                        ]
                      }),
                      _jsxs("div", {
                        className: "bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/15 shadow-lg",
                        children: [
                          _jsx("div", {
                            className: "w-12 h-12 bg-yellow-400/20 rounded-full flex items-center justify-center mb-4",
                            children: _jsx("svg", {
                              xmlns: "http://www.w3.org/2000/svg",
                              className: "h-6 w-6 text-yellow-400",
                              fill: "none",
                              viewBox: "0 0 24 24",
                              stroke: "currentColor",
                              children: _jsx("path", {
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                strokeWidth: 2,
                                d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              })
                            })
                          }),
                          _jsx("h3", {
                            className: "text-xl font-bold text-yellow-300 mb-2",
                            children: "Scales your time"
                          }),
                          _jsx("p", {
                            className: "text-blue-100",
                            children: "Provide pastoral care touchpoints between Sundays without more meetings, extending your ministry's reach and impact."
                          })
                        ]
                      }),
                      _jsxs("div", {
                        className: "bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/15 shadow-lg",
                        children: [
                          _jsx("div", {
                            className: "w-12 h-12 bg-yellow-400/20 rounded-full flex items-center justify-center mb-4",
                            children: _jsx("svg", {
                              xmlns: "http://www.w3.org/2000/svg",
                              className: "h-6 w-6 text-yellow-400",
                              fill: "none",
                              viewBox: "0 0 24 24",
                              stroke: "currentColor",
                              children: _jsx("path", {
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                strokeWidth: 2,
                                d: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                              })
                            })
                          }),
                          _jsx("h3", {
                            className: "text-xl font-bold text-yellow-300 mb-2",
                            children: "Safe by design"
                          }),
                          _jsx("p", {
                            className: "text-blue-100",
                            children: "Built with guardrails, Scripture citations, and leadership oversight to ensure theologically sound, biblically faithful guidance."
                          })
                        ]
                      })
                    ]
                  })
                ]
              })
            }),

            /* How it works */
            _jsx("section", {
              className: "px-4 md:px-8 max-w-6xl mx-auto mb-20",
              children: _jsxs("div", {
                children: [
                  _jsx("h2", {
                    className: "text-3xl md:text-4xl font-bold text-yellow-400 mb-12 text-center",
                    style: { fontFamily: 'Cinzel, serif' },
                    children: "How it works"
                  }),
                  _jsxs("div", {
                    className: "grid grid-cols-1 md:grid-cols-2 gap-8",
                    children: [
                      /* Start with a Study flow */
                      _jsxs("div", {
                        className: "bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/15 shadow-lg",
                        children: [
                          _jsx("h3", {
                            className: "text-xl font-bold text-yellow-300 mb-4 text-center",
                            children: "Start with a Study"
                          }),
                          _jsxs("ol", {
                            className: "space-y-6",
                            children: [
                              _jsxs("li", {
                                className: "flex items-start gap-4",
                                children: [
                                  _jsx("div", {
                                    className: "w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                                    children: _jsx("span", {
                                      className: "text-blue-900 font-bold",
                                      children: "1"
                                    })
                                  }),
                                  _jsxs("div", {
                                    children: [
                                      _jsx("h4", {
                                        className: "font-semibold text-white mb-1",
                                        children: "Choose a Bible study"
                                      }),
                                      _jsx("p", {
                                        className: "text-blue-100 text-sm",
                                        children: "Select from pre-built studies or create your own with custom lessons and prompts."
                                      })
                                    ]
                                  })
                                ]
                              }),
                              _jsxs("li", {
                                className: "flex items-start gap-4",
                                children: [
                                  _jsx("div", {
                                    className: "w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                                    children: _jsx("span", {
                                      className: "text-blue-900 font-bold",
                                      children: "2"
                                    })
                                  }),
                                  _jsxs("div", {
                                    children: [
                                      _jsx("h4", {
                                        className: "font-semibold text-white mb-1",
                                        children: "Select a character guide"
                                      }),
                                      _jsx("p", {
                                        className: "text-blue-100 text-sm",
                                        children: "Choose which biblical character will lead the conversation (Paul, Ruth, Peter, etc.)."
                                      })
                                    ]
                                  })
                                ]
                              }),
                              _jsxs("li", {
                                className: "flex items-start gap-4",
                                children: [
                                  _jsx("div", {
                                    className: "w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                                    children: _jsx("span", {
                                      className: "text-blue-900 font-bold",
                                      children: "3"
                                    })
                                  }),
                                  _jsxs("div", {
                                    children: [
                                      _jsx("h4", {
                                        className: "font-semibold text-white mb-1",
                                        children: "Engage in guided conversation"
                                      }),
                                      _jsx("p", {
                                        className: "text-blue-100 text-sm",
                                        children: "Chat with Scripture references, follow-up questions, and application prompts."
                                      })
                                    ]
                                  })
                                ]
                              }),
                              _jsxs("li", {
                                className: "flex items-start gap-4",
                                children: [
                                  _jsx("div", {
                                    className: "w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                                    children: _jsx("span", {
                                      className: "text-blue-900 font-bold",
                                      children: "4"
                                    })
                                  }),
                                  _jsxs("div", {
                                    children: [
                                      _jsx("h4", {
                                        className: "font-semibold text-white mb-1",
                                        children: "Review and apply"
                                      }),
                                      _jsx("p", {
                                        className: "text-blue-100 text-sm",
                                        children: "Leaders can review insights and assign next steps for continued growth."
                                      })
                                    ]
                                  })
                                ]
                              })
                            ]
                          })
                        ]
                      }),
                      
                      /* Start with a Character flow */
                      _jsxs("div", {
                        className: "bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/15 shadow-lg",
                        children: [
                          _jsx("h3", {
                            className: "text-xl font-bold text-yellow-300 mb-4 text-center",
                            children: "Start with a Character"
                          }),
                          _jsxs("ol", {
                            className: "space-y-6",
                            children: [
                              _jsxs("li", {
                                className: "flex items-start gap-4",
                                children: [
                                  _jsx("div", {
                                    className: "w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                                    children: _jsx("span", {
                                      className: "text-blue-900 font-bold",
                                      children: "1"
                                    })
                                  }),
                                  _jsxs("div", {
                                    children: [
                                      _jsx("h4", {
                                        className: "font-semibold text-white mb-1",
                                        children: "Select a biblical character"
                                      }),
                                      _jsx("p", {
                                        className: "text-blue-100 text-sm",
                                        children: "Choose from faithful guides like Paul, Peter, Ruth, Esther, and more."
                                      })
                                    ]
                                  })
                                ]
                              }),
                              _jsxs("li", {
                                className: "flex items-start gap-4",
                                children: [
                                  _jsx("div", {
                                    className: "w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                                    children: _jsx("span", {
                                      className: "text-blue-900 font-bold",
                                      children: "2"
                                    })
                                  }),
                                  _jsxs("div", {
                                    children: [
                                      _jsx("h4", {
                                        className: "font-semibold text-white mb-1",
                                        children: "Choose a passage or topic"
                                      }),
                                      _jsx("p", {
                                        className: "text-blue-100 text-sm",
                                        children: "Specify Scripture passages or topics you want to explore with your guide."
                                      })
                                    ]
                                  })
                                ]
                              }),
                              _jsxs("li", {
                                className: "flex items-start gap-4",
                                children: [
                                  _jsx("div", {
                                    className: "w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                                    children: _jsx("span", {
                                      className: "text-blue-900 font-bold",
                                      children: "3"
                                    })
                                  }),
                                  _jsxs("div", {
                                    children: [
                                      _jsx("h4", {
                                        className: "font-semibold text-white mb-1",
                                        children: "Start a conversation"
                                      }),
                                      _jsx("p", {
                                        className: "text-blue-100 text-sm",
                                        children: "Ask questions and receive Scripture-anchored guidance from your character."
                                      })
                                    ]
                                  })
                                ]
                              }),
                              _jsxs("li", {
                                className: "flex items-start gap-4",
                                children: [
                                  _jsx("div", {
                                    className: "w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                                    children: _jsx("span", {
                                      className: "text-blue-900 font-bold",
                                      children: "4"
                                    })
                                  }),
                                  _jsxs("div", {
                                    children: [
                                      _jsx("h4", {
                                        className: "font-semibold text-white mb-1",
                                        children: "Share and grow together"
                                      }),
                                      _jsx("p", {
                                        className: "text-blue-100 text-sm",
                                        children: "Save conversations, share insights, and continue your discipleship journey."
                                      })
                                    ]
                                  })
                                ]
                              })
                            ]
                          })
                        ]
                      })
                    ]
                  })
                ]
              })
            }),

            /* Features */
            _jsx("section", {
              className: "px-4 md:px-8 max-w-6xl mx-auto mb-20",
              children: _jsxs("div", {
                children: [
                  _jsx("h2", {
                    className: "text-3xl md:text-4xl font-bold text-yellow-400 mb-12 text-center",
                    style: { fontFamily: 'Cinzel, serif' },
                    children: "Features in detail"
                  }),
                  _jsxs("div", {
                    className: "grid grid-cols-1 md:grid-cols-2 gap-12",
                    children: [
                      _jsxs("div", {
                        className: "space-y-8",
                        children: [
                          _jsxs("div", {
                            children: [
                              _jsx("h3", {
                                className: "text-xl font-bold text-yellow-300 mb-3",
                                children: "Bible Character Chat"
                              }),
                              _jsx("p", {
                                className: "text-blue-100 mb-3",
                                children: "Engage in Scripture-based conversations with biblical characters who provide guidance, insights, and application."
                              }),
                              _jsxs("ul", {
                                className: "list-disc pl-5 text-blue-100 space-y-1",
                                children: [
                                  _jsx("li", {
                                    children: "Faithful representation of biblical voices and perspectives"
                                  }),
                                  _jsx("li", {
                                    children: "Scripture citations and references throughout conversations"
                                  }),
                                  _jsx("li", {
                                    children: "Personalized responses to questions about faith and Scripture"
                                  })
                                ]
                              })
                            ]
                          }),
                          _jsxs("div", {
                            children: [
                              _jsx("h3", {
                                className: "text-xl font-bold text-yellow-300 mb-3",
                                children: "Roundtable Mode"
                              }),
                              _jsx("p", {
                                className: "text-blue-100 mb-3",
                                children: "Facilitate group discussions with multiple biblical characters providing diverse perspectives."
                              }),
                              _jsxs("ul", {
                                className: "list-disc pl-5 text-blue-100 space-y-1",
                                children: [
                                  _jsx("li", {
                                    children: "Auto-start toggle for seamless facilitation"
                                  }),
                                  _jsx("li", {
                                    children: "Sticky leader prompts to guide discussion"
                                  }),
                                  _jsx("li", {
                                    children: "Character selection for diverse biblical voices"
                                  }),
                                  _jsx("li", {
                                    children: "Round-based progression for structured conversations"
                                  })
                                ]
                              })
                            ]
                          }),
                          _jsxs("div", {
                            children: [
                              _jsx("h3", {
                                className: "text-xl font-bold text-yellow-300 mb-3",
                                children: "Studies & Lessons"
                              }),
                              _jsx("p", {
                                className: "text-blue-100 mb-3",
                                children: "Create and customize Bible studies with structured lessons and prompts."
                              }),
                              _jsxs("ul", {
                                className: "list-disc pl-5 text-blue-100 space-y-1",
                                children: [
                                  _jsx("li", {
                                    children: "Pre-built studies on key biblical topics and passages"
                                  }),
                                  _jsx("li", {
                                    children: "Custom study creation with Scripture references"
                                  }),
                                  _jsx("li", {
                                    children: "Lesson sequencing and organization"
                                  }),
                                  _jsx("li", {
                                    children: "Guided prompts for discussion and reflection"
                                  })
                                ]
                              })
                            ]
                          }),
                          _jsxs("div", {
                            children: [
                              _jsx("h3", {
                                className: "text-xl font-bold text-yellow-300 mb-3",
                                children: "Scripture Citations"
                              }),
                              _jsx("p", {
                                className: "text-blue-100 mb-3",
                                children: "Every conversation is grounded in Scripture with clear references."
                              }),
                              _jsxs("ul", {
                                className: "list-disc pl-5 text-blue-100 space-y-1",
                                children: [
                                  _jsx("li", {
                                    children: "Automatic verse citations in character responses"
                                  }),
                                  _jsx("li", {
                                    children: "Multiple translation support"
                                  }),
                                  _jsx("li", {
                                    children: "Context-aware Scripture application"
                                  })
                                ]
                              })
                            ]
                          })
                        ]
                      }),
                      _jsxs("div", {
                        className: "space-y-8",
                        children: [
                          _jsxs("div", {
                            children: [
                              _jsx("h3", {
                                className: "text-xl font-bold text-yellow-300 mb-3",
                                children: "Admin & Roles"
                              }),
                              _jsx("p", {
                                className: "text-blue-100 mb-3",
                                children: "Manage access, content, and permissions for your church community."
                              }),
                              _jsxs("ul", {
                                className: "list-disc pl-5 text-blue-100 space-y-1",
                                children: [
                                  _jsx("li", {
                                    children: "Role-based access control (admin, leaders, members)"
                                  }),
                                  _jsx("li", {
                                    children: "Content moderation and oversight"
                                  }),
                                  _jsx("li", {
                                    children: "Study publishing and visibility controls"
                                  }),
                                  _jsx("li", {
                                    children: "Premium content management"
                                  })
                                ]
                              })
                            ]
                          }),
                          _jsxs("div", {
                            children: [
                              _jsx("h3", {
                                className: "text-xl font-bold text-yellow-300 mb-3",
                                children: "Custom Prompts"
                              }),
                              _jsx("p", {
                                className: "text-blue-100 mb-3",
                                children: "Create tailored guidance for specific topics, passages, or church contexts."
                              }),
                              _jsxs("ul", {
                                className: "list-disc pl-5 text-blue-100 space-y-1",
                                children: [
                                  _jsx("li", {
                                    children: "Character instructions for theological alignment"
                                  }),
                                  _jsx("li", {
                                    children: "Custom prompts for guided discussions"
                                  }),
                                  _jsx("li", {
                                    children: "Subject-specific conversation starters"
                                  }),
                                  _jsx("li", {
                                    children: "Application-focused question templates"
                                  })
                                ]
                              })
                            ]
                          }),
                          _jsxs("div", {
                            children: [
                              _jsx("h3", {
                                className: "text-xl font-bold text-yellow-300 mb-3",
                                children: "Group Management"
                              }),
                              _jsx("p", {
                                className: "text-blue-100 mb-3",
                                children: "Organize and oversee small groups, Bible studies, and discipleship cohorts."
                              }),
                              _jsxs("ul", {
                                className: "list-disc pl-5 text-blue-100 space-y-1",
                                children: [
                                  _jsx("li", {
                                    children: "Group creation and member management"
                                  }),
                                  _jsx("li", {
                                    children: "Study assignment to specific groups"
                                  }),
                                  _jsx("li", {
                                    children: "Progress tracking and reporting"
                                  }),
                                  _jsx("li", {
                                    children: "Leader tools and resources"
                                  })
                                ]
                              })
                            ]
                          }),
                          _jsxs("div", {
                            children: [
                              _jsx("h3", {
                                className: "text-xl font-bold text-yellow-300 mb-3",
                                children: "Premium & Pilot Options"
                              }),
                              _jsx("p", {
                                className: "text-blue-100 mb-3",
                                children: "Flexible access models to fit your church's needs and budget."
                              }),
                              _jsxs("ul", {
                                className: "list-disc pl-5 text-blue-100 space-y-1",
                                children: [
                                  _jsx("li", {
                                    children: "Church-wide access plans"
                                  }),
                                  _jsx("li", {
                                    children: "60-day pilot program for new churches"
                                  }),
                                  _jsx("li", {
                                    children: "Optional revenue sharing for member upgrades"
                                  }),
                                  _jsx("li", {
                                    children: "Tiered pricing based on church size"
                                  })
                                ]
                              })
                            ]
                          })
                        ]
                      })
                    ]
                  })
                ]
              })
            }),

            /* Roadmap */
            _jsx("section", {
              className: "px-4 md:px-8 max-w-6xl mx-auto mb-20",
              children: _jsxs("div", {
                className: "bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/15 shadow-lg",
                children: [
                  _jsx("h2", {
                    className: "text-3xl md:text-4xl font-bold text-yellow-400 mb-8 text-center",
                    style: { fontFamily: 'Cinzel, serif' },
                    children: "Coming soon"
                  }),
                  _jsx("p", {
                    className: "text-blue-100 mb-8 text-center max-w-3xl mx-auto",
                    children: "We're constantly improving FaithTalkAI with new features to better serve your church's discipleship needs."
                  }),
                  _jsx("div", {
                    className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
                    children: [
                      _jsxs("div", {
                        className: "bg-white/5 rounded-lg p-4 border border-white/10",
                        children: [
                          _jsx("h3", {
                            className: "text-lg font-semibold text-yellow-300 mb-2",
                            children: "Video Chat Integration"
                          }),
                          _jsx("p", {
                            className: "text-blue-100 text-sm",
                            children: "Connect face-to-face with video coaching and group sessions alongside AI character guidance."
                          })
                        ]
                      }),
                      _jsxs("div", {
                        className: "bg-white/5 rounded-lg p-4 border border-white/10",
                        children: [
                          _jsx("h3", {
                            className: "text-lg font-semibold text-yellow-300 mb-2",
                            children: "Live Group Facilitation"
                          }),
                          _jsx("p", {
                            className: "text-blue-100 text-sm",
                            children: "Enhanced tools for real-time group discussions with screen sharing and collaborative features."
                          })
                        ]
                      }),
                      _jsxs("div", {
                        className: "bg-white/5 rounded-lg p-4 border border-white/10",
                        children: [
                          _jsx("h3", {
                            className: "text-lg font-semibold text-yellow-300 mb-2",
                            children: "Multiple Language Support"
                          }),
                          _jsx("p", {
                            className: "text-blue-100 text-sm",
                            children: "Expand your ministry's reach with character conversations in Spanish, French, and more languages."
                          })
                        ]
                      }),
                      _jsxs("div", {
                        className: "bg-white/5 rounded-lg p-4 border border-white/10",
                        children: [
                          _jsx("h3", {
                            className: "text-lg font-semibold text-yellow-300 mb-2",
                            children: "Church SSO Integration"
                          }),
                          _jsx("p", {
                            className: "text-blue-100 text-sm",
                            children: "Seamless single sign-on with your existing church management system for simplified access."
                          })
                        ]
                      }),
                      _jsxs("div", {
                        className: "bg-white/5 rounded-lg p-4 border border-white/10",
                        children: [
                          _jsx("h3", {
                            className: "text-lg font-semibold text-yellow-300 mb-2",
                            children: "Leadership Analytics"
                          }),
                          _jsx("p", {
                            className: "text-blue-100 text-sm",
                            children: "Gain insights into engagement, popular topics, and discipleship progress across your church."
                          })
                        ]
                      }),
                      _jsxs("div", {
                        className: "bg-white/5 rounded-lg p-4 border border-white/10",
                        children: [
                          _jsx("h3", {
                            className: "text-lg font-semibold text-yellow-300 mb-2",
                            children: "Church Website Integration"
                          }),
                          _jsx("p", {
                            className: "text-blue-100 text-sm",
                            children: "Embed FaithTalkAI directly into your church website for a seamless member experience."
                          })
                        ]
                      })
                    ]
                  })
                ]
              })
            }),

            /* Pilot & Pricing */
            _jsx("section", {
              className: "px-4 md:px-8 max-w-6xl mx-auto mb-20",
              children: _jsxs("div", {
                children: [
                  _jsx("h2", {
                    className: "text-3xl md:text-4xl font-bold text-yellow-400 mb-12 text-center",
                    style: { fontFamily: 'Cinzel, serif' },
                    children: "Pilot program & pricing"
                  }),
                  
                  /* Pilot program */
                  _jsxs("div", {
                    className: "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 backdrop-blur-sm rounded-xl p-8 border border-yellow-500/30 mb-12",
                    children: [
                      _jsx("h3", {
                        className: "text-2xl font-bold text-yellow-300 mb-4 text-center",
                        children: "60-Day Pilot Program"
                      }),
                      _jsx("p", {
                        className: "text-blue-100 text-center mb-6 max-w-3xl mx-auto",
                        children: "We're inviting the first 10 churches to join our pilot program. Get full access to FaithTalkAI for 60 days to experience the impact on your ministry."
                      }),
                      _jsxs("div", {
                        className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-8",
                        children: [
                          _jsxs("div", {
                            className: "bg-white/10 rounded-lg p-4 text-center",
                            children: [
                              _jsx("h4", {
                                className: "font-semibold text-white mb-2",
                                children: "Full Platform Access"
                              }),
                              _jsx("p", {
                                className: "text-blue-100 text-sm",
                                children: "All features, studies, and characters"
                              })
                            ]
                          }),
                          _jsxs("div", {
                            className: "bg-white/10 rounded-lg p-4 text-center",
                            children: [
                              _jsx("h4", {
                                className: "font-semibold text-white mb-2",
                                children: "Onboarding Support"
                              }),
                              _jsx("p", {
                                className: "text-blue-100 text-sm",
                                children: "Dedicated setup call and training"
                              })
                            ]
                          }),
                          _jsxs("div", {
                            className: "bg-white/10 rounded-lg p-4 text-center",
                            children: [
                              _jsx("h4", {
                                className: "font-semibold text-white mb-2",
                                children: "Weekly Office Hours"
                              }),
                              _jsx("p", {
                                className: "text-blue-100 text-sm",
                                children: "Direct access to our team"
                              })
                            ]
                          })
                        ]
                      }),
                      _jsx("div", {
                        className: "text-center",
                        children: _jsx(Link, {
                          to: "/contact?subject=Pilot+Program",
                          className: "inline-block px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold rounded-lg text-lg transition-colors shadow-lg",
                          children: "Apply for Pilot Program"
                        })
                      })
                    ]
                  }),
                  
                  /* Pricing tiers */
                  _jsx("div", {
                    className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8",
                    children: [
                      _jsxs("div", {
                        className: "bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/15 shadow-lg",
                        children: [
                          _jsx("h3", {
                            className: "text-xl font-bold text-yellow-300 mb-2 text-center",
                            children: "Small Church"
                          }),
                          _jsx("p", {
                            className: "text-sm text-blue-200 mb-4 text-center",
                            children: "Up to 100 members"
                          }),
                          _jsxs("div", {
                            className: "text-center mb-6",
                            children: [
                              _jsx("span", {
                                className: "text-3xl font-bold text-white",
                                children: "$99"
                              }),
                              _jsx("span", {
                                className: "text-blue-100",
                                children: "/month"
                              })
                            ]
                          }),
                          _jsxs("ul", {
                            className: "space-y-2 mb-8",
                            children: [
                              _jsxs("li", {
                                className: "flex items-center text-blue-100",
                                children: [
                                  _jsx("svg", {
                                    xmlns: "http://www.w3.org/2000/svg",
                                    className: "h-5 w-5 text-yellow-400 mr-2",
                                    viewBox: "0 0 20 20",
                                    fill: "currentColor",
                                    children: _jsx("path", {
                                      fillRule: "evenodd",
                                      d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
                                      clipRule: "evenodd"
                                    })
                                  }),
                                  "Unlimited conversations"
                                ]
                              }),
                              _jsxs("li", {
                                className: "flex items-center text-blue-100",
                                children: [
                                  _jsx("svg", {
                                    xmlns: "http://www.w3.org/2000/svg",
                                    className: "h-5 w-5 text-yellow-400 mr-2",
                                    viewBox: "0 0 20 20",
                                    fill: "currentColor",
                                    children: _jsx("path", {
                                      fillRule: "evenodd",
                                      d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
                                      clipRule: "evenodd"
                                    })
                                  }),
                                  "5 admin accounts"
                                ]
                              }),
                              _jsxs("li", {
                                className: "flex items-center text-blue-100",
                                children: [
                                  _jsx("svg", {
                                    xmlns: "http://www.w3.org/2000/svg",
                                    className: "h-5 w-5 text-yellow-400 mr-2",
                                    viewBox: "0 0 20 20",
                                    fill: "currentColor",
                                    children: _jsx("path", {
                                      fillRule: "evenodd",
                                      d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
                                      clipRule: "evenodd"
                                    })
                                  }),
                                  "All characters & studies"
                                ]
                              }),
                              _jsxs("li", {
                                className: "flex items-center text-blue-100",
                                children: [
                                  _jsx("svg", {
                                    xmlns: "http://www.w3.org/2000/svg",
                                    className: "h-5 w-5 text-yellow-400 mr-2",
                                    viewBox: "0 0 20 20",
                                    fill: "currentColor",
                                    children: _jsx("path", {
                                      fillRule: "evenodd",
                                      d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
                                      clipRule: "evenodd"
                                    })
                                  }),
                                  "Email support"
                                ]
                              })
                            ]
                          }),
                          _jsx("div", {
                            className: "text-center",
                            children: _jsx(Link, {
                              to: "/contact?subject=Small+Church+Plan",
                              className: "inline-block w-full py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors",
                              children: "Contact Us"
                            })
                          })
                        ]
                      }),
                      _jsxs("div", {
                        className: "bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/15 shadow-lg",
                        children: [
                          _jsx("h3", {
                            className: "text-xl font-bold text-yellow-300 mb-2 text-center",
                            children: "Medium Church"
                          }),
                          _jsx("p", {
                            className: "text-sm text-blue-200 mb-4 text-center",
                            children: "101-500 members"
                          }),
                          _jsxs("div", {
                            className: "text-center mb-6",
                            children: [
                              _jsx("span", {
                                className: "text-3xl font-bold text-white",
                                children: "$199"
                              }),
                              _jsx("span", {
                                className: "text-blue-100",
                                children: "/month"
                              })
                            ]
                          }),
                          _jsxs("ul", {
                            className: "space-y-2 mb-8",
                            children: [
                              _jsxs("li", {
                                className: "flex items-center text-blue-100",
                                children: [
                                  _jsx("svg", {
                                    xmlns: "http://www.w3.org/2000/svg",
                                    className: "h-5 w-5 text-yellow-400 mr-2",
                                    viewBox: "0 0 20 20",
                                    fill: "currentColor",
                                    children: _jsx("path", {
                                      fillRule: "evenodd",
                                      d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
                                      clipRule: "evenodd"
                                    })
                                  }),
                                  "Unlimited conversations"
                                ]
                              }),
                              _jsxs("li", {
                                className: "flex items-center text-blue-100",
                                children: [
                                  _jsx("svg", {
                                    xmlns: "http://www.w3.org/2000/svg",
                                    className: "h-5 w-5 text-yellow-400 mr-2",
                                    viewBox: "0 0 20 20",
                                    fill: "currentColor",
                                    children: _jsx("path", {
                                      fillRule: "evenodd",
                                      d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
                                      clipRule: "evenodd"
                                    })
                                  }),
                                  "15 admin accounts"
                                ]
                              }),
                              _jsxs("li", {
                                className: "flex items-center text-blue-100",
                                children: [
                                  _jsx("svg", {
                                    xmlns: "http://www.w3.org/2000/svg",
                                    className: "h-5 w-5 text-yellow-400 mr-2",
                                    viewBox: "0 0 20 20",
                                    fill: "currentColor",
                                    children: _jsx("path", {
                                      fillRule: "evenodd",
                                      d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
                                      clipRule: "evenodd"
                                    })
                                  }),
                                  "Custom study creation"
                                ]
                              }),
                              _jsxs("li", {
                                className: "flex items-center text-blue-100",
                                children: [
                                  _jsx("svg", {
                                    xmlns: "http://www.w3.org/2000/svg",
                                    className: "h-5 w-5 text-yellow-400 mr-2",
                                    viewBox: "0 0 20 20",
                                    fill: "currentColor",
                                    children: _jsx("path", {
                                      fillRule: "evenodd",
                                      d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
                                      clipRule: "evenodd"
                                    })
                                  }),
                                  "Priority support"
                                ]
                              })
                            ]
                          }),
                          _jsx("div", {
                            className: "text-center",
                            children: _jsx(Link, {
                              to: "/contact?subject=Medium+Church+Plan",
                              className: "inline-block w-full py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors",
                              children: "Contact Us"
                            })
                          })
                        ]
                      }),
                      _jsxs("div", {
                        className: "bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/15 shadow-lg relative",
                        children: [
                          _jsx("div", {
                            className: "absolute -top-4 left-0 right-0 flex justify-center",
                            children: _jsx("span", {
                              className: "bg-yellow-400 text-blue-900 text-sm font-bold px-4 py-1 rounded-full",
                              children: "Most Popular"
                            })
                          }),
                          _jsx("h3", {
                            className: "text-xl font-bold text-yellow-300 mb-2 text-center",
                            children: "Large Church"
                          }),
                          _jsx("p", {
                            className: "text-sm text-blue-200 mb-4 text-center",
                            children: "501-2000 members"
                          }),
                          _jsxs("div", {
                            className: "text-center mb-6",
                            children: [
                              _jsx("span", {
                                className: "text-3xl font-bold text-white",
                                children: "$349"
                              }),
                              _jsx("span", {
                                className: "text-blue-100",
                                children: "/month"
                              })
                            ]
                          }),
                          _jsxs("ul", {
                            className: "space-y-2 mb-8",
                            children: [
                              _jsxs("li", {
                                className: "flex items-center text-blue-100",
                                children: [
                                  _jsx("svg", {
                                    xmlns: "http://www.w3.org/2000/svg",
                                    className: "h-5 w-5 text-yellow-400 mr-2",
                                    viewBox: "0 0 20 20",
                                    fill: "currentColor",
                                    children: _jsx("path", {
                                      fillRule: "evenodd",
                                      d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
                                      clipRule: "evenodd"
                                    })
                                  }),
                                  "Unlimited conversations"
                                ]
                              }),
                              _jsxs("li", {
                                className: "flex items-center text-blue-100",
                                children: [
                                  _jsx("svg", {
                                    xmlns: "http://www.w3.org/2000/svg",
                                    className: "h-5 w-5 text-yellow-400 mr-2",
                                    viewBox: "0 0 20 20",
                                    fill: "currentColor",
                                    children: _jsx("path", {
                                      fillRule: "evenodd",
                                      d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
                                      clipRule: "evenodd"
                                    })
                                  }),
                                  "30 admin accounts"
                                ]
                              }),
                              _jsxs("li", {
                                className: "flex items-center text-blue-100",
                                children: [
                                  _jsx("svg", {
                                    xmlns: "http://www.w3.org/2000/svg",
                                    className: "h-5 w-5 text-yellow-400 mr-2",
                                    viewBox: "0 0 20 20",
                                    fill: "currentColor",
                                    children: _jsx("path", {
                                      fillRule: "evenodd",
                                      d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
                                      clipRule: "evenodd"
                                    })
                                  }),
                                  "Revenue sharing option"
                                ]
                              }),
                              _jsxs("li", {
                                className: "flex items-center text-blue-100",
                                children: [
                                  _jsx("svg", {
                                    xmlns: "http://www.w3.org/2000/svg",
                                    className: "h-5 w-5 text-yellow-400 mr-2",
                                    viewBox: "0 0 20 20",
                                    fill: "currentColor",
                                    children: _jsx("path", {
                                      fillRule: "evenodd",
                                      d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
                                      clipRule: "evenodd"
                                    })
                                  }),
                                  "Dedicated support manager"
                                ]
                              })
                            ]
                          }),
                          _jsx("div", {
                            className: "text-center",
                            children: _jsx(Link, {
                              to: "/contact?subject=Large+Church+Plan",
                              className: "inline-block w-full py-2 bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-medium rounded-lg transition-colors",
                              children: "Contact Us"
                            })
                          })
                        ]
                      }),
                      _jsxs("div", {
                        className: "bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/15 shadow-lg",
                        children: [
                          _jsx("h3", {
                            className: "text-xl font-bold text-yellow-300 mb-2 text-center",
                            children: "Enterprise"
                          }),
                          _jsx("p", {
                            className: "text-sm text-blue-200 mb-4 text-center",
                            children: "2000+ members"
                          }),
                          _jsx("div", {
                            className: "text-center mb-6",
                            children: _jsx("span", {
                              className: "text-2xl font-bold text-white",
                              children: "Custom Pricing"
                            })
                          }),
                          _jsxs("ul", {
                            className: "space-y-2 mb-8",
                            children: [
                              _jsxs("li", {
                                className: "flex items-center text-blue-100",
                                children: [
                                  _jsx("svg", {
                                    xmlns: "http://www.w3.org/2000/svg",
                                    className: "h-5 w-5 text-yellow-400 mr-2",
                                    viewBox: "0 0 20 20",
                                    fill: "currentColor",
                                    children: _jsx("path", {
                                      fillRule: "evenodd",
                                      d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
                                      clipRule: "evenodd"
                                    })
                                  }),
                                  "Unlimited everything"
                                ]
                              }),
                              _jsxs("li", {
                                className: "flex items-center text-blue-100",
                                children: [
                                  _jsx("svg", {
                                    xmlns: "http://www.w3.org/2000/svg",
                                    className: "h-5 w-5 text-yellow-400 mr-2",
                                    viewBox: "0 0 20 20",
                                    fill: "currentColor",
                                    children: _jsx("path", {
                                      fillRule: "evenodd",
                                      d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
                                      clipRule: "evenodd"
                                    })
                                  }),
                                  "Custom integration"
                                ]
                              }),
                              _jsxs("li", {
                                className: "flex items-center text-blue-100",
                                children: [
                                  _jsx("svg", {
                                    xmlns: "http://www.w3.org/2000/svg",
                                    className: "h-5 w-5 text-yellow-400 mr-2",
                                    viewBox: "0 0 20 20",
                                    fill: "currentColor",
                                    children: _jsx("path", {
                                      fillRule: "evenodd",
                                      d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
                                      clipRule: "evenodd"
                                    })
                                  }),
                                  "White-labeling options"
                                ]
                              }),
                              _jsxs("li", {
                                className: "flex items-center text-blue-100",
                                children: [
                                  _jsx("svg", {
                                    xmlns: "http://www.w3.org/2000/svg",
                                    className: "h-5 w-5 text-yellow-400 mr-2",
                                    viewBox: "0 0 20 20",
                                    fill: "currentColor",
                                    children: _jsx("path", {
                                      fillRule: "evenodd",
                                      d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
                                      clipRule: "evenodd"
                                    })
                                  }),
                                  "24/7 premium support"
                                ]
                              })
                            ]
                          }),
                          _jsx("div", {
                            className: "text-center",
                            children: _jsx(Link, {
                              to: "/contact?subject=Enterprise+Plan",
                              className: "inline-block w-full py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors",
                              children: "Contact Us"
                            })
                          })
                        ]
                      })
                    ]
                  }),
                  
                  /* Revenue sharing note */
                  _jsx("div", {
                    className: "mt-12 bg-white/5 rounded-lg p-6 border border-white/10",
                    children: _jsxs("div", {
                      className: "flex flex-col md:flex-row items-start md:items-center gap-4",
                      children: [
                        _jsx("div", {
                          className: "bg-yellow-400/20 p-3 rounded-full",
                          children: _jsx("svg", {
                            xmlns: "http://www.w3.org/2000/svg",
                            className: "h-6 w-6 text-yellow-400",
                            fill: "none",
                            viewBox: "0 0 24 24",
                            stroke: "currentColor",
                            children: _jsx("path", {
                              strokeLinecap: "round",
                              strokeLinejoin: "round",
                              strokeWidth: 2,
                              d: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            })
                          })
                        }),
                        _jsxs("div", {
                          children: [
                            _jsx("h4", {
                              className: "text-lg font-semibold text-yellow-300 mb-1",
                              children: "Optional Revenue Sharing"
                            }),
                            _jsx("p", {
                              className: "text-blue-100",
                              children: "Churches on our Large and Enterprise plans can opt into our revenue sharing program. When your members upgrade to premium individual accounts, your church receives 20% of the subscription revenue as an additional income stream."
                            })
                          ]
                        })
                      ]
                    })
                  })
                ]
              })
            }),

            /* Website integration FAQ */
            _jsx("section", {
              className: "px-4 md:px-8 max-w-6xl mx-auto mb-20",
              children: _jsxs("div", {
                className: "bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/15 shadow-lg",
                children: [
                  _jsx("h3", {
                    className: "text-2xl font-bold text-yellow-300 mb-6",
                    children: "Church Website Integration"
                  }),
                  _jsx("p", {
                    className: "text-blue-100 mb-6",
                    children: "Many churches ask about integrating FaithTalkAI directly into their website. We offer several options:"
                  }),
                  _jsxs("div", {
                    className: "grid grid-cols-1 md:grid-cols-3 gap-6",
                    children: [
                      _jsxs("div", {
                        className: "bg-white/5 rounded-lg p-4 border border-white/10",
                        children: [
                          _jsx("h4", {
                            className: "font-semibold text-yellow-300 mb-2",
                            children: "Branded Subdomain"
                          }),
                          _jsx("p", {
                            className: "text-blue-100 text-sm",
                            children: "A custom yourchurch.faithtalkai.com address that matches your branding while maintaining all platform features."
                          })
                        ]
                      }),
                      _jsxs("div", {
                        className: "bg-white/5 rounded-lg p-4 border border-white/10",
                        children: [
                          _jsx("h4", {
                            className: "font-semibold text-yellow-300 mb-2",
                            children: "Embedded Widget"
                          }),
                          _jsx("p", {
                            className: "text-blue-100 text-sm",
                            children: "Add a chat widget to your existing church website that opens FaithTalkAI in a popup or sidebar."
                          })
                        ]
                      }),
                      _jsxs("div", {
                        className: "bg-white/5 rounded-lg p-4 border border-white/10",
                        children: [
                          _jsx("h4", {
                            className: "font-semibold text-yellow-300 mb-2",
                            children: "Full Integration (Enterprise)"
                          }),
                          _jsx("p", {
                            className: "text-blue-100 text-sm",
                            children: "For larger churches, we can work on deeper integrations with your existing systems, including SSO and custom styling."
                          })
                        ]
                      })
                    ]
                  })
                ]
              })
            }),

            /* Final CTA */
            _jsx("section", {
              className: "px-4 md:px-8 max-w-6xl mx-auto mb-20",
              children: _jsxs("div", {
                className: "bg-gradient-to-r from-blue-600/30 to-indigo-600/30 backdrop-blur-sm rounded-xl p-8 border border-blue-500/30 text-center",
                children: [
                  _jsx("h2", {
                    className: "text-3xl md:text-4xl font-bold text-yellow-400 mb-6",
                    style: { fontFamily: 'Cinzel, serif' },
                    children: "Ready to transform your church's discipleship?"
                  }),
                  _jsx("p", {
                    className: "text-blue-100 mb-8 max-w-3xl mx-auto",
                    children: "Join the first wave of churches using AI to deepen engagement with Scripture in a safe, guided environment."
                  }),
                  _jsxs("div", {
                    className: "flex flex-col sm:flex-row justify-center gap-4",
                    children: [
                      _jsx(Link, {
                        to: "/contact?subject=Demo+Request",
                        className: "px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold rounded-lg text-lg transition-colors shadow-lg",
                        children: "Book a Demo"
                      }),
                      _jsx(Link, {
                        to: "/contact?subject=Pilot+Program",
                        className: "px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg text-lg transition-colors border border-white/20",
                        children: "Apply for Pilot"
                      })
                    ]
                  })
                ]
              })
            })
          ]
        }),

        /* Footer */
        _jsx(Footer, {})
      ]
    })
  );
};

export default PastorsPage;
