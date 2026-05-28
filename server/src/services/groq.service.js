import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function analyseWithGroq(content) {
  if (!process.env.GROQ_API_KEY) {
    console.error('[Groq] GROQ_API_KEY is not set in environment');
    throw new Error('Groq API key not configured');
  }

  const prompt = `You are a thoughtful life coach and psychologist. Analyse this journal entry and provide insights in exactly this JSON format with no extra text:

{
  "reflection": "2-3 sentences of empathetic reflection on what the person expressed",
  "patterns": "2-3 sentences identifying recurring themes or behavioral patterns",
  "suggestions": "2-3 sentences of actionable, concrete suggestions for tomorrow"
}

Journal entry:
${content}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama3-8b-8192',
      temperature: 0.7,
      max_tokens: 600,
    });

    const raw = completion.choices[0]?.message?.content || '';

    // Strip markdown code fences if present (```json ... ```)
    const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();

    // Extract first JSON object from the text
    const jsonMatch = stripped.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[Groq] No JSON found in response:', raw);
      throw new Error('Invalid response format');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error('[Groq] Analysis error:', err?.message || err);
    throw err;
  }
}
