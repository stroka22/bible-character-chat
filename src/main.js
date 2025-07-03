import { jsx as _jsx } from "react/jsx-runtime";
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App-DirectLogin';
// Inject Google Font "Cinzel" for a more biblical look
(function () {
    var id = 'google-font-cinzel';
    if (!document.getElementById(id)) {
        var link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href =
            'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap';
        document.head.appendChild(link);
    }
})();
// Get the root DOM element
var rootElement = document.getElementById('root');
// In development, fail fast if the root element is missing
if (!rootElement) {
    throw new Error("Root element with id 'root' not found");
}
// Mount the React application
createRoot(rootElement).render(_jsx(StrictMode, { children: _jsx(App, {}) }));
