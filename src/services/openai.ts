import { type ChatMessage } from './supabase';

// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------

/**
 * Public (browser-safe) API key pulled from `.env`.
 * In production you should proxy requests through a secure backend instead
 * of exposing the key in client-side code.
 */
// NOTE: We no longer keep any API key in the browser bundle.  All requests
// are proxied via /api/openai/chat which is executed server-side using the
// OPENAI_API_KEY environment variable.
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
  try {
    const res = await fetch('/api/openai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ characterName, characterPersona, messages }),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data: { text: string } = await res.json();
    return data.text ?? "I'm afraid I cannot respond at the moment.";
  } catch (error) {
    console.error('[OpenAI Proxy] Error:', error);
    return `(An error occurred contacting the server-side OpenAI proxy.)`;
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
  // Simple non-stream fallback: call the proxy once and emit the whole text
  try {
    const text = await generateCharacterResponse(
      characterName,
      characterPersona,
      messages,
    );
    onChunk(text);
  } catch (err) {
    onChunk('(An error occurred contacting the server-side OpenAI proxy.)');
  }
}
