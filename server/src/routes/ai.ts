import { Router, Request, Response } from 'express';
import { getDb } from '../db/connection';
import { v4 as uuid } from 'uuid';
import { chatWithAssistant, generateWeeklyReflection, generateThematicAnalysis, generateAiParagraph } from '../services/claude';

const router = Router();

// Chat with AI assistant
router.post('/chat', async (req: Request, res: Response) => {
  const { patient_id, message, checkin_context } = req.body;

  if (!patient_id || !message) {
    res.status(400).json({ error: 'patient_id and message are required' });
    return;
  }

  try {
    // Get patient PII for abstraction
    const db = getDb();
    const patient = db.prepare('SELECT name, age, gender, guardian_name FROM patients WHERE id = ?').get(patient_id) as any;

    // Get recent chat history for context (last 10 messages)
    const history = db.prepare(`
      SELECT role, content FROM chat_messages
      WHERE patient_id = ? ORDER BY created_at DESC LIMIT 10
    `).all(patient_id).reverse() as any[];

    // Abstract PII from user message
    let abstractedMessage = message;
    if (patient) {
      abstractedMessage = abstractedMessage
        .replace(new RegExp(`\\b${escapeRegex(patient.name)}\\b`, 'gi'), '[PATIENT]')
        .replace(new RegExp(`\\b${patient.age}\\b`, 'g'), '[AGE]')
        .replace(new RegExp(`\\b${escapeRegex(patient.gender)}\\b`, 'gi'), '[GENDER]');
      if (patient.guardian_name) {
        abstractedMessage = abstractedMessage.replace(new RegExp(`\\b${escapeRegex(patient.guardian_name)}\\b`, 'gi'), '[GUARDIAN]');
      }
    }

    // Abstract PII from chat history (both user and assistant messages)
    const abstractedHistory = history.map((h: any) => ({
      role: h.role,
      content: abstractPii(h.content, patient),
    }));

    // Save user message
    db.prepare('INSERT INTO chat_messages (id, patient_id, role, content) VALUES (?, ?, ?, ?)')
      .run(uuid(), patient_id, 'user', message);

    // Call Claude
    const reply = await chatWithAssistant(abstractedMessage, abstractedHistory, checkin_context);

    // Rehydrate placeholders in Claude's response for display
    const rehydratedReply = rehydratePii(reply, patient);

    // Save assistant message (store with rehydrated version for display)
    db.prepare('INSERT INTO chat_messages (id, patient_id, role, content) VALUES (?, ?, ?, ?)')
      .run(uuid(), patient_id, 'assistant', rehydratedReply);

    res.json({ reply: rehydratedReply });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to get AI response', details: error.message });
  }
});

// Generate weekly reflection
router.post('/reflection', async (req: Request, res: Response) => {
  const { patient_id } = req.body;

  if (!patient_id) {
    res.status(400).json({ error: 'patient_id is required' });
    return;
  }

  try {
    const db = getDb();
    const checkins = db.prepare(`
      SELECT * FROM checkins WHERE patient_id = ? AND date >= date('now', '-7 days') ORDER BY date ASC
    `).all(patient_id);

    const journals = db.prepare(`
      SELECT * FROM journals WHERE patient_id = ? AND date >= date('now', '-7 days') ORDER BY date ASC
    `).all(patient_id);

    const reflection = await generateWeeklyReflection(checkins, journals);

    // Save insight
    db.prepare(`
      INSERT INTO ai_insights (id, patient_id, type, content, period_start, period_end)
      VALUES (?, ?, 'weekly_reflection', ?, date('now', '-7 days'), date('now'))
    `).run(uuid(), patient_id, JSON.stringify(reflection));

    res.json(reflection);
  } catch (error: any) {
    console.error('Reflection error:', error);
    res.status(500).json({ error: 'Failed to generate reflection', details: error.message });
  }
});

// Generate thematic analysis for clinician
router.post('/thematic', async (req: Request, res: Response) => {
  const { patient_id } = req.body;

  if (!patient_id) {
    res.status(400).json({ error: 'patient_id is required' });
    return;
  }

  try {
    const db = getDb();
    const journals = db.prepare(`
      SELECT * FROM journals WHERE patient_id = ? AND date >= date('now', '-14 days') ORDER BY date ASC
    `).all(patient_id);

    const checkins = db.prepare(`
      SELECT * FROM checkins WHERE patient_id = ? AND date >= date('now', '-14 days') ORDER BY date ASC
    `).all(patient_id);

    const analysis = await generateThematicAnalysis(journals, checkins);

    // Save insight
    db.prepare(`
      INSERT INTO ai_insights (id, patient_id, type, content, period_start, period_end)
      VALUES (?, ?, 'thematic', ?, date('now', '-14 days'), date('now'))
    `).run(uuid(), patient_id, JSON.stringify(analysis));

    res.json(analysis);
  } catch (error: any) {
    console.error('Thematic analysis error:', error);
    res.status(500).json({ error: 'Failed to generate analysis', details: error.message });
  }
});

// Generate AI paragraph for dashboard
router.post('/paragraph', async (req: Request, res: Response) => {
  const { patient_id } = req.body;

  if (!patient_id) {
    res.status(400).json({ error: 'patient_id is required' });
    return;
  }

  try {
    const db = getDb();
    const patient = db.prepare('SELECT created_at FROM patients WHERE id = ?').get(patient_id) as any;
    const checkinCount = db.prepare('SELECT COUNT(*) as count FROM checkins WHERE patient_id = ?').get(patient_id) as { count: number };
    const journalCount = db.prepare('SELECT COUNT(*) as count FROM journals WHERE patient_id = ? AND entry_text IS NOT NULL').get(patient_id) as { count: number };

    const daysSinceJoin = patient
      ? Math.max(1, Math.floor((Date.now() - new Date(patient.created_at).getTime()) / 86400000))
      : 1;

    const paragraph = await generateAiParagraph(daysSinceJoin, journalCount.count, checkinCount.count);

    // Save insight
    db.prepare(`
      INSERT INTO ai_insights (id, patient_id, type, content, period_start, period_end)
      VALUES (?, ?, 'ai_paragraph', ?, NULL, NULL)
    `).run(uuid(), patient_id, paragraph);

    res.json({ paragraph });
  } catch (error: any) {
    console.error('AI paragraph error:', error);
    res.status(500).json({ error: 'Failed to generate paragraph', details: error.message });
  }
});

// Helper: abstract PII from text

function abstractPii(text: string, patient: any): string {
  if (!patient) return text;
  let result = text;
  result = result.replace(new RegExp(`\\b${escapeRegex(patient.name)}\\b`, 'gi'), '[PATIENT]');
  result = result.replace(new RegExp(`\\b${patient.age}\\b`, 'g'), '[AGE]');
  result = result.replace(new RegExp(`\\b${escapeRegex(patient.gender)}\\b`, 'gi'), '[GENDER]');
  if (patient.guardian_name) {
    result = result.replace(new RegExp(`\\b${escapeRegex(patient.guardian_name)}\\b`, 'gi'), '[GUARDIAN]');
  }
  return result;
}

function rehydratePii(text: string, patient: any): string {
  if (!patient) return text;
  let result = text;
  result = result.replace(/\[PATIENT\]/g, patient.name || '[PATIENT]');
  result = result.replace(/\[AGE\]/g, String(patient.age || '[AGE]'));
  result = result.replace(/\[GENDER\]/g, patient.gender || '[GENDER]');
  if (patient.guardian_name) {
    result = result.replace(/\[GUARDIAN\]/g, patient.guardian_name || '[GUARDIAN]');
  }
  return result;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default router;
