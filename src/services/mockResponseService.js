/**
 * Static JSON import handled by Vite – avoids top-level await which broke the build.
 * If the file is missing (e.g. in a customised build) we fall back to an empty object
 * so the rest of the chat system can still run without crashing.
 */
// eslint-disable-next-line import/no-unresolved
import mockResponsesData from '../data/mockResponses.json';

// Graceful fallback in case the JSON cannot be resolved at runtime
// (for example, if the file was deleted after build in some custom deployment)
// Vite will tree-shake unused JSON but here we ensure robustness.
// Using `?? {}` guarantees `mockResponses` is always an object.
const mockResponses = mockResponsesData ?? {};

/**
 * Get a random item from an array
 * @param {Array} array - The array to select from
 * @returns {*} A random item from the array
 */
const getRandomItem = (array) => {
  if (!array || array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * Analyze a message to determine what topic it's about
 * @param {string} message - The user's message
 * @returns {Object} An object containing the detected topics and their confidence scores
 */
const analyzeMessage = (message) => {
  if (!message) return { topic: 'greeting', confidence: 0.5 };
  
  const lowerMessage = message.toLowerCase();
  
  // Define topic keywords
  const topicKeywords = {
    salvation: ['salvation', 'saved', 'save', 'eternal life', 'heaven', 'forgiven', 'redemption'],
    suffering: ['suffering', 'pain', 'hurt', 'evil', 'bad things', 'tragedy', 'difficult', 'hardship'],
    prayer: ['prayer', 'pray', 'talk to god', 'communicate', 'asking god', 'petition'],
    purpose: ['purpose', 'meaning', 'why am i here', 'calling', 'destiny', 'plan for my life'],
    faith: ['faith', 'believe', 'trust', 'doubt', 'confidence', 'assurance'],
    
    // Jesus-specific topics
    identity: ['who are you', 'son of god', 'messiah', 'christ', 'savior', 'lord', 'divine'],
    miracles: ['miracle', 'heal', 'healing', 'water to wine', 'feeding', 'walking on water', 'raise', 'resurrection'],
    forgiveness: ['forgive', 'forgiveness', 'sin', 'repent', 'mercy', 'pardon'],
    
    // Paul-specific topics
    conversion: ['conversion', 'damascus', 'saul', 'changed', 'transformed', 'persecutor'],
    church: ['church', 'body of christ', 'congregation', 'assembly', 'believers', 'community'],
    grace: ['grace', 'unmerited favor', 'gift of god', 'justified', 'justification'],
    
    // Moses-specific topics
    law: ['law', 'commandment', 'rule', 'torah', 'covenant', 'ten commandments'],
    exodus: ['exodus', 'egypt', 'pharaoh', 'plagues', 'red sea', 'wilderness', 'desert'],
    leadership: ['leader', 'leadership', 'guide', 'lead', 'authority', 'responsibility']
  };
  
  // Check for greetings
  const greetingPatterns = [
    /^(hi|hello|hey|greetings)/i,
    /^good (morning|afternoon|evening|day)/i,
    /^(how are you|how's it going|what's up)/i
  ];
  
  if (greetingPatterns.some(pattern => pattern.test(lowerMessage))) {
    return { topic: 'greeting', confidence: 0.9 };
  }
  
  // Check for questions about uncertainty or confusion
  const uncertaintyPatterns = [
    /i('m| am) (confused|uncertain|not sure|doubtful)/i,
    /i don'?t (understand|know|get it)/i,
    /why (would|did|does|is|are)/i,
    /how (can|could|do|does)/i
  ];
  
  if (uncertaintyPatterns.some(pattern => pattern.test(lowerMessage))) {
    return { topic: 'uncertainty', confidence: 0.7 };
  }
  
  // Check for encouragement needs
  const encouragementPatterns = [
    /i('m| am) (sad|depressed|down|struggling|having a hard time)/i,
    /i need (help|encouragement|support|strength)/i,
    /i feel (lost|alone|abandoned|hopeless)/i,
    /(encourage|help|support) me/i
  ];
  
  if (encouragementPatterns.some(pattern => pattern.test(lowerMessage))) {
    return { topic: 'encouragement', confidence: 0.8 };
  }
  
  // Check for challenges or advice
  const challengePatterns = [
    /what should i (do|consider)/i,
    /how (should|can|could|do) i/i,
    /i need (advice|guidance|direction|wisdom)/i,
    /guide me/i
  ];
  
  if (challengePatterns.some(pattern => pattern.test(lowerMessage))) {
    return { topic: 'challenge', confidence: 0.75 };
  }
  
  // Check for specific topics
  let highestConfidence = 0;
  let detectedTopic = 'fallback';
  
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    const matches = keywords.filter(keyword => lowerMessage.includes(keyword));
    const confidence = matches.length / keywords.length;
    
    if (matches.length > 0 && confidence > highestConfidence) {
      highestConfidence = confidence;
      detectedTopic = topic;
    }
  }
  
  return { topic: detectedTopic, confidence: Math.max(0.5, highestConfidence) };
};

/**
 * Get a response for a specific character and topic
 * @param {string} characterName - The name of the character
 * @param {string} topic - The detected topic
 * @returns {string} A response from the character about the topic
 */
const getResponseForTopic = (characterName, topic) => {
  // Default to Jesus if character not found
  const character = mockResponses[characterName] || mockResponses.Jesus;
  
  // General responses (greeting, uncertainty, encouragement, challenge)
  if (topic === 'greeting' && character.general.greetings) {
    return getRandomItem(character.general.greetings);
  }
  
  if (topic === 'uncertainty' && character.general.uncertainties) {
    return getRandomItem(character.general.uncertainties);
  }
  
  if (topic === 'encouragement' && character.general.encouragements) {
    return getRandomItem(character.general.encouragements);
  }
  
  if (topic === 'challenge' && character.general.challenges) {
    return getRandomItem(character.general.challenges);
  }
  
  // Common theological topics
  if (character.common && character.common[topic]) {
    return getRandomItem(character.common[topic]);
  }
  
  // Character-specific topics
  if (character.specific && character.specific[topic]) {
    return getRandomItem(character.specific[topic]);
  }
  
  // Fallback to character's fallback responses
  if (mockResponses.fallback && mockResponses.fallback[characterName]) {
    return getRandomItem(mockResponses.fallback[characterName]);
  }
  
  // Ultimate fallback
  return `I, ${characterName}, am considering your words. Let us continue our conversation with wisdom and understanding.`;
};

/**
 * Generate a mock response for a character based on the conversation history
 * @param {string} characterName - The name of the character
 * @param {string} characterPersona - The character's persona description (not used in mock)
 * @param {Array} messages - The conversation history
 * @returns {string} A response from the character
 */
const generateMockResponse = (characterName, characterPersona, messages) => {
  try {
    // Extract the character's base name without "(Final)" or other suffixes
    const baseCharacterName = characterName.split(' ')[0];
    
    // Find the last user message
    const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
    
    if (!lastUserMessage) {
      // If no user message is found, return a greeting
      const character = mockResponses[baseCharacterName] || mockResponses.Jesus;
      return getRandomItem(character.general.greetings);
    }
    
    // Analyze the message to determine the topic
    const { topic } = analyzeMessage(lastUserMessage.content);
    
    // Get a response for the detected topic
    return getResponseForTopic(baseCharacterName, topic);
  } catch (error) {
    console.error('Error generating mock response:', error);
    return `I am ${characterName}. I apologize, but I am unable to respond properly at the moment. Let us continue our conversation later.`;
  }
};

/**
 * Stream a mock response for a character (simulates streaming by sending chunks)
 * @param {string} characterName - The name of the character
 * @param {string} characterPersona - The character's persona description (not used in mock)
 * @param {Array} messages - The conversation history
 * @param {Function} onChunk - Callback function to receive each chunk of the response
 */
const streamMockResponse = async (characterName, characterPersona, messages, onChunk) => {
  try {
    const response = generateMockResponse(characterName, characterPersona, messages);
    
    // Split the response into words to simulate streaming
    const words = response.split(' ');
    
    // Send each word as a chunk with a small delay
    for (let i = 0; i < words.length; i++) {
      const chunk = words[i] + (i < words.length - 1 ? ' ' : '');
      
      // Use setTimeout to create a delay between chunks
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
      
      onChunk(chunk);
    }
  } catch (error) {
    console.error('Error streaming mock response:', error);
    onChunk(`I am ${characterName}. I apologize, but I am unable to respond properly at the moment.`);
  }
};

/**
 * Check if mock responses are available
 * @returns {boolean} True if mock responses are available
 */
const areMockResponsesAvailable = () => {
  return Boolean(mockResponses && Object.keys(mockResponses).length > 0);
};

// Export the functions
export {
  generateMockResponse,
  streamMockResponse,
  areMockResponsesAvailable
};
