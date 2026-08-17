import React, { useState } from 'react';
import {
  Building2,
  Receipt,
  Clock,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  AlertCircle,
} from 'lucide-react';
import { AppState } from '../../lib/storage';
import {
  formatIDR,
  calculateAgingBuckets,
  generateBalanceSheet,
} from '../../lib/accountingEngine';
import { Modal } from '../common/Modal';
import { Tooltip } from '../common/Tooltip';
import { soundFx } from '../../lib/soundFx';
import { CurrencyInput } from '../common/CurrencyInput';
import { useStore } from '../../lib/storage';

interface ArapViewProps {
  onReceiveInvoicePayment: (data: {
    invoiceId: string;
    date: string;
    amount: number;
    paymentAccountId: string;
    notes?: string;
  }) => { success: boolean; error?: string };
  onPayPurchaseBill: (data: {
    billId: string;
    date: string;
    amount: number;
    paymentAccountId: string;
    notes?: string;
  }) => { success: boolean; error?: string };
}

export const ArapView: React.FC<ArapViewProps> = ({
  onReceiveInvoicePayment,
  onPayPurchaseBill,
}) => {
  const invoices = useStore(s => s.invoices);
  const purchaseBills = useStore(s => s.purchaseBills);
  const accounts = useStore(s => s.accounts);
  const journalEntries = useStore(s => s.journalEntries);
  const contacts = useStore(s => s.contacts);

  const [activeModule, setActiveModule] = useState<'ar' | 'ap'>('ar');
  const [selectedAgingBucket, setSelectedAgingBucket] = useState<string>('all');

  // Settlement modal state
  const [settlingInvoice, setSettlingInvoice] = useState<any | null>(null);
  const [settlingBill, setSettlingBill] = useState<any | null>(null);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentAccountId, setPaymentAccountId] = useState('acc-1102'); // Bank BCA default
  const [paymentNotes, setPaymentNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Compute live aging buckets
  const arItems = invoices.map((i) => ({
    id: i.id,
    refNumber: i.invoiceNumber,
    contactName: i.contactName,
    date: i.date,
    dueDate: i.dueDate,
    total: i.total,
    paidAmount: i.paidAmount,
    remainingAmount: i.remainingAmount,
    status: i.status,
  }));
  const arBuckets = calculateAgingBuckets(arItems);
  const totalAR = arBuckets.reduce((sum, b) => sum + b.amount, 0);

  const apItems = purchaseBills.map((b) => ({
    id: b.id,
    refNumber: b.billNumber,
    contactName: b.contactName,
    date: b.date,
    dueDate: b.dueDate,
    total: b.total,
    paidAmount: b.paidAmount,
    remainingAmount: b.remainingAmount,
    status: b.status,
  }));
  const apBuckets = calculateAgingBuckets(apItems);
  const totalAP = apBuckets.reduce((sum, b) => sum + b.amount, 0);

  // Cross verification check with balance sheet
  const balanceSheet = generateBalanceSheet(accounts, journalEntries);
  const bsAR = balanceSheet.currentAssets.find((a) => a.accountCode === '1103')?.amount || 0;
  const bsAP = balanceSheet.currentLiabilities.find((a) => a.accountCode === '2101')?.amount || 0;

  const isARVerified = Math.abs(totalAR - bsAR) < 0.01;
  const isAPVerified = Math.abs(totalAP - bsAP) < 0.01;
  const isVerified = activeModule === 'ar' ? isARVerified : isAPVerified;

  const currentBuckets = activeModule === 'ar' ? arBuckets : apBuckets;
  const grandTotal = activeModule === 'ar' ? totalAR : totalAP;

  // Filter items by bucket
  const displayedItems = selectedAgingBucket === 'all'
    ? currentBuckets.flatMap((b) => b.items)
    : currentBuckets.find((b) => b.bucketName === selectedAgingBucket)?.items || [];

  
  const handleSendWhatsAppReminder = (item: any) => {
    soundFx.playClick();
    const contact = contacts.find((c) => c.name.toLowerCase() === item.contactName.toLowerCase());
    const phone = contact?.phone ? contact.phone.replace(/[^0-9]/g, '') : '';
    const cleanPhone = phone.startsWith('0') ? '62' + phone.substring(1) : phone;
    const msg = encodeURIComponent(
      `Halo ${item.contactName}, ini adalah pengingat dari Manajemen Toko mengenai Faktur ${item.refNumber} senilai ${formatIDR(item.remainingAmount)} yang telah jatuh tempo pada ${item.dueDate}. Mohon konfirmasi jadwal pembayarannya. Terima kasih.`
    );
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${msg}` : `https://wa.me/?text=${msg}`;
    window.open(url, '_blank');
  };

  const handleOpenSettleInvoice = (item: any) => {
    setSettlingInvoice(item);
    setPaymentAmount(item.remainingAmount);
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentNotes(`Pelunasan Faktur ${item.refNumber}`);
    setErrorMessage(null);
  };

  const handleOpenSettleBill = (item: any) => {
    setSettlingBill(item);
    setPaymentAmount(item.remainingAmount);
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentNotes(`Pembayaran Tagihan Supplier ${item.refNumber}`);
    setErrorMessage(null);
  };

  const handleSubmitInvoiceSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlingInvoice) return;
    const res = onReceiveInvoicePayment({
      invoiceId: settlingInvoice.id,
      date: paymentDate,
      amount: Number(paymentAmount),
      paymentAccountId,
      notes: paymentNotes,
    });
    if (!res.success) {
      setErrorMessage(res.error || 'Gagal mencatat pelunasan piutang');
    } else {
      setSettlingInvoice(null);
    }
  };

  const handleSubmitBillSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlingBill) return;
    const res = onPayPurchaseBill({
      billId: settlingBill.id,
      date: paymentDate,
      amount: Number(paymentAmount),
      paymentAccountId,
      notes: paymentNotes,
    });
    if (!res.success) {
      setErrorMessage(res.error || 'Gagal mencatat pembayaran hutang');
    } else {
      setSettlingBill(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header with Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Piutang & Hutang Usaha (AR & AP Aging)
            </h1>
            <Tooltip
              title="Analisa Umur Piutang & Hutang"
              content="Metode pengendalian arus kas dengan membagi tagihan pelanggan (AR) dan kewajiban pemasok (AP) ke dalam rentang umur 0-30, 31-60, 61-90, dan >90 hari guna mendeteksi potensi kredit macet secara dini."
              iconOnly
            />
          </div>
          <p className="text-sm text-slate-500 dark:text-[#B5BAC1] dark:text-[#B5BAC1] mt-1">
            Analisa umur piutang pelanggan dan jadwal jatuh tempo tagihan pemasok dengan validasi silang Neraca.
          </p>
        </div>

        {/* Module Switcher */}
        <div className="flex items-center bg-slate-200/80 dark:bg-[#1E1F22] p-1 rounded-xl border border-slate-300 dark:border-[#3F4147] self-start sm:self-auto">
          <button
            onClick={() => {
              setActiveModule('ar');
              setSelectedAgingBucket('all');
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
              activeModule === 'ar'
                ? 'bg-blue-600 dark:bg-[#0984E3] text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-200 dark:text-[#DBDEE1] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Piutang Usaha (AR)</span>
          </button>
          <button
            onClick={() => {
              setActiveModule('ap');
              setSelectedAgingBucket('all');
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
              activeModule === 'ap'
                ? 'bg-blue-600 dark:bg-[#0984E3] text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-200 dark:text-[#DBDEE1] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Hutang Usaha (AP)</span>
          </button>
        </div>
      </div>

      {/* Cross-Verification Banner */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#2B2D31] border border-slate-200 dark:border-[#3F4147] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
            isVerified
              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
          }`}>
            {isVerified ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
          </div>
          <div>
            <p className="text-xs font-black text-slate-900 dark:text-white">
              Validasi Silang Neraca (Cross-Verification Guaranteed)
            </p>
            <p className="text-[11px] text-slate-500 dark:text-[#B5BAC1] dark:text-[#B5BAC1]">
              Total {activeModule === 'ar' ? 'Piutang' : 'Hutang'} Aging: <strong className="text-slate-900 dark:text-white">{formatIDR(grandTotal)}</strong> ≡ Saldo Akun Neraca ({activeModule === 'ar' ? '1103' : '2101'}): <strong className="text-slate-900 dark:text-white">{formatIDR(activeModule === 'ar' ? bsAR : bsAP)}</strong>
            </p>
          </div>
        </div>

        <span className={`text-xs font-black px-3 py-1 rounded-full self-start sm:self-auto border ${
          isVerified
            ? 'text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800'
            : 'text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800'
        }`}>
          {isVerified ? '100% Cocok & Seimbang' : 'Selisih Ditemukan'}
        </span>
      </div>

      {/* 5 Aging Buckets Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {currentBuckets.map((bucket) => {
          const isSelected = selectedAgingBucket === bucket.bucketName;
          const percentage = grandTotal > 0 ? Math.round((bucket.amount / grandTotal) * 100) : 0;

          return (
            <button
              key={bucket.bucketName}
              onClick={() =>
                setSelectedAgingBucket(isSelected ? 'all' : bucket.bucketName)
              }
              className={`p-4 rounded-2xl text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-600 dark:bg-[#0984E3] text-white shadow-lg shadow-blue-600/25 ring-2 ring-blue-600 dark:ring-[#0984E3]'
                  : 'bg-white dark:bg-[#2B2D31] border border-slate-200 dark:border-[#3F4147] hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div>
                <span
                  className={`text-[10px] font-black uppercase tracking-wider block mb-1 ${
                    isSelected ? 'text-blue-100' : 'text-slate-400 dark:text-[#80848E]'
                  }`}
                >
                  {bucket.label}
                </span>
                <p
                  className={`text-sm sm:text-base font-black tabular-nums ${
                    isSelected ? 'text-white' : bucket.amount > 0 ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'
                  }`}
                >
                  {formatIDR(bucket.amount)}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] font-bold">
                <span className={isSelected ? 'text-blue-200' : 'text-slate-500 dark:text-[#B5BAC1] dark:text-[#B5BAC1]'}>
                  {bucket.count} faktur
                </span>
                <span className={isSelected ? 'text-blue-100' : 'text-blue-600 dark:text-blue-400 font-black'}>
                  {percentage}%
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Table of Open Items for Aging */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Daftar Faktur {activeModule === 'ar' ? 'Piutang' : 'Hutang'} Terbuka ({displayedItems.length} transaksi)
          </h3>

          {selectedAgingBucket !== 'all' && (
            <button
              onClick={() => setSelectedAgingBucket('all')}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Reset Filter Bucket (Tampilkan Semua)
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 dark:text-[#B5BAC1] uppercase tracking-wider">
                <th className="py-3 px-4">No. Ref</th>
                <th className="py-3 px-4">{activeModule === 'ar' ? 'Pelanggan' : 'Pemasok / Vendor'}</th>
                <th className="py-3 px-4">Tanggal Transaksi</th>
                <th className="py-3 px-4">Jatuh Tempo</th>
                <th className="py-3 px-4 text-center">Hari Keterlambatan</th>
                <th className="py-3 px-4 text-right">Total Faktur</th>
                <th className="py-3 px-4 text-right">Sisa Tagihan</th>
                <th className="py-3 px-4 text-center">Pelunasan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ada tagihan terbuka pada kelompok umur ini.
                  </td>
                </tr>
              ) : (
                displayedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">{item.refNumber}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{item.contactName}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-[#B5BAC1]">{item.date}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-[#B5BAC1]">{item.dueDate}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          Number.isNaN(item.daysOverdue) || item.daysOverdue === 0
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : item.daysOverdue <= 30
                            ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                            : item.daysOverdue <= 60
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 animate-pulse'
                        }`}
                      >
                        {Number.isNaN(item.daysOverdue) || item.daysOverdue === 0 ? 'Belum Jatuh Tempo' : `Lewat ${item.daysOverdue} Hari`}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-slate-500 dark:text-[#B5BAC1]">
                      {formatIDR(item.total)}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-rose-600 tabular-nums">
                      {formatIDR(item.remainingAmount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() =>
                          activeModule === 'ar'
                            ? handleOpenSettleInvoice(item)
                            : handleOpenSettleBill(item)
                        }
                        className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors border border-blue-200"
                      >
                        {activeModule === 'ar' ? 'Terima Bayar' : 'Bayar Hutang'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AR Invoice Settlement Modal */}
      {settlingInvoice && (
        <Modal
          isOpen={!!settlingInvoice}
          onClose={() => setSettlingInvoice(null)}
          title={`Penerimaan Pelunasan Piutang: ${settlingInvoice.refNumber}`}
          subtitle={`Pelanggan: ${settlingInvoice.contactName} • Sisa Tagihan: ${formatIDR(settlingInvoice.remainingAmount)}`}
        >
          <form onSubmit={handleSubmitInvoiceSettlement} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Tanggal Penerimaan *
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Rekening Penerimaan (Kas / Bank) *
                </label>
                <select
                  value={paymentAccountId}
                  onChange={(e) => setPaymentAccountId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input font-bold"
                >
                  {accounts
                    .filter((a) => a.code === '1101' || a.code === '1102')
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.code} - {a.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Jumlah Uang yang Diterima (Rp) *
                </label>
                <button 
                  type="button" 
                  onClick={() => setPaymentAmount(settlingInvoice.remainingAmount)} 
                  className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full hover:bg-blue-200 transition-colors"
                >
                  Bayar Lunas
                </button>
              </div>
              <CurrencyInput
                value={paymentAmount || ''}
                onChange={(val) => setPaymentAmount(val === '' ? 0 : Number(val))}
                required
                className="font-bold text-blue-600 dark:text-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Catatan Pembayaran
              </label>
              <input
                type="text"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSettlingInvoice(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25"
              >
                Simpan & Rekonsiliasi Jurnal
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* AP Bill Settlement Modal */}
      {settlingBill && (
        <Modal
          isOpen={!!settlingBill}
          onClose={() => setSettlingBill(null)}
          title={`Pelunasan Tagihan Supplier: ${settlingBill.refNumber}`}
          subtitle={`Vendor: ${settlingBill.contactName} • Sisa Hutang: ${formatIDR(settlingBill.remainingAmount)}`}
        >
          <form onSubmit={handleSubmitBillSettlement} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Tanggal Pembayaran *
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Rekening Pengeluaran (Kas / Bank) *
                </label>
                <select
                  value={paymentAccountId}
                  onChange={(e) => setPaymentAccountId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input font-bold"
                >
                  {accounts
                    .filter((a) => a.code === '1101' || a.code === '1102')
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.code} - {a.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Jumlah Uang yang Dibayarkan (Rp) *
                </label>
                <button 
                  type="button" 
                  onClick={() => setPaymentAmount(settlingBill.remainingAmount)} 
                  className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full hover:bg-emerald-200 transition-colors"
                >
                  Bayar Lunas
                </button>
              </div>
              <CurrencyInput
                value={paymentAmount || ''}
                onChange={(val) => setPaymentAmount(val === '' ? 0 : Number(val))}
                required
                className="font-bold text-emerald-600 dark:text-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Catatan / Bukti Transfer
              </label>
              <input
                type="text"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSettlingBill(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-700/25"
              >
                Simpan & Kurangi Hutang
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
