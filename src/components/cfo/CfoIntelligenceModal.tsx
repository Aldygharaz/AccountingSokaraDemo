import React from 'react';
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  Clock,
  Info,
} from 'lucide-react';
import { calculateCfoIntelligence } from '../../lib/cfoIntelligence';
import { formatIDR } from '../../lib/accountingEngine';
import { Modal } from '../common/Modal';
import { useStore } from '../../lib/storage';

interface CfoIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CfoIntelligenceModal: React.FC<CfoIntelligenceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const accounts = useStore((s) => s.accounts);
  const journalEntries = useStore((s) => s.journalEntries);

  const cfo = calculateCfoIntelligence(accounts, journalEntries);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Analisis Kinerja Keuangan & Rasio DuPont (CFO Studio)"
      icon={<TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
      maxWidth="max-w-5xl"
    >
      <div className="space-y-6 text-slate-900 dark:text-slate-100">
        {/* Top Executive Header Banner */}
        <div className="p-5 rounded-2xl bg-slate-900 dark:bg-[#1E1F22] border border-slate-800 dark:border-[#3F4147] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
          <div className="space-y-1 max-w-xl">
            <div className="text-[11px] font-black uppercase tracking-wider text-blue-300 font-mono">
              Analisis Solvabilitas & Profitabilitas Strategis
            </div>
            <div className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Evaluasi Kesehatan Finansial Eksekutif
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Dekomposisi DuPont 3-Pilar, Altman Z-Score prediksi kepailitan, Siklus Konversi Kas (CCC), dan Ketahanan Runway Kas.
            </p>
          </div>
          <div className="px-4 py-3 rounded-xl bg-slate-800/90 dark:bg-black/50 border border-slate-700 dark:border-[#3F4147] text-right shrink-0">
            <div className="text-[10px] font-bold uppercase text-slate-300 font-mono">Skor Altman Z</div>
            <div className="text-2xl font-black text-white font-mono">{cfo.altmanZ.score}</div>
            <div
              className={`text-[11px] font-bold ${
                cfo.altmanZ.zone === 'safe'
                  ? 'text-emerald-400'
                  : cfo.altmanZ.zone === 'grey'
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {cfo.altmanZ.zoneLabel}
            </div>
          </div>
        </div>

        {/* 4-Card Executive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: DuPont 3-Way Analysis */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#1E1F22] border-2 border-slate-200 dark:border-[#3F4147] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    DuPont 3-Way Framework (ROE)
                  </h4>
                </div>
                <span
                  className={`text-base font-black font-mono tabular-nums px-2.5 py-0.5 rounded-lg ${
                    Number(cfo.duPont.returnOnEquity) >= 0
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  ROE {Number.isFinite(Number(cfo.duPont.returnOnEquity)) ? `${cfo.duPont.returnOnEquity}%` : 'N/A'}
                </span>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
                Mendekomposisi laba atas ekuitas menjadi 3 pilar: Efisiensi Operasional, Utilisasi Aset, dan Struktur Modal.
              </p>

              {/* 3 Metric Pills with High Contrast */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#2B2D31] border border-slate-300 dark:border-[#4E5058]">
                  <span className="text-[10px] uppercase font-black text-slate-700 dark:text-slate-300 block">
                    1. Net Margin
                  </span>
                  <span
                    className={`text-base font-black font-mono tabular-nums block my-0.5 ${
                      Number(cfo.duPont.netProfitMargin) < 0
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {Number.isFinite(Number(cfo.duPont.netProfitMargin)) ? `${cfo.duPont.netProfitMargin}%` : 'N/A'}
                  </span>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block">
                    Profitabilitas
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#2B2D31] border border-slate-300 dark:border-[#4E5058]">
                  <span className="text-[10px] uppercase font-black text-slate-700 dark:text-slate-300 block">
                    2. Asset Turnover
                  </span>
                  <span className="text-base font-black text-blue-600 dark:text-blue-400 font-mono tabular-nums block my-0.5">
                    {Number.isFinite(Number(cfo.duPont.assetTurnover)) ? `${cfo.duPont.assetTurnover}x` : 'N/A'}
                  </span>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block">
                    Efisiensi Aset
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#2B2D31] border border-slate-300 dark:border-[#4E5058]">
                  <span className="text-[10px] uppercase font-black text-slate-700 dark:text-slate-300 block">
                    3. Equity Multiplier
                  </span>
                  <span className="text-base font-black text-indigo-600 dark:text-indigo-400 font-mono tabular-nums block my-0.5">
                    {Number.isFinite(Number(cfo.duPont.financialLeverage)) ? `${cfo.duPont.financialLeverage}x` : 'N/A'}
                  </span>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block">
                    Leverage Modal
                  </span>
                </div>
              </div>
            </div>

            {/* High Contrast Formula Callout */}
            <div className="mt-4 p-2.5 rounded-xl bg-slate-900 dark:bg-black/70 text-blue-300 border border-slate-800 text-xs font-mono text-center font-bold">
              Rumus: {cfo.duPont.roeFormulaString}
            </div>
          </div>

          {/* Card 2: Altman Z-Score Predictor */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#1E1F22] border-2 border-slate-200 dark:border-[#3F4147] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Altman Z-Score (Solvabilitas)
                  </h4>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-black font-mono ${
                    cfo.altmanZ.zone === 'safe'
                      ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : cfo.altmanZ.zone === 'grey'
                      ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300'
                      : 'bg-rose-100 text-rose-900 dark:bg-rose-950/60 dark:text-rose-300'
                  }`}
                >
                  {cfo.altmanZ.score} • {cfo.altmanZ.zone.toUpperCase()}
                </span>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
                {cfo.altmanZ.interpretation}
              </p>

              {/* Visual Gauge Bar */}
              <div className="space-y-1.5 mb-4">
                <div className="relative h-2.5 rounded-full w-full bg-slate-200 dark:bg-slate-800 flex overflow-visible">
                  <div className="h-full bg-rose-500 w-1/4 rounded-l-full" title="Distress < 1.23"></div>
                  <div className="h-full bg-amber-500 w-2/5" title="Grey Zone 1.23 - 2.9"></div>
                  <div className="h-full bg-emerald-500 flex-1 rounded-r-full" title="Safe Zone > 2.9"></div>

                  {/* Dynamic Pointer */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-white rounded-full shadow-lg transition-all duration-700 ease-out"
                    style={{
                      left: `calc(${
                        Number(cfo.altmanZ.score) < 1.23
                          ? (Number(cfo.altmanZ.score) / 1.23) * 25
                          : Number(cfo.altmanZ.score) < 2.9
                          ? 25 + ((Number(cfo.altmanZ.score) - 1.23) / (2.9 - 1.23)) * 40
                          : 65 + Math.min(((Number(cfo.altmanZ.score) - 2.9) / 2.1) * 35, 33)
                      }% - 8px)`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-black text-slate-700 dark:text-slate-300 pt-0.5">
                  <span className="text-rose-600 dark:text-rose-400">0.0 (Bahaya)</span>
                  <span className="text-amber-600 dark:text-amber-400">1.23 (Waspada)</span>
                  <span className="text-emerald-600 dark:text-emerald-400">2.90+ (Sangat Aman)</span>
                </div>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-[#2B2D31] border border-slate-300 dark:border-[#4E5058] flex justify-between items-center">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Modal Kerja / Aset (X1):</span>
                  <span className="font-black font-mono text-slate-900 dark:text-white">
                    {isNaN(cfo.altmanZ.x1WorkingCapitalToAssets) ? '0.00' : cfo.altmanZ.x1WorkingCapitalToAssets.toFixed(2)}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-[#2B2D31] border border-slate-300 dark:border-[#4E5058] flex justify-between items-center">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Laba Ditahan / Aset (X2):</span>
                  <span className="font-black font-mono text-slate-900 dark:text-white">
                    {isNaN(cfo.altmanZ.x2RetainedEarningsToAssets) ? '0.00' : cfo.altmanZ.x2RetainedEarningsToAssets.toFixed(2)}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-[#2B2D31] border border-slate-300 dark:border-[#4E5058] flex justify-between items-center">
                  <span className="font-bold text-slate-700 dark:text-slate-300">EBIT / Total Aset (X3):</span>
                  <span className="font-black font-mono text-slate-900 dark:text-white">
                    {isNaN(cfo.altmanZ.x3EbitToAssets) ? '0.00' : cfo.altmanZ.x3EbitToAssets.toFixed(2)}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-[#2B2D31] border border-slate-300 dark:border-[#4E5058] flex justify-between items-center">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Ekuitas / Liabilitas (X4):</span>
                  <span className="font-black font-mono text-slate-900 dark:text-white">
                    {isNaN(cfo.altmanZ.x4EquityToLiabilities) ? '0.00' : cfo.altmanZ.x4EquityToLiabilities.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Working Capital & CCC */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#1E1F22] border-2 border-slate-200 dark:border-[#3F4147] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Cash Conversion Cycle (CCC)
                  </h4>
                </div>
                <span className="text-base font-black font-mono tabular-nums text-amber-700 dark:text-amber-400 px-2.5 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800">
                  {cfo.workingCapital.cashConversionCycle || 0} Hari
                </span>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
                Kecepatan mengonversi kas yang dikeluarkan untuk persediaan menjadi kas masuk kembali dari penagihan faktur pelanggan.
              </p>

              {/* 3 Metric Pills */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#2B2D31] border border-slate-300 dark:border-[#4E5058]">
                  <span className="text-[10px] uppercase font-black text-slate-700 dark:text-slate-300 block">
                    + DIO (Stok)
                  </span>
                  <span className="text-base font-black text-slate-900 dark:text-white font-mono tabular-nums block my-0.5">
                    {cfo.workingCapital.daysInventoryOutstanding || 0} Hari
                  </span>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block">
                    Umur Persediaan
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#2B2D31] border border-slate-300 dark:border-[#4E5058]">
                  <span className="text-[10px] uppercase font-black text-slate-700 dark:text-slate-300 block">
                    + DSO (Piutang)
                  </span>
                  <span className="text-base font-black text-blue-600 dark:text-blue-400 font-mono tabular-nums block my-0.5">
                    {cfo.workingCapital.daysSalesOutstanding || 0} Hari
                  </span>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block">
                    Lama Tagihan AR
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#2B2D31] border border-slate-300 dark:border-[#4E5058]">
                  <span className="text-[10px] uppercase font-black text-slate-700 dark:text-slate-300 block">
                    - DPO (Hutang)
                  </span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono tabular-nums block my-0.5">
                    {cfo.workingCapital.daysPayableOutstanding || 0} Hari
                  </span>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block">
                    Tempo Pemasok
                  </span>
                </div>
              </div>
            </div>

            {/* High Contrast Formula Callout */}
            <div className="mt-4 p-2.5 rounded-xl bg-slate-900 dark:bg-black/70 text-slate-200 border border-slate-800 text-xs font-mono text-center font-bold">
              Formula: {cfo.workingCapital.daysInventoryOutstanding || 0} (DIO) + {cfo.workingCapital.daysSalesOutstanding || 0} (DSO) - {cfo.workingCapital.daysPayableOutstanding || 0} (DPO) = <span className="text-amber-400">{cfo.workingCapital.cashConversionCycle || 0} Hari</span>
            </div>
          </div>

          {/* Card 4: Cash Runway & Burn Rate */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#1E1F22] border-2 border-slate-200 dark:border-[#3F4147] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300">
                    <Zap className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Cash Runway & Net Burn Rate
                  </h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300">
                  {cfo.runway.isSelfSustaining ? 'Arus Kas Positif' : 'Net Burn'}
                </span>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
                Perkiraan daya tahan likuiditas kas operasional toko berdasarkan rerata pengeluaran bulanan.
              </p>

              {/* High Contrast List Rows */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-100 dark:bg-[#2B2D31] border border-slate-300 dark:border-[#4E5058]">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Saldo Kas & Bank Tersedia:</span>
                  <span className="font-black text-slate-950 dark:text-white font-mono tabular-nums text-sm">
                    {formatIDR(cfo.runway.currentCashAndBank)}
                  </span>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-100 dark:bg-[#2B2D31] border border-slate-300 dark:border-[#4E5058]">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Rerata Arus Kas Masuk Bulanan:</span>
                  <span className="font-black text-emerald-700 dark:text-emerald-400 font-mono tabular-nums text-sm">
                    +{formatIDR(cfo.runway.monthlyAverageInflow)}/bln
                  </span>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-100 dark:bg-[#2B2D31] border border-slate-300 dark:border-[#4E5058]">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Rerata Arus Kas Keluar (HPP+Beban):</span>
                  <span className="font-black text-rose-700 dark:text-rose-400 font-mono tabular-nums text-sm">
                    -{formatIDR(cfo.runway.monthlyAverageOutflow)}/bln
                  </span>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 border-2 border-blue-300 dark:border-blue-800">
                  <span className="font-black text-blue-950 dark:text-blue-200">Net Runway Proyeksi:</span>
                  <span
                    className={`font-black font-mono text-sm ${
                      cfo.runway.isSelfSustaining
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-amber-700 dark:text-amber-400'
                    }`}
                  >
                    {cfo.runway.isSelfSustaining ? 'Tidak Terbatas (Mandiri & Profit)' : `${cfo.runway.runwayMonths} Bulan`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-[#3F4147]">
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Sesuai standar International Financial Reporting Standards (IFRS) & Ikatan Akuntan Indonesia (IAI).</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-black shadow-md transition-all self-stretch sm:self-auto text-center"
          >
            Tutup Panel CFO
          </button>
        </div>
      </div>
    </Modal>
  );
};
