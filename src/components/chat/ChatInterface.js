import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import { useChat } from '../../contexts/ChatContext';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import ChatActions from './ChatActions';
var ChatInterface = function () {
    var _a = useChat(), character = _a.character, messages = _a.messages, isLoading = _a.isLoading, error = _a.error, isTyping = _a.isTyping, retryLastMessage = _a.retryLastMessage, resetChat = _a.resetChat;
    // Reference for auto-scrolling to the bottom of the chat
    var messagesEndRef = useRef(null);
    // Detect if this is a resumed chat (there are already messages present)
    var isResumed = messages.length > 0;
    // Auto-scroll to bottom when messages change or when typing
    useEffect(function () {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messages.length, isTyping]); // key on length so first load scrolls too
    // Log resume information for debugging
    useEffect(function () {
        if (isResumed) {
            // eslint-disable-next-line no-console
            console.info('[ChatInterface] Rendering a resumed conversation');
        }
    }, [isResumed]);
    // If no character is selected, show a placeholder
    if (!character) {
        return (_jsx("div", { className: "flex h-full w-full flex-col items-center justify-center bg-gray-50 p-4", children: _jsxs("div", { className: "text-center", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-16 w-16 mx-auto text-gray-400 mb-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" }) }), _jsx("h3", { className: "text-xl font-semibold text-gray-700 mb-2", children: "Start a Conversation" }), _jsx("p", { className: "text-gray-500 max-w-sm", children: "Select a Bible character from the list to begin your conversation." })] }) }));
    }
    return (_jsxs("div", { className: "flex h-full w-full flex-col ".concat(isResumed ? 'bg-blue-50/20' : 'bg-white'), children: [_jsxs("header", { className: "flex items-center border-b border-gray-200 bg-white p-4 shadow-sm", children: [_jsxs("button", { onClick: resetChat, className: "mr-3 flex items-center rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 transition-colors", "aria-label": "Back to characters", title: "Back to characters", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 mr-1", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10 19l-7-7m0 0l7-7m-7 7h18" }) }), "Back"] }), _jsxs("div", { className: "flex items-center", children: [_jsx("img", { src: character.avatar_url || "https://ui-avatars.com/api/?name=".concat(encodeURIComponent(character.name), "&background=random"), alt: character.name, className: "h-10 w-10 rounded-full object-cover border border-gray-200 mr-3", onError: function (e) {
                                    e.target.src =
                                        "https://ui-avatars.com/api/?name=".concat(encodeURIComponent(character.name), "&background=random");
                                } }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: character.name }), isResumed && (_jsx("span", { className: "ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600", children: "Resumed" }))] }), _jsx("p", { className: "text-sm text-gray-500 line-clamp-1", children: character.description })] })] }), _jsxs("button", { onClick: resetChat, className: "ml-auto flex items-center rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 transition-colors", "aria-label": "End conversation", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 mr-1", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }), "End Chat"] })] }), _jsxs("div", { className: "flex-grow overflow-y-auto p-4", children: [messages.length === 0 ? (_jsx("div", { className: "flex h-full w-full items-center justify-center", children: _jsxs("div", { className: "text-center max-w-md", children: [_jsxs("p", { className: "text-gray-500 mb-4", children: ["Start your conversation with ", character.name, ". Ask questions about their life, experiences, or seek their wisdom."] }), _jsx("div", { className: "text-sm text-gray-400 italic", children: "\"Ask me anything...\"" })] }) })) : (_jsxs(_Fragment, { children: [messages
                                .filter(function (m) { return m.content && m.content.trim() !== ''; })
                                .map(function (message) { return (_jsx(ChatBubble, { message: message, characterName: character.name, characterAvatar: character.avatar_url, isTyping: isTyping && message === messages[messages.length - 1] && message.role === 'assistant' && message.content === '' }, message.id)); }), isTyping && messages.length > 0 && messages[messages.length - 1].role === 'user' && (_jsxs("div", { className: "flex items-center mb-4", children: [_jsx("div", { className: "flex-shrink-0 mr-2", children: _jsx("img", { src: character.avatar_url || "https://ui-avatars.com/api/?name=".concat(encodeURIComponent(character.name), "&background=random"), alt: character.name, className: "h-10 w-10 rounded-full object-cover border border-gray-200" }) }), _jsxs("div", { className: "text-sm text-gray-500", children: [character.name, " is responding..."] })] })), error && (_jsx("div", { className: "mx-auto my-4 max-w-md rounded-lg bg-red-50 p-4", children: _jsxs("div", { className: "flex", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 text-red-500 mr-2", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-red-800", children: "Sorry, something went wrong. Please try again." }), _jsx("button", { onClick: retryLastMessage, className: "mt-2 rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 transition-colors", children: "Retry" })] })] }) }))] })), _jsx("div", { ref: messagesEndRef })] }), _jsx(ChatActions, {}), _jsx(ChatInput, { disabled: isLoading, placeholder: "Ask ".concat(character.name, " anything...") })] }));
};
export default ChatInterface;
