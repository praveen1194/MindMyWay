import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import PhoneFrame from './components/layout/PhoneFrame';
import BottomNav from './components/layout/BottomNav';
import LandingPage from './components/landing/LandingPage';
import ProfileForm from './components/patient/ProfileForm';
import DailyJournal from './components/patient/DailyJournal';
import ChatAssistant from './components/patient/ChatAssistant';
import UserDashboard from './components/patient/UserDashboard';
import ClinicianView from './components/clinician/ClinicianView';
import QuestionnaireView from './components/patient/QuestionnaireView';
import { api } from './lib/api';
import type { Patient } from './types';

// Patient layout wraps patient views inside the phone frame with bottom nav
function PatientLayout({ children, patientId, patient, pendingQ }: {
  children: React.ReactNode;
  patientId: string;
  patient: Patient | null;
  pendingQ: number;
}) {
  return (
    <PhoneFrame>
      <div className="pb-20">{children}</div>
      <BottomNav patientId={patientId} pendingQuestionnaires={pendingQ} />
    </PhoneFrame>
  );
}

function PatientRouter() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [pendingQ, setPendingQ] = useState(0);

  // For demo: use the seed data patient
  const patientId = 'demo-patient-001';

  useEffect(() => {
    api.getPatient(patientId).then((p: any) => {
      setPatient(p);
    }).catch(() => {
      // If no patient yet, create one
      api.createPatient({
        name: 'Demo User', age: 25, gender: 'Non-binary',
        ethnicity: 'White British', smoking: 'Never', drinking: 'Occasional',
        consent_given: true,
      }).then((p: any) => setPatient(p));
    });

    api.getPendingQuestionnaires(patientId).then((q: any[]) => {
      setPendingQ(q.length);
    }).catch(() => {});
  }, [patientId]);

  return (
    <PatientLayout patientId={patientId} patient={patient} pendingQ={pendingQ}>
      <Routes>
        <Route path="journal" element={<DailyJournal patientId={patientId} />} />
        <Route path="dashboard" element={<UserDashboard patientId={patientId} />} />
        <Route path="chat" element={<ChatAssistant patientId={patientId} patient={patient} />} />
        <Route path="questionnaires" element={<QuestionnaireView patientId={patientId} />} />
        <Route path="profile" element={
          <ProfileForm patientId={patientId} onPatientUpdate={(p) => setPatient(p)} />
        } />
        <Route path="*" element={<Navigate to="journal" replace />} />
      </Routes>
    </PatientLayout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/patient/*" element={<PatientRouter />} />
        <Route path="/clinician/*" element={<ClinicianView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
