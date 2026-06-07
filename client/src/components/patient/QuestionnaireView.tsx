import { useState, useEffect } from 'react';
import Header from '../layout/Header';
import { api } from '../../lib/api';
import { ClipboardList, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuestionnaireViewProps {
  patientId: string;
}

// PHQ-9 (Patient Health Questionnaire-9) — depression screening
const PHQ9_QUESTIONS = [
  { id: 'q1', text: 'Little interest or pleasure in doing things', type: 'phq9' },
  { id: 'q2', text: 'Feeling down, depressed, or hopeless', type: 'phq9' },
  { id: 'q3', text: 'Trouble falling or staying asleep, or sleeping too much', type: 'phq9' },
  { id: 'q4', text: 'Feeling tired or having little energy', type: 'phq9' },
  { id: 'q5', text: 'Poor appetite or overeating', type: 'phq9' },
  { id: 'q6', text: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down', type: 'phq9' },
  { id: 'q7', text: 'Trouble concentrating on things, such as reading the newspaper or watching television', type: 'phq9' },
  { id: 'q8', text: 'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual', type: 'phq9' },
  { id: 'q9', text: 'Thoughts that you would be better off dead or of hurting yourself in some way', type: 'phq9' },
];

// ASRS (Adult ADHD Self-Report Scale) - simplified for demo
const ASRS_QUESTIONS = [
  { id: 'q1', text: 'How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?', type: 'scale' },
  { id: 'q2', text: 'How often do you have difficulty getting things in order when you have to do a task that requires organization?', type: 'scale' },
  { id: 'q3', text: 'How often do you have problems remembering appointments or obligations?', type: 'scale' },
  { id: 'q4', text: 'How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?', type: 'scale' },
  { id: 'q5', text: 'How often do you feel overly active and compelled to do things, like you were driven by a motor?', type: 'scale' },
  { id: 'q6', text: 'How often do you make careless mistakes when you have to work on a boring or difficult project?', type: 'scale' },
];

const PHQ9_SCALE = [
  { value: '0', label: 'Not at all' },
  { value: '1', label: 'Several days' },
  { value: '2', label: 'More than half the days' },
  { value: '3', label: 'Nearly every day' },
];

const ASRS_SCALE = [
  { value: '0', label: 'Never' },
  { value: '1', label: 'Rarely' },
  { value: '2', label: 'Sometimes' },
  { value: '3', label: 'Often' },
  { value: '4', label: 'Very Often' },
];

const QUESTIONNAIRES: Record<string, { title: string; questions: any[] }> = {
  'PHQ-9': { title: 'Patient Health Questionnaire-9 (PHQ-9)', questions: PHQ9_QUESTIONS },
  ASRS: { title: 'Adult ADHD Self-Report Scale (ASRS)', questions: ASRS_QUESTIONS },
  'PCL-5': { title: 'PTSD Checklist for DSM-5 (PCL-5)', questions: [{ id: 'q1', text: 'Questionnaire placeholder — full PCL-5 coming soon', type: 'yesno' }] },
  'OCI-R': { title: 'Obsessive-Compulsive Inventory (OCI-R)', questions: [{ id: 'q1', text: 'Questionnaire placeholder — full OCI-R coming soon', type: 'yesno' }] },
  'PQ-B': { title: 'Prodromal Questionnaire-Brief (PQ-B)', questions: [{ id: 'q1', text: 'Questionnaire placeholder — full PQ-B coming soon', type: 'yesno' }] },
  SAPAS: { title: 'SAPAS Screening', questions: [{ id: 'q1', text: 'Questionnaire placeholder — full SAPAS coming soon', type: 'yesno' }] },
};

export default function QuestionnaireView({ patientId }: QuestionnaireViewProps) {
  const [pending, setPending] = useState<any[]>([]);
  const [activeQ, setActiveQ] = useState<any>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.getPendingQuestionnaires(patientId).then(setPending).catch(console.error);
  }, [patientId]);

  const startQuestionnaire = (q: any) => {
    setActiveQ(q);
    setResponses({});
    setCompleted(false);
  };

  const setResponse = (questionId: string, value: string) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!activeQ) return;
    await api.completeQuestionnaire(activeQ.id, responses);
    setCompleted(true);
    // Refresh pending list
    api.getPendingQuestionnaires(patientId).then(setPending).catch(console.error);
  };

  // Active questionnaire form
  if (activeQ && !completed) {
    const schema = QUESTIONNAIRES[activeQ.type] || QUESTIONNAIRES['PCL-5'];
    return (
      <div className="pb-4">
        <Header title={schema.title} showBack onBack={() => setActiveQ(null)} />
        <div className="px-4 py-4 space-y-4">
          {schema.questions.map((q) => (
            <div key={q.id} className="p-4 rounded-2xl bg-white border border-slate-200">
              <p className="text-sm text-slate-700 mb-3">{q.text}</p>
              {q.type === 'yesno' ? (
                <div className="flex gap-2">
                  {['Yes', 'No'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => setResponse(q.id, opt.toLowerCase())}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                        responses[q.id] === opt.toLowerCase()
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : q.type === 'phq9' ? (
                <div className="space-y-1.5">
                  {PHQ9_SCALE.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setResponse(q.id, opt.value)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                        responses[q.id] === opt.value
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="font-medium">{opt.value}</span> — {opt.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {ASRS_SCALE.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setResponse(q.id, opt.value)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                        responses[q.id] === opt.value
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          <button
            onClick={handleSubmit}
            disabled={Object.keys(responses).length < schema.questions.length}
            className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Submit Questionnaire
          </button>
        </div>
      </div>
    );
  }

  // Completed confirmation
  if (completed) {
    return (
      <div className="pb-4">
        <Header title="Questionnaire" />
        <div className="px-4 py-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle size={32} className="text-emerald-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">Thank you!</h2>
          <p className="text-sm text-slate-500 mb-6">Your responses have been submitted and will be reviewed by your clinician.</p>
          <button
            onClick={() => { setActiveQ(null); setCompleted(false); }}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm"
          >
            Back to Questionnaires
          </button>
        </div>
      </div>
    );
  }

  // Pending questionnaires list
  return (
    <div className="pb-4">
      <Header title="Questionnaires" subtitle="From your clinician" showBack onBack={() => navigate('/patient/journal')} />
      <div className="px-4 py-4 space-y-3">
        {pending.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <ClipboardList size={28} className="text-slate-400" />
            </div>
            <p className="text-sm text-slate-500">No pending questionnaires</p>
          </div>
        ) : (
          pending.map((q: any) => {
            const schema = QUESTIONNAIRES[q.type];
            return (
              <button
                key={q.id}
                onClick={() => startQuestionnaire(q)}
                className="w-full p-4 rounded-2xl bg-white border border-slate-200 text-left hover:shadow-md transition-all flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <ClipboardList size={20} className="text-indigo-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-800 text-sm">{schema?.title || q.type}</div>
                  <div className="text-xs text-slate-400">Sent {new Date(q.sent_at).toLocaleDateString('en-GB')}</div>
                </div>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Pending</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
