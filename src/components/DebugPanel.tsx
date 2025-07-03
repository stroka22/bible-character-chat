import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { getPublicKey, createCheckoutSession, SUBSCRIPTION_PRICES } from '../services/stripe';

// Style constants
const PANEL_STYLE = 'fixed bottom-0 right-0 w-96 max-h-[80vh] bg-gray-900 text-white p-4 overflow-auto z-50 rounded-tl-lg shadow-xl border-l border-t border-gray-700';
const SECTION_STYLE = 'mb-4 pb-4 border-b border-gray-700';
const HEADING_STYLE = 'text-sm font-bold text-gray-400 uppercase tracking-wider mb-2';
const INFO_ITEM_STYLE = 'flex justify-between items-center mb-1';
const BUTTON_STYLE = 'px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors';
const ERROR_STYLE = 'mt-2 p-2 bg-red-900/50 text-red-300 text-xs rounded';
const SUCCESS_STYLE = 'mt-2 p-2 bg-green-900/50 text-green-300 text-xs rounded';
const LOG_STYLE = 'mt-4 p-2 bg-gray-800 text-xs font-mono rounded h-40 overflow-auto';

const DebugPanel: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // State
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [stripeLoaded, setStripeLoaded] = useState<boolean | null>(null);
  const [stripeInstance, setStripeInstance] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Add a log entry
  const addLog = (message: string) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev]);
  };
  
  // Clear logs
  const clearLogs = () => setLogs([]);
  
  // Check if Stripe is loaded
  useEffect(() => {
    const checkStripe = async () => {
      try {
        addLog('Checking Stripe initialization...');
        const publicKey = getPublicKey();
        addLog(`Public key available: ${publicKey ? 'YES' : 'NO'}`);
        
        if (!publicKey) {
          setStripeLoaded(false);
          addLog('❌ No Stripe public key found');
          return;
        }
        
        const stripe = await loadStripe(publicKey);
        setStripeInstance(stripe);
        setStripeLoaded(!!stripe);
        addLog(`✅ Stripe ${stripe ? 'successfully loaded' : 'failed to load'}`);
      } catch (err) {
        setStripeLoaded(false);
        addLog(`❌ Error loading Stripe: ${err instanceof Error ? err.message : String(err)}`);
      }
    };
    
    checkStripe();
  }, []);
  
  // Test direct checkout
  const testDirectCheckout = async (period: 'monthly' | 'yearly') => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    
    try {
      addLog(`Starting direct checkout test (${period})...`);
      
      if (!user) {
        addLog('❌ No user logged in. Authentication required.');
        setError('Authentication required. Please log in first.');
        return;
      }
      
      if (!stripeLoaded || !stripeInstance) {
        addLog('❌ Stripe not loaded. Cannot proceed.');
        setError('Stripe failed to load. Check console for details.');
        return;
      }
      
      const priceId = period === 'monthly' 
        ? SUBSCRIPTION_PRICES.MONTHLY 
        : SUBSCRIPTION_PRICES.YEARLY;
      
      addLog(`Using price ID: ${priceId}`);
      addLog(`User ID: ${user.id}, Email: ${user.email}`);
      
      // Create checkout session
      addLog('Creating checkout session...');
      const session = await createCheckoutSession({
        priceId,
        successUrl: window.location.origin + '/conversations?checkout=success',
        cancelUrl: window.location.origin + '/pricing?checkout=canceled',
        customerId: user.id,
        customerEmail: user.email,
        metadata: {
          userId: user.id,
          debugMode: 'true'
        },
      });
      
      addLog(`✅ Session created: ${session.id}`);
      addLog(`Redirecting to: ${session.url}`);
      
      // Redirect to Stripe Checkout
      setSuccess(`Redirecting to Stripe checkout (${period} plan)...`);
      const { error } = await stripeInstance.redirectToCheckout({ sessionId: session.id });
      
      if (error) {
        throw new Error(`Stripe redirect error: ${error.message}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      addLog(`❌ Error: ${errorMessage}`);
      setError(`Checkout failed: ${errorMessage}`);
      console.error('Debug checkout error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Test URL parameter checkout
  const testUrlParamCheckout = (period: 'monthly' | 'yearly') => {
    addLog(`Testing URL parameter checkout (${period})...`);
    navigate(`/pricing?checkout=true&period=${period}`);
  };
  
  // Toggle panel visibility
  const toggleVisibility = () => setIsVisible(!isVisible);
  
  return (
    <>
      {/* Toggle button */}
      <button 
        onClick={toggleVisibility}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full shadow-lg z-50 hover:bg-gray-700"
        title="Toggle Debug Panel"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      </button>
      
      {/* Debug panel */}
      {isVisible && (
        <div className={PANEL_STYLE}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Checkout Debug Panel</h2>
            <button 
              onClick={toggleVisibility}
              className="text-gray-400 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Authentication status */}
          <div className={SECTION_STYLE}>
            <h3 className={HEADING_STYLE}>Authentication Status</h3>
            <div className={INFO_ITEM_STYLE}>
              <span>User Logged In:</span>
              <span className={user ? 'text-green-400' : 'text-red-400'}>
                {user ? 'Yes' : 'No'}
              </span>
            </div>
            {user && (
              <>
                <div className={INFO_ITEM_STYLE}>
                  <span>User ID:</span>
                  <span className="text-xs">{user.id}</span>
                </div>
                <div className={INFO_ITEM_STYLE}>
                  <span>Email:</span>
                  <span className="text-xs">{user.email}</span>
                </div>
              </>
            )}
          </div>
          
          {/* Stripe status */}
          <div className={SECTION_STYLE}>
            <h3 className={HEADING_STYLE}>Stripe Status</h3>
            <div className={INFO_ITEM_STYLE}>
              <span>Stripe Loaded:</span>
              <span className={
                stripeLoaded === null 
                  ? 'text-yellow-400' 
                  : stripeLoaded 
                    ? 'text-green-400' 
                    : 'text-red-400'
              }>
                {stripeLoaded === null ? 'Checking...' : stripeLoaded ? 'Yes' : 'No'}
              </span>
            </div>
            <div className={INFO_ITEM_STYLE}>
              <span>Public Key Available:</span>
              <span className={getPublicKey() ? 'text-green-400' : 'text-red-400'}>
                {getPublicKey() ? 'Yes' : 'No'}
              </span>
            </div>
            <div className={INFO_ITEM_STYLE}>
              <span>Monthly Price ID:</span>
              <span className="text-xs">{SUBSCRIPTION_PRICES.MONTHLY}</span>
            </div>
            <div className={INFO_ITEM_STYLE}>
              <span>Yearly Price ID:</span>
              <span className="text-xs">{SUBSCRIPTION_PRICES.YEARLY}</span>
            </div>
          </div>
          
          {/* Current URL info */}
          <div className={SECTION_STYLE}>
            <h3 className={HEADING_STYLE}>Current Location</h3>
            <div className={INFO_ITEM_STYLE}>
              <span>Path:</span>
              <span className="text-xs">{location.pathname}</span>
            </div>
            <div className={INFO_ITEM_STYLE}>
              <span>Search:</span>
              <span className="text-xs">{location.search || '(none)'}</span>
            </div>
          </div>
          
          {/* Test actions */}
          <div className={SECTION_STYLE}>
            <h3 className={HEADING_STYLE}>Test Actions</h3>
            
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                onClick={() => testDirectCheckout('monthly')}
                disabled={isLoading || !user || !stripeLoaded}
                className={`${BUTTON_STYLE} ${(isLoading || !user || !stripeLoaded) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Test Monthly Checkout
              </button>
              
              <button
                onClick={() => testDirectCheckout('yearly')}
                disabled={isLoading || !user || !stripeLoaded}
                className={`${BUTTON_STYLE} ${(isLoading || !user || !stripeLoaded) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Test Yearly Checkout
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => testUrlParamCheckout('monthly')}
                className={BUTTON_STYLE}
              >
                Test URL Param (Monthly)
              </button>
              
              <button
                onClick={() => testUrlParamCheckout('yearly')}
                className={BUTTON_STYLE}
              >
                Test URL Param (Yearly)
              </button>
            </div>
            
            {error && <div className={ERROR_STYLE}>{error}</div>}
            {success && <div className={SUCCESS_STYLE}>{success}</div>}
          </div>
          
          {/* Logs */}
          <div>
            <div className="flex justify-between items-center">
              <h3 className={HEADING_STYLE}>Debug Logs</h3>
              <button 
                onClick={clearLogs}
                className="text-xs text-gray-400 hover:text-white"
              >
                Clear
              </button>
            </div>
            <div className={LOG_STYLE}>
              {logs.length === 0 ? (
                <div className="text-gray-500 italic">No logs yet</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">{log}</div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DebugPanel;
