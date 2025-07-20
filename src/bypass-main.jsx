import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';

// Simple error boundary component
class SimpleErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[Bypass] Error caught by boundary:", error);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
          <h1 className="text-xl font-bold mb-2">Something went wrong in Bypass Mode</h1>
          <p className="mb-2">This is a simplified version of the app with no API dependencies.</p>
          <p className="mb-2">Error: {this.state.error?.message || 'Unknown error'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reload Page
          </button>
          <pre className="mt-4 p-2 bg-gray-100 rounded overflow-auto text-xs">
            {this.state.errorInfo?.componentStack || 'No stack trace available'}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// Diagnostic component to show environment info
const DiagnosticPanel = () => {
  const [envVars, setEnvVars] = useState({});
  const location = useLocation();

  useEffect(() => {
    // Collect environment variables with VITE_ prefix
    const vars = {};
    Object.keys(import.meta.env).forEach(key => {
      if (key.startsWith('VITE_')) {
        // Mask actual values for security, just show if they exist
        vars[key] = import.meta.env[key] ? '✓ Set' : '✗ Not set';
      }
    });
    setEnvVars(vars);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg p-4 rounded-lg max-w-md border border-gray-200">
      <h3 className="font-bold text-lg mb-2">Bypass Mode Diagnostics</h3>
      <p className="text-sm mb-2">Running with no API dependencies</p>
      
      <div className="mb-2">
        <strong>Current Route:</strong> {location.pathname}
      </div>
      
      <div className="mb-2">
        <strong>Environment Variables:</strong>
        <ul className="text-xs">
          {Object.keys(envVars).length > 0 ? (
            Object.keys(envVars).map(key => (
              <li key={key}>
                {key}: <span className={envVars[key].includes('✓') ? 'text-green-600' : 'text-red-600'}>
                  {envVars[key]}
                </span>
              </li>
            ))
          ) : (
            <li>No VITE_ environment variables detected</li>
          )}
        </ul>
      </div>
      
      <div className="text-xs text-gray-500 mt-2">
        Build Time: {new Date().toISOString()}
      </div>
    </div>
  );
};

// Minimal navigation
const Navigation = () => (
  <nav className="bg-blue-900 text-white p-4">
    <div className="container mx-auto flex justify-between items-center">
      <div className="text-xl font-bold">Bible Character Chat (Bypass Mode)</div>
      <div className="space-x-4">
        <Link to="/" className="hover:underline">Home</Link>
        <Link to="/characters" className="hover:underline">Characters</Link>
        <Link to="/about" className="hover:underline">About</Link>
      </div>
    </div>
  </nav>
);

// Simple pages
const HomePage = () => (
  <div className="container mx-auto p-8">
    <h1 className="text-3xl font-bold mb-6">Welcome to Bible Character Chat</h1>
    <p className="mb-4">This is a simplified version of the app running in bypass mode.</p>
    <p className="mb-4">No API services are initialized in this mode.</p>
    <div className="p-4 bg-green-100 border-l-4 border-green-500 text-green-700 mb-4">
      If you can see this page, the basic React rendering is working correctly.
    </div>
    <Link 
      to="/characters" 
      className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
    >
      View Characters
    </Link>
  </div>
);

const CharactersPage = () => {
  // Hardcoded characters to avoid API dependencies
  const characters = [
    { id: 1, name: 'Moses', description: 'Leader who led the Israelites out of Egypt' },
    { id: 2, name: 'David', description: 'King of Israel and writer of many Psalms' },
    { id: 3, name: 'Paul', description: 'Apostle who wrote much of the New Testament' },
  ];
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Bible Characters</h1>
      <p className="mb-6">These characters are hardcoded and don't require API access.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {characters.map(character => (
          <div key={character.id} className="border rounded-lg p-4 shadow-md">
            <h2 className="text-xl font-bold mb-2">{character.name}</h2>
            <p>{character.description}</p>
            <button 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => alert(`Chat with ${character.name} is disabled in bypass mode`)}
            >
              Chat (Disabled)
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const AboutPage = () => (
  <div className="container mx-auto p-8">
    <h1 className="text-3xl font-bold mb-6">About Bypass Mode</h1>
    <p className="mb-4">
      This simplified version of the app bypasses all external API dependencies to help
      isolate rendering issues from API configuration problems.
    </p>
    <div className="p-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700">
      <h2 className="font-bold mb-2">Troubleshooting Information</h2>
      <ul className="list-disc list-inside">
        <li>React version: {React.version}</li>
        <li>Mode: {import.meta.env.MODE}</li>
        <li>Base URL: {import.meta.env.BASE_URL}</li>
        <li>Browser: {navigator.userAgent}</li>
      </ul>
    </div>
  </div>
);

// Main app component
const App = () => (
  <SimpleErrorBoundary>
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/characters" element={<CharactersPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
        <DiagnosticPanel />
      </div>
    </BrowserRouter>
  </SimpleErrorBoundary>
);

// Initialize the app
const root = document.getElementById('root');
if (!root) {
  console.error("Root element with id 'root' not found");
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = 'padding:20px;background:#f44336;color:white;';
  errorDiv.textContent = "Could not find root element. Please make sure there's a div with id 'root' in your HTML.";
  document.body.appendChild(errorDiv);
} else {
  console.log("[Bypass] Starting Bible Character Chat in bypass mode (no API dependencies)");
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
