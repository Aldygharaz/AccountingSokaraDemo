import Decimal from 'decimal.js';
import { Account, JournalEntry, JournalLine } from '../types/accounting';
import { validateJournalBalance, formatIDR } from './accountingEngine';

export interface ClosingResult {
  periodMonth: string; // e.g. "2026-02"
  closedAt: string;
  totalRevenue: number;
  totalExpense: number;
  netIncome: number;
  closingEntry: JournalEntry;
  postClosingTrialBalance: {
    accountId: string;
    accountCode: string;
    accountName: string;
    accountType: string;
    debit: number;
    kredit: number;
  }[];
}

/**
 * Generates official Compound Closing Journal Entries for a fiscal period:
 * 1. Closes all Revenue accounts (Debit Revenue -> Credit 3201 Ikhtisar Laba Rugi)
 * 2. Closes all Expense accounts (Debit 3201 Ikhtisar Laba Rugi -> Credit Expenses)
 * 3. Transfers balance of 3201 into 3202 Laba Ditahan (Retained Earnings)
 */
export const generateClosingEntries = (
  accounts: Account[],
  journalEntries: JournalEntry[],
  periodMonth: string, // "YYYY-MM"
  closedBy: string = 'Chief Accountant / System'
): ClosingResult => {
  // Calculate period revenues and expenses
  const accountTotals = new Map<string, Decimal>();
  accounts.forEach((acc) => accountTotals.set(acc.id, new Decimal(0)));

  const startPeriod = `${periodMonth}-01`;
  const [yearStr, monthStr] = periodMonth.split('-');
  const lastDay = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10), 0).getDate();
  const endPeriod = `${periodMonth}-${lastDay.toString().padStart(2, '0')}`;

  journalEntries.forEach((entry) => {
    if (entry.date < startPeriod || entry.date > endPeriod || entry.isVoided) return;
    if (entry.sourceType === 'closing_entry') return; // Exclude prior closing entries

    entry.lines.forEach((line) => {
      const acc = accounts.find((a) => a.id === line.accountId);
      if (!acc) return;

      const current = accountTotals.get(line.accountId) || new Decimal(0);
      const debit = new Decimal(line.debit || 0);
      const kredit = new Decimal(line.kredit || 0);

      if (acc.normalBalance === 'debit') {
        accountTotals.set(line.accountId, current.plus(debit).minus(kredit));
      } else {
        accountTotals.set(line.accountId, current.plus(kredit).minus(debit));
      }
    });
  });

  const lines: JournalLine[] = [];
  let totalRevDec = new Decimal(0);
  let totalExpDec = new Decimal(0);

  // 1. Close Revenue accounts (Debit each revenue account, Credit 3201)
  accounts
    .filter((a) => a.type === 'pendapatan')
    .forEach((acc) => {
      const balance = accountTotals.get(acc.id) || new Decimal(0);
      if (balance.greaterThan(0)) {
        lines.push({
          id: `jl-close-rev-${acc.id}-${periodMonth}`,
          accountId: acc.id,
          debit: balance.toDecimalPlaces(2).toNumber(),
          kredit: 0,
          memo: `Tutup Buku ${periodMonth}: Nolkan Saldo ${acc.name}`,
        });
        totalRevDec = totalRevDec.plus(balance);
      }
    });

  // 2. Close Expense accounts (Credit each expense account, Debit 3201)
  accounts
    .filter((a) => a.type === 'beban')
    .forEach((acc) => {
      const balance = accountTotals.get(acc.id) || new Decimal(0);
      if (balance.greaterThan(0)) {
        lines.push({
          id: `jl-close-exp-${acc.id}-${periodMonth}`,
          accountId: acc.id,
          debit: 0,
          kredit: balance.toDecimalPlaces(2).toNumber(),
          memo: `Tutup Buku ${periodMonth}: Nolkan Saldo ${acc.name}`,
        });
        totalExpDec = totalExpDec.plus(balance);
      }
    });

  const netIncomeDec = totalRevDec.minus(totalExpDec);

  const retainedEarningsAcc = accounts.find((a) => a.code === '3201' || a.subType === 'ekuitas_laba_ditahan') || accounts.find((a) => a.type === 'ekuitas')!;

  // 3. Transfer net income into Laba Ditahan
  if (netIncomeDec.greaterThan(0)) {
    // Profit: Credit Laba Ditahan
    lines.push({
      id: `jl-close-re-${periodMonth}`,
      accountId: retainedEarningsAcc.id,
      debit: 0,
      kredit: netIncomeDec.toDecimalPlaces(2).toNumber(),
      memo: `Alokasi Laba Bersih Periode ${periodMonth} ke ${retainedEarningsAcc.name}`,
    });
  } else if (netIncomeDec.lessThan(0)) {
    // Loss: Debit Laba Ditahan
    lines.push({
      id: `jl-close-re-${periodMonth}`,
      accountId: retainedEarningsAcc.id,
      debit: netIncomeDec.abs().toDecimalPlaces(2).toNumber(),
      kredit: 0,
      memo: `Alokasi Defisit/Rugi Bersih Periode ${periodMonth} ke ${retainedEarningsAcc.name}`,
    });
  }

  const validation = validateJournalBalance(lines);
  const closingEntryId = `jv-closing-${periodMonth}`;

  const closingEntry: JournalEntry = {
    id: closingEntryId,
    entryNumber: `JV-CLOSE-${periodMonth.replace('-', '')}`,
    date: endPeriod,
    description: `Jurnal Penutup Resmi Periode ${periodMonth} (PSAK/SAK EMKM)`,
    sourceType: 'closing_entry',
    sourceId: periodMonth,
    lines,
    totalDebit: validation.totalDebit,
    totalKredit: validation.totalKredit,
    isBalanced: validation.isBalanced,
    createdBy: closedBy,
    createdAt: new Date().toISOString(),
  };

  // Generate Post-Closing Trial Balance (Revenues & Expenses MUST be 0.00)
  const postClosingTrialBalance = accounts.map((acc) => {
    if (acc.type === 'pendapatan' || acc.type === 'beban') {
      return {
        accountId: acc.id,
        accountCode: acc.code,
        accountName: acc.name,
        accountType: acc.type,
        debit: 0,
        kredit: 0,
      };
    }

    const currentBal = accountTotals.get(acc.id) || new Decimal(0);
    let finalBal = currentBal;

    if (acc.id === retainedEarningsAcc.id) {
      finalBal = finalBal.plus(netIncomeDec);
    }

    const val = finalBal.toDecimalPlaces(2).toNumber();
    return {
      accountId: acc.id,
      accountCode: acc.code,
      accountName: acc.name,
      accountType: acc.type,
      debit: acc.normalBalance === 'debit' ? Math.max(0, val) : 0,
      kredit: acc.normalBalance === 'kredit' ? Math.max(0, val) : 0,
    };
  });

  return {
    periodMonth,
    closedAt: new Date().toISOString(),
    totalRevenue: totalRevDec.toDecimalPlaces(2).toNumber(),
    totalExpense: totalExpDec.toDecimalPlaces(2).toNumber(),
    netIncome: netIncomeDec.toDecimalPlaces(2).toNumber(),
    closingEntry,
    postClosingTrialBalance,
  };
};

/**
 * Checks if a given transaction date falls within an immutable closed period
 */
export const isPeriodLocked = (
  dateString: string,
  closedPeriods: string[]
): { isLocked: boolean; reason?: string } => {
  const period = dateString.substring(0, 7); // "YYYY-MM"
  if (closedPeriods.includes(period)) {
    return {
      isLocked: true,
      reason: `Periode akuntansi ${period} telah resmi DITUTUP (Closed Period). Transaksi tidak dapat diubah tanpa persetujuan Direktur Keuangan.`,
    };
  }
  return { isLocked: false };
};
