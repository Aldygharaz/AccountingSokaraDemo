import React, { useState } from 'react';
import {
  FileText,
  Percent,
  CheckCircle2,
  Calendar,
  Building2,
  DollarSign,
  Download,
  Printer,
  Sparkles,
} from 'lucide-react';
import { AppState } from '../../lib/storage';
import { formatIDR, generateIncomeStatement, generateBalanceSheet } from '../../lib/accountingEngine';
import { calculateIndonesianTaxes, calculateMonthlyUmkmTax } from '../../lib/taxEngine';
import { soundFx } from '../../lib/soundFx';

interface TaxStudioViewProps {
  state: AppState;
}

export const TaxStudioView: React.FC<TaxStudioViewProps> = ({ state }) => {
  const [selectedTaxTab, setSelectedTaxTab] = useState<'ppn' | 'pph_umkm' | 'pph_23'>('ppn');
  const [testTransactionAmount, setTestTransactionAmount] = useState<number>(10000000);
  const [ppnRateOption, setPpnRateOption] = useState<number>(0.11);

  const incomeStatement = generateIncomeStatement(state.accounts, state.journalEntries);
  const balanceSheet = generateBalanceSheet(state.accounts, state.journalEntries);

  // Live PPN calculations from balance sheet
  const ppnMasukan = balanceSheet.currentAssets.find((a) => a.accountCode === '1105')?.amount || 0;
  const ppnKeluaran = balanceSheet.currentLiabilities.find((a) => a.accountCode === '2102')?.amount || 0;
  const ppnKurangLebihBayar = ppnKeluaran - ppnMasukan;

  // Monthly UMKM Tax (PP 23/2018: 0.5% from gross revenue)
  const monthlyUmkmTax = calculateMonthlyUmkmTax(incomeStatement.totalRevenue);

  const testTaxResult = calculateIndonesianTaxes(testTransactionAmount, {
    applyPPN: true,
    ppnRate: ppnRateOption,
    applyPPh23: true,
    applyPPhFinal: true,
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Pajak & Kepatuhan Fiskal Indonesia (Tax Studio)
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#B5BAC1] mt-1">
            Kalkulator PPN 11%/12%, PPh 23 Jasa 2%, dan PPh Final UMKM 0.5% (PP 23/2018).
          </p>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            window.print();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Rekap Pajak</span>
        </button>
      </div>

      {/* Tax Sub-Tabs */}
      <div className="glass-card rounded-2xl p-4 flex flex-wrap gap-2">
        {[
          { id: 'ppn', label: 'PPN 11% / 12% (Faktur Masukan vs Keluaran)' },
          { id: 'pph_umkm', label: 'PPh Final UMKM 0.5% (PP 23/2018)' },
          { id: 'pph_23', label: 'PPh 23 Jasa 2% (Withholding Tax)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              soundFx.playClick();
              setSelectedTaxTab(tab.id as any);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedTaxTab === tab.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. PPN TAB */}
      {selectedTaxTab === 'ppn' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl glass-card border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-[#B5BAC1]">
                PPN Masukan (Akun 1105 - Pembelian)
              </span>
              <div className="text-2xl font-black text-blue-700 dark:text-blue-400 tabular-nums mt-1">
                {formatIDR(ppnMasukan)}
              </div>
              <p className="text-xs text-slate-400 mt-1">Kredit pajak yang dapat dikompensasikan</p>
            </div>

            <div className="p-6 rounded-2xl glass-card border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-[#B5BAC1]">
                PPN Keluaran (Akun 2102 - Penjualan)
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums mt-1">
                {formatIDR(ppnKeluaran)}
              </div>
              <p className="text-xs text-slate-400 mt-1">PPN yang dipungut dari pelanggan faktur</p>
            </div>

            <div
              className={`p-6 rounded-2xl border ${
                ppnKurangLebihBayar >= 0
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700'
              }`}
            >
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                Status SPT Masa PPN
              </span>
              <div className="text-2xl font-black text-amber-900 dark:text-amber-200 tabular-nums mt-1">
                {ppnKurangLebihBayar >= 0
                  ? `Kurang Bayar: ${formatIDR(ppnKurangLebihBayar)}`
                  : `Lebih Bayar: ${formatIDR(Math.abs(ppnKurangLebihBayar))}`}
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                {ppnKurangLebihBayar >= 0
                  ? 'Wajib disetor ke kas negara sebelum akhir bulan berikutnya'
                  : 'Dapat dikompensasikan ke masa pajak berikutnya'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. PPH FINAL UMKM TAB */}
      {selectedTaxTab === 'pph_umkm' && (
        <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
              0.5%
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Skema PPh Final PP 23/2018 (0.5% Omzet Bruto)
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#B5BAC1]">
                Khusus wajib pajak badan/orang pribadi dengan peredaran bruto tidak melebihi Rp 4.8 Miliar per tahun.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1E1F22] border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Omzet Bruto YTD</span>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">
                {formatIDR(incomeStatement.totalRevenue)}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1E1F22] border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Tarif Pajak Final</span>
              <div className="text-xl font-black text-emerald-600 mt-1">0.5% (PP 23/2018)</div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700">
              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase">
                Estimasi PPh Terutang
              </span>
              <div className="text-xl font-black text-emerald-900 dark:text-emerald-200 mt-1 tabular-nums">
                {formatIDR(monthlyUmkmTax)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. PPH 23 JASA TAB */}
      {selectedTaxTab === 'pph_23' && (
        <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
            Withholding Tax: PPh Pasal 23 (2% Jasa & Sewa)
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#B5BAC1]">
            Kalkulasi pemotongan PPh 23 atas jasa konsultan, jasa perbaikan, dan sewa selain tanah/bangunan.
          </p>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1E1F22] border border-slate-200 dark:border-slate-700 space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 dark:text-slate-300">
              Simulasi Nilai Jasa Kena Pajak (Rp)
            </label>
            <input
              type="number"
              value={testTransactionAmount}
              onChange={(e) => setTestTransactionAmount(Number(e.target.value))}
              className="w-full sm:w-80 px-3 py-2 text-xs rounded-xl glass-input font-mono font-bold text-blue-600"
            />

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-6 text-xs">
              <div>
                <span className="text-slate-400">DPP Jasa:</span>
                <p className="font-bold text-slate-900 dark:text-white">{formatIDR(testTaxResult.dpp)}</p>
              </div>
              <div>
                <span className="text-slate-400">Potongan PPh 23 (2%):</span>
                <p className="font-bold text-rose-600">({formatIDR(testTaxResult.pph23Amount)})</p>
              </div>
              <div>
                <span className="text-slate-400">Jumlah Bersih Dibayarkan ke Vendor:</span>
                <p className="font-black text-emerald-600">{formatIDR(testTaxResult.dpp - testTaxResult.pph23Amount)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
