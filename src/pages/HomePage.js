import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { useChat } from '../contexts/ChatContext';
import ScalableCharacterSelection from '../components/ScalableCharacterSelection';
import ChatInterface from '../components/chat/ChatInterface';
var HomePage = function () {
    var _a = useChat(), character = _a.character, messages = _a.messages, chatId = _a.chatId;
    var _b = React.useState(false), resumed = _b[0], setResumed = _b[1];
    // We now always use the scalable selector, so no toggle state required.
    /* ------------------------------------------------------------
     * Detect resumed conversations.
     * A conversation is considered "resumed" when:
     *   1. We already have a selected character
     *   2. We have at least one message in context
     *   3. A chatId exists (saved chat) OR we are in bypass mode
     * ---------------------------------------------------------- */
    React.useEffect(function () {
        if (character && messages.length > 0) {
            setResumed(true);
        }
        else {
            setResumed(false);
        }
    }, [character, messages]);
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "fixed inset-0 bg-gradient-to-b from-blue-900 via-blue-700 to-blue-500", children: [_jsx("div", { className: "absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-200 via-transparent to-transparent opacity-30" }), _jsx("div", { className: "absolute top-1/4 left-1/4 w-64 h-24 bg-white rounded-full blur-3xl opacity-20 animate-float" }), _jsx("div", { className: "absolute top-1/3 right-1/4 w-80 h-32 bg-white rounded-full blur-3xl opacity-15 animate-float-delayed" }), _jsx("div", { className: "absolute bottom-1/4 left-1/3 w-72 h-28 bg-white rounded-full blur-3xl opacity-10 animate-float-slow" })] }), character ? (
            /* Chat view – mt-32 (~128 px) accounts for banner + header */
            _jsx("div", { className: "relative flex h-screen w-full mt-32", children: _jsx("main", { className: "flex-1 overflow-hidden", children: _jsx(ChatInterface, {}) }) })) : (
            /* Selector view – mt-32 matches chat view spacing */
            _jsx("div", { className: "relative flex h-screen w-full justify-center items-center mt-32", children: _jsxs("div", { className: "w-full max-w-3xl p-4 rounded-xl bg-white/10 backdrop-blur-md shadow-xl", children: [_jsx("div", { className: "mb-6 flex justify-center", children: _jsx("button", { onClick: function () { return (window.location.href = '/pricing.html'); }, className: "animate-pulse rounded-full bg-yellow-400 px-6 py-3 text-lg font-extrabold tracking-wide text-blue-900 shadow-lg ring-2 ring-yellow-300 hover:bg-yellow-300 focus:outline-none focus:ring-4 focus:ring-yellow-200", children: "\uD83D\uDD13 Unlock all characters \u00A0\u2013\u00A0 Upgrade" }) }), _jsx(ScalableCharacterSelection, {})] }) })), resumed && (_jsxs("div", { className: "fixed bottom-2 left-2 z-50 rounded-md bg-blue-100 px-3 py-1 text-xs text-blue-800 shadow", children: ["Resumed conversation ", chatId ? "(ID: ".concat(chatId, ")") : '(local)'] }))] }));
};
export default HomePage;
