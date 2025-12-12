import React from 'react';
import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
// Use the unified ChatContext implementation so *all* components
// (including any legacy ones still importing from `../contexts/ChatContext`)
// receive the same provider instance.
import { ChatProvider } from './contexts/ChatContext.jsx';
import { ConversationProvider } from './contexts/ConversationContext.jsx';
import { RoundtableProvider } from './contexts/RoundtableContext.jsx';
/* ------------------------------------------------------------------
 * Global styles
 * ------------------------------------------------------------------ */
import './styles/tooltips.css'; // Custom tooltip system
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import PricingPage from './pages/PricingPage';
import AccountBilling from './pages/AccountBilling.jsx';
// Force the richer JSX-based AdminPage until TSX variant is fully feature-parity
import AdminPage from './pages/AdminPage.jsx';
import ConversationsPage from './pages/ConversationsPage.jsx';
import FavoritesPage from './pages/FavoritesPage.jsx';
import MyWalkPage from './pages/MyWalkPage.jsx';
import FAQPage from './pages/FAQPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import HowItWorksPage from './pages/HowItWorksPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import TermsPage from './pages/TermsPage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';
import CookiePolicyPage from './pages/CookiePolicyPage.jsx';
import PressKitPage from './pages/PressKitPage.jsx';
import CareersPage from './pages/CareersPage.jsx';
import PastorsPage from './pages/PastorsPage.jsx';
import SalesPage from './pages/SalesPage.jsx';
import AdminUpgrade from './pages/AdminUpgrade.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage';
import InviteAccept from './pages/InviteAccept.jsx';
import AdminInvitesPage from './pages/admin/AdminInvitesPage.jsx';
import AdminPremiumCustomers from './pages/admin/AdminPremiumCustomers.jsx';
import SuperadminUsersPage from './pages/admin/SuperadminUsersPage.jsx';
import AdminStudiesPage from './pages/admin/AdminStudiesPage.jsx';
import PresentationGuide from './pages/PresentationGuide.jsx';
import StudiesPage from './pages/StudiesPage.jsx';
import StudyDetails from './pages/StudyDetails.jsx';
import StudyLesson from './pages/StudyLesson.jsx';
import RoundtableSetup from './pages/RoundtableSetup.jsx';
import RoundtableChat from './pages/RoundtableChat.jsx';
import SimpleChatWithHistory from './components/chat/SimpleChatWithHistory';
import DebugPanel from './components/DebugPanel';
import Header from './components/Header';
import LeadCaptureBanner from './components/LeadCaptureBanner';
import LeadCaptureModal from './components/LeadCaptureModal';

// ---------------------------------------------------------------------------
// Helper Component
// ---------------------------------------------------------------------------
// Renders the mobile LeadCaptureBanner only when NOT on an /admin route.
function MobileLeadBannerGate(): JSX.Element | null {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');
  const isRoundtable = location.pathname.startsWith('/roundtable');
  // Hide banner on shared/public views to avoid layout overlap and distraction
  let isShared = false;
  try {
    const params = new URLSearchParams(location.search);
    isShared = params.get('shared') === '1' || location.pathname.startsWith('/shared/');
  } catch {
    // ensure non-empty catch for linting; treat as not shared
    isShared = false;
  }
  // Hide on Roundtable to prevent any overlap and keep focus on discussion
  if (isAdminPath || isShared || isRoundtable) return null;
  return (
    <div className="md:hidden">
      <LeadCaptureBanner />
    </div>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): { hasError: boolean } {
    // Update state so the next render shows the fallback UI.
    if (import.meta.env.DEV) console.debug('[ErrorBoundary] getDerivedStateFromError', error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // You can also log the error to an error reporting service
    console.error('[ErrorBoundary] Rendering error:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo);
    console.error('[ErrorBoundary] Error stack:', error.stack);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);

    this.setState({
      error,
      errorInfo,
    });
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div
          className="flex items-center justify-center min-h-screen bg-blue-900 text-white p-4"
        >
          <div
            className="text-center space-y-4 max-w-2xl"
          >
            <h1 className="text-2xl font-bold">Something went wrong.</h1>
            <p>Please refresh the page to try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-amber-400 text-blue-900 font-semibold px-4 py-2 rounded-lg"
            >
              Reload
            </button>
            {process.env.NODE_ENV === 'development' &&
              this.state.error && (
                <details
                  className="mt-4 text-left"
                >
                  <summary
                    className="cursor-pointer text-yellow-400"
                  >
                    Debug Info (Development)
                  </summary>
                  <pre
                    className="mt-2 p-2 bg-black/50 rounded text-xs overflow-auto max-h-40"
                  >
                    {`${this.state.error.toString()}\n\n${this.state.errorInfo?.componentStack}`}
                  </pre>
                </details>
              )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Protected Route component that checks authentication
const ProtectedRoute = ({ redirectPath = '/login' }: { redirectPath?: string }): JSX.Element => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  // If still loading auth state, show a loading indicator
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-blue-900 text-white"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4"></div><p>Loading...</p></div></div>;
  }
  
  // If not authenticated, redirect to login with return path
  if (!user) {
    return <Navigate to={redirectPath} state={{ from: location }} replace={true} />;
  }
  
  // If authenticated, render the child routes
  return <Outlet />;
};

// Admin Route component that checks both authentication and admin role
const AdminRoute = ({ redirectPath = '/' }: { redirectPath?: string }): JSX.Element => {
  const { user, loading, isAdmin, role, refreshProfile, refreshSession } = useAuth();
  const location = useLocation();
  const [attemptedRefresh, setAttemptedRefresh] = React.useState(false);
  const [retrying, setRetrying] = React.useState(false);

  React.useEffect(() => {
    if (user && role === 'unknown' && !attemptedRefresh) {
      setAttemptedRefresh(true);
      // Kick a quick profile refresh; if that fails, try a session refresh
      (async () => {
        try {
          await refreshProfile();
          if (role === 'unknown') {
            await refreshSession();
          }
        } catch (e) {
          // swallow – UI offers manual retry; log in dev for visibility
          if (import.meta.env.DEV) console.debug('[AdminRoute] refresh failed', e);
        }
      })();
    }
  }, [user, role, attemptedRefresh, refreshProfile, refreshSession]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-blue-900 text-white"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4"></div><p>Loading...</p></div></div>;
  }

  if (!user) {
    return <Navigate to={redirectPath} state={{ from: location }} replace={true} />;
  }

  if (role === 'unknown') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-blue-900 text-white">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 mx-auto"></div>
          <p>Checking your admin access…</p>
          <div className="flex items-center justify-center space-x-2">
            <button
              className="bg-yellow-400 text-blue-900 font-semibold px-4 py-2 rounded-lg disabled:opacity-60"
              disabled={retrying}
              onClick={async () => {
                setRetrying(true);
                try {
                  await refreshProfile();
                  if (role === 'unknown') {
                    await refreshSession();
                  }
                } finally {
                  setRetrying(false);
                }
              }}
            >
              {retrying ? 'Retrying…' : 'Try again'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin()) {
    return <Navigate to={redirectPath} state={{ from: location }} replace={true} />;
  }

  return <Outlet />;
};

function App(): JSX.Element {
  const params = new URLSearchParams(window.location.search);
  // Only enable the "direct render" shortcut while _developing_ and
  // when the URL explicitly asks for it.  Prevents production from
  // forcing everything to HomePage and breaking custom routes like
  // "/pastors".
  const DIRECT_RENDER =
    import.meta.env.DEV && params.get('direct') === '1';
  console.log(`[App] init – DIRECT_RENDER=${DIRECT_RENDER}`);

  /* ------------------------------------------------------------------
   * Providers
   * Always wrap the application in AuthProvider so that useAuth()
   * is safe everywhere, even when we want to "skip" auth-related
   * screens/guards in development.  Any "skip" logic should be handled
   * inside consumer components rather than removing the context.
   * ------------------------------------------------------------------ */
  // Correct provider hierarchy:
  // 1. AuthProvider         – provides authentication state
  // 2. ConversationProvider – conversation persistence (used by chat)
  // 3. ChatProvider         – chat logic (depends on conversation context)
  const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AuthProvider>
      <ConversationProvider>
        <ChatProvider>
          <RoundtableProvider>{children}</RoundtableProvider>
        </ChatProvider>
      </ConversationProvider>
    </AuthProvider>
  );

  if (DIRECT_RENDER) {
    return (
      <ErrorBoundary>
        <Providers>
          <>
            <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-900 via-blue-700 to-blue-600">
              <Header />
              {/* Mobile-only banner */}
              <MobileLeadBannerGate />
              {/* Desktop modal (self-managed triggers) */}
              <LeadCaptureModal />
              <main className="flex-1">
                <HomePage />
              </main>
            </div>
            <DebugPanel />
          </>
        </Providers>
      </ErrorBoundary>
    );
  }

  return (<ErrorBoundary><Providers><>
    <div className="flex flex-col min-h-screen">
      <Header />
      {/* Mobile-only banner */}
      <MobileLeadBannerGate />
      {/* Desktop modal (self-managed triggers) */}
      <LeadCaptureModal />
      <main className="flex-1 px-4 md:px-6"><Routes>
    {/* Public routes */}
    <Route path="/" element={<HomePage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    <Route path="/pricing" element={<PricingPage />} />
    <Route path="/leaders" element={<PastorsPage />} />
    <Route path="/account" element={<AccountBilling />} />
    {/* Invite links: allow first-time users to click and join */}
    <Route path="/invite/:code" element={<InviteAccept />} />
    <Route path="/how-it-works" element={<HowItWorksPage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/contact" element={<ContactPage />} />
    <Route path="/pastors" element={<PastorsPage />} />
    <Route path="/sales" element={<SalesPage />} />
    <Route path="/terms" element={<TermsPage />} />
    <Route path="/privacy" element={<PrivacyPage />} />
    <Route path="/cookies" element={<CookiePolicyPage />} />
    <Route path="/press-kit" element={<PressKitPage />} />
    {/* -------- Roundtable (public) ----------------------------- */}
    <Route path="/roundtable/setup" element={<RoundtableSetup />} />
    <Route path="/roundtable" element={<RoundtableChat />} />
    <Route path="/careers" element={<CareersPage />} />
    <Route path="/faq" element={<FAQPage />} />
    {/* -------- Bible Studies (public) ------------------------- */}
    <Route path="/studies" element={<StudiesPage />} />
    <Route path="/studies/:id" element={<StudyDetails />} />
    <Route path="/studies/:id/lesson/:lessonIndex" element={<StudyLesson />} />
    <Route path="/debug" element={<div className="min-h-screen bg-slate-800 text-white p-4"><h1 className="text-2xl mb-4">Debug Tools</h1><DebugPanel /></div>} />
    
    {/* Chat & Shared conversation routes */}
    <Route path="/chat" element={<SimpleChatWithHistory />} />
    {/* Require login to view saved conversations by ID */}
    <Route element={<ProtectedRoute redirectPath="/login" />}>
      <Route path="/chat/:conversationId" element={<SimpleChatWithHistory />} />
    </Route>
    <Route path="/shared/:shareCode" element={<SimpleChatWithHistory isSharedView={true} />} />

    {/* Protected routes */}
    <Route element={<ProtectedRoute redirectPath="/login" />}>
      <Route element={<AdminRoute redirectPath="/login" />}>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/upgrade" element={<AdminUpgrade />} />
        <Route path="/admin/invites" element={<AdminInvitesPage />} />
        <Route path="/admin/premium" element={<AdminPremiumCustomers />} />
        <Route path="/admin/users" element={<SuperadminUsersPage />} />
        <Route path="/admin/studies" element={<AdminStudiesPage />} />
        {/* Private presenter guide (not in nav) */}
        <Route path="/present/features" element={<PresentationGuide />} />
      </Route>
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/conversations" element={<ConversationsPage />} />
      <Route path="/favorites" element={<FavoritesPage />} />
      <Route path="/my-walk" element={<MyWalkPage />} />
    </Route>
    
    {/* Fallback route */}
    <Route path="*" element={<Navigate to="/" replace={true} />} />
    </Routes></main></div>
  </></Providers></ErrorBoundary>);
}

export default App;
