import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { useState } from 'react';

const CharacterCard = ({
    character,
    onSelect,
    isSelected = false,
    isFavorite = false,
    onToggleFavorite,
    isFeatured = false,
    onSetAsFeatured,
}) => {
    /* ------------------------------------------------------------------ */
    /*  Derived values & local UI state                                   */
    /* ------------------------------------------------------------------ */
    const avatarUrl = character.avatar_url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=random`;
    const bibleBook = character.bible_book || '';
    const [isDescriptionVisible, setIsDescriptionVisible] = useState(false);

    // Function to toggle description visibility and stop event propagation
    const toggleDescription = (e) => {
        e.stopPropagation();
        setIsDescriptionVisible(!isDescriptionVisible);
    };

    return (
        _jsxs("div", {
            className: "relative",
            children: [
                /* Click-based description modal/tooltip - shown when info button is clicked */
                isDescriptionVisible && _jsxs("div", {
                    className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50",
                    onClick: toggleDescription,
                    children: [
                        _jsxs("div", {
                            className: "relative bg-white rounded-xl p-6 m-4 max-w-md max-h-[80vh] overflow-y-auto shadow-2xl",
                            onClick: (e) => e.stopPropagation(),
                            children: [
                                /* Close button */
                                _jsx("button", {
                                    className: "absolute top-2 right-2 text-gray-500 hover:text-gray-700",
                                    onClick: toggleDescription,
                                    "aria-label": "Close description",
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
                                }),
                                /* Character name and book */
                                _jsx("h3", {
                                    className: "text-xl font-bold text-blue-900 mb-2",
                                    children: character.name
                                }),
                                bibleBook && _jsx("div", {
                                    className: "mb-4 text-sm text-blue-600 font-medium",
                                    children: bibleBook
                                }),
                                /* Full description */
                                _jsx("p", {
                                    className: "text-gray-700",
                                    children: character.description
                                })
                            ]
                        })
                    ]
                }),

                _jsxs(motion.div, {
                    className: `
                        relative flex flex-col sm:flex-row items-center gap-4 
                        rounded-xl border-2 bg-white/90 shadow-lg
                        w-full
                        ${isSelected
                            ? 'border-yellow-400 ring-2 ring-yellow-300/50 shadow-xl'
                            : 'border-white/60 hover:border-yellow-300/70 hover:shadow-xl'}
                    `,
                    whileHover: {
                        scale: 1.02,
                        transition: { duration: 0.2 }
                    },
                    whileTap: { scale: 0.98 },
                    onClick: () => onSelect(character),
                    role: "button",
                    tabIndex: 0,
                    onKeyDown: (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onSelect(character);
                        }
                    },
                    "aria-label": `Chat with ${character.name}${bibleBook ? ` from ${bibleBook}` : ''}`,
                    children: [
                        /* Background and selection indicator */
                        _jsx("div", {
                            className: "absolute inset-0 bg-gradient-to-br from-blue-50/40 via-white/50 to-yellow-50/30 mix-blend-overlay"
                        }),
                        isSelected && _jsx("div", {
                            className: "absolute -inset-0.5 bg-yellow-300 opacity-20 blur-md rounded-xl animate-pulse"
                        }),
                        
                        /* Favorite button */
                        _jsx("button", {
                            "aria-label": isFavorite ? 'Remove from favorites' : 'Add to favorites',
                            onClick: (e) => {
                                e.stopPropagation();
                                if (typeof onToggleFavorite === 'function') {
                                    onToggleFavorite();
                                }
                            },
                            className: `
                                absolute top-2 left-2 z-10 rounded-full p-1.5 
                                ${isFavorite
                                    ? 'bg-yellow-100 text-yellow-600 shadow-md'
                                    : 'bg-white/80 text-gray-400 hover:text-gray-600 hover:bg-white/90'}
                            `,
                            children: isFavorite ? (
                                _jsx("svg", {
                                    xmlns: "http://www.w3.org/2000/svg",
                                    viewBox: "0 0 20 20",
                                    fill: "currentColor",
                                    className: "h-5 w-5",
                                    children: _jsx("path", {
                                        d: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                                    })
                                })
                            ) : (
                                _jsx("svg", {
                                    xmlns: "http://www.w3.org/2000/svg",
                                    fill: "none",
                                    viewBox: "0 0 20 20",
                                    stroke: "currentColor",
                                    className: "h-5 w-5",
                                    children: _jsx("path", {
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        strokeWidth: 1.5,
                                        d: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                                    })
                                })
                            )
                        }),
                        
                        /* Info button - positioned in top right corner */
                        _jsx("button", {
                            "aria-label": "Show full description",
                            onClick: toggleDescription,
                            /*  SUPER-OBVIOUS   ⓘ   BUTTON
                                ----------------------------------------------------
                                • Blue background with white icon  
                                • Blue ring on focus  
                                • Larger icon (h-7 w-7) and padding  
                                • Slight drop-shadow for depth  
                            */
                            className: `
                                absolute top-3 right-3 z-20 rounded-full p-2
                                bg-blue-600 text-white shadow-lg
                                hover:bg-blue-700 focus:outline-none
                                focus:ring-4 focus:ring-blue-300
                                transition-colors
                            `,
                            children: _jsx("svg", {
                                xmlns: "http://www.w3.org/2000/svg",
                                className: "h-7 w-7",
                                viewBox: "0 0 20 20",
                                fill: "currentColor",
                                children: _jsx("path", {
                                    fillRule: "evenodd",
                                    d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z",
                                    clipRule: "evenodd"
                                })
                            })
                        }),
                        
                        /* Avatar */
                        _jsxs("div", {
                            className: "relative w-[150px] h-[150px] flex-shrink-0",
                            children: [
                                _jsx("div", {
                                    className: "absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent rounded-full"
                                }),
                                _jsx("img", {
                                    src: avatarUrl,
                                    alt: character.name,
                                    className: `w-[150px] h-[150px] object-cover rounded-full border-2 ${isSelected ? 'border-yellow-400' : 'border-white/40'}`,
                                    onError: (e) => {
                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=random`;
                                    }
                                }),
                                bibleBook && _jsx("div", {
                                    className: "absolute bottom-1 left-1 bg-blue-900/60 text-white text-xs px-2 py-0.5 rounded backdrop-blur-sm",
                                    children: bibleBook
                                })
                            ]
                        }),
                        
                        /* Content */
                        _jsxs("div", {
                            className: "flex flex-1 flex-col p-4 sm:pl-0",
                            children: [
                                _jsx("h3", {
                                    className: "mb-1 text-xl font-extrabold text-blue-900",
                                    children: character.name
                                }),
                                _jsx("div", {
                                    className: "h-0.5 w-12 bg-yellow-400 rounded-full mb-2"
                                }),
                                /* Fixed-height description with line clamp */
                                _jsx("p", {
                                    className: "text-sm text-gray-700 line-clamp-3",
                                    children: character.description
                                })
                            ]
                        }),
                        
                        /* FIXED ACTION BUTTON - positioned completely outside the flow */
                        _jsx("div", {
                            className: "absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto",
                            children: _jsx("button", {
                                onClick: (e) => {
                                    e.stopPropagation();
                                    onSelect(character);
                                },
                                className: `
                                    w-full sm:w-auto px-6 py-2 rounded-lg text-sm font-semibold shadow-md
                                    ${isSelected
                                        ? 'bg-yellow-500 text-blue-900 hover:bg-yellow-600'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'}
                                `,
                                "aria-label": `Start chat with ${character.name}`,
                                children: isSelected ? 'Continue Chat' : 'Start Chat'
                            })
                        }),
                        
                        /* Selected indicator */
                        isSelected && _jsx("div", {
                            className: "absolute top-10 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-yellow-500 text-blue-900 shadow-md z-10",
                            children: _jsx("svg", {
                                xmlns: "http://www.w3.org/2000/svg",
                                viewBox: "0 0 24 24",
                                fill: "currentColor",
                                className: "h-4 w-4",
                                children: _jsx("path", {
                                    fillRule: "evenodd",
                                    d: "M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z",
                                    clipRule: "evenodd"
                                })
                            })
                        })
                    ]
                })
            ]
        })
    );
};

export default CharacterCard;