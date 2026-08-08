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
} from 'lucide-react';
import { soundFx } from '../../lib/soundFx';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onOpenNewInvoice: () => void;
  onOpenNewBill: () => void;
  onOpenNewCash: () => void;
  onToggleRole: () => void;
  onResetData: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenNewInvoice,
  onOpenNewBill,
  onOpenNewCash,
  onToggleRole,
  onResetData,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const actions = [
    { id: 'dash', label: 'Buka Dashboard Utama & KPI', category: 'Navigasi', icon: LayoutDashboard, run: () => onNavigate('dashboard') },
    { id: 'inv', label: 'Buat Faktur Penjualan Baru (Sales Invoice)', category: 'Transaksi', icon: PlusCircle, run: onOpenNewInvoice },
    { id: 'bill', label: 'Catat Tagihan Pembelian Baru (Purchase Bill)', category: 'Transaksi', icon: PlusCircle, run: onOpenNewBill },
    { id: 'cash', label: 'Catat Transaksi Kas Masuk / Keluar', category: 'Transaksi', icon: PlusCircle, run: onOpenNewCash },
    { id: 'coa', label: 'Daftar Akun (Chart of Accounts)', category: 'Master Data', icon: WalletCards, run: () => onNavigate('coa') },
    { id: 'contacts', label: 'Kontak Pelanggan & Vendor', category: 'Master Data', icon: Users, run: () => onNavigate('contacts') },
    { id: 'products', label: 'Katalog Produk & HPP Weighted Average', category: 'Master Data', icon: Package, run: () => onNavigate('products') },
    { id: 'arap', label: 'Piutang & Hutang Usaha (AR & AP Aging)', category: 'Operasional', icon: Building2, run: () => onNavigate('arap') },
    { id: 'pnl', label: 'Laporan Laba Rugi (Income Statement)', category: 'Laporan', icon: FileSpreadsheet, run: () => onNavigate('reports') },
    { id: 'bs', label: 'Laporan Neraca (Balance Sheet)', category: 'Laporan', icon: FileSpreadsheet, run: () => onNavigate('reports') },
    { id: 'cf', label: 'Laporan Arus Kas (Direct Cash Flow)', category: 'Laporan', icon: FileSpreadsheet, run: () => onNavigate('reports') },
    { id: 'ratios', label: 'Analisa Rasio Finansial Otomatis', category: 'Analitik', icon: LineChart, run: () => onNavigate('analytics') },
    { id: 'role', label: 'Beralih Peran Pengguna (Admin / Staff)', category: 'Sistem', icon: UserCheck, run: onToggleRole },
    { id: 'print', label: 'Cetak / Unduh PDF Laporan', category: 'Ekspor', icon: Printer, run: () => window.print() },
    { id: 'reset', label: 'Reset Sample Data 6 Bulan', category: 'Sistem', icon: RefreshCw, run: onResetData },
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
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 p-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-950/80 dark:bg-black/90 backdrop-blur-lg transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl glass-card bg-white dark:bg-[#2B2D31] rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden z-10 animate-in fade-in zoom-in duration-150">
        {/* Search Input */}
        <div className="p-4 border-b border-slate-200/60 dark:border-slate-700/60 flex items-center gap-3">
          <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik tindakan atau cari modul (contoh: faktur, neraca, rasio)..."
            className="w-full bg-transparent text-sm outline-none text-slate-900 dark:text-white placeholder-slate-400 font-medium"
          />
          <kbd className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Action Items List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
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
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{action.label}</span>
                  </div>

                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {action.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Command Footer */}
        <div className="p-3 bg-slate-50 dark:bg-[#1E1F22] border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Gunakan panah â†‘â†“ untuk memilih, Enter untuk eksekusi</span>
          <span className="font-mono font-bold text-blue-600 dark:text-blue-400">Ctrl + K</span>
        </div>
      </div>
    </div>
  );
};
