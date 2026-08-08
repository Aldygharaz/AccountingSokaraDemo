import React from 'react';
import { X, ArrowUpDown, FileSpreadsheet, CheckCircle2, History } from 'lucide-react';
import { Account, JournalEntry } from '../../types/accounting';
import { formatIDR } from '../../lib/accountingEngine';

interface LedgerDrilldownDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
  journalEntries: JournalEntry[];
}

export const LedgerDrilldownDrawer: React.FC<LedgerDrilldownDrawerProps> = ({
  isOpen,
  onClose,
  account,
  journalEntries,
}) => {
  if (!isOpen || !account) return null;

  // Extract all lines touching this account
  let runningBalance = 0;
  const mutations: {
    entryNumber: string;
    date: string;
    description: string;
    debit: number;
    kredit: number;
    runningBalance: number;
    memo?: string;
  }[] = [];

  journalEntries.forEach((je) => {
    je.lines.forEach((l) => {
      if (l.accountId === account.id) {
        if (account.normalBalance === 'debit') {
          runningBalance += (l.debit || 0) - (l.kredit || 0);
        } else {
          runningBalance += (l.kredit || 0) - (l.debit || 0);
        }

        mutations.push({
          entryNumber: je.entryNumber,
          date: je.date,
          description: je.description,
          debit: l.debit,
          kredit: l.kredit,
          runningBalance,
          memo: l.memo,
        });
      }
    });
  });

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 dark:bg-black/90 backdrop-blur-lg transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Body */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#2B2D31] h-full shadow-[-30px_0_80px_-15px_rgba(0,0,0,0.7)] z-10 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200 border-l border-slate-200 dark:border-slate-700/50 ring-1 ring-black/5 dark:ring-white/10">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1E1F22] flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
                {account.code}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Buku Besar (T-Account Ledger)
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
              {account.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Kategori: <strong>{account.type.toUpperCase()}</strong> • Saldo Normal: <strong>{account.normalBalance.toUpperCase()}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Balance KPI */}
        <div className="p-6 bg-gradient-to-r from-blue-600/10 via-indigo-600/5 to-transparent border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Saldo Akhir Berjalan
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
              {formatIDR(runningBalance)}
            </div>
          </div>

          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 px-3 py-1 rounded-full">
            {mutations.length} Mutasi Transaksi
          </span>
        </div>

        {/* Mutations Table */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#1E1F22] border-b border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-500 uppercase">
                  <th className="py-2.5 px-3">Tanggal / No. Jurnal</th>
                  <th className="py-2.5 px-3">Keterangan / Memo</th>
                  <th className="py-2.5 px-3 text-right">Debit</th>
                  <th className="py-2.5 px-3 text-right">Kredit</th>
                  <th className="py-2.5 px-3 text-right">Saldo Berjalan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {mutations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      Belum ada mutasi jurnal untuk akun ini.
                    </td>
                  </tr>
                ) : (
                  mutations.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-2.5 px-3">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400 block">
                          {m.entryNumber}
                        </span>
                        <span className="text-[10px] text-slate-400">{m.date}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{m.description}</div>
                        {m.memo && <span className="text-[10px] text-slate-400">{m.memo}</span>}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                        {m.debit > 0 ? formatIDR(m.debit) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                        {m.kredit > 0 ? formatIDR(m.kredit) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-black text-blue-700 dark:text-blue-400 tabular-nums">
                        {formatIDR(m.runningBalance)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
