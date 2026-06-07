import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import type { ClinicianPatientData } from '../../types';
import { CONDITION_QUESTIONNAIRES, SYMPTOM_NAMES } from '../../types';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
  Users, AlertTriangle, FileText, ClipboardList, Download, Send, ChevronRight, ArrowLeft, RefreshCw,
} from 'lucide-react';

export default function ClinicianView() {
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [patientData, setPatientData] = useState<ClinicianPatientData | null>(null);
  const [loading, setLoading] = useState(false);
  const [doctorNote, setDoctorNote] = useState('');
  const [conditions, setConditions] = useState<Record<string, { checked: boolean; notes: string }>>({});
  const [sendingQ, setSendingQ] = useState<string | null>(null);

  useEffect(() => {
    api.getClinicianPatients().then(setPatients).catch(console.error);
  }, []);

  const selectPatient = async (id: string) => {
    setSelectedPatientId(id);
    setLoading(true);
    try {
      const data = await api.getClinicianPatientData(id);
      setPatientData(data);
      // Init condition state
      const condState: Record<string, { checked: boolean; notes: string }> = {};
      for (const cq of CONDITION_QUESTIONNAIRES) {
        const existing = data.conditionChecks?.find((c: any) => c.condition_name === cq.condition);
        condState[cq.condition] = {
          checked: !!existing?.checked,
          notes: existing?.notes || '',
        };
      }
      setConditions(condState);
    } catch (err) {
      console.error('Failed to load patient data:', err);
    }
    setLoading(false);
  };

  const saveConditions = async () => {
    if (!selectedPatientId) return;
    const condArray = Object.entries(conditions).map(([condition, state]) => ({
      condition_name: condition,
      checked: state.checked,
      notes: state.notes,
    }));
    await api.updateConditions(selectedPatientId, condArray);
  };

  const saveNote = async () => {
    if (!selectedPatientId || !doctorNote.trim()) return;
    await api.saveClinicianNote(selectedPatientId, doctorNote);
    setDoctorNote('');
    selectPatient(selectedPatientId); // Refresh
  };

  const sendQuestionnaire = async (type: string) => {
    if (!selectedPatientId) return;
    setSendingQ(type);
    try {
      await api.sendQuestionnaire(selectedPatientId, type);
      selectPatient(selectedPatientId); // Refresh
    } catch (err) {
      console.error('Failed to send questionnaire:', err);
    }
    setSendingQ(null);
  };

  const exportNotes = () => {
    if (!patientData) return;
    const { patient, clinicianNotes } = patientData;
    let text = `CLINICIAN REPORT — Mind My Way\n`;
    text += `Patient: ${patient.name}\n`;
    text += `Date: ${new Date().toLocaleDateString('en-GB')}\n\n`;
    text += `--- CLINICIAN NOTES ---\n`;
    for (const note of clinicianNotes) {
      text += `[${new Date(note.created_at).toLocaleDateString('en-GB')}] ${note.note_text}\n\n`;
    }
    text += `--- CONDITIONS CHECKED ---\n`;
    for (const [cond, state] of Object.entries(conditions)) {
      if (state.checked) text += `✓ ${cond}\n`;
    }
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clinician-report-${patient.name.replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Patient list view
  if (!selectedPatientId) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Users size={28} className="text-emerald-600" />
            <h1 className="text-2xl font-bold text-slate-800">Clinician Dashboard</h1>
          </div>

          <div className="space-y-3">
            {patients.map((p: any) => (
              <button
                key={p.id}
                onClick={() => selectPatient(p.id)}
                className={`w-full p-4 rounded-2xl bg-white border text-left hover:shadow-md transition-all flex items-center gap-4 ${
                  p.highRisk ? 'border-red-200 bg-red-50/30' : 'border-slate-200'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  p.highRisk ? 'bg-red-100' : 'bg-indigo-100'
                }`}>
                  <span className="text-lg font-bold text-slate-700">
                    {p.name?.charAt(0) || '?'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{p.name}</span>
                    {p.highRisk && (
                      <span className="flex items-center gap-1 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                        <AlertTriangle size={10} /> High Risk
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Latest mood: {p.latestMood ?? '—'} · Last entry: {p.latestDate ?? '—'}
                    {p.pendingQuestionnaires > 0 && ` · ${p.pendingQuestionnaires} pending questionnaire(s)`}
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Patient detail view
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <RefreshCw size={24} className="animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!patientData) return null;

  const { patient, checkins, symptomFrequency, journals, thematicInsight, riskAssessment, clinicianNotes, questionnaires } = patientData;

  const chartData = checkins.map((c: any) => ({
    date: c.date.slice(5),
    mood: c.mood, energy: c.energy, stress: c.stress, sleep: c.sleep_hours,
  }));

  const symptomChartData = symptomFrequency.map((s: any) => ({
    name: (SYMPTOM_NAMES[s.symptom] || s.symptom).substring(0, 20),
    days: s.frequency,
  }));

  let thematicData: any = null;
  try { thematicData = thematicInsight ? JSON.parse(thematicInsight.content) : null; } catch {}

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button onClick={() => setSelectedPatientId(null)} className="p-1 text-slate-400 hover:text-slate-600">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-800">{patient.name}</h1>
            <div className="text-xs text-slate-400">
              Age {patient.age} · {patient.gender}
              {riskAssessment?.high_risk && <span className="ml-2 text-red-500 font-medium">⚠ High Risk</span>}
              {patient.consent_share_hospital && <span className="ml-2 text-emerald-500">Consent given</span>}
            </div>
          </div>
          <button onClick={exportNotes} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Charts */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">2-Week Check-in Tendencies</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12 }} />
              <Line type="monotone" dataKey="mood" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} name="Mood" />
              <Line type="monotone" dataKey="energy" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Energy" />
              <Line type="monotone" dataKey="stress" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Stress" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Symptom Frequency (2 weeks)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={symptomChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} stroke="#94a3b8" width={140} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12 }} />
              <Bar dataKey="days" fill="#6366f1" radius={[0, 4, 4, 0]} name="Days present" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Thematic Analysis */}
        {thematicData && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <FileText size={14} className="text-indigo-500" /> AI Thematic Analysis
            </h3>

            {/* Emotional trajectory */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Trajectory:</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                thematicData.emotional_trajectory === 'improving' ? 'bg-emerald-100 text-emerald-700' :
                thematicData.emotional_trajectory === 'declining' ? 'bg-red-100 text-red-700' :
                thematicData.emotional_trajectory === 'fluctuating' ? 'bg-amber-100 text-amber-700' :
                'bg-slate-100 text-slate-700'
              }`}>
                {thematicData.emotional_trajectory}
              </span>
            </div>

            {/* Themes */}
            {thematicData.themes?.map((theme: any, i: number) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">{theme.name}</span>
                  <span className="text-xs text-slate-400">{theme.frequency}</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{theme.description}</p>
              </div>
            ))}

            {/* Concerns & Protective factors */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <h4 className="text-xs font-semibold text-red-600 mb-1.5">Concern Areas</h4>
                {thematicData.concern_areas?.map((c: string, i: number) => (
                  <div key={i} className="text-xs text-slate-600 mb-1">• {c}</div>
                ))}
              </div>
              <div>
                <h4 className="text-xs font-semibold text-emerald-600 mb-1.5">Protective Factors</h4>
                {thematicData.protective_factors?.map((p: string, i: number) => (
                  <div key={i} className="text-xs text-slate-600 mb-1">• {p}</div>
                ))}
              </div>
            </div>

            <p className="text-sm text-slate-600 italic">{thematicData.summary}</p>
          </div>
        )}

        {/* Condition Checkboxes */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
            <ClipboardList size={14} className="text-emerald-500" /> Condition Screening
          </h3>
          <div className="space-y-3">
            {CONDITION_QUESTIONNAIRES.map((cq) => (
              <div key={cq.condition} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                <input
                  type="checkbox"
                  checked={conditions[cq.condition]?.checked || false}
                  onChange={(e) => {
                    setConditions({ ...conditions, [cq.condition]: { ...conditions[cq.condition], checked: e.target.checked } });
                    setTimeout(saveConditions, 100);
                  }}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-300"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-700">{cq.condition}</div>
                  <div className="text-xs text-slate-400">{cq.fullName}</div>
                </div>
                <button
                  onClick={() => sendQuestionnaire(cq.questionnaire)}
                  disabled={sendingQ === cq.questionnaire}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-medium hover:bg-indigo-100 disabled:opacity-40"
                >
                  <Send size={12} />
                  {sendingQ === cq.questionnaire ? 'Sending...' : `Send ${cq.questionnaire}`}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Sent questionnaires status */}
        {questionnaires?.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Questionnaires</h3>
            <div className="space-y-2">
              {questionnaires.map((q: any) => (
                <div key={q.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-sm">
                  <span className="font-medium text-slate-700">{q.type}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    q.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                    q.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {q.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Doctor Notes */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Notes</h3>

          {/* Existing notes */}
          {clinicianNotes?.map((note: any) => (
            <div key={note.id} className="p-3 rounded-xl bg-slate-50 mb-2">
              <div className="text-xs text-slate-400 mb-1">
                {new Date(note.created_at).toLocaleString('en-GB')}
              </div>
              <p className="text-sm text-slate-700">{note.note_text}</p>
            </div>
          ))}

          {/* New note */}
          <textarea
            value={doctorNote}
            onChange={(e) => setDoctorNote(e.target.value)}
            rows={4}
            className="w-full mt-2 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            placeholder="Write a clinical note..."
          />
          <button
            onClick={saveNote}
            className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
          >
            Save Note
          </button>
        </div>
      </div>
    </div>
  );
}
