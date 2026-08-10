import React, { useState } from 'react';
import { Banknote,
  Coins,
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { AppState, store } from '../../lib/storage';
import { formatIDR } from '../../lib/accountingEngine';
import { Modal } from '../common/Modal';
import { soundFx } from '../../lib/soundFx';
import { useStore } from '../../lib/storage';

interface ForexStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  }

export const ForexStudioModal: React.FC<ForexStudioModalProps> = ({
  isOpen,
  onClose,
}) => {
  const forexExposures = useStore(s => s.forexExposures);
  const forexRates = useStore(s => s.forexRates);

  const [periodDate, setPeriodDate] = useState(new Date().toISOString().split('T')[0]);
  const [isPosting, setIsPosting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const exposures = forexExposures || [];
  const rates = forexRates || [];

  const totalUnrealizedGainLoss = exposures.reduce(
    (sum, exp) => sum + exp.unrealizedGainLossIDR,
    0
  );

  const handlePostRevaluation = () => {
    setIsPosting(true);
    soundFx.playChime();
    const res = store.postForexRevaluation(periodDate);
    if (res.success) {
      setSuccessMessage(
        `Jurnal Revaluasi Valuta Asing (PSAK 10) berhasil diposting ke Buku Besar! Dampak laba/rugi selisih kurs: ${formatIDR(res.gainLoss || 0)}.`
      );
      setTimeout(() => {
        setIsPosting(false);
      }, 500);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Multi-Currency & Revaluasi Selisih Kurs Valas (PSAK 10)" icon={<Banknote className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-amber-500/20">
          <div>
            <div className="text-[11px] font-black uppercase tracking-wider text-amber-100">
              Standar Akuntansi Keuangan PSAK 10 / IAS 21
            </div>
            <div className="text-xl sm:text-2xl font-black mt-0.5">
              Valuta Asing & Revaluasi Akhir Periode
            </div>
            <p className="text-xs text-amber-100 mt-1 max-w-xl">
              Penyesuaian nilai wajar piutang/hutang valas menggunakan kurs tengah Bank Indonesia (BI JISDOR) secara otomatis.
            </p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-right">
            <div className="text-[10px] font-bold uppercase text-amber-100">Net Selisih Kurs</div>
            <div className="text-2xl font-black tabular-nums">
              {formatIDR(totalUnrealizedGainLoss)}
            </div>
            <div className="text-[10px] font-bold text-amber-200">
              {totalUnrealizedGainLoss >= 0 ? 'Laba Kurs (Gain)' : 'Rugi Kurs (Loss)'}
            </div>
          </div>
        </div>

        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Forex Live Rates Table */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {rates.map((curr) => {
            const delta = curr.currentRate - curr.bookRate;
            return (
              <div
                key={curr.code}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#2B2D31] border border-slate-200/80 dark:border-[#3F4147]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800 dark:text-white">
                    {curr.code} ({curr.symbol})
                  </span>
                  <span className={`text-[10px] font-black flex items-center gap-0.5 ${
                    delta >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {delta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {delta >= 0 ? `+${delta}` : delta}
                  </span>
                </div>
                <div className="text-base font-black text-slate-900 dark:text-white mt-1 tabular-nums">
                  Rp {curr.currentRate.toLocaleString('id-ID')}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Kurs Buku: Rp {curr.bookRate.toLocaleString('id-ID')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Exposures List */}
        <div className="border border-slate-200 dark:border-[#3F4147] rounded-2xl overflow-hidden">
          <div className="bg-slate-100/80 dark:bg-[#2B2D31] px-4 py-2.5 border-b border-slate-200 dark:border-[#3F4147] text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
            Posisi Piutang & Hutang Valas yang Terbuka (Foreign Currency Exposures)
          </div>
          <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-[#3F4147] text-xs">
            {exposures.map((exp) => (
              <div key={exp.id} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#383A40]">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{exp.contactName}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    Nominal: {exp.currency} {exp.foreignAmount.toLocaleString()} • Nilai Buku: {formatIDR(exp.bookValueIDR)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900 dark:text-white tabular-nums">
                    Nilai Wajar: {formatIDR(exp.marketValueIDR)}
                  </div>
                  <div className={`text-[11px] font-black tabular-nums ${
                    exp.unrealizedGainLossIDR >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {exp.unrealizedGainLossIDR >= 0 ? '+' : ''}{formatIDR(exp.unrealizedGainLossIDR)} (Selisih Kurs)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Tanggal Revaluasi:</label>
            <input
              type="date"
              value={periodDate}
              onChange={(e) => setPeriodDate(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#1E1F22] border border-slate-200 dark:border-[#3F4147] text-slate-800 dark:text-white font-bold"
            />
          </div>

          <button
            type="button"
            onClick={handlePostRevaluation}
            disabled={isPosting}
            className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-lg shadow-amber-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>Posting Jurnal Revaluasi Valas ({formatIDR(totalUnrealizedGainLoss)})</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
