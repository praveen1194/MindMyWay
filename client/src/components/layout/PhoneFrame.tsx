import { ReactNode } from 'react';

interface PhoneFrameProps {
  children: ReactNode;
}

export default function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <div
        className="relative bg-white overflow-hidden"
        style={{
          width: '390px',
          height: '844px',
          borderRadius: '44px',
          boxShadow: '0 25px 60px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)',
          border: '6px solid #1a1a2e',
        }}
      >
        {/* Status bar */}
        <div className="h-12 bg-white flex items-center justify-between px-8 pt-1 relative z-10">
          <span className="text-xs font-semibold text-slate-800">
            {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <div className="absolute left-1/2 -translate-x-1/2 top-1 w-28 h-6 bg-black rounded-full" />
          <div className="flex items-center gap-1">
            <div className="w-4 h-2.5 border border-slate-800 rounded-sm relative">
              <div className="absolute inset-0.5 bg-slate-800 rounded-[1px]" style={{ width: '70%' }} />
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="phone-scroll" style={{ height: 'calc(100% - 48px)', overflowY: 'auto', overflowX: 'hidden' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
