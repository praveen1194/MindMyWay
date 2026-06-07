import { getDb } from './connection';

export function initSchema(): void {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS patients (
      id                  TEXT PRIMARY KEY,
      name                TEXT NOT NULL,
      age                 INTEGER NOT NULL,
      gender              TEXT NOT NULL,
      ethnicity           TEXT,
      smoking             TEXT,
      drinking            TEXT,
      guardian_name       TEXT,
      guardian_contact    TEXT,
      consent_given       INTEGER NOT NULL DEFAULT 0,
      consent_share_hospital INTEGER NOT NULL DEFAULT 0,
      created_at          TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS checkins (
      id                  TEXT PRIMARY KEY,
      patient_id          TEXT NOT NULL REFERENCES patients(id),
      date                TEXT NOT NULL,
      mood                INTEGER NOT NULL CHECK(mood BETWEEN 1 AND 5),
      energy              INTEGER NOT NULL CHECK(energy BETWEEN 1 AND 5),
      stress              INTEGER NOT NULL CHECK(stress BETWEEN 1 AND 5),
      sleep_hours         REAL NOT NULL CHECK(sleep_hours BETWEEN 0 AND 16),
      appetite            TEXT NOT NULL CHECK(appetite IN ('much_lower','slightly_lower','normal','slightly_higher','much_higher')),
      interest            INTEGER NOT NULL CHECK(interest BETWEEN 1 AND 5),
      created_at          TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(patient_id, date)
    );

    CREATE TABLE IF NOT EXISTS symptoms (
      id                  TEXT PRIMARY KEY,
      patient_id          TEXT NOT NULL REFERENCES patients(id),
      date                TEXT NOT NULL,
      symptom             TEXT NOT NULL,
      present             INTEGER NOT NULL DEFAULT 0,
      created_at          TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(patient_id, date, symptom)
    );

    CREATE TABLE IF NOT EXISTS journals (
      id                  TEXT PRIMARY KEY,
      patient_id          TEXT NOT NULL REFERENCES patients(id),
      date                TEXT NOT NULL,
      stress_sources      TEXT,
      entry_text          TEXT,
      audio_transcript    TEXT,
      created_at          TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(patient_id, date)
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id                  TEXT PRIMARY KEY,
      patient_id          TEXT NOT NULL REFERENCES patients(id),
      role                TEXT NOT NULL CHECK(role IN ('user','assistant')),
      content             TEXT NOT NULL,
      created_at          TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS ai_insights (
      id                  TEXT PRIMARY KEY,
      patient_id          TEXT NOT NULL REFERENCES patients(id),
      type                TEXT NOT NULL,
      content             TEXT NOT NULL,
      period_start        TEXT,
      period_end          TEXT,
      created_at          TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS risk_assessments (
      id                  TEXT PRIMARY KEY,
      patient_id          TEXT NOT NULL REFERENCES patients(id),
      date                TEXT NOT NULL,
      criterion_1_met     INTEGER NOT NULL DEFAULT 0,
      criterion_2_met     INTEGER NOT NULL DEFAULT 0,
      criterion_3_met     INTEGER NOT NULL DEFAULT 0,
      high_risk           INTEGER NOT NULL DEFAULT 0,
      referral_sent       INTEGER NOT NULL DEFAULT 0,
      notes               TEXT,
      created_at          TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS clinician_notes (
      id                  TEXT PRIMARY KEY,
      patient_id          TEXT NOT NULL REFERENCES patients(id),
      note_text           TEXT NOT NULL,
      created_at          TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS condition_checks (
      id                  TEXT PRIMARY KEY,
      patient_id          TEXT NOT NULL REFERENCES patients(id),
      condition_name      TEXT NOT NULL,
      checked             INTEGER NOT NULL DEFAULT 0,
      notes               TEXT,
      updated_at          TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(patient_id, condition_name)
    );

    CREATE TABLE IF NOT EXISTS questionnaires (
      id                  TEXT PRIMARY KEY,
      patient_id          TEXT NOT NULL REFERENCES patients(id),
      type                TEXT NOT NULL,
      status              TEXT NOT NULL DEFAULT 'pending',
      sent_at             TEXT NOT NULL DEFAULT (datetime('now')),
      completed_at        TEXT,
      responses           TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_checkins_patient_date ON checkins(patient_id, date);
    CREATE INDEX IF NOT EXISTS idx_symptoms_patient_date ON symptoms(patient_id, date);
    CREATE INDEX IF NOT EXISTS idx_journals_patient_date ON journals(patient_id, date);
    CREATE INDEX IF NOT EXISTS idx_chat_patient ON chat_messages(patient_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_questionnaires_patient ON questionnaires(patient_id, status);
  `);

  console.log('Database schema initialized');
}
