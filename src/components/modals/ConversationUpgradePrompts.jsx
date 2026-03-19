import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * Subtle banner shown on first message
 * "Conversations aren't saved on free accounts. Upgrade anytime to keep your chat history."
 */
export function FirstMessageBanner({ onDismiss, characterName }) {
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between">
      <p className="text-sm text-amber-800">
        <span className="font-medium">Free account:</span> This conversation won't be saved.{' '}
        <Link to="/pricing" className="underline font-medium hover:text-amber-900">
          Upgrade to Premium
        </Link>{' '}
        to keep your chat history.
      </p>
      <button
        onClick={onDismiss}
        className="text-amber-600 hover:text-amber-800 p-1"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

/**
 * Toast/slide-in shown after 5-10 messages
 * "Enjoying this conversation? Free accounts don't save chat history. Upgrade now to keep this conversation forever."
 */
export function MessageCountToast({ onDismiss, messageCount, characterName }) {
  return (
    <div className="fixed bottom-20 right-4 left-4 sm:left-auto sm:w-96 bg-white rounded-xl shadow-2xl border border-amber-200 p-4 z-50 animate-slide-up">
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-900">Enjoying this conversation?</p>
          <p className="text-sm text-gray-600 mt-1">
            You've exchanged {messageCount} messages{characterName ? ` with ${characterName}` : ''}. 
            Free accounts don't save chat history.
          </p>
          <div className="mt-3 flex gap-2">
            <Link
              to="/pricing"
              className="px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
            >
              Upgrade to Save
            </Link>
            <button
              onClick={onDismiss}
              className="px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-800"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Modal shown when user tries to leave with 5+ messages
 * "Your conversation with Moses will be lost when you leave. Upgrade to Premium to save it, or continue chatting."
 */
export function LeaveConversationModal({ onStay, onLeave, onUpgrade, characterName, messageCount }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
          Don't Lose This Conversation!
        </h2>
        
        <p className="text-gray-600 text-center mb-6">
          Your conversation with <span className="font-medium">{characterName || 'this character'}</span> ({messageCount} messages) 
          will be lost when you leave. Free accounts don't save chat history.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={onUpgrade}
            className="w-full py-3 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors"
          >
            Upgrade to Save Conversation
          </button>
          
          <button
            onClick={onStay}
            className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
          >
            Continue Chatting
          </button>
          
          <button
            onClick={onLeave}
            className="w-full py-2 text-gray-500 text-sm hover:text-gray-700 transition-colors"
          >
            Leave Anyway
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Inline message shown when returning to start fresh
 * "Welcome back! Start a new conversation below. Want to save your conversations? Upgrade to Premium."
 */
export function WelcomeBackMessage({ characterName, hasHistory, onDismiss }) {
  if (!hasHistory) return null;
  
  return (
    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 mb-4 mx-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-medium text-amber-900">Welcome back!</p>
          <p className="text-sm text-amber-800 mt-1">
            You have saved conversations{characterName ? ` with ${characterName}` : ''} waiting for you.{' '}
            <Link to="/pricing" className="underline font-medium hover:text-amber-900">
              Upgrade to Premium
            </Link>{' '}
            to access your chat history.
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-amber-600 hover:text-amber-800 p-1"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * My Walk premium gate - full page overlay
 */
export function MyWalkPremiumGate() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Unlock My Walk
        </h1>
        
        <p className="text-gray-600 mb-8 text-lg">
          My Walk is a Premium feature that lets you track your spiritual journey, 
          access all your conversation history, and see your Bible study progress in one place.
        </p>
        
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8 text-left">
          <h3 className="font-semibold text-gray-900 mb-4">Premium includes:</h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-3">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">Full conversation history with all characters</span>
            </li>
            <li className="flex items-center gap-3">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">Bible study & reading plan progress dashboard</span>
            </li>
            <li className="flex items-center gap-3">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">Resume any conversation anytime</span>
            </li>
            <li className="flex items-center gap-3">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">Roundtable group discussions</span>
            </li>
            <li className="flex items-center gap-3">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">Access to all premium characters</span>
            </li>
          </ul>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/pricing"
            className="px-8 py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors shadow-lg"
          >
            View Premium Plans
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Conversation history item with lock overlay for free users
 */
export function LockedConversationItem({ conversation, characterName, avatarUrl, lastMessage, date }) {
  return (
    <div className="relative bg-white rounded-xl border border-gray-200 p-4 opacity-75">
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(characterName)}&background=random`}
            alt={characterName}
            className="w-12 h-12 rounded-full object-cover grayscale"
          />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900">{characterName}</p>
          <p className="text-sm text-gray-500 truncate">{lastMessage || 'Conversation saved'}</p>
        </div>
        <div className="text-xs text-gray-400">{date}</div>
      </div>
      
      {/* Lock overlay */}
      <div className="absolute inset-0 bg-white/60 rounded-xl flex items-center justify-center">
        <Link
          to="/pricing"
          className="px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors shadow"
        >
          Upgrade to View
        </Link>
      </div>
    </div>
  );
}

// Add CSS for animations
const styles = `
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
