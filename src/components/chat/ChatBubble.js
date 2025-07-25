import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const ChatBubble = ({ message, characterName, characterAvatar, isTyping = false, }) => {
    const isUser = message.role === 'user';
    const generateFallbackAvatar = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
    const getSafeAvatarUrl = (name, url) => {
        if (!url)
            return generateFallbackAvatar(name);
        try {
            const { hostname } = new URL(url);
            if (hostname === 'example.com' ||
                hostname.endsWith('.example.com') ||
                hostname === 'localhost') {
                return generateFallbackAvatar(name);
            }
            return url;
        }
        catch {
            return generateFallbackAvatar(name);
        }
    };
    const avatarUrl = getSafeAvatarUrl(characterName, characterAvatar);
    /* ------------------------------------------------------------------ 
     * Safely format timestamp
     * - Guard against null / undefined / invalid dates that were causing
     *   the visible “Invalid Date” string in the UI.
     * ------------------------------------------------------------------ */
    const timestamp = message?.created_at
        ? new Date(message.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        })
        : new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    return (_jsx("div", { className: `flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`, children: _jsxs("div", { className: `flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`, children: [!isUser && (_jsx("div", { className: "flex-shrink-0 mr-2", children: _jsx("img", { src: avatarUrl, alt: characterName, className: "h-10 w-10 rounded-full object-cover border-2 border-yellow-400", onError: (e) => {
                            e.target.src = generateFallbackAvatar(characterName);
                        } }) })), _jsxs("div", { className: `flex flex-col ${isUser ? 'items-end mr-2' : 'items-start'}`, children: [!isUser && (_jsx("div", { className: "text-sm font-medium text-gray-700 mb-1 ml-1", children: characterName })), _jsx("div", { className: `
              rounded-2xl px-4 py-2 break-words
              ${isUser
                                ? 'bg-[#4a5568] text-white rounded-br-none'
                                : 'bg-[#2d3748] text-blue-100 rounded-bl-none'}
            `, children: _jsxs("div", { className: "whitespace-pre-wrap", children: [message.content, isTyping && message.content === '' && (_jsxs("span", { className: "inline-flex items-center", children: [_jsx("span", { className: "animate-pulse", children: "." }), _jsx("span", { className: "animate-pulse animation-delay-200", children: "." }), _jsx("span", { className: "animate-pulse animation-delay-400", children: "." })] }))] }) }), _jsx("div", { className: `text-xs text-gray-500 mt-1 ${isUser ? 'mr-1' : 'ml-1'}`, children: timestamp })] })] }) }));
};
export default ChatBubble;
