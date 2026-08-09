import React, { useState } from 'react';
import { Scale,
  FileText,
  Building2,
  CheckCircle2,
  AlertCircle,
  Download,
  Printer,
  Sparkles,
  ShieldAlert,
  Percent,
} from 'lucide-react';
import { AppState } from '../../lib/storage';
import { computeTax1771, FiscalCorrectionItem } from '../../lib/tax1771Engine';
import { formatIDR } from '../../lib/accountingEngine';
import { Modal } from '../common/Modal';
import { soundFx } from '../../lib/soundFx';

interface Tax1771ModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
}

export const Tax1771Modal: React.FC<Tax1771ModalProps> = ({
  isOpen,
  onClose,
  state,
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const tax = computeTax1771(state.accounts, state.journalEntries, selectedYear);

  const handlePrint = () => {
    soundFx.playChime();
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Kertas Kerja Rekonsiliasi Fiskal & SPT Tahunan PPh Badan 1771 (UU HPP)" icon={<Scale className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
      maxWidth="max-w-5xl"
    >
      <div className="space-y-6">
        {/* Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-rose-700 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-orange-500/20">
          <div>
            <div className="text-[11px] font-black uppercase tracking-wider text-amber-200">
              Direktorat Jenderal Pajak (DJP) • Kepatuhan UU HPP & PPh Pasal 17/31E
            </div>
            <div className="text-xl sm:text-2xl font-black mt-0.5">
              Rekonsiliasi Fiskal & PPh Badan Tahun Pajak {selectedYear}
            </div>
            <p className="text-xs text-amber-100 mt-1 max-w-xl">
              Penyesuaian Laba Komersial menjadi Laba Fiskal (PKP) melalui koreksi positif & negatif berdasarkan peraturan perpajakan yang berlaku di Indonesia.
            </p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-right">
            <div className="text-[10px] font-bold uppercase text-amber-200">PPh Kurang Bayar (Pasal 29)</div>
            <div className="text-2xl font-black tabular-nums">{formatIDR(tax.taxPayableArticle29)}</div>
            <div className="text-[10px] font-bold text-amber-300">
              Angsuran PPh 25: {formatIDR(tax.monthlyInstallmentArticle25)} / bulan
            </div>
          </div>
        </div>

        {/* 31E Facility Status Alert */}
        <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Percent className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <div>
              <span className="font-black">Fasilitas Pengurangan Tarif Pasal 31E UU PPh:</span>{' '}
              {tax.hasArticle31EFacility ? (
                <span>
                  Memenuhi syarat (Omzet Bruto {formatIDR(tax.grossTurnover)} &le; Rp 4.800.000.000). Tarif PPh Badan efektif mendapatkan diskon 50% menjadi <strong>11.0%</strong>.
                </span>
              ) : (
                <span>Omzet di atas batas 4.8M. Menggunakan tarif standar umum PPh Badan 22.0%.</span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shrink-0"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Kertas Kerja SPT</span>
          </button>
        </div>

        {/* Working Paper Grid */}
        <div className="border border-slate-200 dark:border-[#3F4147] rounded-2xl overflow-hidden text-xs">
          <div className="bg-slate-100 dark:bg-[#2B2D31] px-4 py-2.5 border-b border-slate-200 dark:border-[#3F4147] font-black text-slate-800 dark:text-white uppercase grid grid-cols-12">
            <span className="col-span-8">Uraian Rekonsiliasi Fiskal (Komparasi Komersial vs Pajak)</span>
            <span className="col-span-4 text-right">Jumlah Rupiah (IDR)</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-[#3F4147]">
            {/* Step 1: Commercial Profit */}
            <div className="p-3.5 grid grid-cols-12 items-center bg-white dark:bg-[#1E1F22]">
              <div className="col-span-8 font-bold text-slate-800 dark:text-white">
                1. LABA BERSIH KOMERSIAL SEBELUM PAJAK (Income Statement)
              </div>
              <div className="col-span-4 text-right font-black text-slate-900 dark:text-white tabular-nums font-mono">
                {formatIDR(tax.commercialNetProfitBeforeTax)}
              </div>
            </div>

            {/* Step 2: Positive Corrections */}
            <div className="p-3.5 bg-rose-50/50 dark:bg-rose-950/20 space-y-2">
              <div className="font-bold text-rose-800 dark:text-rose-400 flex items-center justify-between">
                <span>2. KOREKSI FISKAL POSITIF (Non-Deductible Expenses):</span>
                <span className="font-mono tabular-nums font-black">+{formatIDR(tax.totalPositiveCorrections)}</span>
              </div>
              <div className="space-y-1.5 pl-4 text-[11px] text-slate-600 dark:text-slate-300">
                {tax.corrections.filter((c) => c.category === 'positif').map((c) => (
                  <div key={c.id} className="flex justify-between">
                    <div>
                      <span className="font-bold">{c.code}:</span> {c.description}
                      <span className="block text-[10px] text-slate-400 font-mono">Dasar Hukum: {c.legalBasis}</span>
                    </div>
                    <span className="font-mono tabular-nums font-semibold shrink-0 pl-4">{formatIDR(c.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 3: Negative Corrections */}
            <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-2">
              <div className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center justify-between">
                <span>3. KOREKSI FISKAL NEGATIF (Penghasilan Objek PPh Final / Bukan Objek):</span>
                <span className="font-mono tabular-nums font-black">-{formatIDR(tax.totalNegativeCorrections)}</span>
              </div>
              <div className="space-y-1.5 pl-4 text-[11px] text-slate-600 dark:text-slate-300">
                {tax.corrections.filter((c) => c.category === 'negatif').map((c) => (
                  <div key={c.id} className="flex justify-between">
                    <div>
                      <span className="font-bold">{c.code}:</span> {c.description}
                      <span className="block text-[10px] text-slate-400 font-mono">Dasar Hukum: {c.legalBasis}</span>
                    </div>
                    <span className="font-mono tabular-nums font-semibold shrink-0 pl-4">({formatIDR(c.amount)})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 4: PKP & PPh Calculation */}
            <div className="p-3.5 grid grid-cols-12 items-center bg-slate-50 dark:bg-[#2B2D31] font-black">
              <div className="col-span-8 text-blue-600 dark:text-blue-400">
                4. PENGHASILAN KENA PAJAK (PKP) FISKAL (Dibulatkan)
              </div>
              <div className="col-span-4 text-right font-mono tabular-nums text-sm">
                {formatIDR(tax.fiscalNetIncome)}
              </div>
            </div>

            <div className="p-3.5 grid grid-cols-12 items-center bg-white dark:bg-[#1E1F22]">
              <div className="col-span-8 text-slate-700 dark:text-slate-300">
                5. PPh Badan Terutang (Pasal 17 / Fasilitas 31E Diskon 50% = 11%)
              </div>
              <div className="col-span-4 text-right font-mono tabular-nums font-bold text-rose-600 dark:text-rose-400">
                {formatIDR(tax.taxLiabilityArticle17)}
              </div>
            </div>

            <div className="p-3.5 grid grid-cols-12 items-center bg-white dark:bg-[#1E1F22]">
              <div className="col-span-8 text-slate-700 dark:text-slate-300">
                6. Kredit Pajak yang Telah Dipotong Pihak Lain (PPh 22 & 23)
              </div>
              <div className="col-span-4 text-right font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
                ({formatIDR(tax.taxCreditsArticle22_23)})
              </div>
            </div>

            <div className="p-4 grid grid-cols-12 items-center bg-slate-900 text-white font-black text-sm">
              <div className="col-span-8 uppercase text-amber-400">
                7. PPh KURANG BAYAR AKHIR TAHUN (PPh Pasal 29)
              </div>
              <div className="col-span-4 text-right font-mono tabular-nums text-base text-amber-400">
                {formatIDR(tax.taxPayableArticle29)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
