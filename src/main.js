import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import React from 'react';          // Needed for React.Fragment reference
import './index.css';
import App from './App';
import './services/import-services';
(() => {
    const id = 'sw-cleanup';
    if ('serviceWorker' in navigator && !document.getElementById(id)) {
        const script = document.createElement('script');
        script.id = id;
        script.src = '/service-worker-cleanup.js';
        document.head.prepend(script);
    }
})();
(() => {
    const id = 'network-interceptor';
    const DISABLED = import.meta.env.VITE_ENABLE_INTERCEPTOR &&
        import.meta.env.VITE_ENABLE_INTERCEPTOR.toString() === 'false';
    if (DISABLED) {
        console.info('[Interceptor] Skipped – disabled via VITE_ENABLE_INTERCEPTOR');
        return;
    }
    if (!document.getElementById(id)) {
        const script = document.createElement('script');
        script.id = id;
        script.src = '/intercept.js';
        document.head.appendChild(script);
    }
})();
(() => {
    const id = 'google-font-cinzel';
    if (!document.getElementById(id)) {
        const link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href =
            'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap';
        document.head.appendChild(link);
    }
})();
const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error("Root element with id 'root' not found");
}
console.log('[App] Starting Bible Character Chat with safe service initialization');
try {
    // Avoid JSX fragment shorthand so the file can be transpiled without the JSX plugin.
    // We build the children array manually and use the `_jsxs` helper from `react/jsx-runtime`.
    createRoot(rootElement).render(
        _jsx(StrictMode, {
            children: _jsx(App, {})
        })
    );
}
catch (err) {
    console.error('[App] Failed to initialise React root:', err);
    const div = document.createElement('div');
    div.style.cssText =
        'position:fixed;top:0;left:0;width:100%;padding:12px;background:#b91c1c;color:#fff;font-family:monospace;z-index:9999';
    div.textContent = '⚠️ Bible Character Chat failed to load. Check console for details.';
    document.body.appendChild(div);
}
