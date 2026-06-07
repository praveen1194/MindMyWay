import { Router, Request, Response } from 'express';
import { assessRisk, updateConsentReferral } from '../services/riskAssessment';

const router = Router();

// Assess risk for a patient
router.post('/assess/:patientId', (req: Request, res: Response) => {
  try {
    const result = assessRisk(req.params.patientId as string);
    res.json(result);
  } catch (error: any) {
    console.error('Risk assessment error:', error);
    res.status(500).json({ error: 'Failed to assess risk', details: error.message });
  }
});

// Update consent and referral
router.post('/consent', (req: Request, res: Response) => {
  const { patient_id, consent_share } = req.body;
  if (!patient_id || consent_share === undefined) {
    res.status(400).json({ error: 'patient_id and consent_share are required' });
    return;
  }
  try {
    const result = updateConsentReferral(patient_id, consent_share);
    res.json(result);
  } catch (error: any) {
    console.error('Consent update error:', error);
    res.status(500).json({ error: 'Failed to update consent', details: error.message });
  }
});

export default router;
