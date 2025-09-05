import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import App from './App.tsx';
import { BrowserRouter as Router } from 'react-router-dom';

// Import safe service versions that gracefully handle missing API keys
// A single barrel file initializes all safe service shims in one place
// (OpenAI, Stripe, and any future external services).
import './services/import-services';

// ---------------------------------------------------------------------------
// 1. Early service-worker cleanup to prevent old SWs from hijacking requests
// ---------------------------------------------------------------------------
(() => {
  const id = 'sw-cleanup';
  // Only run when browser supports service-workers and script not already added
  if ('serviceWorker' in navigator && !document.getElementById(id)) {
    const script = document.createElement('script');
    script.id = id;
    script.src = '/service-worker-cleanup.js';
    // Prepend so it executes before any React code that might register a SW
    document.head.prepend(script);
  }
})();

// ---------------------------------------------------------------------------
// 2. Optional network interceptor (can be disabled via VITE_ENABLE_INTERCEPTOR)
// ---------------------------------------------------------------------------
(() => {
  // Add script to intercept network requests for example.com images
  const id = 'network-interceptor';
  const DISABLED =
    import.meta.env.VITE_ENABLE_INTERCEPTOR &&
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

// Inject Google Font "Cinzel" for a more biblical look
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

// Get the root DOM element
const rootElement = document.getElementById('root');

// In development, fail fast if the root element is missing
if (!rootElement) {
  throw new Error("Root element with id 'root' not found");
}

// Log initialization
console.log('[App] Starting Bible Character Chat with safe service initialization');

// Mount the React application (guard with try/catch for clearer failures)
try {
  createRoot(rootElement).render(
    <StrictMode>
      <Router>
        <App />
      </Router>
    </StrictMode>,
  );
} catch (err) {
  // eslint-disable-next-line no-console
  console.error('[App] Failed to initialise React root:', err);
  const div = document.createElement('div');
  div.style.cssText =
    'position:fixed;top:0;left:0;width:100%;padding:12px;background:#b91c1c;color:#fff;font-family:monospace;z-index:9999';
  div.textContent = '⚠️ Bible Character Chat failed to load. Check console for details.';
  document.body.appendChild(div);
}
