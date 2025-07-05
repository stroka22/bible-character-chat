import React from 'react';
import { Link } from 'react-router-dom';

/**
 * DirectStripePage - A minimal page with direct links to Stripe checkout
 * 
 * This page completely bypasses the application's payment flow and authentication
 * by using pre-created Stripe checkout sessions. This is for testing purposes
 * to isolate whether issues are with the application or with Stripe itself.
 */
const DirectStripePage: React.FC = () => {
  // These URLs should be replaced with actual Stripe checkout session URLs
  // that you create directly in the Stripe Dashboard or via the Stripe CLI
  // Live monthly checkout session generated 2025-07-05
  const MONTHLY_CHECKOUT_URL =
    "https://checkout.stripe.com/c/pay/cs_live_a1nByl4jXMlhdIh8r1LvXrjUINn0Ca9GzOKiWt9nlSz4ILT1fDcJwhdzTQ";
  // Live yearly checkout session generated 2025-07-05
  const YEARLY_CHECKOUT_URL =
    "https://checkout.stripe.com/c/pay/cs_live_a17eOJNJgOijA9DKzGeav4NydVDJl6Iu7FqpwwDgOnCShYIeLhoP8v8Nt7";
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pt-32 bg-blue-900">
      <div className="max-w-4xl w-full bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-xl border border-white/20">
        <h1 className="text-3xl font-bold text-white mb-4 text-center">
          Direct Stripe Checkout Links
        </h1>
        
        <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-200 p-4 rounded-md mb-6">
          <p className="font-bold">Important Testing Information</p>
          <p>This page bypasses all application logic and connects directly to Stripe checkout sessions.</p>
          <p className="mt-2">To use this page:</p>
          <ol className="list-decimal list-inside mt-2 ml-4 space-y-1">
            <li>Create checkout sessions in the Stripe Dashboard</li>
            <li>Replace the placeholder URLs in the code with your actual session URLs</li>
            <li>Click the buttons below to test the direct checkout flow</li>
          </ol>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Monthly Subscription Card */}
          <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-yellow-300 mb-2">Monthly Subscription</h2>
            <p className="text-blue-100 mb-4">$9.97 per month</p>
            <ul className="text-white/90 text-sm mb-6 space-y-2">
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Full character library (50+ characters)</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Unlimited conversation length</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Save and export conversations</span>
              </li>
            </ul>
            <a
              href={MONTHLY_CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold text-center transition-all"
            >
              Subscribe Monthly (Direct Link)
            </a>
          </div>

          {/* Yearly Subscription Card */}
          <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-yellow-300 mb-2">Yearly Subscription</h2>
            <p className="text-blue-100 mb-4">$97.97 per year (Save 17%)</p>
            <ul className="text-white/90 text-sm mb-6 space-y-2">
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>All monthly features included</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Priority access to new characters</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>17% discount compared to monthly</span>
              </li>
            </ul>
            <a
              href={YEARLY_CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold text-center transition-all"
            >
              Subscribe Yearly (Direct Link)
            </a>
          </div>
        </div>

        <div className="mt-6 bg-blue-800/50 p-4 rounded-lg">
          <h3 className="text-xl font-semibold text-white mb-2">How to Create Checkout Sessions</h3>
          <ol className="list-decimal list-inside text-blue-100 space-y-2">
            <li>Log in to your <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer" className="text-yellow-300 hover:underline">Stripe Dashboard</a></li>
            <li>Go to Products &gt; Prices and find your price IDs</li>
            <li>Use the Stripe CLI to create a checkout session:
              <pre className="bg-black/30 text-green-300 p-2 rounded mt-1 overflow-x-auto text-xs">
                stripe checkout_sessions create \<br />
                --success_url="https://your-site.com/success" \<br />
                --cancel_url="https://your-site.com/cancel" \<br />
                --line_items[][price]=price_1234 \<br />
                --line_items[][quantity]=1 \<br />
                --mode=subscription
              </pre>
            </li>
            <li>Copy the checkout URL from the response and update this page</li>
          </ol>
        </div>

        <div className="text-center mt-8">
          <Link to="/" className="text-blue-300 hover:text-blue-100 underline">
            Back to Home Page
          </Link>
          <span className="mx-4 text-blue-500">|</span>
          <Link to="/pricing" className="text-blue-300 hover:text-blue-100 underline">
            Back to Pricing Page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DirectStripePage;
