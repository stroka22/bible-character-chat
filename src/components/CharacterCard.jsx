import React from 'react';
import { motion } from 'framer-motion';

const CharacterCard = ({
    character,
    onSelect,
    isSelected = false,
    isFavorite = false,
    onToggleFavorite,
}) => {
    const avatarUrl = character.avatar_url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=random`;
    const bibleBook = character.bible_book || '';

    return (
        <motion.div
            className={`
                relative flex flex-col rounded-xl border-2 bg-white shadow-lg
                h-auto min-h-[300px] w-full
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
        >
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-white/50 to-yellow-50/30" />
            
            {/* Selected highlight */}
            {isSelected && (
                <div className="absolute -inset-0.5 bg-yellow-300 opacity-20 blur-md rounded-xl" />
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
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" stroke="currentColor" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                )}
            </button>
            
            {/* Content */}
            <div className="flex flex-col items-center pt-6 pb-16 px-4 h-full relative z-10">
                {/* Avatar */}
                <div className="relative w-24 h-24 mb-4">
                    <img
                        src={avatarUrl}
                        alt={character.name}
                        className={`w-24 h-24 object-cover rounded-full border-2 ${isSelected ? 'border-yellow-400' : 'border-white/40'}`}
                        onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=random`;
                        }}
                    />
                    {bibleBook && (
                        <div className="absolute bottom-0 -right-1 bg-blue-900/60 text-white text-xs px-2 py-0.5 rounded">
                            {bibleBook}
                        </div>
                    )}
                </div>
                
                {/* Name and description */}
                <h3 className="text-xl font-bold text-blue-900 mb-2 text-center">{character.name}</h3>
                <div className="h-0.5 w-12 bg-yellow-400 rounded-full mb-3 opacity-70" />
                <p className="text-sm text-gray-700 text-center mb-4 line-clamp-3">{character.description}</p>
            </div>
            
            {/* Fixed position button */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect(character);
                    }}
                    className={`
                        w-full py-2 px-4 rounded-lg text-sm font-semibold shadow-md
                        ${isSelected
                            ? 'bg-yellow-500 text-blue-900 hover:bg-yellow-600'
                            : 'bg-blue-600 text-white hover:bg-blue-700'}
                    `}
                >
                    {isSelected ? 'Continue Chat' : 'Start Chat'}
                </button>
            </div>
            
            {/* Selected checkmark */}
            {isSelected && (
                <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500 text-blue-900 shadow-md z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                        <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                    </svg>
                </div>
            )}
        </motion.div>
    );
};

export default CharacterCard;
