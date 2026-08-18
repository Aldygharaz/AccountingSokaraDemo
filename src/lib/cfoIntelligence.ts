import Decimal from 'decimal.js';
import { Account, JournalEntry } from '../types/accounting';
import { generateBalanceSheet, generateIncomeStatement } from './accountingEngine';

export interface DuPontAnalysis {
  netProfitMargin: number; // NPM (%) = Net Income / Revenue
  assetTurnover: number; // ATO (x) = Revenue / Total Assets
  financialLeverage: number; // Equity Multiplier = Total Assets / Total Equity
  returnOnEquity: number; // ROE (%) = NPM * ATO * Financial Leverage
  roeFormulaString: string;
}

export interface AltmanZScore {
  score: number;
  zone: 'safe' | 'grey' | 'distress';
  zoneLabel: string;
  x1WorkingCapitalToAssets: number; // 0.717 * X1
  x2RetainedEarningsToAssets: number; // 0.847 * X2
  x3EbitToAssets: number; // 3.107 * X3
  x4EquityToLiabilities: number; // 0.420 * X4
  x5SalesToAssets: number; // 0.998 * X5
  interpretation: string;
}

export interface WorkingCapitalCycle {
  daysSalesOutstanding: number; // DSO = (AR / Revenue) * 365
  daysInventoryOutstanding: number; // DIO = (Inventory / COGS) * 365
  daysPayableOutstanding: number; // DPO = (AP / COGS) * 365
  cashConversionCycle: number; // CCC = DIO + DSO - DPO
  cccHealth: 'optimal' | 'moderate' | 'slow';
}

export interface CashRunwayForecast {
  currentCashAndBank: number;
  monthlyAverageInflow: number;
  monthlyAverageOutflow: number;
  netMonthlyBurn: number; // Inflow - Outflow
  runwayMonths: number;
  isSelfSustaining: boolean;
  projectedDepletionDate?: string;
}

/**
 * Calculates Big-4 Executive CFO Metrics:
 * 1. DuPont 3-Way ROE Decomposition
 * 2. Altman Z-Score for Private & Emerging Market Enterprises
 * 3. Working Capital Cash Conversion Cycle (CCC)
 * 4. Cash Runway & Burn Rate Projection
 */
export const calculateCfoIntelligence = (
  accounts: Account[],
  journalEntries: JournalEntry[],
  asOfDate: string = new Date().toISOString().split('T')[0]
): {
  duPont: DuPontAnalysis;
  altmanZ: AltmanZScore;
  workingCapital: WorkingCapitalCycle;
  runway: CashRunwayForecast;
} => {
  const bs = generateBalanceSheet(accounts, journalEntries, asOfDate);
  const pnl = generateIncomeStatement(accounts, journalEntries, undefined, asOfDate);

  const revenue = Math.max(1, pnl.totalRevenue);
  const cogs = Math.max(1, pnl.totalCogs);
  const netIncome = pnl.netIncome;
  const totalAssets = Math.max(1, bs.totalAssets);
  const totalLiabilities = Math.max(1, bs.totalLiabilities);
  const totalEquity = Math.max(1, bs.totalEquity);

  // 1. DuPont 3-Way Model
  const npm = new Decimal(netIncome).dividedBy(revenue).times(100).toDecimalPlaces(2).toNumber();
  const ato = new Decimal(revenue).dividedBy(totalAssets).toDecimalPlaces(2).toNumber();
  const equityMultiplier = new Decimal(totalAssets).dividedBy(totalEquity).toDecimalPlaces(2).toNumber();
  const roe = new Decimal(netIncome).dividedBy(totalEquity).times(100).toDecimalPlaces(2).toNumber();

  const duPont: DuPontAnalysis = {
    netProfitMargin: npm,
    assetTurnover: ato,
    financialLeverage: equityMultiplier,
    returnOnEquity: roe,
    roeFormulaString: `${npm}% (NPM) × ${ato}x (ATO) × ${equityMultiplier}x (Leverage) = ${roe}% (ROE)`,
  };

  // 2. Altman Z-Score (Emerging Markets Model for Private/Non-Manufacturing)
  // Z' = 0.717(X1) + 0.847(X2) + 3.107(X3) + 0.420(X4) + 0.998(X5)
  const workingCapitalVal = bs.totalCurrentAssets - bs.totalCurrentLiabilities;
  const retainedEarningsVal = bs.equityItems.find((e) => e.accountCode === '3202')?.amount || netIncome;
  const ebitVal = pnl.grossProfit - (pnl.totalOperatingExpenses * 0.9); // EBIT proxy

  const x1 = new Decimal(workingCapitalVal).dividedBy(totalAssets).toNumber();
  const x2 = new Decimal(retainedEarningsVal).dividedBy(totalAssets).toNumber();
  const x3 = new Decimal(ebitVal).dividedBy(totalAssets).toNumber();
  const x4 = new Decimal(totalEquity).dividedBy(totalLiabilities).toNumber();
  const x5 = new Decimal(revenue).dividedBy(totalAssets).toNumber();

  const zScore = new Decimal(0.717 * x1)
    .plus(0.847 * x2)
    .plus(3.107 * x3)
    .plus(0.42 * x4)
    .plus(0.998 * x5)
    .toDecimalPlaces(2)
    .toNumber();

  let zone: 'safe' | 'grey' | 'distress' = 'safe';
  let zoneLabel = 'Zona Aman (Sangat Sehat)';
  let interpretation = 'Peluang gagal bayar sangat rendah. Struktur permodalan dan solvabilitas sangat kuat.';

  if (zScore < 1.23) {
    zone = 'distress';
    zoneLabel = 'Zona Bahaya (Distress)';
    interpretation = 'Likuiditas dan solvabilitas berada di bawah standar aman. Segera restrukturisasi hutang atau percepat penagihan piutang.';
  } else if (zScore <= 2.9) {
    zone = 'grey';
    zoneLabel = 'Zona Waspada (Grey Zone)';
    interpretation = 'Kondisi finansial moderat. Perhatikan rasio perputaran persediaan dan penagihan piutang.';
  }

  const altmanZ: AltmanZScore = {
    score: zScore,
    zone,
    zoneLabel,
    x1WorkingCapitalToAssets: Math.round(0.717 * x1 * 100) / 100,
    x2RetainedEarningsToAssets: Math.round(0.847 * x2 * 100) / 100,
    x3EbitToAssets: Math.round(3.107 * x3 * 100) / 100,
    x4EquityToLiabilities: Math.round(0.42 * x4 * 100) / 100,
    x5SalesToAssets: Math.round(0.998 * x5 * 100) / 100,
    interpretation,
  };

  // 3. Working Capital Cash Conversion Cycle (CCC)
  const arAmount = bs.currentAssets.find((a) => a.accountCode === '1103')?.amount || 1;
  const inventoryAmount = bs.currentAssets.find((a) => a.accountCode === '1104')?.amount || 1;
  const apAmount = bs.currentLiabilities.find((a) => a.accountCode === '2101')?.amount || 1;

  const cleanDso = Math.max(0, Math.round((arAmount / revenue) * 365));
  const cleanDio = Math.max(0, Math.round((inventoryAmount / cogs) * 365));
  const cleanDpo = Math.max(0, Math.round((apAmount / cogs) * 365));
  const ccc = cleanDio + cleanDso - cleanDpo;

  const cccHealth: 'optimal' | 'moderate' | 'slow' = ccc <= 45 ? 'optimal' : ccc <= 90 ? 'moderate' : 'slow';

  const workingCapital: WorkingCapitalCycle = {
    daysSalesOutstanding: cleanDso,
    daysInventoryOutstanding: cleanDio,
    daysPayableOutstanding: cleanDpo,
    cashConversionCycle: ccc,
    cccHealth,
  };

  // 4. Cash Runway & Burn Rate Forecaster
  const cashAccounts = bs.currentAssets.filter((a) => a.accountCode === '1101' || a.accountCode === '1102');
  const totalCash = cashAccounts.reduce((sum, a) => sum + a.amount, 0);

  const monthlyInflow = revenue / 6; // 6-month demo horizon
  const monthlyOutflow = (cogs + pnl.totalOperatingExpenses) / 6;
  const netBurn = monthlyInflow - monthlyOutflow;

  let runwayMonths = 999;
  let isSelfSustaining = true;
  let projectedDepletionDate: string | undefined = undefined;

  if (netBurn < 0) {
    isSelfSustaining = false;
    const absBurn = Math.abs(netBurn);
    runwayMonths = Math.max(0.1, Math.round((totalCash / absBurn) * 10) / 10);

    const depletion = new Date();
    depletion.setDate(depletion.getDate() + Math.round(runwayMonths * 30));
    projectedDepletionDate = depletion.toISOString().split('T')[0];
  }

  const runway: CashRunwayForecast = {
    currentCashAndBank: totalCash,
    monthlyAverageInflow: Math.round(monthlyInflow),
    monthlyAverageOutflow: Math.round(monthlyOutflow),
    netMonthlyBurn: Math.round(netBurn),
    runwayMonths,
    isSelfSustaining,
    projectedDepletionDate,
  };

  return {
    duPont,
    altmanZ,
    workingCapital,
    runway,
  };
};
