import { describe, it, expect } from 'vitest';
import {
  calculateJobCost,
  generateJobCompletionJournal,
  DEMO_JOB_ORDERS,
} from '../src/lib/costAccountingEngine';
import { computeTax1771, INITIAL_FISCAL_CORRECTIONS } from '../src/lib/tax1771Engine';
import { calculateDcfValuation } from '../src/lib/valuationEngine';
import { computeEclProvisionMatrix, generateEclJournal } from '../src/lib/eclEngine';
import { generateSeedAccountingData } from '../src/lib/seedData';

describe('💼 10x Enterprise Logic & Fiscal Intelligence Tests', () => {
  const seed = generateSeedAccountingData();

  // Test 1: Job-Order Costing & Manufacturing Allocation
  it('1. Job-Order Costing: Accurately pools DM, DL, and FOH with balanced finished goods journal', () => {
    const job = DEMO_JOB_ORDERS[0];
    const cost = calculateJobCost(job);

    expect(cost.totalDirectMaterial).toBe(9500000); // 4.25jt + 2.75jt + 2.5jt
    expect(cost.totalDirectLabor).toBe(2000000); // 40 jam * 50rb
    expect(cost.totalAppliedOverhead).toBe(900000); // 20 jam * 45rb
    expect(cost.totalManufacturingCost).toBe(12400000);
    expect(cost.unitCost).toBe(124000); // 12.4jt / 100 unit
    expect(cost.suggestedSellingPrice).toBeGreaterThan(cost.unitCost);
    expect(cost.grossMarginPct).toBeGreaterThan(0);

    const completion = generateJobCompletionJournal(job);
    expect(completion.journalEntry.isBalanced).toBe(true);
    expect(completion.journalEntry.totalDebit).toBe(12400000);
    expect(completion.journalEntry.totalKredit).toBe(12400000);
  });

  // Test 2: SPT Tahunan PPh Badan 1771 & Fiscal Reconciliation
  it('2. Tax 1771 Fiscal Reconciliation: Calculates positive/negative corrections, PKP, and 31E discount', () => {
    const tax = computeTax1771(seed.accounts, seed.journalEntries, 2026, INITIAL_FISCAL_CORRECTIONS);

    expect(tax.commercialNetProfitBeforeTax).toBeGreaterThan(0);
    expect(tax.totalPositiveCorrections).toBe(34000000); // 18.5jt + 12jt + 3.5jt
    expect(tax.totalNegativeCorrections).toBe(2220000);
    expect(tax.fiscalNetIncome).toBeGreaterThan(tax.commercialNetProfitBeforeTax);

    // Article 31E Facility for turnover < 4.8B
    expect(tax.hasArticle31EFacility).toBe(true);
    expect(tax.taxLiabilityArticle17).toBeGreaterThan(0);
    expect(tax.taxPayableArticle29).toBeGreaterThanOrEqual(0);
    expect(tax.monthlyInstallmentArticle25).toBeGreaterThanOrEqual(0);
  });

  // Test 3: DCF Valuation & WACC Financial Modeling
  it('3. DCF Valuation: Projects 5-year FCFF, terminal value, and computes positive Equity Value per Share', () => {
    const val = calculateDcfValuation(seed.accounts, seed.journalEntries, 10.5, 3.5, 1000000);

    expect(val.projections.length).toBe(5);
    expect(val.sumPvOfFcff).toBeGreaterThan(0);
    expect(val.terminalValue).toBeGreaterThan(0);
    expect(val.pvOfTerminalValue).toBeGreaterThan(0);
    expect(val.enterpriseValue).toBeGreaterThan(val.sumPvOfFcff);
    expect(val.equityValue).toBeGreaterThan(0);
    expect(val.fairValuePerShare).toBeGreaterThan(0);
  });

  // Test 4: PSAK 71 / IFRS 9 ECL Provisioning Engine
  it('4. PSAK 71 Expected Credit Loss: Groups receivables into 3 risk stages and posts balanced allowance journal', () => {
    const ecl = computeEclProvisionMatrix(seed.invoices as any, '2026-08-31', 2000000);

    expect(ecl.buckets.length).toBe(3);
    expect(ecl.totalGrossReceivables).toBeGreaterThan(0);
    expect(ecl.totalRequiredEclAllowance).toBeGreaterThan(0);

    const eclJournal = generateEclJournal(ecl, '2026-08-31');
    expect(eclJournal.isBalanced).toBe(true);
    expect(eclJournal.totalDebit).toBe(ecl.incrementalProvisionExpense);
    expect(eclJournal.totalKredit).toBe(ecl.incrementalProvisionExpense);
  });
});
