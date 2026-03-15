/**
 * API endpoint to generate a Reading Plan using AI
 * POST /api/generate-reading-plan
 * 
 * Body: {
 *   subject: string,    // Required: Subject for the plan (e.g., "Prayer")
 *   duration: number    // Required: Number of days (3, 5, 7, 14, 21, or 30)
 * }
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = {}; }
    }

    const { subject, duration } = body;

    if (!subject || typeof subject !== 'string' || subject.trim().length < 2) {
      return res.status(400).json({ error: 'Subject is required (at least 2 characters)' });
    }

    const validDurations = [3, 5, 7, 14, 21, 30];
    const parsedDuration = parseInt(duration);
    if (!validDurations.includes(parsedDuration)) {
      return res.status(400).json({ error: `Duration must be one of: ${validDurations.join(', ')}` });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const systemPrompt = `You are an expert Bible reading plan designer. Create thoughtful, spiritually enriching reading plans that guide believers through Scripture on a specific topic.

Your reading plans should:
- Include carefully selected Scripture passages that build understanding of the topic
- Progress from foundational passages to deeper exploration
- Include brief context to help readers understand each day's reading
- Provide reflection questions that encourage personal application
- Balance Old and New Testament passages when appropriate
- Keep daily readings manageable (typically 1-3 chapters or a focused passage)`;

    const userPrompt = `Create a ${parsedDuration}-day Bible reading plan on the subject: "${subject.trim()}"

Return a JSON object with this exact structure:
{
  "title": "Plan title - compelling and descriptive",
  "description": "2-3 sentence description of what readers will discover",
  "slug": "url-friendly-slug-for-the-plan",
  "days": [
    {
      "dayNumber": 1,
      "title": "Day title - brief theme for this day",
      "scriptureRef": "Book Chapter:Verses (e.g., 'Psalm 23:1-6' or 'Matthew 6:5-15')",
      "context": "2-3 sentences providing background and explaining why this passage matters for the topic",
      "reflectionPrompts": [
        "Question 1 for personal reflection",
        "Question 2 for deeper thinking"
      ]
    }
  ]
}

Guidelines:
- Day 1 should introduce the topic with a foundational passage
- Middle days should explore various aspects and build depth
- The final day should bring together key themes and point toward application
- Each day's context should connect the passage to the overall topic
- Include 2-3 reflection prompts per day
- Scripture references should be specific (include verse numbers)`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: parsedDuration <= 7 ? 3000 : 6000,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', errorData);
      return res.status(500).json({ error: 'Failed to generate reading plan', details: errorData });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ error: 'No content returned from AI' });
    }

    let plan;
    try {
      plan = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      return res.status(500).json({ error: 'Failed to parse AI response', raw: content });
    }

    // Validate the structure
    if (!plan.title || !plan.days || !Array.isArray(plan.days)) {
      return res.status(500).json({ error: 'Invalid plan structure returned', plan });
    }

    if (plan.days.length !== parsedDuration) {
      console.warn(`Expected ${parsedDuration} days but got ${plan.days.length}`);
    }

    return res.status(200).json({ 
      success: true, 
      plan,
      meta: {
        subject: subject.trim(),
        duration: parsedDuration,
        actualDays: plan.days.length,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (err) {
    console.error('Error generating reading plan:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}
