import React, { useMemo } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import HomePage from './pages/HomePage';
import DebugPanel from './components/DebugPanel';

// Simple error boundary for graceful error handling
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('[ErrorBoundary] Rendering error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-blue-900 text-white">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Something went wrong.</h1>
            <p>Please refresh the page to try again.</p>
            <button onClick={() => window.location.reload()} className="bg-amber-400 text-blue-900 font-semibold px-4 py-2 rounded-lg">
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Main App Component
function App() {
  // ------------------------------------------------------------------
  // Runtime flags (URL query string takes precedence over .env)
  // ?direct=1    - render selector directly without routing
  // ?skipAuth=1  - skip AuthProvider wrapping
  // ------------------------------------------------------------------
  const params = new URLSearchParams(window.location.search);
  const DIRECT_RENDER =
    params.get('direct') === '1' ||
    import.meta.env.VITE_DIRECT_RENDER === 'true';
  const SKIP_AUTH =
    params.get('skipAuth') === '1' ||
    import.meta.env.VITE_SKIP_AUTH === 'true';

  console.log(
    `[App] init – DIRECT_RENDER=${DIRECT_RENDER} | SKIP_AUTH=${SKIP_AUTH}`,
  );

  const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    SKIP_AUTH ? (
      <ChatProvider>{children}</ChatProvider>
    ) : (
      <AuthProvider>
        <ChatProvider>{children}</ChatProvider>
      </AuthProvider>
    );

  // Debug banner component
  const DebugBanner: React.FC = () => {
    const loc = useLocation();
    const { flags, label } = useMemo(() => {
      const f: string[] = [];
      if (DIRECT_RENDER) f.push('DIRECT');
      if (SKIP_AUTH) f.push('SKIP_AUTH');
      return { flags: f, label: f.join(' • ') };
    }, [DIRECT_RENDER, SKIP_AUTH]);

    // Hide banner entirely when no debug flags are active
    if (flags.length === 0) return null;

    return (
      <div className="fixed top-4 right-4 z-50 bg-red-600 text-white px-4 py-2 rounded-md shadow-lg text-xs">
        {label} <br />
        {loc.pathname}
      </div>
    );
  };

  // When direct flag is enabled we bypass Router entirely
  if (DIRECT_RENDER) {
    return (
      <ErrorBoundary>
        <Providers>
          <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-700 to-blue-600">
            <DebugBanner />
            <HomePage />
            <DebugPanel />
          </div>
        </Providers>
      </ErrorBoundary>
    );
  }

  // Default: full Router experience
  return (
    <ErrorBoundary>
      <Providers>
        <Router>
          <DebugBanner />
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* Dedicated debug route to isolate redirect issues */}
            <Route
              path="/debug"
              element={
                <div className="min-h-screen bg-slate-800 text-white p-4">
                  <h1 className="text-2xl mb-4">Debug Tools</h1>
                  <DebugPanel />
                </div>
              }
            />
            {/* Catch-all: redirect to home to avoid 404/redirect loops */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </Providers>
    </ErrorBoundary>
  );
}

export default App;
