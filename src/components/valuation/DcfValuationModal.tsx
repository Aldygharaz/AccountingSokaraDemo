import React, { useState } from 'react';
import {
  TrendingUp,
  LineChart,
  DollarSign,
  Layers,
  ArrowRight,
  ShieldCheck,
  Building2,
  Percent,
  Sparkles,
} from 'lucide-react';
import { AppState } from '../../lib/storage';
import { calculateDcfValuation } from '../../lib/valuationEngine';
import { formatIDR } from '../../lib/accountingEngine';
import { Modal } from '../common/Modal';
import { InteractiveTiltCard } from '../ui/InteractiveTiltCard';
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
  const accounts = useStore(s => s.accounts);
  const journalEntries = useStore(s => s.journalEntries);

  const [wacc, setWacc] = useState<number>(10.5);
  const [growthRate, setGrowthRate] = useState<number>(3.5);

  const val = calculateDcfValuation(accounts, journalEntries, wacc, growthRate);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Studio Valuasi Bisnis DCF (Discounted Cash Flow) & WACC Modeling" icon={<LineChart className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
      maxWidth="max-w-5xl"
    >
      <div className="space-y-6">
        {/* Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-700 to-blue-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-emerald-500/20">
          <div>
            <div className="text-[11px] font-black uppercase tracking-wider text-emerald-200">
              Corporate Finance & Investment Banking Grade
            </div>
            <div className="text-xl sm:text-2xl font-black mt-0.5">
              Valuasi Nilai Wajar Perusahaan (Enterprise & Equity Value)
            </div>
            <p className="text-xs text-emerald-100 mt-1 max-w-xl">
              Proyeksi 5 Tahun Free Cash Flow to Firm (FCFF) yang didiskontokan dengan WACC dan Gordon Growth Terminal Value.
            </p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-right">
            <div className="text-[10px] font-bold uppercase text-emerald-200">Nilai Ekuitas (Equity Value)</div>
            <div className="text-2xl font-black tabular-nums">{formatIDR(val.equityValue)}</div>
            <div className="text-[10px] font-bold text-emerald-300">
              Estimasi Harga Saham Wajar: Rp {val.fairValuePerShare.toLocaleString('id-ID')} / lembar
            </div>
          </div>
        </div>

        {/* Quick WACC Presets */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs">
          <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Pilihan Skenario Valuasi Investor:</span>
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                soundFx.playClick();
                setWacc(9.5);
                setGrowthRate(3.0);
              }}
              className="px-3 py-1 rounded-xl bg-white dark:bg-[#1E1F22] border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-300 font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Blue Chip (9.5% / 3.0%)
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setWacc(10.5);
                setGrowthRate(3.5);
              }}
              className="px-3 py-1 rounded-xl bg-emerald-600 text-white font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm"
            >
              Baseline (10.5% / 3.5%)
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setWacc(13.0);
                setGrowthRate(4.5);
              }}
              className="px-3 py-1 rounded-xl bg-white dark:bg-[#1E1F22] border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-300 font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              High Growth (13.0% / 4.5%)
            </button>
          </div>
        </div>

        {/* WACC & Terminal Growth Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-3xl bg-slate-50 dark:bg-[#2B2D31] border border-slate-200/80 dark:border-[#3F4147]">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-black text-slate-800 dark:text-white">
              <span>Biaya Modal Tertimbang (WACC):</span>
              <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
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
              className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 dark:bg-[#383A40] rounded-lg"
            />
            <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-[#80848E]">
              <span>Min: 7.0%</span>
              <span>10.5% (Baseline)</span>
              <span>Max: 16.0%</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-black text-slate-800 dark:text-white">
              <span>Tingkat Pertumbuhan Terminal (g):</span>
              <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
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
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 dark:bg-[#383A40] rounded-lg"
            />
            <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-[#80848E]">
              <span>Min: 1.5%</span>
              <span>3.5% (Baseline)</span>
              <span>Max: 6.0%</span>
            </div>
          </div>
        </div>

        {/* 5-Year Projection Table */}
        <div className="border border-slate-200 dark:border-[#3F4147] rounded-2xl overflow-hidden text-xs">
          <div className="bg-slate-100 dark:bg-[#2B2D31] px-4 py-2.5 border-b border-slate-200 dark:border-[#3F4147] font-black text-slate-800 dark:text-white uppercase grid grid-cols-6">
            <span>Metrik Finansial Proyeksi</span>
            <span className="text-right">Tahun 1 (2027)</span>
            <span className="text-right">Tahun 2 (2028)</span>
            <span className="text-right">Tahun 3 (2029)</span>
            <span className="text-right">Tahun 4 (2030)</span>
            <span className="text-right">Tahun 5 (2031)</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-[#3F4147]">
            <div className="p-3 grid grid-cols-6 items-center hover:bg-slate-50 dark:hover:bg-[#383A40]">
              <span className="font-bold text-slate-700 dark:text-slate-300">Pendapatan Proyeksi</span>
              {val.projections.map((p) => (
                <span key={p.year} className="text-right font-mono tabular-nums">{formatIDR(p.revenue)}</span>
              ))}
            </div>

            <div className="p-3 grid grid-cols-6 items-center hover:bg-slate-50 dark:hover:bg-[#383A40]">
              <span className="font-bold text-slate-700 dark:text-slate-300">NOPAT (Laba Operasional Bersih)</span>
              {val.projections.map((p) => (
                <span key={p.year} className="text-right font-mono tabular-nums text-blue-600 dark:text-blue-400">{formatIDR(p.nopat)}</span>
              ))}
            </div>

            <div className="p-3 grid grid-cols-6 items-center hover:bg-slate-50 dark:hover:bg-[#383A40]">
              <span className="font-bold text-slate-700 dark:text-slate-300">Free Cash Flow to Firm (FCFF)</span>
              {val.projections.map((p) => (
                <span key={p.year} className="text-right font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400">{formatIDR(p.fcff)}</span>
              ))}
            </div>

            <div className="p-3 grid grid-cols-6 items-center bg-slate-50 dark:bg-[#2B2D31] font-black">
              <span className="text-slate-900 dark:text-white">Present Value (PV @ {wacc}%)</span>
              {val.projections.map((p) => (
                <span key={p.year} className="text-right font-mono tabular-nums text-slate-900 dark:text-white">{formatIDR(p.presentValue)}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Valuation Waterfall Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#2B2D31] border border-slate-200/80 dark:border-[#3F4147]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Sum PV of 5-Yr FCFF</span>
            <span className="text-base font-black text-slate-900 dark:text-white tabular-nums">
              {formatIDR(val.sumPvOfFcff)}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#2B2D31] border border-slate-200/80 dark:border-[#3F4147]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">PV of Terminal Value</span>
            <span className="text-base font-black text-blue-600 dark:text-blue-400 tabular-nums">
              {formatIDR(val.pvOfTerminalValue)}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#2B2D31] border border-slate-200/80 dark:border-[#3F4147]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Nilai Perusahaan (EV)</span>
            <span className="text-base font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
              {formatIDR(val.enterpriseValue)}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#2B2D31] border border-slate-200/80 dark:border-[#3F4147]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Economic Value Added (EVA)</span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatIDR(val.economicValueAdded)}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
