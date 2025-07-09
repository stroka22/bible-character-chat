import OpenAI from 'openai';
import { type ChatMessage } from './supabase';

// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------

/**
 * Public (browser-safe) API key pulled from `.env`.
 * In production you should proxy requests through a secure backend instead
 * of exposing the key in client-side code.
 */
const apiKey = import.meta.env.VITE_OPENAI_API_KEY ?? '';

/** Whether the current environment is able to call OpenAI. */
const OPENAI_ENABLED = Boolean(apiKey);

// Only instantiate the SDK when we actually have a key.  This prevents the
// library from throwing at import-time when the key is missing (e.g. on
// contributor machines that don’t need chat features).
const openai = OPENAI_ENABLED
  ? new OpenAI({
      apiKey,
      // NOTE: For real production deployments route this through a backend.
      dangerouslyAllowBrowser: true,
    })
  : null;

if (!OPENAI_ENABLED) {
  console.warn(
    '[OpenAI] No API key detected. Chat features will return placeholder ' +
      'responses.  Provide VITE_OPENAI_API_KEY in your .env file to enable.',
  );
}
// Message types for OpenAI API
export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  role: MessageRole;
  content: string;
}

/**
 * Generates a response from a Bible character using GPT-4
 * @param characterName - Name of the Bible character
 * @param characterPersona - Detailed persona description of the character
 * @param messages - Chat history in the format expected by OpenAI
 * @returns The generated response from the character
 */
export async function generateCharacterResponse(
  characterName: string,
  characterPersona: string,
  messages: Message[]
): Promise<string> {
  // Fallback when OpenAI is disabled
  if (!OPENAI_ENABLED || !openai) {
    return `(${characterName} is silent because no OpenAI API key is configured.)`;
  }

  try {
    // Create the system message that defines the character's persona
    const systemMessage: Message = {
      role: 'system',
      content: `You are ${characterName}, ${characterPersona}. 
      Respond to the user's messages in first person, as if you are truly ${characterName}.
      Draw from biblical knowledge, historical context, and the character's known personality traits.
      Keep responses concise (under 150 words) but meaningful and in the authentic voice of ${characterName}.
      Never break character or refer to yourself as an AI.`
    };

    // Combine system message with chat history
    const completeMessages = [systemMessage, ...messages];

    // Make the API call to OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4', // Using GPT-4 as specified
      messages: completeMessages,
      temperature: 0.7, // Balanced between creativity and consistency
      max_tokens: 300, // Limit response length
      top_p: 1,
      frequency_penalty: 0.2, // Slight penalty for repeated content
      presence_penalty: 0.6, // Encourage the model to talk about new topics
    });

    // Extract and return the generated text
    const generatedText = response.choices[0]?.message?.content || 
      "I'm afraid I cannot respond at the moment. Let us speak again later.";
    
    return generatedText;
  } catch (error) {
    console.error('Error generating character response:', error);
    throw new Error('Failed to generate character response. Please try again.');
  }
}

/**
 * Formats chat messages into the structure required by OpenAI API
 * @param messages - Array of chat messages from the database
 * @returns Array of messages formatted for OpenAI API
 */
export function formatMessagesForOpenAI(messages: ChatMessage[]): Message[] {
  return messages
    .filter(message => message.role !== 'system') // System messages are handled separately
    .map(message => ({
      role: message.role as MessageRole,
      content: message.content
    }));
}

/**
 * Streaming version of character response generation
 * @param characterName - Name of the Bible character
 * @param characterPersona - Detailed persona description of the character
 * @param messages - Chat history in the format expected by OpenAI
 * @param onChunk - Callback function that receives each chunk of the response
 */
export async function streamCharacterResponse(
  characterName: string,
  characterPersona: string,
  messages: Message[],
  onChunk: (chunk: string) => void
): Promise<void> {
  // Fallback when OpenAI is disabled
  if (!OPENAI_ENABLED || !openai) {
    onChunk(
      `(Streaming is unavailable because no OpenAI API key is configured.)`,
    );
    return;
  }

  try {
    // Create the system message that defines the character's persona
    const systemMessage: Message = {
      role: 'system',
      content: `You are ${characterName}, ${characterPersona}. 
      Respond to the user's messages in first person, as if you are truly ${characterName}.
      Draw from biblical knowledge, historical context, and the character's known personality traits.
      Keep responses concise (under 150 words) but meaningful and in the authentic voice of ${characterName}.
      Never break character or refer to yourself as an AI.`
    };

    // Combine system message with chat history
    const completeMessages = [systemMessage, ...messages];

    // Make the streaming API call to OpenAI
    const stream = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: completeMessages,
      temperature: 0.7,
      max_tokens: 300,
      top_p: 1,
      frequency_penalty: 0.2,
      presence_penalty: 0.6,
      stream: true,
    });

    // Process the stream
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        onChunk(content);
      }
    }
  } catch (error) {
    console.error('Error streaming character response:', error);
    throw new Error('Failed to generate character response. Please try again.');
  }
}
