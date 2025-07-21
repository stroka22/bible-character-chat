import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
const StripeTestPage = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [logs, setLogs] = useState([]);
    const [sessionUrl, setSessionUrl] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [networkDetails, setNetworkDetails] = useState(null);
    const addLog = (message) => {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${message}`;
        console.log(logEntry);
        setLogs(prevLogs => [...prevLogs, logEntry]);
    };
    const clearLogs = () => {
        setLogs([]);
        setError(null);
        setSessionUrl(null);
        setSessionId(null);
        setNetworkDetails(null);
    };
    useEffect(() => {
        addLog(`Auth state: ${user ? 'Logged in as ' + user.email : 'Not logged in'}`);
    }, [user]);
    const createCheckoutSession = async (priceId) => {
        setLoading(true);
        setError(null);
        setSessionUrl(null);
        setSessionId(null);
        setNetworkDetails(null);
        const startTime = performance.now();
        addLog(`Starting direct checkout session creation for price: ${priceId}`);
        addLog(`User: ${user ? JSON.stringify({ id: user.id, email: user.email }) : 'Not logged in'}`);
        if (!user) {
            setError('You must be logged in to checkout');
            setLoading(false);
            addLog('Error: User not logged in');
            return;
        }
        try {
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
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });
            const endTime = performance.now();
            const duration = Math.round(endTime - startTime);
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
                }
                catch (e) {
                    addLog(`Could not parse error response as JSON: ${e}`);
                    errorData = { error: `HTTP error ${response.status}` };
                }
                throw new Error(errorData.error || `HTTP error ${response.status}`);
            }
            const data = await response.json();
            addLog(`Checkout session created successfully: ${data.id}`);
            if (!data.url) {
                throw new Error('Checkout session URL is missing from response');
            }
            setSessionId(data.id);
            setSessionUrl(data.url);
            addLog(`Checkout URL: ${data.url}`);
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            setError(`Checkout failed: ${errorMessage}`);
            addLog(`Error: ${errorMessage}`);
        }
        finally {
            setLoading(false);
        }
    };
    const handleTestMonthly = () => {
        const monthlyPriceId = import.meta.env.VITE_STRIPE_PRICE_MONTHLY || 'price_1Rg4GcLh8PbWqwwD6RY18DBw';
        createCheckoutSession(monthlyPriceId);
    };
    const handleTestYearly = () => {
        const yearlyPriceId = import.meta.env.VITE_STRIPE_PRICE_YEARLY || 'price_1Rg4dqLh8PbWqwwDQB5bW2Uc';
        createCheckoutSession(yearlyPriceId);
    };
    const handleRedirectToStripe = () => {
        if (sessionUrl) {
            addLog(`Redirecting to Stripe checkout: ${sessionUrl}`);
            window.location.href = sessionUrl;
        }
    };
    return (_jsx("div", { className: "min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pt-32 bg-blue-900", children: _jsxs("div", { className: "max-w-4xl w-full bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-xl border border-white/20", children: [_jsx("h1", { className: "text-3xl font-bold text-white mb-4 text-center", children: "Stripe Direct Test Page" }), _jsx("p", { className: "text-blue-100 mb-8 text-center", children: "This page bypasses the regular Stripe service and directly calls the API endpoint." }), !user && (_jsxs("div", { className: "bg-yellow-500/20 border border-yellow-500 text-yellow-200 p-4 rounded-md mb-6", children: [_jsx("p", { className: "font-bold", children: "You are not logged in!" }), _jsxs("p", { children: ["Please ", _jsx(Link, { to: "/login?redirect=stripe-test", className: "underline", children: "login" }), " first to test the checkout process."] })] })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-8", children: [_jsx("button", { onClick: handleTestMonthly, disabled: loading || !user, className: `w-full ${loading ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'} text-white py-3 px-4 rounded-lg font-semibold text-lg transition-all disabled:opacity-50`, children: loading ? 'Processing...' : 'Test Monthly Subscription' }), _jsx("button", { onClick: handleTestYearly, disabled: loading || !user, className: `w-full ${loading ? 'bg-purple-400' : 'bg-purple-500 hover:bg-purple-600'} text-white py-3 px-4 rounded-lg font-semibold text-lg transition-all disabled:opacity-50`, children: loading ? 'Processing...' : 'Test Yearly Subscription' })] }), sessionUrl && (_jsxs("div", { className: "bg-green-500/20 border border-green-500 text-green-200 p-4 rounded-md mb-6", children: [_jsx("p", { className: "font-bold", children: "Checkout session created successfully!" }), _jsxs("p", { className: "mb-3", children: ["Session ID: ", sessionId] }), _jsx("button", { onClick: handleRedirectToStripe, className: "bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-semibold transition-all", children: "Proceed to Stripe Checkout" })] })), error && (_jsxs("div", { className: "bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-md mb-6", children: [_jsx("p", { className: "font-bold", children: "Error:" }), _jsx("p", { children: error })] })), networkDetails && (_jsxs("div", { className: "mb-6", children: [_jsx("h3", { className: "text-xl font-semibold text-white mb-2", children: "Network Details:" }), _jsx("pre", { className: "bg-black/30 text-green-300 p-3 rounded-md overflow-x-auto text-xs", children: JSON.stringify(networkDetails, null, 2) })] })), _jsxs("div", { className: "mb-4", children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("h3", { className: "text-xl font-semibold text-white", children: "Logs:" }), _jsx("button", { onClick: clearLogs, className: "bg-gray-500 hover:bg-gray-600 text-white py-1 px-3 rounded text-sm", children: "Clear Logs" })] }), _jsx("div", { className: "bg-black/50 text-green-300 p-3 rounded-md h-80 overflow-y-auto", children: logs.length === 0 ? (_jsx("p", { className: "text-gray-400", children: "No logs yet. Click a test button to start." })) : (logs.map((log, index) => (_jsx("div", { className: "font-mono text-xs mb-1", children: log }, index)))) })] }), _jsx("div", { className: "text-center mt-8", children: _jsx(Link, { to: "/pricing", className: "text-blue-300 hover:text-blue-100 underline", children: "Back to Pricing Page" }) })] }) }));
};
export default StripeTestPage;
