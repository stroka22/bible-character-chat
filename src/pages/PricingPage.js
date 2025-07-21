import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../contexts/AuthContext';
import { getPublicKey, createCheckoutSession, SUBSCRIPTION_PRICES, testStripeConfiguration, } from '../services/stripe';
const stripePromise = loadStripe(getPublicKey());
console.log('Initializing Stripe with public key:', getPublicKey() ? '[VALID KEY]' : '[MISSING KEY]');
stripePromise.then(stripe => {
    console.log('Stripe loaded successfully:', !!stripe);
}).catch(err => {
    console.error('Failed to load Stripe:', err);
});
const PricingPage = () => {
    const { user } = useAuth();
    const [billingPeriod, setBillingPeriod] = useState('monthly');
    const location = useLocation();
    const navigate = useNavigate();
    const checkoutTriggered = useRef(false);
    const [errMsg, setErrMsg] = useState(null);
    const [isCheckoutInProgress, setIsCheckoutInProgress] = useState(false);
    const [stripeLoaded, setStripeLoaded] = useState(null);
    const [testingConfig, setTestingConfig] = useState(false);
    const [configResult, setConfigResult] = useState(null);
    const selectedPriceId = billingPeriod === 'monthly' ? SUBSCRIPTION_PRICES.MONTHLY : SUBSCRIPTION_PRICES.YEARLY;
    const displayPrice = billingPeriod === 'monthly' ? '$9.97' : '$97.97';
    const displayPeriod = billingPeriod === 'monthly' ? '/month' : '/year';
    useEffect(() => {
        const checkStripeLoaded = async () => {
            try {
                const stripe = await stripePromise;
                setStripeLoaded(!!stripe);
                console.log('Stripe loaded status:', !!stripe);
            }
            catch (error) {
                console.error('Error checking Stripe loaded status:', error);
                setStripeLoaded(false);
            }
        };
        checkStripeLoaded();
    }, []);
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const wantsCheckout = params.get('checkout') === 'true';
        if (wantsCheckout && !user && !checkoutTriggered.current) {
            console.log('Checkout requested but user not logged in, redirecting to login');
            checkoutTriggered.current = true;
            navigate('/login?redirect=pricing&checkout=true&period=' + billingPeriod);
        }
    }, [user, location.search, billingPeriod, navigate]);
    const handleTestConfig = async () => {
        setTestingConfig(true);
        setConfigResult(null);
        try {
            const result = await testStripeConfiguration();
            setConfigResult(result);
        }
        catch (error) {
            console.error('Stripe configuration test failed:', error);
            setConfigResult({ success: false, error: error instanceof Error ? error.message : String(error) });
        }
        finally {
            setTestingConfig(false);
        }
    };
    const handleCheckout = async () => {
        console.log('Starting checkout process...');
        console.log('User:', user ? 'Logged in' : 'Not logged in');
        console.log('Selected price ID:', selectedPriceId);
        if (isCheckoutInProgress) {
            console.log('Checkout already in progress, ignoring request');
            return;
        }
        try {
            setIsCheckoutInProgress(true);
            setErrMsg(null);
            const stripe = await stripePromise;
            if (!stripe) {
                console.error('Stripe.js failed to load');
                setErrMsg('Payment system unavailable. Please try again later.');
                throw new Error('Stripe.js failed to load.');
            }
            if (!user) {
                console.log('No user found, redirecting to login');
                navigate('/login?redirect=pricing&checkout=true&period=' + billingPeriod);
                return;
            }
            console.log('Creating checkout session with:', {
                priceId: selectedPriceId,
                customerId: user.id,
                email: user.email
            });
            const session = await createCheckoutSession({
                priceId: selectedPriceId,
                successUrl: window.location.origin + '/conversations?checkout=success',
                cancelUrl: window.location.origin + '/pricing?checkout=canceled',
                customerId: user.id,
                customerEmail: user.email,
                metadata: {
                    userId: user.id,
                },
            });
            console.log('Checkout session created:', session.id);
            console.log('Redirecting to Stripe Checkout...');
            const { error } = await stripe.redirectToCheckout({ sessionId: session.id });
            if (error) {
                console.error('Stripe Checkout Error:', error);
                setErrMsg(`Stripe redirect error: ${error.message}`);
            }
        }
        catch (error) {
            console.error('Checkout initiation failed:', error);
            setErrMsg(`Failed to initiate checkout. ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        finally {
            setIsCheckoutInProgress(false);
        }
    };
    useEffect(() => {
        console.log('Processing URL parameters...');
        console.log('Current location:', location.search);
        console.log('User status:', user ? 'Logged in' : 'Not logged in');
        const params = new URLSearchParams(location.search);
        const period = params.get('period');
        const wantsCheckout = params.get('checkout') === 'true';
        console.log('URL parameters:', { period, wantsCheckout });
        if (period === 'yearly') {
            console.log('Setting billing period to yearly');
            setBillingPeriod('yearly');
        }
        if (wantsCheckout && !checkoutTriggered.current && user && stripeLoaded) {
            console.log('Auto-initiating checkout from URL parameters');
            checkoutTriggered.current = true;
            handleCheckout();
        }
    }, [location.search, user, stripeLoaded, billingPeriod]);
    useEffect(() => {
        return () => {
            checkoutTriggered.current = false;
        };
    }, [location.pathname]);
    const freeFeatures = [
        'Limited character selection (major characters)',
        '5 messages per conversation',
        'Basic denominations only',
        'English language support',
        'No conversation saving',
    ];
    const premiumFeatures = [
        'Full character library (50+ characters)',
        'Unlimited conversation length',
        'All denominations and theological perspectives',
        'Multi-language support',
        'Save and export conversations',
        'Voice input/output',
        'Ad-free experience',
    ];
    return (_jsx(_Fragment, { children: _jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pt-32 bg-blue-900", children: [_jsxs("div", { className: "absolute inset-0 overflow-hidden pointer-events-none", children: [_jsx("div", { className: "absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-200 via-transparent to-transparent opacity-30 animate-ray-pulse" }), _jsx("div", { className: "absolute top-1/4 left-1/4 w-64 h-24 bg-white rounded-full blur-3xl opacity-20 animate-float" }), _jsx("div", { className: "absolute top-1/3 right-1/4 w-80 h-32 bg-white rounded-full blur-3xl opacity-15 animate-float-delayed" }), _jsx("div", { className: "absolute bottom-1/4 left-1/3 w-72 h-28 bg-white rounded-full blur-3xl opacity-10 animate-float-slow" })] }), _jsxs("div", { className: "relative z-10 max-w-4xl mx-auto text-center", children: [_jsx("h1", { className: "text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-lg mb-4", style: { fontFamily: 'Cinzel, serif' }, children: "Choose Your Path" }), _jsx("p", { className: "text-blue-100 text-lg md:text-xl mb-12 max-w-2xl mx-auto", children: "Unlock deeper insights and unlimited conversations with our Premium plan." }), _jsx("div", { className: "mb-8 flex justify-center", children: _jsxs("div", { className: "inline-flex rounded-full bg-blue-800 p-1 shadow-lg", children: [_jsx("button", { onClick: () => setBillingPeriod('monthly'), className: `px-4 md:px-6 py-2 rounded-full text-sm font-semibold transition-all ${billingPeriod === 'monthly'
                                            ? 'bg-yellow-400 text-blue-900 shadow-md'
                                            : 'text-white hover:bg-blue-700'}`, children: "Monthly" }), _jsx("button", { onClick: () => setBillingPeriod('yearly'), className: `px-4 md:px-6 py-2 rounded-full text-sm font-semibold transition-all ${billingPeriod === 'yearly'
                                            ? 'bg-yellow-400 text-blue-900 shadow-md'
                                            : 'text-white hover:bg-blue-700'}`, children: "Yearly (Save 17%)" })] }) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [_jsxs("div", { className: "bg-blue-800/90 rounded-xl p-6 md:p-8 shadow-xl border border-blue-700 flex flex-col", children: [_jsx("h2", { className: "text-2xl md:text-3xl font-bold text-yellow-300 mb-4", style: { fontFamily: 'Cinzel, serif' }, children: "Free" }), _jsx("p", { className: "text-white text-lg mb-6", children: "Start your spiritual journey" }), _jsxs("div", { className: "text-white text-4xl md:text-5xl font-extrabold mb-6", children: ["$0", _jsx("span", { className: "text-xl font-medium", children: "/month" })] }), _jsx("ul", { className: "text-white text-left space-y-3 flex-grow mb-8", children: freeFeatures.map((feature, index) => (_jsxs("li", { className: "flex items-start", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 text-green-400 mr-2 mt-0.5 flex-shrink-0", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }), feature] }, index))) }), errMsg && (_jsx("div", { className: "mb-4 rounded bg-red-100 text-red-700 p-3 text-sm", children: errMsg })), _jsx("button", { onClick: () => alert('You are already on the Free plan!'), className: "w-full bg-blue-700 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-600 transition-all", children: "Current Plan" })] }), _jsxs("div", { className: "bg-blue-700/90 rounded-xl p-6 md:p-8 shadow-2xl border-2 border-yellow-400 flex flex-col relative transform md:scale-105", children: [_jsx("div", { className: "absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-blue-900 px-4 py-1 rounded-full text-sm font-bold shadow-md", children: "Most Popular" }), _jsx("h2", { className: "text-2xl md:text-3xl font-bold text-yellow-300 mb-4 mt-4", style: { fontFamily: 'Cinzel, serif' }, children: "Premium" }), _jsx("p", { className: "text-white text-lg mb-6", children: "Unlock the full spiritual experience" }), _jsxs("div", { className: "text-white text-4xl md:text-5xl font-extrabold mb-6", children: [displayPrice, _jsx("span", { className: "text-xl font-medium", children: displayPeriod })] }), _jsx("ul", { className: "text-white text-left space-y-3 flex-grow mb-8", children: premiumFeatures.map((feature, index) => (_jsxs("li", { className: "flex items-start", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 text-yellow-400 mr-2 mt-0.5 flex-shrink-0", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }), feature] }, index))) }), _jsx("button", { onClick: handleCheckout, disabled: isCheckoutInProgress, className: `w-full ${isCheckoutInProgress ? 'bg-yellow-400 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-400'} text-blue-900 py-3 rounded-lg font-bold text-lg transition-all shadow-lg`, children: isCheckoutInProgress ? 'Processing...' : 'Upgrade to Premium' }), process.env.NODE_ENV === 'development' && (_jsx("button", { onClick: () => {
                                                checkoutTriggered.current = false;
                                                handleCheckout();
                                            }, className: "mt-4 w-full bg-purple-600 text-white py-2 rounded-lg font-medium text-sm hover:bg-purple-500 transition-all", children: "Test Checkout (Dev Only)" })), process.env.NODE_ENV === 'development' && (_jsxs("div", { className: "mt-6 w-full text-left", children: [_jsx("button", { onClick: handleTestConfig, disabled: testingConfig, className: `w-full ${testingConfig ? 'bg-blue-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'} text-white py-2 rounded-lg font-medium text-sm transition-all`, children: testingConfig ? 'Testing Configuration...' : 'Test Stripe Configuration' }), configResult && (_jsx("pre", { className: "mt-3 text-xs bg-blue-900/80 text-white p-2 rounded overflow-x-auto", children: JSON.stringify(configResult, null, 2) }))] }))] })] }), _jsx("p", { className: "mt-12 text-white text-sm", children: "All plans include access to the core chat engine and basic character interactions." }), _jsx("p", { className: "mt-2 text-white text-sm", children: _jsx(Link, { to: "/", className: "text-yellow-300 hover:text-yellow-200 underline", children: "Return to Chat" }) })] })] }) }));
};
export default PricingPage;
