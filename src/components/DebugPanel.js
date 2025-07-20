import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { getPublicKey, createCheckoutSession, SUBSCRIPTION_PRICES } from '../services/stripe';
const PANEL_STYLE = 'fixed bottom-0 right-0 w-96 max-h-[80vh] bg-gray-900 text-white p-4 overflow-auto z-50 rounded-tl-lg shadow-xl border-l border-t border-gray-700';
const SECTION_STYLE = 'mb-4 pb-4 border-b border-gray-700';
const HEADING_STYLE = 'text-sm font-bold text-gray-400 uppercase tracking-wider mb-2';
const INFO_ITEM_STYLE = 'flex justify-between items-center mb-1';
const BUTTON_STYLE = 'px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors';
const ERROR_STYLE = 'mt-2 p-2 bg-red-900/50 text-red-300 text-xs rounded';
const SUCCESS_STYLE = 'mt-2 p-2 bg-green-900/50 text-green-300 text-xs rounded';
const LOG_STYLE = 'mt-4 p-2 bg-gray-800 text-xs font-mono rounded h-40 overflow-auto';
const DebugPanel = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);
    const [stripeLoaded, setStripeLoaded] = useState(null);
    const [stripeInstance, setStripeInstance] = useState(null);
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const addLog = (message) => {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        setLogs(prev => [`[${timestamp}] ${message}`, ...prev]);
    };
    const clearLogs = () => setLogs([]);
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
            }
            catch (err) {
                setStripeLoaded(false);
                addLog(`❌ Error loading Stripe: ${err instanceof Error ? err.message : String(err)}`);
            }
        };
        checkStripe();
    }, []);
    const testDirectCheckout = async (period) => {
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
            setSuccess(`Redirecting to Stripe checkout (${period} plan)...`);
            const { error } = await stripeInstance.redirectToCheckout({ sessionId: session.id });
            if (error) {
                throw new Error(`Stripe redirect error: ${error.message}`);
            }
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            addLog(`❌ Error: ${errorMessage}`);
            setError(`Checkout failed: ${errorMessage}`);
            console.error('Debug checkout error:', err);
        }
        finally {
            setIsLoading(false);
        }
    };
    const testUrlParamCheckout = (period) => {
        addLog(`Testing URL parameter checkout (${period})...`);
        navigate(`/pricing?checkout=true&period=${period}`);
    };
    const toggleVisibility = () => setIsVisible(!isVisible);
    return (_jsxs(_Fragment, { children: [_jsx("button", { onClick: toggleVisibility, className: "fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full shadow-lg z-50 hover:bg-gray-700", title: "Toggle Debug Panel", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z", clipRule: "evenodd" }) }) }), isVisible && (_jsxs("div", { className: PANEL_STYLE, children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h2", { className: "text-lg font-bold", children: "Checkout Debug Panel" }), _jsx("button", { onClick: toggleVisibility, className: "text-gray-400 hover:text-white", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z", clipRule: "evenodd" }) }) })] }), _jsxs("div", { className: SECTION_STYLE, children: [_jsx("h3", { className: HEADING_STYLE, children: "Authentication Status" }), _jsxs("div", { className: INFO_ITEM_STYLE, children: [_jsx("span", { children: "User Logged In:" }), _jsx("span", { className: user ? 'text-green-400' : 'text-red-400', children: user ? 'Yes' : 'No' })] }), user && (_jsxs(_Fragment, { children: [_jsxs("div", { className: INFO_ITEM_STYLE, children: [_jsx("span", { children: "User ID:" }), _jsx("span", { className: "text-xs", children: user.id })] }), _jsxs("div", { className: INFO_ITEM_STYLE, children: [_jsx("span", { children: "Email:" }), _jsx("span", { className: "text-xs", children: user.email })] })] }))] }), _jsxs("div", { className: SECTION_STYLE, children: [_jsx("h3", { className: HEADING_STYLE, children: "Stripe Status" }), _jsxs("div", { className: INFO_ITEM_STYLE, children: [_jsx("span", { children: "Stripe Loaded:" }), _jsx("span", { className: stripeLoaded === null
                                            ? 'text-yellow-400'
                                            : stripeLoaded
                                                ? 'text-green-400'
                                                : 'text-red-400', children: stripeLoaded === null ? 'Checking...' : stripeLoaded ? 'Yes' : 'No' })] }), _jsxs("div", { className: INFO_ITEM_STYLE, children: [_jsx("span", { children: "Public Key Available:" }), _jsx("span", { className: getPublicKey() ? 'text-green-400' : 'text-red-400', children: getPublicKey() ? 'Yes' : 'No' })] }), _jsxs("div", { className: INFO_ITEM_STYLE, children: [_jsx("span", { children: "Monthly Price ID:" }), _jsx("span", { className: "text-xs", children: SUBSCRIPTION_PRICES.MONTHLY })] }), _jsxs("div", { className: INFO_ITEM_STYLE, children: [_jsx("span", { children: "Yearly Price ID:" }), _jsx("span", { className: "text-xs", children: SUBSCRIPTION_PRICES.YEARLY })] })] }), _jsxs("div", { className: SECTION_STYLE, children: [_jsx("h3", { className: HEADING_STYLE, children: "Current Location" }), _jsxs("div", { className: INFO_ITEM_STYLE, children: [_jsx("span", { children: "Path:" }), _jsx("span", { className: "text-xs", children: location.pathname })] }), _jsxs("div", { className: INFO_ITEM_STYLE, children: [_jsx("span", { children: "Search:" }), _jsx("span", { className: "text-xs", children: location.search || '(none)' })] })] }), _jsxs("div", { className: SECTION_STYLE, children: [_jsx("h3", { className: HEADING_STYLE, children: "Test Actions" }), _jsxs("div", { className: "grid grid-cols-2 gap-2 mb-2", children: [_jsx("button", { onClick: () => testDirectCheckout('monthly'), disabled: isLoading || !user || !stripeLoaded, className: `${BUTTON_STYLE} ${(isLoading || !user || !stripeLoaded) ? 'opacity-50 cursor-not-allowed' : ''}`, children: "Test Monthly Checkout" }), _jsx("button", { onClick: () => testDirectCheckout('yearly'), disabled: isLoading || !user || !stripeLoaded, className: `${BUTTON_STYLE} ${(isLoading || !user || !stripeLoaded) ? 'opacity-50 cursor-not-allowed' : ''}`, children: "Test Yearly Checkout" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsx("button", { onClick: () => testUrlParamCheckout('monthly'), className: BUTTON_STYLE, children: "Test URL Param (Monthly)" }), _jsx("button", { onClick: () => testUrlParamCheckout('yearly'), className: BUTTON_STYLE, children: "Test URL Param (Yearly)" })] }), error && _jsx("div", { className: ERROR_STYLE, children: error }), success && _jsx("div", { className: SUCCESS_STYLE, children: success })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h3", { className: HEADING_STYLE, children: "Debug Logs" }), _jsx("button", { onClick: clearLogs, className: "text-xs text-gray-400 hover:text-white", children: "Clear" })] }), _jsx("div", { className: LOG_STYLE, children: logs.length === 0 ? (_jsx("div", { className: "text-gray-500 italic", children: "No logs yet" })) : (logs.map((log, index) => (_jsx("div", { className: "mb-1", children: log }, index)))) })] })] }))] }));
};
export default DebugPanel;
