import { Router, Request, Response } from 'express';
import { getDb } from '../db/connection';
import { v4 as uuid } from 'uuid';

const router = Router();

// Get all patients with summary info for clinician view
router.get('/patients', (_req: Request, res: Response) => {
  const db = getDb();

  const patients = db.prepare('SELECT * FROM patients ORDER BY created_at DESC').all() as any[];

  const enriched = patients.map(p => {
    const latestCheckin = db.prepare(`
      SELECT * FROM checkins WHERE patient_id = ? ORDER BY date DESC LIMIT 1
    `).get(p.id) as any;

    const riskAssessment = db.prepare(`
      SELECT * FROM risk_assessments WHERE patient_id = ? ORDER BY created_at DESC LIMIT 1
    `).get(p.id) as any;

    const pendingQ = db.prepare(`
      SELECT COUNT(*) as count FROM questionnaires WHERE patient_id = ? AND status = 'pending'
    `).get(p.id) as { count: number };

    const completedQ = db.prepare(`
      SELECT COUNT(*) as count FROM questionnaires WHERE patient_id = ? AND status = 'completed'
    `).get(p.id) as { count: number };

    return {
      ...p,
      latestMood: latestCheckin?.mood ?? null,
      latestDate: latestCheckin?.date ?? null,
      highRisk: riskAssessment?.high_risk === 1,
      referralSent: riskAssessment?.referral_sent === 1,
      consentShare: p.consent_share_hospital === 1,
      pendingQuestionnaires: pendingQ.count,
      completedQuestionnaires: completedQ.count,
    };
  });

  res.json(enriched);
});

// Get detailed clinician view for a specific patient
router.get('/patient/:patientId', (req: Request, res: Response) => {
  const db = getDb();
  const patientId = req.params.patientId;

  const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(patientId);
  if (!patient) {
    res.status(404).json({ error: 'Patient not found' });
    return;
  }

  const checkins = db.prepare(`
    SELECT * FROM checkins WHERE patient_id = ? AND date >= date('now', '-14 days') ORDER BY date ASC
  `).all(patientId);

  const symptomFrequency = db.prepare(`
    SELECT symptom, COUNT(*) as frequency FROM symptoms
    WHERE patient_id = ? AND present = 1 AND date >= date('now', '-14 days')
    GROUP BY symptom ORDER BY frequency DESC
  `).all(patientId);

  const journals = db.prepare(`
    SELECT * FROM journals WHERE patient_id = ? AND date >= date('now', '-14 days') ORDER BY date ASC
  `).all(patientId);

  const thematicInsight = db.prepare(`
    SELECT * FROM ai_insights WHERE patient_id = ? AND type = 'thematic' ORDER BY created_at DESC LIMIT 1
  `).get(patientId);

  const riskAssessment = db.prepare(`
    SELECT * FROM risk_assessments WHERE patient_id = ? ORDER BY created_at DESC LIMIT 1
  `).get(patientId);

  const clinicianNotes = db.prepare(`
    SELECT * FROM clinician_notes WHERE patient_id = ? ORDER BY created_at DESC
  `).all(patientId);

  const conditionChecks = db.prepare(`
    SELECT * FROM condition_checks WHERE patient_id = ?
  `).all(patientId);

  const questionnaires = db.prepare(`
    SELECT * FROM questionnaires WHERE patient_id = ? ORDER BY sent_at DESC
  `).all(patientId);

  res.json({
    patient,
    checkins,
    symptomFrequency,
    journals,
    thematicInsight,
    riskAssessment,
    clinicianNotes,
    conditionChecks,
    questionnaires,
  });
});

// Save clinician notes
router.post('/notes', (req: Request, res: Response) => {
  const db = getDb();
  const { patient_id, note_text } = req.body;

  if (!patient_id || !note_text) {
    res.status(400).json({ error: 'patient_id and note_text are required' });
    return;
  }

  const id = uuid();
  db.prepare('INSERT INTO clinician_notes (id, patient_id, note_text) VALUES (?, ?, ?)').run(id, patient_id, note_text);

  res.status(201).json({ id, patient_id, note_text });
});

// Update condition checkboxes
router.post('/conditions', (req: Request, res: Response) => {
  const db = getDb();
  const { patient_id, conditions } = req.body;

  if (!patient_id || !Array.isArray(conditions)) {
    res.status(400).json({ error: 'patient_id and conditions array are required' });
    return;
  }

  for (const c of conditions) {
    db.prepare(`
      INSERT INTO condition_checks (id, patient_id, condition_name, checked, notes)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(patient_id, condition_name) DO UPDATE SET
        checked = excluded.checked, notes = excluded.notes, updated_at = datetime('now')
    `).run(uuid(), patient_id, c.condition_name, c.checked ? 1 : 0, c.notes || null);
  }

  const saved = db.prepare('SELECT * FROM condition_checks WHERE patient_id = ?').all(patient_id);
  res.json(saved);
});

export default router;
