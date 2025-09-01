import OpenAI from 'openai';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

type RequestBody = {
  characterName: string;
  characterPersona: string;
  messages: Message[];
};

export default async function handler(
  req: any,
  res: any
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { characterName, characterPersona, messages } = req.body as RequestBody;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const systemMessage: Message = {
      role: 'system',
      content: `You are ${characterName}, ${characterPersona}. 
      Respond to the user's messages in first person, as if you are truly ${characterName}.
      Draw from biblical knowledge, historical context, and the character's known personality traits.
      Keep responses concise (under 150 words) but meaningful and in the authentic voice of ${characterName}.
      Never break character or refer to yourself as an AI.`
    };

    const completeMessages = [systemMessage, ...messages];

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: completeMessages,
        temperature: 0.7,
        max_tokens: 300,
        top_p: 1,
        frequency_penalty: 0.2,
        presence_penalty: 0.6,
      });

      const generatedText = response.choices[0]?.message?.content || 
        "I'm afraid I cannot respond at the moment. Let us speak again later.";
      
      return res.status(200).json({ text: generatedText });
    } catch (openaiError) {
      try {
        const fallbackResponse = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: completeMessages,
          temperature: 0.7,
          max_tokens: 300,
          top_p: 1,
          frequency_penalty: 0.2,
          presence_penalty: 0.6,
        });

        const fallbackText = fallbackResponse.choices[0]?.message?.content || 
          "I'm afraid I cannot respond at the moment. Let us speak again later.";
        
        return res.status(200).json({ text: fallbackText });
      } catch (fallbackError) {
        throw new Error(`OpenAI API error: ${(openaiError as Error).message}`);
      }
    }
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}
