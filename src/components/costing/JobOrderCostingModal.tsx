import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  CheckCircle2,
  Package,
  Wrench,
  Cpu,
  TrendingUp,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
import { AppState, store } from '../../lib/storage';
import {
  DEMO_JOB_ORDERS,
  calculateJobCost,
  generateJobCompletionJournal,
  JobOrderCostSheet,
} from '../../lib/costAccountingEngine';
import { formatIDR } from '../../lib/accountingEngine';
import { Modal } from '../common/Modal';
import { soundFx } from '../../lib/soundFx';

interface JobOrderCostingModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
}

export const JobOrderCostingModal: React.FC<JobOrderCostingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedJob, setSelectedJob] = useState<JobOrderCostSheet>(DEMO_JOB_ORDERS[0]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const cost = calculateJobCost(selectedJob);

  const handlePostCompletion = () => {
    soundFx.playChaChing();
    const res = generateJobCompletionJournal(selectedJob);
    (store as any).state.journalEntries.push(res.journalEntry);
    (store as any).notify();
    setSuccessMessage(
      `Jurnal Penyelesaian Produksi Job Order ${selectedJob.jobCode} sebesar ${formatIDR(res.summary.totalManufacturingCost)} berhasil diposting ke Akun 1104 Persediaan Barang Jadi!`
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="💼 Akuntansi Biaya Manufaktur & Job-Order Costing (HPP Produksi)"
      maxWidth="max-w-5xl"
    >
      <div className="space-y-6">
        {/* Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-indigo-500/20">
          <div>
            <div className="text-[11px] font-black uppercase tracking-wider text-blue-200">
              Activity-Based & Job-Order Costing Engine
            </div>
            <div className="text-xl sm:text-2xl font-black mt-0.5">
              Alokasi Biaya Bahan Baku, Tenaga Kerja & Overhead (FOH)
            </div>
            <p className="text-xs text-blue-100 mt-1 max-w-xl">
              Perhitungan Harga Pokok Produksi (HPP) per pesanan khusus untuk memastikan margin kotor akurat dan tidak terjadi subsidi silang biaya antar pesanan.
            </p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-right">
            <div className="text-[10px] font-bold uppercase text-blue-200">Total HPP Pesanan</div>
            <div className="text-2xl font-black tabular-nums">{formatIDR(cost.totalManufacturingCost)}</div>
            <div className="text-[10px] font-bold text-emerald-300">
              HPP per Unit: {formatIDR(cost.unitCost)} ({selectedJob.targetQuantity} Unit)
            </div>
          </div>
        </div>

        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Job selector tabs */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-[#3F4147] pb-2">
          {DEMO_JOB_ORDERS.map((j) => (
            <button
              key={j.jobId}
              onClick={() => {
                soundFx.playClick();
                setSelectedJob(j);
                setSuccessMessage(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                selectedJob.jobId === j.jobId
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-[#2B2D31] text-slate-600 dark:text-slate-300'
              }`}
            >
              {j.jobCode}: {j.productName.slice(0, 35)}...
            </button>
          ))}
        </div>

        {/* 3 Pillars of Cost */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Direct Materials */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#2B2D31] border border-slate-200/80 dark:border-[#3F4147] space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase">
                  1. Bahan Baku Langsung
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">Direct Materials (DM)</span>
              </div>
            </div>
            <div className="space-y-1.5 text-xs">
              {selectedJob.directMaterials.map((m, idx) => (
                <div key={idx} className="flex justify-between pl-2 text-slate-600 dark:text-slate-300 text-[11px]">
                  <span>{m.description} ({m.qty}x)</span>
                  <span className="font-mono tabular-nums">{formatIDR(m.totalCost)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold border-t border-slate-200 dark:border-[#3F4147] pt-2 text-blue-600 dark:text-blue-400">
                <span>Subtotal Bahan Baku</span>
                <span className="font-mono tabular-nums">{formatIDR(cost.totalDirectMaterial)}</span>
              </div>
            </div>
          </div>

          {/* Direct Labor */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#2B2D31] border border-slate-200/80 dark:border-[#3F4147] space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase">
                  2. Tenaga Kerja Langsung
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">Direct Labor (DL)</span>
              </div>
            </div>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Total Jam Kerja Staf:</span>
                <span className="font-bold tabular-nums">{selectedJob.directLaborHours} Jam</span>
              </div>
              <div className="flex justify-between">
                <span>Tarif Upah per Jam:</span>
                <span className="font-bold tabular-nums">{formatIDR(selectedJob.laborRatePerHour)}/jam</span>
              </div>
              <div className="flex justify-between font-bold border-t border-slate-200 dark:border-[#3F4147] pt-2 text-emerald-600 dark:text-emerald-400">
                <span>Subtotal Upah Langsung</span>
                <span className="font-mono tabular-nums">{formatIDR(cost.totalDirectLabor)}</span>
              </div>
            </div>
          </div>

          {/* Factory Overhead (FOH) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#2B2D31] border border-slate-200/80 dark:border-[#3F4147] space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase">
                  3. Overhead Pabrik (FOH)
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">Applied Overhead</span>
              </div>
            </div>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Penggunaan Jam Mesin:</span>
                <span className="font-bold tabular-nums">{selectedJob.machineHours} Jam Mesin</span>
              </div>
              <div className="flex justify-between">
                <span>Tarif Overhead Pabrik:</span>
                <span className="font-bold tabular-nums">{formatIDR(selectedJob.predeterminedOverheadRate)}/jam</span>
              </div>
              <div className="flex justify-between font-bold border-t border-slate-200 dark:border-[#3F4147] pt-2 text-purple-600 dark:text-purple-400">
                <span>Subtotal Biaya FOH</span>
                <span className="font-mono tabular-nums">{formatIDR(cost.totalAppliedOverhead)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Strategy & Gross Margin Calculator */}
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs font-black text-emerald-900 dark:text-emerald-300 uppercase">
              Rekomendasi Harga Jual & Profit Margin (Target Markup 40%)
            </div>
            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
              HPP Pokok: {formatIDR(cost.unitCost)} / unit ➔ Harga Jual Rekomendasi: <strong>{formatIDR(cost.suggestedSellingPrice)}</strong> / unit ({cost.grossMarginPct}% Gross Margin).
            </div>
          </div>

          <button
            type="button"
            onClick={handlePostCompletion}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Posting Jurnal Penyelesaian ({formatIDR(cost.totalManufacturingCost)})</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
