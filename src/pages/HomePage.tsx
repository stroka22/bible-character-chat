import React from 'react';
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

      {character ? (
        /* Chat view – mt-32 (~128 px) accounts for banner + header */
        <div className="relative flex h-screen w-full mt-32">
          <main className="flex-1 overflow-hidden">
            <ChatInterface />
          </main>
        </div>
      ) : (
        /* Selector view – mt-32 matches chat view spacing */
        <div className="relative flex h-screen w-full justify-center items-center mt-32">
          {/* Glass-morphism wrapper so selector content floats nicely
              on top of the heavenly gradient */}
          <div className="w-full max-w-3xl p-4 rounded-xl bg-white/10 backdrop-blur-md shadow-xl">
            {/* --- Upgrade CTA ------------------------------------------------ */}
            <div className="mb-6 flex justify-center">
              <button
                onClick={() => (window.location.href = '/pricing.html')}
                className="animate-pulse rounded-full bg-yellow-400 px-6 py-3 text-lg font-extrabold tracking-wide text-blue-900 shadow-lg ring-2 ring-yellow-300 hover:bg-yellow-300 focus:outline-none focus:ring-4 focus:ring-yellow-200"
              >
                🔓 Unlock all characters &nbsp;–&nbsp; Upgrade
              </button>
            </div>

            <ScalableCharacterSelection />
          </div>
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
