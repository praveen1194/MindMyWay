import { Router, Request, Response } from 'express';
import { getDb } from '../db/connection';
import { v4 as uuid } from 'uuid';

const router = Router();

// Send a questionnaire to a patient
router.post('/send', (req: Request, res: Response) => {
  const db = getDb();
  const { patient_id, type } = req.body;

  if (!patient_id || !type) {
    res.status(400).json({ error: 'patient_id and type are required' });
    return;
  }

  const validTypes = ['PHQ-9', 'PCL-5', 'ASRS', 'OCI-R', 'PQ-B', 'SAPAS'];
  if (!validTypes.includes(type)) {
    res.status(400).json({ error: `Invalid questionnaire type. Valid: ${validTypes.join(', ')}` });
    return;
  }

  const id = uuid();
  db.prepare(`
    INSERT INTO questionnaires (id, patient_id, type, status)
    VALUES (?, ?, ?, 'pending')
  `).run(id, patient_id, type);

  const questionnaire = db.prepare('SELECT * FROM questionnaires WHERE id = ?').get(id);
  res.status(201).json(questionnaire);
});

// Get pending questionnaires for a patient
router.get('/pending/:patientId', (req: Request, res: Response) => {
  const db = getDb();
  const questionnaires = db.prepare(`
    SELECT * FROM questionnaires
    WHERE patient_id = ? AND status = 'pending'
    ORDER BY sent_at DESC
  `).all(req.params.patientId);

  res.json(questionnaires);
});

// Get all questionnaires for a patient
router.get('/:patientId', (req: Request, res: Response) => {
  const db = getDb();
  const questionnaires = db.prepare(`
    SELECT * FROM questionnaires
    WHERE patient_id = ?
    ORDER BY sent_at DESC
  `).all(req.params.patientId);

  res.json(questionnaires);
});

// Complete a questionnaire
router.post('/complete/:id', (req: Request, res: Response) => {
  const db = getDb();
  const { responses } = req.body;

  const existing = db.prepare('SELECT * FROM questionnaires WHERE id = ?').get(req.params.id) as any;
  if (!existing) {
    res.status(404).json({ error: 'Questionnaire not found' });
    return;
  }

  db.prepare(`
    UPDATE questionnaires SET status = 'completed', completed_at = datetime('now'), responses = ?
    WHERE id = ?
  `).run(JSON.stringify(responses || {}), req.params.id);

  const updated = db.prepare('SELECT * FROM questionnaires WHERE id = ?').get(req.params.id);
  res.json(updated);
});

export default router;
