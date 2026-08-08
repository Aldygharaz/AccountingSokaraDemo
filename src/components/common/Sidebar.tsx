import React from 'react';
import {
  LayoutDashboard,
  WalletCards,
  Users,
  Package,
  Receipt,
  Building2,
  FileSpreadsheet,
  LineChart,
  RotateCcw,
  Sparkles,
  Layers,
  ShoppingCart,
  Landmark,
  FileText,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { UserSession } from '../../types/accounting';
import { soundFx } from '../../lib/soundFx';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  currentUser: UserSession;
  onResetData: () => void;
  isMobileSidebarOpen?: boolean;
  onCloseMobileSidebar?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  currentUser,
  onResetData,
  isMobileSidebarOpen = false,
  onCloseMobileSidebar = () => {},
}) => {
  const isStaff = currentUser.role === 'staff';

  const menuSections = [
    {
      title: 'Utama & Penjualan',
      items: [
        { id: 'dashboard', label: 'Dashboard Eksekutif', icon: LayoutDashboard },
        { id: 'pos', label: 'Terminal Kasir POS (F4)', icon: ShoppingCart, badge: 'Retail' },
        { id: 'transactions', label: 'Faktur & Jurnal Umum', icon: Receipt },
        { id: 'arap', label: 'Piutang & Hutang (Aging)', icon: Building2 },
      ],
    },
    {
      title: 'Master Data & Inventori',
      items: [
        { id: 'products', label: 'Produk & Kartu Stok', icon: Package },
        { id: 'contacts', label: 'Pelanggan & Vendor', icon: Users },
        { id: 'coa', label: 'Daftar Akun (COA)', icon: WalletCards },
      ],
    },
    {
      title: 'Perbankan & Aktiva',
      items: [
        { id: 'banking', label: 'Rekonsiliasi Bank', icon: Landmark },
        { id: 'assets', label: 'Aset Tetap & Depresiasi', icon: Layers },
        { id: 'tax', label: 'Pajak & Fiskal (PPN/PPh)', icon: FileText, lockedForStaff: true },
      ],
    },
    {
      title: 'Eksekutif & Kepatuhan (CFO)',
      items: [
        { id: 'closing', label: 'Tutup Buku & Jurnal (F8)', icon: Landmark, badge: 'PSAK', lockedForStaff: true },
        { id: 'cfo', label: 'CFO Intelligence (F9)', icon: LineChart, badge: 'DuPont', lockedForStaff: true },
        { id: 'valuation', label: 'Valuasi DCF & WACC', icon: LineChart, badge: 'DCF', lockedForStaff: true },
        { id: 'tax1771', label: 'SPT Tahunan 1771 (Fiskal)', icon: FileText, badge: 'DJP', lockedForStaff: true },
        { id: 'costing', label: 'Job-Order Costing (F7)', icon: Layers, badge: 'HPP' },
        { id: 'ecl', label: 'Cadangan Piutang (PSAK 71)', icon: ShieldCheck },
        { id: 'forensic', label: 'Audit Forensik SHA-256 (F10)', icon: Sparkles, badge: 'Crypto', lockedForStaff: true },
        { id: 'forex', label: 'Valuta Asing & Reval Kurs', icon: WalletCards },
        { id: 'amortization', label: 'Amortisasi Dimuka (PSAK 1)', icon: Layers },
      ],
    },
    {
      title: 'Laporan & Audit',
      items: [
        { id: 'reports', label: 'Laporan Keuangan', icon: FileSpreadsheet },
        {
          id: 'analytics',
          icon: LineChart,
          label: 'Analisa Rasio',
          lockedForStaff: true,
        },
      ],
    },
    {
      title: 'Buku Panduan & SOP',
      items: [
        { id: 'manual', label: 'Buku Panduan & SOP', icon: BookOpen, badge: 'Guide' },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobileSidebar}
        />
      )}
      
      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-[#2B2D31] border-r border-slate-200 dark:border-[#3F4147] z-50 flex flex-col justify-between p-4 no-print overflow-y-auto shadow-sm transition-transform duration-300 lg:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
      <div className="space-y-4">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/50 dark:from-[#1E1F22] dark:to-[#2B2D31] border border-blue-200/60 dark:border-[#3F4147]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30 shrink-0">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          </div>
          <div className="min-w-0">
            <h1 className="font-black text-sm tracking-tight text-slate-900 dark:text-[#F2F3F5] leading-tight truncate">
              Sokara <span className="text-blue-600 dark:text-[#0984E3]">Accounting</span>
            </h1>
            <p className="text-[10px] text-blue-700 dark:text-blue-400 font-black tracking-wider uppercase truncate flex items-center gap-1">
              <span>Sokara AI Enterprise</span>
            </p>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="space-y-4">
          {menuSections.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              <h2 className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-[#80848E]">
                {sec.title}
              </h2>
              <div className="space-y-0.5">
                {sec.items.map((item) => {
                  const isActive = currentTab === item.id;
                  const Icon = item.icon;
                  const isLocked = isStaff && (item as any).lockedForStaff;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (isLocked) {
                          soundFx.playError();
                          return;
                        }
                        soundFx.playClick();
                        onTabChange(item.id);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                        isActive
                          ? 'bg-blue-600 dark:bg-[#0984E3] text-white shadow-md shadow-blue-600/20'
                          : isLocked
                          ? 'text-slate-400 dark:text-slate-600 opacity-50 cursor-not-allowed'
                          : 'text-slate-700 dark:text-[#DBDEE1] hover:bg-slate-100 dark:hover:bg-[#383A40] hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-[#B5BAC1]'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {(item as any).badge && (
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md shrink-0 ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-100 dark:bg-[#1E1F22] text-slate-500 dark:text-[#80848E] border border-slate-200 dark:border-[#3F4147]'
                          }`}
                        >
                          {(item as any).badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer User Card & Reset Button */}
      <div className="pt-4 mt-4 border-t border-slate-200 dark:border-[#3F4147] space-y-2">
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1E1F22] border border-slate-200/80 dark:border-[#3F4147] flex items-center justify-between">
          <div className="min-w-0">
            <div className="text-xs font-black text-slate-800 dark:text-[#F2F3F5] truncate">
              {currentUser.name}
            </div>
            <div className="text-[10px] font-bold text-slate-400 dark:text-[#B5BAC1] uppercase">
              Role: {currentUser.role}
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>

        <button
          onClick={onResetData}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-[#3F4147] hover:bg-slate-100 dark:hover:bg-[#383A40] text-[11px] font-black text-slate-600 dark:text-[#DBDEE1] transition-colors"
          title="Reset database ke data awal Toko Sejahtera"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Sample Database</span>
        </button>
      </div>
    </aside>
    </>
  );
};
