import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import { useAuth } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import ConversationsPage from './pages/ConversationsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SecureAdminPage from './pages/SecureAdminPage';
import AccessDeniedPage from './pages/AccessDeniedPage';
import PricingPage from './pages/PricingPage';
import StripeTestPage from './pages/StripeTestPage';
import DirectStripePage from './pages/DirectStripePage';
import Header from './components/layout/Header';
import DebugPanel from './components/DebugPanel';

// Route Logger - logs route changes
const RouteLogger = () => {
  const location = useLocation();
  
  useEffect(() => {
    console.debug(`[Router] Navigation to: ${location.pathname}${location.search}`);
  }, [location]);
  
  return null; // This component doesn't render anything
};

// Logout component - handles session clearing and redirect
const LogoutPage = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const performLogout = async () => {
      console.debug('[Logout] Clearing session and redirecting to login');
      try {
        await signOut();
        // Force clear any local storage as a safety measure
        localStorage.clear();
      } catch (error) {
        console.error('[Logout] Error during logout:', error);
      } finally {
        // Always redirect to login, even if there was an error
        navigate('/login', { replace: true });
      }
    };
    
    performLogout();
  }, [signOut, navigate]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-white text-lg">Logging out...</p>
      </div>
    </div>
  );
};

// Protected Route Component - Checks authentication and roles
const ProtectedRoute = ({ 
  requireAuth = true, 
  requireAdmin = false, 
  requirePastor = false, 
  children 
}: { 
  requireAuth?: boolean, 
  requireAdmin?: boolean, 
  requirePastor?: boolean, 
  children?: React.ReactNode 
}) => {
  const { user, loading, role, isAdmin, isPastor } = useAuth();
  const location = useLocation();
  
  // Enhanced debug logging
  useEffect(() => {
    console.debug(
      `[ProtectedRoute] Path: ${location.pathname} | ` +
      `Auth Required: ${requireAuth} | ` +
      `Admin Required: ${requireAdmin} | ` +
      `Pastor Required: ${requirePastor} | ` +
      `User: ${user?.email || 'none'} | ` +
      `Role: ${role} | ` +
      `Loading: ${loading}`
    );
  }, [location.pathname, requireAuth, requireAdmin, requirePastor, user, role, loading]);

  // Show loading state while checking authentication or if role is still unknown
  if (loading || (user && role === 'unknown')) {
    console.debug('[ProtectedRoute] Still loading auth state or role information');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Check authentication
  if (requireAuth && !user) {
    // Redirect to login, but remember where they were trying to go
    console.debug('[ProtectedRoute] Auth required but no user - redirecting to login');
    return <Navigate to={`/login?to=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Check admin role if required
  if (requireAdmin && !isAdmin()) {
    console.debug('[ProtectedRoute] Admin required but user is not admin - access denied');
    return <Navigate to="/access-denied" replace />;
  }

  // Check pastor role if required
  if (requirePastor && !isPastor()) {
    console.debug('[ProtectedRoute] Pastor required but user is not pastor - access denied');
    return <Navigate to="/access-denied" replace />;
  }

  // If all checks pass, render the children or outlet
  console.debug('[ProtectedRoute] All checks passed - rendering protected content');
  return <>{children || <Outlet />}</>;
};

// Auth-aware content component
const MainContent = () => {
  const [showConversations, setShowConversations] = React.useState(false);

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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
};

// Main App Component with routes
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ChatProvider>
          {/* Global gradient background */}
          <div
            data-design="vivid-purple"
            className="flex min-h-screen flex-col bg-gradient-to-b from-blue-900 via-blue-600 to-blue-400"
          >
            {/* Route change logger */}
            <RouteLogger />
            
            {/* Full-width upgrade banner (always visible) */}
            <div className="fixed top-0 left-0 w-full z-[10000] bg-amber-400 text-blue-900 shadow-lg border-b-2 border-amber-500">
              <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-center gap-4">
                <span className="text-lg md:text-xl font-extrabold tracking-wide text-center">
                  UPGRADE TO PREMIUM &nbsp;–&nbsp; Unlock unlimited chats and the full character library!
                </span>
                <Link
                  to="/pricing"
                  className="rounded-full bg-blue-900 text-amber-300 font-bold px-6 py-2 hover:bg-blue-800 transition-colors shadow-md"
                >
                  View Pricing
                </Link>
              </div>
            </div>

            {/* Global app header with navigation */}
            <Header />
            
            <main className="flex-grow">
              <Routes>
                {/* Public routes - accessible without authentication */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/access-denied" element={<AccessDeniedPage />} />
                <Route path="/logout" element={<LogoutPage />} />
                
                {/* Testing routes - will be removed in production */}
                <Route path="/stripe-test" element={<StripeTestPage />} />
                <Route path="/direct-stripe" element={<DirectStripePage />} />
                
                {/* Protected admin routes - require pastor or admin role */}
                <Route element={<ProtectedRoute requireAuth requirePastor />}>
                  <Route path="/admin/*" element={<SecureAdminPage />} />
                </Route>
                
                {/* Protected user routes - require authentication */}
                <Route element={<ProtectedRoute requireAuth />}>
                  <Route path="/*" element={<MainContent />} />
                </Route>
              </Routes>
            </main>
            
            {/* Global debug panel (visible only when toggled) */}
            <DebugPanel />
          </div>
        </ChatProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
