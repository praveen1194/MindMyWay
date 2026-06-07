import { useState } from 'react';
import { STRESS_SOURCES } from '../../types';
import AudioRecorder from '../shared/AudioRecorder';
import { Wind, Footprints, Brain, Sparkles } from 'lucide-react';

interface ReflectiveJournalProps {
  initialData?: any;
  onSave: (data: any) => void;
}

const PROMPTS = [
  'What happened today?',
  'What was the most difficult moment?',
  'What thoughts stayed with you the most?',
  'What do you need right now?',
  'Was there anything today that made it easier or harder for you to go about your usual activities?',
];

const MICRO_INTERVENTIONS = [
  { icon: Wind, label: 'Box Breathing', desc: 'Breathe in 4 counts, hold 4, out 4, hold 4. Repeat 4 times.' },
  { icon: Footprints, label: 'Take a Walk', desc: 'A 10-minute walk can reduce stress and improve your mood.' },
  { icon: Brain, label: '5-4-3-2-1 Grounding', desc: 'Name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste.' },
  { icon: Sparkles, label: 'Body Scan', desc: 'Close your eyes. Notice sensations from your toes up to your head.' },
];

export default function ReflectiveJournal({ initialData, onSave }: ReflectiveJournalProps) {
  const [stressSources, setStressSources] = useState<string[]>(initialData?.stress_sources || []);
  const [entryText, setEntryText] = useState(initialData?.entry_text || '');
  const [audioTranscript, setAudioTranscript] = useState(initialData?.audio_transcript || '');
  const [showPrompts, setShowPrompts] = useState(false);
  const [showInterventions, setShowInterventions] = useState(false);

  const toggleSource = (source: string) => {
    setStressSources(prev =>
      prev.includes(source) ? prev.filter(s => s !== source) : [...prev, source]
    );
  };

  const insertPrompt = (prompt: string) => {
    setEntryText(prev => prev ? prev + '\n\n' + prompt + ' ' : prompt + ' ');
    setShowPrompts(false);
  };

  const handleSave = () => {
    onSave({
      stress_sources: stressSources,
      entry_text: entryText || audioTranscript || null,
      audio_transcript: audioTranscript || null,
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-700">Reflective Journal</h3>

      {/* Stress sources */}
      <div>
        <p className="text-sm text-slate-600 mb-2">What affected you most today?</p>
        <div className="flex flex-wrap gap-1.5">
          {STRESS_SOURCES.map(source => (
            <button
              key={source}
              onClick={() => toggleSource(source)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                stressSources.includes(source)
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {source}
            </button>
          ))}
        </div>
      </div>

      {/* Text area */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-sm text-slate-600">Would you like to tell us more about it?</p>
          <button
            onClick={() => setShowPrompts(!showPrompts)}
            className="text-xs text-indigo-500 hover:text-indigo-600"
          >
            {showPrompts ? 'Hide prompts' : 'Show prompts'}
          </button>
        </div>

        {showPrompts && (
          <div className="mb-2 space-y-1">
            {PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => insertPrompt(prompt)}
                className="block w-full text-left px-3 py-2 rounded-lg bg-indigo-50 text-xs text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        <textarea
          value={entryText}
          onChange={(e) => setEntryText(e.target.value)}
          rows={5}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
          placeholder="Write about your day, your feelings, what's on your mind..."
        />
      </div>

      {/* Audio recorder */}
      <div>
        <AudioRecorder onTranscript={setAudioTranscript} />
        {audioTranscript && (
          <p className="mt-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">
            <span className="font-medium">Transcript:</span> {audioTranscript}
          </p>
        )}
      </div>

      {/* Micro-interventions */}
      <div>
        <button
          onClick={() => setShowInterventions(!showInterventions)}
          className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
        >
          <Sparkles size={14} />
          {showInterventions ? 'Hide wellbeing practices' : 'Wellbeing practices'}
        </button>

        {showInterventions && (
          <div className="mt-2 space-y-2">
            {MICRO_INTERVENTIONS.map((intervention, i) => {
              const Icon = intervention.icon;
              return (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-700">{intervention.label}</div>
                    <div className="text-xs text-slate-500">{intervention.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button
        onClick={handleSave}
        className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition-colors"
      >
        Save Journal Entry
      </button>
    </div>
  );
}
