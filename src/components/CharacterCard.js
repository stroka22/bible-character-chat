import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { useState } from 'react';

const CharacterCard = ({
    character,
    onSelect,
    isSelected = false,
    isFavorite = false,
    onToggleFavorite,
}) => {
    /* ------------------------------------------------------------------ */
    /*  Derived values & local UI state                                   */
    /* ------------------------------------------------------------------ */
    const avatarUrl = character.avatar_url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=random`;
    const bibleBook = character.bible_book || '';
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="relative">
            {/* Tooltip that appears on hover - outside the motion.div to avoid animation issues */}
            {isHovered && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50">
                    <div className="bg-gray-900 text-white text-sm rounded-md p-3 shadow-lg max-w-xs">
                        {character.description}
                        <div className="absolute h-3 w-3 bg-gray-900 transform rotate-45 left-1/2 -translate-x-1/2 -bottom-1.5"></div>
                    </div>
                </div>
            )}

            <motion.div
                className={`
                    relative flex flex-col sm:flex-row items-center gap-4 
                    rounded-xl border-2 bg-white/90 shadow-lg
                    w-full
                    ${isSelected
                        ? 'border-yellow-400 ring-2 ring-yellow-300/50 shadow-xl'
                        : 'border-white/60 hover:border-yellow-300/70 hover:shadow-xl'}
                `}
                whileHover={{
                    scale: 1.02,
                    transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(character)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelect(character);
                    }
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                aria-label={`Chat with ${character.name}${bibleBook ? ` from ${bibleBook}` : ''}`}
            >
                {/* Background and selection indicator */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-white/50 to-yellow-50/30 mix-blend-overlay" />
                {isSelected && (
                    <div className="absolute -inset-0.5 bg-yellow-300 opacity-20 blur-md rounded-xl animate-pulse" />
                )}
                
                {/* Favorite button */}
                <button
                    aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (typeof onToggleFavorite === 'function') {
                            onToggleFavorite();
                        }
                    }}
                    className={`
                        absolute top-2 left-2 z-10 rounded-full p-1.5 
                        ${isFavorite
                            ? 'bg-yellow-100 text-yellow-600 shadow-md'
                            : 'bg-white/80 text-gray-400 hover:text-gray-600 hover:bg-white/90'}
                    `}
                >
                    {isFavorite ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="h-5 w-5"
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 20 20"
                            stroke="currentColor"
                            className="h-5 w-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                            />
                        </svg>
                    )}
                </button>
                
                {/* Avatar */}
                <div className="relative w-[150px] h-[150px] flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent rounded-full" />
                    <img
                        src={avatarUrl}
                        alt={character.name}
                        className={`w-[150px] h-[150px] object-cover rounded-full border-2 ${isSelected ? 'border-yellow-400' : 'border-white/40'}`}
                        onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=random`;
                        }}
                    />
                    {bibleBook && (
                        <div className="absolute bottom-1 left-1 bg-blue-900/60 text-white text-xs px-2 py-0.5 rounded backdrop-blur-sm">
                            {bibleBook}
                        </div>
                    )}
                </div>
                
                {/* Content */}
                <div className="flex flex-1 flex-col p-4 sm:pl-0">
                    <h3 className="mb-1 text-xl font-extrabold text-blue-900">
                        {character.name}
                    </h3>
                    <div className="h-0.5 w-12 bg-yellow-400 rounded-full mb-2" />
                    {/* Fixed-height description with line clamp */}
                    <p className="text-sm text-gray-700 line-clamp-3">
                        {character.description}
                    </p>
                </div>
                
                {/* FIXED ACTION BUTTON - positioned completely outside the flow */}
                <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect(character);
                        }}
                        className={`
                            w-full sm:w-auto px-6 py-2 rounded-lg text-sm font-semibold shadow-md
                            ${isSelected
                                ? 'bg-yellow-500 text-blue-900 hover:bg-yellow-600'
                                : 'bg-blue-600 text-white hover:bg-blue-700'}
                        `}
                        aria-label={`Start chat with ${character.name}`}
                    >
                        {isSelected ? 'Continue Chat' : 'Start Chat'}
                    </button>
                </div>
                
                {/* Selected indicator */}
                {isSelected && (
                    <div className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-yellow-500 text-blue-900 shadow-md z-10">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-4 w-4"
                        >
                            <path
                                fillRule="evenodd"
                                d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default CharacterCard;
