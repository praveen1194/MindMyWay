import { useState, useEffect, useCallback } from 'react';
import Header from '../layout/Header';
import WellbeingCheckin from './WellbeingCheckin';
import SymptomTracker from './SymptomTracker';
import ReflectiveJournal from './ReflectiveJournal';
import Toast from '../shared/Toast';
import { api } from '../../lib/api';
import { ClipboardCheck, Heart, MessageSquare, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DailyJournalProps {
  patientId: string;
}

export default function DailyJournal({ patientId }: DailyJournalProps) {
  const [activeTab, setActiveTab] = useState<'checkin' | 'symptoms' | 'journal'>('checkin');
  const [existingData, setExistingData] = useState<any>(null);
  const [savedSections, setSavedSections] = useState<Set<string>>(new Set());
  const [pendingQ, setPendingQ] = useState(0);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];

  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  useEffect(() => {
    api.getJournalDate(patientId, today).then(data => {
      setExistingData(data);
      const saved = new Set<string>();
      if (data.checkin) saved.add('checkin');
      if (data.symptoms?.length) saved.add('symptoms');
      if (data.journal) saved.add('journal');
      setSavedSections(saved);
    }).catch(() => {});

    api.getPendingQuestionnaires(patientId).then((q: any[]) => {
      setPendingQ(q.length);
    }).catch(() => {});
  }, [patientId, today]);

  const handleCheckinSave = async (data: any) => {
    await api.saveCheckin({ patient_id: patientId, date: today, ...data });
    setSavedSections(prev => new Set([...prev, 'checkin']));
    showToast('Check-in saved');
  };

  const handleSymptomsSave = async (symptoms: string[]) => {
    await api.saveSymptoms({ patient_id: patientId, date: today, symptoms });
    setSavedSections(prev => new Set([...prev, 'symptoms']));
    showToast('Symptoms saved');
  };

  const handleJournalSave = async (data: any) => {
    await api.saveJournal({ patient_id: patientId, date: today, ...data });
    setSavedSections(prev => new Set([...prev, 'journal']));
    showToast('Journal entry saved');
  };

  const tabs = [
    { key: 'checkin' as const, label: 'Check-in', icon: Heart },
    { key: 'symptoms' as const, label: 'Symptoms', icon: ClipboardCheck },
    { key: 'journal' as const, label: 'Journal', icon: MessageSquare },
  ];

  return (
    <div className="pb-24">
      <Toast message={toast.message} visible={toast.visible} onHide={hideToast} />
      <Header title="Daily Journal" subtitle={new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })} />

      {/* Tab bar */}
      <div className="flex gap-1 px-4 py-2 bg-white sticky top-[57px] z-30">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isSaved = savedSections.has(tab.key);
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-indigo-600 text-white'
                  : isSaved
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-slate-100 text-slate-500'
              }`}
            >
              <Icon size={14} />
              {tab.label}
              {isSaved && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
            </button>
          );
        })}
      </div>

      <div className="px-4 py-3">
        {/* Pending questionnaire notification */}
        {pendingQ > 0 && (
          <button
            onClick={() => navigate('/patient/questionnaires')}
            className="w-full mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-left hover:bg-amber-100 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <ClipboardList size={18} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-amber-800">You have {pendingQ} questionnaire{pendingQ > 1 ? 's' : ''} to complete</div>
              <div className="text-xs text-amber-600">From your clinician — tap to start</div>
            </div>
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold pulse-dot">
              {pendingQ}
            </span>
          </button>
        )}
        {activeTab === 'checkin' && (
          <WellbeingCheckin
            initialData={existingData?.checkin}
            onSave={handleCheckinSave}
          />
        )}
        {activeTab === 'symptoms' && (
          <SymptomTracker
            initialData={existingData?.symptoms?.map((s: any) => s.symptom)}
            onSave={handleSymptomsSave}
          />
        )}
        {activeTab === 'journal' && (
          <ReflectiveJournal
            initialData={existingData?.journal}
            onSave={handleJournalSave}
          />
        )}
      </div>
    </div>
  );
}
