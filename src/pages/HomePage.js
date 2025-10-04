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
                    const { defaultId, enforceAdminDefault } = await siteSettingsRepository.getDefaultFeaturedCharacterId(slug) || {};
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

            /* Floating action buttons cluster (Roundtable + conditional Upgrade) */
            _jsx(FABCluster, {}),

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
