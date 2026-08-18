import React, { useState } from 'react';
import {
  Scale,
  CheckCircle2,
  Printer,
  Percent,
} from 'lucide-react';
import { computeTax1771 } from '../../lib/tax1771Engine';
import { formatIDR } from '../../lib/accountingEngine';
import { Modal } from '../common/Modal';
import { soundFx } from '../../lib/soundFx';
import { useStore } from '../../lib/storage';

interface Tax1771ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Tax1771Modal: React.FC<Tax1771ModalProps> = ({
  isOpen,
  onClose,
}) => {
  const accounts = useStore((s) => s.accounts);
  const journalEntries = useStore((s) => s.journalEntries);

  const [selectedYear] = useState<number>(2026);
  const tax = computeTax1771(accounts, journalEntries, selectedYear);

  const handlePrint = () => {
    soundFx.playChime();
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Kertas Kerja Rekonsiliasi Fiskal & SPT Tahunan PPh Badan 1771 (UU HPP)"
      icon={<Scale className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
      maxWidth="max-w-5xl"
    >
      <div className="space-y-6 text-slate-900 dark:text-slate-100">
        {/* Top Dark Executive Banner */}
        <div className="p-5 rounded-2xl bg-slate-900 dark:bg-[#1E1F22] border border-slate-800 dark:border-[#3F4147] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
          <div className="space-y-1 max-w-xl">
            <div className="text-[11px] font-black uppercase tracking-wider text-amber-300 font-mono">
              Direktorat Jenderal Pajak (DJP) • Kepatuhan UU HPP & PPh Pasal 17/31E
            </div>
            <div className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Rekonsiliasi Fiskal & PPh Badan Tahun Pajak {selectedYear}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Penyesuaian Laba Komersial menjadi Laba Fiskal (PKP) melalui koreksi positif & negatif berdasarkan peraturan perpajakan yang berlaku di Indonesia.
            </p>
          </div>
          <div className="px-4 py-3 rounded-xl bg-slate-800/90 dark:bg-black/50 border border-slate-700 dark:border-[#3F4147] text-right shrink-0">
            <div className="text-[10px] font-bold uppercase text-amber-300 font-mono">PPh Kurang Bayar (Pasal 29)</div>
            <div className="text-2xl font-black text-amber-400 font-mono tabular-nums">
              {formatIDR(tax.taxPayableArticle29)}
            </div>
            <div className="text-[11px] font-bold text-slate-300">
              Angsuran PPh 25: {formatIDR(tax.monthlyInstallmentArticle25)} / bulan
            </div>
          </div>
        </div>

        {/* 31E Facility Status Alert */}
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border-2 border-blue-200 dark:border-blue-800 text-blue-950 dark:text-blue-100 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0">
              <Percent className="w-4 h-4" />
            </div>
            <div>
              <span className="font-black text-sm">Fasilitas Pengurangan Tarif Pasal 31E UU PPh:</span>{' '}
              {tax.hasArticle31EFacility ? (
                <span className="text-slate-800 dark:text-slate-200 font-medium block sm:inline mt-0.5 sm:mt-0">
                  Memenuhi syarat (Omzet Bruto {formatIDR(tax.grossTurnover)} &le; Rp 4.800.000.000). Tarif PPh Badan efektif mendapatkan diskon 50% menjadi <strong className="text-blue-700 dark:text-blue-300 font-black">11.0%</strong>.
                </span>
              ) : (
                <span className="text-slate-800 dark:text-slate-200 font-medium block sm:inline mt-0.5 sm:mt-0">
                  Omzet di atas batas 4.8M. Menggunakan tarif standar umum PPh Badan 22.0%.
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shrink-0 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Kertas Kerja SPT</span>
          </button>
        </div>

        {/* Working Paper Grid */}
        <div className="border-2 border-slate-200 dark:border-[#3F4147] rounded-2xl overflow-hidden text-xs shadow-sm bg-white dark:bg-[#1E1F22]">
          <div className="bg-slate-900 dark:bg-[#1E1F22] px-5 py-3 border-b border-slate-800 dark:border-[#3F4147] font-black text-white uppercase grid grid-cols-12 tracking-wider">
            <span className="col-span-8">Uraian Rekonsiliasi Fiskal (Komparasi Komersial vs Pajak)</span>
            <span className="col-span-4 text-right">Jumlah Rupiah (IDR)</span>
          </div>

          <div className="divide-y-2 divide-slate-100 dark:divide-[#3F4147]">
            {/* Step 1: Commercial Profit */}
            <div className="p-4 grid grid-cols-12 items-center bg-white dark:bg-[#1E1F22]">
              <div className="col-span-8 font-black text-sm text-slate-900 dark:text-white">
                1. LABA BERSIH KOMERSIAL SEBELUM PAJAK (Income Statement)
              </div>
              <div className="col-span-4 text-right font-black text-slate-950 dark:text-white tabular-nums font-mono text-sm">
                {formatIDR(tax.commercialNetProfitBeforeTax)}
              </div>
            </div>

            {/* Step 2: Positive Corrections */}
            <div className="p-4 bg-rose-50/70 dark:bg-rose-950/20 space-y-3">
              <div className="font-black text-rose-800 dark:text-rose-300 flex items-center justify-between text-xs uppercase tracking-wide">
                <span>2. KOREKSI FISKAL POSITIF (Non-Deductible Expenses):</span>
                <span className="font-mono tabular-nums text-sm font-black text-rose-700 dark:text-rose-400">
                  +{formatIDR(tax.totalPositiveCorrections)}
                </span>
              </div>
              <div className="space-y-2 pl-2 sm:pl-4">
                {tax.corrections
                  .filter((c) => c.category === 'positif')
                  .map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl bg-white dark:bg-[#2B2D31] border border-rose-200 dark:border-rose-900/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900 dark:text-white text-xs">
                          <span className="font-mono font-black text-rose-700 dark:text-rose-400 mr-1.5">{c.code}:</span>
                          {c.description}
                        </div>
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#1E1F22] border border-slate-300 dark:border-[#4E5058] text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200">
                          <span>Dasar Hukum:</span>
                          <span className="text-slate-950 dark:text-white">{c.legalBasis}</span>
                        </div>
                      </div>
                      <span className="font-mono tabular-nums font-black text-xs text-rose-700 dark:text-rose-400 shrink-0 self-end sm:self-center">
                        +{formatIDR(c.amount)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Step 3: Negative Corrections */}
            <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/20 space-y-3">
              <div className="font-black text-emerald-800 dark:text-emerald-300 flex items-center justify-between text-xs uppercase tracking-wide">
                <span>3. KOREKSI FISKAL NEGATIF (Penghasilan Objek PPh Final / Bukan Objek):</span>
                <span className="font-mono tabular-nums text-sm font-black text-emerald-700 dark:text-emerald-400">
                  -{formatIDR(tax.totalNegativeCorrections)}
                </span>
              </div>
              <div className="space-y-2 pl-2 sm:pl-4">
                {tax.corrections
                  .filter((c) => c.category === 'negatif')
                  .map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl bg-white dark:bg-[#2B2D31] border border-emerald-200 dark:border-emerald-900/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900 dark:text-white text-xs">
                          <span className="font-mono font-black text-emerald-700 dark:text-emerald-400 mr-1.5">{c.code}:</span>
                          {c.description}
                        </div>
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#1E1F22] border border-slate-300 dark:border-[#4E5058] text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200">
                          <span>Dasar Hukum:</span>
                          <span className="text-slate-950 dark:text-white">{c.legalBasis}</span>
                        </div>
                      </div>
                      <span className="font-mono tabular-nums font-black text-xs text-emerald-700 dark:text-emerald-400 shrink-0 self-end sm:self-center">
                        ({formatIDR(c.amount)})
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Step 4: PKP & PPh Calculation */}
            <div className="p-4 grid grid-cols-12 items-center bg-blue-50 dark:bg-blue-950/40 border-y-2 border-blue-200 dark:border-blue-800 font-black">
              <div className="col-span-8 text-blue-950 dark:text-blue-200 text-sm">
                4. PENGHASILAN KENA PAJAK (PKP) FISKAL (Dibulatkan)
              </div>
              <div className="col-span-4 text-right font-mono tabular-nums text-base text-blue-950 dark:text-blue-200">
                {formatIDR(tax.fiscalNetIncome)}
              </div>
            </div>

            <div className="p-4 grid grid-cols-12 items-center bg-white dark:bg-[#1E1F22]">
              <div className="col-span-8 font-bold text-slate-800 dark:text-slate-200">
                5. PPh Badan Terutang (Pasal 17 / Fasilitas 31E Diskon 50% = 11%)
              </div>
              <div className="col-span-4 text-right font-mono tabular-nums font-black text-sm text-rose-700 dark:text-rose-400">
                {formatIDR(tax.taxLiabilityArticle17)}
              </div>
            </div>

            <div className="p-4 grid grid-cols-12 items-center bg-white dark:bg-[#1E1F22]">
              <div className="col-span-8 font-bold text-slate-800 dark:text-slate-200">
                6. Kredit Pajak yang Telah Dipotong Pihak Lain (PPh 22 & 23)
              </div>
              <div className="col-span-4 text-right font-mono tabular-nums font-black text-sm text-emerald-700 dark:text-emerald-400">
                ({formatIDR(tax.taxCreditsArticle22_23)})
              </div>
            </div>

            {/* Step 7: Final Payable */}
            <div className="p-5 grid grid-cols-12 items-center bg-slate-900 text-white font-black text-sm rounded-b-2xl">
              <div className="col-span-8 uppercase text-amber-300 font-mono tracking-wider">
                7. PPh KURANG BAYAR AKHIR TAHUN (PPh Pasal 29)
              </div>
              <div className="col-span-4 text-right font-mono tabular-nums text-lg text-amber-300">
                {formatIDR(tax.taxPayableArticle29)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
