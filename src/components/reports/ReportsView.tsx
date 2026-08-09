import React, { useState } from 'react';
import { ArrowRightLeft, BrainCircuit, 
  FileSpreadsheet,
  Printer,
  Calendar,
  Download,
  Scale,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sliders,
  History,
} from 'lucide-react';
import { AppState } from '../../lib/storage';
import {
  formatIDR,
  generateIncomeStatement,
  generateBalanceSheet,
  generateCashFlowDirect,
} from '../../lib/accountingEngine';
import { FinancialSimulator } from '../analytics/FinancialSimulator';
import { LedgerDrilldownDrawer } from '../ui/LedgerDrilldownDrawer';
import { Account } from '../../types/accounting';
import { Tooltip } from '../common/Tooltip';
import { soundFx } from '../../lib/soundFx';

interface ReportsViewProps {
  state: AppState;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ state }) => {
  const [activeReport, setActiveReport] = useState<'pnl' | 'balance_sheet' | 'cash_flow' | 'simulation'>('pnl');

  // Date filters
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);
  const [asOfDate, setAsOfDate] = useState(lastDay);

  const [companyName, setCompanyName] = useState('Sokara Accounting Software');

  const [selectedDrilldownAccount, setSelectedDrilldownAccount] = useState<Account | null>(null);

  // Dynamic calculations directly from journal lines
  const incomeStatement = React.useMemo(() => generateIncomeStatement(state.accounts, state.journalEntries, startDate, endDate), [state.accounts, state.journalEntries, startDate, endDate]);
  const balanceSheet = React.useMemo(() => generateBalanceSheet(state.accounts, state.journalEntries, asOfDate), [state.accounts, state.journalEntries, asOfDate]);
  const cashFlow = React.useMemo(() => generateCashFlowDirect(state.accounts, state.journalEntries, startDate, endDate), [state.accounts, state.journalEntries, startDate, endDate]);

  const handlePrint = () => {
    soundFx.playClick();
    window.print();
  };

  const handleDrilldownByCode = (accountCode: string) => {
    const acc = state.accounts.find((a) => a.code === accountCode);
    if (acc) {
      soundFx.playClick();
      setSelectedDrilldownAccount(acc);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header with Switcher & Print Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Laporan Keuangan Standar
            </h1>
            <Tooltip
              title="Laporan Keuangan Resmi PSAK"
              content="Paket laporan keuangan standar terdiri dari Laporan Laba Rugi Komprehensif, Laporan Posisi Keuangan (Neraca Scontro), dan Laporan Arus Kas Langsung yang terintegrasi secara otomatis."
              iconOnly
            />
          </div>
          <p className="text-sm text-slate-500 dark:text-[#B5BAC1] mt-1">
            Dihasilkan secara dinamis dari query agregasi baris jurnal umum (Double-Entry).
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs & Date Filters */}
      <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 no-print">
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { id: 'pnl', label: 'Laba Rugi (P&L)', icon: <TrendingUp className="w-3.5 h-3.5" /> },
            { id: 'balance_sheet', label: 'Neraca (Balance Sheet)', icon: <Scale className="w-3.5 h-3.5" /> },
            { id: 'cash_flow', label: 'Arus Kas (Direct)', icon: <ArrowRightLeft className="w-3.5 h-3.5" /> },
            { id: 'simulation', label: 'What-If Simulator', icon: <BrainCircuit className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                soundFx.playClick();
                setActiveReport(tab.id as any);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeReport === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5">{tab.icon && tab.icon}<span>{tab.label}</span></div>
            </button>
          ))}
        </div>

        {/* Date Filter Inputs */}
        {activeReport !== 'simulation' && (
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            {activeReport === 'balance_sheet' ? (
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Per Tanggal:</span>
                <input
                  type="date"
                  value={asOfDate}
                  onChange={(e) => setAsOfDate(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1E1F22] text-xs font-bold"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Periode:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1E1F22] text-xs font-bold"
                />
                <span>s/d</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1E1F22] text-xs font-bold"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* REPORT 1: LABA RUGI (INCOME STATEMENT - F-13) */}
      {activeReport === 'pnl' && (
        <div className="glass-card rounded-3xl p-8 bg-white dark:bg-[#2B2D31] shadow-xl space-y-6">
          {/* Printable Report Header */}
          <div className="text-center pb-6 border-b border-slate-200 dark:border-slate-700">
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight text-center bg-transparent border-none outline-none hover:bg-slate-50 dark:hover:bg-slate-800 rounded px-2 w-full max-w-lg mx-auto"
            />
            <h3 className="text-base font-extrabold text-blue-700 dark:text-blue-400 mt-1">
              LAPORAN LABA RUGI (INCOME STATEMENT)
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              Periode: {startDate} s/d {endDate} (Dalam Rupiah)
            </p>
          </div>

          <div className="space-y-6 text-xs text-slate-800 dark:text-slate-200">
            {/* 1. Pendapatan Usaha */}
            <div>
              <div className="flex justify-between font-black text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="uppercase tracking-wider">1. Pendapatan Penjualan</span>
                <span>Jumlah</span>
              </div>
              <div className="py-2 space-y-1.5">
                {incomeStatement.revenues.map((rev) => (
                  <div
                    key={rev.accountId}
                    onClick={() => handleDrilldownByCode(rev.accountCode)}
                    className="flex justify-between pl-4 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                  >
                    <span>
                      {rev.accountCode} - {rev.accountName}
                    </span>
                    <span className="font-mono tabular-nums font-semibold">{formatIDR(rev.amount)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800 pl-4 bg-slate-50/50 dark:bg-slate-800/40 py-1.5 px-3 rounded-lg">
                <span>Total Pendapatan Bersih:</span>
                <span className="font-mono tabular-nums text-blue-700 dark:text-blue-400 font-black">
                  {formatIDR(incomeStatement.totalRevenue)}
                </span>
              </div>
            </div>

            {/* 2. Harga Pokok Penjualan (HPP) */}
            <div>
              <div className="flex justify-between font-black text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="uppercase tracking-wider">2. Harga Pokok Penjualan (HPP)</span>
                <span></span>
              </div>
              <div className="py-2 space-y-1.5">
                {incomeStatement.cogs.map((cog) => (
                  <div
                    key={cog.accountId}
                    onClick={() => handleDrilldownByCode(cog.accountCode)}
                    className="flex justify-between pl-4 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                  >
                    <span>
                      {cog.accountCode} - {cog.accountName} (Weighted Average)
                    </span>
                    <span className="font-mono tabular-nums font-semibold">{formatIDR(cog.amount)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800 pl-4 bg-slate-50/50 dark:bg-slate-800/40 py-1.5 px-3 rounded-lg">
                <span>Total HPP Barang Terjual:</span>
                <span className="font-mono tabular-nums text-rose-700 dark:text-rose-400 font-black">
                  ({formatIDR(incomeStatement.totalCogs)})
                </span>
              </div>
            </div>

            {/* GROSS PROFIT */}
            <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex justify-between font-black text-sm text-blue-950 dark:text-blue-300">
              <span>LABA KOTOR (GROSS PROFIT):</span>
              <span className="font-mono tabular-nums text-blue-800 dark:text-blue-300 font-black">{formatIDR(incomeStatement.grossProfit)}</span>
            </div>

            {/* 3. Beban Operasional */}
            <div>
              <div className="flex justify-between font-black text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="uppercase tracking-wider">3. Beban Operasional Usaha</span>
                <span></span>
              </div>
              <div className="py-2 space-y-1.5">
                {incomeStatement.operatingExpenses.map((exp) => (
                  <div
                    key={exp.accountId}
                    onClick={() => handleDrilldownByCode(exp.accountCode)}
                    className="flex justify-between pl-4 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                  >
                    <span>
                      {exp.accountCode} - {exp.accountName}
                    </span>
                    <span className="font-mono tabular-nums font-semibold">{formatIDR(exp.amount)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800 pl-4 bg-slate-50/50 dark:bg-slate-800/40 py-1.5 px-3 rounded-lg">
                <span>Total Beban Operasional:</span>
                <span className="font-mono tabular-nums text-rose-700 dark:text-rose-400 font-black">
                  ({formatIDR(incomeStatement.totalOperatingExpenses)})
                </span>
              </div>
            </div>

            {/* NET INCOME */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-700 flex justify-between font-black text-base text-emerald-950 dark:text-emerald-300 shadow-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>LABA BERSIH TAHUN BERJALAN (NET INCOME):</span>
              </div>
              <span className="font-mono tabular-nums text-emerald-800 dark:text-emerald-300 font-black">{formatIDR(incomeStatement.netIncome)}</span>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 2: NERACA (BALANCE SHEET - F-14) */}
      {activeReport === 'balance_sheet' && (
        <div className="glass-card rounded-3xl p-8 bg-white dark:bg-[#2B2D31] shadow-xl space-y-6">
          <div className="text-center pb-6 border-b border-slate-200 dark:border-slate-700">
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight text-center bg-transparent border-none outline-none hover:bg-slate-50 dark:hover:bg-slate-800 rounded px-2 w-full max-w-lg mx-auto"
            />
            <h3 className="text-base font-extrabold text-blue-700 dark:text-blue-400 mt-1">
              LAPORAN NERACA KEUANGAN (BALANCE SHEET)
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              Posisi Keuangan Per Tanggal: {balanceSheet.asOfDate}
            </p>
          </div>

          {/* Mathematical Balance Proof Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold ${
              balanceSheet.isBalanced
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'bg-rose-50 text-rose-900 border-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              <span>
                Bukti Keseimbangan Neraca:{' '}
                <strong>Total Aset = Total Liabilitas + Total Ekuitas</strong>
              </span>
            </div>
            <span className="font-mono text-sm font-black tabular-nums">
              {balanceSheet.isBalanced ? 'SEIMBANG / BALANCE' : `SELISIH Rp ${balanceSheet.discrepancy.toLocaleString('id-ID')}`}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-slate-800 dark:text-slate-200">
            {/* LEFT COLUMN: ASET */}
            <div className="space-y-5">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-300 font-black text-sm uppercase tracking-wider">
                ASET (AKTIVA)
              </div>

              {/* Aset Lancar */}
              <div>
                <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] mb-2">
                  Aset Lancar
                </h4>
                <div className="space-y-1.5 pl-2">
                  {balanceSheet.currentAssets.map((item) => (
                    <div
                      key={item.accountId}
                      onClick={() => handleDrilldownByCode(item.accountCode)}
                      className="flex justify-between text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                    >
                      <span>
                        {item.accountCode} - {item.accountName}
                      </span>
                      <span className="font-mono tabular-nums font-semibold">{formatIDR(item.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1.5 border-t border-slate-100 dark:border-slate-800">
                    <span>Total Aset Lancar:</span>
                    <span className="font-mono tabular-nums text-blue-700 dark:text-blue-400 font-black">
                      {formatIDR(balanceSheet.totalCurrentAssets)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Aset Tetap */}
              <div>
                <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] mb-2">
                  Aset Tetap
                </h4>
                <div className="space-y-1.5 pl-2">
                  {balanceSheet.nonCurrentAssets.map((item) => (
                    <div
                      key={item.accountId}
                      onClick={() => handleDrilldownByCode(item.accountCode)}
                      className="flex justify-between text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                    >
                      <span>
                        {item.accountCode} - {item.accountName}
                      </span>
                      <span className="font-mono tabular-nums font-semibold">{formatIDR(item.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1.5 border-t border-slate-100 dark:border-slate-800">
                    <span>Total Aset Tetap:</span>
                    <span className="font-mono tabular-nums text-blue-700 dark:text-blue-400 font-black">
                      {formatIDR(balanceSheet.totalNonCurrentAssets)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex justify-between font-black text-sm">
                <span>TOTAL ASET (AKTIVA):</span>
                <span className="font-mono tabular-nums text-emerald-400 font-black">{formatIDR(balanceSheet.totalAssets)}</span>
              </div>
            </div>

            {/* RIGHT COLUMN: LIABILITAS & EKUITAS */}
            <div className="space-y-5">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 font-black text-sm uppercase tracking-wider">
                LIABILITAS & EKUITAS (PASIVA)
              </div>

              {/* Liabilitas Lancar */}
              <div>
                <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] mb-2">
                  Liabilitas Lancar (Jangka Pendek)
                </h4>
                <div className="space-y-1.5 pl-2">
                  {balanceSheet.currentLiabilities.map((item) => (
                    <div
                      key={item.accountId}
                      onClick={() => handleDrilldownByCode(item.accountCode)}
                      className="flex justify-between text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                    >
                      <span>
                        {item.accountCode} - {item.accountName}
                      </span>
                      <span className="font-mono tabular-nums font-semibold">{formatIDR(item.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1.5 border-t border-slate-100 dark:border-slate-800">
                    <span>Total Liabilitas Lancar:</span>
                    <span className="font-mono tabular-nums text-amber-800 dark:text-amber-400 font-black">
                      {formatIDR(balanceSheet.totalCurrentLiabilities)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ekuitas (Modal + Laba Berjalan) */}
              <div>
                <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] mb-2">
                  Ekuitas Pemilik & Modal
                </h4>
                <div className="space-y-1.5 pl-2">
                  {balanceSheet.equityItems.map((item) => (
                    <div
                      key={item.accountId}
                      onClick={() => handleDrilldownByCode(item.accountCode)}
                      className="flex justify-between text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                    >
                      <span>
                        {item.accountCode} - {item.accountName}
                      </span>
                      <span className="font-mono tabular-nums font-semibold">{formatIDR(item.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold">
                    <span>Laba Bersih Tahun Berjalan (Net Income):</span>
                    <span className="font-mono tabular-nums">{formatIDR(balanceSheet.currentPeriodNetIncome)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1.5 border-t border-slate-100 dark:border-slate-800">
                    <span>Total Ekuitas:</span>
                    <span className="font-mono tabular-nums text-purple-700 dark:text-purple-400 font-black">
                      {formatIDR(balanceSheet.totalEquity)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex justify-between font-black text-sm">
                <span>TOTAL LIABILITAS & EKUITAS:</span>
                <span className="font-mono tabular-nums text-emerald-400 font-black">
                  {formatIDR(balanceSheet.totalLiabilitiesAndEquity)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 3: ARUS KAS (CASH FLOW DIRECT METHOD - F-15) */}
      {activeReport === 'cash_flow' && (
        <div className="glass-card rounded-3xl p-8 bg-white dark:bg-[#2B2D31] shadow-xl space-y-6">
          <div className="text-center pb-6 border-b border-slate-200 dark:border-slate-700">
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight text-center bg-transparent border-none outline-none hover:bg-slate-50 dark:hover:bg-slate-800 rounded px-2 w-full max-w-lg mx-auto"
            />
            <h3 className="text-base font-extrabold text-blue-700 dark:text-blue-400 mt-1">
              LAPORAN ARUS KAS (DIRECT METHOD)
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              Periode: {startDate} s/d {endDate}
            </p>
          </div>

          <div className="space-y-6 text-xs text-slate-800 dark:text-slate-200">
            <div>
              <div className="flex justify-between font-black text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-700 uppercase">
                <span>1. Arus Kas dari Aktivitas Operasi</span>
                <span>Jumlah</span>
              </div>
              <div className="py-2 space-y-1.5 pl-4">
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Penerimaan Kas dari Pelanggan (Faktur & Kasir)</span>
                  <span className="font-mono tabular-nums font-semibold">{formatIDR(cashFlow.cashFromCustomers)}</span>
                </div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Pembayaran Kas ke Pemasok Barang</span>
                  <span className="font-mono tabular-nums font-semibold">({formatIDR(cashFlow.cashPaidToSuppliers)})</span>
                </div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Pembayaran Beban Operasional, Gaji, Listrik</span>
                  <span className="font-mono tabular-nums font-semibold">({formatIDR(cashFlow.cashPaidForOperatingExpenses)})</span>
                </div>
              </div>
              <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800 pl-4 bg-slate-50/50 dark:bg-slate-800/40 py-1.5 px-3 rounded-lg">
                <span>Kas Bersih dari Aktivitas Operasi:</span>
                <span className="font-mono tabular-nums text-blue-700 dark:text-blue-400 font-black">
                  {formatIDR(cashFlow.netCashFromOperatingActivities)}
                </span>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-black text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-700 uppercase">
                <span>2. Arus Kas dari Aktivitas Investasi</span>
                <span></span>
              </div>
              <div className="py-2 space-y-1.5 pl-4">
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Pembelian Peralatan Toko & Rak Display</span>
                  <span className="font-mono tabular-nums font-semibold">({formatIDR(cashFlow.cashForEquipment)})</span>
                </div>
              </div>
              <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800 pl-4 bg-slate-50/50 dark:bg-slate-800/40 py-1.5 px-3 rounded-lg">
                <span>Kas Bersih dari Aktivitas Investasi:</span>
                <span className="font-mono tabular-nums text-rose-700 dark:text-rose-400 font-black">
                  ({formatIDR(cashFlow.cashForEquipment)})
                </span>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-black text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-700 uppercase">
                <span>3. Arus Kas dari Aktivitas Pendanaan</span>
                <span></span>
              </div>
              <div className="py-2 space-y-1.5 pl-4">
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Setoran Modal Awal Pemilik Toko</span>
                  <span className="font-mono tabular-nums font-semibold">{formatIDR(cashFlow.cashFromCapitalInjection)}</span>
                </div>
              </div>
              <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800 pl-4 bg-slate-50/50 dark:bg-slate-800/40 py-1.5 px-3 rounded-lg">
                <span>Kas Bersih dari Aktivitas Pendanaan:</span>
                <span className="font-mono tabular-nums text-emerald-700 dark:text-emerald-400 font-black">
                  {formatIDR(cashFlow.cashFromCapitalInjection)}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 font-bold">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Kenaikan Bersih Kas & Setara Kas:</span>
                <span className="font-mono tabular-nums text-emerald-400 font-black">{formatIDR(cashFlow.netChangeInCash)}</span>
              </div>
              <div className="flex justify-between text-base font-black pt-2 border-t border-slate-700">
                <span>SALDO AKHIR KAS & BANK PERIODE:</span>
                <span className="font-mono tabular-nums text-emerald-400 font-black">
                  {formatIDR(cashFlow.endingCashBalance)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 4: WHAT-IF SIMULATOR */}
      {activeReport === 'simulation' && <FinancialSimulator state={state} />}

      {/* Ledger Drilldown Drawer */}
      <LedgerDrilldownDrawer
        isOpen={!!selectedDrilldownAccount}
        onClose={() => setSelectedDrilldownAccount(null)}
        account={selectedDrilldownAccount}
        journalEntries={state.journalEntries}
      />
    </div>
  );
};
