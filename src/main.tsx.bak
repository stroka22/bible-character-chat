import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import App from './App';

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

// Mount the React application
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
