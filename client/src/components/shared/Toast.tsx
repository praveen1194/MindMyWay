import { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

export default function Toast({ message, visible, onHide, duration = 2000 }: ToastProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onHide, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onHide]);

  if (!visible) return null;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[60] animate-slide-down">
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-200 text-sm font-medium">
        <CheckCircle size={16} />
        {message}
      </div>
    </div>
  );
}
