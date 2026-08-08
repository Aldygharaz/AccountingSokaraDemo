import Decimal from 'decimal.js';
import { Account, JournalEntry } from '../types/accounting';
import { generateBalanceSheet, generateIncomeStatement } from './accountingEngine';

export interface DcfProjectionYear {
  year: number;
  revenue: number;
  ebitda: number;
  ebit: number;
  tax: number;
  nopat: number; // Net Operating Profit After Tax
  depreciation: number;
  capex: number;
  changeInNwc: number; // Net Working Capital
  fcff: number; // Free Cash Flow to Firm
  discountFactor: number;
  presentValue: number;
}

export interface ValuationSummary {
  waccPct: number; // e.g. 10.5%
  terminalGrowthRatePct: number; // e.g. 3.5%
  sharesOutstanding: number; // e.g. 1.000.000 lembar saham
  projections: DcfProjectionYear[];
  sumPvOfFcff: number;
  terminalValue: number;
  pvOfTerminalValue: number;
  enterpriseValue: number; // EV
  totalDebt: number;
  cashAndEquivalents: number;
  netDebt: number;
  equityValue: number; // Market Cap / Fair Value
  fairValuePerShare: number; // IDR per share
  economicValueAdded: number; // EVA
}

export function calculateDcfValuation(
  accounts: Account[],
  journalEntries: JournalEntry[],
  waccPct: number = 10.5,
  terminalGrowthRatePct: number = 3.5,
  sharesOutstanding: number = 1000000
): ValuationSummary {
  const pnl = generateIncomeStatement(accounts, journalEntries);
  const bs = generateBalanceSheet(accounts, journalEntries);

  const baseRevenue = Math.max(150000000, pnl.totalRevenue * 2); // annualized proxy
  const wacc = waccPct / 100;
  const g = terminalGrowthRatePct / 100;

  const growthRates = [0.15, 0.12, 0.1, 0.08, 0.06]; // 5-year growth trajectory
  const projections: DcfProjectionYear[] = [];

  let currentRev = baseRevenue;
  let sumPv = 0;

  for (let i = 1; i <= 5; i++) {
    currentRev = Math.round(currentRev * (1 + growthRates[i - 1]));
    const ebitda = Math.round(currentRev * 0.28); // 28% EBITDA margin
    const depr = Math.round(currentRev * 0.04);
    const ebit = ebitda - depr;
    const tax = Math.round(ebit * 0.22);
    const nopat = ebit - tax;
    const capex = Math.round(currentRev * 0.05);
    const changeNwc = Math.round(currentRev * 0.02);

    const fcff = nopat + depr - capex - changeNwc;
    const discountFactor = 1 / Math.pow(1 + wacc, i);
    const pv = Math.round(fcff * discountFactor);

    sumPv += pv;

    projections.push({
      year: 2026 + i,
      revenue: currentRev,
      ebitda,
      ebit,
      tax,
      nopat,
      depreciation: depr,
      capex,
      changeInNwc: changeNwc,
      fcff,
      discountFactor: Math.round(discountFactor * 1000) / 1000,
      presentValue: pv,
    });
  }

  // Terminal Value = FCFF_5 * (1 + g) / (WACC - g)
  const fcff5 = projections[4].fcff;
  const terminalValue = (fcff5 * (1 + g)) / (wacc - g);
  const pvOfTerminalValue = terminalValue / Math.pow(1 + wacc, 5);

  const enterpriseValue = sumPv + pvOfTerminalValue;
  const totalDebt = bs.totalCurrentLiabilities;
  const cashAccounts = bs.currentAssets.filter(
    (a) => a.accountCode === '1101' || a.accountCode === '1102'
  );
  const cashAndEquivalents = cashAccounts.reduce((s, a) => s + a.amount, 0);
  const netDebt = Math.max(0, totalDebt - cashAndEquivalents);
  const equityValue = enterpriseValue - netDebt;
  const fairValuePerShare = Math.round(equityValue / sharesOutstanding);

  // Economic Value Added (EVA) = NOPAT - (Total Capital * WACC)
  const capitalEmploy = bs.totalAssets - bs.totalCurrentLiabilities;
  const currentNopat = Math.max(10000000, pnl.netIncome);
  const eva = Math.round(currentNopat - capitalEmploy * wacc);

  return {
    waccPct,
    terminalGrowthRatePct,
    sharesOutstanding,
    projections,
    sumPvOfFcff: Math.round(sumPv),
    terminalValue: Math.round(terminalValue),
    pvOfTerminalValue: Math.round(pvOfTerminalValue),
    enterpriseValue: Math.round(enterpriseValue),
    totalDebt,
    cashAndEquivalents,
    netDebt,
    equityValue: Math.round(equityValue),
    fairValuePerShare,
    economicValueAdded: eva,
  };
}
