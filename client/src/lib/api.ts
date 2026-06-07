const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || error.details || 'API request failed');
  }
  return res.json();
}

// Patients
export const api = {
  // Patient profile
  getPatients: () => request<any[]>('/patients'),
  getPatient: (id: string) => request<any>(`/patients/${id}`),
  createPatient: (data: any) => request<any>('/patients', { method: 'POST', body: JSON.stringify(data) }),
  updatePatient: (id: string, data: any) => request<any>(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Journal
  saveCheckin: (data: any) => request<any>('/journal/checkin', { method: 'POST', body: JSON.stringify(data) }),
  saveSymptoms: (data: any) => request<any>('/journal/symptoms', { method: 'POST', body: JSON.stringify(data) }),
  saveJournal: (data: any) => request<any>('/journal/entry', { method: 'POST', body: JSON.stringify(data) }),
  getJournalDate: (patientId: string, date: string) => request<any>(`/journal/${patientId}/${date}`),
  getJournalDates: (patientId: string) => request<any[]>(`/journal/${patientId}`),

  // Dashboard
  getDashboard: (patientId: string) => request<any>(`/dashboard/${patientId}`),

  // AI
  chat: (patientId: string, message: string, checkinContext?: any) =>
    request<any>('/ai/chat', { method: 'POST', body: JSON.stringify({ patient_id: patientId, message, checkin_context: checkinContext }) }),
  generateReflection: (patientId: string) =>
    request<any>('/ai/reflection', { method: 'POST', body: JSON.stringify({ patient_id: patientId }) }),
  generateThematic: (patientId: string) =>
    request<any>('/ai/thematic', { method: 'POST', body: JSON.stringify({ patient_id: patientId }) }),
  generateParagraph: (patientId: string) =>
    request<any>('/ai/paragraph', { method: 'POST', body: JSON.stringify({ patient_id: patientId }) }),

  // Risk
  assessRisk: (patientId: string) =>
    request<any>(`/risk/assess/${patientId}`, { method: 'POST' }),
  updateConsent: (patientId: string, consentShare: boolean) =>
    request<any>('/risk/consent', { method: 'POST', body: JSON.stringify({ patient_id: patientId, consent_share: consentShare }) }),

  // Clinician
  getClinicianPatients: () => request<any[]>('/clinician/patients'),
  getClinicianPatientData: (patientId: string) => request<any>(`/clinician/patient/${patientId}`),
  saveClinicianNote: (patientId: string, noteText: string) =>
    request<any>('/clinician/notes', { method: 'POST', body: JSON.stringify({ patient_id: patientId, note_text: noteText }) }),
  updateConditions: (patientId: string, conditions: any[]) =>
    request<any>('/clinician/conditions', { method: 'POST', body: JSON.stringify({ patient_id: patientId, conditions }) }),

  // Questionnaires
  sendQuestionnaire: (patientId: string, type: string) =>
    request<any>('/questionnaire/send', { method: 'POST', body: JSON.stringify({ patient_id: patientId, type }) }),
  getPendingQuestionnaires: (patientId: string) =>
    request<any[]>(`/questionnaire/pending/${patientId}`),
  getQuestionnaires: (patientId: string) =>
    request<any[]>(`/questionnaire/${patientId}`),
  completeQuestionnaire: (id: string, responses: any) =>
    request<any>(`/questionnaire/complete/${id}`, { method: 'POST', body: JSON.stringify({ responses }) }),
};
