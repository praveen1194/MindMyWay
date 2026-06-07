import { useState } from 'react';
import { AlertTriangle, Shield, CheckCircle } from 'lucide-react';
import { api } from '../../lib/api';

interface RiskAssessmentProps {
  patientId: string;
  assessment: any;
  onConsentUpdate: () => void;
}

export default function RiskAssessment({ patientId, assessment, onConsentUpdate }: RiskAssessmentProps) {
  const [consentGiven, setConsentGiven] = useState(false);
  const [referralSent, setReferralSent] = useState(false);

  if (!assessment || !assessment.high_risk) return null;

  const handleConsent = async () => {
    try {
      await api.updateConsent(patientId, true);
      setReferralSent(true);
      onConsentUpdate();
    } catch (err) {
      console.error('Failed to update consent:', err);
    }
  };

  return (
    <div className="mx-4 mb-4 rounded-2xl border-2 border-red-200 bg-red-50 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-red-500 to-red-600">
        <div className="flex items-center gap-2 text-white">
          <AlertTriangle size={20} />
          <span className="font-bold">Important Notice</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <p className="text-sm text-slate-700">
          Based on your check-ins over the past 2 weeks, some patterns suggest it would be helpful to speak with a professional.
        </p>

        {/* Criteria breakdown */}
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2">
            <span className={assessment.criterion_1_met ? 'text-red-600' : 'text-slate-400'}>
              {assessment.criterion_1_met ? '●' : '○'} Depressed mood or loss of interest on most days
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={assessment.criterion_2_met ? 'text-red-600' : 'text-slate-400'}>
              {assessment.criterion_2_met ? '●' : '○'} 5+ core symptoms persisting 2+ weeks
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={assessment.criterion_3_met ? 'text-red-600' : 'text-slate-400'}>
              {assessment.criterion_3_met ? '●' : '○'} Signs of impaired functioning
            </span>
          </div>
        </div>

        {referralSent ? (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 text-green-700 text-sm">
            <CheckCircle size={18} />
            <span>Your information has been flagged for referral to your GP. A clinician may contact you.</span>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-2 p-3 rounded-xl bg-white">
              <Shield size={16} className="text-indigo-500 mt-0.5 shrink-0" />
              <label className="text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mr-1.5"
                />
                I consent to sharing my data with my healthcare provider for referral purposes
              </label>
            </div>

            <button
              onClick={handleConsent}
              disabled={!consentGiven}
              className="w-full py-2.5 rounded-xl bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Share with my GP
            </button>
          </>
        )}
      </div>
    </div>
  );
}
