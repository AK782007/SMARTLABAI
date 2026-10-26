import React from 'react';
import { useLabNet } from '../../context/LabNetContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useLabNet();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const icons = {
          success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
          warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
          error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
          info: <Info className="w-4 h-4 text-cyan-400 shrink-0" />
        };

        const borders = {
          success: 'border-emerald-500/30 bg-[#0E1B1D]',
          warning: 'border-amber-500/30 bg-[#1D170E]',
          error: 'border-rose-500/30 bg-[#1D0E12]',
          info: 'border-cyan-500/30 bg-[#0A1624]'
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3 rounded-lg border shadow-xl backdrop-blur-md text-xs text-slate-200 transition-all transform animate-in fade-in slide-in-from-bottom-2 ${borders[toast.type]}`}
          >
            <div className="mt-0.5">{icons[toast.type]}</div>
            <p className="flex-1 leading-relaxed text-slate-200">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-200 p-0.5 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
