import React, { useState } from 'react';
import {
  Sliders,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Sparkles,
  Calculator,
  RotateCcw,
  CheckCircle2,
  Zap,
  ShieldAlert,
  Target,
  ArrowRight,
} from 'lucide-react';
import { AppState } from '../../lib/storage';
import {
  formatIDR,
  formatNumber,
  generateIncomeStatement,
  generateBalanceSheet,
} from '../../lib/accountingEngine';
import { soundFx } from '../../lib/soundFx';

interface FinancialSimulatorProps {
  state: AppState;
}

export const FinancialSimulator: React.FC<FinancialSimulatorProps> = ({ state }) => {
  const baseIncome = generateIncomeStatement(state.accounts, state.journalEntries);

  // Simulation Sliders
  const [salesGrowth, setSalesGrowth] = useState<number>(15); // +15%
  const [cogsInflation, setCogsInflation] = useState<number>(5); // +5%
  const [opexReduction, setOpexReduction] = useState<number>(-10); // -10% efficiency

  // Preset scenarios
  const handleApplyPreset = (preset: 'aggressive' | 'moderate' | 'crisis' | 'reset') => {
    // soundFx.playClick();
    if (preset === 'aggressive') {
      setSalesGrowth(35);
      setCogsInflation(8);
      setOpexReduction(-15);
    } else if (preset === 'moderate') {
      setSalesGrowth(15);
      setCogsInflation(5);
      setOpexReduction(-10);
    } else if (preset === 'crisis') {
      setSalesGrowth(-20);
      setCogsInflation(15);
      setOpexReduction(5);
    } else {
      setSalesGrowth(0);
      setCogsInflation(0);
      setOpexReduction(0);
    }
  };

  // Calculations
  const simulatedSales = Math.max(0, baseIncome.totalRevenue * (1 + salesGrowth / 100));
  const simulatedCogs = Math.max(0, baseIncome.totalCogs * (1 + cogsInflation / 100));
  const simulatedGrossProfit = simulatedSales - simulatedCogs;
  const simulatedOpex = Math.max(0, baseIncome.totalOperatingExpenses * (1 + opexReduction / 100));
  const simulatedNetProfit = simulatedGrossProfit - simulatedOpex;

  const baseNetProfit = baseIncome.netIncome;
  const profitDelta = simulatedNetProfit - baseNetProfit;
  const simulatedNPM = simulatedSales > 0 ? (simulatedNetProfit / simulatedSales) * 100 : 0;

  // Break-even Point calculation: Fixed Operating Expenses / Gross Profit Margin Ratio
  const gpmRatio = simulatedSales > 0 ? simulatedGrossProfit / simulatedSales : 0.25;
  const breakEvenRevenue = gpmRatio > 0 ? simulatedOpex / gpmRatio : (gpmRatio < 0 ? -1 : 0);

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-8 bg-white dark:bg-[#2B2D31] border border-slate-200/80 dark:border-[#3F4147] shadow-xl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-6 border-b border-slate-200 dark:border-[#3F4147]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Simulasi Finansial Eksekutif ("What-If" Sensitivity Sandbox)
              </h2>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Live Simulator
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#B5BAC1] mt-0.5">
              Uji ketahanan margin laba, skenario kenaikan omzet, inflasi harga beli distributor, dan efisiensi biaya operasional.
            </p>
          </div>
        </div>

        {/* Scenario Presets Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleApplyPreset('aggressive')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-black transition-all hover:scale-[1.02] active:scale-[0.98]"
            title="Skenario Pertumbuhan Agresif: Omzet +35%, HPP +8%, Beban -15%"
          >
            <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Ekspansi Agresif</span>
          </button>

          <button
            onClick={() => handleApplyPreset('moderate')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-black transition-all hover:scale-[1.02] active:scale-[0.98]"
            title="Skenario Target Baseline 2026: Omzet +15%, HPP +5%, Beban -10%"
          >
            <Target className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>️ Baseline 2026</span>
          </button>

          <button
            onClick={() => handleApplyPreset('crisis')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-900 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-black transition-all hover:scale-[1.02] active:scale-[0.98]"
            title="Skenario Krisis & Inflasi: Omzet -20%, HPP +15%, Beban +5%"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>️ Skenario Krisis</span>
          </button>

          <button
            onClick={() => handleApplyPreset('reset')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#3F4147] hover:bg-slate-100 dark:hover:bg-[#383A40] text-xs font-black text-slate-600 dark:text-[#DBDEE1] transition-colors"
            title="Kembalikan ke data pembukuan aktual saat ini"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset 0%</span>
          </button>
        </div>
      </div>

      {/* Dynamic 3 Sliders Grid with Min/Max and Value Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Slider 1: Sales Growth */}
        <div className="p-5 rounded-3xl bg-slate-50 dark:bg-[#1E1F22] border border-slate-200/80 dark:border-[#3F4147] space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
              Target Omzet Penjualan
            </span>
            <span
              className={`font-mono text-xs font-black px-2.5 py-0.5 rounded-full border ${
                salesGrowth > 0
                  ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                  : salesGrowth < 0
                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                  : 'bg-slate-200 dark:bg-[#383A40] text-slate-700 dark:text-[#DBDEE1] border-slate-300 dark:border-[#3F4147]'
              }`}
            >
              {salesGrowth > 0 ? `+${salesGrowth}%` : `${salesGrowth}%`}
            </span>
          </div>
          <span className="text-xs text-slate-500">Baseline Omzet: {formatIDR(baseIncome.totalRevenue)}</span>

          <input
            type="range"
            min="-50"
            max="100"
            step="1"
            value={salesGrowth}
            onChange={(e) => {
              // soundFx.playClick();
              setSalesGrowth(Number(e.target.value));
            }}
            className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 dark:bg-[#383A40] rounded-lg"
          />

          <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-[#80848E]">
            <span>Min: -50% (Resesi)</span>
            <span>0%</span>
            <span>Max: +100% (2x Lipat)</span>
          </div>

          <div className="pt-2 border-t border-slate-200/60 dark:border-[#3F4147] flex justify-between text-xs">
            <span className="text-slate-500 dark:text-[#B5BAC1]">Proyeksi Penjualan:</span>
            <strong className="text-slate-900 dark:text-white tabular-nums font-mono">
              {formatIDR(simulatedSales)}
            </strong>
          </div>
        </div>

        {/* Slider 2: COGS Inflation */}
        <div className="p-5 rounded-3xl bg-slate-50 dark:bg-[#1E1F22] border border-slate-200/80 dark:border-[#3F4147] space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
              Kenaikan Harga Beli / HPP
            </span>
            <span
              className={`font-mono text-xs font-black px-2.5 py-0.5 rounded-full border ${
                cogsInflation > 0
                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                  : cogsInflation < 0
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-slate-200 dark:bg-[#383A40] text-slate-700 dark:text-[#DBDEE1] border-slate-300 dark:border-[#3F4147]'
              }`}
            >
              {cogsInflation > 0 ? `+${cogsInflation}%` : `${cogsInflation}%`}
            </span>
          </div>
          <span className="text-xs text-slate-500">Baseline HPP: {formatIDR(baseIncome.totalCogs)}</span>

          <input
            type="range"
            min="-30"
            max="50"
            step="1"
            value={cogsInflation}
            onChange={(e) => {
              // soundFx.playClick();
              setCogsInflation(Number(e.target.value));
            }}
            className="w-full accent-rose-600 cursor-pointer h-2 bg-slate-200 dark:bg-[#383A40] rounded-lg"
          />

          <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-[#80848E]">
            <span>Diskon: -30%</span>
            <span>0%</span>
            <span>Inflasi: +50%</span>
          </div>

          <div className="pt-2 border-t border-slate-200/60 dark:border-[#3F4147] flex justify-between text-xs">
            <span className="text-slate-500 dark:text-[#B5BAC1]">Proyeksi HPP:</span>
            <strong className="text-slate-900 dark:text-white tabular-nums font-mono">
              {formatIDR(simulatedCogs)}
            </strong>
          </div>
        </div>

        {/* Slider 3: OpEx Efficiency */}
        <div className="p-5 rounded-3xl bg-slate-50 dark:bg-[#1E1F22] border border-slate-200/80 dark:border-[#3F4147] space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
              Efisiensi Biaya Operasional
            </span>
            <span
              className={`font-mono text-xs font-black px-2.5 py-0.5 rounded-full border ${
                opexReduction < 0
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : opexReduction > 0
                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                  : 'bg-slate-200 dark:bg-[#383A40] text-slate-700 dark:text-[#DBDEE1] border-slate-300 dark:border-[#3F4147]'
              }`}
            >
              {opexReduction > 0 ? `+${opexReduction}% (Boros)` : opexReduction < 0 ? `${opexReduction}% (Hemat)` : `0% (Tetap)`}
            </span>
          </div>
          <span className="text-xs text-slate-500">Baseline Beban: {formatIDR(baseIncome.totalOperatingExpenses)}</span>

          <input
            type="range"
            min="-40"
            max="40"
            step="1"
            value={opexReduction}
            onChange={(e) => {
              // soundFx.playClick();
              setOpexReduction(Number(e.target.value));
            }}
            className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 dark:bg-[#383A40] rounded-lg"
          />

          <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-[#80848E]">
            <span>Hemat: -40%</span>
            <span>0%</span>
            <span>Kenaikan: +40%</span>
          </div>

          <div className="pt-2 border-t border-slate-200/60 dark:border-[#3F4147] flex justify-between text-xs">
            <span className="text-slate-500 dark:text-[#B5BAC1]">Proyeksi Beban:</span>
            <strong className="text-slate-900 dark:text-white tabular-nums font-mono">
              {formatIDR(simulatedOpex)}
            </strong>
          </div>
        </div>
      </div>

      {/* Simulated Results Banner Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Gross Profit */}
        <div className="p-5 rounded-3xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-800 dark:text-blue-300">
            Proyeksi Laba Kotor (Gross Profit)
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums my-2 tracking-tight">
            {formatIDR(simulatedGrossProfit)}
          </div>
          <span className="text-xs text-slate-500 dark:text-[#B5BAC1]">
            Margin Kotor: <strong>{formatNumber((simulatedGrossProfit / (simulatedSales || 1)) * 100, 1)}%</strong>
          </span>
        </div>

        {/* Card 2: Net Profit */}
        <div className={`p-5 rounded-3xl flex flex-col justify-between shadow-md border-2 ${
          simulatedNetProfit >= 0 
            ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700' 
            : 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700'
        }`}>
          <span className={`text-[10px] font-extrabold uppercase tracking-wider ${
            simulatedNetProfit >= 0 ? 'text-emerald-800 dark:text-emerald-300' : 'text-rose-800 dark:text-rose-300'
          }`}>
            Proyeksi Laba Bersih (Net Income)
          </span>
          <div className={`text-2xl font-black tabular-nums my-2 tracking-tight ${
            simulatedNetProfit >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
          }`}>
            {formatIDR(simulatedNetProfit)}
          </div>
          <div className={`flex items-center gap-1.5 text-xs font-bold ${
            simulatedNetProfit >= 0 ? 'text-emerald-800 dark:text-emerald-300' : 'text-rose-800 dark:text-rose-300'
          }`}>
            {profitDelta >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>Delta vs Baseline: {profitDelta >= 0 ? `+${formatIDR(profitDelta)}` : formatIDR(profitDelta)}</span>
          </div>
        </div>

        {/* Card 3: NPM */}
        <div className="p-5 rounded-3xl bg-slate-50 dark:bg-[#1E1F22] border border-slate-200 dark:border-[#3F4147] flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-[#B5BAC1]">
            Net Profit Margin (NPM)
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums my-2 tracking-tight">
            {formatNumber(simulatedNPM, 1)}%
          </div>
          <span
            className={`text-xs font-bold ${
              simulatedNPM >= 10
                ? 'text-emerald-700 dark:text-emerald-400'
                : simulatedNPM >= 0
                ? 'text-amber-700 dark:text-amber-400'
                : 'text-rose-700 dark:text-rose-400'
            }`}
          >
            {simulatedNPM >= 10 ? 'Margin Sangat Sehat' : simulatedNPM >= 0 ? 'Margin Menipis' : 'Posisi Rugi'}
          </span>
        </div>

        {/* Card 4: Break Even Point */}
        <div className="p-5 rounded-3xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-800 dark:text-indigo-300">
            Titik Impas (BEP Sales)
          </span>
          <div className="text-2xl font-black text-indigo-950 dark:text-indigo-200 tabular-nums my-2 tracking-tight">
            {formatIDR(breakEvenRevenue)}
          </div>
          <span className="text-xs text-slate-500 dark:text-[#B5BAC1]">
            Minimal omzet agar bisnis tidak merugi.
          </span>
        </div>
      </div>
    </div>
  );
};
