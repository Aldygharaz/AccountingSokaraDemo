import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Calculator,
  Calendar,
  CheckCircle2,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { AppState } from '../../lib/storage';
import { FixedAsset } from '../../types/accounting';
import { formatIDR } from '../../lib/accountingEngine';
import {
  calculateMonthlyDepreciation,
  generateDepreciationSchedule,
} from '../../lib/assetEngine';
import { soundFx } from '../../lib/soundFx';
import { PokaYokeModal } from '../ui/PokaYokeModal';

interface FixedAssetsViewProps {
  state: AppState;
  onPostDepreciation: (assetId: string, date: string) => { success: boolean; error?: string };
}

export const FixedAssetsView: React.FC<FixedAssetsViewProps> = ({
  state,
  onPostDepreciation,
}) => {
  const [selectedAsset, setSelectedAsset] = useState<FixedAsset | null>(state.fixedAssets[0] || null);
  const [postDate, setPostDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleExecuteDepreciation = (asset: FixedAsset) => {
    soundFx.playAutoFix();
    const res = onPostDepreciation(asset.id, postDate);
    if (!res.success) {
      soundFx.playError();
      alert(res.error);
    } else {
      soundFx.playChaChing();
    }
  };

  const schedule = selectedAsset ? generateDepreciationSchedule(selectedAsset, 12) : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Aset Tetap & Jadwal Penyusutan Garis Lurus
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manajemen aktiva tetap, kalkulasi depresiasi bulanan otomatis, dan pembukuan jurnal akumulasi.
          </p>
        </div>
        <button
          onClick={() => {
            soundFx.playClick();
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Aset</span>
        </button>
      </div>

      <PokaYokeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        anomaly={{
          id: 'dev_info',
          type: 'destructive_action',
          title: "Dalam Pengembangan",
          description: "Fitur penambahan Aset Tetap baru akan tersedia pada rilis versi berikutnya (v2.0).",
          impact: "Tidak ada data yang diubah.",
          recommendedAction: "Harap bersabar menunggu update berikutnya.",
          autoFixLabel: 'Mengerti',
          onAutoFix: () => setIsAddModalOpen(false),
        }}
      />

      {/* Assets Grid Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1E1F22]">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Daftar Aktiva Tetap Toko ({state.fixedAssets.length} unit)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-[#1E1F22] border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 uppercase">
                <th className="py-3 px-4">Kode / Nama Aset</th>
                <th className="py-3 px-4">Tanggal Beli</th>
                <th className="py-3 px-4 text-right">Harga Perolehan</th>
                <th className="py-3 px-4 text-right">Nilai Residu</th>
                <th className="py-3 px-4 text-center">Masa Manfaat</th>
                <th className="py-3 px-4 text-right">Penyusutan / Bln</th>
                <th className="py-3 px-4 text-right">Nilai Buku (NBV)</th>
                <th className="py-3 px-4 text-center">Posting Jurnal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {state.fixedAssets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 dark:text-[#B5BAC1]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full">
                        <Building2 className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="font-bold text-slate-600 dark:text-slate-300">Belum ada aset tetap</p>
                      <p className="text-xs">Klik "Tambah Aset" untuk mulai mencatat.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                state.fixedAssets.map((asset) => {
                  const monthly = calculateMonthlyDepreciation(asset);
                const isSelected = selectedAsset?.id === asset.id;

                return (
                  <tr
                    key={asset.id}
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedAsset(asset);
                    }}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50/80 dark:bg-blue-950/40'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                        {asset.code}
                      </span>
                      <p className="font-bold text-slate-900 dark:text-white mt-0.5">{asset.name}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{asset.acquisitionDate}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      {formatIDR(asset.acquisitionCost)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-500 tabular-nums">
                      {formatIDR(asset.salvageValue)}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                      {asset.usefulLifeMonths} Bulan ({asset.usefulLifeMonths / 12} Thn)
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-600 tabular-nums">
                      {formatIDR(monthly)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-emerald-600 tabular-nums">
                      {formatIDR(asset.netBookValue)}
                    </td>
                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleExecuteDepreciation(asset)}
                        className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
                      >
                        Post Depresiasi
                      </button>
                    </td>
                  </tr>
                );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Preview for Selected Asset */}
      {selectedAsset && (
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Proyeksi Jadwal Depresiasi 12 Bulan: {selectedAsset.name}
              </h3>
              <p className="text-xs text-slate-500">
                Metode Garis Lurus: Beban Bulanan = (Harga Perolehan - Residu) / {selectedAsset.usefulLifeMonths} Bulan
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400">Penyusutan Bulanan</span>
              <div className="text-lg font-black text-rose-600">
                {formatIDR(calculateMonthlyDepreciation(selectedAsset))} / bln
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {schedule.slice(0, 12).map((s) => (
              <div
                key={s.monthIndex}
                className="p-3 rounded-xl bg-slate-50 dark:bg-[#1E1F22] border border-slate-200 dark:border-slate-700 text-xs"
              >
                <span className="text-[10px] font-bold text-slate-400">Bulan #{s.monthIndex}</span>
                <p className="font-bold text-slate-900 dark:text-white mt-1">{s.date}</p>
                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 space-y-0.5">
                  <div className="text-[11px] text-slate-500">
                    Akumulasi: <strong className="text-slate-800 dark:text-slate-200">{formatIDR(s.accumulated)}</strong>
                  </div>
                  <div className="text-[11px] text-emerald-600 font-bold">
                    Nilai Buku: {formatIDR(s.netBookValue)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
