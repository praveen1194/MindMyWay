import { useState } from 'react';
import { SYMPTOM_NAMES } from '../../types';
import EmergencyBanner from '../shared/EmergencyBanner';

interface SymptomTrackerProps {
  initialData?: string[];
  onSave: (symptoms: string[]) => void;
}

export default function SymptomTracker({ initialData = [], onSave }: SymptomTrackerProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialData));
  const [showEmergency, setShowEmergency] = useState(false);

  const toggle = (symptom: string) => {
    const next = new Set(selected);
    if (next.has(symptom)) {
      next.delete(symptom);
    } else {
      next.add(symptom);
      // Emergency red flag
      if (symptom === 'thoughts_of_death') {
        setShowEmergency(true);
      }
    }
    setSelected(next);
  };

  const handleSave = () => {
    onSave(Array.from(selected));
  };

  return (
    <div>
      {showEmergency && <EmergencyBanner onClose={() => setShowEmergency(false)} />}

      <h3 className="text-sm font-semibold text-slate-700 mb-3">Symptom Tracking</h3>
      <p className="text-xs text-slate-400 mb-3">Select any symptoms you experienced today</p>

      <div className="space-y-2">
        {Object.entries(SYMPTOM_NAMES).map(([key, label]) => (
          <label
            key={key}
            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              selected.has(key)
                ? key === 'thoughts_of_death'
                  ? 'bg-red-50 border-red-300'
                  : 'bg-indigo-50 border-indigo-200'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <input
              type="checkbox"
              checked={selected.has(key)}
              onChange={() => toggle(key)}
              className={`w-4 h-4 rounded ${
                key === 'thoughts_of_death' ? 'text-red-500 focus:ring-red-300' : 'text-indigo-600 focus:ring-indigo-300'
              }`}
            />
            <span className={`text-sm ${selected.has(key) ? 'font-medium' : ''} ${
              key === 'thoughts_of_death' ? 'text-red-700' : 'text-slate-700'
            }`}>
              {label}
            </span>
            {key === 'thoughts_of_death' && (
              <span className="ml-auto text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                🚩 Emergency
              </span>
            )}
          </label>
        ))}
      </div>

      <button
        onClick={handleSave}
        className="w-full mt-4 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition-colors"
      >
        Save Symptoms
      </button>
    </div>
  );
}
