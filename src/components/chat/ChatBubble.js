import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
var ChatBubble = function (_a) {
    var message = _a.message, characterName = _a.characterName, characterAvatar = _a.characterAvatar, _b = _a.isTyping, isTyping = _b === void 0 ? false : _b;
    var isUser = message.role === 'user';
    // Default avatar if none provided
    var avatarUrl = characterAvatar ||
        "https://ui-avatars.com/api/?name=".concat(encodeURIComponent(characterName), "&background=random");
    // Format timestamp
    var timestamp = new Date(message.created_at).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
    return (_jsx("div", { className: "flex w-full mb-4 ".concat(isUser ? 'justify-end' : 'justify-start'), children: _jsxs("div", { className: "flex max-w-[80%] ".concat(isUser ? 'flex-row-reverse' : 'flex-row'), children: [!isUser && (_jsx("div", { className: "flex-shrink-0 mr-2", children: _jsx("img", { src: avatarUrl, alt: characterName, className: "h-10 w-10 rounded-full object-cover border border-gray-200", onError: function (e) {
                            // Fallback if image fails to load
                            e.target.src =
                                "https://ui-avatars.com/api/?name=".concat(encodeURIComponent(characterName), "&background=random");
                        } }) })), _jsxs("div", { className: "flex flex-col ".concat(isUser ? 'items-end mr-2' : 'items-start'), children: [!isUser && (_jsx("div", { className: "text-sm font-medium text-gray-700 mb-1 ml-1", children: characterName })), _jsx("div", { className: "\n              rounded-2xl px-4 py-2 break-words\n              ".concat(isUser
                                ? 'bg-primary-600 text-white rounded-tr-none'
                                : 'bg-gray-100 text-gray-800 rounded-tl-none', "\n            "), children: _jsxs("div", { className: "whitespace-pre-wrap", children: [message.content, isTyping && message.content === '' && (_jsxs("span", { className: "inline-flex items-center", children: [_jsx("span", { className: "animate-pulse", children: "." }), _jsx("span", { className: "animate-pulse animation-delay-200", children: "." }), _jsx("span", { className: "animate-pulse animation-delay-400", children: "." })] }))] }) }), _jsx("div", { className: "text-xs text-gray-500 mt-1 ".concat(isUser ? 'mr-1' : 'ml-1'), children: timestamp })] })] }) }));
};
export default ChatBubble;
