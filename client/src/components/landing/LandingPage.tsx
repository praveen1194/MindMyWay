import { useNavigate } from 'react-router-dom';
import { Heart, Stethoscope, Shield } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 p-6">
      <div className="max-w-md w-full text-center">
        {/* Logo / Title */}
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center shadow-lg">
            <Heart size={36} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Mind My Way</h1>
          <p className="text-slate-500 mt-2 text-sm">
            Your mental health companion — journal, reflect, and connect with care.
          </p>
        </div>

        {/* Privacy badge */}
        <div className="flex items-center justify-center gap-1.5 mb-8 text-xs text-slate-400">
          <Shield size={14} />
          <span>NHS-grade data privacy &middot; Your data stays secure</span>
        </div>

        {/* Role selection */}
        <div className="space-y-4">
          <button
            onClick={() => navigate('/patient')}
            className="w-full p-5 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Heart size={24} />
            </div>
            <div className="text-left">
              <div className="font-semibold text-lg">I'm a Patient</div>
              <div className="text-indigo-200 text-sm">Journal, track, and reflect</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/clinician')}
            className="w-full p-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Stethoscope size={24} />
            </div>
            <div className="text-left">
              <div className="font-semibold text-lg">I'm a Clinician</div>
              <div className="text-emerald-200 text-sm">View reports & manage care</div>
            </div>
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-8">
          Demo application &middot; VibeHack London 2026
        </p>
      </div>
    </div>
  );
}
