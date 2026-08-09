import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Award,
  FileCheck,
  Calendar,
  Layers,
  ArrowRight,
  Printer,
  Sparkles,
} from 'lucide-react';
import { AppState, store } from '../../lib/storage';
import { generateClosingEntries } from '../../lib/closingEngine';
import { formatIDR } from '../../lib/accountingEngine';
import { Modal } from '../common/Modal';
import { soundFx } from '../../lib/soundFx';

interface PeriodClosingModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
}

export const PeriodClosingModal: React.FC<PeriodClosingModalProps> = ({
  isOpen,
  onClose,
  state,
}) => {
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

  const isAlreadyClosed = state.closedPeriods.some((p) => p.periodMonth === selectedMonth);
  const preview = generateClosingEntries(state.accounts, state.journalEntries, selectedMonth);

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
      title="️ Wizard Tutup Buku & Jurnal Penutup (Closing Entries)" icon={<Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Step Header */}
        <div className="flex items-center justify-between bg-slate-50 dark:bg-[#2B2D31] p-3 rounded-2xl border border-slate-200/80 dark:border-[#3F4147]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 font-black text-xs">
              PSAK / SAK EMKM Standard
            </div>
            <div>
              <div className="text-xs font-black text-slate-800 dark:text-white">
                Proses Tutup Buku Periode Fiskal Bulanan
              </div>
              <div className="text-[11px] text-slate-500 dark:text-[#B5BAC1] dark:text-[#B5BAC1]">
                Nolkan Akun Pendapatan & Beban Alokasikan Saldo Bersih ke Akun 3201/3202 Laba Ditahan.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
              isAlreadyClosed
                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
            }`}>
              {isAlreadyClosed ? 'Periode Terkunci' : 'Periode Terbuka'}
            </span>
          </div>
        </div>

        {/* Step 1: Period Selection & Pre-Closing Summary */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-200 dark:text-slate-200 mb-1.5">
                  Pilih Periode Fiskal
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl bg-white dark:bg-[#1E1F22] border border-slate-200 dark:border-[#3F4147] text-slate-800 dark:text-white font-bold"
                >
                  {monthOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40">
                <span className="text-[10px] uppercase font-black text-emerald-800 dark:text-emerald-400 block">
                  Total Pendapatan Periode
                </span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {formatIDR(preview.totalRevenue)}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800/40">
                <span className="text-[10px] uppercase font-black text-rose-800 dark:text-rose-400 block">
                  Total Beban & HPP Periode
                </span>
                <span className="text-base font-black text-rose-600 dark:text-rose-400 tabular-nums">
                  {formatIDR(preview.totalExpense)}
                </span>
              </div>
            </div>

            {/* Net Income Callout */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-[#2B2D31] dark:to-[#313338] border border-blue-200 dark:border-[#3F4147] flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-blue-900 dark:text-blue-400 block uppercase tracking-wider">
                  Laba / (Rugi) Bersih yang Akan Ditransfer ke Ekuitas (Laba Ditahan)
                </span>
                <span className={`text-xl font-black tabular-nums ${preview.netIncome >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {formatIDR(preview.netIncome)}
                </span>
              </div>
              <div className="text-right text-xs font-bold text-slate-500 dark:text-[#B5BAC1] dark:text-[#B5BAC1]">
                Entri Penutup: <span className="font-mono text-blue-600 dark:text-blue-400">JV-CLOSE-{selectedMonth.replace('-', '')}</span>
              </div>
            </div>

            {/* Closing Journal Lines Preview */}
            <div className="border border-slate-200 dark:border-[#3F4147] rounded-2xl overflow-hidden">
              <div className="bg-slate-100/80 dark:bg-[#2B2D31] px-4 py-2.5 border-b border-slate-200 dark:border-[#3F4147] flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 dark:text-slate-200 dark:text-slate-200 uppercase tracking-wider">
                  Draft Jurnal Penutup Majemuk (Compound Closing Entry)
                </span>
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Seimbang (Balanced)
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-[#3F4147] text-xs">
                {preview.closingEntry.lines.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 dark:text-[#B5BAC1] dark:text-[#B5BAC1]">
                    Tidak ada transaksi pendapatan atau beban di periode ini.
                  </div>
                ) : (
                  preview.closingEntry.lines.map((l, i) => {
                    const acc = state.accounts.find((a) => a.id === l.accountId);
                    return (
                      <div key={i} className="px-4 py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#383A40]">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-400 font-bold">{acc?.code}</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{acc?.name}</span>
                          <span className="text-[10px] text-slate-400">({l.memo})</span>
                        </div>
                        <div className="flex items-center gap-6 font-mono font-bold tabular-nums">
                          <span className={l.debit > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-300'}>
                            {l.debit > 0 ? formatIDR(l.debit) : '-'}
                          </span>
                          <span className={l.kredit > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-300'}>
                            {l.kredit > 0 ? formatIDR(l.kredit) : '-'}
                          </span>
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
                  className="px-4 py-2.5 rounded-xl border border-rose-300 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-black flex items-center gap-2 transition-all"
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
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="text-xs text-rose-900 dark:text-rose-200">
                  <span className="font-bold">Gagal Menutup Periode:</span> {errorMsg}
                </div>
              </div>
            )}
            
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 dark:text-amber-200">
                <span className="font-bold">Konfirmasi Kunci Buku Fiskal:</span> Setelah tutup buku dilakukan, seluruh transaksi tanggal {selectedMonth}-01 s.d. {selectedMonth}-{(() => {
                  const [y, m] = selectedMonth.split('-');
                  return new Date(parseInt(y), parseInt(m), 0).getDate();
                })()} akan dikunci permanen untuk mencegah manipulasi data historis.
              </div>
            </div>

            <div className="border border-slate-200 dark:border-[#3F4147] rounded-2xl overflow-hidden">
              <div className="bg-slate-100/80 dark:bg-[#2B2D31] px-4 py-2.5 border-b border-slate-200 dark:border-[#3F4147] text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                Pratinjau Neraca Saldo Setelah Penutupan (Post-Closing Trial Balance)
              </div>
              <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-[#3F4147] text-xs">
                {preview.postClosingTrialBalance.filter((r) => r.debit > 0 || r.kredit > 0).map((row) => (
                  <div key={row.accountId} className="px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400">{row.accountCode}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{row.accountName}</span>
                    </div>
                    <div className="flex items-center gap-6 font-mono font-bold tabular-nums">
                      <span>{row.debit > 0 ? formatIDR(row.debit) : '-'}</span>
                      <span>{row.kredit > 0 ? formatIDR(row.kredit) : '-'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#3F4147] text-slate-700 dark:text-slate-200 dark:text-slate-200 text-xs font-black"
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
            <div className="inline-flex p-4 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400">
              <Award className="w-12 h-12" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Sertifikat Penutupan Buku Fiskal Resmi
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#B5BAC1] dark:text-[#B5BAC1] mt-1 font-mono">
                No. Sertifikasi: {certData.certificateNumber}
              </p>
            </div>

            <div className="max-w-md mx-auto p-5 rounded-2xl bg-slate-50 dark:bg-[#2B2D31] border border-slate-200 dark:border-[#3F4147] text-left text-xs space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-[#B5BAC1] dark:text-[#B5BAC1]">Periode Buku:</span>
                <span className="font-black text-slate-800 dark:text-white">{certData.periodMonth}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-[#B5BAC1] dark:text-[#B5BAC1]">Laba / (Rugi) Bersih Ditransfer:</span>
                <span className={`font-black tabular-nums ${certData.netIncome >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {formatIDR(certData.netIncome)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-[#B5BAC1] dark:text-[#B5BAC1]">Status Akun Nominal:</span>
                <span className="font-bold text-slate-800 dark:text-white">Saldo 0.00 (Nol)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-[#B5BAC1] dark:text-[#B5BAC1]">Otorisasi Oleh:</span>
                <span className="font-bold text-slate-800 dark:text-white">{state.currentUser.name} (Role: {state.currentUser.role.toUpperCase()})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-[#B5BAC1] dark:text-[#B5BAC1]">Tanggal Kunci:</span>
                <span className="font-bold text-slate-800 dark:text-white">{certData.closedAt}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#3F4147] text-slate-700 dark:text-slate-200 dark:text-slate-200 text-xs font-black flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-[#383A40]"
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
