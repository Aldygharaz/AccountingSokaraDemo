import { describe, it, expect } from 'vitest';
import { calculateIndonesianTaxes, calculateMonthlyUmkmTax } from '../src/lib/taxEngine';
import { calculateMonthlyDepreciation, generateDepreciationSchedule } from '../src/lib/assetEngine';

describe('15x Enterprise Accounting Modules: Tax & Fixed Assets', () => {
  it('1. Calculates Indonesian PPN 11% and PPh 23 (2%) accurately without floating point cents', () => {
    const res = calculateIndonesianTaxes(10000000, {
      applyPPN: true,
      ppnRate: 0.11,
      applyPPh23: true,
      applyPPhFinal: true,
    });

    expect(res.dpp).toBe(10000000);
    expect(res.ppnAmount).toBe(1100000);
    expect(res.pph23Amount).toBe(200000);
    expect(res.pphFinalAmount).toBe(50000);
    expect(res.totalWithTax).toBe(11100000);
  });

  it('2. Calculates UMKM PP 23/2018 0.5% monthly gross revenue tax', () => {
    const tax = calculateMonthlyUmkmTax(50000000);
    expect(tax).toBe(250000); // 0.5% of 50,000,000 = 250,000
  });

  it('3. Calculates Straight-Line Monthly Depreciation and Net Book Value accurately', () => {
    const monthly = calculateMonthlyDepreciation({
      acquisitionCost: 15000000,
      salvageValue: 1000000,
      usefulLifeMonths: 48,
    });

    // (15,000,000 - 1,000,000) / 48 = 14,000,000 / 48 = 291666.6667 -> 291667
    expect(monthly).toBe(291667);
  });

  it('4. Generates a valid multi-period depreciation projection schedule', () => {
    const schedule = generateDepreciationSchedule({
      id: 'ast-test',
      code: 'AST-TEST',
      name: 'Test Equipment',
      category: 'peralatan',
      acquisitionDate: '2026-01-01',
      acquisitionCost: 12000000,
      salvageValue: 0,
      usefulLifeMonths: 12,
      assetAccountId: 'acc-1201',
      accumulatedDeprAccountId: 'acc-1202',
      deprExpenseAccountId: 'acc-6103',
      accumulatedDepreciation: 0,
      netBookValue: 12000000,
    }, 6);

    expect(schedule.length).toBe(6);
    expect(schedule[0].monthlyExpense).toBe(1000000);
    expect(schedule[5].accumulated).toBe(6000000);
    expect(schedule[5].netBookValue).toBe(6000000);
  });
});
