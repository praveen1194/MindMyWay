export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  ethnicity: string | null;
  smoking: string | null;
  drinking: string | null;
  guardian_name: string | null;
  guardian_contact: string | null;
  consent_given: number;
  consent_share_hospital: number;
  created_at: string;
  updated_at: string;
}

export interface Checkin {
  id: string;
  patient_id: string;
  date: string;
  mood: number;
  energy: number;
  stress: number;
  sleep_hours: number;
  appetite: string;
  interest: number;
  created_at: string;
}

export interface SymptomEntry {
  id: string;
  patient_id: string;
  date: string;
  symptom: string;
  present: number;
}

export interface Journal {
  id: string;
  patient_id: string;
  date: string;
  stress_sources: string | null;
  entry_text: string | null;
  audio_transcript: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  patient_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface AiInsight {
  id: string;
  patient_id: string;
  type: string;
  content: string;
  period_start: string | null;
  period_end: string | null;
  created_at: string;
}

export interface RiskAssessment {
  id: string;
  patient_id: string;
  date: string;
  criterion_1_met: number;
  criterion_2_met: number;
  criterion_3_met: number;
  high_risk: number;
  referral_sent: number;
  notes: string | null;
  details?: {
    depressed_mood_days: number;
    loss_of_interest_days: number;
    persistent_symptoms_count: number;
    avg_stress: number;
    avg_mood: number;
    journal_impairment_detected: boolean;
    total_checkin_days: number;
  };
}

export interface ClinicianNote {
  id: string;
  patient_id: string;
  note_text: string;
  created_at: string;
}

export interface ConditionCheck {
  id: string;
  patient_id: string;
  condition_name: string;
  checked: number;
  notes: string | null;
  updated_at: string;
}

export interface Questionnaire {
  id: string;
  patient_id: string;
  type: string;
  status: 'pending' | 'completed' | 'declined';
  sent_at: string;
  completed_at: string | null;
  responses: string | null;
}

export interface SymptomFrequency {
  symptom: string;
  frequency: number;
}

export interface DashboardData {
  patient: Patient;
  checkins: Checkin[];
  symptomFrequency: SymptomFrequency[];
  journals: Journal[];
  insights: AiInsight[];
  riskAssessment: RiskAssessment | null;
  pendingQuestionnaires: number;
  stressSourceCounts: Record<string, number>;
  goodDaySources: string[];
}

export interface ClinicianPatientData {
  patient: Patient;
  checkins: Checkin[];
  symptomFrequency: SymptomFrequency[];
  journals: Journal[];
  thematicInsight: AiInsight | null;
  riskAssessment: RiskAssessment | null;
  clinicianNotes: ClinicianNote[];
  conditionChecks: ConditionCheck[];
  questionnaires: Questionnaire[];
}

export const SYMPTOM_NAMES: Record<string, string> = {
  depressed_mood: 'Depressed mood',
  loss_of_interest: 'Loss of interests/pleasure',
  weight_change: 'Weight loss/gain',
  insomnia_hypersomnia: 'Insomnia/hypersomnia',
  fatigue: 'Fatigue',
  psychomotor: 'Psychomotor agitation/retardation',
  worthlessness_guilt: 'Feeling worthless/excessive guilt',
  decreased_concentration: 'Decreased concentration',
  thoughts_of_death: 'Thoughts of death',
};

export const STRESS_SOURCES = [
  'Work', 'Studies', 'Family', 'Romantic relationship', 'Friendships',
  'Finances', 'Physical health', 'Social situations', 'Other'
];

export const APPETITE_OPTIONS = [
  { value: 'much_lower', label: 'Much lower than usual' },
  { value: 'slightly_lower', label: 'Slightly lower than usual' },
  { value: 'normal', label: 'Normal' },
  { value: 'slightly_higher', label: 'Slightly higher than usual' },
  { value: 'much_higher', label: 'Much higher than usual' },
];

export const CONDITION_QUESTIONNAIRES = [
  { condition: 'Depression', questionnaire: 'PHQ-9', fullName: 'Patient Health Questionnaire-9' },
  { condition: 'PTSD', questionnaire: 'PCL-5', fullName: 'PTSD Checklist for DSM-5' },
  { condition: 'OCD', questionnaire: 'OCI-R', fullName: 'Obsessive-Compulsive Inventory-Revised' },
  { condition: 'ADHD', questionnaire: 'ASRS', fullName: 'Adult ADHD Self-Report Scale v1.1' },
  { condition: 'Psychosis', questionnaire: 'PQ-B', fullName: 'Prodromal Questionnaire-Brief' },
  { condition: 'Personality disorders', questionnaire: 'SAPAS', fullName: 'Standardised Assessment of Severity of Personality Disorder' },
];
