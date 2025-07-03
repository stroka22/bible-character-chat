var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js'; // Import loadStripe
import { useAuth } from '../contexts/AuthContext';
import { getPublicKey, createCheckoutSession, SUBSCRIPTION_PRICES } from '../services/stripe'; // Import necessary Stripe functions
// Initialize Stripe outside of component render to avoid re-creating it
var stripePromise = loadStripe(getPublicKey());
var PricingPage = function () {
    var user = useAuth().user;
    var _a = useState('monthly'), billingPeriod = _a[0], setBillingPeriod = _a[1]; // State for billing period
    // Determine the price based on the selected billing period
    var selectedPriceId = billingPeriod === 'monthly' ? SUBSCRIPTION_PRICES.MONTHLY : SUBSCRIPTION_PRICES.YEARLY;
    var displayPrice = billingPeriod === 'monthly' ? '$9.97' : '$97.97';
    var displayPeriod = billingPeriod === 'monthly' ? '/month' : '/year';
    var handleCheckout = function () { return __awaiter(void 0, void 0, void 0, function () {
        var stripe, session, error, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, stripePromise];
                case 1:
                    stripe = _a.sent();
                    if (!stripe) {
                        throw new Error('Stripe.js failed to load.');
                    }
                    if (!user) {
                        alert('Please log in to subscribe.');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, createCheckoutSession({
                            priceId: selectedPriceId,
                            successUrl: window.location.origin + '/conversations?checkout=success', // Redirect to conversations on success
                            cancelUrl: window.location.origin + '/pricing?checkout=canceled', // Return to pricing on cancel
                            customerId: user.id, // Pass Supabase user ID as customer ID
                            customerEmail: user.email, // Pass user email
                            metadata: {
                                userId: user.id, // Store user ID in metadata for webhook
                            },
                        })];
                case 2:
                    session = _a.sent();
                    return [4 /*yield*/, stripe.redirectToCheckout({ sessionId: session.id })];
                case 3:
                    error = (_a.sent()).error;
                    if (error) {
                        console.error('Stripe Checkout Error:', error);
                        alert("Error: ".concat(error.message));
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error('Checkout initiation failed:', error_1);
                    alert("Failed to initiate checkout. Please try again. ".concat(error_1 instanceof Error ? error_1.message : ''));
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var freeFeatures = [
        'Limited character selection (major characters)',
        '5 messages per conversation',
        'Basic denominations only',
        'English language support',
        'No conversation saving',
    ];
    var premiumFeatures = [
        'Full character library (50+ characters)',
        'Unlimited conversation length',
        'All denominations and theological perspectives',
        'Multi-language support',
        'Save and export conversations',
        'Voice input/output',
        'Ad-free experience',
    ];
    return (_jsx(_Fragment, { children: _jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pt-32", children: [_jsxs("div", { className: "absolute inset-0 overflow-hidden pointer-events-none", children: [_jsx("div", { className: "absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-200 via-transparent to-transparent opacity-30 animate-ray-pulse" }), _jsx("div", { className: "absolute top-1/4 left-1/4 w-64 h-24 bg-white rounded-full blur-3xl opacity-20 animate-float" }), _jsx("div", { className: "absolute top-1/3 right-1/4 w-80 h-32 bg-white rounded-full blur-3xl opacity-15 animate-float-delayed" }), _jsx("div", { className: "absolute bottom-1/4 left-1/3 w-72 h-28 bg-white rounded-full blur-3xl opacity-10 animate-float-slow" })] }), _jsxs("div", { className: "relative z-10 max-w-4xl mx-auto text-center", children: [_jsx("h1", { className: "text-5xl font-extrabold text-white tracking-tight drop-shadow-lg mb-4", style: { fontFamily: 'Cinzel, serif' }, children: "Choose Your Path" }), _jsx("p", { className: "text-blue-100 text-xl mb-12 max-w-2xl mx-auto", children: "Unlock deeper insights and unlimited conversations with our Premium plan." }), _jsx("div", { className: "mb-8 flex justify-center", children: _jsxs("div", { className: "inline-flex rounded-full bg-white/20 backdrop-blur-sm p-1 shadow-lg", children: [_jsx("button", { onClick: function () { return setBillingPeriod('monthly'); }, className: "px-6 py-2 rounded-full text-sm font-semibold transition-all ".concat(billingPeriod === 'monthly'
                                            ? 'bg-yellow-400 text-blue-900 shadow-md'
                                            : 'text-white hover:bg-white/10'), children: "Monthly" }), _jsx("button", { onClick: function () { return setBillingPeriod('yearly'); }, className: "px-6 py-2 rounded-full text-sm font-semibold transition-all ".concat(billingPeriod === 'yearly'
                                            ? 'bg-yellow-400 text-blue-900 shadow-md'
                                            : 'text-white hover:bg-white/10'), children: "Yearly (Save 17%)" })] }) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [_jsxs("div", { className: "bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-xl border border-white/20 flex flex-col", children: [_jsx("h2", { className: "text-3xl font-bold text-yellow-300 mb-4", style: { fontFamily: 'Cinzel, serif' }, children: "Free" }), _jsx("p", { className: "text-white/80 text-lg mb-6", children: "Start your spiritual journey" }), _jsxs("div", { className: "text-white text-5xl font-extrabold mb-6", children: ["$0", _jsx("span", { className: "text-xl font-medium", children: "/month" })] }), _jsx("ul", { className: "text-white/90 text-left space-y-3 flex-grow mb-8", children: freeFeatures.map(function (feature, index) { return (_jsxs("li", { className: "flex items-center", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 text-green-400 mr-2", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }), feature] }, index)); }) }), _jsx("button", { onClick: function () { return alert('You are already on the Free plan!'); }, className: "w-full bg-white/20 text-white py-3 rounded-lg font-semibold text-lg hover:bg-white/30 transition-all", children: "Current Plan" })] }), _jsxs("div", { className: "bg-white/20 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-yellow-300 flex flex-col transform scale-105", children: [_jsx("div", { className: "absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-blue-900 px-4 py-1 rounded-full text-sm font-bold shadow-md", children: "Most Popular" }), _jsx("h2", { className: "text-3xl font-bold text-yellow-300 mb-4 mt-4", style: { fontFamily: 'Cinzel, serif' }, children: "Premium" }), _jsx("p", { className: "text-white/80 text-lg mb-6", children: "Unlock the full spiritual experience" }), _jsxs("div", { className: "text-white text-5xl font-extrabold mb-6", children: [displayPrice, _jsx("span", { className: "text-xl font-medium", children: displayPeriod })] }), _jsx("ul", { className: "text-white/90 text-left space-y-3 flex-grow mb-8", children: premiumFeatures.map(function (feature, index) { return (_jsxs("li", { className: "flex items-center", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 text-yellow-400 mr-2", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }), feature] }, index)); }) }), _jsx("button", { onClick: handleCheckout, className: "w-full bg-yellow-500 text-blue-900 py-3 rounded-lg font-bold text-lg hover:bg-yellow-600 transition-all shadow-lg", children: "Upgrade to Premium" })] })] }), _jsx("p", { className: "mt-12 text-blue-200 text-sm", children: "All plans include access to the core chat engine and basic character interactions." }), _jsx("p", { className: "mt-2 text-blue-200 text-sm", children: _jsx(Link, { to: "/", className: "text-yellow-300 hover:underline", children: "Return to Chat" }) })] })] }) }));
};
export default PricingPage;
