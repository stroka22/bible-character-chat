import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { redeemChatInvite } from '../services/chatInvitesService';

const JoinChat = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState({ state: 'init', message: '' });

  useEffect(() => {
    if (!code) {
      setStatus({ state: 'error', message: 'Missing join code' });
      return;
    }

    const acceptIfLoggedIn = async () => {
      if (!user) {
        try { sessionStorage.setItem('pendingChatJoinCode', code); } catch {}
        navigate('/signup', { replace: true });
        return;
      }

      setStatus({ state: 'working', message: 'Joining chat…' });
      const { data, error } = await redeemChatInvite(code);
      if (error || !data || data.success === false) {
        setStatus({ state: 'error', message: error?.message || data?.error || 'Invalid or expired code' });
        return;
      }
      const chatId = data.chat_id;
      if (!chatId) {
        setStatus({ state: 'error', message: 'Join succeeded but chat not found' });
        return;
      }
      setStatus({ state: 'success', message: 'Success! Redirecting to chat…' });
      setTimeout(() => navigate(`/chat/${chatId}`, { replace: true }), 800);
    };

    acceptIfLoggedIn();
  }, [code, user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-700 to-blue-600 text-white">
      <div className="container mx-auto px-4 py-12 max-w-xl">
        <h1 className="text-2xl font-bold mb-4">Join Chat</h1>
        {status.state === 'init' && (<p>Preparing…</p>)}
        {status.state === 'working' && (<p>Joining chat…</p>)}
        {status.state === 'success' && (<div className="p-4 rounded bg-green-700">{status.message}</div>)}
        {status.state === 'error' && (
          <div className="p-4 rounded bg-red-700">
            <p className="mb-3">{status.message}</p>
            {!user && (
              <div className="space-x-3">
                <Link to="/signup" className="text-yellow-300 underline">Create an account</Link>
                <Link to="/login" className="text-yellow-300 underline">Log in</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinChat;
