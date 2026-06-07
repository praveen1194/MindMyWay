import { useState, useEffect } from 'react';
import { Save, Shield, ChevronDown } from 'lucide-react';
import { api } from '../../lib/api';
import type { Patient } from '../../types';
import Header from '../layout/Header';

interface ProfileFormProps {
  patientId: string;
  onPatientUpdate?: (patient: Patient) => void;
}

export default function ProfileForm({ patientId, onPatientUpdate }: ProfileFormProps) {
  const [form, setForm] = useState({
    name: '', age: '', gender: '', ethnicity: '', smoking: '', drinking: '',
    guardian_name: '', guardian_contact: '', consent_given: false,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (patientId) {
      api.getPatient(patientId).then((p: any) => {
        if (p) {
          setForm({
            name: p.name || '', age: String(p.age || ''), gender: p.gender || '',
            ethnicity: p.ethnicity || '', smoking: p.smoking || '', drinking: p.drinking || '',
            guardian_name: p.guardian_name || '', guardian_contact: p.guardian_contact || '',
            consent_given: !!p.consent_given,
          });
        }
      }).catch(() => {});
    }
  }, [patientId]);

  const isMinor = Number(form.age) > 0 && Number(form.age) < 18;

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {
        ...form,
        age: Number(form.age),
        guardian_name: isMinor ? form.guardian_name : null,
        guardian_contact: isMinor ? form.guardian_contact : null,
      };
      const result = await api.updatePatient(patientId, data);
      onPatientUpdate?.(result);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save profile:', err);
    }
    setSaving(false);
  };

  return (
    <div className="pb-4">
      <Header title="My Profile" subtitle="Your details are stored securely" />

      <div className="px-5 py-4 space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Full Name</label>
          <input
            type="text" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
            placeholder="Enter your name"
          />
        </div>

        {/* Age + Gender row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Age</label>
            <input
              type="number" value={form.age} min="1" max="120"
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Age"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Gender</label>
            <div className="relative">
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Non-binary</option>
                <option>Prefer not to say</option>
                <option>Other</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-3 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Ethnicity */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Ethnicity</label>
          <input
            type="text" value={form.ethnicity}
            onChange={(e) => setForm({ ...form, ethnicity: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="e.g. White British, Asian, Black African"
          />
        </div>

        {/* Smoking + Drinking */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Smoking</label>
            <div className="relative">
              <select
                value={form.smoking}
                onChange={(e) => setForm({ ...form, smoking: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="">Select</option>
                <option>Never</option>
                <option>Former</option>
                <option>Current</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-3 text-slate-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Drinking</label>
            <div className="relative">
              <select
                value={form.drinking}
                onChange={(e) => setForm({ ...form, drinking: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="">Select</option>
                <option>None</option>
                <option>Occasional</option>
                <option>Moderate</option>
                <option>Heavy</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-3 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Guardian fields for minors */}
        {isMinor && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
            <p className="text-xs font-medium text-amber-700">
              Since you are under 18, we need a parent/guardian's details
            </p>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Guardian Name</label>
              <input
                type="text" value={form.guardian_name}
                onChange={(e) => setForm({ ...form, guardian_name: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-amber-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                placeholder="Parent/guardian name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Guardian Contact</label>
              <input
                type="text" value={form.guardian_contact}
                onChange={(e) => setForm({ ...form, guardian_contact: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-amber-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                placeholder="Phone or email"
              />
            </div>
          </div>
        )}

        {/* Consent */}
        <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.consent_given}
              onChange={(e) => setForm({ ...form, consent_given: e.target.checked })}
              className="mt-1 w-4 h-4 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-300"
            />
            <div>
              <div className="flex items-center gap-1 text-sm font-medium text-slate-700">
                <Shield size={14} className="text-indigo-500" />
                Consent to share data
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                I agree that my anonymised data can be shared with my healthcare providers for better care
              </p>
            </div>
          </label>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Save size={16} />
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}
