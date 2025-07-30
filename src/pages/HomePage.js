import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { Link } from 'react-router-dom';
import { useChat } from '../contexts/ChatContext.jsx';
import ScalableCharacterSelection from '../components/ScalableCharacterSelection';
import ChatInterface from '../components/chat/ChatInterface';
const HomePage = () => {
    const { character, messages, chatId } = useChat();
    const [resumed, setResumed] = React.useState(false);
    React.useEffect(() => {
        if (character && messages.length > 0) {
            setResumed(true);
        }
        else {
            setResumed(false);
        }
    }, [character, messages]);
    /* ------------------------------------------------------------------
     * Layout: full-screen dark gradient + floating glass container
     * ------------------------------------------------------------------ */
    return (_jsxs(_Fragment, { children: [
            /* Background layers (stars / gradient blobs) */
            _jsxs("div", { className: "fixed inset-0 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700", children: [
                    _jsx("div", { className: "absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-200/20 via-transparent to-transparent opacity-30" }),
                    _jsx("div", { className: "absolute top-1/4 left-1/4 w-64 h-24 bg-white rounded-full blur-3xl opacity-15 animate-float" }),
                    _jsx("div", { className: "absolute top-1/3 right-1/4 w-80 h-32 bg-white rounded-full blur-3xl opacity-10 animate-float-delayed" }),
                    _jsx("div", { className: "absolute bottom-1/4 left-1/3 w-72 h-28 bg-white rounded-full blur-3xl opacity-5 animate-float-slow" })
                ] }),

            /* Free-tier badge (always visible for now) */
            _jsx("div", { className: "absolute top-4 left-1/2 -translate-x-1/2 z-40 select-none", children: _jsx("span", { className: "rounded-full bg-yellow-400/90 px-4 py-1 text-xs font-semibold text-blue-900 shadow", children: "Free Chat (Limited)" }) }),

            /* Upgrade button */
            _jsx(Link, { 
              to: "/pricing.html",
              className: "absolute top-4 right-4 z-40 inline-flex justify-center items-center px-6 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-blue-900 bg-yellow-400 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 whitespace-nowrap transition-colors",
              children: "Unlock All Characters – Upgrade to Premium"
            }),

            /* Glass container wrapping either selection or chat */
            _jsx("div", { className: "relative z-10 flex items-start justify-center pt-24 md:pt-32 pb-10", children: _jsxs("div", { className: "chat-container w-full max-w-6xl h-[88vh] mx-4 md:mx-6 bg-white/5 backdrop-blur-md border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col", children: [
                        character
                            ? _jsx("main", { className: "flex-1 overflow-hidden", children: _jsx(ChatInterface, {}) })
                            : _jsx("div", { className: "flex-1 overflow-y-auto", children: _jsx(ScalableCharacterSelection, {}) }),
                        resumed && (_jsxs("div", { className: "absolute bottom-2 left-2 z-20 rounded-md bg-blue-100/90 px-3 py-1 text-xs text-blue-800 shadow", children: ["Resumed conversation ", chatId ? `(ID: ${chatId})` : '(local)'] }))
                    ] }) })
        ] }));
};
export default HomePage;
