import { X, Phone, Heart } from 'lucide-react';

interface EmergencyBannerProps {
  onClose: () => void;
}

export default function EmergencyBanner({ onClose }: EmergencyBannerProps) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl">
        {/* Red header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/20 flex items-center justify-center">
            <Heart size={32} className="text-white" />
          </div>
          <h2 className="text-white text-xl font-bold">You're not alone</h2>
          <p className="text-red-100 text-sm mt-1">It's okay to ask for help right now</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-slate-600 text-sm text-center">
            If you're having thoughts of death or self-harm, please reach out to someone who can help:
          </p>

          <div className="space-y-3">
            <a
              href="tel:116123"
              className="flex items-center gap-3 p-3 rounded-xl bg-red-50 hover:bg-red-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                <Phone size={18} className="text-white" />
              </div>
              <div>
                <div className="font-semibold text-slate-800">Samaritans</div>
                <div className="text-sm text-slate-500">116 123 — Free, 24/7</div>
              </div>
            </a>

            <a
              href="tel:111"
              className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <Phone size={18} className="text-white" />
              </div>
              <div>
                <div className="font-semibold text-slate-800">NHS 111</div>
                <div className="text-sm text-slate-500">Non-emergency medical help</div>
              </div>
            </a>

            <a
              href="tel:999"
              className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
                <Phone size={18} className="text-white" />
              </div>
              <div>
                <div className="font-semibold text-slate-800">Emergency: 999</div>
                <div className="text-sm text-slate-500">If in immediate danger</div>
              </div>
            </a>
          </div>

          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-slate-100 text-slate-600 font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
            >
              <X size={18} />
              I'm safe — close this
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
