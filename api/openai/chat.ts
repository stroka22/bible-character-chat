type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

type RequestBody = {
  characterName: string;
  characterPersona: string;
  messages: Message[];
};

// Vercel directive – ensure we run in a full Node.js environment (not Edge)
// Node 18 is Vercel’s default stable runtime; stay on that for widest support.
export const config = { runtime: 'nodejs18.x' };

export default async function handler(
  req: any,
  res: any
) {
  if (req.method !== 'POST') {
    // simple health-check
    if (req.method === 'GET' || req.method === 'HEAD') {
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // ---------------------------------------------------------------------
    // Robust body parsing – Vercel may give us a string / Buffer
    // ---------------------------------------------------------------------
    let bodyRaw: any = req.body;
    // Vercel sometimes passes a JSON string instead of an object
    if (typeof bodyRaw === 'string') {
      try {
        bodyRaw = JSON.parse(bodyRaw || '{}');
      } catch {
        bodyRaw = {};
      }
    } else if (bodyRaw == null) {
      bodyRaw = {};
    }
    // Coerce non-plain objects (e.g. Array, Number) to empty object
    if (Object.prototype.toString.call(bodyRaw) !== '[object Object]') {
      bodyRaw = {};
    }

    const { characterName, characterPersona, messages } =
      bodyRaw as RequestBody;

    // ---------------------------------------------------------------------
    // Validate required fields
    // ---------------------------------------------------------------------
    if (
      !characterName ||
      !characterPersona ||
      !Array.isArray(messages)
    ) {
      return res
        .status(400)
        .json({ error: 'Missing characterName, characterPersona or messages' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const systemMessage: Message = {
      role: 'system',
      content: `You are ${characterName}, ${characterPersona}. 
      Respond to the user's messages in first person, as if you are truly ${characterName}.
      Draw from biblical knowledge, historical context, and the character's known personality traits.
      Keep responses concise (under 150 words) but meaningful and in the authentic voice of ${characterName}.
      Never break character or refer to yourself as an AI.`
    };

    const completeMessages = [systemMessage, ...messages];

    // Helper to call OpenAI Chat Completions with native fetch
    async function callOpenAI(model: string): Promise<string | null> {
      try {
        const resp = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: completeMessages,
            temperature: 0.7,
            max_tokens: 300,
            top_p: 1,
            frequency_penalty: 0.2,
            presence_penalty: 0.6,
          }),
        });

        if (!resp.ok) {
          const txt = await resp.text();
          throw new Error(
            `OpenAI ${resp.status}: ${txt.slice(0, 300)}`
          );
        }

        const data: any = await resp.json();
        return data?.choices?.[0]?.message?.content ?? null;
      } catch (err) {
        console.error('[OpenAI Proxy] fetch error:', err);
        return null;
      }
    }

    // Try preferred model first, then fallback
    let generatedText = await callOpenAI('gpt-4o-mini');
    if (!generatedText) {
      generatedText = await callOpenAI('gpt-4');
    }

    if (!generatedText) {
      throw new Error('Failed to generate response from OpenAI');
    }

    return res.status(200).json({ text: generatedText });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}
