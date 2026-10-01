import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let bg = 'bg-white border-slate-200 text-slate-800';
        let Icon = Info;
        let iconColor = 'text-blue-500';

        if (toast.type === 'success') {
          bg = 'bg-emerald-50 border-emerald-200 text-emerald-900';
          Icon = CheckCircle2;
          iconColor = 'text-emerald-600';
        } else if (toast.type === 'warning') {
          bg = 'bg-amber-50 border-amber-200 text-amber-900';
          Icon = AlertTriangle;
          iconColor = 'text-amber-600';
        } else if (toast.type === 'error') {
          bg = 'bg-rose-50 border-rose-200 text-rose-900';
          Icon = AlertCircle;
          iconColor = 'text-rose-600';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto shadow-lg border rounded-xl p-3.5 flex items-start gap-3 transition-all duration-300 animate-in slide-in-from-bottom-5 ${bg}`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1">
              {toast.title && <h4 className="text-xs font-bold leading-tight">{toast.title}</h4>}
              <p className="text-xs font-medium leading-relaxed opacity-90 mt-0.5">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
