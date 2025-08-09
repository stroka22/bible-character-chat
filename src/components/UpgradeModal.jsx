import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Upgrade Modal Component
 * 
 * Displays a modal prompting the user to upgrade to premium.
 * 
 * @param {Object} props
 * @param {boolean} props.open - Whether the modal is open
 * @param {Function} props.onClose - Function to call when closing the modal
 * @param {string} [props.title="Upgrade to Premium"] - Modal title
 * @param {string} [props.message="Unlock all characters and unlimited messages with a premium subscription."] - Modal message
 */
const UpgradeModal = ({ 
  open, 
  onClose, 
  title = "Upgrade to Premium", 
  message = "Unlock all characters and unlimited messages with a premium subscription."
}) => {
  // If not open, return null
  if (!open) return null;

  // External pricing URL fallback if not using internal routing
  const pricingUrl = "/pricing";

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-modal-title"
      onClick={onClose} // Close when clicking backdrop
    >
      {/* Modal Card */}
      <div 
        className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl border border-yellow-400/30"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking card
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-400/10 rounded-full -mr-6 -mt-6 z-0" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-400/10 rounded-full -ml-6 -mb-6 z-0" />
        
        {/* Content */}
        <div className="relative z-10">
          {/* Premium badge */}
          <div className="flex justify-center mb-4">
            <span className="bg-yellow-400 text-blue-900 px-4 py-1 rounded-full text-sm font-bold shadow-md">
              Premium Feature
            </span>
          </div>
          
          {/* Title */}
          <h2 
            id="upgrade-modal-title"
            className="text-2xl font-bold text-center text-yellow-400 mb-4"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            {title}
          </h2>
          
          {/* Message */}
          <p className="text-white/90 text-center mb-6">
            {message}
          </p>
          
          {/* Benefits list */}
          <div className="bg-blue-800/50 border border-yellow-400/30 rounded-md p-4 mb-6">
            <h3 className="text-yellow-300 font-semibold mb-2">Premium Benefits:</h3>
            <ul className="text-white/80 text-sm space-y-2">
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Access to all Bible characters
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Unlimited messages in conversations
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Save and access your conversation history
              </li>
            </ul>
          </div>
          
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              to={pricingUrl}
              className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold py-3 px-6 rounded-lg shadow-md transition-colors text-center"
            >
              Upgrade Now
            </Link>
            <button
              onClick={onClose}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/30 py-3 px-6 rounded-lg transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
