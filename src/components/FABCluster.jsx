import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import { usePremium } from '../hooks/usePremium';

const FABCluster = () => {
  const navigate = useNavigate();
  const { isPremium } = usePremium();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
      <button
        onClick={() => navigate('/roundtable/setup')}
        className="flex items-center gap-2 px-5 py-3 bg-yellow-400 text-blue-900 rounded-full shadow-lg hover:bg-yellow-300 transition-colors border border-yellow-500"
        aria-label="Start a Roundtable discussion"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
        </svg>
        <span className="font-medium">Start Roundtable</span>
      </button>

      {!isPremium && (
        <button
          onClick={() => window.location.href = "https://faithtalkai.com/pricing"}
          className="flex items-center gap-2 px-5 py-3 bg-white/20 backdrop-blur-sm text-white rounded-full shadow-lg hover:bg-white/30 transition-colors border border-white/30"
          aria-label="Upgrade to premium"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Upgrade</span>
        </button>
      )}
    </div>
  );
};

export default FABCluster;
