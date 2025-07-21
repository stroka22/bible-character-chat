import { jsx as _jsx } from "react/jsx-runtime";
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import './services/openai-safe';
import './services/stripe-safe';
(() => {
    const id = 'network-interceptor';
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
createRoot(rootElement).render(_jsx(StrictMode, { children: _jsx(App, {}) }));
