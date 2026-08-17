import React from 'react';
import { BrainCircuit,
  TrendingUp,
  ShieldCheck,
  Zap,
  Clock,
  DollarSign,
  AlertCircle,
  Activity,
  Layers,
  ArrowUpRight,
  Info,
} from 'lucide-react';
import { AppState } from '../../lib/storage';
import { calculateCfoIntelligence } from '../../lib/cfoIntelligence';
import { formatIDR, formatNumber } from '../../lib/accountingEngine';
import { Modal } from '../common/Modal';
import { InteractiveTiltCard } from '../ui/InteractiveTiltCard';
import { useStore } from '../../lib/storage';

interface CfoIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  }

export const CfoIntelligenceModal: React.FC<CfoIntelligenceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const accounts = useStore(s => s.accounts);
  const journalEntries = useStore(s => s.journalEntries);

  const cfo = calculateCfoIntelligence(accounts, journalEntries);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Analisis Kinerja Keuangan & Rasio DuPont (CFO Studio)" icon={<TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
      maxWidth="max-w-5xl"
    >
      <div className="space-y-6">
        {/* Header summary banner */}
        <div className="p-4 rounded-2xl bg-slate-900 dark:bg-[#1E1F22] border border-slate-800 dark:border-[#3F4147] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <div className="text-[11px] font-black uppercase tracking-wider text-blue-200">
              Analisis Solvabilitas & Profitabilitas Strategis Eksekutif
            </div>
            <div className="text-xl sm:text-2xl font-black mt-0.5">
              Kesehatan Finansial Tingkat Korporasi
            </div>
            <p className="text-xs text-blue-100 mt-1 max-w-xl">
              Framework DuPont 3-Way, Altman Z-Score prediksi risiko gagal bayar, Siklus Konversi Kas (CCC), dan Proyeksi Runway Kas.
            </p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-right">
            <div className="text-[10px] font-bold uppercase text-blue-200">Altman Z-Score</div>
            <div className="text-2xl font-black">{cfo.altmanZ.score}</div>
            <div className={`text-[10px] font-bold ${
              cfo.altmanZ.zone === 'safe'
                ? 'text-emerald-300'
                : cfo.altmanZ.zone === 'grey'
                ? 'text-amber-300'
                : 'text-rose-300'
            }`}>
              {cfo.altmanZ.zoneLabel}
            </div>
          </div>
        </div>

        {/* 4-Card Executive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: DuPont 3-Way Analysis */}
          <InteractiveTiltCard glowColor="rgba(0, 89, 181, 0.15)" className="p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                  DuPont 3-Way Framework (ROE)
                </h4>
              </div>
              <span className={`text-base font-black tabular-nums ${
                Number.isNaN(Number(cfo.duPont.returnOnEquity)) || !Number.isFinite(Number(cfo.duPont.returnOnEquity))
                  ? 'text-slate-500'
                  : Number(cfo.duPont.returnOnEquity) >= 0 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-rose-600 dark:text-rose-400'
              }`}>
                ROE {Number.isFinite(Number(cfo.duPont.returnOnEquity)) ? `${cfo.duPont.returnOnEquity}%` : 'N/A'}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-[#B5BAC1] mb-4">
              Mendekomposisi laba atas ekuitas menjadi 3 pilar: Efisiensi Operasional, Utilisasi Aset, dan Leverage Keuangan.
            </p>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#2B2D31] border border-slate-200/80 dark:border-[#3F4147]">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">1. Net Margin (NPM)</span>
                <span className={`text-sm font-black tabular-nums ${
                  Number(cfo.duPont.netProfitMargin) < 0 
                    ? 'text-rose-600 dark:text-rose-400' 
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  {Number.isFinite(Number(cfo.duPont.netProfitMargin)) ? `${cfo.duPont.netProfitMargin}%` : 'N/A'}
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5">Profitabilitas</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#2B2D31] border border-slate-200/80 dark:border-[#3F4147]">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">2. Asset Turnover</span>
                <span className="text-sm font-black text-blue-600 dark:text-blue-400 tabular-nums">
                  {Number.isFinite(Number(cfo.duPont.assetTurnover)) ? `${cfo.duPont.assetTurnover}x` : 'N/A'}
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5">Efisiensi Aset</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#2B2D31] border border-slate-200/80 dark:border-[#3F4147]">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">3. Equity Multiplier</span>
                <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                  {Number.isFinite(Number(cfo.duPont.financialLeverage)) ? `${cfo.duPont.financialLeverage}x` : 'N/A'}
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5">Struktur Modal</span>
              </div>
            </div>

            <div className="mt-3 p-2 rounded-xl bg-blue-50/60 dark:bg-[#2B2D31] text-[10px] text-blue-800 dark:text-blue-300 font-mono text-center">
              Rumus: {cfo.duPont.roeFormulaString}
            </div>
          </InteractiveTiltCard>

          {/* Card 2: Altman Z-Score Predictor */}
          <InteractiveTiltCard glowColor="rgba(16, 185, 129, 0.15)" className="p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                  Altman Z-Score (Solvabilitas)
                </h4>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                cfo.altmanZ.zone === 'safe'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                  : cfo.altmanZ.zone === 'grey'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400'
              }`}>
                {cfo.altmanZ.score} • {cfo.altmanZ.zone.toUpperCase()}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-[#B5BAC1] mb-4">
              {cfo.altmanZ.interpretation}
            </p>

            {/* Visual Gauge Bar */}
            <div className="space-y-1.5 mb-3">
              <div className="relative h-2 rounded-full w-full bg-slate-100 dark:bg-[#2B2D31] flex">
                <div className="h-full bg-rose-500 w-1/4 rounded-l-full" title="Distress < 1.23"></div>
                <div className="h-full bg-amber-500 w-2/5" title="Grey Zone 1.23 - 2.9"></div>
                <div className="h-full bg-emerald-500 flex-1 rounded-r-full" title="Safe Zone > 2.9"></div>
                
                {/* Dynamic Indicator */}
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white dark:bg-slate-800 border-2 border-slate-900 dark:border-white rounded-full shadow-md transition-all duration-700 ease-out"
                  style={{ 
                    left: `calc(${
                      Number(cfo.altmanZ.score) < 1.23
                        ? (Number(cfo.altmanZ.score) / 1.23) * 25
                        : Number(cfo.altmanZ.score) < 2.9
                        ? 25 + ((Number(cfo.altmanZ.score) - 1.23) / (2.9 - 1.23)) * 40
                        : 65 + Math.min(((Number(cfo.altmanZ.score) - 2.9) / 2.1) * 35, 33)
                    }% - 6px)` 
                  }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-bold text-slate-400">
                <span>0.0 (Bahaya)</span>
                <span>1.23 (Waspada)</span>
                <span>2.90+ (Sangat Aman)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-[#DBDEE1]">
              <div className="flex justify-between">
                <span>Modal Kerja / Aset (X1):</span>
                <span className="font-bold tabular-nums font-mono">{isNaN(cfo.altmanZ.x1WorkingCapitalToAssets) ? '0.00' : cfo.altmanZ.x1WorkingCapitalToAssets.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Laba Ditahan / Aset (X2):</span>
                <span className="font-bold tabular-nums font-mono">{isNaN(cfo.altmanZ.x2RetainedEarningsToAssets) ? '0.00' : cfo.altmanZ.x2RetainedEarningsToAssets.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>EBIT / Total Aset (X3):</span>
                <span className="font-bold tabular-nums font-mono">{isNaN(cfo.altmanZ.x3EbitToAssets) ? '0.00' : cfo.altmanZ.x3EbitToAssets.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Ekuitas / Liabilitas (X4):</span>
                <span className="font-bold tabular-nums font-mono">{isNaN(cfo.altmanZ.x4EquityToLiabilities) ? '0.00' : cfo.altmanZ.x4EquityToLiabilities.toFixed(2)}</span>
              </div>
            </div>
          </InteractiveTiltCard>

          {/* Card 3: Working Capital & CCC */}
          <InteractiveTiltCard glowColor="rgba(245, 158, 11, 0.15)" className="p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                  <Clock className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                  Cash Conversion Cycle (CCC)
                </h4>
              </div>
              <span className="text-base font-black text-amber-600 dark:text-amber-400 tabular-nums">
                {cfo.workingCapital.cashConversionCycle || 0} Hari
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-[#B5BAC1] mb-4">
              Kecepatan mengonversi kas yang dikeluarkan untuk persediaan menjadi kas masuk kembali dari penagihan faktur pelanggan.
            </p>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#2B2D31] border border-slate-200/80 dark:border-[#3F4147]">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">+ DIO (Stok)</span>
                <span className="text-sm font-black text-slate-800 dark:text-white tabular-nums">
                  {cfo.workingCapital.daysInventoryOutstanding || 0} Hari
                </span>
                <span className="text-[9px] text-slate-400 block">Umur Persediaan</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#2B2D31] border border-slate-200/80 dark:border-[#3F4147]">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">+ DSO (Piutang)</span>
                <span className="text-sm font-black text-slate-800 dark:text-white tabular-nums">
                  {cfo.workingCapital.daysSalesOutstanding || 0} Hari
                </span>
                <span className="text-[9px] text-slate-400 block">Lama Tagihan AR</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#2B2D31] border border-slate-200/80 dark:border-[#3F4147]">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">- DPO (Hutang)</span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {cfo.workingCapital.daysPayableOutstanding || 0} Hari
                </span>
                <span className="text-[9px] text-slate-400 block">Tempo Pemasok</span>
              </div>
            </div>

            <div className="mt-3 text-[10px] text-center text-slate-500 dark:text-[#B5BAC1] font-mono">
              Formula: {cfo.workingCapital.daysInventoryOutstanding || 0} (DIO) + {cfo.workingCapital.daysSalesOutstanding || 0} (DSO) - {cfo.workingCapital.daysPayableOutstanding || 0} (DPO) = {cfo.workingCapital.cashConversionCycle || 0} Hari
            </div>
          </InteractiveTiltCard>

          {/* Card 4: Cash Runway & Burn Rate */}
          <InteractiveTiltCard glowColor="rgba(235, 69, 158, 0.15)" className="p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400">
                  <Zap className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                  Cash Runway & Net Burn Rate
                </h4>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                {cfo.runway.isSelfSustaining ? 'Arus Kas Positif' : 'Net Burn'}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-[#B5BAC1] mb-4">
              Perkiraan daya tahan likuiditas kas operasional toko berdasarkan rerata pengeluaran bulanan.
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50 dark:bg-[#2B2D31]">
                <span className="text-slate-500 dark:text-[#B5BAC1]">Saldo Kas & Bank Tersedia:</span>
                <span className="font-black text-slate-900 dark:text-white tabular-nums">
                  {formatIDR(cfo.runway.currentCashAndBank)}
                </span>
              </div>

              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50 dark:bg-[#2B2D31]">
                <span className="text-slate-500 dark:text-[#B5BAC1]">Rerata Arus Kas Masuk Bulanan:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  +{formatIDR(cfo.runway.monthlyAverageInflow)}/bln
                </span>
              </div>

              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50 dark:bg-[#2B2D31]">
                <span className="text-slate-500 dark:text-[#B5BAC1]">Rerata Arus Kas Keluar (HPP+Beban):</span>
                <span className="font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                  -{formatIDR(cfo.runway.monthlyAverageOutflow)}/bln
                </span>
              </div>

              <div className="flex justify-between items-center p-2 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <span className="font-bold text-blue-900 dark:text-blue-300">Net Runway Proyeksi:</span>
                <span className={`font-black ${cfo.runway.isSelfSustaining ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {cfo.runway.isSelfSustaining ? 'Tidak Terbatas (Mandiri & Profit)' : `${cfo.runway.runwayMonths} Bulan`}
                </span>
              </div>
            </div>
          </InteractiveTiltCard>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400 border-t border-slate-200 dark:border-[#3F4147]">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            <span>Sesuai standar International Financial Reporting Standards (IFRS) & Ikatan Akuntan Indonesia (IAI).</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-black shadow-md"
          >
            Tutup Panel CFO
          </button>
        </div>
      </div>
    </Modal>
  );
};
