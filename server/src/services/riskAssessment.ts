import { getDb } from '../db/connection';
import { v4 as uuid } from 'uuid';

export function assessRisk(patientId: string): any {
  const db = getDb();

  // Get last 14 days of data
  const checkins = db.prepare(`
    SELECT * FROM checkins
    WHERE patient_id = ? AND date >= date('now', '-14 days')
    ORDER BY date ASC
  `).all(patientId) as any[];

  if (checkins.length < 7) {
    return { high_risk: false, reason: 'Insufficient data (need at least 7 check-ins)' };
  }

  const symptoms = db.prepare(`
    SELECT * FROM symptoms
    WHERE patient_id = ? AND present = 1 AND date >= date('now', '-14 days')
  `).all(patientId) as any[];

  const journals = db.prepare(`
    SELECT * FROM journals
    WHERE patient_id = ? AND date >= date('now', '-14 days')
  `).all(patientId) as any[];

  const totalDays = checkins.length;

  // Criterion 1: At least one of "depressed_mood" or "loss_of_interest" on most days (>= 8/14 or >= 50%)
  const depressedMoodDays = symptoms.filter(s => s.symptom === 'depressed_mood').length;
  const lossOfInterestDays = symptoms.filter(s => s.symptom === 'loss_of_interest').length;
  const threshold = Math.ceil(totalDays * 0.5);
  const criterion1 = depressedMoodDays >= threshold || lossOfInterestDays >= threshold;

  // Criterion 2: Total core symptoms >= 5 persisting for most days
  const symptomDayCounts: Record<string, number> = {};
  for (const s of symptoms) {
    symptomDayCounts[s.symptom] = (symptomDayCounts[s.symptom] || 0) + 1;
  }
  const persistentSymptoms = Object.values(symptomDayCounts)
    .filter(count => count >= threshold).length;
  const criterion2 = persistentSymptoms >= 5;

  // Criterion 3: Journal/triggers show impaired functioning
  const avgStress = checkins.reduce((sum, c) => sum + c.stress, 0) / totalDays;
  const avgMood = checkins.reduce((sum, c) => sum + c.mood, 0) / totalDays;
  const impairmentKeywords = ['unable to', 'struggling', 'cannot', 'difficult', 'hard to', 'cant', "can't", 'barely', 'hardly'];
  const journalImpairment = journals.some(j =>
    j.entry_text && impairmentKeywords.some(kw =>
      j.entry_text.toLowerCase().includes(kw)
    )
  );
  const criterion3 = (avgStress >= 3.5 && avgMood <= 2) || journalImpairment;

  const highRisk = criterion1 && criterion2 && criterion3;

  // Save assessment
  const today = new Date().toISOString().split('T')[0];
  const id = uuid();
  db.prepare(`
    INSERT OR REPLACE INTO risk_assessments (id, patient_id, date, criterion_1_met, criterion_2_met, criterion_3_met, high_risk, referral_sent)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0)
  `).run(id, patientId, today, criterion1 ? 1 : 0, criterion2 ? 1 : 0, criterion3 ? 1 : 0, highRisk ? 1 : 0);

  return {
    id,
    patient_id: patientId,
    date: today,
    criterion_1_met: criterion1,
    criterion_2_met: criterion2,
    criterion_3_met: criterion3,
    high_risk: highRisk,
    referral_sent: false,
    details: {
      depressed_mood_days: depressedMoodDays,
      loss_of_interest_days: lossOfInterestDays,
      persistent_symptoms_count: persistentSymptoms,
      avg_stress: Math.round(avgStress * 10) / 10,
      avg_mood: Math.round(avgMood * 10) / 10,
      journal_impairment_detected: journalImpairment,
      total_checkin_days: totalDays,
    }
  };
}

export function updateConsentReferral(patientId: string, consentShare: boolean): any {
  const db = getDb();

  // Update patient consent
  db.prepare('UPDATE patients SET consent_share_hospital = ? WHERE id = ?')
    .run(consentShare ? 1 : 0, patientId);

  // If consent given, mark referral as sent on latest risk assessment
  if (consentShare) {
    db.prepare(`
      UPDATE risk_assessments SET referral_sent = 1
      WHERE patient_id = ? AND high_risk = 1
      ORDER BY created_at DESC LIMIT 1
    `).run(patientId);
  }

  return { consent_share_hospital: consentShare, referral_sent: consentShare };
}
