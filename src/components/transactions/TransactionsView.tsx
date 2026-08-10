import React, { useState } from 'react';
import { User,
  Receipt,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Building2,
  DollarSign,
  Calendar,
  XCircle,
  Printer,
  Info,
} from 'lucide-react';
import { CurrencyInput } from '../common/CurrencyInput';
import { SalesInvoice, PurchaseBill, CashTransaction, JournalEntry, UserSession } from '../../types/accounting';
import { AppState } from '../../lib/storage';
import { formatIDR, validateJournalBalance } from '../../lib/accountingEngine';
import { Modal } from '../common/Modal';
import { Tooltip } from '../common/Tooltip';
import { PokaYokeModal } from '../ui/PokaYokeModal';

interface TransactionsViewProps {
  currentUser: UserSession;
  activeSubTab?: 'invoices' | 'bills' | 'cash' | 'journals';
  onCreateInvoice: (data: any) => { success: boolean; error?: string };
  onCreateBill: (data: any) => { success: boolean; error?: string };
  onCreateCashTx: (data: any) => { success: boolean; error?: string };
  onVoidInvoice: (id: string) => { success: boolean; error?: string };
}


import { useVirtualizer } from '@tanstack/react-virtual';
import { useStore } from '../../lib/storage';

const VirtualJournalList = ({ journals, accounts }: { journals: any[], accounts: any[] }) => {
  const parentRef = React.useRef(null);

  const virtualizer = useVirtualizer({
    count: journals.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 250,
    overscan: 3,
  });

  return (
    <div ref={parentRef} style={{ height: '70vh', overflow: 'auto' }} className="space-y-6 pr-2">
      <div style={{ height: `${virtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const je = journals[virtualRow.index];
          return (
            <div
              key={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div
                className={`bg-white dark:bg-[#2B2D31] border ${
                  je.isVoided
                    ? 'border-rose-200 dark:border-rose-900/50 opacity-75'
                    : 'border-slate-200 dark:border-[#3F4147]'
                } rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow mb-4`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-black text-slate-900 dark:text-[#F2F3F5]">{je.entryNumber}</h3>
                      {je.isVoided && (
                        <span className="bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                          Dibatalkan / Void
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-[#B5BAC1] dark:text-[#B5BAC1]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {je.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" /> {je.createdBy}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-500 dark:text-[#B5BAC1] dark:text-[#B5BAC1] uppercase tracking-wider mb-1">
                      Total Mutasi
                    </div>
                    <div className="font-mono font-black text-lg text-slate-900 dark:text-white">
                      {formatIDR(je.totalDebit)}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-600 dark:text-[#DBDEE1] mb-4 bg-slate-50 dark:bg-[#1E1F22] p-3 rounded-lg border border-slate-100 dark:border-[#3F4147]">
                  {je.description}
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-[10px] font-bold text-slate-400 dark:text-[#B5BAC1] uppercase">
                        <th className="py-1 px-3">Kode & Akun Buku Besar</th>
                        <th className="py-1 px-3">Memo Baris</th>
                        <th className="py-1 px-3 text-right">Debit</th>
                        <th className="py-1 px-3 text-right">Kredit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#3F4147]">
                      {je.lines.map((l: any) => {
                        const acc = accounts.find((a: any) => a.id === l.accountId);
                        return (
                          <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-[#2B2D31]">
                            <td className="py-2 px-3">
                              <div className="font-bold text-slate-700 dark:text-slate-200 dark:text-[#F2F3F5]">{acc?.code}</div>
                              <div className="text-[10px] text-slate-500 dark:text-[#B5BAC1] dark:text-[#B5BAC1]">{acc?.name}</div>
                            </td>
                            <td className="py-2 px-3 text-slate-600 dark:text-[#DBDEE1] max-w-[200px] truncate" title={l.memo}>
                              {l.memo || '-'}
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-slate-700 dark:text-slate-200 dark:text-[#DBDEE1]">
                              {l.debit > 0 ? formatIDR(l.debit) : ''}
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-slate-700 dark:text-slate-200 dark:text-[#DBDEE1]">
                              {l.kredit > 0 ? formatIDR(l.kredit) : ''}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  currentUser,
  activeSubTab = 'invoices',
  onCreateInvoice,
  onCreateBill,
  onCreateCashTx,
  onVoidInvoice,
}) => {
  const contacts = useStore(s => s.contacts);
  const products = useStore(s => s.products);
  const invoices = useStore(s => s.invoices);
  const purchaseBills = useStore(s => s.purchaseBills);
  const cashTransactions = useStore(s => s.cashTransactions);
  const journalEntries = useStore(s => s.journalEntries);
  const accounts = useStore(s => s.accounts);

  const [currentTab, setCurrentTab] = useState<'invoices' | 'bills' | 'cash' | 'journals'>(activeSubTab);

  React.useEffect(() => {
    setCurrentTab(activeSubTab);
  }, [activeSubTab]);

  // Modals state
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [voidInvoiceId, setVoidInvoiceId] = useState<string | null>(null);

  // New Invoice State
  const [invContactId, setInvContactId] = useState(contacts[0]?.id || '');
  const [invDate, setInvDate] = useState(new Date().toISOString().split('T')[0]);
  const [invDueDate, setInvDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [invNotes, setInvNotes] = useState('');
  const [invItems, setInvItems] = useState<
    { productId: string; qty: number; unitPrice: number; isTaxable: boolean }[]
  >([
    {
      productId: products[0]?.id || '',
      qty: 10,
      unitPrice: products[0]?.salePrice || 78000,
      isTaxable: true,
    },
  ]);

  // New Purchase Bill State
  const [billContactId, setBillContactId] = useState(
    contacts.find((c) => c.type === 'vendor' || c.type === 'keduanya')?.id || contacts[0]?.id || ''
  );
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [billDueDate, setBillDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [billNotes, setBillNotes] = useState('');
  const [billItems, setBillItems] = useState<
    { productId: string; qty: number; unitCost: number; isTaxable: boolean }[]
  >([
    {
      productId: products[0]?.id || '',
      qty: 50,
      unitCost: products[0]?.avgCost || 62000,
      isTaxable: true,
    },
  ]);

  // New Cash Tx State
  const [cashType, setCashType] = useState<'masuk' | 'keluar'>('keluar');
  const [cashDate, setCashDate] = useState(new Date().toISOString().split('T')[0]);
  const [cashAccountId, setCashAccountId] = useState('acc-1102'); // Bank BCA default
  const [contraAccountId, setContraAccountId] = useState('acc-6101'); // Beban Gaji
  const [cashCategory, setCashCategory] = useState('Beban Operasional');
  const [cashAmount, setCashAmount] = useState<number>(1500000);
  const [cashDescription, setCashDescription] = useState('');

  // Invoice calculations
  const invoiceSubtotal = invItems.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  const invoiceTax = invItems.reduce(
    (sum, item) => sum + (item.isTaxable ? Math.round(item.qty * item.unitPrice * 0.11) : 0),
    0
  );
  const invoiceTotal = invoiceSubtotal + invoiceTax;

  // Bill calculations
  const billSubtotal = billItems.reduce((sum, item) => sum + item.qty * item.unitCost, 0);
  const billTax = billItems.reduce(
    (sum, item) => sum + (item.isTaxable ? Math.round(item.qty * item.unitCost * 0.11) : 0),
    0
  );
  const billTotal = billSubtotal + billTax;

  const handleAddInvoiceItem = () => {
    const firstProd = products[0];
    setInvItems([
      ...invItems,
      {
        productId: firstProd?.id || '',
        qty: 1,
        unitPrice: firstProd?.salePrice || 10000,
        isTaxable: true,
      },
    ]);
  };

  const handleAddBillItem = () => {
    const firstProd = products[0];
    setBillItems([
      ...billItems,
      {
        productId: firstProd?.id || '',
        qty: 10,
        unitCost: firstProd?.avgCost || 10000,
        isTaxable: true,
      },
    ]);
  };

  const handleSubmitInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const res = onCreateInvoice({
      contactId: invContactId,
      date: invDate,
      dueDate: invDueDate,
      items: invItems,
      notes: invNotes,
    });
    if (!res.success) {
      setErrorMessage(res.error || 'Gagal menyimpan faktur penjualan.');
    } else {
      setIsInvoiceModalOpen(false);
    }
  };

  const handleSubmitBill = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const res = onCreateBill({
      contactId: billContactId,
      date: billDate,
      dueDate: billDueDate,
      items: billItems,
      notes: billNotes,
    });
    if (!res.success) {
      setErrorMessage(res.error || 'Gagal menyimpan tagihan pembelian.');
    } else {
      setIsBillModalOpen(false);
    }
  };

  const handleSubmitCash = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const res = onCreateCashTx({
      date: cashDate,
      type: cashType,
      cashAccountId,
      contraAccountId,
      category: cashCategory,
      amount: Number(cashAmount),
      description: cashDescription,
    });
    if (!res.success) {
      setErrorMessage(res.error || 'Gagal mencatat transaksi kas.');
    } else {
      setIsCashModalOpen(false);
    }
  };

  const handleVoid = (id: string) => {
    setVoidInvoiceId(id);
  };

  const confirmVoid = () => {
    if (voidInvoiceId) {
      const res = onVoidInvoice(voidInvoiceId);
      if (!res.success) {
        setErrorMessage(res.error || 'Gagal membatalkan faktur.');
      } else {
        setVoidInvoiceId(null);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Transaksi & Buku Jurnal Umum
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#B5BAC1] dark:text-[#B5BAC1] mt-1">
            Pencatatan faktur, tagihan, dan mutasi kas yang otomatis menghasilkan entri jurnal seimbang.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setErrorMessage(null);
              setIsInvoiceModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Faktur Penjualan</span>
          </button>
          <button
            onClick={() => {
              setErrorMessage(null);
              setIsBillModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black shadow-md shadow-emerald-700/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tagihan Pembelian</span>
          </button>
          <button
            onClick={() => {
              setErrorMessage(null);
              setIsCashModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#2B2D31] text-slate-800 dark:text-white border border-slate-200 dark:border-[#3F4147] text-xs font-black shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>+ Transaksi Kas</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="glass-card rounded-2xl p-2 flex flex-wrap items-center gap-1.5">
        {[
          { id: 'invoices', label: `Faktur Penjualan (${invoices.length})` },
          { id: 'bills', label: `Tagihan Pembelian (${purchaseBills.length})` },
          { id: 'cash', label: `Transaksi Kas & Bank (${cashTransactions.length})` },
          { id: 'journals', label: `Buku Jurnal Umum (${journalEntries.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              currentTab === tab.id
                ? 'bg-blue-600 dark:bg-[#0984E3] text-white shadow-md'
                : 'text-slate-600 dark:text-[#DBDEE1] hover:bg-slate-100 dark:hover:bg-[#383A40] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Sales Invoices List */}
      {currentTab === 'invoices' && (
        <div className="glass-card rounded-2xl overflow-hidden">
          {invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-[#1E1F22] flex items-center justify-center text-slate-400 dark:text-[#80848E] mb-4">
                <Receipt className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 dark:text-white">Belum Ada Faktur Penjualan</h3>
              <p className="text-xs text-slate-500 dark:text-[#B5BAC1] dark:text-[#B5BAC1] mt-1">Buat faktur pertama Anda untuk mencatat piutang dan penjualan.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#1E1F22] border-b border-slate-200 dark:border-[#3F4147] text-[11px] font-black text-slate-500 dark:text-[#B5BAC1] dark:text-[#B5BAC1] uppercase tracking-wider">
                  <th className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <span>No. Faktur</span>
                      <Tooltip title="Faktur Penjualan" content="Nomor bukti penjualan resmi bernomor urut kronologis yang mencatat piutang dan kewajiban PPN Keluaran." iconOnly />
                    </div>
                  </th>
                  <th className="py-3 px-4">Pelanggan</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Jatuh Tempo</th>
                  <th className="py-3 px-4 text-right">Subtotal</th>
                  <th className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span>PPN 11%</span>
                      <Tooltip title="PPN Keluaran 11%" content="Pajak Pertambahan Nilai 11% yang dipungut dari pelanggan dan wajib disetor ke kas negara (DJP)." iconOnly />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-right">Total Tagihan</th>
                  <th className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span>Status</span>
                      <Tooltip title="Status Faktur" content="Lunas (Sudah bayar penuh), Sebagian (Ada cicilan DP), Belum Bayar (Menunggu pelunasan), Void (Dibatalkan)." iconOnly />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#3F4147]">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-[#383A40] transition-colors">
                    <td className="py-3 px-4 font-mono font-black text-blue-600 dark:text-blue-400">{inv.invoiceNumber}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{inv.contactName}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-[#B5BAC1] dark:text-[#B5BAC1]">{inv.date}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-[#B5BAC1] dark:text-[#B5BAC1]">{inv.dueDate}</td>
                    <td className="py-3 px-4 text-right tabular-nums text-slate-600 dark:text-[#DBDEE1]">
                      {formatIDR(inv.subtotal)}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-slate-600 dark:text-[#DBDEE1]">
                      {formatIDR(inv.taxAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900 dark:text-white tabular-nums">
                      {formatIDR(inv.total)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          inv.status === 'lunas'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : inv.status === 'sebagian'
                            ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                            : inv.status === 'void'
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 line-through'
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {inv.status !== 'void' && currentUser.role === 'admin' && (
                        <button
                          onClick={() => handleVoid(inv.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                          title="Void / Batalkan Faktur (Admin Only)"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>
      )}

      {/* Tab 2: Purchase Bills List */}
      {currentTab === 'bills' && (
        <div className="glass-card rounded-2xl overflow-hidden">
          {purchaseBills.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-[#1E1F22] flex items-center justify-center text-slate-400 dark:text-[#80848E] mb-4">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 dark:text-white">Belum Ada Tagihan Pembelian</h3>
              <p className="text-xs text-slate-500 dark:text-[#B5BAC1] dark:text-[#B5BAC1] mt-1">Catat tagihan dari supplier untuk menambah hutang dan stok.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#1E1F22] border-b border-slate-200 dark:border-[#3F4147] text-[11px] font-black text-slate-500 dark:text-[#B5BAC1] dark:text-[#B5BAC1] uppercase tracking-wider">
                  <th className="py-3 px-4">No. Tagihan</th>
                  <th className="py-3 px-4">Pemasok / Supplier</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Jatuh Tempo</th>
                  <th className="py-3 px-4 text-right">Subtotal</th>
                  <th className="py-3 px-4 text-right">PPN Masukan</th>
                  <th className="py-3 px-4 text-right">Total Hutang</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#3F4147]">
                {purchaseBills.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 dark:hover:bg-[#383A40] transition-colors">
                    <td className="py-3 px-4 font-mono font-black text-emerald-600 dark:text-emerald-400">{b.billNumber}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{b.contactName}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-[#B5BAC1] dark:text-[#B5BAC1]">{b.date}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-[#B5BAC1] dark:text-[#B5BAC1]">{b.dueDate}</td>
                    <td className="py-3 px-4 text-right tabular-nums text-slate-600 dark:text-[#DBDEE1]">
                      {formatIDR(b.subtotal)}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-slate-600 dark:text-[#DBDEE1]">
                      {formatIDR(b.taxAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900 dark:text-white tabular-nums">
                      {formatIDR(b.total)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          b.status === 'lunas'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : b.status === 'sebagian'
                            ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>
      )}

      {/* Tab 3: Direct Cash Transactions */}
      {currentTab === 'cash' && (
        <div className="glass-card rounded-2xl overflow-hidden">
          {cashTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-[#1E1F22] flex items-center justify-center text-slate-400 dark:text-[#80848E] mb-4">
                <DollarSign className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 dark:text-white">Belum Ada Transaksi Kas</h3>
              <p className="text-xs text-slate-500 dark:text-[#B5BAC1] dark:text-[#B5BAC1] mt-1">Catat penerimaan atau pengeluaran kas non-faktur.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-[#1E1F22] border-b border-slate-200 dark:border-[#3F4147] text-[11px] font-bold text-slate-500 dark:text-[#B5BAC1] dark:text-[#B5BAC1] uppercase tracking-wider">
                  <th className="py-3 px-4">No. Transaksi</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Tipe Kas</th>
                  <th className="py-3 px-4">Kategori Transaksi</th>
                  <th className="py-3 px-4">Pihak Terkait</th>
                  <th className="py-3 px-4 text-right">Jumlah Uang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#3F4147]">
                {cashTransactions.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-[#2B2D31] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-[#0984E3]">{c.txNumber}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-[#B5BAC1] dark:text-[#B5BAC1]">{c.date}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-full border uppercase ${
                          c.type === 'masuk'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {c.type === 'masuk' ? 'KAS MASUK (+)' : 'KAS KELUAR (-)'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-200 dark:text-white">{c.category}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-[#DBDEE1]">{c.recipientOrPayer}</td>
                    <td className="py-3 px-4 text-right font-black text-slate-900 dark:text-white tabular-nums">
                      {formatIDR(c.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>
      )}

      {/* Tab 4: General Journals Ledger (Read-Only) */}
      {currentTab === 'journals' && (
        <div className="space-y-4">
          {journalEntries.length === 0 ? (
            <div className="glass-card rounded-2xl overflow-hidden flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-[#1E1F22] flex items-center justify-center text-slate-400 dark:text-[#80848E] mb-4">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 dark:text-white">Belum Ada Entri Jurnal</h3>
              <p className="text-xs text-slate-500 dark:text-[#B5BAC1] dark:text-[#B5BAC1] mt-1">Entri jurnal akan terbuat secara otomatis dari faktur dan tagihan.</p>
            </div>
          ) : (
            <>
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              <span>
                Seluruh <strong>{journalEntries.length} entri jurnal</strong> terverifikasi
                memiliki <strong>Total Debit = Total Kredit</strong>.
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {journalEntries.map((je) => (
              <div key={je.id} className="glass-card rounded-2xl p-4 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-[#3F4147] gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-blue-700 dark:text-[#0984E3] text-sm">
                      {je.entryNumber}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-[#B5BAC1] dark:text-[#B5BAC1]">• {je.date}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1E1F22] text-slate-600 dark:text-[#DBDEE1]">
                      {je.sourceType}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 dark:text-white">
                    {je.description}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-[10px] font-bold text-slate-400 dark:text-[#B5BAC1] uppercase">
                        <th className="py-1 px-3">Kode & Akun Buku Besar</th>
                        <th className="py-1 px-3">Memo Baris</th>
                        <th className="py-1 px-3 text-right">Debit</th>
                        <th className="py-1 px-3 text-right">Kredit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#3F4147]">
                      {je.lines.map((l) => {
                        const acc = accounts.find((a) => a.id === l.accountId);
                        return (
                          <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-[#2B2D31]">
                            <td className="py-2 px-3">
                              <span className="font-mono font-bold text-slate-700 dark:text-slate-200 dark:text-[#DBDEE1] mr-2">
                                {acc?.code}
                              </span>
                              <span className="font-medium text-slate-900 dark:text-white">{acc?.name}</span>
                            </td>
                            <td className="py-2 px-3 text-slate-500 dark:text-[#B5BAC1] dark:text-[#B5BAC1] text-[11px]">{l.memo}</td>
                            <td className="py-2 px-3 text-right font-mono font-bold tabular-nums text-slate-800 dark:text-white">
                              {l.debit > 0 ? formatIDR(l.debit) : '-'}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold tabular-nums text-slate-800 dark:text-white">
                              {l.kredit > 0 ? formatIDR(l.kredit) : '-'}
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-slate-50 dark:bg-[#1E1F22] font-black text-slate-900 dark:text-white border-t border-slate-200 dark:border-[#3F4147]">
                        <td colSpan={2} className="py-2 px-3 text-right text-[11px] uppercase">
                          Total Balance
                        </td>
                        <td className="py-2 px-3 text-right tabular-nums text-blue-700 dark:text-[#0984E3]">
                          {formatIDR(je.totalDebit)}
                        </td>
                        <td className="py-2 px-3 text-right tabular-nums text-blue-700 dark:text-[#0984E3]">
                          {formatIDR(je.totalKredit)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
            </div>
            </>
          )}
        </div>
      )}

      {/* New Invoice Form Modal  */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Buat Faktur Penjualan Baru (Sales Invoice)"
        subtitle="Otomatis menghasilkan jurnal Debit Piutang, Kredit Penjualan, Kredit PPN 11%, dan Debit HPP"
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleSubmitInvoice} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 dark:text-white mb-1">
                Pilih Pelanggan (Customer) *
              </label>
              <select
                value={invContactId}
                onChange={(e) => setInvContactId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input font-bold"
              >
                {contacts
                  .filter((c) => c.type === 'customer' || c.type === 'keduanya')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 dark:text-white mb-1">
                Tanggal Faktur *
              </label>
              <input
                type="date"
                value={invDate}
                onChange={(e) => setInvDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl glass-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 dark:text-white mb-1">
                Jatuh Tempo Pembayaran *
              </label>
              <input
                type="date"
                value={invDueDate}
                onChange={(e) => setInvDueDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl glass-input"
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase">Daftar Item Barang Jual</h4>
              <button
                type="button"
                onClick={handleAddInvoiceItem}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Baris Item</span>
              </button>
            </div>

            {invItems.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 overflow-x-auto min-w-[800px] gap-2 items-center">
                <div className="col-span-5">
                  <select
                    value={item.productId}
                    onChange={(e) => {
                      const prod = products.find((p) => p.id === e.target.value);
                      const updated = structuredClone(invItems);
                      updated[idx].productId = e.target.value;
                      if (prod) updated[idx].unitPrice = prod.salePrice;
                      setInvItems(updated);
                    }}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Stok: {p.qtyOnHand})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <input
                    type="number"
                    value={item.qty || ''}
                    onChange={(e) => {
                      const updated = structuredClone(invItems);
                      updated[idx].qty = Number(e.target.value);
                      setInvItems(updated);
                    }}
                    placeholder="Qty"
                    min="1"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-mono"
                  />
                </div>

                <div className="col-span-3">
                  <CurrencyInput
                    value={item.unitPrice || ''}
                    onChange={(val) => {
                      const updated = structuredClone(invItems);
                      updated[idx].unitPrice = val === '' ? 0 : val;
                      setInvItems(updated);
                    }}
                    placeholder="Harga Satuan"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-mono"
                  />
                </div>

                <div className="col-span-2 flex items-center justify-between gap-1">
                  <label className="flex items-center gap-1 text-[11px] text-slate-600 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.isTaxable}
                      onChange={(e) => {
                        const updated = structuredClone(invItems);
                        updated[idx].isTaxable = e.target.checked;
                        setInvItems(updated);
                      }}
                      className="rounded text-blue-600"
                    />
                    <span>PPN</span>
                  </label>

                  {invItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setInvItems(invItems.filter((_, i) => i !== idx))}
                      className="text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Subtotal & Total Preview */}
          <div className="flex justify-end">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500 dark:text-[#B5BAC1]">
                <span>Subtotal:</span>
                <span className="font-mono tabular-nums">{formatIDR(invoiceSubtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-[#B5BAC1]">
                <span>PPN Keluaran 11%:</span>
                <span className="font-mono tabular-nums">{formatIDR(invoiceTax)}</span>
              </div>
              <div className="flex justify-between font-black text-sm text-slate-900 pt-1.5 border-t border-slate-200">
                <span>Total Tagihan:</span>
                <span className="tabular-nums text-blue-700">{formatIDR(invoiceTotal)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsInvoiceModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25"
            >
              Terbitkan & Jurnal Otomatis
            </button>
          </div>
        </form>
      </Modal>

      {/* New Purchase Bill Form Modal  */}
      <Modal
        isOpen={isBillModalOpen}
        onClose={() => setIsBillModalOpen(false)}
        title="Catat Tagihan Pembelian Barang (Purchase Bill)"
        subtitle="Menambah stok persediaan, meng-update HPP average costing, dan mencatat hutang usaha"
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleSubmitBill} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Pilih Pemasok / Supplier *
              </label>
              <select
                value={billContactId}
                onChange={(e) => setBillContactId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input font-bold"
              >
                {contacts
                  .filter((c) => c.type === 'vendor' || c.type === 'keduanya')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Tanggal Pembelian *
              </label>
              <input
                type="date"
                value={billDate}
                onChange={(e) => setBillDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl glass-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Jatuh Tempo Tagihan *
              </label>
              <input
                type="date"
                value={billDueDate}
                onChange={(e) => setBillDueDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl glass-input"
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase">Daftar Barang yang Dibeli</h4>
              <button
                type="button"
                onClick={handleAddBillItem}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Baris Item</span>
              </button>
            </div>

            {billItems.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 overflow-x-auto min-w-[800px] gap-2 items-center">
                <div className="col-span-5">
                  <select
                    value={item.productId}
                    onChange={(e) => {
                      const prod = products.find((p) => p.id === e.target.value);
                      const updated = structuredClone(billItems);
                      updated[idx].productId = e.target.value;
                      if (prod) updated[idx].unitCost = prod.avgCost;
                      setBillItems(updated);
                    }}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (HPP Lama: {formatIDR(p.avgCost)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <input
                    type="number"
                    value={item.qty || ''}
                    onChange={(e) => {
                      const updated = structuredClone(billItems);
                      updated[idx].qty = Number(e.target.value);
                      setBillItems(updated);
                    }}
                    placeholder="Qty"
                    min="1"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-mono"
                  />
                </div>

                <div className="col-span-3">
                  <CurrencyInput
                    value={item.unitCost || ''}
                    onChange={(val) => {
                      const updated = structuredClone(billItems);
                      updated[idx].unitCost = val === '' ? 0 : val;
                      setBillItems(updated);
                    }}
                    placeholder="Harga Beli Baru"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-mono"
                  />
                </div>

                <div className="col-span-2 flex items-center justify-between gap-1">
                  <label className="flex items-center gap-1 text-[11px] text-slate-600 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.isTaxable}
                      onChange={(e) => {
                        const updated = structuredClone(billItems);
                        updated[idx].isTaxable = e.target.checked;
                        setBillItems(updated);
                      }}
                      className="rounded text-emerald-700"
                    />
                    <span>PPN</span>
                  </label>

                  {billItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setBillItems(billItems.filter((_, i) => i !== idx))}
                      className="text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Subtotal & Total Preview */}
          <div className="flex justify-end">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500 dark:text-[#B5BAC1]">
                <span>Subtotal:</span>
                <span className="font-mono tabular-nums">{formatIDR(billSubtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-[#B5BAC1]">
                <span>PPN Masukan 11%:</span>
                <span className="font-mono tabular-nums">{formatIDR(billTax)}</span>
              </div>
              <div className="flex justify-between font-black text-sm text-slate-900 pt-1.5 border-t border-slate-200">
                <span>Total Hutang Tagihan:</span>
                <span className="tabular-nums text-emerald-800">{formatIDR(billTotal)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsBillModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-700/25"
            >
              Simpan Tagihan & Update HPP
            </button>
          </div>
        </form>
      </Modal>

      {/* New Direct Cash In / Out Form Modal  */}
      <Modal
        isOpen={isCashModalOpen}
        onClose={() => setIsCashModalOpen(false)}
        title="Catat Transaksi Kas Masuk / Keluar "
        subtitle="Transaksi kas non-invoice (beban gaji, listrik, sewa, setoran modal, tarik dividen)"
      >
        <form onSubmit={handleSubmitCash} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 dark:text-white mb-1">
                Arah Aliran Kas *
              </label>
              <select
                value={cashType}
                onChange={(e) => setCashType(e.target.value as 'masuk' | 'keluar')}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input font-bold"
              >
                <option value="keluar">Kas Keluar (Pengeluaran Operasional / Gaji / Sewa)</option>
                <option value="masuk">Kas Masuk (Pendapatan Lain / Setoran Modal)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 dark:text-white mb-1">
                Tanggal Transaksi *
              </label>
              <input
                type="date"
                value={cashDate}
                onChange={(e) => setCashDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl glass-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 dark:text-white mb-1">
                Rekening Kas / Bank yang Digunakan *
              </label>
              <select
                value={cashAccountId}
                onChange={(e) => setCashAccountId(e.target.value)}
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

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 dark:text-white mb-1">
                Akun Lawan (Beban / Ekuitas / Pendapatan) *
              </label>
              <select
                value={contraAccountId}
                onChange={(e) => setContraAccountId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input font-bold"
              >
                {accounts
                  .filter((a) => a.type === 'beban' || a.type === 'ekuitas' || a.type === 'pendapatan' || a.subType === 'aset_tetap')
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.code} - {a.name} ({a.type})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 dark:text-white mb-1">
                Kategori Transaksi Kas
              </label>
              <select
                value={cashCategory}
                onChange={(e) => setCashCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input font-bold"
              >
                <option value="Beban Operasional">Beban Operasional</option>
                <option value="Pendapatan Lain">Pendapatan Lain</option>
                <option value="Prive / Dividen">Prive / Dividen</option>
                <option value="Setoran Modal">Setoran Modal</option>
                <option value="Transfer Bank">Transfer Bank</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 dark:text-white mb-1">
                Jumlah Uang Transaksi (Rp) *
            </label>
            <CurrencyInput
              value={cashAmount || ''}
              onChange={(val) => setCashAmount(val === '' ? 0 : val)}
              placeholder="1.500.000"
              required
              className="w-full px-3 py-2 text-xs rounded-xl glass-input font-mono font-bold text-blue-700"
            />
          </div>

          <div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 dark:text-white mb-1">
              Deskripsi / Keterangan Transaksi *
            </label>
            <input
              type="text"
              value={cashDescription}
              onChange={(e) => setCashDescription(e.target.value)}
              placeholder="Contoh: Pembayaran Token Listrik Toko Bulan Agustus"
              required
              className="w-full px-3 py-2 text-xs rounded-xl glass-input"
            />
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={() => setIsCashModalOpen(false)}
              className="px-4 py-2 text-sm font-bold text-slate-500 dark:text-[#B5BAC1] hover:text-slate-700 dark:text-slate-200 dark:text-[#B5BAC1] dark:hover:text-white"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-600/20"
            >
              Catat Transaksi Tunai
            </button>
          </div>
        </form>
      </Modal>

      {voidInvoiceId && (
        <PokaYokeModal
          isOpen={!!voidInvoiceId}
          onClose={() => setVoidInvoiceId(null)}
          anomaly={{
            id: 'void_invoice',
            type: 'destructive_action',
            title: "Konfirmasi Pembatalan Faktur",
            description: "Yakin ingin membatalkan (void) faktur penjualan ini? Jurnal pembalik (reversing entry) akan otomatis dibuat untuk mengoreksi pembukuan.",
            impact: "Laba rugi akan menyesuaikan, dan stok akan dikembalikan.",
            recommendedAction: "Pastikan pelanggan benar-benar membatalkan transaksinya.",
            autoFixLabel: 'Void Faktur & Buat Jurnal Pembalik',
            onAutoFix: confirmVoid,
          }}
        />
      )}
    </div>
  );
};
