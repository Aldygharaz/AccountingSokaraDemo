import Decimal from 'decimal.js';
import { JournalEntry, JournalLine } from '../types/accounting';
import { validateJournalBalance } from './accountingEngine';

export interface ForexCurrency {
  code: 'USD' | 'SGD' | 'EUR' | 'JPY';
  name: string;
  symbol: string;
  bookRate: number; // Historical rate in IDR
  currentRate: number; // Live / BI JISDOR rate in IDR
}

export interface ForexAccountExposure {
  id: string;
  currency: 'USD' | 'SGD' | 'EUR' | 'JPY';
  contactName: string;
  foreignAmount: number;
  bookValueIDR: number;
  marketValueIDR: number;
  unrealizedGainLossIDR: number;
}

export const DEFAULT_FOREX_RATES: ForexCurrency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', bookRate: 15800, currentRate: 16250 },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', bookRate: 11750, currentRate: 12100 },
  { code: 'EUR', name: 'Euro', symbol: '€', bookRate: 17100, currentRate: 17550 },
  { code: 'JPY', name: 'Japanese Yen (100)', symbol: '¥', bookRate: 104, currentRate: 108 },
];

export const DEMO_FOREX_EXPOSURES: ForexAccountExposure[] = [
  {
    id: 'fx-01',
    currency: 'USD',
    contactName: 'Global Commodities Export Pte Ltd (Singapura)',
    foreignAmount: 15000, // $15,000 USD Receivable
    bookValueIDR: 15000 * 15800, // Rp 237,000,000
    marketValueIDR: 15000 * 16250, // Rp 243,750,000
    unrealizedGainLossIDR: 15000 * (16250 - 15800), // +Rp 6,750,000 (Gain)
  },
  {
    id: 'fx-02',
    currency: 'SGD',
    contactName: 'Seagate Logistics & Packaging Hub (SG)',
    foreignAmount: 8500, // S$8,500 Payable
    bookValueIDR: 8500 * 11750, // Rp 99,875,000
    marketValueIDR: 8500 * 12100, // Rp 102,850,000
    unrealizedGainLossIDR: 8500 * (11750 - 12100), // -Rp 2,975,000 (Loss)
  },
];

/**
 * Generates PSAK 10 Month-End Unrealized Forex Revaluation Journal Voucher:
 * Gain: Debit 1103 Piutang Usaha -> Credit 7102 Keuntungan Selisih Kurs
 * Loss: Debit 7102 Kerugian Selisih Kurs -> Credit 2101 Hutang Usaha
 */
export const generateForexRevaluationJournal = (
  exposures: ForexAccountExposure[],
  periodDate: string = new Date().toISOString().split('T')[0],
  postedBy: string = 'Treasury / Chief Accountant'
): {
  journalEntry: JournalEntry;
  netGainLoss: number;
} => {
  let netGainLossDec = new Decimal(0);
  const lines: JournalLine[] = [];

  exposures.forEach((exp) => {
    const gainLoss = new Decimal(exp.unrealizedGainLossIDR);
    netGainLossDec = netGainLossDec.plus(gainLoss);

    if (gainLoss.greaterThan(0)) {
      // Gain on AR
      lines.push({
        id: `jl-fx-ar-${exp.id}`,
        accountId: 'acc-1103', // Piutang Usaha
        debit: gainLoss.toDecimalPlaces(2).toNumber(),
        kredit: 0,
        memo: `Revaluasi Valas ${exp.currency} (${exp.contactName}): Laba Selisih Kurs`,
      });
      lines.push({
        id: `jl-fx-rev-${exp.id}`,
        accountId: 'acc-7102', // Pendapatan/Beban Selisih Kurs
        debit: 0,
        kredit: gainLoss.toDecimalPlaces(2).toNumber(),
        memo: `PSAK 10 Laba Selisih Kurs Belum Terealisasi (${exp.currency})`,
      });
    } else if (gainLoss.lessThan(0)) {
      // Loss on AP
      const absLoss = gainLoss.abs();
      lines.push({
        id: `jl-fx-exp-${exp.id}`,
        accountId: 'acc-7102',
        debit: absLoss.toDecimalPlaces(2).toNumber(),
        kredit: 0,
        memo: `PSAK 10 Rugi Selisih Kurs Belum Terealisasi (${exp.currency})`,
      });
      lines.push({
        id: `jl-fx-ap-${exp.id}`,
        accountId: 'acc-2101', // Hutang Usaha
        debit: 0,
        kredit: absLoss.toDecimalPlaces(2).toNumber(),
        memo: `Revaluasi Valas ${exp.currency} (${exp.contactName}): Rugi Selisih Kurs`,
      });
    }
  });

  const validation = validateJournalBalance(lines);

  const journalEntry: JournalEntry = {
    id: `jv-fx-reval-${periodDate}`,
    entryNumber: `JV-FOREX-${periodDate.replace(/-/g, '')}`,
    date: periodDate,
    description: `Jurnal Revaluasi Valuta Asing Akhir Periode (PSAK 10 - BI JISDOR)`,
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
    netGainLoss: netGainLossDec.toDecimalPlaces(2).toNumber(),
  };
};
