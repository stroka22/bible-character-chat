import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo, useState, useCallback } from 'react';

// Test: Add back memoized SVG components
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
    // ------------------------------------------------------------------
    // Safety check
    // ------------------------------------------------------------------
    if (!character || !character.id || !character.name) return null;

    // ------------------------------------------------------------------
    // Local state & memoised callbacks
    // ------------------------------------------------------------------
    const [isHovered, setIsHovered] = useState(false);
    const [isDescriptionVisible, setIsDescriptionVisible] = useState(false);

    const handleMouseEnter = useCallback(() => setIsHovered(true), []);
    const handleMouseLeave = useCallback(() => setIsHovered(false), []);

    const handleInfoClick = useCallback((e) => {
        e.stopPropagation();
        setIsDescriptionVisible((prev) => !prev);
    }, []);

    const handleFavoriteClick = useCallback((e) => {
        e.stopPropagation();
        if (typeof onToggleFavorite === 'function') onToggleFavorite();
    }, [onToggleFavorite]);

    const handleSetFeatured = useCallback((e) => {
        e.stopPropagation();
        if (typeof onSetAsFeatured === 'function') onSetAsFeatured(character);
    }, [onSetAsFeatured, character]);

    const handleChatClick = useCallback((e) => {
        e.stopPropagation();
        onSelect(character);
    }, [onSelect, character]);

    const avatarUrl = character.avatar_url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=random`;

    // ------------------------------------------------------------------
    // Render
    // ------------------------------------------------------------------
    return (
        _jsxs("div", {
            /* ------------------------------------------------------------------
             * When the modal is open (isDescriptionVisible === true) we suppress
             * all hover/transform effects so the background card stays still
             * behind the overlay.  This prevents the “screen shaking” users
             * experienced when moving the mouse between the card and the modal.
             * ------------------------------------------------------------------ */
            className: `bg-white/10 p-4 rounded-lg transition-colors cursor-pointer h-72 flex flex-col justify-between ${
                isDescriptionVisible
                    ? 'bg-white/15'                       /* fixed state */
                    : isHovered
                        ? 'hover:bg-white/20 transform scale-105'
                        : 'hover:bg-white/15'
            }`,
            onClick: () => onSelect(character),
            /* Disable hover handlers while the modal is open to avoid jitter */
            onMouseEnter: !isDescriptionVisible ? handleMouseEnter : undefined,
            onMouseLeave: !isDescriptionVisible ? handleMouseLeave : undefined,
            children: [
                _jsx("img", {
                    src: avatarUrl,
                    alt: character.name,
                    className: "w-20 h-20 rounded-full mx-auto mb-3",
                    onError: (e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=random`;
                    }
                }),
                _jsx("h3", {
                    /* Increase front-of-card character name for better readability */
                    className: "font-bold text-xl text-yellow-400 text-center mb-2",
                    style: { fontFamily: 'Cinzel, serif' },
                    children: character.name
                }),

                _jsxs("div", {
                    className: "flex justify-center gap-2 mb-3",
                    children: [
                        _jsx("button", {
                            onClick: handleFavoriteClick,
                            className: `text-gray-400 hover:text-yellow-400 p-1 ${isFavorite ? 'text-yellow-400' : ''}`,
                            "aria-label": "Toggle favorite",
                            title: isFavorite ? "Remove from Favorites" : "Add to Favorites",
                            children: _jsx(StarIcon, { isFilled: isFavorite })
                        }),
                        _jsx("button", {
                            onClick: handleSetFeatured,
                            className: `text-gray-400 hover:text-yellow-400 p-1 ${isFeatured ? 'text-yellow-400' : ''}`,
                            "aria-label": "Set as featured",
                            title: isFeatured ? "Currently Featured" : "Set as Featured",
                            children: _jsx(BookmarkIcon, { isFilled: isFeatured })
                        }),
                        _jsx("button", {
                            onClick: handleInfoClick,
                            className: "text-gray-400 hover:text-blue-400 p-1",
                            "aria-label": "Toggle description",
                            title: "Info",
                            children: _jsx(InfoIcon, {})
                        }),
                        _jsx("button", {
                            onClick: handleChatClick,
                            className: "text-gray-400 hover:text-green-400 p-1",
                            "aria-label": "Chat with character",
                            title: "Chat",
                            children: _jsx(ChatIcon, {})
                        })
                    ]
                }),

                /* ------------------------------------------------------------------
                 * Complex modal / overlay with full character info
                 * ------------------------------------------------------------------ */
                isDescriptionVisible && _jsxs("div", {
                    /* Keep modal always centered and visible (simpler approach) */
                    className: "fixed inset-0 z-50 bg-black/60 p-4 flex items-center justify-center",
                    style: { alignItems: 'center', justifyContent: 'center' },
                    onClick: handleInfoClick,
                    children: [
                        _jsxs("div", {
                            /* ------------------------------------------------------------------
                             * COMPACT MODAL
                             * ------------------------------------------------------------------ */
                            className: "relative bg-gradient-to-br from-indigo-50 via-blue-50 to-white rounded-lg p-6 w-full max-w-md max-h-[85vh] overflow-y-auto mx-auto my-auto shadow-xl border border-indigo-200",
                            onClick: (e) => e.stopPropagation(),
                            children: [
                                /* Decorative background elements */
                                _jsx("div", {
                                    className: "absolute top-0 right-0 w-20 h-20 bg-yellow-300/15 rounded-full -mr-6 -mt-6 z-0"
                                }),
                                _jsx("div", {
                                    className: "absolute bottom-0 left-0 w-24 h-24 bg-indigo-300/15 rounded-full -ml-6 -mb-6 z-0"
                                }),

                                /* Close button */
                                _jsx("button", {
                                    className: "absolute top-2 right-2 text-gray-500 hover:text-red-500 bg-white rounded-full p-1 shadow-sm z-10 transition-colors",
                                    onClick: handleInfoClick,
                                    "aria-label": "Close description",
                                    children: _jsx("svg", {
                                        xmlns: "http://www.w3.org/2000/svg",
                                        className: "h-5 w-5",
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
                                    className: "w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden border-3 border-yellow-400 shadow-md relative z-10",
                                    children: _jsx("img", {
                                        src: avatarUrl,
                                        alt: character.name,
                                        className: "w-full h-full object-cover"
                                    })
                                }),

                                /* Character name */
                                _jsxs("div", {
                                    className: "text-center mb-4 relative z-10",
                                    children: [
                                        _jsx("h2", {
                                            className: "text-xl font-bold text-indigo-900 mb-1",
                                            style: { fontFamily: 'Cinzel, serif' },
                                            children: character.name
                                        }),
                                        _jsx("div", {
                                            className: "h-0.5 w-16 bg-yellow-400 rounded-full mx-auto"
                                        })
                                    ]
                                }),

                                /* Bible books section */
                                character.bible_book && _jsxs("div", {
                                    className: "bg-indigo-50 border border-indigo-200 rounded-md p-3 mb-4 relative z-10",
                                    children: [
                                        _jsxs("div", {
                                            className: "flex items-center mb-2",
                                            children: [
                                                _jsx("svg", {
                                                    xmlns: "http://www.w3.org/2000/svg",
                                                    className: "h-4 w-4 text-indigo-700 mr-1",
                                                    viewBox: "0 0 20 20",
                                                    fill: "currentColor",
                                                    children: _jsx("path", {
                                                        d: "M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"
                                                    })
                                                }),
                                                _jsx("h3", {
                    className: "font-bold text-xl text-yellow-400 text-center mb-2",
                                                    children: "Scripture"
                                                })
                                            ]
                                        }),
                                        _jsx("div", {
                                            className: "flex flex-wrap gap-1",
                                            children: character.bible_book.split(',').map((book, index) => (
                                                _jsx("span", {
                                                    className: "bg-indigo-600/90 text-white px-2 py-0.5 rounded-full text-xs font-medium shadow-sm",
                                                    children: book.trim()
                                                }, `book-${index}-${book.trim()}`)
                                            ))
                                        })
                                    ]
                                }),

                                /* Description section */
                                _jsxs("div", {
                                    className: "relative z-10",
                                    children: [
                                        _jsxs("div", {
                                            className: "flex items-center mb-2",
                                            children: [
                                                _jsx("svg", {
                                                    xmlns: "http://www.w3.org/2000/svg",
                                                    className: "h-4 w-4 text-indigo-700 mr-1",
                                                    viewBox: "0 0 20 20",
                                                    fill: "currentColor",
                                                    children: _jsx("path", {
                                                        fillRule: "evenodd",
                                                        d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z",
                                                        clipRule: "evenodd"
                                                    })
                                                }),
                                                _jsx("h3", {
                                                    className: "text-sm font-semibold text-indigo-800",
                                                    children: "About"
                                                })
                                            ]
                                        }),
                                        _jsx("p", {
                                            className: "text-gray-700 text-sm leading-relaxed",
                                            children: character.description
                                        })
                                    ]
                                }),

                                /* Action button within modal */
                                _jsxs("button", {
                                    onClick: (e) => {
                                        e.stopPropagation();
                                        onSelect(character);
                                        setIsDescriptionVisible(false);
                                    },
                                    className: "mt-4 w-full bg-indigo-700 hover:bg-indigo-800 text-white font-medium py-2 px-4 rounded-md shadow-md transition-colors flex items-center justify-center relative z-10",
                                    children: [
                                        _jsx(ChatIcon, {}),
                                        `Chat with ${character.name}`
                                    ]
                                })
                            ]
                        })
                    ]
                }),

                _jsx("button", {
                    onClick: handleChatClick,
                    className: "w-full bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold py-2 px-4 rounded-lg transition-colors",
                    children: "Chat Now"
                })
            ]
        })
    );
};

export default CharacterCard;
