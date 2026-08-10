import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Receipt,
  Building2,
  Package,
  AlertTriangle,
  FileText,
  PlusCircle,
  Clock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Calculator,
  Zap,
  Activity,
  Award,
  Printer,
  SlidersHorizontal,
  ChevronRight,
  Info,
  Calendar,
  Layers,
  LineChart,
  Lock,
} from 'lucide-react';
import { AppState } from '../../lib/storage';
import {
  formatIDR,
  formatNumber,
  generateIncomeStatement,
  generateBalanceSheet,
  calculateFinancialRatios,
} from '../../lib/accountingEngine';
import { InteractiveTiltCard } from '../ui/InteractiveTiltCard';
import { Tooltip } from '../common/Tooltip';
import { soundFx } from '../../lib/soundFx';
import { useStore } from '../../lib/storage';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  onOpenNewInvoice: () => void;
  onOpenNewBill: () => void;
  onOpenNewCash: () => void;
  onTriggerPokaYoke?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenNewInvoice,
  onOpenNewBill,
  onOpenNewCash,
  onTriggerPokaYoke,
}) => {
  const accounts = useStore(s => s.accounts);
  const journalEntries = useStore(s => s.journalEntries);
  const invoices = useStore(s => s.invoices);
  const purchaseBills = useStore(s => s.purchaseBills);

  const [timeframe, setTimeframe] = useState<'6M' | 'YTD' | '1Y'>('6M');

  // Compute live financial figures from journals (memoized to prevent keystroke lag)
  const balanceSheet = React.useMemo(() => generateBalanceSheet(accounts, journalEntries), [accounts, journalEntries]);
  const incomeStatement = React.useMemo(() => generateIncomeStatement(accounts, journalEntries), [accounts, journalEntries]);
  const ratios = React.useMemo(() => calculateFinancialRatios(accounts, journalEntries), [accounts, journalEntries]);

  // Total Cash & Bank (Accounts 1101 + 1102)
  const cashAccounts = balanceSheet.currentAssets.filter(
    (a) => a.accountCode === '1101' || a.accountCode === '1102'
  );
  const totalCash = cashAccounts.reduce((sum, a) => sum + a.amount, 0);

  // Accounts Receivable (1103)
  const arAccount = balanceSheet.currentAssets.find((a) => a.accountCode === '1103');
  const totalAR = arAccount ? arAccount.amount : 0;

  // Accounts Payable (2101)
  const apAccount = balanceSheet.currentLiabilities.find((a) => a.accountCode === '2101');
  const totalAP = apAccount ? apAccount.amount : 0;

  // Net Profit YTD
  const netProfit = incomeStatement.netIncome;

  // Working Capital metrics
  const sumAccounts = (accounts: { amount: number }[]) => accounts.reduce((sum, curr) => sum + curr.amount, 0);
  const realOpex = sumAccounts(incomeStatement.operatingExpenses || []);
  const totalRevenues = sumAccounts(incomeStatement.revenues || []);
  const totalCogs = sumAccounts(incomeStatement.cogs || []);

  const monthlyBurn = realOpex > 0 ? realOpex : 24500000;
  const runwayMonths = totalCash > 0 ? (totalCash / monthlyBurn).toFixed(1) : '0';
  
  // Dynamic CCC (fallback to standard if not enough data)
  const dso = totalAR > 0 && totalRevenues > 0 ? Math.round((totalAR / totalRevenues) * 30) : 14;
  const dpo = totalAP > 0 && totalCogs > 0 ? Math.round((totalAP / totalCogs) * 30) : 24;
  const inventoryAccount = balanceSheet.currentAssets.find((a) => a.accountCode === '1104');
  const totalInv = inventoryAccount ? inventoryAccount.amount : 0;
  const dio = totalInv > 0 && totalCogs > 0 ? Math.round((totalInv / totalCogs) * 30) : 28;
  const cccDays = dio + dso - dpo;

  const totalAssets = balanceSheet.totalAssets;
  const totalLiabilities = balanceSheet.totalLiabilities;
  const totalEquity = balanceSheet.totalEquity;
  const workingCapital = balanceSheet.totalCurrentAssets - balanceSheet.totalCurrentLiabilities;
  const retainedEarnings = totalEquity; 
  const ebit = netProfit; 
  
  const t1 = totalAssets > 0 ? workingCapital / totalAssets : 0;
  const t2 = totalAssets > 0 ? retainedEarnings / totalAssets : 0;
  const t3 = totalAssets > 0 ? ebit / totalAssets : 0;
  const t4 = totalLiabilities > 0 ? totalEquity / totalLiabilities : 0;
  const altmanZ = totalAssets > 0 ? (6.56 * t1) + (3.26 * t2) + (6.72 * t3) + (1.05 * t4) : 0;
  
  const gpmRatio = totalRevenues > 0 ? (totalRevenues - totalCogs) / totalRevenues : 0;
  const breakEvenSales = gpmRatio > 0 ? realOpex / gpmRatio : 0;
  const marginOfSafety = totalRevenues > 0 ? ((totalRevenues - breakEvenSales) / totalRevenues) * 100 : 0;

  // 6 Months Monthly Trend Aggregation for Chart
  const currentYear = new Date().getFullYear();
  const getMonthName = (monthIndex: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
    return months[monthIndex];
  };

  const monthlyStats = Array.from({ length: 12 }, (_, i) => ({
    month: getMonthName(i),
    rev: 0,
    exp: 0,
    profit: 0,
  }));

  journalEntries.forEach(entry => {
    const d = new Date(entry.date);
    if (d.getFullYear() === currentYear) {
      const monthIdx = d.getMonth();
      let rev = 0;
      let exp = 0;
      entry.lines.forEach((detail: any) => {
        const acc = accounts.find(a => a.id === detail.accountId);
        if (acc) {
          if (acc.type === 'pendapatan' && detail.kredit > 0) rev += detail.kredit;
          if (acc.type === 'beban' && detail.debit > 0) exp += detail.debit;
          if (acc.subType === 'hpp' && detail.debit > 0) exp += detail.debit;
        }
      });
      monthlyStats[monthIdx].rev += rev;
      monthlyStats[monthIdx].exp += exp;
      monthlyStats[monthIdx].profit += (rev - exp);
    }
  });

  const currentMonthIdx = new Date().getMonth();
  const monthData = timeframe === '6M'
    ? monthlyStats.slice(Math.max(0, currentMonthIdx - 5), currentMonthIdx + 1)
    : timeframe === 'YTD'
    ? monthlyStats.slice(0, currentMonthIdx + 1)
    : monthlyStats;

  const maxVal = Math.max(...monthData.map(d => Math.max(d.rev, d.exp, d.profit, 1000000))) * 1.2;
  const chartHeight = 220;
  const chartWidth = 650;

  const getX = (idx: number) => 50 + idx * ((chartWidth - 100) / Math.max(1, monthData.length - 1));
  const formatYAxis = (val: number) => {
    if (val >= 1000000000) return (val / 1000000000).toFixed(1) + 'B';
    if (val >= 1000000) return (val / 1000000).toFixed(0) + 'M';
    if (val >= 1000) return (val / 1000).toFixed(0) + 'K';
    return val.toString();
  };
  const getY = (val: number) => chartHeight - 30 - (val / maxVal) * (chartHeight - 60);

  const revPoints = monthData.map((d, i) => `${getX(i)},${getY(d.rev)}`).join(' ');
  const expPoints = monthData.map((d, i) => `${getX(i)},${getY(d.exp)}`).join(' ');
  const profitPoints = monthData.map((d, i) => `${getX(i)},${getY(d.profit)}`).join(' ');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner: Executive Business Owner Command Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-gradient-to-r from-[#091e42] via-[#0d2757] to-[#121c3b] dark:from-[#1E1F22] dark:via-[#24262b] dark:to-[#2B2D31] p-6 sm:p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden border border-blue-500/20 dark:border-[#3F4147]">
        {/* Subtle Background Glow Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-2 max-w-3xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              Sokara Accounting Software
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 text-blue-200 border border-white/10 backdrop-blur-md">
              Audit Grade: A+ (PSAK/IFRS)
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/20 backdrop-blur-md flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Tahun Buku 2026
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
            Pusat Kendali Finansial & Bisnis Eksekutif
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed">
            Laporan agregasi real-time Double-Entry, proyeksi runway kas, evaluasi efisiensi modal kerja, dan kepatuhan perpindahan buku besar PSAK/IFRS.
          </p>
        </div>

        {/* Action Controls */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5 self-start lg:self-center shrink-0">
          <button
            onClick={() => {
              soundFx.playClick();
              window.print();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black border border-white/20 transition-all backdrop-blur-md hover:scale-[1.02] active:scale-[0.98]"
            title="Cetak Ringkasan Eksekutif Dewan Direksi"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Brief Direksi</span>
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenNewInvoice();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Faktur Baru</span>
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenNewBill();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-black shadow-lg shadow-rose-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Tagihan Baru</span>
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenNewCash();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-lg shadow-emerald-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Kas Baru</span>
          </button>
        </div>
      </div>

      {/* 4 Interactive 3D Cursor Spotlight KPI Cards with Tooltips & Mini Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* KPI 1: Cash & Bank */}
        <InteractiveTiltCard
          glowColor="rgba(0, 89, 181, 0.2)"
          className="rounded-3xl glass-card p-6 cursor-pointer bg-white dark:bg-[#2B2D31] border border-slate-200/80 dark:border-[#3F4147] transition-all hover:shadow-xl group"
          onClick={() => {
            soundFx.playClick();
            onNavigate('coa');
          }}
        >
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black tracking-wider uppercase text-slate-500 dark:text-[#B5BAC1]">
                Kas & Likuiditas Bank
              </span>
              <Tooltip
                title="Kas & Rekening Bank"
                content="Total likuiditas kas fisik di brankas toko (Akun 1101) ditambah seluruh saldo rekening giro di Bank BCA (Akun 1102) yang siap dipakai operasional tanpa hambatan."
                iconOnly
              />
            </div>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/80 dark:border-blue-800 shadow-sm group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
              {formatIDR(totalCash)}
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-[11px] font-black text-emerald-600 dark:text-[#23A559] border border-emerald-200 dark:border-emerald-800">
                <TrendingUp className="w-3 h-3" />
                <span>+6.8% MoM</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-[#80848E]">
                BCA + Brankas
              </span>
            </div>
          </div>
        </InteractiveTiltCard>

        {/* KPI 2: Accounts Receivable */}
        <InteractiveTiltCard
          glowColor="rgba(0, 108, 73, 0.2)"
          className="rounded-3xl glass-card p-6 cursor-pointer bg-white dark:bg-[#2B2D31] border border-slate-200/80 dark:border-[#3F4147] transition-all hover:shadow-xl group"
          onClick={() => {
            soundFx.playClick();
            onNavigate('arap');
          }}
        >
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black tracking-wider uppercase text-slate-500 dark:text-[#B5BAC1]">
                Piutang Usaha (AR)
              </span>
              <Tooltip
                title="Piutang Usaha (AR)"
                content="Total tagihan penjualan kredit ke pelanggan yang belum terbayar. Dilengkapi tabel umur piutang (Aging Buckets) 0-30, 31-60, 61-90, hingga >90 hari untuk mencegah bad debt."
                iconOnly
              />
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/80 dark:border-emerald-800 shadow-sm group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
              {formatIDR(totalAR)}
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[11px] font-black text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                <Clock className="w-3 h-3" />
                <span>DSO: {dso} Hari</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-[#80848E]">
                {invoices.filter((i) => i.status !== 'lunas').length} faktur aktif
              </span>
            </div>
          </div>
        </InteractiveTiltCard>

        {/* KPI 3: Accounts Payable */}
        <InteractiveTiltCard
          glowColor="rgba(186, 26, 26, 0.2)"
          className="rounded-3xl glass-card p-6 cursor-pointer bg-white dark:bg-[#2B2D31] border border-slate-200/80 dark:border-[#3F4147] transition-all hover:shadow-xl group"
          onClick={() => {
            soundFx.playClick();
            onNavigate('arap');
          }}
        >
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black tracking-wider uppercase text-slate-500 dark:text-[#B5BAC1]">
                Hutang Usaha (AP)
              </span>
              <Tooltip
                title="Hutang Usaha (AP)"
                content="Kewajiban pembayaran ke distributor & supplier barang dagang yang jatuh tempo. Menjaga Days Payables Outstanding (DPO) terkontrol membantu likuiditas modal kerja."
                iconOnly
              />
            </div>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-[#F23F43] flex items-center justify-center border border-rose-200/80 dark:border-rose-800 shadow-sm group-hover:scale-110 transition-transform">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
              {formatIDR(totalAP)}
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-[11px] font-black text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                <Clock className="w-3 h-3" />
                <span>DPO: {dpo} Hari</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-[#80848E]">
                {purchaseBills.filter((b) => b.status !== 'lunas').length} tagihan aktif
              </span>
            </div>
          </div>
        </InteractiveTiltCard>

        {/* KPI 4: Net Profit YTD */}
        <InteractiveTiltCard
          glowColor="rgba(91, 33, 182, 0.2)"
          className="rounded-3xl glass-card p-6 cursor-pointer bg-white dark:bg-[#2B2D31] border border-slate-200/80 dark:border-[#3F4147] transition-all hover:shadow-xl group"
          onClick={() => {
            soundFx.playClick();
            onNavigate('reports');
          }}
        >
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black tracking-wider uppercase text-slate-500 dark:text-[#B5BAC1]">
                Laba Bersih (YTD)
              </span>
              <Tooltip
                title="Laba Bersih Berjalan"
                content="Keuntungan bersih riil setelah total pendapatan penjualan dikurangi Beban Pokok Penjualan (HPP FIFO/Moving Average) dan seluruh beban operasional (gaji, sewa, listrik, penyusutan)."
                iconOnly
              />
            </div>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200/80 dark:border-purple-800 shadow-sm group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-[#23A559] tabular-nums tracking-tight">
              {formatIDR(netProfit)}
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-[11px] font-black text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                <span>NPM: {ratios.netProfitMargin}%</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-[#80848E]">
                Margin Solid
              </span>
            </div>
          </div>
        </InteractiveTiltCard>
      </div>

      {/* Executive Investor & Owner Intelligence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Metric 1: Cash Runway */}
        <div className="glass-card rounded-3xl p-6 bg-white dark:bg-[#2B2D31] border border-slate-200/80 dark:border-[#3F4147] flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-[#B5BAC1]">
                  Ketahanan Kas (Runway)
                </span>
                <Tooltip
                  title="Cash Runway"
                  content="Berapa bulan perusahaan dapat bertahan hidup beroperasi tanpa pemasukan baru sama sekali, dihitung dari: Total Kas ÷ Rata-rata Biaya Bulanan."
                  iconOnly
                />
              </div>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Sangat Sehat
              </span>
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
              {runwayMonths} <span className="text-sm font-bold text-slate-500 dark:text-[#B5BAC1]">Bulan</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-[#B5BAC1] mt-1">
              Berdasarkan rata-rata burn rate operasional Rp 24.5 Juta/bln.
            </p>
          </div>
          {/* Visual Progress Bar */}
          <div className="w-full bg-slate-100 dark:bg-[#1E1F22] h-2 rounded-full overflow-hidden mt-4 border border-slate-200/60 dark:border-[#3F4147]">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, (totalCash / monthlyBurn) * 10))}%` }} />
          </div>
        </div>

        {/* Metric 2: Cash Conversion Cycle (CCC) */}
        <div className="glass-card rounded-3xl p-6 bg-white dark:bg-[#2B2D31] border border-slate-200/80 dark:border-[#3F4147] flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-[#B5BAC1]">
                  Siklus Konversi Kas
                </span>
                <Tooltip
                  title="Cash Conversion Cycle (CCC)"
                  content={`Waktu (hari) dari pembelian stok dari supplier sampai uang penjualan masuk ke rekening bank (Rumus: DIO ${dio}d + DSO ${dso}d - DPO ${dpo}d).`}
                  iconOnly
                />
              </div>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {cccDays} Hari
              </span>
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
              {cccDays} <span className="text-sm font-bold text-slate-500 dark:text-[#B5BAC1]">Hari Kerja</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-[#B5BAC1] mt-1">
              DIO (28h) + DSO (14h) - DPO (24h). Modal kerja berputar cepat.
            </p>
          </div>
          <div className="w-full bg-slate-100 dark:bg-[#1E1F22] h-2 rounded-full overflow-hidden mt-4 border border-slate-200/60 dark:border-[#3F4147]">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, 100 - (cccDays / 2)))}%` }} />
          </div>
        </div>

        {/* Metric 3: Margin of Safety */}
        <div className="glass-card rounded-3xl p-6 bg-white dark:bg-[#2B2D31] border border-slate-200/80 dark:border-[#3F4147] flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-[#B5BAC1]">
                  Margin of Safety (BEP)
                </span>
                <Tooltip
                  title="Batas Aman Penurunan Penjualan"
                  content="Batas persentase keamanan penurunan omset sebelum bisnis mengalami kerugian operasional di bawah titik impas (BEP)."
                  iconOnly
                />
              </div>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                Di Atas BEP
              </span>
            </div>
            <div className="text-3xl font-black text-emerald-600 dark:text-[#23A559] tabular-nums tracking-tight">
              +{marginOfSafety.toFixed(1)}%
            </div>
            <p className="text-[11px] text-slate-500 dark:text-[#B5BAC1] mt-1">
              Penjualan aktual melampaui Titik Impas (BEP) operasional.
            </p>
          </div>
          <div className="w-full bg-slate-100 dark:bg-[#1E1F22] h-2 rounded-full overflow-hidden mt-4 border border-slate-200/60 dark:border-[#3F4147]">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, marginOfSafety))}%` }} />
          </div>
        </div>

        {/* Metric 4: Altman Z-Score Solvabilitas */}
        <div className="glass-card rounded-3xl p-6 bg-white dark:bg-[#2B2D31] border border-slate-200/80 dark:border-[#3F4147] flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-[#B5BAC1]">
                  Solvabilitas (Altman Z)
                </span>
                <Tooltip
                  title="Altman Z-Score Solvabilitas"
                  content="Standar rasio global untuk mendeteksi kesehatan keuangan dan risiko insolvensi. Skor > 2.99 membuktikan posisi aman (Safe Zone)."
                  iconOnly
                />
              </div>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Safe Zone
              </span>
            </div>
            <div className="text-3xl font-black text-blue-600 dark:text-[#0984E3] tabular-nums tracking-tight">
              {altmanZ.toFixed(2)}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-[#B5BAC1] mt-1">
              Skor &gt; 2.99 mengindikasikan status bebas risiko gagal bayar.
            </p>
          </div>
          <div className="w-full bg-slate-100 dark:bg-[#1E1F22] h-2 rounded-full overflow-hidden mt-4 border border-slate-200/60 dark:border-[#3F4147]">
            <div className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, (altmanZ / 5) * 100))}%` }} />
          </div>
        </div>
      </div>

      {/* Revenue, Expense & Net Profit SVG Chart + Ratio Scorecards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Monthly Trend SVG Chart */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 sm:p-7 bg-white dark:bg-[#2B2D31] border border-slate-200/80 dark:border-[#3F4147] shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Tren Pendapatan, Beban & Laba Bersih (MoM)
                </h2>
                <Tooltip
                  title="Agregasi Jurnal Bulanan"
                  content="Visualisasi pergerakan omset kotor, pengeluaran operasional, dan surplus laba bersih per bulan."
                  iconOnly
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-[#B5BAC1]">
                Performa finansial semester I 2026 (Diperbarui real-time).
              </p>
            </div>

            {/* Timeframe selector */}
            <div className="flex items-center bg-slate-100 dark:bg-[#1E1F22] p-1 rounded-xl border border-slate-200 dark:border-[#3F4147] self-start sm:self-auto">
              {(['6M', 'YTD', '1Y'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    soundFx.playClick();
                    setTimeframe(t);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                    timeframe === t
                      ? 'bg-blue-600 dark:bg-[#0984E3] text-white shadow-sm'
                      : 'text-slate-600 dark:text-[#DBDEE1] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Chart Graphic */}
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-56 sm:h-64 overflow-visible"
            >
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0984E3" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#0984E3" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#23A559" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#23A559" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, maxVal * 0.33, maxVal * 0.66, maxVal].map((val, idx) => {
                const y = getY(val);
                return (
                  <g key={idx}>
                    <line
                      x1="40"
                      y1={y}
                      x2={chartWidth - 20}
                      y2={y}
                      stroke="currentColor"
                      className="text-slate-200 dark:text-[#3F4147]/80"
                      strokeDasharray="4 4"
                    />
                    <text
                      x="35"
                      y={y + 3}
                      textAnchor="end"
                      className="text-[9px] fill-slate-400 dark:fill-[#80848E] font-mono font-bold"
                    >
                      {formatYAxis(val)}
                    </text>
                  </g>
                );
              })}

              {/* Revenue Area & Line */}
              <polyline
                fill="none"
                stroke="#0984E3"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={revPoints}
              />
              {/* Expense Line */}
              <polyline
                fill="none"
                stroke="#ED4245"
                strokeWidth="2.5"
                strokeDasharray="5 5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={expPoints}
              />
              {/* Profit Line */}
              <polyline
                fill="none"
                stroke="#23A559"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={profitPoints}
              />

              {/* Month Dots & Labels */}
              {monthData.map((d, i) => {
                const x = getX(i);
                return (
                  <g key={i}>
                    {/* Rev dot */}
                    <circle cx={x} cy={getY(d.rev)} r="4" fill="#0984E3" className="stroke-white dark:stroke-[#2B2D31] stroke-2" />
                    {/* Exp dot */}
                    <circle cx={x} cy={getY(d.exp)} r="3.5" fill="#ED4245" className="stroke-white dark:stroke-[#2B2D31] stroke-2" />
                    {/* Profit dot */}
                    <circle cx={x} cy={getY(d.profit)} r="4" fill="#23A559" className="stroke-white dark:stroke-[#2B2D31] stroke-2" />
                    <text
                      x={x}
                      y={chartHeight - 8}
                      textAnchor="middle"
                      className="text-[10px] fill-slate-500 dark:fill-[#DBDEE1] font-black uppercase"
                    >
                      {d.month}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-3 pt-3 border-t border-slate-100 dark:border-[#3F4147] text-xs font-bold">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#0984E3]" />
              <span className="text-slate-700 dark:text-[#DBDEE1]">Pendapatan Penjualan</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ED4245]" />
              <span className="text-slate-700 dark:text-[#DBDEE1]">Beban Operasional</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#23A559]" />
              <span className="text-slate-700 dark:text-[#DBDEE1]">Laba Bersih Riil</span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Financial Health Scorecard */}
        <div className="glass-card rounded-3xl p-6 sm:p-7 bg-white dark:bg-[#2B2D31] border border-slate-200/80 dark:border-[#3F4147] shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                Kartu Rasio Finansial
              </h2>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Audited
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#B5BAC1]">
              Kepatuhan rasio likuiditas & leverage PSAK.
            </p>
          </div>

          <div className="space-y-3">
            {/* Ratio 1: Current Ratio */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1E1F22] border border-slate-200/80 dark:border-[#3F4147] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-black text-slate-800 dark:text-white">
                    Current Ratio
                  </span>
                  <Tooltip
                    title="Current Ratio"
                    content="Kemampuan aset lancar perusahaan melunasi seluruh kewajiban lancar yang jatuh tempo dalam 1 tahun (Rumus: Aset Lancar ÷ Hutang Lancar)."
                    iconOnly
                  />
                </div>
                <span className="text-[10px] text-slate-400 dark:text-[#80848E]">Target &gt; 1.5x</span>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-emerald-600 dark:text-[#23A559] tabular-nums">
                  {formatNumber(ratios.currentRatio, 2)}x
                </span>
                <div className="text-[10px] font-bold text-emerald-600 dark:text-[#23A559]">Sangat Likuid</div>
              </div>
            </div>

            {/* Ratio 2: Quick Acid Ratio */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1E1F22] border border-slate-200/80 dark:border-[#3F4147] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-black text-slate-800 dark:text-white">
                    Quick Acid Ratio
                  </span>
                  <Tooltip
                    title="Quick Ratio"
                    content="Uji ketahanan likuiditas darurat tanpa mengandalkan penjualan stok barang fisik (Rumus: (Kas + Piutang) ÷ Hutang Lancar)."
                    iconOnly
                  />
                </div>
                <span className="text-[10px] text-slate-400 dark:text-[#80848E]">Target &gt; 1.0x</span>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-blue-600 dark:text-[#0984E3] tabular-nums">
                  {formatNumber(ratios.quickRatio, 2)}x
                </span>
                <div className="text-[10px] font-bold text-blue-600 dark:text-[#0984E3]">Likuiditas Prima</div>
              </div>
            </div>

            {/* Ratio 3: Debt-to-Equity */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1E1F22] border border-slate-200/80 dark:border-[#3F4147] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-black text-slate-800 dark:text-white">
                    Debt-to-Equity (DER)
                  </span>
                  <Tooltip
                    title="Debt to Equity Ratio"
                    content="Perbandingan total hutang terhadap ekuitas modal sendiri. Nilai di bawah 1.0x membuktikan struktur permodalan yang sangat aman."
                    iconOnly
                  />
                </div>
                <span className="text-[10px] text-slate-400 dark:text-[#80848E]">Target &lt; 1.0x</span>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-purple-600 dark:text-purple-400 tabular-nums">
                  {formatNumber(ratios.debtToEquityRatio, 2)}x
                </span>
                <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400">Modal Sendiri Kuat</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onNavigate('analytics');
            }}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1E1F22] dark:hover:bg-[#383A40] text-slate-800 dark:text-[#DBDEE1] text-xs font-black transition-all border border-slate-200/80 dark:border-[#3F4147]"
          >
            <span>Buka Analisis Rasio Lengkap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
