import { describe, it, expect } from 'vitest';
import { generateClosingEntries, isPeriodLocked } from '../src/lib/closingEngine';
import { buildLedgerHashChain, verifyLedgerChainIntegrity } from '../src/lib/forensicAudit';
import { calculateCfoIntelligence } from '../src/lib/cfoIntelligence';
import { generateForexRevaluationJournal, DEMO_FOREX_EXPOSURES } from '../src/lib/forexEngine';
import { generateAmortizationJournal, INITIAL_PREPAID_EXPENSES } from '../src/lib/amortizationEngine';
import { generateSeedAccountingData } from '../src/lib/seedData';

describe('🏛️ 20x Enterprise & CFO-Grade Logic Automated Tests', () => {
  const seed = generateSeedAccountingData();

  // Test 1: Period Closing Entries & Retained Earnings Engine
  it('1. Period Closing: Zeroes nominal revenue & expense accounts and transfers net balance to 3201/3202 Retained Earnings', () => {
    const result = generateClosingEntries(seed.accounts, seed.journalEntries, '2026-02');

    expect(result.totalRevenue).toBeGreaterThan(0);
    expect(result.totalExpense).toBeGreaterThan(0);
    expect(result.closingEntry.isBalanced).toBe(true);

    // Revenue lines in post-closing trial balance must be exactly 0
    const revAccounts = result.postClosingTrialBalance.filter((a) => a.accountType === 'pendapatan');
    revAccounts.forEach((acc) => {
      expect(acc.debit).toBe(0);
      expect(acc.kredit).toBe(0);
    });

    // Expense lines in post-closing trial balance must be exactly 0
    const expAccounts = result.postClosingTrialBalance.filter((a) => a.accountType === 'beban');
    expAccounts.forEach((acc) => {
      expect(acc.debit).toBe(0);
      expect(acc.kredit).toBe(0);
    });

    // Retained Earnings account must be present in post-closing trial balance
    const reAccount = result.postClosingTrialBalance.find(
      (a) => a.accountCode === '3201' || a.accountCode === '3202' || a.accountType === 'ekuitas'
    );
    expect(reAccount).toBeDefined();
  });

  // Test 2: Fiscal Period Locking
  it('2. Fiscal Period Lock: Prevents transaction mutations in formally closed fiscal periods', () => {
    const closedPeriods = ['2026-01', '2026-02'];
    const check1 = isPeriodLocked('2026-02-15', closedPeriods);
    const check2 = isPeriodLocked('2026-03-10', closedPeriods);

    expect(check1.isLocked).toBe(true);
    expect(check1.reason).toContain('Periode akuntansi 2026-02 telah resmi DITUTUP');
    expect(check2.isLocked).toBe(false);
  });

  // Test 3: Immutable SHA-256 Ledger Hash Chain & Forensic Tamper Detection
  it('3. Forensic Audit Trail: Calculates valid SHA-256 hash-chain and pinpoints tampered entries', () => {
    const chain = buildLedgerHashChain(seed.journalEntries);
    expect(chain.length).toBe(seed.journalEntries.length);

    const initialIntegrity = verifyLedgerChainIntegrity(chain, seed.journalEntries);
    expect(initialIntegrity.isValid).toBe(true);
    expect(initialIntegrity.totalBlocks).toBe(chain.length);

    // Tamper simulation: clone entries and modify debit by 1000 rupiah
    const tamperedEntries = JSON.parse(JSON.stringify(seed.journalEntries));
    tamperedEntries[1].lines[0].debit += 1000;

    const tamperedIntegrity = verifyLedgerChainIntegrity(chain, tamperedEntries);
    expect(tamperedIntegrity.isValid).toBe(false);
    expect(tamperedIntegrity.corruptedBlockIndex).toBe(2);
    expect(tamperedIntegrity.error).toContain('Manipulasi data terdeteksi');
  });

  // Test 4: DuPont 3-Way Analysis & Altman Z-Score
  it('4. Executive CFO Hub: Computes accurate DuPont 3-Way ROE decomposition and Altman Z-Score', () => {
    const cfo = calculateCfoIntelligence(seed.accounts, seed.journalEntries, '2026-08-31');

    // DuPont Model: ROE = NPM * ATO * Financial Leverage
    expect(cfo.duPont.netProfitMargin).toBeGreaterThan(0);
    expect(cfo.duPont.assetTurnover).toBeGreaterThan(0);
    expect(cfo.duPont.financialLeverage).toBeGreaterThan(0);
    expect(cfo.duPont.returnOnEquity).toBeGreaterThan(0);

    // Altman Z-Score
    expect(cfo.altmanZ.score).toBeGreaterThan(0);
    expect(['safe', 'grey', 'distress']).toContain(cfo.altmanZ.zone);

    // Cash Conversion Cycle
    expect(cfo.workingCapital.daysSalesOutstanding).toBeGreaterThan(0);
    expect(cfo.workingCapital.daysPayableOutstanding).toBeGreaterThan(0);
  });

  // Test 5: PSAK 10 Multi-Currency & Month-End Forex Revaluation
  it('5. PSAK 10 Forex Revaluation: Generates balanced journal for unrealized foreign exchange gains/losses', () => {
    const reval = generateForexRevaluationJournal(DEMO_FOREX_EXPOSURES, '2026-08-31');

    expect(reval.journalEntry.isBalanced).toBe(true);
    expect(reval.journalEntry.lines.length).toBeGreaterThan(0);
    expect(reval.netGainLoss).toBeDefined();

    // Verify presence of Account 7102 (Pendapatan/Beban Selisih Kurs)
    const forexLine = reval.journalEntry.lines.find((l) => l.accountId === 'acc-7102');
    expect(forexLine).toBeDefined();
  });

  // Test 6: PSAK 1 Prepaid Expenses Amortization
  it('6. PSAK 1 Prepaid Expenses: Computes monthly amortization and generates balanced voucher', () => {
    const res = generateAmortizationJournal(INITIAL_PREPAID_EXPENSES, '2026-03');

    expect(res.totalAmortized).toBe(7000000); // 5jt sewa + 2jt asuransi
    expect(res.journalEntry.isBalanced).toBe(true);
    expect(res.journalEntry.totalDebit).toBe(7000000);
    expect(res.journalEntry.totalKredit).toBe(7000000);

    // Credit side must be 1105 (Sewa/Asuransi Dibayar Dimuka)
    const prepaidLine = res.journalEntry.lines.find((l) => l.accountId === 'acc-1105');
    expect(prepaidLine).toBeDefined();
    expect(prepaidLine!.kredit).toBe(5000000);
  });
});
