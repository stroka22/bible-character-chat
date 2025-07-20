import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import ScriptureReference from './ScriptureReference';

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

const panelVariants = {
    hidden: { x: '100%', opacity: 0 },
    visible: { x: '0%', opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { x: '100%', opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } },
};

const CollapsibleSection = ({ title, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    
    return (
        _jsxs("section", { 
            className: `${isOpen ? '' : 'collapsed'} mb-4 bg-[rgba(255,255,255,0.05)] rounded-lg p-4 border border-[rgba(255,255,255,0.1)] transition-colors hover:bg-[rgba(255,255,255,0.08)]`,
            children: [
                _jsx("h4", { 
                    className: "text-lg text-blue-300 mb-2 border-b border-[rgba(255,255,255,0.1)] pb-1 flex justify-between items-center cursor-pointer user-select-none",
                    onClick: () => setIsOpen(!isOpen),
                    children: [
                        _jsx("span", { children: title }),
                        _jsx("span", { 
                            className: "text-xl font-bold transition-transform",
                            children: isOpen ? "−" : "+"
                        })
                    ]
                }),
                _jsx("div", { 
                    className: `section-content ${isOpen ? 'block' : 'hidden'}`,
                    children: children
                })
            ]
        })
    );
};

const RelationshipGroup = ({ title, members }) => {
    if (!members || members.length === 0) return null;
    
    return (
        _jsxs("div", { 
            className: "relationship-group mb-3",
            children: [
                _jsx("h5", { 
                    className: "font-semibold text-yellow-400 mb-1 text-sm",
                    children: title.charAt(0).toUpperCase() + title.slice(1)
                }),
                _jsx("div", {
                    children: members.map((name, index) => (
                        _jsx("span", {
                            className: "relationship-chip inline-block bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.2)] rounded-full px-2 py-1 text-xs mr-2 mb-2 whitespace-nowrap",
                            children: name
                        }, `${title}-${index}`)
                    ))
                })
            ]
        })
    );
};

const CharacterInsightsPanel = ({ character, isOpen, onClose }) => {
    const [relationships, setRelationships] = useState({});
    
    useEffect(() => {
        if (character && character.relationships) {
            // Parse relationships if it's a string (JSON)
            if (typeof character.relationships === 'string') {
                try {
                    setRelationships(JSON.parse(character.relationships));
                } catch (e) {
                    console.error('Failed to parse relationships JSON:', e);
                    setRelationships({});
                }
            } else if (typeof character.relationships === 'object') {
                setRelationships(character.relationships);
            }
        } else {
            setRelationships({});
        }
    }, [character]);

    if (!character) {
        return null;
    }

    return (
        _jsx(AnimatePresence, { 
            children: isOpen && (
                _jsxs(_Fragment, { 
                    children: [
                        _jsx(motion.div, { 
                            className: "fixed inset-0 bg-black z-40 md:hidden", 
                            variants: {
                                hidden: { opacity: 0 },
                                visible: { opacity: 0.5 },
                                exit: { opacity: 0 }
                            },
                            initial: "hidden",
                            animate: "visible",
                            exit: "exit",
                            onClick: onClose 
                        }),
                        _jsxs(motion.div, { 
                            className: "insights-panel fixed right-0 top-0 bottom-0 w-full sm:w-[350px] z-50 overflow-y-auto bg-gradient-to-b from-[#1a1a4a] to-[#2a2a6a] border-l border-[rgba(255,255,255,0.15)] shadow-[-5px_0_15px_rgba(0,0,0,0.2)] p-5",
                            variants: panelVariants,
                            initial: "hidden",
                            animate: "visible",
                            exit: "exit",
                            children: [
                                _jsx("div", {
                                    className: "close-insights absolute top-3 right-3 w-8 h-8 rounded-full bg-[rgba(250,204,21,0.15)] border border-yellow-400 text-yellow-400 font-bold leading-7 text-center cursor-pointer transition-all hover:bg-yellow-400 hover:text-[#0a0a2a] hover:rotate-90",
                                    onClick: onClose,
                                    children: "×"
                                }),
                                _jsx("img", { 
                                    src: getSafeAvatarUrl(character.name, character.avatar_url), 
                                    alt: character.name, 
                                    className: "portrait w-[120px] h-[120px] rounded-full object-cover border-3 border-yellow-400 mx-auto mb-4 block",
                                    onError: (e) => {
                                        e.target.src = generateFallbackAvatar(character.name);
                                    } 
                                }),
                                _jsx("h3", { 
                                    className: "text-2xl font-bold text-yellow-400 mb-5 text-center",
                                    style: { fontFamily: 'Cinzel, serif' },
                                    children: "Character Insights" 
                                }),
                                
                                _jsx(CollapsibleSection, { 
                                    title: "Historical Context",
                                    children: _jsxs("div", {
                                        children: [
                                            _jsxs("p", { 
                                                className: "text-white mb-2 text-sm",
                                                children: [
                                                    _jsx("strong", { children: "Time Period: " }),
                                                    character.timeline_period || "Unknown"
                                                ]
                                            }),
                                            _jsxs("p", { 
                                                className: "text-white mb-2 text-sm",
                                                children: [
                                                    _jsx("strong", { children: "Location: " }),
                                                    character.geographic_location || "Unknown"
                                                ]
                                            }),
                                            _jsx("p", { 
                                                className: "text-white text-sm",
                                                children: character.historical_context || "No historical context available."
                                            })
                                        ]
                                    })
                                }),
                                
                                _jsx(CollapsibleSection, { 
                                    title: "Key Scripture References",
                                    children: character.key_scripture_references ? (
                                        _jsx("ul", { 
                                            className: "text-white text-sm",
                                            children: character.key_scripture_references
                                                .split(/[;,]/)
                                                .map((ref, index) => (
                                                    _jsx("li", { 
                                                        className: "mb-1",
                                                        children: _jsx(ScriptureReference, { 
                                                            reference: ref.trim(), 
                                                            className: "scripture-reference text-blue-300 underline cursor-pointer hover:bg-[rgba(99,179,237,0.2)] px-1 rounded" 
                                                        }) 
                                                    }, index)
                                                ))
                                        })
                                    ) : (
                                        _jsx("p", { 
                                            className: "text-white text-sm",
                                            children: "No key scripture references available."
                                        })
                                    )
                                }),
                                
                                _jsx(CollapsibleSection, { 
                                    title: "Theological Significance",
                                    children: _jsx("p", { 
                                        className: "text-white text-sm",
                                        children: character.theological_significance || "No theological significance provided."
                                    })
                                }),
                                
                                _jsx(CollapsibleSection, { 
                                    title: "Relationships",
                                    children: Object.keys(relationships).length > 0 ? (
                                        _jsx("div", {
                                            children: Object.entries(relationships).map(([type, members]) => (
                                                _jsx(RelationshipGroup, {
                                                    title: type,
                                                    members: Array.isArray(members) ? members : [members]
                                                }, type)
                                            ))
                                        })
                                    ) : (
                                        _jsx("p", { 
                                            className: "text-white text-sm",
                                            children: "No relationship data available."
                                        })
                                    )
                                }),
                                
                                _jsx(CollapsibleSection, { 
                                    title: "Study Questions",
                                    children: character.study_questions ? (
                                        _jsx("ul", { 
                                            className: "text-white text-sm list-disc pl-5 space-y-1",
                                            children: character.study_questions
                                                .split('\n')
                                                .map((q, index) => (
                                                    _jsx("li", { children: q.trim() }, index)
                                                ))
                                        })
                                    ) : (
                                        _jsx("p", { 
                                            className: "text-white text-sm",
                                            children: "No study questions available."
                                        })
                                    )
                                })
                            ]
                        })
                    ]
                })
            )
        })
    );
};

export default CharacterInsightsPanel;
