import { describe, it, expect } from 'vitest';
import {
  validateJournalBalance,
  calculateWeightedAverageCost,
  generateIncomeStatement,
  generateBalanceSheet,
  calculateFinancialRatios,
  calculateAgingBuckets,
  round2,
} from '../src/lib/accountingEngine';
import { generateSeedAccountingData } from '../src/lib/seedData';
import { Account, JournalEntry } from '../src/types/accounting';

describe('Double-Entry Accounting Engine Core Tests (§8 PRD Acceptance Criteria)', () => {
  it('1. §4.3 & Test 1: Validates that SUM(debit) === SUM(kredit) and rejects unbalanced entries', () => {
    // Balanced journal entry
    const balancedLines = [
      { debit: 1500000, kredit: 0 },
      { debit: 0, kredit: 1350000 },
      { debit: 0, kredit: 150000 },
    ];
    const balancedResult = validateJournalBalance(balancedLines);
    expect(balancedResult.isBalanced).toBe(true);
    expect(balancedResult.diff).toBe(0);
    expect(balancedResult.totalDebit).toBe(1500000);
    expect(balancedResult.totalKredit).toBe(1500000);

    // Unbalanced journal entry
    const unbalancedLines = [
      { debit: 2000000, kredit: 0 },
      { debit: 0, kredit: 1950000 }, // Selisih 50.000
    ];
    const unbalancedResult = validateJournalBalance(unbalancedLines);
    expect(unbalancedResult.isBalanced).toBe(false);
    expect(unbalancedResult.diff).toBe(50000);
  });

  it('2. F-11 & Test 2: Accurate Weighted Average Costing (HPP) across multiple purchases', () => {
    // Initial: 100 units @ Rp 60,000 = Rp 6,000,000
    // Purchase 1: 50 units @ Rp 75,000 = Rp 3,750,000
    // Total Value = Rp 9,750,000, Total Qty = 150 units
    // Expected Avg Cost = 9,750,000 / 150 = Rp 65,000
    const step1 = calculateWeightedAverageCost(100, 60000, 50, 75000);
    expect(step1.newQty).toBe(150);
    expect(step1.newAvgCost).toBe(65000);

    // Purchase 2: 100 units @ Rp 80,000 = Rp 8,000,000
    // New Total Value = 9,750,000 + 8,000,000 = 17,750,000, Total Qty = 250 units
    // Expected Avg Cost = 17,750,000 / 250 = Rp 71,000
    const step2 = calculateWeightedAverageCost(step1.newQty, step1.newAvgCost, 100, 80000);
    expect(step2.newQty).toBe(250);
    expect(step2.newAvgCost).toBe(71000);
  });

  it('3. F-14 & Test 3: Balance Sheet (Neraca) is mathematically equal (Total Assets === Total Liabilities + Total Equity)', () => {
    const seed = generateSeedAccountingData();
    const balanceSheet = generateBalanceSheet(seed.accounts, seed.journalEntries, '2026-08-31');

    expect(balanceSheet.isBalanced).toBe(true);
    expect(balanceSheet.discrepancy).toBeLessThan(0.01);
    expect(balanceSheet.totalAssets).toBe(balanceSheet.totalLiabilitiesAndEquity);
    expect(balanceSheet.totalAssets).toBeGreaterThan(0);
    expect(balanceSheet.totalLiabilities).toBeGreaterThan(0);
    expect(balanceSheet.totalEquity).toBeGreaterThan(0);
  });

  it('4. F-13 & F-17 & Test 4: Financial Ratios (Current Ratio, GPM, NPM, Debt-to-Equity) are accurate', () => {
    const seed = generateSeedAccountingData();
    const ratios = calculateFinancialRatios(seed.accounts, seed.journalEntries, '2026-08-31');

    expect(ratios.currentRatio).toBeGreaterThan(1.0);
    expect(ratios.grossProfitMargin).toBeGreaterThan(0);
    expect(ratios.grossProfitMargin).toBeLessThan(100);
    expect(ratios.netProfitMargin).toBeGreaterThan(0);
    expect(ratios.debtToEquityRatio).toBeGreaterThan(0);
    expect(['healthy', 'warning', 'danger']).toContain(ratios.evaluation.currentRatioStatus);
  });

  it('5. F-07 & F-08 & Test 5: AR & AP Aging Buckets are classified correctly by due date delta', () => {
    const testItems = [
      { id: '1', refNumber: 'INV-1', contactName: 'Client A', date: '2026-08-01', dueDate: '2026-08-15', total: 1000, paidAmount: 0, remainingAmount: 1000, status: 'belum_dibayar' }, // Belum jatuh tempo relative to 2026-08-08
      { id: '2', refNumber: 'INV-2', contactName: 'Client B', date: '2026-07-01', dueDate: '2026-07-20', total: 2000, paidAmount: 0, remainingAmount: 2000, status: 'belum_dibayar' }, // ~19 hari overdue (1-30)
      { id: '3', refNumber: 'INV-3', contactName: 'Client C', date: '2026-06-01', dueDate: '2026-06-15', total: 3000, paidAmount: 0, remainingAmount: 3000, status: 'belum_dibayar' }, // ~54 hari overdue (31-60)
      { id: '4', refNumber: 'INV-4', contactName: 'Client D', date: '2026-04-01', dueDate: '2026-04-15', total: 4000, paidAmount: 0, remainingAmount: 4000, status: 'belum_dibayar' }, // >90 hari overdue (90+)
    ];

    const buckets = calculateAgingBuckets(testItems, '2026-08-08');
    const current = buckets.find((b) => b.bucketName === 'current');
    const b1_30 = buckets.find((b) => b.bucketName === '1-30');
    const b31_60 = buckets.find((b) => b.bucketName === '31-60');
    const b90plus = buckets.find((b) => b.bucketName === '90+');

    expect(current?.amount).toBe(1000);
    expect(b1_30?.amount).toBe(2000);
    expect(b31_60?.amount).toBe(3000);
    expect(b90plus?.amount).toBe(4000);
  });
});
