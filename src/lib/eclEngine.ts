import Decimal from 'decimal.js';
import { SalesInvoice, JournalEntry } from '../types/accounting';

export interface EclStageBucket {
  stage: 'Stage 1 (Performing)' | 'Stage 2 (Underperforming)' | 'Stage 3 (Credit Impaired)';
  dayRange: string;
  grossCarryingAmount: number; // Total nilai tercatat bruto piutang
  probabilityOfDefaultPct: number; // PD %
  lossGivenDefaultPct: number; // LGD % (biasanya 45% untuk unsecured trade receivables)
  lossAllowanceAmount: number; // Nilai CKPN yang harus dibentuk
  invoiceCount: number;
}

export interface EclProvisionSummary {
  asOfDate: string;
  totalGrossReceivables: number;
  totalRequiredEclAllowance: number;
  existingAllowanceBalance: number;
  incrementalProvisionExpense: number; // Jumlah yang perlu dijurnal
  buckets: EclStageBucket[];
}

export function computeEclProvisionMatrix(
  invoices: SalesInvoice[],
  asOfDate: string = '2026-08-31',
  existingAllowanceBalance: number = 3500000
): EclProvisionSummary {
  const activeInvoices = invoices.filter((i) => i.status !== 'lunas' && i.status !== 'void');

  let stage1Gross = 0;
  let stage1Count = 0;
  let stage2Gross = 0;
  let stage2Count = 0;
  let stage3Gross = 0;
  let stage3Count = 0;

  const asOf = new Date(asOfDate).getTime();

  activeInvoices.forEach((inv) => {
    const due = new Date(inv.dueDate).getTime();
    const daysOverdue = Math.max(0, Math.floor((asOf - due) / (1000 * 60 * 60 * 24)));

    if (daysOverdue <= 30) {
      stage1Gross += inv.remainingAmount;
      stage1Count++;
    } else if (daysOverdue <= 90) {
      stage2Gross += inv.remainingAmount;
      stage2Count++;
    } else {
      stage3Gross += inv.remainingAmount;
      stage3Count++;
    }
  });

  // Parameter Risiko Standar PSAK 71
  // Stage 1: 12-Month ECL (PD 1.2%, LGD 45%)
  const stage1Ecl = new Decimal(stage1Gross).times(0.012).times(0.45).round().toNumber();

  // Stage 2: Lifetime ECL - Not Credit Impaired (PD 8.5%, LGD 45%)
  const stage2Ecl = new Decimal(stage2Gross).times(0.085).times(0.45).round().toNumber();

  // Stage 3: Lifetime ECL - Credit Impaired (PD 65.0%, LGD 45%)
  const stage3Ecl = new Decimal(stage3Gross).times(0.65).times(0.45).round().toNumber();

  const totalGross = stage1Gross + stage2Gross + stage3Gross;
  const totalRequiredAllowance = stage1Ecl + stage2Ecl + stage3Ecl;
  const incrementalExpense = Math.max(0, totalRequiredAllowance - existingAllowanceBalance);

  const buckets: EclStageBucket[] = [
    {
      stage: 'Stage 1 (Performing)',
      dayRange: '0 - 30 Hari (Lancar)',
      grossCarryingAmount: stage1Gross,
      probabilityOfDefaultPct: 1.2,
      lossGivenDefaultPct: 45.0,
      lossAllowanceAmount: stage1Ecl,
      invoiceCount: stage1Count,
    },
    {
      stage: 'Stage 2 (Underperforming)',
      dayRange: '31 - 90 Hari (Kenaikan Risiko Signifikan)',
      grossCarryingAmount: stage2Gross,
      probabilityOfDefaultPct: 8.5,
      lossGivenDefaultPct: 45.0,
      lossAllowanceAmount: stage2Ecl,
      invoiceCount: stage2Count,
    },
    {
      stage: 'Stage 3 (Credit Impaired)',
      dayRange: '> 90 Hari (Menunggak / Macet)',
      grossCarryingAmount: stage3Gross,
      probabilityOfDefaultPct: 65.0,
      lossGivenDefaultPct: 45.0,
      lossAllowanceAmount: stage3Ecl,
      invoiceCount: stage3Count,
    },
  ];

  return {
    asOfDate,
    totalGrossReceivables: totalGross,
    totalRequiredEclAllowance: totalRequiredAllowance,
    existingAllowanceBalance,
    incrementalProvisionExpense: incrementalExpense,
    buckets,
  };
}

/**
 * Generate Double-Entry Journal for PSAK 71 ECL Impairment:
 * Debit 6105 Beban Cadangan Kerugian Penurunan Nilai Piutang (ECL Expense)
 *   Credit 1107 Akumulasi Penyisihan Penurunan Nilai Piutang (Contra-Asset)
 */
export function generateEclJournal(
  summary: EclProvisionSummary,
  date: string = '2026-08-31'
): JournalEntry {
  const amount = summary.incrementalProvisionExpense;
  const entryId = `jl-ecl-${Date.now()}`;

  const lines = [
    {
      id: `${entryId}-exp`,
      accountId: 'acc-6101', // Beban Kerugian Piutang / Operasional
      debit: amount,
      kredit: 0,
      memo: `Beban Penyisihan Kerugian Penurunan Nilai Piutang PSAK 71 / IFRS 9 Per ${date}`,
    },
    {
      id: `${entryId}-allowance`,
      accountId: 'acc-1103', // Piutang Usaha / Contra Piutang
      debit: 0,
      kredit: amount,
      memo: `Akumulasi Cadangan Kerugian Piutang Usaha (Allowance for ECL)`,
    },
  ];

  return {
    id: entryId,
    entryNumber: `ECL-${date.replace(/-/g, '')}`,
    date,
    sourceType: 'manual',
    sourceId: `ECL-PSAK71-${date}`,
    description: `Jurnal Pembentukan Cadangan Kerugian Penurunan Nilai Piutang (ECL) PSAK 71`,
    totalDebit: amount,
    totalKredit: amount,
    isBalanced: true,
    lines,
    createdAt: new Date().toISOString(),
    createdBy: 'Chief Risk Officer & Auditor',
  };
}
