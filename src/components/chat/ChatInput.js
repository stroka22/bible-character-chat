import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';

/**
 * ChatInput
 * ----------
 * Re-usable input component for sending chat messages.
 *
 * Props:
 *  • disabled        – boolean, disables input
 *  • placeholder     – string, placeholder text
 *  • onSendMessage   – (optional) custom send handler; when supplied it will
 *                      be used instead of the default ChatContext.sendMessage
 */
const ChatInput = ({
    disabled = false,
    placeholder = "Ask me anything...",
    onSendMessage = undefined,
}) => {
    const [message, setMessage] = useState('');
    const inputRef = useRef(null);
    const { sendMessage: ctxSendMessage, isTyping, error } = useChat();

    // Decide which send function to use (prop overrides context)
    const send = onSendMessage ?? ctxSendMessage;
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);
    const handleInput = (e) => {
        const textarea = e.target;
        setMessage(textarea.value);
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim() || disabled || isTyping) {
            return;
        }
        try {
            await send(message.trim());
            setMessage('');
            if (inputRef.current) {
                inputRef.current.style.height = 'auto';
                inputRef.current.focus();
            }
        }
        catch (err) {
            console.error('Error sending message:', err);
        }
    };
    const handleKeyDown = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            handleSubmit(e);
        }
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "flex w-full items-end border-t border-gray-200 bg-white p-3 shadow-sm", children: [_jsxs("div", { className: "relative flex-grow", children: [_jsx("textarea", { ref: inputRef, value: message, onChange: handleInput, onKeyDown: handleKeyDown, placeholder: placeholder, disabled: disabled || isTyping, className: `
            w-full resize-none rounded-lg border border-gray-300 py-3 pl-4 pr-12
            focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200
            disabled:bg-gray-100 disabled:text-gray-500
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}
          `, rows: 1, style: { minHeight: '50px', maxHeight: '150px' } }), _jsx("button", { type: "submit", disabled: !message.trim() || disabled || isTyping, className: `
            absolute bottom-2 right-2 rounded-full p-2
            transition-colors duration-200
            ${message.trim() && !disabled && !isTyping
                            ? 'bg-primary-600 text-white hover:bg-primary-700'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
          `, "aria-label": "Send message", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", className: "h-5 w-5", children: _jsx("path", { d: "M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" }) }) })] }), _jsxs("div", { className: "ml-2 hidden text-xs text-gray-400 md:block", children: ["Press ", _jsx("kbd", { className: "rounded border border-gray-300 bg-gray-100 px-1 font-sans", children: "Ctrl" }), " + ", _jsx("kbd", { className: "rounded border border-gray-300 bg-gray-100 px-1 font-sans", children: "Enter" }), " to send"] })] }));
};
export default ChatInput;
