import React from 'react';
import { Link } from 'react-router-dom';
import { useChat } from '../contexts/ChatContext';
import ScalableCharacterSelection from '../components/ScalableCharacterSelection';
import ChatInterface from '../components/chat/ChatInterface';

const HomePage: React.FC = () => {
  const { character, messages, chatId } = useChat();
  const [resumed, setResumed] = React.useState<boolean>(false);
  // We now always use the scalable selector, so no toggle state required.

  /* ------------------------------------------------------------
   * Detect resumed conversations.
   * A conversation is considered "resumed" when:
   *   1. We already have a selected character
   *   2. We have at least one message in context
   *   3. A chatId exists (saved chat) OR we are in bypass mode
   * ---------------------------------------------------------- */
  React.useEffect(() => {
    if (character && messages.length > 0) {
      setResumed(true);
    } else {
      setResumed(false);
    }
  }, [character, messages]);

  return (
    <>
      {/* Global heavenly background for the entire page */}
      <div className="fixed inset-0 bg-gradient-to-b from-blue-900 via-blue-700 to-blue-500">
        {/* Subtle light rays effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-200 via-transparent to-transparent opacity-30"></div>
        
        {/* Cloud elements for spiritual vibe */}
        <div className="absolute top-1/4 left-1/4 w-64 h-24 bg-white rounded-full blur-3xl opacity-20 animate-float"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-32 bg-white rounded-full blur-3xl opacity-15 animate-float-delayed"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-28 bg-white rounded-full blur-3xl opacity-10 animate-float-slow"></div>
      </div>

      {/* Upgrade CTA ----------------------------------------------------- */}
      <button
        onClick={() => (window.location.href = 'https://faithtalkai.com/pricing')}
        className="fixed top-4 right-4 z-50 inline-flex justify-center items-center px-6 py-2 border-2 border-white text-sm font-medium rounded-full shadow-sm text-white bg-green-500 hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-300 whitespace-nowrap transition-colors animate-pulse"
      >
        Unlock All Characters – Upgrade to Premium
      </button>

      {character ? (
        /* Chat view – mt-32 (~128 px) accounts for banner + header */
        <div className="relative flex h-screen w-full mt-32">
          <main className="flex-1 overflow-hidden">
            <ChatInterface />
          </main>
        </div>
      ) : (
        /* Selector view – mt-32 matches chat view spacing */
        <div className="relative w-full mt-32">
          {/* Four Ways to Grow Section */}
          <div className="relative z-10 max-w-5xl mx-auto px-4 mb-8">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl md:text-2xl font-bold text-yellow-400 text-center mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
                Four Ways to Grow in Faith
              </h2>
              <p className="text-blue-100 text-center text-sm mb-6 max-w-2xl mx-auto">
                Chat with 90+ biblical characters, explore roundtable discussions, follow guided Bible studies, and stay consistent with daily reading plans.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Character Chat - current page */}
                <div className="text-center p-4 bg-white/10 rounded-xl border border-blue-400/30">
                  <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-yellow-400 text-sm mb-1">Character Chat</h3>
                  <p className="text-xs text-blue-200">You are here</p>
                </div>

                {/* Roundtable */}
                <Link to="/roundtable/setup" className="group text-center p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 hover:border-purple-400/30 transition-all">
                  <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-white text-sm mb-1 group-hover:text-yellow-400 transition-colors">Roundtable</h3>
                  <p className="text-xs text-blue-200">Group discussions</p>
                </Link>

                {/* Bible Studies */}
                <Link to="/studies" className="group text-center p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 hover:border-green-400/30 transition-all">
                  <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-white text-sm mb-1 group-hover:text-yellow-400 transition-colors">Bible Studies</h3>
                  <p className="text-xs text-blue-200">30+ guided studies</p>
                </Link>

                {/* Reading Plans */}
                <Link to="/reading-plans" className="group text-center p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 hover:border-amber-400/30 transition-all">
                  <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-white text-sm mb-1 group-hover:text-yellow-400 transition-colors">Reading Plans</h3>
                  <p className="text-xs text-blue-200">140+ daily plans</p>
                </Link>
              </div>
              <p className="text-center text-blue-200 text-xs mt-4">
                <Link to="/getting-started" className="text-yellow-400 hover:underline">See How It Works</Link>
                {' '}&bull;{' '}Invite friends to your conversations &bull; Save and share chats
              </p>
            </div>
          </div>
          <ScalableCharacterSelection />
        </div>
      )}

      {/* Debug notice for resumed chats */}
      {resumed && (
        <div className="fixed bottom-2 left-2 z-50 rounded-md bg-blue-100 px-3 py-1 text-xs text-blue-800 shadow">
          Resumed conversation {chatId ? `(ID: ${chatId})` : '(local)'}
        </div>
      )}
    </>
  );
};

export default HomePage;
