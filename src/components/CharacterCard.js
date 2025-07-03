import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion } from 'framer-motion';
var CharacterCard = function (_a) {
    var character = _a.character, onSelect = _a.onSelect, _b = _a.isSelected, isSelected = _b === void 0 ? false : _b;
    var _c = useState(false), isFav = _c[0], setIsFav = _c[1];
    // Default avatar if none provided
    var avatarUrl = character.avatar_url ||
        "https://ui-avatars.com/api/?name=".concat(encodeURIComponent(character.name), "&background=random");
    // Extract Bible book for display if available
    var bibleBook = character.bible_book || '';
    return (_jsxs(motion.div, { className: "\n        group relative flex flex-col sm:flex-row items-center gap-4 overflow-hidden rounded-xl border-2 \n        bg-white/90 backdrop-blur-sm shadow-lg\n        transition-all duration-300 ease-in-out cursor-pointer\n        ".concat(isSelected
            ? 'border-yellow-400 ring-2 ring-yellow-300/50 shadow-xl'
            : 'border-white/60 hover:border-yellow-300/70 hover:shadow-xl', "\n      "), whileHover: {
            scale: 1.02,
            transition: { duration: 0.2 }
        }, whileTap: { scale: 0.98 }, onClick: function () { return onSelect(character.id); }, role: "button", tabIndex: 0, onKeyDown: function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(character.id);
            }
        }, "aria-label": "Chat with ".concat(character.name).concat(bibleBook ? " from ".concat(bibleBook) : ''), children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-blue-50/40 via-white/50 to-yellow-50/30 mix-blend-overlay pointer-events-none" }), isSelected && (_jsx("div", { className: "absolute -inset-0.5 bg-yellow-300 opacity-20 blur-md rounded-xl animate-pulse" })), _jsx("button", { "aria-label": isFav ? 'Remove from favourites' : 'Add to favourites', onClick: function (e) {
                    e.stopPropagation();
                    setIsFav(!isFav);
                }, className: "\n          absolute top-2 left-2 z-10 rounded-full p-1.5 \n          transition-all duration-300\n          ".concat(isFav
                    ? 'bg-red-100 text-red-600 shadow-md'
                    : 'bg-white/80 text-gray-400 hover:text-gray-600 hover:bg-white/90 backdrop-blur-sm', "\n          focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2\n        "), children: isFav ? (_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "currentColor", viewBox: "0 0 24 24", className: "h-5 w-5", children: _jsx("path", { d: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09A6.003 6.003 0 0119 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" }) })) : (_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", className: "h-5 w-5", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364 4.318 12.682a4.5 4.5 0 010-6.364z" }) })) }), _jsxs("div", { className: "relative h-40 w-full sm:h-32 sm:w-24 flex-shrink-0 overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent pointer-events-none z-10" }), _jsx("div", { className: "absolute inset-0 pointer-events-none border-2 ".concat(isSelected ? 'border-yellow-400' : 'border-white/40') }), _jsx("img", { src: avatarUrl, alt: character.name, className: "h-full w-full object-cover bg-blue-50" // Lighter background for avatar
                        , onError: function (e) {
                            e.target.src =
                                "https://ui-avatars.com/api/?name=".concat(encodeURIComponent(character.name), "&background=random");
                        } }), _jsx("div", { className: "absolute top-0 right-0 w-8 h-8 opacity-70 z-10", children: _jsxs("svg", { viewBox: "0 0 100 100", fill: "none", xmlns: "http://www.w3.org/2000/svg", className: "w-full h-full", children: [_jsx("path", { d: "M0 0C55.2285 0 100 44.7715 100 100H75C75 58.5786 41.4214 25 0 25V0Z", fill: "#FFD700" }), " "] }) }), bibleBook && (_jsx("div", { className: "absolute bottom-1 left-1 bg-blue-900/60 text-white text-xs px-2 py-0.5 rounded z-10 backdrop-blur-sm", children: bibleBook }))] }), _jsxs("div", { className: "flex flex-1 flex-col p-4 sm:pr-4 sm:pl-0", children: [_jsx("h3", { className: "mb-1 text-xl font-extrabold text-blue-900 tracking-tight", children: character.name }), _jsx("div", { className: "h-0.5 w-12 bg-yellow-400 rounded-full mb-2 opacity-80" }), _jsxs("div", { className: "relative mb-4", children: [_jsx("div", { className: "absolute inset-0 bg-blue-50/30 rounded pointer-events-none" }), " ", _jsx("p", { className: "relative text-sm text-gray-700 line-clamp-2 group-hover:line-clamp-none transition-all duration-300 z-10", children: character.description })] }), _jsx("button", { onClick: function (e) {
                            e.stopPropagation();
                            onSelect(character.id);
                        }, className: "\n            mt-auto rounded-lg px-4 py-2 text-sm font-semibold shadow-md\n            transition-all duration-300\n            ".concat(isSelected
                            ? 'bg-yellow-500 text-blue-900 hover:bg-yellow-600'
                            : 'bg-blue-600 text-white hover:bg-blue-700', "\n            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-300\n          "), "aria-label": "Start chat with ".concat(character.name), children: isSelected ? 'Continue Chat' : 'Start Chat' })] }), isSelected && (_jsx("div", { className: "absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-yellow-500 text-blue-900 shadow-md z-20", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", className: "h-4 w-4", children: _jsx("path", { fillRule: "evenodd", d: "M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z", clipRule: "evenodd" }) }) }))] }));
};
export default CharacterCard;
