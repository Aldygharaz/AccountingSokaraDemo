import React from 'react';
import {
  Search,
  UserCheck,
  ShieldAlert,
  CheckCircle2,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Command,
  UserCircle2,
  Sparkles,
} from 'lucide-react';
import { UserSession } from '../../types/accounting';
import { soundFx } from '../../lib/soundFx';

interface HeaderProps {
  currentUser: UserSession;
  onRoleToggle: (role: 'admin' | 'staff') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  journalBalanced: boolean;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenCommandPalette: () => void;
  onOpenPokaYoke: () => void;
  onOpenClosing?: () => void;
  onOpenCfo?: () => void;
  onOpenForensic?: () => void;
  onOpenOfficialExport?: () => void;
  onOpenCosting?: () => void;
  onOpenManualBook?: () => void;
  onOpenMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onRoleToggle,
  searchQuery,
  onSearchChange,
  journalBalanced,
  isDarkMode,
  onToggleDarkMode,
  onOpenCommandPalette,
  onOpenPokaYoke,
  onOpenClosing,
  onOpenCfo,
  onOpenForensic,
  onOpenOfficialExport,
  onOpenCosting,
  onOpenManualBook,
  onOpenMobileSidebar,
}) => {
  const [isMuted, setIsMuted] = React.useState(soundFx.getIsMuted());
  const [isOnline, setIsOnline] = React.useState(true);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleSoundToggle = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
    if (!muted) soundFx.playClick();
  };

  return (
    <header className="fixed top-0 lg:left-72 left-0 right-0 h-16 bg-white/90 dark:bg-[#2B2D31]/95 backdrop-blur-xl border-b border-slate-200 dark:border-[#3F4147] z-40 flex items-center justify-between px-4 lg:px-6 no-print shadow-sm">
      {/* Global Search Bar + Command Palette Trigger */}
      <div className="flex items-center gap-2 lg:gap-3">
        {onOpenMobileSidebar && (
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#383A40] text-slate-500 dark:text-[#B5BAC1]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>
        )}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center bg-slate-100 dark:bg-[#1E1F22] hover:bg-slate-200/80 dark:hover:bg-[#383A40] rounded-xl px-3 lg:px-4 py-2 w-48 sm:w-64 md:w-80 lg:w-96 border border-slate-200/80 dark:border-[#3F4147] text-left transition-all group"
        >
          <Search className="w-4 h-4 text-slate-400 mr-2 lg:mr-2.5 shrink-0 group-hover:text-blue-500 transition-colors" />
          <span className="text-xs text-slate-500 dark:text-[#B5BAC1] flex-1 truncate">
            Cari transaksi, SOP, atau tekan <strong className="text-blue-600 dark:text-[#0984E3]">Ctrl + K</strong>...
          </span>
          <kbd className="hidden sm:inline-block text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-lg bg-white dark:bg-[#2B2D31] text-slate-500 dark:text-[#B5BAC1] border border-slate-200 dark:border-[#3F4147]">
            ⌘K
          </kbd>
        </button>

        {/* Manual Book Quick Button */}
        {onOpenManualBook && (
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenManualBook();
            }}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-black transition-all shadow-sm"
            title="Buka Buku Panduan & Kamus SOP Akuntansi"
          >
            <span>📖 Panduan SOP</span>
          </button>
        )}

        {/* Poka Yoke Quick Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            onOpenPokaYoke();
          }}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-black transition-all shadow-sm"
          title="Buka Poka-Yoke Anomaly Inspector & 1-Click Auto-Fix"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" style={{ animationDuration: '4s' }} />
          <span>Defensive UX</span>
        </button>

        {/* CFO Intelligence Quick Button */}
        {onOpenCfo && (
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenCfo();
            }}
            className="hidden xl:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 text-purple-900 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-black transition-all shadow-sm"
            title="Buka Executive CFO Intelligence & DuPont Analysis (F9)"
          >
            <span>📊 CFO (F9)</span>
          </button>
        )}

        {/* Forensic Audit Quick Button */}
        {onOpenForensic && (
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenForensic();
            }}
            className="hidden 2xl:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-black transition-all shadow-sm"
            title="Buka Forensik SHA-256 Audit Chain (F10)"
          >
            <span>🛡️ Forensik (F10)</span>
          </button>
        )}

        {/* Job Costing Quick Button */}
        {onOpenCosting && (
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenCosting();
            }}
            className="hidden 2xl:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 text-purple-900 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-black transition-all shadow-sm"
            title="Buka Job-Order & Activity-Based Costing (F7)"
          >
            <span>💼 HPP Costing (F7)</span>
          </button>
        )}

        {/* Official PSAK Export Quick Button */}
        {onOpenOfficialExport && (
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenOfficialExport();
            }}
            className="hidden 2xl:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-900 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-black transition-all shadow-sm"
            title="Ekspor Laporan Keuangan Resmi PSAK/IFRS (Ctrl+Shift+E)"
          >
            <span>📑 Ekspor PSAK</span>
          </button>
        )}

        {/* Mobile Quick Actions Menu Trigger */}
        <div className="relative xl:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center justify-center px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#1E1F22] hover:bg-slate-200 dark:hover:bg-[#383A40] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#3F4147] text-xs font-black transition-all shadow-sm"
          >
            Aksi Cepat
          </button>
          
          {isMobileMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-[#2B2D31] rounded-xl shadow-lg border border-slate-200 dark:border-[#3F4147] py-2 z-50 flex flex-col gap-1 px-2">
              {onOpenClosing && (
                <button onClick={() => { setIsMobileMenuOpen(false); onOpenClosing(); }} className="text-left px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#1E1F22] text-xs font-bold text-slate-700 dark:text-slate-200">
                  🔒 Tutup Buku
                </button>
              )}
              {onOpenCfo && (
                <button onClick={() => { setIsMobileMenuOpen(false); onOpenCfo(); }} className="text-left px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#1E1F22] text-xs font-bold text-slate-700 dark:text-slate-200">
                  🧠 CFO Intel
                </button>
              )}
              {onOpenForensic && (
                <button onClick={() => { setIsMobileMenuOpen(false); onOpenForensic(); }} className="text-left px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#1E1F22] text-xs font-bold text-slate-700 dark:text-slate-200">
                  🕵️ Forensik
                </button>
              )}
              {onOpenCosting && (
                <button onClick={() => { setIsMobileMenuOpen(false); onOpenCosting(); }} className="text-left px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#1E1F22] text-xs font-bold text-slate-700 dark:text-slate-200">
                  💼 HPP Costing
                </button>
              )}
              {onOpenOfficialExport && (
                <button onClick={() => { setIsMobileMenuOpen(false); onOpenOfficialExport(); }} className="text-left px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#1E1F22] text-xs font-bold text-slate-700 dark:text-slate-200">
                  📑 Ekspor PSAK
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: Balance Badge + Sound + Theme + Online Badge + Role Switcher + Profile */}
      <div className="flex items-center gap-3">
        {/* Offline Sync Queue Indicator */}
        <div
          className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-black border ${
            isOnline
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
          title={isOnline ? 'Koneksi aktif & state tersinkronisasi' : 'Koneksi offline: transaksi masuk ke antrean lokal'}
        >
          {isOnline ? (
            <>
              <Wifi className="w-3 h-3 text-emerald-600" />
              <span>Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-rose-600 animate-pulse" />
              <span>Offline Queue</span>
            </>
          )}
        </div>

        {/* Double-Entry Balance Validator Badge */}
        <div
          className={`hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black border ${
            journalBalanced
              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
          title="Verifikasi matematis: Total Debit = Total Kredit di seluruh jurnal"
        >
          {journalBalanced ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Jurnal 100% Balance</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>Ada Selisih</span>
            </>
          )}
        </div>

        {/* Sound Toggle */}
        <button
          onClick={handleSoundToggle}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-[#B5BAC1] dark:hover:text-white bg-slate-100 dark:bg-[#1E1F22] border border-slate-200/80 dark:border-[#3F4147] transition-colors"
          title={isMuted ? 'Aktifkan Efek Suara (Web Audio)' : 'Bisukan Efek Suara'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => {
            soundFx.playClick();
            onToggleDarkMode();
          }}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-[#B5BAC1] dark:hover:text-white bg-slate-100 dark:bg-[#1E1F22] border border-slate-200/80 dark:border-[#3F4147] transition-colors"
          title={isDarkMode ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode (Discord Palette)'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>

        {/* Multi-Role View Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-[#1E1F22] p-0.5 rounded-xl border border-slate-200 dark:border-[#3F4147]">
          <button
            onClick={() => onRoleToggle('admin')}
            className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
              currentUser.role === 'admin'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-[#B5BAC1] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => onRoleToggle('staff')}
            className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
              currentUser.role === 'staff'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-[#B5BAC1] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Staff Kasir
          </button>
        </div>
      </div>
    </header>
  );
};
