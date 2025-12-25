export default async function handler(req, res) {
  if (req.method !== 'POST') {
    if (req.method === 'GET' || req.method === 'HEAD') {
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let bodyRaw = req.body;
    if (typeof bodyRaw === 'string') {
      try { bodyRaw = JSON.parse(bodyRaw || '{}'); } catch { bodyRaw = {}; }
    } else if (bodyRaw == null) {
      bodyRaw = {};
    }
    if (Object.prototype.toString.call(bodyRaw) !== '[object Object]') {
      bodyRaw = {};
    }

    const { characterName, characterPersona, messages } = bodyRaw;
    if (!characterName || !characterPersona || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Missing characterName, characterPersona or messages' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    // Check if messages already contain a system message (e.g., study/lesson context)
    const hasStudyContext = messages.some(m => m.role === 'system');
    
    // Build character system message
    let characterSystemContent = `You are ${characterName}, ${characterPersona}.
      Respond to the user's messages in first person, as if you are truly ${characterName}.
      Draw from biblical knowledge, historical context, and the character's known personality traits.
      Keep responses concise but meaningful and in the authentic voice of ${characterName}.
      Never break character or refer to yourself as an AI.`;
    
    // If there's a study context, merge it with the character instructions
    // The study context should take priority for guiding the conversation
    let completeMessages;
    if (hasStudyContext) {
      const studySystemMsg = messages.find(m => m.role === 'system');
      const otherMessages = messages.filter(m => m.role !== 'system');
      
      // Combine: character identity + study instructions (study instructions come last for priority)
      const combinedSystemContent = `${characterSystemContent}\n\n--- IMPORTANT INSTRUCTIONS FOR THIS SESSION ---\n\n${studySystemMsg.content}\n\nFollow the above instructions carefully. They define how you should conduct this specific conversation.`;
      
      completeMessages = [
        { role: 'system', content: combinedSystemContent },
        ...otherMessages
      ];
    } else {
      const systemMessage = { role: 'system', content: characterSystemContent };
      completeMessages = [systemMessage, ...messages];
    }

    async function callOpenAI(model) {
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
          throw new Error(`OpenAI ${resp.status}: ${txt.slice(0, 300)}`);
        }
        const data = await resp.json();
        return (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || null;
      } catch (err) {
        console.error('[OpenAI Proxy] fetch error:', err);
        return null;
      }
    }

    let generatedText = await callOpenAI('gpt-4o-mini');
    if (!generatedText) generatedText = await callOpenAI('gpt-4o');
    if (!generatedText) generatedText = await callOpenAI('gpt-4');

    if (!generatedText) {
      return res.status(502).json({ error: 'Failed to generate response from OpenAI' });
    }

    return res.status(200).json({ text: generatedText });
  } catch (error) {
    return res.status(500).json({ error: (error && error.message) || String(error) });
  }
}
