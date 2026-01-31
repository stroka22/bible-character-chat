import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { Link } from 'react-router-dom';
import { useChat } from '../contexts/ChatContext.jsx';
import ScalableCharacterSelection from '../components/ScalableCharacterSelection.jsx';
import ChatInterface from '../components/chat/ChatInterface';
import Footer from '../components/Footer';
import FABCluster from '../components/FABCluster.jsx';
import { getOwnerSlug } from '../services/tierSettingsService';
import { characterRepository } from '../repositories/characterRepository';
import { useAuth } from '../contexts/AuthContext';
import userSettingsRepository from '../repositories/userSettingsRepository';
import siteSettingsRepository from '../repositories/siteSettingsRepository';
const HomePage = () => {
    const { character, messages, chatId, resetChat } = useChat();
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

    // Force character selection view when "view=characters" is present
    React.useEffect(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            const wantCharacters = (params.get('view') || '').toLowerCase() === 'characters';
            if (wantCharacters) {
                // Clear any selected chat/character so Home renders the selection grid
                if (typeof resetChat === 'function') resetChat();
                // Clean the URL (remove the param) without reload
                params.delete('view');
                const newUrl = `${window.location.pathname}?${params.toString()}`.replace(/\?$/, '');
                window.history.replaceState({}, document.title, newUrl);
            }
        } catch {}
    }, [resetChat]);

    /* ------------------------------------------------------------------
     * Load featured character on mount (server-first for signed-in users)
     * Priority:
     *   1) URL param (?featured=Name)
     *   2) User setting from server (featured_character_id)
     *   3) Org-scoped localStorage key (featuredCharacter:<ownerSlug>)
     *   4) Legacy localStorage key (featuredCharacter)
     *   5) Fallback (Jesus or first character)
     * ------------------------------------------------------------------ */
    const { user } = useAuth();
    const [resetNonce, setResetNonce] = React.useState(0);
    // Optional quick-reset: visiting with ?resetFeatured=1 clears personal featured and local fallbacks
    React.useEffect(() => {
        (async () => {
            try {
                const params = new URLSearchParams(window.location.search);
                const hadReset = params.get('resetFeatured') === '1';
                if (user?.id && hadReset) {
                    await userSettingsRepository.setFeaturedCharacterId(user.id, null);
                }
                if (hadReset) {
                    try {
                        const slug = getOwnerSlug();
                        localStorage.removeItem(`featuredCharacter:${slug}`);
                        localStorage.removeItem('featuredCharacter');
                    } catch (_) {}
                    // Remove the param from URL without reloading
                    params.delete('resetFeatured');
                    const newUrl = `${window.location.pathname}?${params.toString()}`.replace(/\?$/, '');
                    window.history.replaceState({}, document.title, newUrl);
                    // Trigger re-resolution
                    setResetNonce(Date.now());
                }
            } catch (e) {
                console.warn('[HomePage] resetFeatured failed:', e);
            }
        })();
    }, [user?.id]);
    React.useEffect(() => {
        (async () => {
            try {
                let all = null;

                // 1) URL param by name
                const params = new URLSearchParams(window.location.search);
                const byName = params.get('featured');
                if (byName) {
                    all = await characterRepository.getAll();
                    const match = all.find(c => (c.name || '').toLowerCase() === byName.toLowerCase());
                    if (match) { setFeatured(match); return; }
                }

                // 2) Admin default (site/org-level) with enforce flag
                let enforce = false;
                try {
                    const slug = getOwnerSlug();
                    const { defaultId, enforceAdminDefault } = await siteSettingsRepository.getSettings(slug) || {};
                    enforce = !!enforceAdminDefault;
                    if (defaultId) {
                        const c = await characterRepository.getById(defaultId);
                        if (c && c.is_visible !== false) { setFeatured(c); if (enforce) return; }
                    }
                } catch {}

                // 3) User setting from server (only if not enforcing admin default)
                if (!enforce && user?.id) {
                    try {
                        const featId = await userSettingsRepository.getFeaturedCharacterId(user.id);
                        if (featId) {
                            const chr = await characterRepository.getById(featId);
                            if (chr) { setFeatured(chr); return; }
                        }
                    } catch (e) {
                        /* ignore and continue to fallbacks */
                    }
                }

                // Ensure we have the character list for name-based lookups
                all = all || await characterRepository.getAll();

                // 4) Org-scoped localStorage (only if not enforcing admin default)
                try {
                    if (enforce) throw new Error('enforced');
                    const slug = getOwnerSlug();
                    const key = `featuredCharacter:${slug}`;
                    const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
                    if (raw) {
                        try {
                            const parsed = JSON.parse(raw);
                            if (parsed && parsed.id) {
                                const byId = await characterRepository.getById(parsed.id).catch(() => null);
                                if (byId && byId.is_visible !== false) { setFeatured(byId); return; }
                            }
                        } catch {
                            const byLocalName = all.find(c => (c.name || '').toLowerCase() === raw.toLowerCase());
                            if (byLocalName && byLocalName.is_visible !== false) { setFeatured(byLocalName); return; }
                        }
                    }
                } catch {}

                // 5) Legacy localStorage (only if not enforcing admin default)
                try {
                    if (enforce) throw new Error('enforced');
                    const legacy = localStorage.getItem('featuredCharacter');
                    if (legacy) {
                        const byLegacy = all.find(c => (c.name || '').toLowerCase() === legacy.toLowerCase());
                        if (byLegacy && byLegacy.is_visible !== false) { setFeatured(byLegacy); return; }
                    }
                } catch {}

                // 6) Fallback – Jesus or first
                const jesus = all.find(c => (c.name || '').toLowerCase().includes('jesus'));
                setFeatured(jesus || all[0] || null);
            } catch (err) {
                console.error('[HomePage] Failed to load featured character:', err);
            }
        })();
    }, [user?.id, resetNonce]);
    
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


            /* Four Ways to Grow Section - shown when no character is selected */
            !character && _jsx("div", { className: "relative z-10 max-w-5xl mx-auto px-4 pt-24 md:pt-28 pb-4", children: 
                _jsxs("div", { className: "bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 shadow-xl", children: [
                    _jsx("h2", { className: "text-xl md:text-2xl font-bold text-yellow-400 text-center mb-2", style: { fontFamily: 'Cinzel, serif' }, children: "Four Ways to Grow in Faith" }),
                    _jsx("p", { className: "text-blue-100 text-center text-sm mb-5 max-w-2xl mx-auto", children: "Chat with 90+ biblical characters, explore roundtable discussions, follow guided Bible studies, and stay consistent with daily reading plans." }),
                    _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [
                        _jsxs("div", { className: "text-center p-3 bg-white/10 rounded-xl border border-blue-400/30", children: [
                            _jsx("div", { className: "w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md", children: _jsx("svg", { className: "w-5 h-5 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" }) }) }),
                            _jsx("h3", { className: "font-semibold text-yellow-400 text-xs mb-0.5", children: "Character Chat" }),
                            _jsx("p", { className: "text-[10px] text-blue-200", children: "You are here" })
                        ]}),
                        _jsx(Link, { to: "/roundtable/setup", className: "group text-center p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 hover:border-purple-400/30 transition-all", children: _jsxs(_Fragment, { children: [
                            _jsx("div", { className: "w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform", children: _jsx("svg", { className: "w-5 h-5 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" }) }) }),
                            _jsx("h3", { className: "font-semibold text-white text-xs mb-0.5 group-hover:text-yellow-400 transition-colors", children: "Roundtable" }),
                            _jsx("p", { className: "text-[10px] text-blue-200", children: "Group discussions" })
                        ]}) }),
                        _jsx(Link, { to: "/studies", className: "group text-center p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 hover:border-green-400/30 transition-all", children: _jsxs(_Fragment, { children: [
                            _jsx("div", { className: "w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform", children: _jsx("svg", { className: "w-5 h-5 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" }) }) }),
                            _jsx("h3", { className: "font-semibold text-white text-xs mb-0.5 group-hover:text-yellow-400 transition-colors", children: "Bible Studies" }),
                            _jsx("p", { className: "text-[10px] text-blue-200", children: "30+ guided studies" })
                        ]}) }),
                        _jsx(Link, { to: "/reading-plans", className: "group text-center p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 hover:border-amber-400/30 transition-all", children: _jsxs(_Fragment, { children: [
                            _jsx("div", { className: "w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform", children: _jsx("svg", { className: "w-5 h-5 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" }) }) }),
                            _jsx("h3", { className: "font-semibold text-white text-xs mb-0.5 group-hover:text-yellow-400 transition-colors", children: "Reading Plans" }),
                            _jsx("p", { className: "text-[10px] text-blue-200", children: "140+ daily plans" })
                        ]}) })
                    ]}),
                    _jsxs("p", { className: "text-center text-blue-200 text-[10px] mt-3", children: [
                        _jsx(Link, { to: "/getting-started", className: "text-yellow-400 hover:underline", children: "See How It Works" }),
                        " • Invite friends to conversations • Save & share chats"
                    ]})
                ]})
            }),

            /* Glass container wrapping either selection or chat */
            _jsx("div", { className: "relative z-10 flex items-start justify-center " + (character ? "pt-24 md:pt-32" : "pt-4") + " pb-10", children: _jsxs("div", { className: "chat-container w-full max-w-6xl h-[88vh] mx-4 md:mx-6 bg-white/5 backdrop-blur-md border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col", children: [
                        character
                            ? _jsx("main", { className: "flex-1 overflow-hidden", children: _jsx(ChatInterface, {}) })
                            : _jsx("div", { className: "flex-1 overflow-y-auto", children: _jsx(ScalableCharacterSelection, {}) }),
                        /*  The "Resumed conversation" debug badge has been removed
                            to avoid confusing end-users with technical details. */
                    ] }) })
            ,
            /* Featured Character banner hidden by request */
            null
            /* Site footer */
            , _jsx("div", { className: "relative z-10", children: _jsx(Footer, {}) })
        ] }));
};
export default HomePage;
