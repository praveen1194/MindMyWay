import { useState } from 'react';
import SliderInput from '../shared/SliderInput';
import { APPETITE_OPTIONS } from '../../types';

interface WellbeingCheckinProps {
  initialData?: any;
  onSave: (data: any) => void;
}

export default function WellbeingCheckin({ initialData, onSave }: WellbeingCheckinProps) {
  const [mood, setMood] = useState(initialData?.mood ?? 3);
  const [energy, setEnergy] = useState(initialData?.energy ?? 3);
  const [stress, setStress] = useState(initialData?.stress ?? 3);
  const [sleepHours, setSleepHours] = useState(initialData?.sleep_hours ?? 7);
  const [appetite, setAppetite] = useState(initialData?.appetite ?? 'normal');
  const [interest, setInterest] = useState(initialData?.interest ?? 3);

  const handleSave = () => {
    onSave({ mood, energy, stress, sleep_hours: sleepHours, appetite, interest });
  };

  return (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">Daily Well-being Check-in</h3>

      <SliderInput label="Mood" value={mood} min={1} max={5} onChange={setMood}
        lowLabel="Very low" highLabel="Very positive" color="#6366f1" />
      <SliderInput label="Energy" value={energy} min={1} max={5} onChange={setEnergy}
        lowLabel="Very low" highLabel="Very high" color="#10b981" />
      <SliderInput label="Stress" value={stress} min={1} max={5} onChange={setStress}
        lowLabel="Not at all" highLabel="Extremely" color="#f59e0b" />
      <SliderInput label="Sleep (hours)" value={sleepHours} min={0} max={12} step={0.5} onChange={setSleepHours}
        lowLabel="0h" highLabel="12h+" color="#8b5cf6" />
      <SliderInput label="Interest & Enjoyment" value={interest} min={1} max={5} onChange={setInterest}
        lowLabel="Not at all" highLabel="Very much" color="#ec4899" />

      {/* Appetite - radio style */}
      <div className="mb-4">
        <span className="text-sm font-medium text-slate-700 block mb-2">Appetite</span>
        <div className="space-y-1.5">
          {APPETITE_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio" name="appetite" value={opt.value}
                checked={appetite === opt.value}
                onChange={() => setAppetite(opt.value)}
                className="w-3.5 h-3.5 text-indigo-600 focus:ring-indigo-300"
              />
              <span className="text-sm text-slate-600">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition-colors"
      >
        Save Check-in
      </button>
    </div>
  );
}
