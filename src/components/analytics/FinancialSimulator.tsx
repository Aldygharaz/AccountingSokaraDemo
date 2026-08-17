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
  BookmarkPlus,
  Layers,
  Scale,
  Calendar,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { AppState } from '../../lib/storage';
import {
  formatIDR,
  formatNumber,
  generateIncomeStatement,
  generateBalanceSheet,
  calculateRollingCashFlowForecast,
  RollingCashFlowForecastResult,
} from '../../lib/accountingEngine';
import { soundFx } from '../../lib/soundFx';
import { useStore } from '../../lib/storage';
import { Tooltip } from '../common/Tooltip';

interface FinancialSimulatorProps {}

interface SavedScenario {
  id: string;
  name: string;
  salesGrowth: number;
  cogsInflation: number;
  opexReduction: number;
  simulatedSales: number;
  simulatedGrossProfit: number;
  simulatedNetProfit: number;
  simulatedNPM: number;
  breakEvenRevenue: number;
  endingCash90Days: number;
}

export const FinancialSimulator: React.FC<FinancialSimulatorProps> = ({}) => {
  const accounts = useStore(s => s.accounts);
  const journalEntries = useStore(s => s.journalEntries);
  const invoices = useStore(s => s.invoices);
  const purchaseBills = useStore(s => s.purchaseBills);

  const baseIncome = generateIncomeStatement(accounts, journalEntries);

  // Simulation Sliders
  const [salesGrowth, setSalesGrowth] = useState<number>(15); // +15%
  const [cogsInflation, setCogsInflation] = useState<number>(5); // +5%
  const [opexReduction, setOpexReduction] = useState<number>(-10); // -10% efficiency

  // Active view tab inside simulator: 'projections' | 'comparison'
  const [activeSubView, setActiveSubView] = useState<'projections' | 'comparison'>('projections');

  // Saved scenarios for side-by-side comparison
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([
    {
      id: 'sc-baseline',
      name: 'Baseline Aktual (0% Delta)',
      salesGrowth: 0,
      cogsInflation: 0,
      opexReduction: 0,
      simulatedSales: baseIncome.totalRevenue,
      simulatedGrossProfit: baseIncome.grossProfit,
      simulatedNetProfit: baseIncome.netIncome,
      simulatedNPM: baseIncome.totalRevenue > 0 ? (baseIncome.netIncome / baseIncome.totalRevenue) * 100 : 0,
      breakEvenRevenue: baseIncome.totalRevenue > 0 && baseIncome.grossProfit > 0 ? (baseIncome.totalOperatingExpenses / (baseIncome.grossProfit / baseIncome.totalRevenue)) : 0,
      endingCash90Days: 0, // Computed dynamically
    },
    {
      id: 'sc-moderate',
      name: 'Target Moderat (+15% Sales, -10% OpEx)',
      salesGrowth: 15,
      cogsInflation: 5,
      opexReduction: -10,
      simulatedSales: baseIncome.totalRevenue * 1.15,
      simulatedGrossProfit: (baseIncome.totalRevenue * 1.15) - (baseIncome.totalCogs * 1.05),
      simulatedNetProfit: ((baseIncome.totalRevenue * 1.15) - (baseIncome.totalCogs * 1.05)) - (baseIncome.totalOperatingExpenses * 0.9),
      simulatedNPM: baseIncome.totalRevenue > 0 ? ((((baseIncome.totalRevenue * 1.15) - (baseIncome.totalCogs * 1.05)) - (baseIncome.totalOperatingExpenses * 0.9)) / (baseIncome.totalRevenue * 1.15)) * 100 : 0,
      breakEvenRevenue: baseIncome.totalRevenue > 0 ? (baseIncome.totalOperatingExpenses * 0.9) / (((baseIncome.totalRevenue * 1.15) - (baseIncome.totalCogs * 1.05)) / (baseIncome.totalRevenue * 1.15)) : 0,
      endingCash90Days: 0,
    },
  ]);

  // Preset scenarios
  const handleApplyPreset = (preset: 'aggressive' | 'moderate' | 'crisis' | 'reset') => {
    soundFx.playClick();
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

  // Profitability calculations
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

  // 90-Day Rolling Cash Flow Forecast Engine
  const cashForecast: RollingCashFlowForecastResult = React.useMemo(() => {
    return calculateRollingCashFlowForecast(
      accounts,
      journalEntries,
      invoices,
      purchaseBills,
      {
        forecastDays: 90,
        salesGrowthPct: salesGrowth,
        cogsInflationPct: cogsInflation,
        opexReductionPct: opexReduction,
        safetyThreshold: 10000000,
      }
    );
  }, [accounts, journalEntries, invoices, purchaseBills, salesGrowth, cogsInflation, opexReduction]);

  // Save current active slider state as a new comparison scenario
  const handleSaveCurrentScenario = () => {
    soundFx.playChaChing();
    const newScenario: SavedScenario = {
      id: `sc-${Date.now()}`,
      name: `Skenario ${savedScenarios.length + 1} (Sales ${salesGrowth > 0 ? '+' : ''}${salesGrowth}%, OpEx ${opexReduction}%)`,
      salesGrowth,
      cogsInflation,
      opexReduction,
      simulatedSales,
      simulatedGrossProfit,
      simulatedNetProfit,
      simulatedNPM,
      breakEvenRevenue,
      endingCash90Days: cashForecast.dataPoints[cashForecast.dataPoints.length - 1]?.endingCash || 0,
    };
    setSavedScenarios((prev) => [...prev, newScenario]);
    setActiveSubView('comparison');
  };

  const handleDeleteScenario = (id: string) => {
    soundFx.playClick();
    setSavedScenarios((prev) => prev.filter((s) => s.id !== id));
  };

  // Chart SVG calculations
  const chartPoints = cashForecast.dataPoints;
  const maxCash = Math.max(...chartPoints.map((p) => p.endingCash), cashForecast.safetyThreshold * 1.5, 1000000);
  const minCash = Math.min(...chartPoints.map((p) => p.endingCash), 0);
  const range = maxCash - minCash || 1;
  const svgWidth = 800;
  const svgHeight = 220;
  const padding = 30;

  const getSvgX = (index: number) => padding + (index / (chartPoints.length - 1 || 1)) * (svgWidth - padding * 2);
  const getSvgY = (val: number) => svgHeight - padding - ((val - minCash) / range) * (svgHeight - padding * 2);

  const polylinePoints = chartPoints
    .map((p, idx) => `${getSvgX(idx)},${getSvgY(p.endingCash)}`)
    .join(' ');

  const areaPoints = `${getSvgX(0)},${svgHeight - padding} ${polylinePoints} ${getSvgX(chartPoints.length - 1)},${svgHeight - padding}`;
  const safetyY = getSvgY(cashForecast.safetyThreshold);

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
                Simulasi Finansial & Proyeksi Kas 90 Hari (What-If Engine)
              </h2>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                Live Simulator
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#B5BAC1] mt-0.5">
              Uji ketahanan margin laba, skenario pertumbuhan omzet, inflasi HPP, dan proyeksi arus kas rolling 90 hari.
            </p>
          </div>
        </div>

        {/* Action buttons & View Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-[#1E1F22] p-1 rounded-xl border border-slate-200 dark:border-[#3F4147]">
            <button
              onClick={() => setActiveSubView('projections')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                activeSubView === 'projections'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-[#DBDEE1] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Simulator & Kas 90 Hari
            </button>
            <button
              onClick={() => setActiveSubView('comparison')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                activeSubView === 'comparison'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-[#DBDEE1] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Komparasi Skenario ({savedScenarios.length})</span>
            </button>
          </div>

          <button
            onClick={handleSaveCurrentScenario}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-900 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-black transition-all hover:scale-[1.02] active:scale-[0.98]"
            title="Simpan parameter slider saat ini ke tabel perbandingan berdampingan"
          >
            <BookmarkPlus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Simpan Skenario</span>
          </button>
        </div>
      </div>

      {activeSubView === 'projections' ? (
        <>
          {/* Scenario Presets Quick Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1E1F22] border border-slate-200/80 dark:border-[#3F4147]">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-blue-500" />
              <span>Pilihan Skenario:</span>
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleApplyPreset('aggressive')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-black transition-all"
              >
                <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Ekspansi Agresif (+35% / -15%)</span>
              </button>

              <button
                onClick={() => handleApplyPreset('moderate')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-black transition-all"
              >
                <Target className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Baseline Target (+15% / -10%)</span>
              </button>

              <button
                onClick={() => handleApplyPreset('crisis')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-900 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-black transition-all"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>Stress Test Krisis (-20% / +15%)</span>
              </button>

              <button
                onClick={() => handleApplyPreset('reset')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-[#383A40] hover:bg-slate-300 text-slate-700 dark:text-[#DBDEE1] text-xs font-black transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset 0%</span>
              </button>
            </div>
          </div>

          {/* Interactive Sensitivity Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Slider 1: Sales Growth */}
            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-[#1E1F22] border border-slate-200/80 dark:border-[#3F4147] space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                  Pertumbuhan Omzet (Sales)
                </span>
                <span
                  className={`font-mono text-xs font-black px-2.5 py-0.5 rounded-full border ${
                    salesGrowth > 0
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
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
                step="5"
                value={salesGrowth}
                onChange={(e) => setSalesGrowth(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 dark:bg-[#383A40] rounded-lg"
              />

              <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-[#80848E]">
                <span>-50%</span>
                <span>0%</span>
                <span>+100%</span>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-[#3F4147] flex justify-between text-xs">
                <span className="text-slate-500 dark:text-[#B5BAC1]">Proyeksi Omzet:</span>
                <strong className="text-slate-900 dark:text-white tabular-nums font-mono">
                  {formatIDR(simulatedSales)}
                </strong>
              </div>
            </div>

            {/* Slider 2: COGS Inflation */}
            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-[#1E1F22] border border-slate-200/80 dark:border-[#3F4147] space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                  Perubahan HPP / Harga Beli
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
                step="5"
                value={cogsInflation}
                onChange={(e) => setCogsInflation(Number(e.target.value))}
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
                step="5"
                value={opexReduction}
                onChange={(e) => setOpexReduction(Number(e.target.value))}
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

          {/* ============================================================ */}
          {/* GOD-TIER FITUR 3: 90-DAY ROLLING CASH FLOW FORECAST AREA CHART */}
          {/* ============================================================ */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-2xl space-y-6 border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    <Calendar className="w-4 h-4" />
                  </span>
                  <h3 className="text-base font-black tracking-tight text-white">
                    Proyeksi Arus Kas Rolling 90 Hari (Liquidity & Runway Curve)
                  </h3>
                  <Tooltip
                    title="Kalkulasi Runway Kas 90 Hari"
                    content="Menggabungkan saldo kas riil saat ini, jadwal penagihan piutang (AR due dates), jadwal pelunasan hutang pemasok (AP due dates), serta burn rate harian yang disesuaikan dengan slider sensitivitas."
                    iconOnly
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Mendeteksi titik kritis likuiditas kas sebelum terjadi defisit arus kas.
                </p>
              </div>

              {/* Badges Summary */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Saldo Kas Awal</span>
                  <span className="text-sm font-black tabular-nums text-white font-mono">
                    {formatIDR(cashForecast.currentCashBalance)}
                  </span>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Titik Terendah Kas</span>
                  <span className="text-sm font-black tabular-nums text-amber-400 font-mono">
                    {formatIDR(cashForecast.lowestCashPoint.amount)}
                  </span>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Perkiraan Runway</span>
                  <span className="text-sm font-black tabular-nums text-emerald-400">
                    {cashForecast.runwayDays >= 90 ? '> 90 Hari (Aman)' : `${cashForecast.runwayDays} Hari`}
                  </span>
                </div>
              </div>
            </div>

            {/* SVG Area Chart */}
            <div className="relative w-full overflow-hidden bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-48 sm:h-56">
                <defs>
                  <linearGradient id="cashGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Safety Buffer Horizontal Line */}
                <line
                  x1={padding}
                  y1={safetyY}
                  x2={svgWidth - padding}
                  y2={safetyY}
                  stroke="#F59E0B"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.7"
                />
                <text
                  x={svgWidth - padding}
                  y={safetyY - 6}
                  fill="#F59E0B"
                  fontSize="10"
                  textAnchor="end"
                  fontWeight="bold"
                >
                  Batas Aman Kas: {formatIDR(cashForecast.safetyThreshold)}
                </text>

                {/* Shaded Area */}
                <polygon points={areaPoints} fill="url(#cashGradient)" />

                {/* Trend Polyline */}
                <polyline
                  points={polylinePoints}
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points and Lowest Point Pin */}
                {chartPoints.map((pt, idx) => {
                  const x = getSvgX(idx);
                  const y = getSvgY(pt.endingCash);

                  if (pt.isLowestPoint) {
                    return (
                      <g key={idx}>
                        <circle cx={x} cy={y} r="6" fill="#EF4444" className="animate-ping opacity-75" />
                        <circle cx={x} cy={y} r="5" fill="#EF4444" stroke="#ffffff" strokeWidth="2" />
                        <text
                          x={x}
                          y={y - 12}
                          fill="#EF4444"
                          fontSize="10"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          Titik Kritis ({pt.label})
                        </text>
                      </g>
                    );
                  }

                  return (
                    <circle
                      key={idx}
                      cx={x}
                      cy={y}
                      r="3"
                      fill="#60A5FA"
                      opacity={idx % 4 === 0 ? '1' : '0.4'}
                    />
                  );
                })}
              </svg>

              <div className="flex justify-between text-[11px] font-mono text-slate-400 px-2 pt-2 border-t border-slate-800">
                <span>Hari Ini ({chartPoints[0]?.date})</span>
                <span>H+30</span>
                <span>H+60</span>
                <span>H+90 ({chartPoints[chartPoints.length - 1]?.date})</span>
              </div>
            </div>

            {/* 90-Day Summary Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Proyeksi Kas Masuk (90 Hari)</span>
                <p className="text-lg font-black text-emerald-400 font-mono mt-0.5 tabular-nums">
                  +{formatIDR(cashForecast.summary.totalProjectedInflows)}
                </p>
                <span className="text-[10px] text-slate-400">Piutang Tertagih + Penjualan Tunai</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Proyeksi Kas Keluar (90 Hari)</span>
                <p className="text-lg font-black text-rose-400 font-mono mt-0.5 tabular-nums">
                  -{formatIDR(cashForecast.summary.totalProjectedOutflows)}
                </p>
                <span className="text-[10px] text-slate-400">Hutang Jatuh Tempo + Beban OpEx</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[10px] uppercase font-bold text-slate-400">Net Perubahan Kas Bersih</span>
                <p className={`text-lg font-black font-mono mt-0.5 tabular-nums ${
                  cashForecast.summary.netCashChange90Days >= 0 ? 'text-blue-400' : 'text-amber-400'
                }`}>
                  {cashForecast.summary.netCashChange90Days >= 0 ? '+' : ''}{formatIDR(cashForecast.summary.netCashChange90Days)}
                </p>
                <span className="text-[10px] text-slate-400">Saldo Akhir H+90: {formatIDR(chartPoints[chartPoints.length - 1]?.endingCash || 0)}</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* ============================================================ */
        /* GOD-TIER FITUR 6: SIDE-BY-SIDE SCENARIO COMPARISON MATRIX   */
        /* ============================================================ */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Matriks Perbandingan Skenario Keuangan ("Side-by-Side")
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#B5BAC1]">
                Bandingkan berbagai skenario pertumbuhan, inflasi biaya, dan dampaknya terhadap profitabilitas & ketahanan kas.
              </p>
            </div>
            <button
              onClick={handleSaveCurrentScenario}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition-all"
            >
              + Tambah Skenario Saat Ini
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-[#3F4147]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-[#1E1F22] border-b border-slate-200 dark:border-[#3F4147] text-[11px] font-black uppercase text-slate-600 dark:text-[#B5BAC1]">
                  <th className="py-3.5 px-4">Parameter / Metrik Finansial</th>
                  {savedScenarios.map((sc) => (
                    <th key={sc.id} className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <span>{sc.name}</span>
                        {sc.id !== 'sc-baseline' && (
                          <button
                            onClick={() => handleDeleteScenario(sc.id)}
                            className="p-0.5 rounded text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/50"
                            title="Hapus skenario"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {/* Sliders Input summary */}
                <tr className="bg-slate-50/50 dark:bg-[#232428]">
                  <td className="py-2.5 px-4 font-sans font-bold text-slate-700 dark:text-slate-300">
                    Asumsi Sales / HPP / OpEx
                  </td>
                  {savedScenarios.map((sc) => (
                    <td key={sc.id} className="py-2.5 px-4 text-right text-[11px] text-slate-600 dark:text-[#DBDEE1]">
                      {sc.salesGrowth > 0 ? `+${sc.salesGrowth}%` : `${sc.salesGrowth}%`} / {sc.cogsInflation > 0 ? `+${sc.cogsInflation}%` : `${sc.cogsInflation}%`} / {sc.opexReduction}%
                    </td>
                  ))}
                </tr>

                {/* Revenue */}
                <tr>
                  <td className="py-3 px-4 font-sans font-bold text-slate-900 dark:text-white">
                    Total Proyeksi Pendapatan
                  </td>
                  {savedScenarios.map((sc) => (
                    <td key={sc.id} className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                      {formatIDR(sc.simulatedSales)}
                    </td>
                  ))}
                </tr>

                {/* Gross Profit */}
                <tr>
                  <td className="py-3 px-4 font-sans font-bold text-slate-700 dark:text-slate-300">
                    Laba Kotor (Gross Profit)
                  </td>
                  {savedScenarios.map((sc) => (
                    <td key={sc.id} className="py-3 px-4 text-right text-blue-600 dark:text-blue-400 font-bold">
                      {formatIDR(sc.simulatedGrossProfit)}
                    </td>
                  ))}
                </tr>

                {/* Net Profit */}
                <tr className="bg-blue-50/30 dark:bg-blue-950/20 font-black">
                  <td className="py-3 px-4 font-sans text-slate-900 dark:text-white">
                    Laba Bersih (Net Income)
                  </td>
                  {savedScenarios.map((sc) => (
                    <td
                      key={sc.id}
                      className={`py-3 px-4 text-right text-sm ${
                        sc.simulatedNetProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {formatIDR(sc.simulatedNetProfit)}
                    </td>
                  ))}
                </tr>

                {/* Net Profit Margin */}
                <tr>
                  <td className="py-3 px-4 font-sans font-bold text-slate-700 dark:text-slate-300">
                    Net Profit Margin (NPM)
                  </td>
                  {savedScenarios.map((sc) => (
                    <td key={sc.id} className="py-3 px-4 text-right font-bold">
                      {formatNumber(sc.simulatedNPM, 1)}%
                    </td>
                  ))}
                </tr>

                {/* Break-even point */}
                <tr>
                  <td className="py-3 px-4 font-sans font-bold text-slate-700 dark:text-slate-300">
                    Titik Impas (BEP Sales)
                  </td>
                  {savedScenarios.map((sc) => (
                    <td key={sc.id} className="py-3 px-4 text-right text-indigo-600 dark:text-indigo-400">
                      {formatIDR(sc.breakEvenRevenue)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
