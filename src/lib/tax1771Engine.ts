import Decimal from 'decimal.js';
import { Account, JournalEntry } from '../types/accounting';
import { generateIncomeStatement } from './accountingEngine';

export interface FiscalCorrectionItem {
  id: string;
  category: 'positif' | 'negatif';
  code: string;
  description: string;
  legalBasis: string; // e.g. UU HPP Pasal 9 ayat (1)
  amount: number;
  notes: string;
}

export interface Tax1771Computation {
  fiscalYear: number;
  commercialNetProfitBeforeTax: number;
  totalPositiveCorrections: number;
  totalNegativeCorrections: number;
  fiscalNetIncome: number; // PKP (Penghasilan Kena Pajak)
  taxRateStandard: number; // 22%
  hasArticle31EFacility: boolean; // Fasilitas Diskon 50% Pasal 31E UU PPh
  grossTurnover: number; // Omzet bruto
  taxLiabilityArticle17: number; // PPh Terutang
  taxCreditsArticle22_23: number; // Kredit Pajak yang telah dipotong pihak lain
  taxPayableArticle29: number; // PPh Kurang Bayar Akhir Tahun
  monthlyInstallmentArticle25: number; // Angsuran PPh 25 bulanan tahun berikutnya
  corrections: FiscalCorrectionItem[];
}

export const INITIAL_FISCAL_CORRECTIONS: FiscalCorrectionItem[] = [
  {
    id: 'cor-1',
    category: 'positif',
    code: 'POS-01',
    description: 'Pemberian Natura & Kenikmatan Karyawan yang Tidak Berkaitan Langsung dengan Penjualan',
    legalBasis: 'UU HPP Pasal 9 ayat (1) huruf e & PMK-66/2023',
    amount: 18500000,
    notes: 'Paket hampers liburan pribadi staf non-lapangan',
  },
  {
    id: 'cor-2',
    category: 'positif',
    code: 'POS-02',
    description: 'Biaya Jamuan Representasi & Entertainment Tanpa Lampiran Daftar Nominatif',
    legalBasis: 'PMK 02/PMK.03/2010 Pasal 2',
    amount: 12000000,
    notes: 'Kuitansi jamuan makan malam tanpa identitas relasi bisnis resmi',
  },
  {
    id: 'cor-3',
    category: 'positif',
    code: 'POS-03',
    description: 'Sanksi Administrasi & Bunga Keterlambatan Pembayaran Pajak',
    legalBasis: 'UU KUP Pasal 9 ayat (1) huruf k',
    amount: 3500000,
    notes: 'Surat Tagihan Pajak (STP) keterlambatan PPN masa lalu',
  },
  {
    id: 'cor-4',
    category: 'negatif',
    code: 'NEG-01',
    description: 'Pendapatan Bunga Jasa Giro & Deposito Bank (Telah Dikenakan PPh Final 20%)',
    legalBasis: 'UU PPh Pasal 4 ayat (2) & PP 131/2000',
    amount: 2220000,
    notes: 'Koreksi negatif agar tidak terjadi pengenaan pajak ganda (Double Taxation)',
  },
];

export function computeTax1771(
  accounts: Account[],
  journalEntries: JournalEntry[],
  fiscalYear: number = 2026,
  customCorrections: FiscalCorrectionItem[] = INITIAL_FISCAL_CORRECTIONS
): Tax1771Computation {
  const pnl = generateIncomeStatement(accounts, journalEntries);
  const commercialProfit = pnl.netIncome; // Laba Komersial
  const grossTurnover = pnl.totalRevenue; // Omzet Penjualan Bruto

  const positiveTotal = customCorrections
    .filter((c) => c.category === 'positif')
    .reduce((sum, c) => sum + c.amount, 0);

  const negativeTotal = customCorrections
    .filter((c) => c.category === 'negatif')
    .reduce((sum, c) => sum + c.amount, 0);

  // PKP = Laba Komersial + Koreksi Positif - Koreksi Negatif (dibulatkan ribuan ke bawah)
  const pkpRaw = Math.max(0, commercialProfit + positiveTotal - negativeTotal);
  const pkp = Math.floor(pkpRaw / 1000) * 1000;

  // Fasilitas Pasal 31E UU PPh:
  // Jika omzet bruto <= Rp 4.800.000.000, mendapat fasilitas diskon 50% tarif PPh Badan (22% x 50% = 11%)
  const isFacility31E = grossTurnover <= 4800000000;
  let taxLiability = 0;

  if (isFacility31E) {
    // 50% x 22% x PKP = 11% x PKP
    taxLiability = new Decimal(pkp).times(0.11).round().toNumber();
  } else {
    // Tarif umum 22%
    taxLiability = new Decimal(pkp).times(0.22).round().toNumber();
  }

  // Kredit Pajak PPh 22/23 (e.g. Bukti Potong Rekanan BUMN/Instansi)
  const taxCredits = 4500000;
  const taxPayable29 = Math.max(0, taxLiability - taxCredits);

  // Angsuran PPh 25 tahun berikutnya = (PPh Terutang - Kredit Pajak) / 12
  const monthlyInstallment25 = Math.round(taxPayable29 / 12);

  return {
    fiscalYear,
    commercialNetProfitBeforeTax: commercialProfit,
    totalPositiveCorrections: positiveTotal,
    totalNegativeCorrections: negativeTotal,
    fiscalNetIncome: pkp,
    taxRateStandard: 0.22,
    hasArticle31EFacility: isFacility31E,
    grossTurnover,
    taxLiabilityArticle17: taxLiability,
    taxCreditsArticle22_23: taxCredits,
    taxPayableArticle29: taxPayable29,
    monthlyInstallmentArticle25: monthlyInstallment25,
    corrections: customCorrections,
  };
}
