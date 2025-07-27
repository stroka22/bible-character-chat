import React from 'react';
import { motion } from 'framer-motion';

const CharacterCard = ({
    character,
    onSelect,
    isSelected = false,
    isFavorite = false,
    onToggleFavorite,
    /* new: featured support ------------------------------------------------ */
    isFeatured = false,
    onSetAsFeatured,
}) => {
    const avatarUrl = character.avatar_url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=random`;
    const bibleBook = character.bible_book || '';

    // Handler for favorite button to prevent event bubbling
    const handleFavoriteClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof onToggleFavorite === 'function') {
            onToggleFavorite();
        }
        return false;
    };

    // Handler for featured button to prevent event bubbling
    const handleFeaturedClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof onSetAsFeatured === 'function') {
            onSetAsFeatured();
        }
        return false;
    };

    return (
        <motion.div
            className={`
                group relative flex flex-col rounded-xl bg-white shadow-lg
                h-[340px] w-full overflow-hidden
                ${isSelected
                    ? 'border-4 border-yellow-400 ring-2 ring-yellow-300/50 shadow-xl'
                    : 'border-4 border-yellow-300/40 hover:border-6 hover:border-yellow-400 hover:shadow-xl hover:ring-2 hover:ring-yellow-400/50'}
                transition-all duration-300
            `}
            whileHover={{
                scale: 1.02,
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(character)}
        >
            {/* Card background (slightly intensifies on hover) */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-white/50 to-yellow-50/30 transition-all duration-300 group-hover:opacity-80" />
            
            {/* Selected highlight */}
            {isSelected && (
                <div className="absolute -inset-0.5 bg-yellow-300 opacity-20 blur-md rounded-xl" />
            )}
            
            {/* Favorite button */}
            <button
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                onClick={handleFavoriteClick}
                onMouseDown={(e) => e.stopPropagation()}
                className={`
                    absolute top-2 left-2 z-20 rounded-full p-1.5 
                    ${isFavorite
                        ? 'bg-yellow-100 text-yellow-600 shadow-md'
                        : 'bg-white/80 text-gray-400 hover:text-gray-600 hover:bg-white/90'}
                    cursor-pointer
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

            {/* Set-as-featured button (shows on hover) */}
            <button
                aria-label={isFeatured ? 'Current featured character' : 'Set as featured'}
                onClick={handleFeaturedClick}
                onMouseDown={(e) => e.stopPropagation()}
                className={`
                    absolute top-2 right-2 z-20 rounded-full p-1.5
                    ${isFeatured 
                        ? 'opacity-100 bg-yellow-100 text-yellow-600 shadow-md' 
                        : 'opacity-0 group-hover:opacity-100 bg-white/80 text-gray-400 hover:text-gray-600 hover:bg-white/90'}
                    transition-opacity duration-200 cursor-pointer
                `}
            >
                {isFeatured ? (
                    /* solid bookmark */
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                        <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 17V3z" />
                    </svg>
                ) : (
                    /* outline bookmark */
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" stroke="currentColor" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 17V3z" />
                    </svg>
                )}
            </button>
            
            {/* Content */}
            <div className="flex flex-col items-center pt-6 pb-16 px-4 h-full relative z-10">
                {/* Avatar (grows & border brightens on hover) */}
                <div className="relative w-24 h-24 mb-4 transition-transform duration-300 group-hover:scale-105">
                    <img
                        src={avatarUrl}
                        alt={character.name}
                        className={`w-24 h-24 object-cover rounded-full border-2 transition-colors duration-300
                            ${isSelected
                                ? 'border-yellow-400'
                                : 'border-yellow-300/60 group-hover:border-yellow-400'}`}
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
                
                {/* Name & divider animate subtly on hover */}
                <h3 className="text-xl font-bold text-blue-900 mb-2 text-center transition-colors duration-300 group-hover:text-blue-700">
                    {character.name}
                </h3>
                <div className="h-0.5 w-12 bg-yellow-400 rounded-full mb-3 opacity-70 transition-all duration-300 group-hover:w-16 group-hover:opacity-100" />
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
                        transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5
                        ${isSelected
                            ? 'bg-yellow-500 text-blue-900 hover:bg-yellow-400'
                            : 'bg-blue-600 text-white hover:bg-blue-500'}
                    `}
                >
                    {isSelected ? 'Continue Chat' : 'Start Chat'}
                </button>
            </div>
            
            {/* Selected checkmark (pulses) */}
            {isSelected && (
                <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500 text-blue-900 shadow-md z-10 animate-pulse">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                        <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                    </svg>
                </div>
            )}
        </motion.div>
    );
};

export default CharacterCard;
