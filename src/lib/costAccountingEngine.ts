import Decimal from 'decimal.js';
import { Account, JournalEntry } from '../types/accounting';

export interface JobOrderCostSheet {
  jobId: string;
  jobCode: string;
  customerName: string;
  productName: string;
  targetQuantity: number;
  startDate: string;
  status: 'in_process' | 'completed' | 'delivered';
  directMaterials: {
    itemCode: string;
    description: string;
    qty: number;
    unitCost: number;
    totalCost: number;
  }[];
  directLaborHours: number;
  laborRatePerHour: number;
  machineHours: number;
  predeterminedOverheadRate: number; // e.g. Rp 35.000 per machine hour
}

export interface CostAccountingSummary {
  totalDirectMaterial: number;
  totalDirectLabor: number;
  totalAppliedOverhead: number;
  totalManufacturingCost: number;
  unitCost: number;
  suggestedSellingPrice: number; // e.g. 40% markup
  grossMarginPct: number;
}

export const DEMO_JOB_ORDERS: JobOrderCostSheet[] = [
  {
    jobId: 'job-101',
    jobCode: 'JOB-2026-001',
    customerName: 'Hotel Mulia Senayan (Corporate Order)',
    productName: 'Paket Kopi Robusta & Sirup Premium Eksklusif (100 Box)',
    targetQuantity: 100,
    startDate: '2026-08-01',
    status: 'completed',
    directMaterials: [
      { itemCode: 'RAW-001', description: 'Biji Kopi Robusta Lampung Grade A (Kg)', qty: 50, unitCost: 85000, totalCost: 4250000 },
      { itemCode: 'RAW-002', description: 'Sirup Karamel Monin 700ml (Botol)', qty: 25, unitCost: 110000, totalCost: 2750000 },
      { itemCode: 'PKG-001', description: 'Hardbox Kemasan Cetak Custom Gold Foil', qty: 100, unitCost: 25000, totalCost: 2500000 },
    ],
    directLaborHours: 40,
    laborRatePerHour: 50000, // Rp 2.000.000
    machineHours: 20,
    predeterminedOverheadRate: 45000, // Rp 900.000
  },
  {
    jobId: 'job-102',
    jobCode: 'JOB-2026-002',
    customerName: 'PT Bank Central Asia Tbk (SCBD)',
    productName: 'Paket Hampers Snack & Minuman Herbal Impor (50 Set)',
    targetQuantity: 50,
    startDate: '2026-08-04',
    status: 'in_process',
    directMaterials: [
      { itemCode: 'RAW-003', description: 'Snack Keripik Truffle Premium (Pouch)', qty: 100, unitCost: 35000, totalCost: 3500000 },
      { itemCode: 'RAW-004', description: 'Teh Hijau Organik Kyoto Jepang (Kaleng)', qty: 50, unitCost: 95000, totalCost: 4750000 },
      { itemCode: 'PKG-002', description: 'Keranjang Anyaman Rotan Eksklusif', qty: 50, unitCost: 40000, totalCost: 2000000 },
    ],
    directLaborHours: 30,
    laborRatePerHour: 50000, // Rp 1.500.000
    machineHours: 12,
    predeterminedOverheadRate: 45000, // Rp 540.000
  },
];

export function calculateJobCost(job: JobOrderCostSheet): CostAccountingSummary {
  const dm = job.directMaterials.reduce((sum, m) => sum + m.totalCost, 0);
  const dl = new Decimal(job.directLaborHours).times(job.laborRatePerHour).toNumber();
  const foh = new Decimal(job.machineHours).times(job.predeterminedOverheadRate).toNumber();

  const totalCost = new Decimal(dm).plus(dl).plus(foh).toNumber();
  const unitCost = job.targetQuantity > 0 ? new Decimal(totalCost).dividedBy(job.targetQuantity).round().toNumber() : 0;
  const sellingPrice = new Decimal(unitCost).times(1.4).round().toNumber(); // 40% markup
  const grossMargin = sellingPrice > 0 ? new Decimal(sellingPrice - unitCost).dividedBy(sellingPrice).times(100).toDecimalPlaces(1).toNumber() : 0;

  return {
    totalDirectMaterial: dm,
    totalDirectLabor: dl,
    totalAppliedOverhead: foh,
    totalManufacturingCost: totalCost,
    unitCost,
    suggestedSellingPrice: sellingPrice,
    grossMarginPct: grossMargin,
  };
}

/**
 * Generate Double-Entry Compound Journal for WIP Completion
 * Debit 1104 Persediaan Barang Jadi (Finished Goods)
 *   Credit 1106 Persediaan Barang Dalam Proses (WIP) - Materials
 *   Credit 2103 Hutang Gaji & Upah Tenaga Kerja Langsung
 *   Credit 6104 Beban Overhead Pabrik Dibebankan (Applied FOH)
 */
export function generateJobCompletionJournal(
  job: JobOrderCostSheet,
  date: string = '2026-08-31'
): { journalEntry: JournalEntry; summary: CostAccountingSummary } {
  const summary = calculateJobCost(job);
  const totalCostDec = new Decimal(summary.totalManufacturingCost);
  const dmDec = new Decimal(summary.totalDirectMaterial);
  const dlDec = new Decimal(summary.totalDirectLabor);
  const fohDec = new Decimal(summary.totalAppliedOverhead);

  const entryId = `jl-job-${job.jobId}-${Date.now()}`;
  const lines = [
    {
      id: `${entryId}-fg`,
      accountId: 'acc-1104', // Persediaan Barang Jadi
      debit: totalCostDec.toDecimalPlaces(2).toNumber(),
      kredit: 0,
      memo: `Penyelesaian Produksi Barang Jadi: ${job.jobCode} (${job.productName})`,
    },
    {
      id: `${entryId}-dm`,
      accountId: 'acc-1104', // Kredit Bahan Baku / WIP
      debit: 0,
      kredit: dmDec.toDecimalPlaces(2).toNumber(),
      memo: `Pemakaian Biaya Bahan Baku Langsung (Direct Materials) ${job.jobCode}`,
    },
    {
      id: `${entryId}-dl`,
      accountId: 'acc-2103', // Hutang Gaji & Upah
      debit: 0,
      kredit: dlDec.toDecimalPlaces(2).toNumber(),
      memo: `Alokasi Biaya Tenaga Kerja Langsung (${job.directLaborHours} Jam @ Rp ${job.laborRatePerHour.toLocaleString('id-ID')})`,
    },
    {
      id: `${entryId}-foh`,
      accountId: 'acc-6101', // Biaya Overhead Dibebankan
      debit: 0,
      kredit: fohDec.toDecimalPlaces(2).toNumber(),
      memo: `Alokasi Biaya Overhead Pabrik/FOH (${job.machineHours} Jam Mesin @ Rp ${job.predeterminedOverheadRate.toLocaleString('id-ID')})`,
    },
  ];

  const journalEntry: JournalEntry = {
    id: entryId,
    entryNumber: `JOB-CST-${job.jobCode}`,
    date,
    sourceType: 'manual',
    sourceId: job.jobId,
    description: `Jurnal Pembebanan Biaya Pokok Produksi & Job Order Costing ${job.jobCode}`,
    totalDebit: totalCostDec.toDecimalPlaces(2).toNumber(),
    totalKredit: totalCostDec.toDecimalPlaces(2).toNumber(),
    isBalanced: true,
    lines,
    createdAt: new Date().toISOString(),
    createdBy: 'Chief Cost Accountant',
  };

  return {
    journalEntry,
    summary,
  };
}
