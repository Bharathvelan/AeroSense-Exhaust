import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Toast: React.FC = () => {
  const { toast } = useApp();

  if (!toast) return null;

  const icons = {
    info: <Info className="w-4 h-4 text-cyan-400 shrink-0" />,
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
    error: <XCircle className="w-4 h-4 text-red-400 shrink-0" />,
  };

  const borders = {
    info: 'border-cyan-500/40 bg-[#0d1627]',
    success: 'border-emerald-500/40 bg-[#0c1d1a]',
    warning: 'border-amber-500/40 bg-[#1d170c]',
    error: 'border-red-500/40 bg-[#1f0d0d]',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 print:hidden">
      <div className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl text-xs font-mono max-w-md",
        borders[toast.type]
      )}>
        {icons[toast.type]}
        <span className="text-white font-medium">{toast.message}</span>
      </div>
    </div>
  );
};

