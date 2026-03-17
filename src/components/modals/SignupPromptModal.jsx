import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Modal prompting users to create a free account
 * Used after lesson 1 of a Bible Study and after 5 chat messages
 */
const SignupPromptModal = ({ 
  isOpen, 
  onClose, 
  title = "Create Your Free Account",
  message = "Sign up to save your progress and continue your journey.",
  context = "general", // "study", "chat", "invite"
  characterName = null,
  studyTitle = null,
  allowDismiss = true
}) => {
  if (!isOpen) return null;

  const getContextMessage = () => {
    switch (context) {
      case "study":
        return `You've completed your first lesson${studyTitle ? ` of "${studyTitle}"` : ''}! Create a free account to save your progress and continue your study.`;
      case "chat":
        return `You're having a great conversation${characterName ? ` with ${characterName}` : ''}! Create a free account to save this chat and continue.`;
      case "invite":
        return "Create a free account to invite others to join your conversation.";
      default:
        return message;
    }
  };

  const getContextTitle = () => {
    switch (context) {
      case "study":
        return "Keep Your Progress!";
      case "chat":
        return "Save This Conversation";
      case "invite":
        return "Sign In to Invite";
      default:
        return title;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{getContextTitle()}</h2>
          <p className="text-amber-100">{getContextMessage()}</p>
        </div>

        {/* Benefits */}
        <div className="px-6 py-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Free Account Benefits</h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="text-gray-700">Save your Bible study progress</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="text-gray-700">Keep all your conversations</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="text-gray-700">Invite friends to join you</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="text-gray-700">Sync across all your devices</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 space-y-3">
          <Link
            to="/login"
            className="block w-full py-3 bg-amber-600 text-white text-center rounded-lg font-semibold hover:bg-amber-700 transition-colors"
          >
            Create Free Account
          </Link>
          <Link
            to="/login"
            className="block w-full py-3 bg-gray-100 text-gray-700 text-center rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Already have an account? Sign In
          </Link>
          {allowDismiss && (
            <button
              onClick={onClose}
              className="w-full py-2 text-gray-500 text-sm hover:text-gray-700 transition-colors"
            >
              Maybe later
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignupPromptModal;
