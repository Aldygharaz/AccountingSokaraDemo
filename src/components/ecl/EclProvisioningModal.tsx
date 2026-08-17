import React, { useState } from 'react';
import {
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import { AppState, store } from '../../lib/storage';
import {
  computeEclProvisionMatrix,
  generateEclJournal,
  EclProvisionSummary,
} from '../../lib/eclEngine';
import { formatIDR } from '../../lib/accountingEngine';
import { Modal } from '../common/Modal';
import { soundFx } from '../../lib/soundFx';
import { useStore } from '../../lib/storage';

interface EclProvisioningModalProps {
  isOpen: boolean;
  onClose: () => void;
  }

export const EclProvisioningModal: React.FC<EclProvisioningModalProps> = ({
  isOpen,
  onClose,
}) => {
  const invoices = useStore(s => s.invoices);
  const journalEntries = useStore(s => s.journalEntries);

  const [asOfDate, setAsOfDate] = useState('2026-08-31');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const ecl = computeEclProvisionMatrix(invoices, asOfDate);

  const handlePostEclJournal = () => {
    soundFx.playChaChing();
    const journal = generateEclJournal(ecl, asOfDate);
    store.state.journalEntries.push(journal);
    store.notify();
    setSuccessMessage(
      `Jurnal Penyisihan Cadangan Kerugian Piutang PSAK 71 / IFRS 9 sebesar ${formatIDR(ecl.incrementalProvisionExpense)} berhasil diposting ke Buku Besar!`
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="PSAK 71 / IFRS 9 Expected Credit Loss (ECL) & CKPN Piutang" icon={<ShieldAlert className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
      maxWidth="max-w-5xl"
    >
      <div className="space-y-6">
        {/* Banner */}
        <div className="p-4 rounded-2xl bg-slate-900 dark:bg-[#1E1F22] border border-slate-800 dark:border-[#3F4147] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <div className="text-[11px] font-black uppercase tracking-wider text-rose-200">
              Standar Akuntansi Keuangan PSAK 71 / IFRS 9 Financial Instruments
            </div>
            <div className="text-xl sm:text-2xl font-black mt-0.5">
              Matriks Penurunan Nilai Piutang Usaha (ECL Loss Allowance)
            </div>
            <p className="text-xs text-rose-100 mt-1 max-w-xl">
              Pembentukan Cadangan Kerugian Penurunan Nilai (CKPN) berdasarkan model *forward-looking* Expected Credit Loss 3-Stage Model.
            </p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-right">
            <div className="text-[10px] font-bold uppercase text-rose-200">Total Beban Cadangan (ECL)</div>
            <div className="text-2xl font-black tabular-nums">{formatIDR(ecl.incrementalProvisionExpense)}</div>
            <div className="text-[10px] font-bold text-pink-200">
              Total Piutang Bruto: {formatIDR(ecl.totalGrossReceivables)}
            </div>
          </div>
        </div>

        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 3-Stage Breakdown Table */}
        <div className="border border-slate-200 dark:border-[#3F4147] rounded-2xl overflow-hidden text-xs">
          <div className="bg-slate-100 dark:bg-[#2B2D31] px-4 py-2.5 border-b border-slate-200 dark:border-[#3F4147] font-black text-slate-800 dark:text-white uppercase grid grid-cols-12">
            <span className="col-span-4">Klasifikasi Tahap Risiko (PSAK 71 Stages)</span>
            <span className="col-span-2 text-right">Piutang Bruto</span>
            <span className="col-span-2 text-right">PD %</span>
            <span className="col-span-2 text-right">LGD %</span>
            <span className="col-span-2 text-right">Nilai CKPN (ECL)</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-[#3F4147]">
            {ecl.buckets.map((b, idx) => (
              <div key={idx} className="p-4 grid grid-cols-12 items-center hover:bg-slate-50 dark:hover:bg-[#383A40] transition-colors">
                <div className="col-span-4">
                  <div className="font-bold text-slate-800 dark:text-slate-200">{b.stage}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Rentang Hari: {b.dayRange} • {b.invoiceCount} Faktur
                  </div>
                </div>

                <div className="col-span-2 text-right font-bold text-slate-700 dark:text-slate-200 tabular-nums">
                  {formatIDR(b.grossCarryingAmount)}
                </div>

                <div className="col-span-2 text-right font-mono text-blue-600 dark:text-blue-400 font-bold tabular-nums">
                  {b.probabilityOfDefaultPct}%
                </div>

                <div className="col-span-2 text-right font-mono text-slate-500 tabular-nums">
                  {b.lossGivenDefaultPct}%
                </div>

                <div className="col-span-2 text-right font-black text-rose-600 dark:text-rose-400 tabular-nums font-mono">
                  {formatIDR(b.lossAllowanceAmount)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div className="text-xs text-slate-600 dark:text-slate-400 max-w-lg">
            Jurnal otomatis akan mendebit <strong>Beban Kerugian Piutang (6101)</strong> dan mengkredit <strong>Akumulasi Cadangan Kerugian Piutang (1103)</strong>.
          </div>

          <button
            type="button"
            onClick={handlePostEclJournal}
            className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-lg shadow-rose-600/20 flex items-center gap-2 transition-all shrink-0"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Posting Jurnal Cadangan PSAK 71 ({formatIDR(ecl.incrementalProvisionExpense)})</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
