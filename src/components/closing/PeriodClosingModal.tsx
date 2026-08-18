import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Award,
  ArrowRight,
  Printer,
} from 'lucide-react';
import { store } from '../../lib/storage';
import { generateClosingEntries } from '../../lib/closingEngine';
import { formatIDR } from '../../lib/accountingEngine';
import { Modal } from '../common/Modal';
import { soundFx } from '../../lib/soundFx';
import { useStore } from '../../lib/storage';

interface PeriodClosingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PeriodClosingModal: React.FC<PeriodClosingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const closedPeriods = useStore((s) => s.closedPeriods);
  const accounts = useStore((s) => s.accounts);
  const journalEntries = useStore((s) => s.journalEntries);
  const currentUser = useStore((s) => s.currentUser);

  const generateMonthOptions = () => {
    const options = [];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth(); // 0-11

    for (let i = 0; i < 12; i++) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const mStr = (d.getMonth() + 1).toString().padStart(2, '0');
      const yStr = d.getFullYear();
      const value = `${yStr}-${mStr}`;
      const label = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      options.push({ value, label });
    }
    return options;
  };

  const monthOptions = generateMonthOptions();
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0].value);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [certData, setCertData] = useState<{
    certificateNumber: string;
    periodMonth: string;
    netIncome: number;
    closedAt: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isAlreadyClosed = closedPeriods.some((p) => p.periodMonth === selectedMonth);
  const preview = generateClosingEntries(accounts, journalEntries, selectedMonth);

  const handleExecuteClose = () => {
    setErrorMsg(null);
    const res = store.closeFiscalPeriod(selectedMonth);
    if (res.success && res.certificateNumber) {
      soundFx.playChime();
      setCertData({
        certificateNumber: res.certificateNumber,
        periodMonth: selectedMonth,
        netIncome: preview.netIncome,
        closedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      });
      setStep(3);
    } else {
      setErrorMsg(res.error || 'Gagal menutup periode akuntansi.');
    }
  };

  const handleUnlock = (month: string) => {
    soundFx.playClick();
    store.unlockFiscalPeriod(month);
    setStep(1);
    setCertData(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setStep(1);
        onClose();
      }}
      title="Wizard Tutup Buku & Jurnal Penutup (Closing Entries)"
      icon={<Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6 text-slate-900 dark:text-slate-100">
        {/* Top Dark Executive Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 dark:bg-[#1E1F22] border border-slate-800 dark:border-[#3F4147] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30 font-black text-xs font-mono">
              PSAK / SAK EMKM Standard
            </div>
            <div>
              <div className="text-sm font-black text-white">
                Proses Tutup Buku Periode Fiskal Bulanan
              </div>
              <div className="text-xs text-slate-300 mt-0.5">
                Nolkan Akun Pendapatan & Beban, Alokasikan Laba Bersih ke Laba Ditahan (Akun 3201/3202).
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black shadow-xs ${
                isAlreadyClosed
                  ? 'bg-rose-500 text-white'
                  : 'bg-emerald-500 text-white'
              }`}
            >
              {isAlreadyClosed ? 'Periode Terkunci' : 'Periode Terbuka'}
            </span>
          </div>
        </div>

        {/* Step 1: Period Selection & Pre-Closing Summary */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-900 dark:text-white mb-1.5 uppercase tracking-wider">
                  Pilih Periode Fiskal
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-3 text-xs rounded-xl bg-white dark:bg-[#1E1F22] border-2 border-slate-300 dark:border-[#4E5058] text-slate-900 dark:text-white font-black shadow-xs outline-none"
                >
                  {monthOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#2B2D31] border-2 border-emerald-300 dark:border-emerald-800 shadow-xs flex flex-col justify-between">
                <span className="text-[11px] uppercase font-black text-emerald-800 dark:text-emerald-300 block">
                  Total Pendapatan Periode
                </span>
                <span className="text-xl font-black text-emerald-700 dark:text-emerald-400 font-mono tabular-nums mt-1">
                  {formatIDR(preview.totalRevenue)}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#2B2D31] border-2 border-rose-300 dark:border-rose-800 shadow-xs flex flex-col justify-between">
                <span className="text-[11px] uppercase font-black text-rose-800 dark:text-rose-300 block">
                  Total Beban & HPP Periode
                </span>
                <span className="text-xl font-black text-rose-700 dark:text-rose-400 font-mono tabular-nums mt-1">
                  {formatIDR(preview.totalExpense)}
                </span>
              </div>
            </div>

            {/* High-Contrast Net Income Transferred Card */}
            <div className="p-5 rounded-2xl bg-slate-900 dark:bg-[#1E1F22] border border-slate-800 dark:border-[#3F4147] text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-slate-300 block">
                  Laba / (Rugi) Bersih yang Ditransfer ke Laba Ditahan:
                </span>
                <span
                  className={`text-2xl font-black font-mono tabular-nums mt-1 block ${
                    preview.netIncome >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {formatIDR(preview.netIncome)}
                </span>
              </div>
              <div className="text-left sm:text-right text-xs">
                <span className="text-slate-400 font-bold block">Nomor Entri Penutup:</span>
                <span className="font-mono font-black text-blue-300 text-sm">
                  JV-CLOSE-{selectedMonth.replace('-', '')}
                </span>
              </div>
            </div>

            {/* Closing Journal Lines Preview */}
            <div className="border-2 border-slate-200 dark:border-[#3F4147] rounded-2xl overflow-hidden shadow-xs bg-white dark:bg-[#1E1F22]">
              <div className="bg-slate-900 dark:bg-[#1E1F22] px-5 py-3 border-b border-slate-800 text-white flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  Draft Jurnal Penutup Majemuk (Compound Closing Entry)
                </span>
                <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Seimbang (Balanced)
                </span>
              </div>

              {/* Table Column Sub-headers */}
              <div className="grid grid-cols-12 px-5 py-2.5 bg-slate-100 dark:bg-[#2B2D31] border-b border-slate-200 dark:border-[#3F4147] text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase">
                <span className="col-span-8">Akun & Memo Penutupan</span>
                <span className="col-span-2 text-right">Debit (IDR)</span>
                <span className="col-span-2 text-right">Kredit (IDR)</span>
              </div>

              <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-[#3F4147] text-xs">
                {preview.closingEntry.lines.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 dark:text-[#B5BAC1] font-bold">
                    Tidak ada transaksi pendapatan atau beban di periode ini.
                  </div>
                ) : (
                  preview.closingEntry.lines.map((l, i) => {
                    const acc = accounts.find((a) => a.id === l.accountId);
                    return (
                      <div
                        key={i}
                        className="px-5 py-3 grid grid-cols-12 items-center hover:bg-slate-50 dark:hover:bg-[#383A40] transition-colors"
                      >
                        <div className="col-span-8 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
                          <span className="font-mono font-black text-[11px] text-slate-900 dark:text-white px-2 py-0.5 rounded bg-slate-100 dark:bg-[#2B2D31] border border-slate-300 dark:border-[#4E5058] self-start sm:self-center shrink-0">
                            {acc?.code}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white text-xs">
                              {acc?.name}
                            </span>
                            <span className="text-[11px] text-slate-600 dark:text-slate-300 block sm:inline sm:ml-1.5 font-medium">
                              ({l.memo})
                            </span>
                          </div>
                        </div>

                        <div className="col-span-2 text-right font-mono font-black text-xs tabular-nums text-blue-700 dark:text-blue-400">
                          {l.debit > 0 ? formatIDR(l.debit) : '-'}
                        </div>

                        <div className="col-span-2 text-right font-mono font-black text-xs tabular-nums text-indigo-700 dark:text-indigo-400">
                          {l.kredit > 0 ? formatIDR(l.kredit) : '-'}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              {isAlreadyClosed ? (
                <button
                  type="button"
                  onClick={() => handleUnlock(selectedMonth)}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-2 transition-all shadow-md"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Buka Kunci Periode (Unlock for Revisions)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all ml-auto"
                >
                  <span>Lanjutkan ke Neraca Saldo Penutup</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Post-Closing Trial Balance Confirmation */}
        {step === 2 && (
          <div className="space-y-4">
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border-2 border-rose-300 dark:border-rose-800 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="text-xs text-rose-900 dark:text-rose-200">
                  <span className="font-black">Gagal Menutup Periode:</span> {errorMsg}
                </div>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-950 dark:text-amber-100 font-medium">
                <span className="font-black text-sm block mb-0.5 text-amber-900 dark:text-amber-300">
                  Konfirmasi Kunci Buku Fiskal:
                </span>
                Setelah proses tutup buku dieksekusi, seluruh mutasi transaksi untuk periode {selectedMonth} akan dikunci permanen guna memenuhi kepatuhan standar audit.
              </div>
            </div>

            <div className="border-2 border-slate-200 dark:border-[#3F4147] rounded-2xl overflow-hidden shadow-xs bg-white dark:bg-[#1E1F22]">
              <div className="bg-slate-900 dark:bg-[#1E1F22] px-5 py-3 border-b border-slate-800 text-xs font-black text-white uppercase tracking-wider">
                Pratinjau Neraca Saldo Setelah Penutupan (Post-Closing Trial Balance)
              </div>
              <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-[#3F4147] text-xs">
                {preview.postClosingTrialBalance
                  .filter((r) => r.debit > 0 || r.kredit > 0)
                  .map((row) => (
                    <div key={row.accountId} className="px-5 py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#383A40]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-[11px] text-slate-900 dark:text-white px-2 py-0.5 rounded bg-slate-100 dark:bg-[#2B2D31] border border-slate-300 dark:border-[#4E5058]">
                          {row.accountCode}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">{row.accountName}</span>
                      </div>
                      <div className="flex items-center gap-6 font-mono font-black tabular-nums">
                        <span className="text-blue-700 dark:text-blue-400">
                          {row.debit > 0 ? formatIDR(row.debit) : '-'}
                        </span>
                        <span className="text-indigo-700 dark:text-indigo-400">
                          {row.kredit > 0 ? formatIDR(row.kredit) : '-'}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-[#3F4147] text-slate-800 dark:text-slate-200 text-xs font-black hover:bg-slate-100 dark:hover:bg-[#2B2D31] transition-colors"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleExecuteClose}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all"
              >
                <Lock className="w-4 h-4" />
                <span>Eksekusi Tutup Buku Resmi ({selectedMonth})</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Certificate of Closing */}
        {step === 3 && certData && (
          <div className="space-y-6 text-center py-4 print:fixed print:inset-0 print:bg-white print:z-[9999] print:p-12 print:flex print:flex-col print:items-center print:justify-center print:h-screen">
            <div className="inline-flex p-4 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400">
              <Award className="w-12 h-12" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Sertifikat Penutupan Buku Fiskal Resmi
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-mono font-bold">
                No. Sertifikasi: {certData.certificateNumber}
              </p>
            </div>

            <div className="max-w-md mx-auto p-5 rounded-2xl bg-slate-50 dark:bg-[#1E1F22] border-2 border-slate-200 dark:border-[#3F4147] text-left text-xs space-y-3 shadow-xs">
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-slate-600 dark:text-slate-400 font-bold">Periode Buku:</span>
                <span className="font-black text-slate-900 dark:text-white font-mono">{certData.periodMonth}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-slate-600 dark:text-slate-400 font-bold">Laba / (Rugi) Bersih Ditransfer:</span>
                <span
                  className={`font-black font-mono tabular-nums ${
                    certData.netIncome >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                  }`}
                >
                  {formatIDR(certData.netIncome)}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-slate-600 dark:text-slate-400 font-bold">Status Akun Nominal:</span>
                <span className="font-black text-slate-900 dark:text-white">Saldo 0.00 (Nol Bersih)</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-slate-600 dark:text-slate-400 font-bold">Otorisasi Oleh:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {currentUser.name} (Role: {currentUser.role.toUpperCase()})
                </span>
              </div>
              <div className="flex justify-between pt-0.5">
                <span className="text-slate-600 dark:text-slate-400 font-bold">Tanggal Kunci:</span>
                <span className="font-bold text-slate-900 dark:text-white">{certData.closedAt}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-[#3F4147] text-slate-800 dark:text-slate-200 text-xs font-black flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-[#383A40]"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Sertifikat Penutupan</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  onClose();
                }}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-lg shadow-blue-600/20"
              >
                Selesai
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
