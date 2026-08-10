import React, { useState } from 'react';
import { Calculator,
  CalendarClock,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Info,
} from 'lucide-react';
import { AppState, store } from '../../lib/storage';
import { formatIDR } from '../../lib/accountingEngine';
import { Modal } from '../common/Modal';
import { soundFx } from '../../lib/soundFx';
import { useStore } from '../../lib/storage';

interface AmortizationScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  }

export const AmortizationScheduleModal: React.FC<AmortizationScheduleModalProps> = ({
  isOpen,
  onClose,
}) => {
  const prepaidExpenses = useStore(s => s.prepaidExpenses);

  const [selectedMonth, setSelectedMonth] = useState('2026-03');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const prepaids = prepaidExpenses || [];
  const totalPrepaidBalance = prepaids.reduce((sum, p) => sum + p.remainingBalance, 0);
  const totalMonthlyAmortization = prepaids.reduce((sum, p) => sum + p.monthlyAmortization, 0);

  const handlePostMonthlyAmortization = () => {
    soundFx.playChime();
    const res = store.postMonthlyAmortization(selectedMonth);
    if (res.success) {
      setSuccessMessage(
        `Jurnal Amortisasi Biaya Dibayar Dimuka Periode ${selectedMonth} (PSAK 1) sebesar ${formatIDR(totalMonthlyAmortization)} berhasil diposting ke Buku Besar!`
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Amortisasi Biaya Dibayar Dimuka (Prepaid Expenses - PSAK 1)" icon={<Calculator className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-700 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-teal-600/20">
          <div>
            <div className="text-[11px] font-black uppercase tracking-wider text-teal-100">
              Standar Akuntansi PSAK 1 / IFRS IAS 1
            </div>
            <div className="text-xl sm:text-2xl font-black mt-0.5">
              Jadwal Amortisasi Sewa & Asuransi Dimuka
            </div>
            <p className="text-xs text-teal-100 mt-1 max-w-xl">
              Alokasi biaya sewa gedung dan asuransi secara proporsional setiap bulan (Debit Beban Operasional vs Kredit 1105 Sewa Dibayar Dimuka).
            </p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-right">
            <div className="text-[10px] font-bold uppercase text-teal-100">Sisa Saldo Dimuka</div>
            <div className="text-2xl font-black tabular-nums">{formatIDR(totalPrepaidBalance)}</div>
            <div className="text-[10px] font-bold text-teal-200">
              Amortisasi/bln: {formatIDR(totalMonthlyAmortization)}
            </div>
          </div>
        </div>

        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Prepaids list */}
        <div className="border border-slate-200 dark:border-[#3F4147] rounded-2xl overflow-hidden">
          <div className="bg-slate-100/80 dark:bg-[#2B2D31] px-4 py-2.5 border-b border-slate-200 dark:border-[#3F4147] grid grid-cols-12 text-[11px] font-black text-slate-700 dark:text-slate-200 dark:text-[#DBDEE1] uppercase tracking-wider">
            <span className="col-span-4">Akun & Deskripsi Polis / Sewa</span>
            <span className="col-span-2 text-right">Nilai Awal</span>
            <span className="col-span-2 text-right">Amortisasi/Bulan</span>
            <span className="col-span-2 text-right">Sudah Diamortisasi</span>
            <span className="col-span-2 text-right">Sisa Saldo Aktiva</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-[#3F4147] text-xs">
            {prepaids.map((p) => {
              const progressPct = Math.round((p.amortizedAmount / p.initialAmount) * 100);
              return (
                <div key={p.id} className="p-4 grid grid-cols-12 items-center hover:bg-slate-50 dark:hover:bg-[#383A40] transition-colors">
                  <div className="col-span-4">
                    <div className="font-bold text-slate-800 dark:text-slate-200">{p.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Kode: {p.code} • Durasi: {p.durationMonths} Bulan • Mulai: {p.startDate}
                    </div>
                    {/* Mini progress bar */}
                    <div className="mt-1.5 w-40 h-1.5 rounded-full bg-slate-200 dark:bg-[#2B2D31] overflow-hidden">
                      <div className="h-full bg-teal-500 rounded-full" style={{ width: `${progressPct}%` }}></div>
                    </div>
                  </div>

                  <div className="col-span-2 text-right font-bold text-slate-600 dark:text-[#B5BAC1] tabular-nums">
                    {formatIDR(p.initialAmount)}
                  </div>

                  <div className="col-span-2 text-right font-black text-teal-600 dark:text-teal-400 tabular-nums">
                    {formatIDR(p.monthlyAmortization)}
                  </div>

                  <div className="col-span-2 text-right text-slate-500 dark:text-[#B5BAC1] tabular-nums">
                    {formatIDR(p.amortizedAmount)} ({progressPct}%)
                  </div>

                  <div className="col-span-2 text-right font-black text-slate-900 dark:text-white tabular-nums">
                    {formatIDR(p.remainingBalance)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action footer */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Pilih Periode Amortisasi:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#1E1F22] border border-slate-200 dark:border-[#3F4147] text-slate-800 dark:text-white font-bold"
            >
              <option value="2026-03">Maret 2026</option>
              <option value="2026-04">April 2026</option>
              <option value="2026-05">Mei 2026</option>
              <option value="2026-06">Juni 2026</option>
              <option value="2026-07">Juli 2026</option>
              <option value="2026-08">Agustus 2026</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handlePostMonthlyAmortization}
            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black shadow-lg shadow-teal-600/20 flex items-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Posting Jurnal Amortisasi Bulanan ({formatIDR(totalMonthlyAmortization)})</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
