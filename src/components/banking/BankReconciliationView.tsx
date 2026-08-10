import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  PlusCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { AppState } from '../../lib/storage';
import { formatIDR } from '../../lib/accountingEngine';
import { soundFx } from '../../lib/soundFx';
import { useStore } from '../../lib/storage';

interface BankReconciliationViewProps {
  onReconcileItem: (statementId: string) => void;
  onRecordFeeOrInterest: (data: {
    type: 'fee' | 'interest';
    amount: number;
    date: string;
    bankAccountId: string;
  }) => { success: boolean; error?: string };
}

export const BankReconciliationView: React.FC<BankReconciliationViewProps> = ({
  onReconcileItem,
  onRecordFeeOrInterest,
}) => {
  const accounts = useStore(s => s.accounts);
  const journalEntries = useStore(s => s.journalEntries);
  const bankStatements = useStore(s => s.bankStatements);

  const [selectedBankAccountId, setSelectedBankAccountId] = useState('acc-1102'); // Bank BCA
  const [datePeriod, setDatePeriod] = useState('2026-08');

  const bankAccount = accounts.find((a) => a.id === selectedBankAccountId);

  // Compute live ledger bank balance
  let ledgerBalance = 0;
  journalEntries.forEach((je) => {
    je.lines.forEach((l) => {
      if (l.accountId === selectedBankAccountId) {
        ledgerBalance += (l.debit || 0) - (l.kredit || 0);
      }
    });
  });

  const unreconciledCount = bankStatements.filter((b) => !b.isReconciled).length;

  const handleAutoMatch = () => {
    soundFx.playAutoFix();
    bankStatements.forEach((b) => {
      if (!b.isReconciled && b.referenceNo) {
        onReconcileItem(b.id);
      }
    });
  };

  const handleRecordUnrecorded = (b: any) => {
    soundFx.playClick();
    const type = b.description.toLowerCase().includes('bunga') ? 'interest' : 'fee';
    const res = onRecordFeeOrInterest({
      type,
      amount: b.amount,
      date: b.date,
      bankAccountId: selectedBankAccountId,
    });
    if (res.success) {
      onReconcileItem(b.id);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Rekonsiliasi Bank 1-Klik (Bank Reconciliation)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pencocokan mutasi rekening koran bank terhadap buku besar kas & bank secara otomatis.
          </p>
        </div>

        <button
          onClick={handleAutoMatch}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white text-xs font-black shadow-lg shadow-blue-600/25 transition-all self-start sm:self-auto hover:scale-[1.02] active:scale-[0.98]"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Auto-Match Semua Mutasi Faktur</span>
        </button>
      </div>

      {/* Account Balance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl glass-card border border-slate-200 dark:border-[#3F4147]">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-[#B5BAC1]">
            Rekening Terpilih
          </span>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
            {bankAccount?.name} ({bankAccount?.code})
          </h3>
          <p className="text-xs text-slate-400 dark:text-[#B5BAC1] mt-1">Status: Terhubung (Live Bank Feed BCA API Mock)</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-200 dark:border-[#3F4147]">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-[#B5BAC1]">
            Saldo Buku Besar (GL Ledger)
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums mt-1">
            {formatIDR(ledgerBalance)}
          </div>
          <p className="text-xs text-emerald-600 font-bold mt-1">
            {journalEntries.filter((j) => j.lines.some((l) => l.accountId === selectedBankAccountId)).length} Transaksi Jurnal
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300">
            Perlu Tindak Lanjut
          </span>
          <div className="text-2xl font-black text-amber-900 dark:text-amber-200 tabular-nums mt-1">
            {unreconciledCount} Mutasi
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
            Biaya admin bank & bunga giro belum terjurnal.
          </p>
        </div>
      </div>

      {/* Statements Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-[#3F4147] bg-slate-50 dark:bg-[#1E1F22] flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Mutasi Rekening Koran Bank BCA ({bankStatements.length} baris)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-[#1E1F22] border-b border-slate-200 dark:border-[#3F4147] text-[11px] font-bold text-slate-500 dark:text-[#B5BAC1] uppercase">
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Deskripsi Rekening Koran</th>
                <th className="py-3 px-4 text-right">Debit (Keluar)</th>
                <th className="py-3 px-4 text-right">Kredit (Masuk)</th>
                <th className="py-3 px-4 text-center">Status Rekonsiliasi</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#3F4147]">
              {bankStatements.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-[#2B2D31] transition-colors">
                  <td className="py-3 px-4 text-slate-500 dark:text-[#B5BAC1]">{item.date}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {item.description}
                    </span>
                    {item.referenceNo && (
                      <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400">
                        Ref: {item.referenceNo}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-rose-600 tabular-nums">
                    {item.type === 'debit' ? formatIDR(item.amount) : '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 tabular-nums">
                    {item.type === 'credit' ? formatIDR(item.amount) : '-'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        item.isReconciled
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                      }`}
                    >
                      {item.isReconciled ? 'Terkonsiliasi' : 'Belum Cocok'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.isReconciled ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                        Cocok
                      </span>
                    ) : item.referenceNo ? (
                      <button
                        onClick={() => {
                          soundFx.playClick();
                          onReconcileItem(item.id);
                        }}
                        className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                      >
                        Cocokkan
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRecordUnrecorded(item)}
                        className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs"
                      >
                        Post Jurnal Otomatis
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
