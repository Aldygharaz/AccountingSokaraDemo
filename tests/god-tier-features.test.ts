import { describe, it, expect } from 'vitest';
import {
  calculateRollingCashFlowForecast,
  calculateProductProfitability,
} from '../src/lib/accountingEngine';
import { generateSeedAccountingData } from '../src/lib/seedData';

describe('God-Tier Financial Engines (§Items 3 & 5)', () => {
  it('1. Cash Flow Forecast 90-Day generates valid projection points and lowest liquidity marker', () => {
    const seed = generateSeedAccountingData();
    const forecast = calculateRollingCashFlowForecast(
      seed.accounts,
      seed.journalEntries,
      seed.invoices,
      seed.purchaseBills,
      {
        forecastDays: 90,
        salesGrowthPct: 10,
        cogsInflationPct: 5,
        opexReductionPct: -5,
        safetyThreshold: 10000000,
      }
    );

    expect(forecast.dataPoints.length).toBeGreaterThan(10);
    expect(forecast.currentCashBalance).toBeGreaterThan(0);
    expect(forecast.lowestCashPoint).toBeDefined();
    expect(forecast.summary.totalProjectedInflows).toBeGreaterThan(0);
    expect(forecast.summary.totalProjectedOutflows).toBeGreaterThan(0);
    expect(forecast.runwayDays).toBeGreaterThan(0);
  });

  it('2. Product Profitability & SKU Matrix computes revenues, margins, and ranking accurately', () => {
    const seed = generateSeedAccountingData();
    const result = calculateProductProfitability(
      seed.products,
      seed.stockMovements,
      seed.invoices
    );

    expect(result.items.length).toBe(seed.products.length);
    expect(result.totalRevenue).toBeGreaterThan(0);
    expect(result.totalGrossProfit).toBeGreaterThan(0);
    expect(result.overallGrossMarginPct).toBeGreaterThan(0);
    expect(result.topContributor).toBeDefined();

    // Verify descending sort by gross profit
    for (let i = 0; i < result.items.length - 1; i++) {
      expect(result.items[i].grossProfit).toBeGreaterThanOrEqual(result.items[i + 1].grossProfit);
    }
  });
});
