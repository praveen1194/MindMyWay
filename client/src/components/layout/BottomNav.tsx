import { useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, BarChart3, MessageCircle, User } from 'lucide-react';

interface BottomNavProps {
  patientId: string;
  pendingQuestionnaires?: number;
}

const tabs = [
  { path: '/patient/journal', label: 'Journal', icon: BookOpen },
  { path: '/patient/dashboard', label: 'Dashboard', icon: BarChart3 },
  { path: '/patient/chat', label: 'Chat', icon: MessageCircle },
  { path: '/patient/profile', label: 'Profile', icon: User },
];

export default function BottomNav({ patientId, pendingQuestionnaires = 0 }: BottomNavProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[378px] bg-white border-t border-slate-200 flex items-center justify-around py-2 z-50" style={{ borderRadius: '0 0 38px 38px' }}>
      {tabs.map((tab) => {
        const isActive = location.pathname.startsWith(tab.path);
        const Icon = tab.icon;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path.replace(':patientId', patientId))}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors relative ${
              isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
            <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>{tab.label}</span>
            {tab.path === '/patient/journal' && pendingQuestionnaires > 0 && (
              <span className="absolute -top-0.5 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center pulse-dot">
                {pendingQuestionnaires}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
