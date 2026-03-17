import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { redeemChatInvite, getChatInvitePreview } from '../services/chatInvitesService';
import PreviewLayout from '../components/PreviewLayout';
import { ScrollBackground } from '../components/ScrollWrap';
import FooterScroll from '../components/FooterScroll';

const JoinChatPreview = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(false);

  // Fetch preview data
  useEffect(() => {
    if (!code) {
      setError('Missing invite code');
      setLoading(false);
      return;
    }

    const fetchPreview = async () => {
      const { data, error } = await getChatInvitePreview(code);
      if (error) {
        setError(error.message);
      } else {
        setPreview(data);
      }
      setLoading(false);
    };

    fetchPreview();
  }, [code]);

  // Handle join action
  const handleJoin = async () => {
    if (!user) {
      // Store code and redirect to signup
      try { sessionStorage.setItem('pendingChatJoinCode', code); } catch {}
      navigate(`/login?joinCode=${code}&redirect=/join/${code}`, { replace: true });
      return;
    }

    setJoining(true);
    const { data, error } = await redeemChatInvite(code);
    if (error || !data || data.success === false) {
      setError(error?.message || data?.error || 'Failed to join conversation');
      setJoining(false);
      return;
    }
    
    const chatId = data.chat_id;
    if (!chatId) {
      setError('Join succeeded but chat not found');
      setJoining(false);
      return;
    }
    
    navigate(`/chat/${chatId}`, { replace: true });
  };

  // Get inviter display name
  const getInviterName = () => {
    if (!preview?.inviter) return 'Someone';
    return preview.inviter.display_name || preview.inviter.first_name || 'Someone';
  };

  // Loading state
  if (loading || authLoading) {
    return (
      <PreviewLayout>
        <ScrollBackground className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600" />
            <p className="mt-4 text-amber-700">Loading invitation...</p>
          </div>
        </ScrollBackground>
      </PreviewLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <PreviewLayout>
        <ScrollBackground className="min-h-screen py-12 px-4">
          <div className="max-w-md mx-auto">
            <div className="bg-white/90 border border-red-200 rounded-2xl p-8 text-center shadow-xl">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Invitation Problem</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Link
                to="/"
                className="inline-block px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
              >
                Go to Home
              </Link>
            </div>
          </div>
        </ScrollBackground>
        <FooterScroll />
      </PreviewLayout>
    );
  }

  // Preview state
  return (
    <PreviewLayout>
      <ScrollBackground className="min-h-screen py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white/95 rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-8 text-center">
              <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
                You're Invited!
              </h1>
              <p className="text-amber-100">
                {getInviterName()} invited you to join a conversation
              </p>
            </div>

            {/* Character Preview */}
            {preview?.character && (
              <div className="px-6 py-6 border-b border-amber-100">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-amber-200 shadow-lg flex-shrink-0">
                    <img
                      src={preview.character.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(preview.character.name)}&background=F59E0B&color=fff`}
                      alt={preview.character.name}
                      className="w-full h-full object-cover"
                      style={{ objectPosition: 'center 8%' }}
                    />
                  </div>
                  <div>
                    <p className="text-amber-600 text-sm font-medium">Conversation with</p>
                    <h2 className="text-2xl font-bold text-amber-900" style={{ fontFamily: 'Cinzel, serif' }}>
                      {preview.character.name}
                    </h2>
                    {preview.character.short_biography && (
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                        {preview.character.short_biography}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Chat Title */}
            {preview?.chatTitle && (
              <div className="px-6 py-4 bg-amber-50">
                <p className="text-amber-800 text-sm">
                  <span className="font-medium">Topic:</span> {preview.chatTitle}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="px-6 py-6 space-y-3">
              <button
                onClick={handleJoin}
                disabled={joining}
                className="w-full py-4 bg-amber-600 text-white rounded-xl font-bold text-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {joining ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Joining...
                  </>
                ) : user ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Join Conversation
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Sign Up to Join
                  </>
                )}
              </button>

              {!user && (
                <p className="text-center text-gray-500 text-sm">
                  Already have an account?{' '}
                  <Link 
                    to={`/login?joinCode=${code}&redirect=/join/${code}`} 
                    className="text-amber-600 font-medium hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              )}
            </div>

            {/* Footer note */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <p className="text-gray-500 text-xs text-center">
                By joining, you'll be able to participate in this conversation and chat with {preview?.character?.name || 'the character'}.
              </p>
            </div>
          </div>
        </div>
      </ScrollBackground>
      <FooterScroll />
    </PreviewLayout>
  );
};

export default JoinChatPreview;
