import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ConversationsPage = () => {
  const { user, isAuthenticated } = useAuth();

  // Simple placeholder page without complex functionality
  return (
    <div className="min-h-screen bg-blue-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-yellow-300">Your Conversations</h1>
          <Link
            to="/"
            className="px-4 py-2 bg-yellow-400 text-blue-900 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
          >
            Back to Home
          </Link>
        </div>

        {/* Simple placeholder content */}
        <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-8 text-center">
          <h3 className="text-xl font-semibold text-yellow-300 mb-4">
            Conversation Management Coming Soon
          </h3>
          <p className="text-blue-100 mb-6">
            This feature is currently under development. Soon you'll be able to view, manage, and share your saved conversations here.
          </p>
          <Link 
            to="/" 
            className="px-4 py-2 bg-yellow-400 text-blue-900 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
          >
            Browse Characters
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ConversationsPage;
