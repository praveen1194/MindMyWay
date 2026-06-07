import { getDb } from './connection';
import { v4 as uuid } from 'uuid';

// Seeded pseudo-random for reproducibility
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function seedData(): void {
  const db = getDb();

  // Check if seed data already exists
  const existing = db.prepare('SELECT COUNT(*) as count FROM patients').get() as { count: number };
  if (existing.count > 0) {
    console.log('Seed data already exists, skipping');
    return;
  }

  const rand = seededRandom(42);

  // Create demo patient
  const patientId = 'demo-patient-001';
  db.prepare(`
    INSERT INTO patients (id, name, age, gender, ethnicity, smoking, drinking, consent_given, consent_share_hospital)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(patientId, 'Alex Thompson', 25, 'Non-binary', 'White British', 'Never', 'Occasional', 1, 0);

  const symptomNames = [
    'depressed_mood',
    'loss_of_interest',
    'weight_change',
    'insomnia_hypersomnia',
    'fatigue',
    'psychomotor',
    'worthlessness_guilt',
    'decreased_concentration',
    'thoughts_of_death',
  ];

  const stressSources = ['Work', 'Studies', 'Family', 'Romantic relationship', 'Friendships', 'Finances', 'Physical health', 'Social situations', 'Other'];

  const journalTemplates = [
    'Had a tough time getting out of bed today. Work felt overwhelming.',
    'Feeling a bit better after talking with a friend at lunch.',
    'Couldnt focus in meetings today. Mind kept wandering to stressful thoughts.',
    'Went for a walk after work which helped clear my head a bit.',
    'Family dinner was tense. Feeling drained afterwards.',
    'Actually enjoyed my morning routine today for a change.',
    'Deadline pressure is getting to me. Hard to switch off.',
    'Tried a breathing exercise before bed - think it helped me sleep better.',
    'Social event today was exhausting but glad I went.',
    'Feeling low most of the day. Struggled to find motivation.',
    'Good conversation with my manager about workload. Feeling heard.',
    'Skipped gym again. Just didnt have the energy.',
    'Weekend helped. Spent time outdoors which was nice.',
    'Mixed day - some good moments but anxiety crept in during the afternoon.',
  ];

  const today = new Date();

  for (let daysAgo = 13; daysAgo >= 0; daysAgo--) {
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    const dateStr = date.toISOString().split('T')[0];
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    // Check-in values — weekday stress higher, mood/energy correlate with sleep
    const baseMood = isWeekend ? 3.5 : 2.5;
    const baseEnergy = isWeekend ? 3.3 : 2.7;
    const baseStress = isWeekend ? 2.2 : 3.6;
    const sleepHours = Math.round((5.5 + rand() * 3.5) * 10) / 10; // 5.5-9.0
    const mood = Math.max(1, Math.min(5, Math.round(baseMood + (sleepHours > 7 ? 0.8 : -0.5) + (rand() - 0.5) * 1.5)));
    const energy = Math.max(1, Math.min(5, Math.round(baseEnergy + (sleepHours > 7 ? 0.6 : -0.4) + (rand() - 0.5) * 1.5)));
    const stress = Math.max(1, Math.min(5, Math.round(baseStress + (rand() - 0.5) * 1.5)));
    const interest = Math.max(1, Math.min(5, Math.round(mood * 0.8 + (rand() - 0.3) * 1.2)));

    const appetites = ['much_lower', 'slightly_lower', 'normal', 'slightly_higher', 'much_higher'];
    const appetiteIdx = stress > 3 ? Math.floor(rand() * 2) : (stress < 2 ? 3 + Math.floor(rand() * 2) : 2);
    const appetite = appetites[Math.min(appetiteIdx, 4)];

    db.prepare(`
      INSERT INTO checkins (id, patient_id, date, mood, energy, stress, sleep_hours, appetite, interest)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(uuid(), patientId, dateStr, mood, energy, stress, sleepHours, appetite, interest);

    // Symptoms — 3-6 per day, depressed_mood and fatigue most frequent
    const symptomCount = 3 + Math.floor(rand() * 4);
    const selectedSymptoms = new Set<string>();
    // Always consider depressed_mood and fatigue (high probability)
    if (rand() < 0.7) selectedSymptoms.add('depressed_mood');
    if (rand() < 0.6) selectedSymptoms.add('fatigue');
    if (mood <= 2 && rand() < 0.5) selectedSymptoms.add('loss_of_interest');
    if (stress >= 4 && rand() < 0.4) selectedSymptoms.add('insomnia_hypersomnia');
    if (rand() < 0.3) selectedSymptoms.add('worthlessness_guilt');
    if (rand() < 0.25) selectedSymptoms.add('decreased_concentration');
    if (rand() < 0.2) selectedSymptoms.add('weight_change');
    if (rand() < 0.15) selectedSymptoms.add('psychomotor');
    // Thoughts of death — very rare (only once in seed data)
    if (daysAgo === 3 && rand() < 0.8) selectedSymptoms.add('thoughts_of_death');

    // Fill up to symptomCount if needed
    while (selectedSymptoms.size < symptomCount) {
      selectedSymptoms.add(symptomNames[Math.floor(rand() * symptomNames.length)]);
    }

    for (const symptom of selectedSymptoms) {
      db.prepare(`
        INSERT OR IGNORE INTO symptoms (id, patient_id, date, symptom, present)
        VALUES (?, ?, ?, ?, ?)
      `).run(uuid(), patientId, dateStr, symptom, 1);
    }

    // Journal entry
    const sourceCount = 1 + Math.floor(rand() * 2);
    const selectedSources: string[] = [];
    if (isWeekend) {
      selectedSources.push(stressSources[2]); // Family
      if (rand() < 0.4) selectedSources.push(stressSources[4]); // Friendships
    } else {
      selectedSources.push(stressSources[0]); // Work
      if (rand() < 0.3) selectedSources.push(stressSources[5]); // Finances
    }
    if (rand() < 0.2) selectedSources.push(stressSources[6]); // Physical health

    const entryText = journalTemplates[13 - daysAgo] || 'Reflecting on today.';

    db.prepare(`
      INSERT INTO journals (id, patient_id, date, stress_sources, entry_text)
      VALUES (?, ?, ?, ?, ?)
    `).run(uuid(), patientId, dateStr, JSON.stringify(selectedSources), entryText);
  }

  // Pre-computed AI insights
  db.prepare(`
    INSERT INTO ai_insights (id, patient_id, type, content, period_start, period_end)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    uuid(), patientId, 'weekly_reflection',
    JSON.stringify({
      summary: 'This week showed a pattern of moderate mood with work-related stress on weekdays and better recovery on weekends.',
      insight: 'On days when you slept more than 7 hours, your mood was on average 35% higher.',
      energyBoosters: ['Walking outside', 'Talking with friends', 'Exercising'],
      stressTriggers: ['Work deadlines', 'Family conflict', 'Poor sleep'],
      suggestion: 'Try to maintain a consistent sleep schedule, aiming for 7+ hours. Your data suggests this has the biggest impact on your mood.'
    }),
    new Date(today.getTime() - 13 * 86400000).toISOString().split('T')[0],
    new Date(today.getTime() - 7 * 86400000).toISOString().split('T')[0]
  );

  db.prepare(`
    INSERT INTO ai_insights (id, patient_id, type, content, period_start, period_end)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    uuid(), patientId, 'ai_paragraph',
    "It's been 14 days since you joined us! Looking back on the past week, you faced several stressful events at work but still managed to maintain your social connections. Despite the challenges, you continued showing up and completing your daily check-ins. Has anything changed since then?",
    new Date(today.getTime() - 13 * 86400000).toISOString().split('T')[0],
    today.toISOString().split('T')[0]
  );

  // Thematic analysis insight (for clinician)
  db.prepare(`
    INSERT INTO ai_insights (id, patient_id, type, content, period_start, period_end)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    uuid(), patientId, 'thematic',
    JSON.stringify({
      themes: [
        { name: 'Work Pressure', description: 'Recurring references to feeling overwhelmed by work demands and deadlines', frequency: '8/14 days' },
        { name: 'Social Connection', description: 'Positive experiences linked to social interactions with friends and colleagues', frequency: '5/14 days' },
        { name: 'Sleep Disruption', description: 'Reports of poor sleep quality affecting next-day functioning', frequency: '6/14 days' },
        { name: 'Self-Care Struggle', description: 'Difficulty maintaining exercise and self-care routines during high-stress periods', frequency: '4/14 days' }
      ],
      emotional_trajectory: 'fluctuating',
      concern_areas: ['Persistent low mood on weekdays', 'Sleep difficulties', 'Reduced motivation for self-care'],
      protective_factors: ['Maintains social connections', 'Seeks support from friends', 'Attempts coping strategies'],
      summary: 'The patient presents with a pattern of work-related stress driving fluctuating mood and energy levels across the 2-week period. Protective factors include maintained social connections and willingness to engage with coping strategies. Sleep quality appears to be a key mediator of daily wellbeing.'
    }),
    new Date(today.getTime() - 13 * 86400000).toISOString().split('T')[0],
    today.toISOString().split('T')[0]
  );

  console.log('Seed data inserted successfully (14 days for patient: demo-patient-001)');
}
