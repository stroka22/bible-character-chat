import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { generateCharacterResponse } from '../services/openai';
import { useConversation } from './ConversationContext.jsx';
import { characterRepository } from '../repositories/characterRepository';
import { roundtableSettingsRepository, DEFAULT_ROUNDTABLE_SETTINGS } from '../repositories/roundtableSettingsRepository';
import { getOwnerSlug } from '../services/tierSettingsService';
import { useAuth } from './AuthContext.js';

// Create the roundtable context
const RoundtableContext = createContext();

// Provider component
export const RoundtableProvider = ({ children }) => {
  console.log('[RoundtableContext] Initializing provider');
  
  // Premium status (used for tier-gated limits)
  const { isPremium } = useAuth();
  
  // Roundtable state
  const [participants, setParticipants] = useState([]);
  const [topic, setTopic] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [repliesPerRound, setRepliesPerRound] = useState(3);
  const [maxWordsPerReply, setMaxWordsPerReply] = useState(110);
  const [error, setError] = useState(null);
  const [turnCounts, setTurnCounts] = useState({});
  
  // Refs
  const messageIdCounter = useRef(1);
  const speakerCursor = useRef(0);
  const lastSpeakerRef = useRef(null);
  const enableFollowUps = useRef(true);
  const followUpsPerRound = useRef(2);
  // Flag to auto-start discussion (consumed by RoundtableChat)
  const autoStartNext = useRef(false);
  
  // Conversation persistence helpers
  let conversationContext;
  try {
    conversationContext = useConversation();
    console.log('[RoundtableContext] Successfully connected to ConversationContext');
  } catch (err) {
    console.error('[RoundtableContext] Error connecting to ConversationContext:', err);
    // Fallback object so the rest of RoundtableContext can still operate
    conversationContext = {
      createConversation: null,
      addMessage: null,
    };
  }

  const { createConversation, addMessage } = conversationContext;

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  /**
   * Generate a unique message ID
   */
  const generateMessageId = useCallback(() => {
    const id = `rtmsg-${Date.now()}-${messageIdCounter.current}`;
    messageIdCounter.current += 1;
    return id;
  }, []);

  /**
   * Start a new roundtable discussion
   */
  const startRoundtable = useCallback(async ({ participantIds, topic: topicText, repliesPerRound: rpr, autoStart = false }) => {
    console.log(`[RoundtableContext] Starting roundtable with ${participantIds.length} participants on topic: ${topicText}`);
    
    if (!participantIds || !participantIds.length) {
      setError('Please select at least one participant for the roundtable');
      return false;
    }

    if (!topicText || !topicText.trim()) {
      setError('Please provide a topic for the roundtable');
      return false;
    }

    setIsTyping(true);
    
    try {
      /* ------------------------------------------------------------------
       * Load per-organisation roundtable settings from Supabase
       * ----------------------------------------------------------------*/
      const ownerSlug = getOwnerSlug();
      let settings = DEFAULT_ROUNDTABLE_SETTINGS;
      try {
        const fetched = await roundtableSettingsRepository.getByOwnerSlug(ownerSlug);
        if (fetched) settings = fetched;
      } catch (e) {
        console.warn('[RoundtableContext] Using default roundtable settings due to fetch error:', e);
      }
      // ------------------------------------------------------------------
      // Select the correct limits object based on premium status
      // Back-compat: if limits do not have free/premium keys, use as-is.
      // ------------------------------------------------------------------
      const limitsObj = settings.limits || {};
      const tierKey = isPremium ? 'premium' : 'free';
      const tierLimits = limitsObj[tierKey] || limitsObj;

      const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
      // Effective replies / words / follow-ups
      const effReplies = clamp(
        rpr || settings.defaults.repliesPerRound,
        tierLimits.repliesPerRound.min,
        tierLimits.repliesPerRound.max
      );
      const effMaxWords = clamp(
        settings.defaults.maxWordsPerReply,
        tierLimits.maxWordsPerReply.min,
        tierLimits.maxWordsPerReply.max
      );
      const effFollowUps = clamp(
        settings.defaults.followUpsPerRound,
        tierLimits.followUpsPerRound.min,
        tierLimits.followUpsPerRound.max
      );
      setRepliesPerRound(effReplies);
      setMaxWordsPerReply(effMaxWords);
      followUpsPerRound.current = effFollowUps;
      /* ------------------------------------------------------------------ */

      // Reset state
      setMessages([]);
      setConversationId(null);
      
      // Set topic and replies per round
      setTopic(topicText);
      if (rpr && !isNaN(parseInt(rpr))) {
        setRepliesPerRound(parseInt(rpr));
      }
      
      // Fetch full character data for each participant
      const characterPromises = participantIds.map(id => characterRepository.getById(id));
      const fetchedCharacters = await Promise.all(characterPromises);
      
      // Filter out any null results (character not found)
      const validCharacters = fetchedCharacters.filter(Boolean);
      
      if (validCharacters.length === 0) {
        throw new Error('No valid characters found');
      }
      
      setParticipants(validCharacters);
      
      // Reset speaker cursor and turn counts
      speakerCursor.current = 0;
      lastSpeakerRef.current = null;
      setTurnCounts({});
      
      // Create conversation in repository
      if (typeof createConversation === 'function') {
        const firstCharacterId = validCharacters[0].id;
        const conversationTitle = `Roundtable: ${topicText}`;
        
        const newConversation = await createConversation({
          character_id: firstCharacterId,
          title: conversationTitle,
          type: 'roundtable',
          participants: participantIds
        });
        
        if (newConversation?.id) {
          setConversationId(newConversation.id);
          
          // Add system message about the roundtable
          const systemMessage = {
            id: generateMessageId(),
            role: 'system',
            content: `A roundtable discussion on the topic: "${topicText}"`,
            timestamp: new Date().toISOString()
          };
          
          setMessages([systemMessage]);
          
          if (typeof addMessage === 'function') {
            await addMessage({
              conversation_id: newConversation.id,
              role: 'system',
              content: systemMessage.content
            });
          }
        }
      } else {
        console.warn('[RoundtableContext] No createConversation function available - proceeding in memory only');
      }
      
      return true;
    } catch (err) {
      console.error('Error starting roundtable:', err);
      setError(`Failed to start roundtable: ${err.message}`);
      return false;
    } finally {
      // If caller requested auto-start and setup succeeded, mark flag
      if (autoStart) {
        autoStartNext.current = true;
      }
      setIsTyping(false);
    }
  }, [generateMessageId, createConversation, addMessage]);

  /**
   * Send a user message to the roundtable
   */
  const sendUserMessage = useCallback(async (content) => {
    if (!content || !participants.length) return;
    
    // Create user message
    const userMessage = {
      id: generateMessageId(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    
    // Add to messages
    setMessages(prev => [...prev, userMessage]);
    // Prepare a fresh snapshot including the just-added user message
    const nextMessages = [...messages, userMessage];
    
    // Persist message if conversation exists
    if (conversationId && typeof addMessage === 'function') {
      try {
        await addMessage({
          conversation_id: conversationId,
          role: 'user',
          content,
          metadata: { speakerCharacterId: null }
        });
      } catch (err) {
        console.error('Error saving user message:', err);
      }
    }
    
    // Generate character replies using the fresh snapshot so the latest
    // user input is definitely included in context.
    await generateRoundReplies(nextMessages);
    
    return userMessage;
  }, [participants, conversationId, generateMessageId, addMessage]);

  /**
   * Advance to the next round without user input
   */
  const advanceRound = useCallback(async () => {
    if (!participants.length) {
      setError('No active roundtable to advance');
      return false;
    }
    
    await generateRoundReplies(messages);
    return true;
  }, [participants, messages]);

  /**
   * Internal function to generate replies from characters
   */
  const generateRoundReplies = useCallback(async (baseMessages) => {
    if (!participants.length) return;
    
    setIsTyping(true);
    
    try {
      // Work with a local copy of the message history to ensure
      // within-round responses can see prior speakers in the same round.
      const workingMessages = [...(baseMessages || messages)];
      // Determine which characters will speak in this round
      let speakers = [];
      
      if (participants.length <= repliesPerRound) {
        // If we have fewer participants than replies per round, everyone speaks
        speakers = [...participants];
      } else {
        // Otherwise, choose speakers with fairness using rotation
        const availableSpeakers = [...participants];
        const startIndex = speakerCursor.current % participants.length;
        
        // Shuffle the available speakers to add randomness
        for (let i = availableSpeakers.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [availableSpeakers[i], availableSpeakers[j]] = [availableSpeakers[j], availableSpeakers[i]];
        }
        
        // Take speakers starting from our cursor position, wrapping around if needed
        for (let i = 0; i < repliesPerRound; i++) {
          const index = (startIndex + i) % participants.length;
          speakers.push(availableSpeakers[index]);
        }
        
        // Update cursor for next round
        speakerCursor.current = (startIndex + repliesPerRound) % participants.length;
      }
      
      // Track speakers in this round to exclude them from follow-ups
      const speakersInRound = new Set();
      
      // Generate replies sequentially for each speaker
      for (const speaker of speakers) {
        speakersInRound.add(speaker.id);
        
        // Create a simplified message history for the API
        // Include the last 10 messages for context
        const recentMessages = workingMessages.slice(-10).map(msg => {
          // For character messages, include the speaker's name
          if (msg.metadata?.speakerCharacterId) {
            const speakerChar = participants.find(p => p.id === msg.metadata.speakerCharacterId);
            const speakerName = speakerChar ? speakerChar.name : 'Unknown';
            return {
              role: 'assistant',
              content: `${speakerName}: ${msg.content}`
            };
          }
          return {
            role: msg.role,
            content: msg.content
          };
        });
        
        // Create system message with roundtable context
        const otherParticipantNames = participants
          .filter(p => p.id !== speaker.id)
          .map(p => p.name)
          .join(', ');
        
        // Detect latest user input (if any) to allow topical pivots
        const latestUserInput = [...workingMessages].reverse().find(m => m.role === 'user')?.content || '';

        const persona = speaker.persona_prompt || speaker.description || `a biblical figure known for ${speaker.scriptural_context || 'wisdom'}`;
        const traits = Array.isArray(speaker.character_traits)
          ? speaker.character_traits.join(', ')
          : (speaker.character_traits || '');
        const systemMessage = {
          role: 'system',
          content: `You are ${speaker.name}. Persona: ${persona}. ${traits ? `Known traits: ${traits}.` : ''}
You are participating in a roundtable discussion on the topic: "${topic}".
The other participants are: ${otherParticipantNames}.
Respond in first person as ${speaker.name}. You may reference other participants by name.
Do not include any name prefixes (e.g., "${speaker.name}:" or anyone else's name) at the start of your response.
Do not output JSON or structured objects. Reply only with natural language.
Keep your response concise (${maxWordsPerReply} words or less).
Critically: do not repeat or lightly rephrase points already made. Bring a distinct perspective shaped by your background; cite specific scripture when helpful; or challenge/affirm another speaker by name.
If the user's latest input shifts the focus, explicitly address that shift.
${latestUserInput ? `Latest user input to consider: "${latestUserInput}"` : ''}
Stay in character and draw from biblical knowledge.`.trim()
        };
        
        const apiMessages = [systemMessage, ...recentMessages];
        
        // Create placeholder message
        const messageId = generateMessageId();
        const placeholderMessage = {
          id: messageId,
          role: 'assistant',
          content: '',
          timestamp: new Date().toISOString(),
          metadata: { speakerCharacterId: speaker.id }
        };
        
        setMessages(prev => [...prev, placeholderMessage]);
        
        // Generate response
        try {
          const reply = await generateCharacterResponse(
            speaker.name,
            persona,
            apiMessages
          );
          
          // Limit reply length if needed
          let limitedReply = reply;
          if (reply) {
            const words = reply.split(/\s+/);
            if (words.length > maxWordsPerReply) {
              limitedReply = words.slice(0, maxWordsPerReply).join(' ') + '...';
            }
          }
          
          // Update message with response
          setMessages(prev =>
            prev.map(m => m.id === messageId ? { 
              ...m, 
              content: limitedReply 
            } : m)
          );
          // Also update our working snapshot so later speakers see this reply
          workingMessages.push({
            role: 'assistant',
            content: limitedReply,
            metadata: { speakerCharacterId: speaker.id }
          });
          
          // Persist message
          if (conversationId && typeof addMessage === 'function') {
            await addMessage({
              conversation_id: conversationId,
              role: 'assistant',
              content: limitedReply,
              metadata: { speakerCharacterId: speaker.id }
            });
          }
          
          // Update turn counts and last speaker
          setTurnCounts(prev => ({
            ...prev,
            [speaker.id]: (prev[speaker.id] || 0) + 1
          }));
          lastSpeakerRef.current = speaker.id;
          
        } catch (err) {
          console.error(`Error generating response for ${speaker.name}:`, err);
          
          // Update message with error
          setMessages(prev =>
            prev.map(m => m.id === messageId ? { 
              ...m, 
              content: `(${speaker.name} is unable to respond at this moment.)` 
            } : m)
          );
          
          // Still persist the error message
          if (conversationId && typeof addMessage === 'function') {
            await addMessage({
              conversation_id: conversationId,
              role: 'assistant',
              content: `(${speaker.name} is unable to respond at this moment.)`,
              metadata: { speakerCharacterId: speaker.id }
            });
          }
        }
        
        // Small delay between speakers for a more natural flow
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Follow-up phase (if enabled)
      if (enableFollowUps.current && participants.length > repliesPerRound) {
        // Build candidate list - exclude speakers from this round and the last speaker
        const candidates = participants.filter(p => 
          !speakersInRound.has(p.id) && 
          p.id !== lastSpeakerRef.current
        );
        
        // Shuffle candidates
        for (let i = candidates.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
        }
        
        // Limit to configured follow-ups per round
        const followUpCandidates = candidates.slice(0, followUpsPerRound.current);
        
        // Get the most recent messages for context
        const recentMessages = workingMessages.slice(-10).map(msg => {
          // For character messages, include the speaker's name
          if (msg.metadata?.speakerCharacterId) {
            const speakerChar = participants.find(p => p.id === msg.metadata.speakerCharacterId);
            const speakerName = speakerChar ? speakerChar.name : 'Unknown';
            return {
              role: 'assistant',
              content: `${speakerName}: ${msg.content}`
            };
          }
          return {
            role: msg.role,
            content: msg.content
          };
        });
        
        // Generate follow-up replies
        for (const candidate of followUpCandidates) {
          const otherParticipantNames = participants
            .filter(p => p.id !== candidate.id)
            .map(p => p.name)
            .join(', ');
          
          // Create system message with follow-up instructions
          const latestUserInputFU = [...workingMessages].reverse().find(m => m.role === 'user')?.content || '';
          const systemMessage = {
            role: 'system',
            content: `You are ${candidate.name}. Persona: ${candidate.persona_prompt || candidate.description || `a biblical figure known for ${candidate.scriptural_context || 'wisdom'}`}${candidate.character_traits ? `. Known traits: ${Array.isArray(candidate.character_traits) ? candidate.character_traits.join(', ') : candidate.character_traits}.` : ''}
You are participating in a roundtable discussion on the topic: "${topic}".
The other participants are: ${otherParticipantNames}.
Only reply if you have a specific response to one of the last messages (agreement, disagreement, clarification). If not, respond exactly with (skip).
Do not repeat what has already been said; add a distinct insight, cite a specific scripture, or pose a concise, relevant question.
${latestUserInputFU ? `Latest user input to consider: "${latestUserInputFU}"` : ''}
Keep under ${maxWordsPerReply} words.
Respond in first person as ${candidate.name}. You may reference other participants by name.
Do not include any name prefixes (e.g., "${candidate.name}:" or anyone else's name) at the start of your response.
Do not output JSON or structured objects. Reply only with natural language.
Stay in character and draw from biblical knowledge.`.trim()
          };
          
          const apiMessages = [systemMessage, ...recentMessages];
          
          try {
            const reply = await generateCharacterResponse(
              candidate.name,
              candidate.persona_prompt || candidate.description || `a biblical figure known for ${candidate.scriptural_context || 'wisdom'}`,
              apiMessages
            );
            
            // Check if the reply is a skip
            if (reply && reply.trim().toLowerCase() !== '(skip)') {
              // Limit reply length if needed
              let limitedReply = reply;
              if (reply) {
                const words = reply.split(/\s+/);
                if (words.length > maxWordsPerReply) {
                  limitedReply = words.slice(0, maxWordsPerReply).join(' ') + '...';
                }
              }
              
              // Create message
              const messageId = generateMessageId();
              const followUpMessage = {
                id: messageId,
                role: 'assistant',
                content: limitedReply,
                timestamp: new Date().toISOString(),
                metadata: { speakerCharacterId: candidate.id }
              };
              
              // Add to messages
              setMessages(prev => [...prev, followUpMessage]);
              // And to working snapshot
              workingMessages.push({
                role: 'assistant',
                content: limitedReply,
                metadata: { speakerCharacterId: candidate.id }
              });
              
              // Persist message
              if (conversationId && typeof addMessage === 'function') {
                await addMessage({
                  conversation_id: conversationId,
                  role: 'assistant',
                  content: limitedReply,
                  metadata: { speakerCharacterId: candidate.id }
                });
              }
              
              // Update turn counts and last speaker
              setTurnCounts(prev => ({
                ...prev,
                [candidate.id]: (prev[candidate.id] || 0) + 1
              }));
              lastSpeakerRef.current = candidate.id;
              
              // Small delay between speakers for a more natural flow
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          } catch (err) {
            console.error(`Error generating follow-up for ${candidate.name}:`, err);
            // Skip this candidate on error
          }
        }
      }
    } catch (err) {
      console.error('Error generating round replies:', err);
      setError('Failed to generate character responses. Please try again.');
    } finally {
      setIsTyping(false);
    }
  }, [participants, messages, topic, repliesPerRound, maxWordsPerReply, conversationId, generateMessageId, addMessage]);

  /**
   * Hydrate RoundtableContext state from an already-saved conversation
   */
  const hydrateFromConversation = useCallback(async (conversation) => {
    if (!conversation) return;
    
    try {
      // Set conversation ID
      setConversationId(conversation.id);
      
      // Set topic from title (if it follows our format)
      if (conversation.title && conversation.title.startsWith('Roundtable: ')) {
        setTopic(conversation.title.substring('Roundtable: '.length));
      }
      
      // Load participants if available, else backfill from message metadata
      let loadedParticipants = [];
      if (Array.isArray(conversation.participants) && conversation.participants.length > 0) {
        const characterPromises = conversation.participants.map(id => characterRepository.getById(id));
        const fetchedCharacters = await Promise.all(characterPromises);
        loadedParticipants = fetchedCharacters.filter(Boolean);
      } else if (Array.isArray(conversation.messages) && conversation.messages.length > 0) {
        const ids = Array.from(new Set(
          conversation.messages
            .map(m => m?.metadata?.speakerCharacterId)
            .filter(Boolean)
        ));
        if (ids.length > 0) {
          const fetched = await Promise.all(ids.map(id => characterRepository.getById(id)));
          loadedParticipants = fetched.filter(Boolean);
        } else {
          // As a last resort, attempt to parse leading name prefixes from assistant messages (e.g., "Paul: ...")
          const namePattern = /^\s*([A-Z][A-Za-z\s\-']{1,40}?):\s+/;
          const candidateNames = Array.from(new Set(
            conversation.messages
              .filter(m => m.role === 'assistant' && typeof m.content === 'string')
              .map(m => {
                const match = m.content.match(namePattern);
                return match ? match[1].trim() : null;
              })
              .filter(Boolean)
          ));
          if (candidateNames.length > 0) {
            const fetchedByName = await Promise.all(candidateNames.map(n => characterRepository.getByName?.(n)));
            loadedParticipants = (fetchedByName || []).filter(Boolean);
          }
        }
      }
      if (loadedParticipants.length > 0) {
        setParticipants(loadedParticipants);
        // Reset turn counts
        setTurnCounts({});
      }
      
      // Load messages
      if (Array.isArray(conversation.messages)) {
        const normalizedMessages = conversation.messages.map(m => ({
          id: m.id || generateMessageId(),
          role: m.role,
          content: m.content,
          timestamp: m.created_at || new Date().toISOString(),
          metadata: m.metadata || {}
        }));
        
        setMessages(normalizedMessages);
        
        // Rebuild turn counts from messages
        const counts = {};
        normalizedMessages.forEach(msg => {
          const speakerId = msg.metadata?.speakerCharacterId;
          if (speakerId) {
            counts[speakerId] = (counts[speakerId] || 0) + 1;
            lastSpeakerRef.current = speakerId;
          }
        });
        setTurnCounts(counts);
      }
      
      // Clear any errors
      setError(null);
    } catch (err) {
      console.error('[RoundtableContext] Failed to hydrate from conversation:', err);
      setError('Unable to load roundtable conversation. Please try again.');
    }
  }, [generateMessageId]);

  // Create the context value
  const contextValue = {
    // State
    participants,
    topic,
    messages,
    isTyping,
    conversationId,
    repliesPerRound,
    maxWordsPerReply,
    error,
    
    // Methods
    startRoundtable,
    sendUserMessage,
    advanceRound,
    hydrateFromConversation,
    
    // Settings
    setRepliesPerRound,
    setMaxWordsPerReply,
    
    // Helper methods
    clearError: () => setError(null),

    // Consume the auto-start flag once (RoundtableChat will call this)
    consumeAutoStartFlag: () => {
      const v = autoStartNext.current;
      autoStartNext.current = false;
      return v;
    }
  };

  return (
    <RoundtableContext.Provider value={contextValue}>
      {children}
    </RoundtableContext.Provider>
  );
};

// Custom hook for using the roundtable context
export const useRoundtable = () => {
  const context = useContext(RoundtableContext);
  
  if (!context) {
    console.error('[RoundtableContext] Hook used outside provider');
    // Return a minimal safe object to prevent crashes
    return {
      participants: [],
      topic: '',
      messages: [],
      isTyping: false,
      conversationId: null,
      repliesPerRound: 3,
      maxWordsPerReply: 110,
      error: null,
      
      startRoundtable: () => {
        console.warn('[RoundtableContext] Cannot start roundtable - no provider');
        return Promise.resolve(false);
      },
      sendUserMessage: () => {
        console.warn('[RoundtableContext] Cannot send message - no provider');
        return Promise.resolve(null);
      },
      advanceRound: () => {
        console.warn('[RoundtableContext] Cannot advance round - no provider');
        return Promise.resolve(false);
      },
      hydrateFromConversation: () => {
        console.warn('[RoundtableContext] Cannot hydrate - no provider');
      },
      setRepliesPerRound: () => {
        console.warn('[RoundtableContext] Cannot set replies per round - no provider');
      },
      setMaxWordsPerReply: () => {
        console.warn('[RoundtableContext] Cannot set max words - no provider');
      },
      clearError: () => {
        console.warn('[RoundtableContext] Cannot clear error - no provider');
      },
      consumeAutoStartFlag: () => false
    };
  }
  
  return context;
};

export default RoundtableContext;
