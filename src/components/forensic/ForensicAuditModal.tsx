import React, { useState } from 'react';
import { SearchCode,
  ShieldCheck,
  AlertOctagon,
  Lock,
  RefreshCw,
  Search,
  CheckCircle2,
  Key,
  Database,
  ExternalLink,
  SlidersHorizontal,
} from 'lucide-react';
import { AppState, store } from '../../lib/storage';
import { formatIDR } from '../../lib/accountingEngine';
import { Modal } from '../common/Modal';
import { soundFx } from '../../lib/soundFx';
import { useStore } from '../../lib/storage';

interface ForensicAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  }

export const ForensicAuditModal: React.FC<ForensicAuditModalProps> = ({
  isOpen,
  onClose,
}) => {

  const [isVerifying, setIsVerifying] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const chain = store.getHashChain();
  const integrity = store.verifyLedgerIntegrity();

  const handleRunVerification = () => {
    setIsVerifying(true);
    soundFx.playChime();
    setTimeout(() => {
      setIsVerifying(false);
    }, 600);
  };

  const handleSimulateTamper = () => {
    soundFx.playError();
    store.tamperDemoLedgerEntry();
  };

  const handleRestore = () => {
    soundFx.playChime();
    store.restoreLedgerIntegrity();
  };

  const filteredChain = chain.filter(
    (b) =>
      b.entryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.currentHash.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Forensik Audit Trail & Immutable Ledger SHA-256 Hash Chain" icon={<SearchCode className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
      maxWidth="max-w-5xl"
    >
      <div className="space-y-6">
        {/* Banner verification status */}
        <div
          className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            integrity.isValid
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl ${integrity.isValid ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400'}`}>
              {integrity.isValid ? <ShieldCheck className="w-6 h-6" /> : <AlertOctagon className="w-6 h-6" />}
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider">
                {integrity.isValid ? 'Integritas Buku Besar 100% Terverifikasi' : 'Peringatan Forensik: Anomali Data Terdeteksi!'}
              </div>
              <div className="text-base font-black">
                {integrity.isValid
                  ? `Seluruh ${chain.length} Blok Jurnal Kriptografis Sah & Tidak Pernah Dimanipulasi`
                  : integrity.error}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRunVerification}
              disabled={isVerifying}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black flex items-center gap-1.5 shadow-md transition-all hover:opacity-90 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
              <span>Verifikasi Ulang</span>
            </button>

            {integrity.isValid ? (
              <button
                type="button"
                onClick={handleSimulateTamper}
                className="px-3 py-2 rounded-xl border border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-400 text-xs font-black hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                title="Simulasikan manipulasi angka pada database untuk menguji sistem deteksi forensik"
              >
                Simulasi Tamper (Uji Fraud)
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRestore}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/20"
              >
                Pulihkan Integritas
              </button>
            )}
          </div>
        </div>

        {/* Search bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari berdasarkan No. Jurnal atau SHA-256 Hash..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-[#1E1F22] border border-slate-200 dark:border-[#3F4147] text-slate-800 dark:text-white"
            />
          </div>
          <div className="text-xs font-bold text-slate-400 dark:text-[#B5BAC1]">
            Total Blok Kripto: <span className="text-blue-600 dark:text-blue-400 font-mono font-bold">{chain.length}</span>
          </div>
        </div>

        {/* Chain blocks list */}
        <div className="border border-slate-200 dark:border-[#3F4147] rounded-2xl overflow-hidden">
          <div className="bg-slate-100/80 dark:bg-[#2B2D31] px-4 py-2.5 border-b border-slate-200 dark:border-[#3F4147] grid grid-cols-12 text-[11px] font-black text-slate-600 dark:text-[#DBDEE1] uppercase tracking-wider">
            <span className="col-span-1">Blok #</span>
            <span className="col-span-2">No. Jurnal</span>
            <span className="col-span-2">Tanggal</span>
            <span className="col-span-2 text-right">Nilai Debit</span>
            <span className="col-span-5 text-right">Cryptographic SHA-256 Signature</span>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-[#3F4147] text-xs">
            {filteredChain.map((b) => (
              <div
                key={b.blockIndex}
                className="px-4 py-3 grid grid-cols-12 items-center hover:bg-slate-50 dark:hover:bg-[#383A40] transition-colors"
              >
                <div className="col-span-1 font-mono font-bold text-slate-400">
                  #{b.blockIndex}
                </div>
                <div className="col-span-2 font-mono font-bold text-blue-600 dark:text-blue-400">
                  {b.entryNumber}
                </div>
                <div className="col-span-2 text-slate-600 dark:text-[#B5BAC1]">
                  {b.date}
                </div>
                <div className="col-span-2 text-right font-black font-mono tabular-nums text-slate-800 dark:text-white">
                  {formatIDR(b.amount)}
                </div>
                <div className="col-span-5 text-right font-mono text-[10px] space-y-0.5">
                  <div className="text-slate-400 truncate" title={`Prev: ${b.previousHash}`}>
                    Prev: {b.previousHash.slice(0, 16)}...
                  </div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-bold truncate" title={`Hash: ${b.currentHash}`}>
                    Hash: {b.currentHash.slice(0, 24)}...
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-200 dark:border-[#3F4147] pt-2">
          <div className="flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5" />
            <span>Setiap voucher jurnal terikat secara matematis dengan algoritma kriptografi SHA-256 standar NIST FIPS 180-4.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-black shadow-md"
          >
            Tutup Panel Forensik
          </button>
        </div>
      </div>
    </Modal>
  );
};
