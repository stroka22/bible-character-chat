import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { useState, useCallback, memo } from 'react';

// Memoized SVG components to improve performance
const StarIcon = memo(({ isFilled }) => (
    _jsx("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 20 20",
        fill: isFilled ? "currentColor" : "none",
        stroke: "currentColor",
        strokeWidth: isFilled ? "0" : "1.5",
        className: "h-5 w-5",
        children: _jsx("path", {
            d: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
        })
    })
));

const BookmarkIcon = memo(({ isFilled }) => (
    _jsx("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 20 20",
        fill: isFilled ? "currentColor" : "none",
        stroke: "currentColor",
        strokeWidth: isFilled ? "0" : "1.5",
        className: "h-5 w-5",
        children: _jsx("path", {
            d: "M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"
        })
    })
));

const InfoIcon = memo(() => (
    _jsx("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        className: "h-5 w-5",
        viewBox: "0 0 20 20",
        fill: "currentColor",
        children: _jsx("path", {
            fillRule: "evenodd",
            d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z",
            clipRule: "evenodd"
        })
    })
));

const ChatIcon = memo(() => (
    _jsx("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        className: "h-4 w-4 mr-2",
        viewBox: "0 0 20 20",
        fill: "currentColor",
        children: _jsx("path", {
            fillRule: "evenodd",
            d: "M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z",
            clipRule: "evenodd"
        })
    })
));

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
    /*  Safety checks to avoid undefined property errors                  */
    /* ------------------------------------------------------------------ */
    if (!character) {
        console.warn('CharacterCard: character prop is undefined');
        return null;
    }

    if (!character.id) {
        console.warn('CharacterCard: character.id is undefined', character);
        return null;
    }

    if (!character.name) {
        console.warn('CharacterCard: character.name is undefined', character);
        return null;
    }

    /* ------------------------------------------------------------------ */
    /*  Derived values & local UI state                                   */
    /* ------------------------------------------------------------------ */
    const avatarUrl = character.avatar_url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=random`;
    const bibleBook = character.bible_book || '';
    const [isDescriptionVisible, setIsDescriptionVisible] = useState(false);

    // Function to toggle description visibility and stop event propagation
    const toggleDescription = useCallback((e) => {
        e.stopPropagation();
        setIsDescriptionVisible(prev => !prev);
    }, []);

    // Parse Bible books into an array if multiple books are present
    const bibleBooks = bibleBook ? bibleBook.split(',').map(book => book.trim()) : [];

    // Optimized event handlers
    const handleFavoriteClick = useCallback((e) => {
        e.stopPropagation();
        if (typeof onToggleFavorite === 'function') {
            onToggleFavorite();
        }
    }, [onToggleFavorite]);

    const handleFeaturedClick = useCallback((e) => {
        e.stopPropagation();
        if (typeof onSetAsFeatured === 'function') {
            onSetAsFeatured(character);
        }
    }, [onSetAsFeatured, character]);

    const handleChatClick = useCallback((e) => {
        e.stopPropagation();
        onSelect(character);
    }, [onSelect, character]);

    const handleModalChatClick = useCallback((e) => {
        e.stopPropagation();
        onSelect(character);
        setIsDescriptionVisible(false);
    }, [onSelect, character]);

    return (
        _jsxs("div", {
            className: "relative",
            children: [
                /* Click-based description modal/tooltip - shown when info button is clicked */
                isDescriptionVisible && _jsxs("div", {
                    className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60",
                    onClick: toggleDescription,
                    children: [
                        _jsxs("div", {
                            className: "relative bg-gradient-to-br from-indigo-50 via-blue-50 to-white rounded-xl p-8 m-4 max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl border-2 border-indigo-200",
                            onClick: (e) => e.stopPropagation(),
                            children: [
                                /* Decorative elements */
                                _jsx("div", {
                                    className: "absolute top-0 right-0 w-32 h-32 bg-yellow-300/20 rounded-full -mr-10 -mt-10 z-0"
                                }),
                                _jsx("div", {
                                    className: "absolute bottom-0 left-0 w-40 h-40 bg-indigo-300/20 rounded-full -ml-10 -mb-10 z-0"
                                }),
                                
                                /* Close button */
                                _jsx("button", {
                                    className: "absolute top-3 right-3 text-gray-500 hover:text-red-500 bg-white rounded-full p-1 shadow-md z-10 transition-colors",
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
                                
                                /* Character avatar */
                                _jsx("div", {
                                    className: "w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-yellow-400 shadow-lg",
                                    children: _jsx("img", {
                                        src: avatarUrl,
                                        alt: character.name,
                                        className: "w-full h-full object-cover"
                                    })
                                }),
                                
                                /* Character name with decorative elements */
                                _jsxs("div", {
                                    className: "text-center mb-6 relative z-10",
                                    children: [
                                        _jsx("h2", {
                                            className: "text-2xl font-bold text-indigo-900 mb-1",
                                            style: { fontFamily: 'Cinzel, serif' },
                                            children: character.name
                                        }),
                                        _jsx("div", {
                                            className: "h-1 w-20 bg-yellow-400 rounded-full mx-auto mb-2"
                                        })
                                    ]
                                }),
                                
                                /* Bible Books Section */
                                bibleBooks.length > 0 && _jsxs("div", {
                                    className: "bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6 relative z-10",
                                    children: [
                                        _jsxs("div", {
                                            className: "flex items-center mb-2",
                                            children: [
                                                _jsx("svg", {
                                                    xmlns: "http://www.w3.org/2000/svg",
                                                    className: "h-5 w-5 text-indigo-700 mr-2",
                                                    viewBox: "0 0 20 20",
                                                    fill: "currentColor",
                                                    children: _jsx("path", {
                                                        d: "M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"
                                                    })
                                                }),
                                                _jsx("h3", {
                                                    className: "text-lg font-semibold text-indigo-800",
                                                    children: "Found in Scripture in the Books of..."
                                                })
                                            ]
                                        }),
                                        _jsx("div", {
                                            className: "flex flex-wrap gap-2",
                                            children: bibleBooks.map((book, index) => (
                                                _jsx("span", {
                                                    className: "bg-indigo-600/90 text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm",
                                                    children: book,
                                                    key: `book-${index}-${book}`
                                                })
                                            ))
                                        })
                                    ]
                                }),
                                
                                /* Description Section */
                                _jsxs("div", {
                                    className: "relative z-10",
                                    children: [
                                        _jsxs("div", {
                                            className: "flex items-center mb-3",
                                            children: [
                                                _jsx("svg", {
                                                    xmlns: "http://www.w3.org/2000/svg",
                                                    className: "h-5 w-5 text-indigo-700 mr-2",
                                                    viewBox: "0 0 20 20",
                                                    fill: "currentColor",
                                                    children: _jsx("path", {
                                                        fillRule: "evenodd",
                                                        d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z",
                                                        clipRule: "evenodd"
                                                    })
                                                }),
                                                _jsx("h3", {
                                                    className: "text-lg font-semibold text-indigo-800",
                                                    children: "About this Character"
                                                })
                                            ]
                                        }),
                                        _jsx("p", {
                                            className: "text-gray-700 leading-relaxed",
                                            children: character.description
                                        })
                                    ]
                                }),
                                
                                /* Action Button */
                                _jsxs("button", {
                                    onClick: handleModalChatClick,
                                    className: "mt-6 w-full bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center",
                                    children: [
                                        _jsx(ChatIcon, { key: "modal-chat-icon" }),
                                        `Chat with ${character.name}`
                                    ]
                                })
                            ]
                        })
                    ]
                }),

                _jsxs(motion.div, {
                    /* ------------------------------------------------------------------
                     * Enhanced card container with gradient background and thicker border
                     * ------------------------------------------------------------------ */
                    className: `
                        relative flex flex-col items-center gap-3
                        rounded-xl shadow-md w-full p-4
                        h-[280px]                                   /* reduced height */
                        border-3 border-yellow-400                   /* thicker yellow border */
                        hover:border-4 hover:border-yellow-500       /* even thicker on hover */
                        hover:shadow-lg transition-all
                        bg-gradient-to-br from-indigo-50 via-white to-blue-50
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
                            className: "absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-100/40 via-white/30 to-blue-100/40"
                        }),
                        isSelected && _jsx("div", {
                            className: "absolute -inset-0.5 bg-yellow-300 opacity-20 blur-md rounded-xl animate-pulse"
                        }),
                        
                        /* ------------------------------------------------------------------
                         * Favorite  ⭐  button  (top-left)
                         * ------------------------------------------------------------------ */
                        _jsx("button", {
                            onClick: handleFavoriteClick,
                            className: `
                                absolute top-3 left-3 z-20 rounded-full p-1.5
                                ${isFavorite
                                    ? 'bg-yellow-300 text-indigo-900 shadow-md'
                                    : 'bg-white/90 text-gray-400 hover:text-yellow-500 hover:bg-white'}
                                transition-colors
                            `,
                            title: isFavorite ? 'Remove from favorites' : 'Add to favorites',
                            children: _jsx(StarIcon, { isFilled: isFavorite })
                        }),

                        /* ------------------------------------------------------------------
                         * Featured 📌 button (top-middle)
                         * ------------------------------------------------------------------ */
                        _jsx("button", {
                            onClick: handleFeaturedClick,
                            className: `
                                absolute top-3 left-12 z-20 rounded-full p-1.5
                                ${isFeatured
                                    ? 'bg-yellow-500 text-indigo-900 shadow-md'
                                    : 'bg-white/90 text-gray-400 hover:text-yellow-500 hover:bg-white'}
                                transition-colors
                            `,
                            title: isFeatured ? 'Current featured character' : 'Set as featured character',
                            children: _jsx(BookmarkIcon, { isFilled: isFeatured })
                        }),

                        /* Info button - positioned in top right corner */
                        _jsx("button", {
                            "aria-label": "Show full description",
                            onClick: toggleDescription,
                            className: `
                                absolute top-3 right-3 z-20 rounded-full p-2
                                bg-indigo-700 text-white shadow-lg
                                hover:bg-indigo-800 focus:outline-none
                                focus:ring-4 focus:ring-indigo-300
                                transition-colors
                            `,
                            children: _jsx(InfoIcon)
                        }),
                        
                        /* Avatar with enhanced border */
                        _jsx("div", {
                            className: "relative w-[120px] h-[120px] flex-shrink-0 mt-4",
                            children: _jsx("img", {
                                src: avatarUrl,
                                alt: character.name,
                                className: `w-[120px] h-[120px] object-cover rounded-full border-3 ${isSelected ? 'border-yellow-400' : 'border-indigo-200'} shadow-md`,
                                onError: (e) => {
                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=random`;
                                }
                            })
                        }),
                        
                        /* Chat with Character Name button - darker indigo to match website theme */
                        _jsxs("button", {
                            className: "mt-4 bg-indigo-700 hover:bg-indigo-800 text-white font-medium py-2 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center",
                            onClick: handleChatClick,
                            children: [
                                _jsx(ChatIcon, { key: "card-chat-icon" }),
                                `Chat with ${character.name}`
                            ]
                        }),
                        
                        /* Featured badge - if needed */
                        isFeatured && _jsx("span", {
                            className: "absolute bottom-3 right-3 text-xs bg-yellow-500/90 text-indigo-900 font-semibold px-2 py-0.5 rounded-full shadow",
                            children: "Featured"
                        })
                    ]
                })
            ]
        })
    );
};

export default CharacterCard;