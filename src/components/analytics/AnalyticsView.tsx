import React from 'react';
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
} from 'lucide-react';
import { useStore } from '../../lib/storage';
import {
  formatIDR,
  formatNumber,
  calculateFinancialRatios,
  generateIncomeStatement,
  generateBalanceSheet,
} from '../../lib/accountingEngine';

interface AnalyticsViewProps {
  }

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({}) => {
  const currentUser = useStore(s => s.currentUser);
  const accounts = useStore(s => s.accounts);
  const journalEntries = useStore(s => s.journalEntries);

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
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Analisa Rasio Keuangan Otomatis
          </h1>
          <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-500" />
            Sokara AI Financial Analytics
          </span>
        </div>
        <p className="text-sm text-slate-500 dark:text-[#B5BAC1] mt-1">
          Kalkulasi real-time indikator kesehatan finansial dari Laporan Neraca & Laba Rugi tanpa input manual.
        </p>
      </div>

      {/* Ratios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Current Ratio */}
        <div className="glass-card glass-card-hover rounded-2xl p-6 flex flex-col justify-between bg-white dark:bg-[#1E1F22] border border-slate-200/60 dark:border-[#3F4147]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Likuiditas Jangka Pendek
              </span>
              {renderBadge(ratios.currentRatio, 'current')}
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Current Ratio</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Rumus: Total Aset Lancar / Liabilitas Lancar
            </p>

            <div className="my-5">
              <span className={`text-3xl font-black ${ratios.currentRatio >= 1.5 ? 'text-emerald-600 dark:text-[#23A559]' : 'text-rose-600 dark:text-[#F23F43]'}`}>
                {ratios.currentRatio.toFixed(2)}x
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Tiap Rp 1 hutang lancar dijamin oleh <strong>Rp {ratios.currentRatio}</strong> aset lancar.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px] text-slate-500">
            Tolok ukur sehat: <strong>&ge; 1.5x</strong>. Toko memiliki cadangan likuiditas kas & persediaan yang sangat aman.
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
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Quick (Acid-Test) Ratio</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Rumus: (Aset Lancar - Persediaan) / Liabilitas Lancar
            </p>

            <div className="my-5">
              <span className={`text-3xl font-black ${ratios.quickRatio >= 1.0 ? 'text-emerald-600 dark:text-[#23A559]' : 'text-rose-600 dark:text-[#F23F43]'}`}>
                {ratios.quickRatio.toFixed(2)}x
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Likuiditas kas dan piutang cepat tanpa menunggu penjualan stok barang.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px] text-slate-500">
            Tolok ukur sehat: <strong>&ge; 1.0x</strong>. Kemampuan membayar hutang jatuh tempo segera tanpa likuidasi inventaris.
          </div>
        </div>

        {/* 3. Gross Profit Margin */}
        <div className="glass-card glass-card-hover rounded-2xl p-6 flex flex-col justify-between bg-white dark:bg-[#1E1F22] border border-slate-200/60 dark:border-[#3F4147]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Profitabilitas Penjualan
              </span>
              {renderBadge(ratios.grossProfitMargin, 'gpm')}
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Gross Profit Margin (GPM)</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Rumus: (Pendapatan - HPP) / Pendapatan * 100%
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

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px] text-slate-500">
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

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px] text-slate-500">
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

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px] text-slate-500">
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

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px] text-slate-500">
            Tolok ukur pasar: <strong>&ge; 12%</strong>. Menunjukkan pengembalian modal yang menarik bagi investor dan pemilik usaha.
          </div>
        </div>
      </div>
    </div>
  );
};
