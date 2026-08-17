import React from 'react';
import { Sparkles, ShieldAlert, CheckCircle2, ArrowRight, X } from 'lucide-react';
import { soundFx } from '../../lib/soundFx';

export type PokaYokeIssueType = 'low_stock' | 'overdue_ar' | 'cash_variance' | 'unbalanced_warning' | 'destructive_action';

export interface PokaYokeAnomaly {
  id: string;
  type: PokaYokeIssueType;
  title: string;
  description: string;
  impact: string;
  recommendedAction: string;
  autoFixLabel: string;
  onAutoFix: () => void;
}

interface PokaYokeModalProps {
  isOpen: boolean;
  onClose: () => void;
  anomaly: PokaYokeAnomaly | null;
}

export const PokaYokeModal: React.FC<PokaYokeModalProps> = ({
  isOpen,
  onClose,
  anomaly,
}) => {
  if (!isOpen || !anomaly) return null;

  const handleExecuteAutoFix = () => {
    soundFx.playAutoFix();
    anomaly.onAutoFix();
    onClose();
  };

  const getShadowColor = () => {
    if (anomaly.type === 'destructive_action' || anomaly.type === 'unbalanced_warning') {
      return 'shadow-[0_30px_80px_-15px_rgba(239,68,68,0.5)] dark:shadow-[0_30px_80px_-15px_rgba(239,68,68,0.25)] ring-4 ring-rose-500/30';
    }
    return 'shadow-[0_30px_80px_-15px_rgba(245,158,11,0.5)] dark:shadow-[0_30px_80px_-15px_rgba(245,158,11,0.25)] ring-4 ring-amber-500/30';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 dark:bg-black/90 backdrop-blur-lg transition-opacity"
        onClick={onClose}
      />

      {/* Defensive Container */}
      <div className={`relative w-full max-w-lg glass-card bg-white dark:bg-[#2B2D31] rounded-3xl ${getShadowColor()} overflow-hidden z-10 my-8 animate-in fade-in zoom-in duration-200`}>
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-amber-200/60 dark:border-amber-500/20 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-300">
                  Pusat Kontrol & Integritas Jurnal
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                {anomaly.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Anomaly Body */}
        <div className="p-6 space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1E1F22] border border-slate-200 dark:border-slate-700/60 space-y-2">
            <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              {anomaly.description}
            </p>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold">
              <span>Resiko / Dampak:</span>
              <span className="font-normal">{anomaly.impact}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-700/40 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-extrabold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Rekomendasi Tindakan Korektif:</span>
            </div>
            <p className="text-emerald-900 dark:text-emerald-200 text-[11px]">
              {anomaly.recommendedAction}
            </p>
          </div>
        </div>

        {/* Footer with 1-Click Auto Fix */}
        <div className="p-6 bg-slate-50/80 dark:bg-[#1E1F22]/80 border-t border-slate-100 dark:border-slate-800 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-3 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors text-center"
          >
            Abaikan Sekarang
          </button>

          <button
            type="button"
            onClick={handleExecuteAutoFix}
            className="min-h-[44px] flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:opacity-95 text-white text-xs font-black shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <ShieldAlert className="w-4 h-4 text-amber-300" />
            <span>{anomaly.autoFixLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
