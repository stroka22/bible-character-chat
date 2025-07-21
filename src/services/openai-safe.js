import OpenAI from 'openai';
const apiKey = import.meta.env.VITE_OPENAI_API_KEY ?? '';
const OPENAI_ENABLED = Boolean(apiKey);
const openai = OPENAI_ENABLED
    ? new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true,
    })
    : null;
if (!OPENAI_ENABLED) {
    console.warn('[OpenAI] No API key detected. Chat features will return placeholder ' +
        'responses. Provide VITE_OPENAI_API_KEY in your .env file to enable.');
}
export async function generateCharacterResponse(characterName, characterPersona, messages) {
    if (!OPENAI_ENABLED || !openai) {
        return `(${characterName} is silent because no OpenAI API key is configured.)`;
    }
    try {
        const systemMessage = {
            role: 'system',
            content: `You are ${characterName}, ${characterPersona}. 
      Respond to the user's messages in first person, as if you are truly ${characterName}.
      Draw from biblical knowledge, historical context, and the character's known personality traits.
      Keep responses concise (under 150 words) but meaningful and in the authentic voice of ${characterName}.
      Never break character or refer to yourself as an AI.`
        };
        const completeMessages = [systemMessage, ...messages];
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: completeMessages,
            temperature: 0.7,
            max_tokens: 300,
            top_p: 1,
            frequency_penalty: 0.2,
            presence_penalty: 0.6,
        });
        const generatedText = response.choices[0]?.message?.content ||
            "I'm afraid I cannot respond at the moment. Let us speak again later.";
        return generatedText;
    }
    catch (error) {
        console.warn('[OpenAI] Error generating character response:', error);
        return `(${characterName} is unable to respond due to a technical issue. Please try again later.)`;
    }
}
export function formatMessagesForOpenAI(messages) {
    return messages
        .filter(message => message.role !== 'system')
        .map(message => ({
        role: message.role,
        content: message.content
    }));
}
export async function streamCharacterResponse(characterName, characterPersona, messages, onChunk) {
    if (!OPENAI_ENABLED || !openai) {
        onChunk(`(Streaming is unavailable because no OpenAI API key is configured.)`);
        return;
    }
    try {
        const systemMessage = {
            role: 'system',
            content: `You are ${characterName}, ${characterPersona}. 
      Respond to the user's messages in first person, as if you are truly ${characterName}.
      Draw from biblical knowledge, historical context, and the character's known personality traits.
      Keep responses concise (under 150 words) but meaningful and in the authentic voice of ${characterName}.
      Never break character or refer to yourself as an AI.`
        };
        const completeMessages = [systemMessage, ...messages];
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
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                onChunk(content);
            }
        }
    }
    catch (error) {
        console.warn('[OpenAI] Error streaming character response:', error);
        onChunk(`(${characterName} is unable to respond due to a technical issue. Please try again later.)`);
    }
}
export { openai };
