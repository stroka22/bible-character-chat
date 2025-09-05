import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';

// Import safe service versions that gracefully handle missing API keys
// These are imported here to ensure they're initialized before any components
import './services/openai-safe';
import './services/stripe-safe';

// Initialize network interceptor for image requests
(() => {
  // Add script to intercept network requests for example.com images
  const id = 'network-interceptor';
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

// Mount the React application
createRoot(rootElement).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>
);
