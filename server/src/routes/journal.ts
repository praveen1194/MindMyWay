import { Router, Request, Response } from 'express';
import { getDb } from '../db/connection';
import { v4 as uuid } from 'uuid';

const router = Router();

// Save daily check-in
router.post('/checkin', (req: Request, res: Response) => {
  const db = getDb();
  const { patient_id, date, mood, energy, stress, sleep_hours, appetite, interest } = req.body;

  if (!patient_id || !date) {
    res.status(400).json({ error: 'patient_id and date are required' });
    return;
  }

  const id = uuid();
  db.prepare(`
    INSERT OR REPLACE INTO checkins (id, patient_id, date, mood, energy, stress, sleep_hours, appetite, interest)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, patient_id, date, mood, energy, stress, sleep_hours, appetite, interest);

  const checkin = db.prepare('SELECT * FROM checkins WHERE patient_id = ? AND date = ?').get(patient_id, date);
  res.status(201).json(checkin);
});

// Save symptoms for a day
router.post('/symptoms', (req: Request, res: Response) => {
  const db = getDb();
  const { patient_id, date, symptoms } = req.body;

  if (!patient_id || !date || !Array.isArray(symptoms)) {
    res.status(400).json({ error: 'patient_id, date, and symptoms array are required' });
    return;
  }

  // Delete existing symptoms for this day, then insert new ones
  db.prepare('DELETE FROM symptoms WHERE patient_id = ? AND date = ?').run(patient_id, date);

  const insert = db.prepare(`
    INSERT INTO symptoms (id, patient_id, date, symptom, present)
    VALUES (?, ?, ?, ?, 1)
  `);

  for (const symptom of symptoms) {
    insert.run(uuid(), patient_id, date, symptom);
  }

  const saved = db.prepare('SELECT * FROM symptoms WHERE patient_id = ? AND date = ?').all(patient_id, date);
  res.status(201).json(saved);
});

// Save journal entry
router.post('/entry', (req: Request, res: Response) => {
  const db = getDb();
  const { patient_id, date, stress_sources, entry_text, audio_transcript } = req.body;

  if (!patient_id || !date) {
    res.status(400).json({ error: 'patient_id and date are required' });
    return;
  }

  const id = uuid();
  db.prepare(`
    INSERT OR REPLACE INTO journals (id, patient_id, date, stress_sources, entry_text, audio_transcript)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, patient_id, date, JSON.stringify(stress_sources || []), entry_text || null, audio_transcript || null);

  const journal = db.prepare('SELECT * FROM journals WHERE patient_id = ? AND date = ?').get(patient_id, date);
  res.status(201).json(journal);
});

// Get journal data for a date
router.get('/:patientId/:date', (req: Request, res: Response) => {
  const db = getDb();
  const { patientId, date } = req.params;

  const checkin = db.prepare('SELECT * FROM checkins WHERE patient_id = ? AND date = ?').get(patientId, date);
  const symptoms = db.prepare('SELECT * FROM symptoms WHERE patient_id = ? AND date = ? AND present = 1').all(patientId, date);
  const journal = db.prepare('SELECT * FROM journals WHERE patient_id = ? AND date = ?').get(patientId, date);

  res.json({ checkin, symptoms, journal });
});

// Get all journal dates for a patient
router.get('/:patientId', (req: Request, res: Response) => {
  const db = getDb();
  const dates = db.prepare('SELECT DISTINCT date FROM checkins WHERE patient_id = ? ORDER BY date DESC').all(req.params.patientId);
  res.json(dates);
});

export default router;
