/**
 * API endpoint to generate a Bible Study using AI
 * POST /api/generate-bible-study
 * 
 * Body: {
 *   topic: string,           // Required: Topic for the study (e.g., "Forgiveness")
 *   lessonCount: number,     // Optional: Number of lessons (5-12, default 8)
 *   characterIds: string[],  // Optional: Specific character IDs to use
 *   autoSelectCharacters: boolean // Optional: Let AI choose characters (default true if no characterIds)
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

    const { topic, lessonCount = 8, characterIds = [], autoSelectCharacters = true } = body;

    if (!topic || typeof topic !== 'string' || topic.trim().length < 2) {
      return res.status(400).json({ error: 'Topic is required (at least 2 characters)' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const clampedLessonCount = Math.min(12, Math.max(5, parseInt(lessonCount) || 8));

    // Build the prompt for generating the study
    const systemPrompt = `You are an expert Bible study curriculum designer. Create comprehensive, theologically sound Bible studies that help believers grow in their faith.

Your studies should:
- Be grounded in Scripture with multiple relevant references per lesson
- Include practical application and reflection
- Be suitable for small group or individual study
- Progress logically from foundational concepts to deeper application
- Include a mix of Old and New Testament references when appropriate

When selecting Bible characters as lesson guides:
- Choose characters whose life experiences relate directly to the lesson topic
- Consider both major and minor biblical figures
- Ensure the character can speak authentically about the lesson's theme
- Vary the characters across lessons for diverse perspectives`;

    const characterInstruction = characterIds.length > 0
      ? `Use these specific character IDs for the lessons (distribute them across lessons as appropriate): ${characterIds.join(', ')}`
      : `Select appropriate Bible characters for each lesson. Choose characters whose biblical stories and experiences directly relate to each lesson's specific topic. For example:
- Noah for topics about faith, obedience, or judgment
- David for worship, repentance, or leadership
- Peter for transformation, failure and restoration, or boldness
- Paul for grace, perseverance, or doctrine
- Ruth for loyalty, providence, or redemption
- Job for suffering, faith in trials, or God's sovereignty
- Mary Magdalene for devotion, transformation, or witnessing
- Solomon for wisdom, choices, or consequences
Return character names (not IDs) - they will be matched to database records.`;

    const userPrompt = `Create a Bible study on the topic: "${topic.trim()}"

Requirements:
- Create exactly ${clampedLessonCount} lessons (including an introduction as lesson 0)
- ${characterInstruction}

Return a JSON object with this exact structure:
{
  "title": "Study title - should be compelling and descriptive",
  "description": "2-3 sentence description of what participants will learn",
  "subject": "Brief subject line (under 100 characters)",
  "themeScripture": "One key verse that captures the study's theme (e.g., 'John 3:16')",
  "characterInstructions": "Instructions for how characters should approach this study (tone, focus areas, pastoral approach)",
  "lessons": [
    {
      "orderIndex": 0,
      "title": "Lesson title",
      "summary": "2-3 sentence summary of what this lesson covers",
      "scriptureRefs": ["Reference 1", "Reference 2", "Reference 3"],
      "characterName": "Character Name",
      "prompts": [
        "Instruction for the character on how to lead this lesson",
        "Key point to emphasize",
        "Discussion question or reflection prompt",
        "Subject: Brief topic descriptor"
      ]
    }
  ]
}

Make the first lesson (orderIndex 0) an introduction that sets the foundation for the study.
Each lesson should build on previous lessons and lead to practical application.
Include 3-5 scripture references per lesson.
Include 3-5 prompts per lesson.`;

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
        max_tokens: 4000,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', errorData);
      return res.status(500).json({ error: 'Failed to generate study', details: errorData });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ error: 'No content returned from AI' });
    }

    let study;
    try {
      study = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      return res.status(500).json({ error: 'Failed to parse AI response', raw: content });
    }

    // Validate the structure
    if (!study.title || !study.lessons || !Array.isArray(study.lessons)) {
      return res.status(500).json({ error: 'Invalid study structure returned', study });
    }

    return res.status(200).json({ 
      success: true, 
      study,
      meta: {
        topic: topic.trim(),
        lessonCount: study.lessons.length,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (err) {
    console.error('Error generating Bible study:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}
