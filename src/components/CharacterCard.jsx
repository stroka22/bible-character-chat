import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";

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
