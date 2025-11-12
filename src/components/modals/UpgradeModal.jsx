import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
// `Link` removed – plain anchor used for external domain

/**
 * UpgradeModal Component
 * 
 * Displays a modal prompting the user to upgrade to premium when they:
 * - Try to access a premium-only character
 * - Reach their message limit in a conversation
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {function} props.onClose - Function to call when closing the modal
 * @param {string} props.limitType - Type of limit reached ('character' or 'message')
 * @param {string} props.characterName - Name of the character (for character limits)
 * @param {number} props.messageCount - Current message count (for message limits)
 * @param {number} props.messageLimit - Maximum messages for free users
 */
const UpgradeModal = ({ 
  isOpen, 
  onClose, 
  limitType = 'character', 
  characterName = '', 
  messageCount = 0,
  messageLimit = 5
}) => {
  // Handle escape key to close modal
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    
    // Prevent scrolling when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      window.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);
  
  // Don't render anything if modal is closed
  if (!isOpen) return null;
  
  // Get title and description based on limit type
  const getContent = () => {
    switch (limitType) {
      case 'character':
        return {
          title: 'Upgrade to Access Premium Characters',
          description: characterName 
            ? `${characterName} is only available with a premium subscription.` 
            : 'This character is only available with a premium subscription.'
        };
      case 'message':
        return {
          title: 'Message Limit Reached',
          description: `You've sent ${messageCount} messages in this conversation (free limit: ${messageLimit}). Upgrade to continue.`
        };
      default:
        return {
          title: 'Upgrade to Premium',
          description: 'Unlock all premium features with a subscription.'
        };
    }
  };
  
  const { title, description } = getContent();
  
  // Create portal to render modal at the root level
  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-900/80 backdrop-blur-sm transition-all duration-300"
      onClick={onClose}
    >
      {/* Modal Content */}
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all duration-300 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white focus:outline-none transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="px-6 py-5">
          <p className="text-gray-700 mb-4">{description}</p>
          {limitType === 'message' && (
            <div className="mb-5">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Free messages</span>
                <span>
                  {Math.min(messageCount, messageLimit)} / {messageLimit}
                </span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-yellow-400"
                  style={{ width: `${Math.min(100, Math.round((messageCount / Math.max(1, messageLimit)) * 100))}%` }}
                />
              </div>
            </div>
          )}
          
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-5">
            <h3 className="text-blue-900 font-semibold mb-3">Premium Benefits:</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <svg className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">Unlimited messages in all conversations</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">Access to all biblical characters</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">No advertisements</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">Priority support</span>
              </li>
            </ul>
          </div>

          {/* Kingdom impact message */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-amber-600 mr-2 mt-0.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.22 2.53C11.09 5.01 12.76 4 14.5 4 17 4 19 6 19 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <p className="text-amber-900 text-sm">
                Your subscription helps advance God’s Kingdom by supporting the ongoing development and outreach of FaithTalk AI.
              </p>
            </div>
          </div>
          
          <div className="text-sm text-gray-500 mb-4">
            Starting at just $9.97/month or save with our annual plan.
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex flex-col sm:flex-row-reverse gap-3">
          <a
            href="https://faithtalkai.com/pricing"
            className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-blue-900 bg-yellow-400 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
          >
            Upgrade Now
          </a>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default UpgradeModal;
