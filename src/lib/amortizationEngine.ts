import Decimal from 'decimal.js';
import { JournalEntry, JournalLine } from '../types/accounting';
import { validateJournalBalance } from './accountingEngine';

export interface PrepaidExpense {
  id: string;
  code: string;
  name: string;
  category: 'sewa_kantor' | 'asuransi' | 'lisensi_software' | 'iklan_tahunan';
  initialAmount: number;
  startDate: string;
  durationMonths: number;
  monthlyAmortization: number;
  amortizedAmount: number;
  remainingBalance: number;
  prepaidAccountId: string; // 1105 Sewa/Asuransi Dibayar Dimuka
  expenseAccountId: string; // 6102 Beban Sewa / 6104 Beban Operasional Lain
  lastAmortizedMonth?: string; // YYYY-MM
}

export const INITIAL_PREPAID_EXPENSES: PrepaidExpense[] = [
  {
    id: 'prepaid-01',
    code: 'PRE-SEWA-2026',
    name: 'Sewa Gedung Kantor & Gudang Distribusi (12 Bulan)',
    category: 'sewa_kantor',
    initialAmount: 60000000,
    startDate: '2026-01-01',
    durationMonths: 12,
    monthlyAmortization: 5000000,
    amortizedAmount: 10000000, // 2 months amortized
    remainingBalance: 50000000,
    prepaidAccountId: 'acc-1105',
    expenseAccountId: 'acc-6102',
    lastAmortizedMonth: '2026-02',
  },
  {
    id: 'prepaid-02',
    code: 'PRE-ASURANSI-2026',
    name: 'Polis Asuransi Kerugian Stok & Kebakaran Gudang All-Risk',
    category: 'asuransi',
    initialAmount: 24000000,
    startDate: '2026-01-01',
    durationMonths: 12,
    monthlyAmortization: 2000000,
    amortizedAmount: 4000000,
    remainingBalance: 20000000,
    prepaidAccountId: 'acc-1105',
    expenseAccountId: 'acc-6104',
    lastAmortizedMonth: '2026-02',
  },
];

/**
 * Generates PSAK 1 Monthly Prepaid Amortization Journal Entry:
 * Debit 6102/6104 Beban Sewa/Asuransi -> Credit 1105 Biaya Dibayar Dimuka
 */
export const generateAmortizationJournal = (
  prepaids: PrepaidExpense[],
  periodMonth: string = '2026-03',
  postedBy: string = 'Chief Accountant / System'
): {
  journalEntry: JournalEntry;
  totalAmortized: number;
} => {
  const lines: JournalLine[] = [];
  let totalAmortizedDec = new Decimal(0);

  prepaids.forEach((p) => {
    if (p.remainingBalance <= 0) return;

    const monthlyDec = new Decimal(p.monthlyAmortization);
    totalAmortizedDec = totalAmortizedDec.plus(monthlyDec);

    // Debit Expense Account
    lines.push({
      id: `jl-amort-exp-${p.id}-${periodMonth}`,
      accountId: p.expenseAccountId,
      debit: monthlyDec.toDecimalPlaces(2).toNumber(),
      kredit: 0,
      memo: `Amortisasi ${p.name} Periode ${periodMonth}`,
    });

    // Credit Prepaid Account (1105)
    lines.push({
      id: `jl-amort-pre-${p.id}-${periodMonth}`,
      accountId: p.prepaidAccountId,
      debit: 0,
      kredit: monthlyDec.toDecimalPlaces(2).toNumber(),
      memo: `Pengurangan Saldo Biaya Dibayar Dimuka (${p.code})`,
    });
  });

  const validation = validateJournalBalance(lines);

  const journalEntry: JournalEntry = {
    id: `jv-amort-${periodMonth}`,
    entryNumber: `JV-AMORT-${periodMonth.replace('-', '')}`,
    date: `${periodMonth}-28`,
    description: `Jurnal Amortisasi Biaya Dibayar Dimuka Periode ${periodMonth} (PSAK 1)`,
    sourceType: 'manual',
    lines,
    totalDebit: validation.totalDebit,
    totalKredit: validation.totalKredit,
    isBalanced: validation.isBalanced,
    createdBy: postedBy,
    createdAt: new Date().toISOString(),
  };

  return {
    journalEntry,
    totalAmortized: totalAmortizedDec.toDecimalPlaces(2).toNumber(),
  };
};
