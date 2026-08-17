import React, { useState, useEffect } from 'react';
import {
  Search,
  LayoutDashboard,
  WalletCards,
  Users,
  Package,
  Receipt,
  Building2,
  FileSpreadsheet,
  LineChart,
  PlusCircle,
  RefreshCw,
  Printer,
  UserCheck,
  Sparkles,
  Command,
  ShieldCheck,
  Calculator,
  Layers,
  Scale,
  Landmark,
  BookOpen,
  DollarSign,
  TrendingUp,
  Percent,
  Moon,
  Sun,
  ShieldAlert,
} from 'lucide-react';
import { soundFx } from '../../lib/soundFx';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onOpenNewInvoice: () => void;
  onOpenNewBill: () => void;
  onOpenNewCash: () => void;
  onOpenPos?: () => void;
  onOpenClosing?: () => void;
  onOpenCfo?: () => void;
  onOpenForensic?: () => void;
  onOpenForex?: () => void;
  onOpenAmortization?: () => void;
  onOpenCosting?: () => void;
  onOpenTax1771?: () => void;
  onOpenValuation?: () => void;
  onOpenEcl?: () => void;
  onOpenManualBook?: () => void;
  onToggleRole: () => void;
  onResetData: () => void;
  onToggleDarkMode?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenNewInvoice,
  onOpenNewBill,
  onOpenNewCash,
  onOpenPos,
  onOpenClosing,
  onOpenCfo,
  onOpenForensic,
  onOpenForex,
  onOpenAmortization,
  onOpenCosting,
  onOpenTax1771,
  onOpenValuation,
  onOpenEcl,
  onOpenManualBook,
  onToggleRole,
  onResetData,
  onToggleDarkMode,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const actions = [
    // Transaksi Cepat
    { id: 'pos', label: 'Buka Kasir POS Touchscreen & Barcode Scanner', category: 'Transaksi Cepat', icon: Receipt, shortcut: 'F4', run: () => onOpenPos ? onOpenPos() : onNavigate('transactions') },
    { id: 'inv', label: 'Buat Faktur Penjualan Baru (Sales Invoice)', category: 'Transaksi Cepat', icon: PlusCircle, shortcut: 'Ctrl+N', run: onOpenNewInvoice },
    { id: 'bill', label: 'Catat Tagihan Pembelian Baru (Purchase Bill)', category: 'Transaksi Cepat', icon: PlusCircle, shortcut: '', run: onOpenNewBill },
    { id: 'cash', label: 'Catat Transaksi Kas Masuk / Keluar', category: 'Transaksi Cepat', icon: PlusCircle, shortcut: '', run: onOpenNewCash },

    // Modul Utama
    { id: 'dash', label: 'Buka Dashboard Utama & Real-Time KPI', category: 'Modul Akuntansi', icon: LayoutDashboard, shortcut: '', run: () => onNavigate('dashboard') },
    { id: 'trans', label: 'Jurnal Umum & Riwayat Transaksi (Virtual List)', category: 'Modul Akuntansi', icon: Receipt, shortcut: '', run: () => onNavigate('transactions') },
    { id: 'arap', label: 'Piutang & Hutang Usaha (AR & AP 5-Aging Buckets)', category: 'Modul Akuntansi', icon: Building2, shortcut: '', run: () => onNavigate('arap') },
    { id: 'coa', label: 'Bagan Akun (Chart of Accounts Master)', category: 'Modul Akuntansi', icon: WalletCards, shortcut: '', run: () => onNavigate('coa') },
    { id: 'products', label: 'Katalog Produk & HPP Weighted Average Costing', category: 'Modul Akuntansi', icon: Package, shortcut: '', run: () => onNavigate('products') },
    { id: 'contacts', label: 'Buku Kontak Pelanggan & Supplier', category: 'Modul Akuntansi', icon: Users, shortcut: '', run: () => onNavigate('contacts') },
    { id: 'banking', label: 'Rekonsiliasi Bank & Cash Management', category: 'Modul Akuntansi', icon: Landmark, shortcut: 'Ctrl+B', run: () => onNavigate('banking') },
    { id: 'assets', label: 'Aktiva Tetap & Jadwal Depresiasi Garis Lurus', category: 'Modul Akuntansi', icon: Scale, shortcut: '', run: () => onNavigate('assets') },
    { id: 'tax', label: 'Tax Studio (PPN 11%, PPh 21, PPh 23)', category: 'Modul Akuntansi', icon: Percent, shortcut: '', run: () => onNavigate('tax') },

    // Laporan & Eksekutif
    { id: 'pnl', label: 'Laporan Laba Rugi (Income Statement)', category: 'Laporan Keuangan', icon: FileSpreadsheet, shortcut: '', run: () => onNavigate('reports') },
    { id: 'bs', label: 'Laporan Posisi Keuangan (Neraca / Balance Sheet)', category: 'Laporan Keuangan', icon: FileSpreadsheet, shortcut: '', run: () => onNavigate('reports') },
    { id: 'cf', label: 'Laporan Arus Kas Metode Langsung (Direct Cash Flow)', category: 'Laporan Keuangan', icon: FileSpreadsheet, shortcut: '', run: () => onNavigate('reports') },
    { id: 'ratios', label: 'Analisa Rasio Finansial & Solvabilitas', category: 'Analitik & Intelligence', icon: LineChart, shortcut: '', run: () => onNavigate('analytics') },
    { id: 'cfo', label: 'Analisa Kinerja Keuangan (DuPont ROE & Altman Z-Score)', category: 'Laporan & Manajemen', icon: LineChart, shortcut: 'F8', run: () => onOpenCfo ? onOpenCfo() : onNavigate('analytics') },
    { id: 'valuation', label: 'DCF Corporate Valuation & WACC Modeling', category: 'Analitik & Intelligence', icon: TrendingUp, shortcut: '', run: () => onOpenValuation && onOpenValuation() },
    { id: 'forensic', label: 'Audit Trail & Log Riwayat Jurnal (Anti-Tamper)', category: 'Keamanan & Kepatuhan', icon: ShieldCheck, shortcut: 'F9', run: () => onOpenForensic && onOpenForensic() },
    { id: 'closing', label: 'Tutup Buku Periode Fiskal & Sertifikat Saldo', category: 'Operasional Akuntansi', icon: ShieldAlert, shortcut: 'F7', run: () => onOpenClosing && onOpenClosing() },
    { id: 'tax1771', label: 'Rekonsiliasi Fiskal & SPT Tahunan 1771 Badan', category: 'Operasional Akuntansi', icon: Percent, shortcut: '', run: () => onOpenTax1771 && onOpenTax1771() },
    { id: 'manual', label: 'SOP & Panduan Standar Akuntansi Bisnis', category: 'Knowledge Base', icon: BookOpen, shortcut: 'F2', run: () => onOpenManualBook ? onOpenManualBook() : onNavigate('manual') },

    // Sistem & Utilitas
    { id: 'theme', label: 'Beralih Tema (Dark Mode / Light Mode)', category: 'Pengaturan Sistem', icon: Moon, shortcut: '', run: () => onToggleDarkMode && onToggleDarkMode() },
    { id: 'role', label: 'Ganti Peran Pengguna (Administrator vs Staff)', category: 'Pengaturan Sistem', icon: UserCheck, shortcut: '', run: onToggleRole },
    { id: 'print', label: 'Cetak / Pratinjau PDF Laporan Keuangan', category: 'Ekspor Dokumen', icon: Printer, shortcut: 'Ctrl+P', run: () => window.print() },
    { id: 'reset', label: 'Reset Database ke Sample Seed Awal 6 Bulan', category: 'Pengaturan Sistem', icon: RefreshCw, shortcut: '', run: onResetData },
  ];

  const filtered = actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onClose();
      }
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          soundFx.playClick();
          filtered[selectedIndex].run();
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-20 p-3 sm:p-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-950/80 dark:bg-black/90 backdrop-blur-lg transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl glass-card bg-white dark:bg-[#2B2D31] rounded-3xl shadow-2xl border border-slate-200/80 dark:border-[#3F4147] overflow-hidden z-10 animate-in fade-in zoom-in duration-150">
        {/* Search Input */}
        <div className="p-4 border-b border-slate-200/60 dark:border-[#3F4147] flex items-center gap-3 bg-slate-50/50 dark:bg-[#1E1F22]">
          <Search className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari transaksi, modul, laporan, atau panduan SOP..."
            className="w-full bg-transparent text-sm outline-none text-slate-900 dark:text-white placeholder-slate-400 font-medium"
          />
          <kbd className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-lg bg-white dark:bg-[#2B2D31] text-slate-500 dark:text-[#B5BAC1] border border-slate-200 dark:border-[#3F4147]">
            ESC
          </kbd>
        </div>

        {/* Action Items List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Tidak ada perintah atau modul yang cocok dengan pencarian Anda.
            </div>
          ) : (
            filtered.map((action, idx) => {
              const isSelected = selectedIndex === idx;
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => {
                    soundFx.playClick();
                    action.run();
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-left text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1E1F22]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-[#1E1F22] text-blue-600 dark:text-blue-400 border border-slate-200/50 dark:border-[#3F4147]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="truncate">{action.label}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {action.shortcut && (
                      <kbd
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                          isSelected
                            ? 'bg-white/20 text-white border-white/30'
                            : 'bg-slate-100 dark:bg-[#1E1F22] text-slate-500 dark:text-[#B5BAC1] border-slate-200 dark:border-[#3F4147]'
                        }`}
                      >
                        {action.shortcut}
                      </kbd>
                    )}
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-[#1E1F22] text-slate-400 dark:text-[#80848E]'
                      }`}
                    >
                      {action.category}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Command Footer */}
        <div className="p-3 bg-slate-50 dark:bg-[#1E1F22] border-t border-slate-100 dark:border-[#3F4147] flex items-center justify-between text-[11px] text-slate-400 dark:text-[#80848E]">
          <div className="flex items-center gap-3">
            <span>Gunakan panah navigasi keyboard untuk memilih</span>
            <span>Tekan Enter untuk membuka</span>
          </div>
          <span className="font-mono font-bold text-blue-600 dark:text-blue-400">Ctrl + K</span>
        </div>
      </div>
    </div>
  );
};
