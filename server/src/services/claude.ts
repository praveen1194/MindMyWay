import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const MODEL = 'claude-sonnet-4-6';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function chatWithAssistant(
  message: string,
  history: ChatMessage[],
  checkinContext?: any
): Promise<string> {
  const contextBlock = checkinContext
    ? `\n\n[Context: Today's check-in - Mood: ${checkinContext.mood}/5, Energy: ${checkinContext.energy}/5, Stress: ${checkinContext.stress}/5, Sleep: ${checkinContext.sleep_hours}hrs, Interest: ${checkinContext.interest}/5${checkinContext.symptoms ? `, Symptoms: ${checkinContext.symptoms.join(', ')}` : ''}${checkinContext.stress_sources ? `, Stress sources: ${checkinContext.stress_sources.join(', ')}` : ''}]`
    : '';

  const systemPrompt = `You are a compassionate mental health support assistant for the Mind My Way app. Your role is to listen, ask gentle follow-up questions, and help the user reflect on their emotional state. You are NOT a therapist or clinician.

Guidelines:
- Be warm, non-judgmental, and concise (2-3 sentences max unless the user needs more)
- Ask one question at a time to avoid overwhelming the user
- If the user expresses severe distress or suicidal thoughts, encourage them to contact emergency services (UK: 111, Samaritans: 116 123)
- Do not diagnose, prescribe, or give medical advice
- Use the provided check-in context to make the conversation relevant
- Suggest brief micro-interventions when appropriate (e.g., "Would you like to try a 30-second breathing exercise?" or "Here's a quick grounding technique: name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste.")
- When suggesting breathing exercises, offer specific techniques: box breathing (breathe in 4 counts, hold 4, out 4, hold 4), 4-7-8 breathing (in 4, hold 7, out 8), or diaphragmatic breathing
- For mindfulness, suggest brief exercises like a body scan or breath awareness (2-5 mins)
- All personal identifiers have been replaced with [PATIENT], [AGE], [GENDER], [GUARDIAN] — use these placeholders in your response`;

  const messages: Anthropic.MessageParam[] = history.map(h => ({
    role: h.role,
    content: h.content,
  }));

  messages.push({
    role: 'user',
    content: message + contextBlock,
  });

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 512,
    system: systemPrompt,
    messages,
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}

export async function generateWeeklyReflection(checkins: any[], journals: any[]): Promise<any> {
  const systemPrompt = `You are a data analyst for a mental health app. Based on the patient's check-in data and journal entries from the past week, generate a brief weekly reflection.

Your response must be a valid JSON object with these exact fields:
- "summary": A 2-3 sentence overview of the week's patterns
- "insight": One specific, data-backed insight (e.g., "On days when you slept 7+ hours, your mood was 35% higher")
- "energyBoosters": Array of 1-3 strings describing things that correlated with higher energy
- "stressTriggers": Array of 1-3 strings describing common stress sources from the data
- "suggestion": One gentle, actionable suggestion for the coming week

Be factual and specific. Reference numbers from the data. Never diagnose. Return ONLY valid JSON, no markdown.`;

  const checkinSummary = checkins.map((c: any) =>
    `${c.date}: mood=${c.mood}, energy=${c.energy}, stress=${c.stress}, sleep=${c.sleep_hours}hrs, interest=${c.interest}`
  ).join('\n');

  const journalSummary = journals.map((j: any) =>
    `${j.date}: sources=${j.stress_sources}, text=${(j.entry_text || '').substring(0, 100)}`
  ).join('\n');

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 800,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: `Check-in data:\n${checkinSummary}\n\nJournal entries:\n${journalSummary}\n\nGenerate the weekly reflection JSON.`
    }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
  try {
    return JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
  } catch {
    return { summary: text, insight: '', energyBoosters: [], stressTriggers: [], suggestion: '' };
  }
}

export async function generateThematicAnalysis(journals: any[], checkins: any[]): Promise<any> {
  const systemPrompt = `You are a clinical AI assistant analyzing a patient's reflective journal entries from the past 2 weeks. Identify recurring themes, emotional patterns, and potential areas of concern.

Your response must be a valid JSON object with these exact fields:
- "themes": Array of objects with {name, description, frequency} (3-5 themes)
- "emotional_trajectory": One of "improving", "stable", "declining", or "fluctuating"
- "concern_areas": Array of strings noting anything the clinician should review
- "protective_factors": Array of strings describing positive elements the patient mentions
- "summary": A professional 3-4 sentence clinical summary

Use clinical language appropriate for a healthcare professional. Do NOT include any patient-identifying information. Return ONLY valid JSON, no markdown.`;

  const journalTexts = journals.map((j: any) =>
    `${j.date}: ${(j.entry_text || 'No entry').substring(0, 200)}`
  ).join('\n');

  const checkinSummary = checkins.map((c: any) =>
    `${c.date}: mood=${c.mood}, stress=${c.stress}, energy=${c.energy}`
  ).join('\n');

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: `Journal entries:\n${journalTexts}\n\nCheck-in context:\n${checkinSummary}\n\nGenerate the thematic analysis JSON.`
    }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
  try {
    return JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
  } catch {
    return { themes: [], emotional_trajectory: 'stable', concern_areas: [], protective_factors: [], summary: text };
  }
}

export async function generateAiParagraph(
  daysSinceJoin: number,
  reflectionCount: number,
  checkinStreak: number
): Promise<string> {
  const systemPrompt = `Generate a warm, personalized 2-3 sentence paragraph for a mental health app dashboard. Keep it under 60 words. End with a gentle question to encourage today's check-in. Return only the paragraph text, no JSON, no markdown.`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 150,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: `Days since joining: ${daysSinceJoin}. Reflections written: ${reflectionCount}. Check-in streak: ${checkinStreak} days.`
    }],
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}
