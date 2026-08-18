import React, { useState } from 'react';
import {
  TrendingUp,
  LineChart,
} from 'lucide-react';
import { calculateDcfValuation } from '../../lib/valuationEngine';
import { formatIDR } from '../../lib/accountingEngine';
import { Modal } from '../common/Modal';
import { soundFx } from '../../lib/soundFx';
import { useStore } from '../../lib/storage';

interface DcfValuationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DcfValuationModal: React.FC<DcfValuationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const accounts = useStore((s) => s.accounts);
  const journalEntries = useStore((s) => s.journalEntries);

  const [wacc, setWacc] = useState<number>(10.5);
  const [growthRate, setGrowthRate] = useState<number>(3.5);

  const val = calculateDcfValuation(accounts, journalEntries, wacc, growthRate);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Studio Valuasi Bisnis DCF (Discounted Cash Flow) & WACC Modeling"
      icon={<LineChart className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
      maxWidth="max-w-5xl"
    >
      <div className="space-y-6 text-slate-900 dark:text-slate-100">
        {/* Top Dark Corporate Banner */}
        <div className="p-5 rounded-2xl bg-slate-900 dark:bg-[#1E1F22] border border-slate-800 dark:border-[#3F4147] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
          <div className="space-y-1 max-w-xl">
            <div className="text-[11px] font-black uppercase tracking-wider text-emerald-400 font-mono">
              Corporate Finance & Investment Banking Valuation
            </div>
            <div className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Valuasi Nilai Wajar Perusahaan (Enterprise & Equity Value)
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Proyeksi 5 Tahun Free Cash Flow to Firm (FCFF) yang didiskontokan dengan WACC dan Gordon Growth Terminal Value.
            </p>
          </div>
          <div className="px-4 py-3 rounded-xl bg-slate-800/90 dark:bg-black/50 border border-slate-700 dark:border-[#3F4147] text-right shrink-0">
            <div className="text-[10px] font-bold uppercase text-emerald-300 font-mono">Nilai Ekuitas (Equity Value)</div>
            <div className="text-2xl font-black text-emerald-400 font-mono tabular-nums">
              {formatIDR(val.equityValue)}
            </div>
            <div className="text-[11px] font-bold text-slate-300 mt-0.5">
              Estimasi Harga Saham: <span className="text-white font-black">Rp {val.fairValuePerShare.toLocaleString('id-ID')}</span> / lembar
            </div>
          </div>
        </div>

        {/* Quick WACC Presets */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-100 dark:bg-[#1E1F22] border border-slate-300 dark:border-[#4E5058] text-xs shadow-xs">
          <span className="font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Pilihan Skenario Valuasi Investor:</span>
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                soundFx.playClick();
                setWacc(9.5);
                setGrowthRate(3.0);
              }}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                wacc === 9.5 && growthRate === 3.0
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-[#2B2D31] border border-slate-300 dark:border-[#4E5058] text-slate-800 dark:text-slate-200 hover:bg-slate-50'
              }`}
            >
              Blue Chip (9.5% / 3.0%)
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setWacc(10.5);
                setGrowthRate(3.5);
              }}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                wacc === 10.5 && growthRate === 3.5
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-[#2B2D31] border border-slate-300 dark:border-[#4E5058] text-slate-800 dark:text-slate-200 hover:bg-slate-50'
              }`}
            >
              Baseline (10.5% / 3.5%)
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setWacc(13.0);
                setGrowthRate(4.5);
              }}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                wacc === 13.0 && growthRate === 4.5
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-[#2B2D31] border border-slate-300 dark:border-[#4E5058] text-slate-800 dark:text-slate-200 hover:bg-slate-50'
              }`}
            >
              High Growth (13.0% / 4.5%)
            </button>
          </div>
        </div>

        {/* WACC & Terminal Growth Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 rounded-2xl bg-white dark:bg-[#1E1F22] border-2 border-slate-200 dark:border-[#3F4147] shadow-sm">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              <span>Biaya Modal Tertimbang (WACC):</span>
              <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-800">
                {wacc}%
              </span>
            </div>
            <input
              type="range"
              min="7.0"
              max="16.0"
              step="0.5"
              value={wacc}
              onChange={(e) => {
                soundFx.playClick();
                setWacc(parseFloat(e.target.value));
              }}
              className="w-full accent-blue-600 cursor-pointer h-2.5 bg-slate-200 dark:bg-[#383A40] rounded-lg"
            />
            <div className="flex justify-between text-xs font-extrabold text-slate-700 dark:text-slate-300 pt-0.5">
              <span>Min: 7.0%</span>
              <span className="text-blue-700 dark:text-blue-400">10.5% (Baseline)</span>
              <span>Max: 16.0%</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              <span>Tingkat Pertumbuhan Terminal (g):</span>
              <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800">
                {growthRate}%
              </span>
            </div>
            <input
              type="range"
              min="1.5"
              max="6.0"
              step="0.25"
              value={growthRate}
              onChange={(e) => {
                soundFx.playClick();
                setGrowthRate(parseFloat(e.target.value));
              }}
              className="w-full accent-emerald-600 cursor-pointer h-2.5 bg-slate-200 dark:bg-[#383A40] rounded-lg"
            />
            <div className="flex justify-between text-xs font-extrabold text-slate-700 dark:text-slate-300 pt-0.5">
              <span>Min: 1.5%</span>
              <span className="text-emerald-700 dark:text-emerald-400">3.5% (Baseline)</span>
              <span>Max: 6.0%</span>
            </div>
          </div>
        </div>

        {/* 5-Year Projection Table */}
        <div className="border-2 border-slate-200 dark:border-[#3F4147] rounded-2xl overflow-hidden text-xs shadow-xs bg-white dark:bg-[#1E1F22]">
          <div className="bg-slate-900 dark:bg-[#1E1F22] px-5 py-3 border-b border-slate-800 text-white font-black uppercase grid grid-cols-6 tracking-wider">
            <span>Metrik Proyeksi</span>
            <span className="text-right">Tahun 1 (2027)</span>
            <span className="text-right">Tahun 2 (2028)</span>
            <span className="text-right">Tahun 3 (2029)</span>
            <span className="text-right">Tahun 4 (2030)</span>
            <span className="text-right">Tahun 5 (2031)</span>
          </div>

          <div className="divide-y-2 divide-slate-100 dark:divide-[#3F4147]">
            <div className="p-4 grid grid-cols-6 items-center hover:bg-slate-50 dark:hover:bg-[#383A40] transition-colors">
              <span className="font-black text-xs text-slate-900 dark:text-white">Pendapatan Proyeksi</span>
              {val.projections.map((p) => (
                <span key={p.year} className="text-right font-mono font-bold text-xs text-slate-800 dark:text-slate-200 tabular-nums">
                  {formatIDR(p.revenue)}
                </span>
              ))}
            </div>

            <div className="p-4 grid grid-cols-6 items-center hover:bg-slate-50 dark:hover:bg-[#383A40] transition-colors">
              <span className="font-black text-xs text-slate-900 dark:text-white">NOPAT (Laba Operasional)</span>
              {val.projections.map((p) => (
                <span key={p.year} className="text-right font-mono font-black text-xs text-blue-700 dark:text-blue-400 tabular-nums">
                  {formatIDR(p.nopat)}
                </span>
              ))}
            </div>

            <div className="p-4 grid grid-cols-6 items-center hover:bg-slate-50 dark:hover:bg-[#383A40] transition-colors">
              <span className="font-black text-xs text-slate-900 dark:text-white">Free Cash Flow (FCFF)</span>
              {val.projections.map((p) => (
                <span key={p.year} className="text-right font-mono font-black text-xs text-emerald-700 dark:text-emerald-400 tabular-nums">
                  {formatIDR(p.fcff)}
                </span>
              ))}
            </div>

            <div className="p-4 grid grid-cols-6 items-center bg-blue-50 dark:bg-blue-950/40 border-t-2 border-blue-200 dark:border-blue-800 font-black">
              <span className="text-blue-950 dark:text-blue-100 font-black text-xs">Present Value (PV @ {wacc}%)</span>
              {val.projections.map((p) => (
                <span key={p.year} className="text-right font-mono font-black text-xs text-blue-950 dark:text-blue-100 tabular-nums">
                  {formatIDR(p.presentValue)}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Valuation Waterfall Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#2B2D31] border-2 border-slate-200 dark:border-[#4E5058] shadow-xs flex flex-col justify-between">
            <span className="text-[11px] uppercase font-black text-slate-700 dark:text-slate-300 block">
              Sum PV of 5-Yr FCFF
            </span>
            <span className="text-lg font-black text-slate-950 dark:text-white font-mono tabular-nums mt-1">
              {formatIDR(val.sumPvOfFcff)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#2B2D31] border-2 border-slate-200 dark:border-[#4E5058] shadow-xs flex flex-col justify-between">
            <span className="text-[11px] uppercase font-black text-slate-700 dark:text-slate-300 block">
              PV of Terminal Value
            </span>
            <span className="text-lg font-black text-blue-700 dark:text-blue-400 font-mono tabular-nums mt-1">
              {formatIDR(val.pvOfTerminalValue)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#2B2D31] border-2 border-slate-200 dark:border-[#4E5058] shadow-xs flex flex-col justify-between">
            <span className="text-[11px] uppercase font-black text-slate-700 dark:text-slate-300 block">
              Nilai Perusahaan (EV)
            </span>
            <span className="text-lg font-black text-indigo-700 dark:text-indigo-400 font-mono tabular-nums mt-1">
              {formatIDR(val.enterpriseValue)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#2B2D31] border-2 border-slate-200 dark:border-[#4E5058] shadow-xs flex flex-col justify-between">
            <span className="text-[11px] uppercase font-black text-slate-700 dark:text-slate-300 block">
              Economic Value Added (EVA)
            </span>
            <span
              className={`text-lg font-black font-mono tabular-nums mt-1 ${
                val.economicValueAdded >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
              }`}
            >
              {formatIDR(val.economicValueAdded)}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
