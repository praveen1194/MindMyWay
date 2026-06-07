import { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  right?: ReactNode;
}

export default function Header({ title, subtitle, showBack = false, right }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 bg-white/90 backdrop-blur-sm z-40 px-5 py-3 border-b border-slate-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-slate-600 hover:text-slate-800">
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight">{title}</h1>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {right && <div>{right}</div>}
      </div>
    </div>
  );
}
