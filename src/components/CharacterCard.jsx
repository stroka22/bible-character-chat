import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo } from 'react';

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
    // Basic safety check
    if (!character || !character.id || !character.name) {
        return null;
    }

    const avatarUrl = character.avatar_url || 
        `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=random`;

    return (
        _jsxs("div", {
            className: "bg-white/10 p-4 rounded-lg hover:bg-white/15 transition-colors cursor-pointer",
            onClick: () => onSelect(character),
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
                    className: "font-bold text-lg text-yellow-400 text-center mb-2",
                    style: { fontFamily: 'Cinzel, serif' },
                    children: character.name
                }),
                _jsx("p", {
                    className: "text-sm text-white/80 text-center mb-3 line-clamp-2",
                    children: character.description || "No description"
                }),
                
                // Test: Display the SVG icons (but don't use them functionally yet)
                _jsxs("div", {
                    className: "flex justify-center gap-2 mb-3",
                    children: [
                        _jsx("div", {
                            className: "text-gray-400",
                            children: _jsx(StarIcon, { isFilled: false })
                        }),
                        _jsx("div", {
                            className: "text-gray-400", 
                            children: _jsx(BookmarkIcon, { isFilled: false })
                        }),
                        _jsx("div", {
                            className: "text-gray-400",
                            children: _jsx(InfoIcon, {})
                        }),
                        _jsx("div", {
                            className: "text-gray-400",
                            children: _jsx(ChatIcon, {})
                        })
                    ]
                }),
                
                _jsx("button", {
                    onClick: (e) => {
                        e.stopPropagation();
                        onSelect(character);
                    },
                    className: "w-full bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold py-2 px-4 rounded-lg transition-colors",
                    children: "Chat Now"
                })
            ]
        })
    );
};

export default CharacterCard;
