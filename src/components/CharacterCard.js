import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
        _jsxs(motion.div, {
            className: `
                group relative flex flex-col sm:flex-row items-center gap-4 overflow-visible rounded-xl border-2 
                bg-white/90 backdrop-blur-sm shadow-lg
                transition-all duration-300 ease-in-out cursor-pointer
                /* ensure cards are equal height before hover */
                h-[320px] sm:h-[200px] w-full
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
                _jsx("div", {
                    className: "absolute inset-0 bg-gradient-to-br from-blue-50/40 via-white/50 to-yellow-50/30 mix-blend-overlay pointer-events-none"
                }),
                isSelected && (_jsx("div", {
                    className: "absolute -inset-0.5 bg-yellow-300 opacity-20 blur-md rounded-xl animate-pulse"
                })),
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
                        transition-all duration-300
                        ${isFavorite
                            ? 'bg-yellow-100 text-yellow-600 shadow-md'
                            : 'bg-white/80 text-gray-400 hover:text-gray-600 hover:bg-white/90 backdrop-blur-sm'}
                        focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2
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
                _jsxs("div", {
                    className: "relative w-[150px] h-[150px] flex-shrink-0",
                    children: [
                        _jsx("div", {
                            className: "absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent pointer-events-none z-10 rounded-full"
                        }),
                        _jsx("table", {
                            className: "border-collapse m-0 p-0 w-[150px] h-[150px] relative z-0",
                            children: _jsx("tbody", {
                                children: _jsx("tr", {
                                    children: _jsx("td", {
                                        className: `
                                            w-[150px] h-[150px] rounded-full overflow-hidden p-0
                                            ${isSelected ? 'border-4 border-yellow-400' : 'border-2 border-white/40'}
                                            shadow-md bg-blue-50
                                        `,
                                        children: _jsx("img", {
                                            src: avatarUrl,
                                            alt: character.name,
                                            className: "w-[150px] h-[150px] object-cover block",
                                            onError: (e) => {
                                                e.target.src =
                                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=random`;
                                            }
                                        })
                                    })
                                })
                            })
                        }),
                        _jsx("div", {
                            className: "absolute top-0 right-0 w-8 h-8 opacity-70 z-10 pointer-events-none",
                            children: _jsx("svg", {
                                viewBox: "0 0 100 100",
                                fill: "none",
                                xmlns: "http://www.w3.org/2000/svg",
                                className: "w-full h-full",
                                children: _jsx("path", {
                                    d: "M0 0C55.2285 0 100 44.7715 100 100H75C75 58.5786 41.4214 25 0 25V0Z",
                                    fill: "#FFD700"
                                })
                            })
                        }),
                        bibleBook && (_jsx("div", {
                            className: "absolute bottom-1 left-1 bg-blue-900/60 text-white text-xs px-2 py-0.5 rounded z-10 backdrop-blur-sm",
                            children: bibleBook
                        }))
                    ]
                }),
                _jsxs("div", {
                    className: "flex flex-1 flex-col p-4 sm:pr-4 sm:pl-0",
                    children: [
                        _jsx("h3", {
                            className: "mb-1 text-xl font-extrabold text-blue-900 tracking-tight",
                            children: character.name
                        }),
                        _jsx("div", {
                            className: "h-0.5 w-12 bg-yellow-400 rounded-full mb-2 opacity-80"
                        }),
                        /* Description + blue overlay */
                        _jsxs("div", {
                            /* fixed height so the card never grows/shrinks on hover,
                               ensuring the action button below remains in view */
                            className: "relative mb-4 h-16 overflow-hidden",
                            children: [
                                _jsx("div", {
                                    className: "absolute inset-0 bg-blue-50/30 rounded pointer-events-none"
                                }),
                                " ",
                                _jsx("p", {
                                    /* Keep the paragraph height stable so the action
                                       button never shifts (or disappears) on hover */
                                    className: "relative text-sm text-gray-700 line-clamp-2 z-10",
                                    children: character.description
                                })
                            ]
                        }),
                        /* Start-chat button moved out to a global overlay below */
                    ]
                }),
                isSelected && (_jsx("div", {
                    className: "absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-yellow-500 text-blue-900 shadow-md z-20",
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
                }))
                /* GUARANTEED VISIBLE BUTTON (bottom overlay) */
                _jsx("div", {
                    className: "absolute bottom-0 left-0 right-0 py-4 px-4 bg-gradient-to-t from-white via-white/90 to-transparent",
                    style: { zIndex: 50 },
                    children: _jsx("button", {
                        onClick: (e) => {
                            e.stopPropagation();
                            onSelect(character);
                        },
                        className: `
                            w-full rounded-lg px-4 py-2.5 text-sm font-bold
                            shadow-lg
                            ${isSelected
                                ? 'bg-yellow-500 text-blue-900 hover:bg-yellow-600'
                                : 'bg-blue-600 text-white hover:bg-blue-700'}
                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-300
                        `,
                        "aria-label": `Start chat with ${character.name}`,
                        children: isSelected ? 'Continue Chat' : 'Start Chat'
                    })
                })
            ]
        })
    );
};

export default CharacterCard;
