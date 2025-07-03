var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
var ChatInput = function (_a) {
    var _b = _a.disabled, disabled = _b === void 0 ? false : _b, _c = _a.placeholder, placeholder = _c === void 0 ? "Ask me anything..." : _c;
    var _d = useState(''), message = _d[0], setMessage = _d[1];
    var inputRef = useRef(null);
    var _e = useChat(), sendMessage = _e.sendMessage, isTyping = _e.isTyping, error = _e.error;
    // Auto-focus the input when the component mounts
    useEffect(function () {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);
    // Auto-resize the textarea as content grows
    var handleInput = function (e) {
        var textarea = e.target;
        setMessage(textarea.value);
        // Reset height to auto to get the correct scrollHeight
        textarea.style.height = 'auto';
        // Set the height based on scrollHeight (with max-height applied via CSS)
        textarea.style.height = "".concat(Math.min(textarea.scrollHeight, 150), "px");
    };
    // Handle message submission
    var handleSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!message.trim() || disabled || isTyping) {
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, sendMessage(message.trim())];
                case 2:
                    _a.sent();
                    setMessage('');
                    // Reset textarea height
                    if (inputRef.current) {
                        inputRef.current.style.height = 'auto';
                        inputRef.current.focus();
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.error('Error sending message:', err_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Handle keyboard shortcuts (Ctrl+Enter or Cmd+Enter to send)
    var handleKeyDown = function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            handleSubmit(e);
        }
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "flex w-full items-end border-t border-gray-200 bg-white p-3 shadow-sm", children: [_jsxs("div", { className: "relative flex-grow", children: [_jsx("textarea", { ref: inputRef, value: message, onChange: handleInput, onKeyDown: handleKeyDown, placeholder: placeholder, disabled: disabled || isTyping, className: "\n            w-full resize-none rounded-lg border border-gray-300 py-3 pl-4 pr-12\n            focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200\n            disabled:bg-gray-100 disabled:text-gray-500\n            ".concat(error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : '', "\n          "), rows: 1, style: { minHeight: '50px', maxHeight: '150px' } }), _jsx("button", { type: "submit", disabled: !message.trim() || disabled || isTyping, className: "\n            absolute bottom-2 right-2 rounded-full p-2\n            transition-colors duration-200\n            ".concat(message.trim() && !disabled && !isTyping
                            ? 'bg-primary-600 text-white hover:bg-primary-700'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed', "\n          "), "aria-label": "Send message", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", className: "h-5 w-5", children: _jsx("path", { d: "M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" }) }) })] }), _jsxs("div", { className: "ml-2 hidden text-xs text-gray-400 md:block", children: ["Press ", _jsx("kbd", { className: "rounded border border-gray-300 bg-gray-100 px-1 font-sans", children: "Ctrl" }), " + ", _jsx("kbd", { className: "rounded border border-gray-300 bg-gray-100 px-1 font-sans", children: "Enter" }), " to send"] })] }));
};
export default ChatInput;
