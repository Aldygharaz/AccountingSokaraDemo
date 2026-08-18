import React, { useState, useEffect } from 'react';
import {
  WalletCards,
  Plus,
  Filter,
  Trash2,
  Lock,
  CheckCircle2,
  Search,
  ArrowUpDown,
  Building2,
  FileSpreadsheet,
  History,
  RotateCcw,
  Info,
} from 'lucide-react';
import { Account, AccountType, AccountSubType } from '../../types/accounting';
import { AppState } from '../../lib/storage';
import { formatIDR, calculateAccountBalances } from '../../lib/accountingEngine';
import { Modal } from '../common/Modal';
import { Tooltip } from '../common/Tooltip';
import { LedgerDrilldownDrawer } from '../ui/LedgerDrilldownDrawer';
import { soundFx } from '../../lib/soundFx';
import { useStore } from '../../lib/storage';

const formatSubType = (subType: string) => {
  const mapping: Record<string, string> = {
    aset_lancar: 'Aset Lancar',
    aset_tetap: 'Aset Tetap',
    liabilitas_lancar: 'Liabilitas Lancar',
    liabilitas_jangka_panjang: 'Liabilitas Jk. Panjang',
    ekuitas_modal: 'Ekuitas (Modal)',
    ekuitas_laba_ditahan: 'Laba Ditahan',
    pendapatan_usaha: 'Pendapatan Usaha',
    pendapatan_lain: 'Pendapatan Lain',
    hpp: 'HPP / Beban Pokok',
    beban_operasional: 'Beban Operasional',
    beban_lain: 'Beban Lain',
  };
  return mapping[subType] || subType;
};

interface CoaViewProps {
  onAddAccount: (acc: Omit<Account, 'id' | 'isSystem' | 'isActive'>) => void;
  onDeleteAccount: (id: string) => { success: boolean; error?: string };
}

export const CoaView: React.FC<CoaViewProps> = ({
  onAddAccount,
  onDeleteAccount,
}) => {
  const accounts = useStore(s => s.accounts);
  const journalEntries = useStore(s => s.journalEntries);

  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedDrilldownAccount, setSelectedDrilldownAccount] = useState<Account | null>(null);

  // New account form state
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<AccountType>('aset');
  const [newSubType, setNewSubType] = useState<AccountSubType>('aset_lancar');
  const [newNormalBalance, setNewNormalBalance] = useState<'debit' | 'kredit'>('debit');
  const [newDescription, setNewDescription] = useState('');

  // Global reset shortcut listener (Ctrl + Shift + F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        soundFx.playClick();
        setActiveTypeFilter('all');
        setSearchTerm('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Calculate live running balances for all accounts
  const balanceMap = calculateAccountBalances(accounts, journalEntries);

  // Check for unbalanced journals
  const unbalancedCount = journalEntries.filter(
    (je) => Math.abs(je.totalDebit - je.totalKredit) >= 0.01
  ).length;

  // Filter accounts
  const filteredAccounts = accounts.filter((acc) => {
    if (activeTypeFilter !== 'all' && acc.type !== activeTypeFilter) return false;
    if (searchTerm) {
      const matchCode = acc.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchName = acc.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCode || matchName;
    }
    return true;
  });

  const handleTypeChange = (type: AccountType) => {
    setNewType(type);
    if (type === 'aset') {
      setNewSubType('aset_lancar');
      setNewNormalBalance('debit');
    } else if (type === 'liabilitas') {
      setNewSubType('liabilitas_lancar');
      setNewNormalBalance('kredit');
    } else if (type === 'ekuitas') {
      setNewSubType('ekuitas_modal');
      setNewNormalBalance('kredit');
    } else if (type === 'pendapatan') {
      setNewSubType('pendapatan_usaha');
      setNewNormalBalance('kredit');
    } else {
      setNewSubType('hpp');
      setNewNormalBalance('debit');
    }
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName) {
      setErrorMessage('Kode dan Nama akun wajib diisi.');
      return;
    }

    const isDuplicate = accounts.some((a) => a.code === newCode);
    if (isDuplicate) {
      setErrorMessage(`Kode akun ${newCode} sudah terdaftar. Gunakan kode unik lain.`);
      return;
    }

    soundFx.playClick();
    onAddAccount({
      code: newCode,
      name: newName,
      type: newType,
      subType: newSubType,
      normalBalance: newNormalBalance,
      description: newDescription,
    });

    setIsAddModalOpen(false);
    setNewCode('');
    setNewName('');
    setNewDescription('');
    setErrorMessage(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Yakin ingin menghapus akun ini dari bagan akun?')) {
      const res = onDeleteAccount(id);
      if (!res.success) {
        soundFx.playError();
        alert(res.error);
      } else {
        soundFx.playClick();
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {selectedDrilldownAccount && (
        <LedgerDrilldownDrawer
          isOpen={!!selectedDrilldownAccount}
          onClose={() => setSelectedDrilldownAccount(null)}
          account={selectedDrilldownAccount}
          journalEntries={journalEntries}
        />
      )}

      {/* Header with Title & Add Account Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Daftar Akun (Chart of Accounts)
            </h1>
            <Tooltip
              title="Bagan Akun (COA)"
              content="Daftar hierarki seluruh pos buku besar yang mengelompokkan Aset, Kewajiban, Ekuitas, Pendapatan, dan Beban sesuai standar PSAK."
              iconOnly
            />
          </div>
          <p className="text-sm text-slate-500 dark:text-[#B5BAC1] mt-1">
            Klik pada akun mana saja untuk membuka Buku Besar (T-Account Ledger Drilldown).
          </p>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            setErrorMessage(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 transition-all self-start sm:self-auto hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Akun Baru</span>
        </button>
      </div>

      {/* Unbalanced Journal Warning Banner */}
      {unbalancedCount > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 shadow-sm flex items-start gap-3 animate-pulse">
          <div className="p-2 bg-rose-100 dark:bg-rose-900/60 rounded-xl">
            <Info className="w-5 h-5 text-rose-700 dark:text-rose-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-rose-800 dark:text-rose-300">Peringatan: Jurnal Tidak Seimbang!</h3>
            <p className="text-xs text-rose-700 dark:text-rose-400 mt-1">
              Ditemukan <strong>{unbalancedCount} entri jurnal</strong> dengan Total Debit tidak sama dengan Total Kredit. Hal ini akan menyebabkan Neraca Saldo tidak seimbang. Segera periksa dan perbaiki entri tersebut di menu Jurnal.
            </p>
          </div>
        </div>
      )}

      {/* Filter Chips & Search Bar */}
      <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-[#2B2D31] border border-slate-200 dark:border-[#3F4147]">
        {/* Type Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { id: 'all', label: 'Semua Akun' },
            { id: 'aset', label: '1. Aset' },
            { id: 'liabilitas', label: '2. Liabilitas' },
            { id: 'ekuitas', label: '3. Ekuitas' },
            { id: 'pendapatan', label: '4. Pendapatan' },
            { id: 'beban', label: '5. Beban / HPP' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                soundFx.playClick();
                setActiveTypeFilter(tab.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTypeFilter === tab.id
                  ? 'bg-blue-600 dark:bg-[#0984E3] text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-[#1E1F22] text-slate-600 dark:text-[#DBDEE1] hover:bg-slate-200 dark:hover:bg-[#383A40]'
              }`}
            >
              {tab.label}
            </button>
          ))}

          {(activeTypeFilter !== 'all' || searchTerm) && (
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveTypeFilter('all');
                setSearchTerm('');
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-200/80 dark:bg-[#383A40] text-slate-700 dark:text-slate-200 dark:text-slate-200 text-xs font-semibold hover:bg-slate-300"
              title="Reset Filter (Ctrl + Shift + F)"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Search */}
        <div className="flex items-center bg-slate-100 dark:bg-[#1E1F22] rounded-xl px-3 py-1.5 w-full md:w-64 border border-slate-200 dark:border-[#3F4147]">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari kode / nama akun..."
            className="bg-transparent text-xs w-full outline-none text-slate-800 dark:text-[#F2F3F5]"
          />
        </div>
      </div>

      {/* Accounts Table */}
      <div className="glass-card rounded-2xl overflow-hidden bg-white dark:bg-[#2B2D31] border border-slate-200 dark:border-[#3F4147]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#1E1F22] border-b border-slate-200 dark:border-[#3F4147] text-[11px] font-black text-slate-500 dark:text-[#B5BAC1] uppercase tracking-wider">
                <th className="py-3 px-4">Kode</th>
                <th className="py-3 px-4">Nama Akun</th>
                <th className="py-3 px-4">Kategori Utama</th>
                <th className="py-3 px-4">Sub-Tipe</th>
                <th className="py-3 px-4 text-center">Posisi Normal</th>
                <th className="py-3 px-4 text-right">Saldo Berjalan</th>
                <th className="py-3 px-4 text-center">Aksi / Drilldown</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#3F4147]">
              {filteredAccounts.map((acc) => {
                const balance = balanceMap.get(acc.id) || 0;
                return (
                  <tr
                    key={acc.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-[#383A40]/40 transition-colors group cursor-pointer"
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedDrilldownAccount(acc);
                    }}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {acc.code}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {acc.name}
                      </div>
                      {acc.description && (
                        <p className="text-[10px] text-slate-400 dark:text-[#80848E] mt-0.5">{acc.description}</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                          acc.type === 'aset'
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                            : acc.type === 'liabilitas'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                            : acc.type === 'ekuitas'
                            ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                            : acc.type === 'pendapatan'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {acc.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px] font-bold text-slate-600 dark:text-[#DBDEE1]">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1E1F22] border border-slate-200 dark:border-[#3F4147]">
                        {formatSubType(acc.subType)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-[#80848E]">
                        {acc.normalBalance}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900 dark:text-white tabular-nums">
                      {formatIDR(balance)}
                    </td>
                    <td
                      className="py-3 px-4 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            soundFx.playClick();
                            setSelectedDrilldownAccount(acc);
                          }}
                          className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                          title="Buka Buku Besar (T-Account)"
                        >
                          <History className="w-5 h-5" />
                        </button>
                        {acc.isSystem ? (
                          <span title="Akun sistem tidak dapat dihapus" className="text-slate-300">
                            <Lock className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <button
                            onClick={() => handleDelete(acc.id)}
                            className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50"
                            title="Hapus akun"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Account Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Akun Baru (Chart of Accounts)"
        subtitle="Buat akun buku besar baru untuk mencatat mutasi jurnal double-entry"
      >
        <form onSubmit={handleCreateAccount} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 dark:text-slate-300 mb-1">
                Kode Akun (Contoh: 1106, 6105) *
              </label>
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="1106"
                required
                className="w-full px-3 py-2 text-xs rounded-xl glass-input font-mono font-bold dark:bg-[#1E1F22] dark:border-[#3F4147] dark:text-[#DBDEE1]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 dark:text-slate-300 mb-1">
                Kategori Utama Akun *
              </label>
              <select
                value={newType}
                onChange={(e) => handleTypeChange(e.target.value as AccountType)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input font-bold dark:bg-[#1E1F22] dark:border-[#3F4147] dark:text-[#DBDEE1]"
              >
                <option value="aset">1. Aset</option>
                <option value="liabilitas">2. Liabilitas</option>
                <option value="ekuitas">3. Ekuitas</option>
                <option value="pendapatan">4. Pendapatan</option>
                <option value="beban">5. Beban</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 dark:text-slate-300 mb-1">
              Nama Akun *
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Kas Kecil Cabang Jakarta"
              required
              className="w-full px-3 py-2 text-xs rounded-xl glass-input font-bold dark:bg-[#1E1F22] dark:border-[#3F4147] dark:text-[#DBDEE1]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 dark:text-slate-300 mb-1">
                Sub-Tipe Akun *
              </label>
              <select
                value={newSubType}
                onChange={(e) => setNewSubType(e.target.value as AccountSubType)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input font-bold dark:bg-[#1E1F22] dark:border-[#3F4147] dark:text-[#DBDEE1]"
              >
                {newType === 'aset' && (
                  <>
                    <option value="aset_lancar">Aset Lancar</option>
                    <option value="aset_tetap">Aset Tetap</option>
                  </>
                )}
                {newType === 'liabilitas' && (
                  <>
                    <option value="liabilitas_lancar">Liabilitas Lancar</option>
                    <option value="liabilitas_jangka_panjang">Liabilitas Jangka Panjang</option>
                  </>
                )}
                {newType === 'ekuitas' && (
                  <>
                    <option value="ekuitas_modal">Modal Pemilik</option>
                    <option value="ekuitas_laba_ditahan">Laba Ditahan</option>
                  </>
                )}
                {newType === 'pendapatan' && (
                  <>
                    <option value="pendapatan_usaha">Pendapatan Usaha</option>
                    <option value="pendapatan_lain">Pendapatan Lain-lain</option>
                  </>
                )}
                {newType === 'beban' && (
                  <>
                    <option value="hpp">Harga Pokok Penjualan (HPP)</option>
                    <option value="beban_operasional">Beban Operasional</option>
                    <option value="beban_lain">Beban Lain-lain</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 dark:text-slate-300 mb-1">
                Posisi Saldo Normal
              </label>
              <select
                value={newNormalBalance}
                onChange={(e) => setNewNormalBalance(e.target.value as 'debit' | 'kredit')}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input uppercase font-bold dark:bg-[#1E1F22] dark:border-[#3F4147] dark:text-[#DBDEE1]"
              >
                <option value="debit">DEBIT</option>
                <option value="kredit">KREDIT</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25"
            >
              Simpan Akun
            </button>
          </div>
        </form>
      </Modal>

      {/* Ledger Drilldown Drawer */}
      <LedgerDrilldownDrawer
        isOpen={!!selectedDrilldownAccount}
        onClose={() => setSelectedDrilldownAccount(null)}
        account={selectedDrilldownAccount}
        journalEntries={journalEntries}
      />
    </div>
  );
};
