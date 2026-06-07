import { Router, Request, Response } from 'express';
import { getDb } from '../db/connection';
import { v4 as uuid } from 'uuid';

const router = Router();

// Create or update patient profile
router.post('/', (req: Request, res: Response) => {
  const db = getDb();
  const { name, age, gender, ethnicity, smoking, drinking, guardian_name, guardian_contact, consent_given, consent_share_hospital } = req.body;

  if (!name || !age || !gender) {
    res.status(400).json({ error: 'name, age, and gender are required' });
    return;
  }

  const id = uuid();
  db.prepare(`
    INSERT INTO patients (id, name, age, gender, ethnicity, smoking, drinking, guardian_name, guardian_contact, consent_given, consent_share_hospital)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, name, age, gender, ethnicity || null, smoking || null, drinking || null, guardian_name || null, guardian_contact || null, consent_given ? 1 : 0, consent_share_hospital ? 1 : 0);

  const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
  res.status(201).json(patient);
});

// Get patient by ID
router.get('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
  if (!patient) {
    res.status(404).json({ error: 'Patient not found' });
    return;
  }
  res.json(patient);
});

// Get all patients
router.get('/', (_req: Request, res: Response) => {
  const db = getDb();
  const patients = db.prepare('SELECT * FROM patients ORDER BY created_at DESC').all();
  res.json(patients);
});

// Update patient profile
router.put('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const { name, age, gender, ethnicity, smoking, drinking, guardian_name, guardian_contact, consent_given, consent_share_hospital } = req.body;

  const existing = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Patient not found' });
    return;
  }

  db.prepare(`
    UPDATE patients SET
      name = ?, age = ?, gender = ?, ethnicity = ?, smoking = ?, drinking = ?,
      guardian_name = ?, guardian_contact = ?, consent_given = ?, consent_share_hospital = ?,
      updated_at = datetime('now')
    WHERE id = ?
  `).run(
    name ?? (existing as any).name,
    age ?? (existing as any).age,
    gender ?? (existing as any).gender,
    ethnicity ?? (existing as any).ethnicity,
    smoking ?? (existing as any).smoking,
    drinking ?? (existing as any).drinking,
    guardian_name ?? (existing as any).guardian_name,
    guardian_contact ?? (existing as any).guardian_contact,
    consent_given !== undefined ? (consent_given ? 1 : 0) : (existing as any).consent_given,
    consent_share_hospital !== undefined ? (consent_share_hospital ? 1 : 0) : (existing as any).consent_share_hospital,
    req.params.id
  );

  const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
  res.json(patient);
});

export default router;
