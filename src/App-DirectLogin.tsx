import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import { useAuth } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import ConversationsPage from './pages/ConversationsPage';
import Header from './components/layout/Header';
import { supabase } from './services/supabase';

// Placeholder for the Admin Panel page
const AdminPage: React.FC = () => {
  const { user } = useAuth();

  // Simple admin check for demonstration. In a real app, this would involve roles from the database.
  const isAdmin = user && user.email === 'admin@example.com';

  if (!isAdmin) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-red-50 p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-800 mb-4">Access Denied</h2>
          <p className="text-red-700">You do not have administrative privileges to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Panel - Character Management</h1>
      <p className="text-gray-700 mb-4">
        Welcome, Admin! Here you can manage Bible characters.
      </p>
      {/* Part A: CSV Upload Tool */}
      <section className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Bulk Upload Characters (CSV)</h2>
        <p className="text-gray-600 mb-4">
          Upload a CSV file to add or update multiple characters.
          Expected fields: `character_name`, `avatar_url`, `feature_image_url`, `short_biography`,
          `bible_book`, `opening_sentence`, `persona_prompt`, `scriptural_context`.
        </p>
        <input type="file" accept=".csv" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
        <button className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">Upload CSV</button>
      </section>

      {/* Part B: Manual Character Creation/Edit Form */}
      <section className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Manual Character Management</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Character Name</label>
            <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Avatar URL</label>
            <input type="url" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Feature Image URL</label>
            <input type="url" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Short Biography</label>
            <textarea rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bible Book</label>
            <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Opening Sentence</label>
            <textarea rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Persona Prompt</label>
            <textarea rows={5} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Scriptural Context</label>
            <textarea rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"></textarea>
          </div>
          <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">Save Character</button>
        </form>

        <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Existing Characters</h3>
        {/* Simple search/filter */}
        <input type="text" placeholder="Search existing characters..." className="mb-4 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
        <ul className="space-y-2">
          <li className="flex justify-between items-center p-3 bg-gray-50 rounded-md border border-gray-200">
            <span>Paul</span>
            <div>
              <button className="text-blue-600 hover:text-blue-800 mr-2">Edit</button>
              <button className="text-red-600 hover:text-red-800">Delete</button>
            </div>
          </li>
          <li className="flex justify-between items-center p-3 bg-gray-50 rounded-md border border-gray-200">
            <span>Moses</span>
            <div>
              <button className="text-blue-600 hover:text-blue-800 mr-2">Edit</button>
              <button className="text-red-600 hover:text-red-800">Delete</button>
            </div>
          </li>
          {/* More characters would be listed here dynamically */}
        </ul>
      </section>
    </div>
  );
};

// Direct login component with enhanced error reporting and troubleshooting
const DirectLogin = () => {
  const { signIn, user } = useAuth();
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [bypassAuth, setBypassAuth] = useState(false);

  // Check session on component mount
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setDebugInfo(`Active session detected for: ${data.session.user.email}`);
      } else {
        setDebugInfo('No active session found');
      }
    };
    
    checkSession();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setDebugInfo(null);
    
    try {
      // Direct Supabase auth call for maximum transparency
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data?.user) {
        setSuccess(`Successfully logged in as ${data.user.email}!`);
        setDebugInfo(`Auth session established. User ID: ${data.user.id}`);
      }
    } catch (err: any) {
      setError(`Login failed: ${err.message || 'Unknown error'}`);
      setDebugInfo(JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  // Function to create test user directly through Supabase API
  const createTestUser = async () => {
    setIsCreating(true);
    setError(null);
    setSuccess(null);
    setDebugInfo(null);
    
    try {
      // Create the user using signUp
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data?.user) {
        setSuccess(`User created! ID: ${data.user.id}`);
        setDebugInfo(`User created but may need email verification.
          Email confirmation status: ${data.user.email_confirmed_at ? 'Confirmed' : 'Not confirmed'}
          Created at: ${data.user.created_at}
          You can now try to sign in.`);
      }
    } catch (err: any) {
      if (err.message?.includes('User already registered')) {
        setSuccess('This email is already registered. Try signing in instead.');
      } else {
        setError(`Failed to create user: ${err.message || 'Unknown error'}`);
        setDebugInfo(JSON.stringify(err, null, 2));
      }
    } finally {
      setIsCreating(false);
    }
  };

  // Reset password function
  const resetPassword = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setDebugInfo(null);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      
      if (error) throw error;
      
      setSuccess(`Password reset email sent to ${email}`);
    } catch (err: any) {
      setError(`Failed to send reset email: ${err.message || 'Unknown error'}`);
      setDebugInfo(JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  // Bypass auth for testing
  const enableBypass = () => {
    setBypassAuth(true);
    localStorage.setItem('bypass_auth', 'true');
  };

  // If bypass is enabled, return null to skip the login screen
  if (bypassAuth) {
    return null;
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Bible Character Chat</h2>
      <p className="text-center text-gray-600 mb-6">Authentication Troubleshooter</p>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded border border-red-300">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded border border-green-300">
          <p className="font-bold">Success:</p>
          <p>{success}</p>
        </div>
      )}
      
      <form onSubmit={handleLogin} className="mb-6">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded focus:ring-2 focus:ring-primary-300 focus:border-primary-500 outline-none transition"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded focus:ring-2 focus:ring-primary-300 focus:border-primary-500 outline-none transition"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-primary-600 text-white py-3 px-4 rounded font-medium hover:bg-primary-700 disabled:bg-gray-400 transition"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
          
          <button
            type="button"
            onClick={createTestUser}
            disabled={isCreating}
            className="bg-secondary-600 text-white py-3 px-4 rounded font-medium hover:bg-secondary-700 disabled:bg-gray-400 transition"
          >
            {isCreating ? 'Creating...' : 'Create Test User'}
          </button>
        </div>
      </form>
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <button
          onClick={resetPassword}
          className="text-primary-600 hover:text-primary-800 mb-4 md:mb-0"
        >
          Reset Password
        </button>
        
        <button
          onClick={enableBypass}
          className="text-gray-600 hover:text-gray-800 underline text-sm"
        >
          Bypass Authentication (Testing Only)
        </button>
      </div>
      
      {/* Debug information toggle */}
      <div className="mt-8 border-t pt-4">
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="text-gray-500 text-sm flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 mr-1 transition-transform ${showDebug ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          Debug Information
        </button>
        
        {showDebug && debugInfo && (
          <pre className="mt-2 p-3 bg-gray-100 text-gray-800 rounded text-xs overflow-x-auto">
            {debugInfo}
          </pre>
        )}
      </div>
    </div>
  );
};

// Main App Component with routes
function App() {
  const [bypassAuth, setBypassAuth] = useState(false);

  // Check for bypass auth on component mount
  useEffect(() => {
    const bypass = localStorage.getItem('bypass_auth') === 'true';
    setBypassAuth(bypass);
  }, []);

  // Auth-aware content component
  const MainContent = () => {
    const { user } = useAuth();
    const [showConversations, setShowConversations] = useState(false);

    // If not authenticated and not in bypass mode, show login
    if (!user && !bypassAuth) {
      return <DirectLogin />;
    }

    return (
      <div className="flex-grow flex flex-col">
        {/* Navigation tabs */}
        <div className="bg-white border-b border-gray-200 p-4 flex justify-center">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setShowConversations(false)}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                !showConversations
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Chat with Characters
            </button>
            <button
              type="button"
              onClick={() => setShowConversations(true)}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                showConversations
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Saved Conversations
            </button>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={showConversations ? <ConversationsPage /> : <HomePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/characters" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    );
  };

  return (
    <BrowserRouter>
      <AuthProvider>
        <ChatProvider>
          <div className="flex min-h-screen flex-col bg-gray-50">
            {/* Header component - uncomment if implemented */}
            {/* <Header /> */}
            
            <main className="flex-grow">
              <Routes>
                <Route path="/*" element={<MainContent />} />
                {/* 
                  Admin routes are handled inside MainContent to ensure
                  proper authentication checks are applied
                */}
              </Routes>
            </main>
            
            {/* Footer component - uncomment if implemented */}
            {/* <Footer /> */}
          </div>
        </ChatProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
