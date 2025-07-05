import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

/**
 * StripeTestPage - A minimal test page for Stripe checkout
 * 
 * This component bypasses the regular Stripe service and directly calls
 * the Vercel serverless function to create a checkout session. It includes
 * detailed logging and error handling to help diagnose payment issues.
 */
const StripeTestPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [sessionUrl, setSessionUrl] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [networkDetails, setNetworkDetails] = useState<any>(null);

  // Add a log entry with timestamp
  const addLog = (message: string) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry);
    setLogs(prevLogs => [...prevLogs, logEntry]);
  };

  // Clear all logs
  const clearLogs = () => {
    setLogs([]);
    setError(null);
    setSessionUrl(null);
    setSessionId(null);
    setNetworkDetails(null);
  };

  // Check if the user is logged in on component mount
  useEffect(() => {
    addLog(`Auth state: ${user ? 'Logged in as ' + user.email : 'Not logged in'}`);
  }, [user]);

  // Direct API call to create checkout session
  const createCheckoutSession = async (priceId: string) => {
    setLoading(true);
    setError(null);
    setSessionUrl(null);
    setSessionId(null);
    setNetworkDetails(null);

    const startTime = performance.now();
    addLog(`Starting direct checkout session creation for price: ${priceId}`);
    addLog(`User: ${user ? JSON.stringify({id: user.id, email: user.email}) : 'Not logged in'}`);

    if (!user) {
      setError('You must be logged in to checkout');
      setLoading(false);
      addLog('Error: User not logged in');
      return;
    }

    try {
      // Prepare the request body
      const requestBody = {
        priceId,
        successUrl: window.location.origin + '/stripe-test?result=success',
        cancelUrl: window.location.origin + '/stripe-test?result=canceled',
        customerId: user.id,
        customerEmail: user.email,
        metadata: {
          userId: user.id,
          test: 'true',
          source: 'stripe-test-page'
        }
      };

      addLog(`Sending request to /api/create-checkout-session with body: ${JSON.stringify(requestBody)}`);

      // Make the direct API call
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      // Capture network details for debugging
      const networkInfo = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries([...response.headers.entries()]),
        duration: `${duration}ms`,
        url: response.url
      };
      
      setNetworkDetails(networkInfo);
      addLog(`Response received in ${duration}ms with status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          addLog(`Error response: ${JSON.stringify(errorData)}`);
        } catch (e) {
          addLog(`Could not parse error response as JSON: ${e}`);
          errorData = { error: `HTTP error ${response.status}` };
        }

        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      // Parse the successful response
      const data = await response.json();
      addLog(`Checkout session created successfully: ${data.id}`);
      
      if (!data.url) {
        throw new Error('Checkout session URL is missing from response');
      }

      setSessionId(data.id);
      setSessionUrl(data.url);
      addLog(`Checkout URL: ${data.url}`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Checkout failed: ${errorMessage}`);
      addLog(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle the test for monthly subscription
  const handleTestMonthly = () => {
    // Using the live price ID from the env file
    const monthlyPriceId = import.meta.env.VITE_STRIPE_PRICE_MONTHLY || 'price_1Rg4GcLh8PbWqwwD6RY18DBw';
    createCheckoutSession(monthlyPriceId);
  };

  // Handle the test for yearly subscription
  const handleTestYearly = () => {
    // Using the live price ID from the env file
    const yearlyPriceId = import.meta.env.VITE_STRIPE_PRICE_YEARLY || 'price_1Rg4dqLh8PbWqwwDQB5bW2Uc';
    createCheckoutSession(yearlyPriceId);
  };

  // Redirect to Stripe checkout
  const handleRedirectToStripe = () => {
    if (sessionUrl) {
      addLog(`Redirecting to Stripe checkout: ${sessionUrl}`);
      window.location.href = sessionUrl;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pt-32 bg-blue-900">
      <div className="max-w-4xl w-full bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-xl border border-white/20">
        <h1 className="text-3xl font-bold text-white mb-4 text-center">
          Stripe Direct Test Page
        </h1>
        
        <p className="text-blue-100 mb-8 text-center">
          This page bypasses the regular Stripe service and directly calls the API endpoint.
        </p>

        {!user && (
          <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-200 p-4 rounded-md mb-6">
            <p className="font-bold">You are not logged in!</p>
            <p>Please <Link to="/login?redirect=stripe-test" className="underline">login</Link> first to test the checkout process.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={handleTestMonthly}
            disabled={loading || !user}
            className={`w-full ${
              loading ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'
            } text-white py-3 px-4 rounded-lg font-semibold text-lg transition-all disabled:opacity-50`}
          >
            {loading ? 'Processing...' : 'Test Monthly Subscription'}
          </button>
          
          <button
            onClick={handleTestYearly}
            disabled={loading || !user}
            className={`w-full ${
              loading ? 'bg-purple-400' : 'bg-purple-500 hover:bg-purple-600'
            } text-white py-3 px-4 rounded-lg font-semibold text-lg transition-all disabled:opacity-50`}
          >
            {loading ? 'Processing...' : 'Test Yearly Subscription'}
          </button>
        </div>

        {sessionUrl && (
          <div className="bg-green-500/20 border border-green-500 text-green-200 p-4 rounded-md mb-6">
            <p className="font-bold">Checkout session created successfully!</p>
            <p className="mb-3">Session ID: {sessionId}</p>
            <button
              onClick={handleRedirectToStripe}
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-semibold transition-all"
            >
              Proceed to Stripe Checkout
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-md mb-6">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {networkDetails && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white mb-2">Network Details:</h3>
            <pre className="bg-black/30 text-green-300 p-3 rounded-md overflow-x-auto text-xs">
              {JSON.stringify(networkDetails, null, 2)}
            </pre>
          </div>
        )}

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-semibold text-white">Logs:</h3>
            <button
              onClick={clearLogs}
              className="bg-gray-500 hover:bg-gray-600 text-white py-1 px-3 rounded text-sm"
            >
              Clear Logs
            </button>
          </div>
          <div className="bg-black/50 text-green-300 p-3 rounded-md h-80 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-400">No logs yet. Click a test button to start.</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="font-mono text-xs mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="text-center mt-8">
          <Link to="/pricing" className="text-blue-300 hover:text-blue-100 underline">
            Back to Pricing Page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StripeTestPage;
