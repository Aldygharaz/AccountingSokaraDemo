import React, { useState } from 'react';
import {
  LineChart,
  TrendingUp,
  ShieldCheck,
  Percent,
  Layers,
  Award,
  AlertCircle,
  CheckCircle2,
  Lock,
  Sparkles,
  Package,
  Boxes,
  ArrowUpRight,
  TrendingDown,
  Tag,
  Search,
} from 'lucide-react';
import { useStore } from '../../lib/storage';
import {
  formatIDR,
  formatNumber,
  calculateFinancialRatios,
  generateIncomeStatement,
  generateBalanceSheet,
  calculateProductProfitability,
  ProductProfitabilitySummary,
} from '../../lib/accountingEngine';
import { Tooltip } from '../common/Tooltip';

interface AnalyticsViewProps {}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({}) => {
  const currentUser = useStore(s => s.currentUser);
  const accounts = useStore(s => s.accounts);
  const journalEntries = useStore(s => s.journalEntries);
  const products = useStore(s => s.products);
  const stockMovements = useStore(s => s.stockMovements);
  const invoices = useStore(s => s.invoices);

  const [skuSearch, setSkuSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const isStaff = currentUser.role === 'staff';

  if (isStaff) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner border border-amber-200 dark:border-amber-800">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Akses Terbatas: Level Administrator</h2>
        <p className="text-sm text-slate-500 dark:text-[#B5BAC1] max-w-md mx-auto">
          Fitur Analisa Rasio Finansial dibatasi hanya untuk role <strong>Admin</strong>. Anda saat ini login sebagai <strong>Staff (Data Entry)</strong>.
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
          Gunakan tombol role switcher di pojok kanan atas untuk beralih ke Admin.
        </p>
      </div>
    );
  }

  const ratios = React.useMemo(() => calculateFinancialRatios(accounts, journalEntries), [accounts, journalEntries]);
  const balanceSheet = React.useMemo(() => generateBalanceSheet(accounts, journalEntries), [accounts, journalEntries]);
  const incomeStatement = React.useMemo(() => generateIncomeStatement(accounts, journalEntries), [accounts, journalEntries]);

  // Product Profitability & SKU Contribution Matrix
  const skuProfitability: ProductProfitabilitySummary = React.useMemo(() => {
    return calculateProductProfitability(products, stockMovements, invoices);
  }, [products, stockMovements, invoices]);

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const filteredSkuItems = skuProfitability.items.filter((it) => {
    if (selectedCategory !== 'all' && it.category !== selectedCategory) return false;
    if (skuSearch) {
      const q = skuSearch.toLowerCase();
      return it.name.toLowerCase().includes(q) || it.sku.toLowerCase().includes(q);
    }
    return true;
  });

  const renderBadge = (value: number | string, type: 'current' | 'quick' | 'gpm' | 'npm' | 'der' | 'roe') => {
    let num = Number(value);
    if (isNaN(num) || !isFinite(num)) num = 0;
    
    let isGood = true;
    let label = 'Optimal';
    
    switch (type) {
      case 'current':
        isGood = num >= 1.5;
        label = isGood ? 'Sehat (Optimal)' : 'Bahaya Likuiditas';
        break;
      case 'quick':
        isGood = num >= 1.0;
        label = isGood ? 'Aman' : 'Berisiko';
        break;
      case 'gpm':
        isGood = num >= 20;
        label = isGood ? 'Kuat (>20%)' : 'Margin Tipis';
        break;
      case 'npm':
        isGood = num >= 10;
        label = isGood ? 'Optimal' : 'Tidak Efisien';
        break;
      case 'der':
        isGood = num <= 1.5;
        label = isGood ? 'Resiko Rendah' : 'Hutang Tinggi';
        break;
      case 'roe':
        isGood = num >= 12;
        label = isGood ? 'Positif' : 'Kurang Optimal';
        break;
    }

    if (isGood) {
      return (
        <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          {label}
        </span>
      );
    } else {
      return (
        <span className="text-xs font-black px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          {label}
        </span>
      );
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Analisa Rasio & Profitabilitas Produk (CFO Analytics)
          </h1>
          <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-500" />
            Sokara AI Financial Analytics
          </span>
        </div>
        <p className="text-sm text-slate-500 dark:text-[#B5BAC1] mt-1">
          Kalkulasi real-time rasio likuiditas, margin laba, dan kontribusi profitabilitas per SKU produk dagangan.
        </p>
      </div>

      {/* Grid of 6 Financial Health Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Current Ratio */}
        <div className="glass-card glass-card-hover rounded-2xl p-6 flex flex-col justify-between bg-white dark:bg-[#1E1F22] border border-slate-200/60 dark:border-[#3F4147]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Likuiditas Lancar
              </span>
              {renderBadge(ratios.currentRatio, 'current')}
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Current Ratio (Rasio Lancar)</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Rumus: Aset Lancar / Liabilitas Lancar
            </p>

            <div className="my-5">
              <span className={`text-3xl font-black ${ratios.currentRatio >= 1.5 ? 'text-emerald-600 dark:text-[#23A559]' : 'text-rose-600 dark:text-[#F23F43]'}`}>
                {ratios.currentRatio.toFixed(2)}x
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Ketersediaan kas & piutang untuk menutup setiap Rp 1 hutang jangka pendek.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#2B2D31] border border-slate-200/60 dark:border-[#3F4147] text-[11px] text-slate-500 dark:text-[#B5BAC1]">
            Tolok ukur sehat: <strong>&ge; 1.5x</strong>. Menjamin operasional toko aman dari risiko gagal bayar tagihan jatuh tempo.
          </div>
        </div>

        {/* 2. Quick Ratio */}
        <div className="glass-card glass-card-hover rounded-2xl p-6 flex flex-col justify-between bg-white dark:bg-[#1E1F22] border border-slate-200/60 dark:border-[#3F4147]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Likuiditas Cepat
              </span>
              {renderBadge(ratios.quickRatio, 'quick')}
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Quick Ratio (Acid-Test)</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Rumus: (Kas + Bank + Piutang) / Liabilitas Lancar
            </p>

            <div className="my-5">
              <span className={`text-3xl font-black ${ratios.quickRatio >= 1.0 ? 'text-emerald-600 dark:text-[#23A559]' : 'text-rose-600 dark:text-[#F23F43]'}`}>
                {ratios.quickRatio.toFixed(2)}x
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Likuiditas tanpa mengandalkan penjualan persediaan gudang.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#2B2D31] border border-slate-200/60 dark:border-[#3F4147] text-[11px] text-slate-500 dark:text-[#B5BAC1]">
            Tolok ukur sehat: <strong>&ge; 1.0x</strong>. Bisnis memiliki kas & piutang instan yang cukup tanpa perlu menjual barang.
          </div>
        </div>

        {/* 3. Gross Profit Margin */}
        <div className="glass-card glass-card-hover rounded-2xl p-6 flex flex-col justify-between bg-white dark:bg-[#1E1F22] border border-slate-200/60 dark:border-[#3F4147]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Margin Kotor
              </span>
              {renderBadge(ratios.grossProfitMargin, 'gpm')}
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Gross Profit Margin (GPM)</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Rumus: Laba Kotor / Pendapatan * 100%
            </p>

            <div className="my-5">
              <span className={`text-3xl font-black ${ratios.grossProfitMargin >= 20 ? 'text-emerald-600 dark:text-[#23A559]' : 'text-rose-600 dark:text-[#F23F43]'}`}>
                {formatNumber(ratios.grossProfitMargin, 2)}%
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Laba kotor setelah dikurangi harga pokok pembelian barang dagang.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#2B2D31] border border-slate-200/60 dark:border-[#3F4147] text-[11px] text-slate-500 dark:text-[#B5BAC1]">
            Tolok ukur retail sehat: <strong>&ge; 20%</strong>. Struktur margin produk retail sangat sehat untuk menopang biaya operasional.
          </div>
        </div>

        {/* 4. Net Profit Margin */}
        <div className="glass-card glass-card-hover rounded-2xl p-6 flex flex-col justify-between bg-white dark:bg-[#1E1F22] border border-slate-200/60 dark:border-[#3F4147]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Efisiensi Bersih
              </span>
              {renderBadge(ratios.netProfitMargin, 'npm')}
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Net Profit Margin (NPM)</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Rumus: Laba Bersih / Pendapatan * 100%
            </p>

            <div className="my-5">
              <span className={`text-3xl font-black ${ratios.netProfitMargin >= 10 ? 'text-emerald-600 dark:text-[#23A559]' : 'text-rose-600 dark:text-[#F23F43]'}`}>
                {formatNumber(ratios.netProfitMargin, 2)}%
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Persentase omzet yang berhasil dikonversi menjadi laba bersih riil.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#2B2D31] border border-slate-200/60 dark:border-[#3F4147] text-[11px] text-slate-500 dark:text-[#B5BAC1]">
            Tolok ukur sehat: <strong>&ge; 10%</strong>. Toko menghasilkan profit bersih konsisten setelah seluruh gaji, listrik, dan sewa.
          </div>
        </div>

        {/* 5. Debt to Equity Ratio */}
        <div className="glass-card glass-card-hover rounded-2xl p-6 flex flex-col justify-between bg-white dark:bg-[#1E1F22] border border-slate-200/60 dark:border-[#3F4147]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Solvabilitas & Leverage
              </span>
              {renderBadge(ratios.debtToEquityRatio, 'der')}
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Debt to Equity (DER)</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Rumus: Total Liabilitas / Total Ekuitas
            </p>

            <div className="my-5">
              <span className={`text-3xl font-black ${ratios.debtToEquityRatio <= 1.0 ? 'text-emerald-600 dark:text-[#23A559]' : 'text-rose-600 dark:text-[#F23F43]'}`}>
                {ratios.debtToEquityRatio.toFixed(2)}x
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Porsi pendanaan ekuitas pemilik jauh lebih besar dibanding kewajiban hutang.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#2B2D31] border border-slate-200/60 dark:border-[#3F4147] text-[11px] text-slate-500 dark:text-[#B5BAC1]">
            Tolok ukur aman: <strong>&le; 1.5x</strong>. Struktur modal toko didominasi modal disetor pemilik dan laba ditahan mandiri.
          </div>
        </div>

        {/* 6. Return on Equity (ROE) */}
        <div className="glass-card glass-card-hover rounded-2xl p-6 flex flex-col justify-between bg-white dark:bg-[#1E1F22] border border-slate-200/60 dark:border-[#3F4147]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Imbal Hasil Modal
              </span>
              {renderBadge(ratios.returnOnEquity, 'roe')}
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Return on Equity (ROE)</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Rumus: Laba Bersih / Total Ekuitas * 100%
            </p>

            <div className="my-5">
              <span className={`text-3xl font-black ${ratios.returnOnEquity >= 15 ? 'text-emerald-600 dark:text-[#23A559]' : 'text-rose-600 dark:text-[#F23F43]'}`}>
                {formatNumber(ratios.returnOnEquity, 2)}%
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Efektivitas manajemen mencetak profit menggunakan modal disetor pemilik & investor.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#2B2D31] border border-slate-200/60 dark:border-[#3F4147] text-[11px] text-slate-500 dark:text-[#B5BAC1]">
            Tolok ukur pasar: <strong>&ge; 12%</strong>. Menunjukkan pengembalian modal yang menarik bagi investor dan pemilik usaha.
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* GOD-TIER FITUR 5: PRODUCT PROFITABILITY & SKU CONTRIBUTION   */}
      {/* ============================================================ */}
      <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-[#3F4147]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                <Boxes className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Matriks Profitabilitas per Produk (SKU Contribution Matrix)
              </h2>
              <Tooltip
                title="Analisa Margin Kontribusi SKU"
                content="Mendeteksi margin laba kotor riil per produk (Harga Jual dikurangi Average Costing HPP) dan porsi kontribusinya terhadap total profitabilitas toko."
                iconOnly
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-[#B5BAC1] mt-1">
              Evaluasi kinerja produk paling menguntungkan (Top Contributor) versus barang dengan margin tipis.
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl glass-input font-bold"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <div className="relative w-48 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari SKU / nama..."
                value={skuSearch}
                onChange={(e) => setSkuSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl glass-input"
              />
            </div>
          </div>
        </div>

        {/* Top Performer Summary Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-gradient-to-tr from-indigo-50 to-blue-50 dark:from-[#1E1F22] dark:to-[#2B2D31] border border-indigo-200/80 dark:border-[#3F4147] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-indigo-800 dark:text-indigo-300 block">
                Top Contributor Utama
              </span>
              <h4 className="text-sm font-black text-slate-900 dark:text-white mt-0.5 truncate max-w-[200px]">
                {skuProfitability.topContributor?.name || '-'}
              </h4>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                Laba: {formatIDR(skuProfitability.topContributor?.grossProfit || 0)} ({skuProfitability.topContributor?.contributionSharePct}%)
              </span>
            </div>
            <Award className="w-8 h-8 text-amber-500 shrink-0" />
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1E1F22] border border-slate-200/80 dark:border-[#3F4147]">
            <span className="text-[10px] font-black uppercase text-slate-500 dark:text-[#B5BAC1] block">
              Total Laba Kotor Semua Produk
            </span>
            <div className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5 tabular-nums">
              {formatIDR(skuProfitability.totalGrossProfit)}
            </div>
            <span className="text-xs text-slate-500 dark:text-[#B5BAC1]">
              Omzet Agregat: {formatIDR(skuProfitability.totalRevenue)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1E1F22] border border-slate-200/80 dark:border-[#3F4147]">
            <span className="text-[10px] font-black uppercase text-slate-500 dark:text-[#B5BAC1] block">
              Rata-rata Margin Kotor Toko
            </span>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 tabular-nums">
              {skuProfitability.overallGrossMarginPct}%
            </div>
            <span className="text-xs text-slate-500 dark:text-[#B5BAC1]">
              Benchmark industri retail sehat: &gt; 20%
            </span>
          </div>
        </div>

        {/* SKU Profitability Table */}
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-200 dark:border-[#3F4147]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-[#1E1F22] border-b border-slate-200 dark:border-[#3F4147] text-[11px] font-black uppercase text-slate-600 dark:text-[#B5BAC1]">
                  <th className="py-3 px-4">Produk & SKU</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4 text-center">Volume Jual</th>
                  <th className="py-3 px-4 text-right">Harga Jual / HPP</th>
                  <th className="py-3 px-4 text-right">Total Profit (Rp)</th>
                  <th className="py-3 px-4 text-center">Gross Margin %</th>
                  <th className="py-3 px-4 text-center">Share Profit</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredSkuItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Tidak ada data produk yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredSkuItems.map((prod) => (
                    <tr key={prod.productId} className="hover:bg-slate-50 dark:hover:bg-[#2B2D31] transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {prod.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          SKU: {prod.sku}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-[#B5BAC1]">
                        {prod.category}
                      </td>
                      <td className="py-3 px-4 text-center font-bold font-mono">
                        {prod.qtySold} {prod.unit}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {formatIDR(prod.salePrice)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          HPP: {formatIDR(prod.avgCost)}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {formatIDR(prod.grossProfit)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-bold font-mono text-slate-900 dark:text-white">
                            {prod.grossMarginPct}%
                          </span>
                          <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                prod.grossMarginPct >= 35
                                  ? 'bg-emerald-500'
                                  : prod.grossMarginPct >= 20
                                  ? 'bg-blue-500'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(0, prod.grossMarginPct))}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-blue-600 dark:text-blue-400">
                        {prod.contributionSharePct}%
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            prod.status === 'top_performer'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : prod.status === 'healthy'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {prod.status === 'top_performer'
                            ? 'Top Margin'
                            : prod.status === 'healthy'
                            ? 'Margin Sehat'
                            : 'Margin Tipis'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
