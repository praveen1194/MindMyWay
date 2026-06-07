import { Router, Request, Response } from 'express';
import { getDb } from '../db/connection';

const router = Router();

// Get dashboard data for a patient (2-week aggregation)
router.get('/:patientId', (req: Request, res: Response) => {
  const db = getDb();
  const patientId = req.params.patientId;

  // Get check-ins for last 14 days
  const checkins = db.prepare(`
    SELECT * FROM checkins
    WHERE patient_id = ? AND date >= date('now', '-14 days')
    ORDER BY date ASC
  `).all(patientId);

  // Get symptom frequency over 14 days
  const symptomFrequency = db.prepare(`
    SELECT symptom, COUNT(*) as frequency
    FROM symptoms
    WHERE patient_id = ? AND present = 1 AND date >= date('now', '-14 days')
    GROUP BY symptom
    ORDER BY frequency DESC
  `).all(patientId);

  // Get journals for 14 days
  const journals = db.prepare(`
    SELECT * FROM journals
    WHERE patient_id = ? AND date >= date('now', '-14 days')
    ORDER BY date ASC
  `).all(patientId);

  // Get AI insights
  const insights = db.prepare(`
    SELECT * FROM ai_insights
    WHERE patient_id = ?
    ORDER BY created_at DESC
  `).all(patientId);

  // Get latest risk assessment
  const riskAssessment = db.prepare(`
    SELECT * FROM risk_assessments
    WHERE patient_id = ?
    ORDER BY created_at DESC
    LIMIT 1
  `).get(patientId);

  // Get patient info
  const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(patientId);

  // Get pending questionnaires count
  const pendingQuestionnaires = db.prepare(`
    SELECT COUNT(*) as count FROM questionnaires
    WHERE patient_id = ? AND status = 'pending'
  `).get(patientId) as { count: number };

  // Derived data: stress source frequency
  const stressSourceCounts: Record<string, number> = {};
  for (const j of journals as any[]) {
    try {
      const sources = JSON.parse(j.stress_sources || '[]');
      for (const s of sources) {
        stressSourceCounts[s] = (stressSourceCounts[s] || 0) + 1;
      }
    } catch {}
  }

  // Derived: energy boosters (days where mood > 3 and interest > 3)
  const goodDays = (checkins as any[]).filter((c: any) => c.mood >= 3 && c.interest >= 3);
  const goodDaySources: string[] = [];
  for (const gd of goodDays) {
    const journal = (journals as any[]).find((j: any) => j.date === gd.date);
    if (journal) {
      try {
        const sources = JSON.parse((journal as any).stress_sources || '[]');
        goodDaySources.push(...sources);
      } catch {}
    }
  }

  res.json({
    patient,
    checkins,
    symptomFrequency,
    journals,
    insights,
    riskAssessment,
    pendingQuestionnaires: pendingQuestionnaires.count,
    stressSourceCounts,
    goodDaySources: [...new Set(goodDaySources)],
  });
});

export default router;
