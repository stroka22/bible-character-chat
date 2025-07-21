import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

// Create the chat context
const ChatContext = createContext();

// Sample character responses for the mock implementation
const CHARACTER_RESPONSES = {
  default: [
    "I'm pondering your question. The scriptures tell us many things about this.",
    "That's an interesting perspective. In my time, we viewed things differently.",
    "Let me share what I know from my experiences with God.",
    "The Lord's ways are sometimes mysterious, but I've learned to trust in His plan.",
    "I remember when I faced a similar situation. Let me tell you what happened..."
  ],
  moses: [
    "As one who spoke with God face to face, I can tell you that His commands are to be followed with reverence.",
    "When I led the Israelites through the wilderness, I learned that faith requires patience and trust.",
    "The Ten Commandments were given to provide structure and guidance for God's people.",
    "Standing before the burning bush changed my understanding of who God is forever.",
    "Even after parting the Red Sea, I still had moments of doubt. Faith is a journey."
  ],
  david: [
    "As a shepherd boy who became king, I've learned that God looks at the heart, not outward appearances.",
    "My psalms reflect both my greatest joys and deepest sorrows. God is present in both.",
    "Though I failed greatly, God's forgiveness is greater still. This is what sustains me.",
    "When I faced Goliath, it wasn't my strength but my faith in God that gave me victory.",
    "Leading God's people taught me that true leadership begins with humility before the Lord."
  ],
  paul: [
    "Before Christ transformed me on the Damascus road, I was zealous but misguided.",
    "The gospel I preach is not of human origin, but was revealed to me by Jesus Christ.",
    "I count all my achievements as loss compared to the surpassing worth of knowing Christ.",
    "The grace that saved me, a former persecutor of the church, is available to all who believe.",
    "In my weakness, Christ's power is made perfect. This is the paradox of our faith."
  ],
  mary: [
    "When the angel told me I would bear the Messiah, I surrendered to God's will despite my fear.",
    "As I watched my son's ministry unfold, I treasured these things in my heart.",
    "Standing at the foot of the cross was my darkest hour, yet God's plan was still unfolding.",
    "My soul magnifies the Lord, for He has done great things for me and for all who fear Him.",
    "Being chosen by God doesn't mean an easy path, but it does mean a meaningful one."
  ]
  // --- Added characters for richer demo responses ------------------------
  abraham: [
    "As the father of many nations, I had to learn to walk by faith, not by sight.",
    "When God called me to leave my homeland, I stepped out in faith without knowing the destination.",
    "Offering my son Isaac was the greatest test of my faith, showing that God provides.",
    "My journey with God taught me that His promises may take time, but they never fail.",
    "The covenant God made with me was about blessing all nations, not just land."
  ],
  peter: [
    "I was impulsive, often speaking before thinking, but Jesus saw potential in me.",
    "Walking on water taught me that faith conquers fear, but doubt makes us sink.",
    "After denying Jesus three times, I learned the bitter lesson of my own weakness.",
    "Pentecost transformed me from a fearful fisherman to a bold apostle.",
    "Jesus called me the rock upon which He would build His church, despite my failures."
  ],
  esther: [
    "Perhaps I was made queen for such a time as this, to save my people.",
    "Courage isn't the absence of fear, but acting despite it when God calls you.",
    "Though God's name isn't mentioned in my story, His providence is evident throughout.",
    "Sometimes silence is deadly. When injustice threatens, we must speak up.",
    "Royal position means nothing if not used to serve God's purposes."
  ],
  john: [
    "As the disciple whom Jesus loved, I learned that love is at the heart of God's character.",
    "From the foot of the cross to the empty tomb, I witnessed God's love conquering death.",
    "In my gospel I stressed that God so loved the world that He gave His only Son.",
    "My exile on Patmos revealed the ultimate victory of Christ over all evil.",
    "Love one another—this command summarizes all that Jesus taught us."
  ]
};

// Helper function to get a random response
const getRandomResponse = (character, userMessage = '') => {
  // Figure out which key to use
  let key = 'default';
  if (character) {
    // normalised name (strip spaces & lowercase)
    const normName = (character.name || '').toLowerCase().replace(/\s+/g, '');
    if (CHARACTER_RESPONSES[normName]) {
      key = normName;
    } else {
      // partial match
      const possible = Object.keys(CHARACTER_RESPONSES).filter(k => k !== 'default');
      const found = possible.find(k => normName.includes(k));
      if (found) key = found;
    }
  }

  const responses = CHARACTER_RESPONSES[key] || CHARACTER_RESPONSES.default;

  // Track used responses on character instance to minimise repetition
  if (character) {
    if (!character._usedResponses) {
      character._usedResponses = new Set();
    }
    if (character._usedResponses.size >= responses.length - 1) {
      character._usedResponses.clear();
    }
    const available = responses.filter(r => !character._usedResponses.has(r));
    const chosen = available[Math.floor(Math.random() * available.length)];
    character._usedResponses.add(chosen);
    return chosen;
  }

  // fallback when character not supplied
  return responses[Math.floor(Math.random() * responses.length)];
};

// Provider component
export const ChatProvider = ({ children }) => {
  // Chat state
  const [messages, setMessages] = useState([]);
  const [character, setCharacter] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [isChatSaved, setIsChatSaved] = useState(false);
  
  // Refs
  const messageIdCounter = useRef(1);
  const typingTimeoutRef = useRef(null);
  
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
    const id = `msg-${Date.now()}-${messageIdCounter.current}`;
    messageIdCounter.current += 1;
    return id;
  }, []);

  /**
   * Load a conversation by ID
   */
  const loadConversation = useCallback(async (id) => {
    console.log('[MockChatContext] Would load conversation:', id);
    // In mock implementation, we don't actually load anything
    return null;
  }, []);

  /**
   * Load a shared conversation by share code
   */
  const loadSharedConversation = useCallback(async (code) => {
    console.log('[MockChatContext] Would load shared conversation:', code);
    // In mock implementation, we don't actually load anything
    return null;
  }, []);

  /**
   * Select a character to chat with
   */
  const selectCharacter = useCallback((characterData) => {
    setCharacter(characterData);
    
    // Clear previous chat if character changes
    setMessages([]);
    setChatId(null);
    setIsChatSaved(false);
    
    // Add greeting message if character has an opening line
    if (characterData?.opening_line) {
      const greeting = {
        id: generateMessageId(),
        role: 'assistant',
        content: characterData.opening_line,
        timestamp: new Date().toISOString()
      };
      
      setMessages([greeting]);
    }
  }, [generateMessageId]);

  /**
   * Send a message and get a mock response
   */
  const sendMessage = useCallback(async (content) => {
    if (!content || !character) {
      return;
    }
    
    // Add user message
    const userMessage = {
      id: generateMessageId(),
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Simulate typing
    setIsTyping(true);
    
    // Clear any existing typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Add empty assistant message that will be filled
    const assistantMessageId = generateMessageId();
    const assistantMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    
    // Generate mock response with delay
    const typingDelay = 1000 + Math.random() * 2000; // 1-3 seconds
    const response = getRandomResponse(character, content);
    
    typingTimeoutRef.current = setTimeout(() => {
      // Update assistant message with response
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: response }
            : msg
        )
      );
      
      setIsTyping(false);
    }, typingDelay);
    
    return userMessage;
  }, [character, generateMessageId]);

  /**
   * Retry the last message (regenerate response)
   */
  const retryLastMessage = useCallback(() => {
    // Find the last user message
    const lastUserMessageIndex = [...messages].reverse().findIndex(msg => msg.role === 'user');
    
    if (lastUserMessageIndex === -1) {
      return;
    }
    
    // Get the actual index in the array (reverse the reverse index)
    const userMessageIndex = messages.length - 1 - lastUserMessageIndex;
    const userMessage = messages[userMessageIndex];
    
    // Remove all messages after the user message
    setMessages(prev => prev.slice(0, userMessageIndex + 1));
    
    // Re-send the message
    sendMessage(userMessage.content);
  }, [messages, sendMessage]);

  /**
   * Reset the chat
   */
  const resetChat = useCallback(() => {
    setMessages([]);
    setCharacter(null);
    setChatId(null);
    setIsChatSaved(false);
    setError(null);
  }, []);

  /**
   * Save the current chat
   */
  const saveChat = useCallback(async (title) => {
    if (!character || messages.length === 0) {
      setError('Cannot save an empty conversation');
      return false;
    }
    
    setIsLoading(true);
    
    try {
      // In mock implementation, we just log the action
      console.log('[MockChatContext] Would save chat with title:', title);
      
      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state as if save was successful
      setChatId('mock-chat-id-' + Date.now());
      setIsChatSaved(true);
      
      return true;
    } catch (err) {
      console.error('Error saving chat:', err);
      setError('Failed to save conversation. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [character, messages]);

  // Create the context value
  const contextValue = {
    // State
    messages,
    character,
    isLoading,
    isTyping,
    error,
    chatId,
    isChatSaved,
    
    // Methods
    selectCharacter,
    sendMessage,
    retryLastMessage,
    resetChat,
    saveChat,
    
    // Helper methods
    clearError: () => setError(null)
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook for using the chat context
export const useChat = () => {
  const context = useContext(ChatContext);
  
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  
  return context;
};

export default ChatContext;
