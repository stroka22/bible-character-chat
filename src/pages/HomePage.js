import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { Link } from 'react-router-dom';
import { useChat } from '../contexts/ChatContext.jsx';
import ScalableCharacterSelection from '../components/ScalableCharacterSelection.jsx';
import ChatInterface from '../components/chat/ChatInterface';
import Footer from '../components/Footer';
import { getOwnerSlug } from '../services/tierSettingsService';
import { characterRepository } from '../repositories/characterRepository';
const HomePage = () => {
    const { character, messages, chatId } = useChat();
    const [resumed, setResumed] = React.useState(false);
    /* Featured character shown in banner below chat/selection */
    const [featured, setFeatured] = React.useState(null);
    React.useEffect(() => {
        if (character && messages.length > 0) {
            setResumed(true);
        }
        else {
            setResumed(false);
        }
    }, [character, messages]);

    /* ------------------------------------------------------------------
     * Load org-scoped featured character on mount
     * ------------------------------------------------------------------ */
    React.useEffect(() => {
        (async () => {
            try {
                const slug = getOwnerSlug();
                const key = `featuredCharacter:${slug}`;
                const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
                if (!raw) return;

                let id = null;
                let name = null;
                try {
                    const parsed = JSON.parse(raw);
                    if (typeof parsed === 'object' && parsed !== null) {
                        if (parsed.id) id = parsed.id;
                        if (parsed.name) name = parsed.name;
                    }
                } catch {
                    // not JSON – treat as plain string
                    if (/^\\d+$/.test(raw)) id = raw;
                    else name = raw;
                }

                let charObj = null;
                if (id !== null) {
                    charObj = await characterRepository.getById(id).catch(() => null);
                }
                if (!charObj && name) {
                    const all = await characterRepository.getAll();
                    charObj = all.find(c => (c.name || '').toLowerCase() === (name || '').toLowerCase()) || null;
                }
                if (charObj) setFeatured(charObj);
            } catch (err) {
                console.error('[HomePage] Failed to load featured character:', err);
            }
        })();
    }, []);
    
    // Handler for upgrade button click
    const handleUpgradeClick = () => {
        /* eslint-disable no-console */
        console.log('[HomePage] Upgrade button clicked – redirecting to pricing');
        /* eslint-enable no-console */
        window.location.href = "https://faithtalkai.com/pricing";
    };
    
    /* ------------------------------------------------------------------
     * Layout: full-screen dark gradient + floating glass container
     * ------------------------------------------------------------------ */
    return (_jsxs(_Fragment, { children: [
            /* Background layers (stars / gradient blobs) */
            _jsxs("div", { className: "fixed inset-0 z-0 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700", children: [
                    _jsx("div", { className: "absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-200/20 via-transparent to-transparent opacity-30" }),
                    _jsx("div", { className: "absolute top-1/4 left-1/4 w-64 h-24 bg-white rounded-full blur-3xl opacity-15 animate-float" }),
                    _jsx("div", { className: "absolute top-1/3 right-1/4 w-80 h-32 bg-white rounded-full blur-3xl opacity-10 animate-float-delayed" }),
                    _jsx("div", { className: "absolute bottom-1/4 left-1/3 w-72 h-28 bg-white rounded-full blur-3xl opacity-5 animate-float-slow" })
                ] }),

            /* Free-tier badge (always visible for now) */
            /* Upgrade button (now fixed positioning with higher z-index) */
            _jsx("button", {
              onClick: handleUpgradeClick,
              className: "fixed bottom-4 right-4 z-50 inline-flex justify-center items-center px-6 py-2 border-2 border-white text-sm font-medium rounded-full shadow-sm text-white bg-green-500 hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-300 whitespace-nowrap transition-colors",
              children: "Unlock All Characters – Upgrade to Premium"
            }),

            /* Glass container wrapping either selection or chat */
            _jsx("div", { className: "relative z-10 flex items-start justify-center pt-24 md:pt-32 pb-10", children: _jsxs("div", { className: "chat-container w-full max-w-6xl h-[88vh] mx-4 md:mx-6 bg-white/5 backdrop-blur-md border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col", children: [
                        character
                            ? _jsx("main", { className: "flex-1 overflow-hidden", children: _jsx(ChatInterface, {}) })
                            : _jsx("div", { className: "flex-1 overflow-y-auto", children: _jsx(ScalableCharacterSelection, {}) }),
                        /*  The “Resumed conversation” debug badge has been removed
                            to avoid confusing end-users with technical details. */
                    ] }) })
            ,
            /* Featured Character banner (shows when configured) */
            featured && _jsx("div", { className: "relative z-10 flex justify-center mt-6", children: _jsx("div", { className: "flex items-center gap-4 px-5 py-3 bg-white/5 backdrop-blur-md border border-white/15 rounded-xl shadow-lg", children: _jsxs(_Fragment, { children: [
                            _jsx("img", { src: featured.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(featured.name)}`, alt: featured.name, className: "h-10 w-10 rounded-full object-cover" }),
                            _jsx("span", { className: "text-yellow-300 font-semibold", children: featured.name }),
                            _jsx(Link, { to: `/chat?character=${featured.id}`, className: "ml-auto px-4 py-1.5 bg-yellow-400 text-blue-900 rounded-full text-sm font-semibold hover:bg-yellow-300 transition-colors", children: "Chat Now" })
                        ] }) }) })
            /* Site footer */
            , _jsx("div", { className: "relative z-10", children: _jsx(Footer, {}) })
        ] }));
};
export default HomePage;
