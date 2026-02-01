import React, { useState, useEffect, useRef } from 'react';
import { scrollToBottom } from '../utils/safeScroll';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRoundtable } from '../contexts/RoundtableContext';
import { useConversation } from '../contexts/ConversationContext.jsx';
import FooterScroll from '../components/FooterScroll';
import PreviewLayout from '../components/PreviewLayout';
import { ScrollWrap, ScrollBackground } from '../components/ScrollWrap';

const RoundtableChatScroll = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    participants,
    topic,
    messages,
    isTyping,
    conversationId,
    sendUserMessage,
    advanceRound,
    error,
    clearError,
    consumeAutoStartFlag,
    hydrateFromConversation
  } = useRoundtable();
  const { shareConversation, fetchConversationWithMessages, getSharedConversation, updateConversation } = useConversation();
  
  const [inputValue, setInputValue] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const messagesEndRef = useRef(null);
  const autoKickedRef = useRef(false);
  const [isSharedView, setIsSharedView] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get('shared') === '1';
    } catch { return false; }
  });
  const [nameMap, setNameMap] = useState({});
  
  useEffect(() => {
    if (messagesEndRef.current) {
      scrollToBottom(messagesEndRef.current);
    }
  }, [messages]);

  // Hydrate from URL params
  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const convId = params.get('conv');
        const participantsParam = params.get('participants') || params.get('rt');
        
        if (convId && Array.isArray(messages) && messages.length > 0 && !code) return;
        if (convId && !isAuthenticated) {
          const ret = encodeURIComponent(window.location.pathname + window.location.search);
          return navigate(`/login?return=${ret}`, { replace: false });
        }
        
        let conv = null;
        if (code && typeof getSharedConversation === 'function') {
          conv = await getSharedConversation(code);
        } else if (convId && typeof fetchConversationWithMessages === 'function') {
          conv = await fetchConversationWithMessages(convId);
        }
        if (!conv) return;
        
        let convWithParticipants = conv;
        
        // LocalStorage backfill
        try {
          if ((!conv.participants || conv.participants.length === 0) && conv.id) {
            const raw = localStorage.getItem(`rt_participants_${conv.id}`);
            if (raw) {
              const ids = JSON.parse(raw);
              if (Array.isArray(ids) && ids.length > 0) {
                convWithParticipants = { ...convWithParticipants, participants: ids };
              }
            }
          }
        } catch {}
        
        // URL participants backfill
        if (participantsParam && (!conv.participants || conv.participants.length === 0)) {
          const names = participantsParam.split(',').map(s => s.trim()).filter(Boolean);
          if (names.length) {
            try {
              const { characterRepository } = await import('../repositories/characterRepository');
              const ids = [];
              for (const nm of names) {
                try {
                  const exact = await characterRepository.getByName?.(nm);
                  if (exact) { ids.push(exact.id); continue; }
                  const results = await characterRepository.search?.(nm);
                  if (Array.isArray(results) && results.length > 0) {
                    ids.push(results[0].id);
                  }
                } catch {}
              }
              if (ids.length) convWithParticipants = { ...conv, participants: ids };
            } catch {}
          }
        }
        
        // Derive from message metadata
        if ((!convWithParticipants.participants || convWithParticipants.participants.length === 0) && Array.isArray(convWithParticipants.messages)) {
          const ids = Array.from(new Set(
            convWithParticipants.messages
              .map(m => m?.metadata?.speakerCharacterId ?? m?.metadata?.speaker_id ?? m?.metadata?.speakerId)
              .filter(Boolean)
          ));
          if (ids.length) convWithParticipants = { ...convWithParticipants, participants: ids };
        }
        
        if (typeof hydrateFromConversation === 'function') {
          await hydrateFromConversation(convWithParticipants);
        }
        if (convWithParticipants.is_favorite) setIsSaved(true);
      } catch {}
    })();
  }, []);

  // Auto-start first round
  useEffect(() => {
    if (participants && participants.length > 0) {
      const shouldStart = typeof consumeAutoStartFlag === 'function' ? consumeAutoStartFlag() : false;
      if (shouldStart) {
        autoKickedRef.current = true;
        advanceRound();
      }
    }
  }, [participants]);

  // Fallback auto-start
  useEffect(() => {
    if (isSharedView || autoKickedRef.current || !conversationId) return;
    const hasAssistant = Array.isArray(messages) && messages.some(m => m.role === 'assistant');
    if (!hasAssistant && Array.isArray(participants) && participants.length > 0) {
      autoKickedRef.current = true;
      advanceRound();
    }
  }, [conversationId, participants?.length, messages?.length, isSharedView]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    await sendUserMessage(inputValue);
    setInputValue('');
  };
  
  const normalizeContent = (raw, speakerName) => {
    if (raw == null) return raw;
    let txt = String(raw).trim();
    const fence = txt.match(/```(?:json|javascript)?\n([\s\S]*?)```/i);
    if (fence && fence[1]) txt = fence[1].trim();
    try {
      if (txt.startsWith('{') || txt.startsWith('[')) {
        const parsed = JSON.parse(txt);
        if (parsed?.content) return parsed.content;
      }
    } catch {}
    // Strip speaker name prefix
    try {
      const names = [...(participants || []).map(p => p.name), ...(window.__rt_backfill || []).map(p => p.name)].filter(Boolean);
      if (speakerName) names.push(speakerName);
      for (const n of names) {
        const rx = new RegExp(`^\\n?\\s*${n}\\s*[:\\-–—]\\s+`, 'i');
        if (rx.test(txt)) { txt = txt.replace(rx, ''); break; }
      }
    } catch {}
    return txt;
  };

  const normalizeId = (v) => v == null ? null : String(v);
  const getCharacterById = (id) => {
    const nid = normalizeId(id);
    const found = participants.find(p => normalizeId(p.id) === nid);
    if (found) return found;
    try {
      return (window.__rt_backfill || []).find(p => normalizeId(p.id) === nid) || null;
    } catch { return null; }
  };

  const parseNamePrefix = (content) => {
    if (typeof content !== 'string') return null;
    const m = content.match(/^\s*([A-Z][A-Za-z\s\-']{1,40})\s*[:\-–—]\s+/);
    return m ? m[1] : null;
  };

  // Backfill participants from messages
  useEffect(() => {
    (async () => {
      try {
        if (participants && participants.length > 0) return;
        if (!Array.isArray(messages) || messages.length === 0) return;
        const ids = Array.from(new Set(
          messages.map(m => m?.metadata?.speakerCharacterId ?? m?.metadata?.speaker_id ?? m?.metadata?.speakerId).filter(Boolean)
        ));
        const { characterRepository } = await import('../repositories/characterRepository');
        if (ids.length > 0) {
          const fetched = await Promise.all(ids.map(id => characterRepository.getById(id)));
          const valid = fetched.filter(Boolean);
          if (valid.length > 0) {
            window.__rt_backfill = valid;
            setNameMap(Object.fromEntries(valid.map(v => [String(v.name).toLowerCase(), v.id])));
            return;
          }
        }
        const names = Array.from(new Set(
          messages.filter(m => m.role === 'assistant' && typeof m.content === 'string')
            .map(m => parseNamePrefix(m.content)).filter(Boolean)
        ));
        if (names.length > 0) {
          const fetchedByName = await Promise.all(names.map(n => characterRepository.getByName?.(n)));
          const validByName = (fetchedByName || []).filter(Boolean);
          if (validByName.length > 0) {
            window.__rt_backfill = validByName;
            setNameMap(Object.fromEntries(validByName.map(v => [String(v.name).toLowerCase(), v.id])));
          }
        }
      } catch {}
    })();
  }, [participants?.length, messages?.length]);

  return (
    <PreviewLayout>
      <ScrollBackground className="min-h-screen py-6 px-4">
        <ScrollWrap className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-4">
            <Link to="/" className="inline-flex items-center text-amber-700 hover:text-amber-900 text-sm mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Home
            </Link>
            
            <h1 className="text-2xl md:text-3xl font-bold text-center text-amber-900 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
              Biblical Roundtable
            </h1>
            <p className="text-amber-800 text-center font-medium mb-4">{topic}</p>
            
            {/* Participants */}
            <div className="flex flex-wrap justify-center gap-3 mb-4">
              {participants.map(participant => (
                <div key={participant.id} className="flex flex-col items-center">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 border-amber-400">
                    <img
                      src={participant.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(participant.name)}&background=random`}
                      alt={participant.name}
                      className="w-full h-full object-cover"
                      style={{ objectPosition: 'center 8%' }}
                    />
                  </div>
                  <span className="text-amber-800 text-xs mt-1 text-center">{participant.name}</span>
                </div>
              ))}
            </div>
            
            {/* Controls */}
            <div className="flex justify-center gap-2 md:gap-3 mb-4 flex-wrap">
              <button
                onClick={() => navigate('/roundtable/setup')}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white"
              >
                New Roundtable
              </button>
              <button
                onClick={async () => {
                  try {
                    const lines = [];
                    if (topic) lines.push(`Roundtable: ${topic}`);
                    const names = (participants?.length ? participants : window.__rt_backfill || []).map(p => p.name);
                    if (names.length) lines.push(`Participants: ${names.join(', ')}`);
                    if (lines.length) lines.push('');
                    for (const m of messages) {
                      if (m.role === 'system') continue;
                      if (m.role === 'user') {
                        lines.push(`You: ${m.content}`);
                      } else {
                        let speaker = getCharacterById(m?.metadata?.speakerCharacterId);
                        const nm = speaker?.name || m?.metadata?.speakerName || parseNamePrefix(m.content) || 'Unknown';
                        lines.push(`${nm}: ${normalizeContent(m.content, nm)}`);
                      }
                    }
                    await navigator.clipboard.writeText(lines.join('\n'));
                  } catch (e) { console.error('Failed to copy:', e); }
                }}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white"
              >
                Copy
              </button>
              <button
                onClick={async () => {
                  try {
                    if (!conversationId) return;
                    const res = await (await import('../services/chatInvitesService')).createChatInvite(conversationId);
                    if (res.error || !res.data) return;
                    const url = `${window.location.origin}/join/${res.data.code}`;
                    if (navigator.share) {
                      try { await navigator.share({ title: `Join Roundtable: ${topic}`, url }); return; } catch {}
                    }
                    await navigator.clipboard.writeText(url);
                    alert('Invite link copied!');
                  } catch (e) { console.error('Failed to invite:', e); }
                }}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white"
              >
                Invite
              </button>
              <button
                onClick={async () => {
                  try {
                    if (!conversationId) return;
                    const shareCode = await shareConversation?.(conversationId);
                    if (!shareCode) return;
                    const names = (participants?.length ? participants : window.__rt_backfill || []).map(p => p.name);
                    const qp = names.length ? `?participants=${encodeURIComponent(names.join(','))}` : '';
                    const url = `${window.location.origin}/shared/${shareCode}${qp}`;
                    if (navigator.share) {
                      try { await navigator.share({ title: `Roundtable: ${topic}`, url }); return; } catch {}
                    }
                    await navigator.clipboard.writeText(url);
                    alert('Share link copied!');
                  } catch (e) { console.error('Failed to share:', e); }
                }}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white"
              >
                Share
              </button>
              <button
                onClick={async () => {
                  if (!conversationId) return;
                  try {
                    const newValue = !isSaved;
                    await updateConversation?.(conversationId, { is_favorite: newValue });
                    setIsSaved(newValue);
                  } catch (e) { console.error('Failed to save:', e); }
                }}
                disabled={!conversationId || isSharedView}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  !conversationId || isSharedView
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : isSaved
                      ? 'bg-green-600 text-white'
                      : 'bg-amber-600 hover:bg-amber-700 text-white'
                }`}
              >
                {isSaved ? '★ Saved' : 'Save'}
              </button>
            </div>
          </div>
          
          {/* Error */}
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg p-3 mb-4 cursor-pointer" onClick={clearError}>
              {error}
            </div>
          )}
          
          {/* Transcript */}
          <div className="bg-white/80 border border-amber-200 rounded-xl p-4 mb-4 h-[50vh] md:h-[60vh] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-amber-700 text-center gap-4">
                <div>
                  {participants?.length > 0
                    ? "The roundtable will begin when you send a message or advance the round."
                    : "No roundtable is active yet. Start one to begin the discussion."}
                </div>
                <button
                  onClick={() => navigate('/roundtable/setup')}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Start a Roundtable
                </button>
              </div>
            ) : (
              <>
                {messages.map((message, index) => {
                  if (message.role === 'system') return null;
                  
                  if (message.role === 'user') {
                    return (
                      <div key={message.id || `user-${index}`} className="flex justify-end mb-4">
                        <div className="bg-amber-600 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-[80%] shadow-md">
                          {message.content}
                        </div>
                      </div>
                    );
                  }
                  
                  let speaker = getCharacterById(message?.metadata?.speakerCharacterId ?? message?.metadata?.speaker_id);
                  if (!speaker) {
                    const metaName = message?.metadata?.speakerName;
                    if (metaName) speaker = { name: metaName };
                    else {
                      const nm = parseNamePrefix(message.content);
                      if (nm) {
                        const id = nameMap[nm.toLowerCase()];
                        speaker = id ? getCharacterById(id) : { name: nm };
                      }
                    }
                  }
                  
                  return (
                    <div key={message.id || `assistant-${index}`} className="flex gap-3 mb-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-300">
                          {speaker ? (
                            <img
                              src={speaker.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(speaker.name)}&background=random`}
                              alt={speaker.name}
                              className="w-full h-full object-cover"
                              style={{ objectPosition: 'center 8%' }}
                            />
                          ) : (
                            <div className="w-full h-full bg-amber-200 flex items-center justify-center text-amber-700 text-xs">?</div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-amber-700 text-sm font-medium mb-1">{speaker?.name || 'Unknown'}</div>
                        <div className="bg-amber-50 text-amber-900 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-amber-200">
                          {normalizeContent(message.content, speaker?.name) || <span className="text-amber-500 italic">Thinking...</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {isTyping && (
                  <div className="flex items-center gap-2 text-amber-600 mt-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <span className="text-sm">Characters are responding...</span>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
          
          {/* Input */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              disabled={isTyping || isSharedView}
              className={`flex-1 bg-white/80 border border-amber-300 rounded-full py-3 px-4 text-amber-900 placeholder-amber-400 
                focus:outline-none focus:ring-2 focus:ring-amber-500
                ${(isTyping || isSharedView) ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            <button
              type="submit"
              disabled={isTyping || !inputValue.trim() || isSharedView}
              className={`px-4 py-2 rounded-full transition-colors flex items-center justify-center
                ${(isTyping || !inputValue.trim() || isSharedView)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </form>
        </ScrollWrap>
      </ScrollBackground>
      <FooterScroll />
    </PreviewLayout>
  );
};

export default RoundtableChatScroll;
