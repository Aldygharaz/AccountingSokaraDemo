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
  ShieldCheck,
  Search,
  SlidersHorizontal,
  CheckCheck,
} from 'lucide-react';
import { AppState } from '../../lib/storage';
import { formatIDR } from '../../lib/accountingEngine';
import { soundFx } from '../../lib/soundFx';
import { useStore } from '../../lib/storage';
import { Tooltip } from '../common/Tooltip';

interface BankReconciliationViewProps {
  onReconcileItem: (statementId: string) => void;
  onRecordFeeOrInterest: (data: {
    type: 'fee' | 'interest';
    amount: number;
    date: string;
    bankAccountId: string;
  }) => { success: boolean; error?: string };
}

interface MatchCandidate {
  statementId: string;
  confidence: number; // 100, 90, 75, 0
  reason: string;
  matchedType: 'exact_ref' | 'amount_date' | 'fee_tolerance' | 'unmatched';
}

export const BankReconciliationView: React.FC<BankReconciliationViewProps> = ({
  onReconcileItem,
  onRecordFeeOrInterest,
}) => {
  const accounts = useStore(s => s.accounts);
  const journalEntries = useStore(s => s.journalEntries);
  const bankStatements = useStore(s => s.bankStatements);
  const invoices = useStore(s => s.invoices);
  const purchaseBills = useStore(s => s.purchaseBills);
  const cashTransactions = useStore(s => s.cashTransactions);

  const [selectedBankAccountId, setSelectedBankAccountId] = useState('acc-1102'); // Bank BCA
  const [filterConfidence, setFilterConfidence] = useState<'all' | 'unreconciled' | 'high_confidence'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [batchSuccessCount, setBatchSuccessCount] = useState<number | null>(null);

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

  // Multi-heuristic confidence scoring engine
  const candidates: Record<string, MatchCandidate> = React.useMemo(() => {
    const result: Record<string, MatchCandidate> = {};

    bankStatements.forEach((stmt) => {
      if (stmt.isReconciled) {
        result[stmt.id] = {
          statementId: stmt.id,
          confidence: 100,
          reason: 'Sudah terekonsiliasi ke Buku Besar',
          matchedType: 'exact_ref',
        };
        return;
      }

      // Rule 1: Exact reference number match (100% confidence)
      if (stmt.referenceNo) {
        const hasInv = invoices.some((i) => i.invoiceNumber === stmt.referenceNo);
        const hasBill = purchaseBills.some((b) => b.billNumber === stmt.referenceNo);
        if (hasInv || hasBill) {
          result[stmt.id] = {
            statementId: stmt.id,
            confidence: 100,
            reason: `No. Ref Sah (${stmt.referenceNo})`,
            matchedType: 'exact_ref',
          };
          return;
        }
      }

      // Rule 2: Exact Amount & Proximity Date match (90% confidence)
      const stmtDate = new Date(stmt.date).getTime();
      const hasCloseCash = cashTransactions.some((c) => {
        const cDate = new Date(c.date).getTime();
        const daysDiff = Math.abs((stmtDate - cDate) / (1000 * 60 * 60 * 24));
        return Math.abs(c.amount - stmt.amount) < 0.01 && daysDiff <= 3;
      });

      if (hasCloseCash) {
        result[stmt.id] = {
          statementId: stmt.id,
          confidence: 90,
          reason: 'Nominal & Tanggal Kas Cocok (±3 Hari)',
          matchedType: 'amount_date',
        };
        return;
      }

      // Rule 3: Keyword / Fee tolerance rule (75% confidence)
      const desc = stmt.description.toLowerCase();
      if (desc.includes('bunga') || desc.includes('adm') || desc.includes('pajak') || desc.includes('biaya') || desc.includes('fee')) {
        result[stmt.id] = {
          statementId: stmt.id,
          confidence: 75,
          reason: 'Mutasi Biaya Admin / Bunga Bank (Auto-Post)',
          matchedType: 'fee_tolerance',
        };
        return;
      }

      // Fallback
      result[stmt.id] = {
        statementId: stmt.id,
        confidence: 0,
        reason: 'Belum terdeteksi di pembukuan',
        matchedType: 'unmatched',
      };
    });

    return result;
  }, [bankStatements, invoices, purchaseBills, cashTransactions]);

  const unreconciledCount = bankStatements.filter((b) => !b.isReconciled).length;
  const matchableCount = bankStatements.filter((b) => !b.isReconciled && (candidates[b.id]?.confidence || 0) >= 75).length;

  // Batch Auto-Match with tolerance
  const handleBatchAutoMatch = () => {
    soundFx.playAutoFix();
    let count = 0;
    bankStatements.forEach((b) => {
      if (!b.isReconciled) {
        const cand = candidates[b.id];
        if (cand && cand.confidence >= 90) {
          onReconcileItem(b.id);
          count++;
        } else if (cand && cand.confidence === 75) {
          const type = b.description.toLowerCase().includes('bunga') ? 'interest' : 'fee';
          const res = onRecordFeeOrInterest({
            type,
            amount: b.amount,
            date: b.date,
            bankAccountId: selectedBankAccountId,
          });
          if (res.success) {
            onReconcileItem(b.id);
            count++;
          }
        }
      }
    });
    setBatchSuccessCount(count);
    setTimeout(() => setBatchSuccessCount(null), 4000);
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

  // Filtered statement rows
  const filteredStatements = bankStatements.filter((item) => {
    if (filterConfidence === 'unreconciled' && item.isReconciled) return false;
    if (filterConfidence === 'high_confidence' && (!item.isReconciled && (candidates[item.id]?.confidence || 0) < 75)) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return item.description.toLowerCase().includes(q) || (item.referenceNo && item.referenceNo.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Rekonsiliasi Bank Otomatis & Fuzzy Match (Bank Feed Engine)
            </h1>
            <Tooltip
              title="Multi-Heuristic Confidence Match"
              content="Algoritma pencocokan mutasi bank terhadap buku besar menggunakan toleransi nomor referensi (100%), kesamaan nominal dan rentang tanggal ±3 hari (90%), serta deteksi biaya admin/bunga bank (75%)."
              iconOnly
            />
          </div>
          <p className="text-sm text-slate-500 dark:text-[#B5BAC1] mt-1">
            Pencocokan mutasi rekening koran bank terhadap buku besar kas & bank secara cerdas dengan toleransi pembulatan.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={handleBatchAutoMatch}
            disabled={matchableCount === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white text-xs font-black shadow-lg shadow-blue-600/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Auto-Match Semua ({matchableCount} Siap Rekonsil)</span>
          </button>
        </div>
      </div>

      {batchSuccessCount !== null && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Berhasil merekonsiliasi {batchSuccessCount} baris mutasi bank ke Buku Besar!</span>
        </div>
      )}

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
            {matchableCount} mutasi dapat dicocokkan otomatis secara instan.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#2B2D31] border border-slate-200 dark:border-[#3F4147]">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterConfidence('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterConfidence === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-[#1E1F22] text-slate-600 dark:text-[#DBDEE1]'
            }`}
          >
            Semua ({bankStatements.length})
          </button>
          <button
            onClick={() => setFilterConfidence('unreconciled')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterConfidence === 'unreconciled'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-[#1E1F22] text-slate-600 dark:text-[#DBDEE1]'
            }`}
          >
            Belum Cocok ({unreconciledCount})
          </button>
          <button
            onClick={() => setFilterConfidence('high_confidence')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterConfidence === 'high_confidence'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-[#1E1F22] text-slate-600 dark:text-[#DBDEE1]'
            }`}
          >
            Siap Match ({matchableCount})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari mutasi rekening..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl glass-input"
          />
        </div>
      </div>

      {/* Statements Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-[#3F4147] bg-slate-50 dark:bg-[#1E1F22] flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Mutasi Rekening Koran Bank BCA ({filteredStatements.length} baris)
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
                <th className="py-3 px-4 text-center">Tingkat Keyakinan (Confidence)</th>
                <th className="py-3 px-4 text-center">Aksi Rekonsil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#3F4147]">
              {filteredStatements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ada mutasi yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredStatements.map((item) => {
                  const cand = candidates[item.id] || { confidence: 0, reason: '', matchedType: 'unmatched' };
                  return (
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
                        {item.isReconciled ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <CheckCheck className="w-3 h-3 text-emerald-600" />
                            <span>100% Terkonsiliasi</span>
                          </span>
                        ) : cand.confidence === 100 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            <ShieldCheck className="w-3 h-3 text-blue-600" />
                            <span>100% No. Ref Sah</span>
                          </span>
                        ) : cand.confidence === 90 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            <Sparkles className="w-3 h-3 text-indigo-600" />
                            <span>90% Match Tanggal</span>
                          </span>
                        ) : cand.confidence === 75 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            <span>75% Biaya Admin</span>
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            Belum Ada Match
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.isReconciled ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                            Selesai
                          </span>
                        ) : cand.confidence >= 90 ? (
                          <button
                            onClick={() => {
                              soundFx.playClick();
                              onReconcileItem(item.id);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
                          >
                            Cocokkan
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRecordUnrecorded(item)}
                            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-all"
                          >
                            Auto-Post Jurnal
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
