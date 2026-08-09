import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingCart,
  Barcode,
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  CheckCircle2,
  DollarSign,
  X,
  Sparkles,
} from 'lucide-react';
import { CurrencyInput } from '../common/CurrencyInput';
import { Product, Contact } from '../../types/accounting';
import { formatIDR } from '../../lib/accountingEngine';
import { soundFx } from '../../lib/soundFx';

interface PosCashierModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  contacts: Contact[];
  onCompleteSale: (data: {
    contactId: string;
    date: string;
    dueDate: string;
    items: { productId: string; qty: number; unitPrice: number }[];
    notes?: string;
    isPOS?: boolean;
    tenderedAmount?: number;
  }) => { success: boolean; error?: string };
}

interface CartItem {
  product: Product;
  qty: number;
  unitPrice: number;
}

export const PosCashierModal: React.FC<PosCashierModalProps> = ({
  isOpen,
  onClose,
  products,
  contacts,
  onCompleteSale,
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(() => {
    const defaultCustomer = contacts.find(
      (c) => c.name.toLowerCase().includes('umum') || c.name.toLowerCase().includes('cash')
    );
    return defaultCustomer?.id || contacts[0]?.id || '';
  });
  const [isSuccessReceipt, setIsSuccessReceipt] = useState(false);
  const [completedInvoiceData, setCompletedInvoiceData] = useState<any | null>(null);
  const [stockError, setStockError] = useState<string | null>(null);

  const barcodeBuffer = useRef<string>('');
  const lastKeyTime = useRef<number>(0);

  // Barcode hardware listener (<50ms buffer)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      const now = Date.now();
      if (now - lastKeyTime.current > 50) {
        barcodeBuffer.current = '';
      }
      lastKeyTime.current = now;

      if (e.key === 'Enter') {
        if (barcodeBuffer.current.length >= 3) {
          e.preventDefault();
          const match = products.find(
            (p) => p.sku === barcodeBuffer.current || p.barcode === barcodeBuffer.current
          );
          if (match) {
            handleAddToCart(match);
            barcodeBuffer.current = '';
          }
        }
      } else if (e.key.length === 1) {
        barcodeBuffer.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, products]);

  if (!isOpen) return null;

  const handleAddToCart = (product: Product) => {
    setStockError(null);
    const existing = cart.find((item) => item.product.id === product.id);
    const currentQty = existing ? existing.qty : 0;

    if (currentQty + 1 > product.qtyOnHand) {
      soundFx.playError();
      setStockError(`Stok tidak mencukupi untuk ${product.name}. Tersisa: ${product.qtyOnHand} ${product.unit}`);
      return;
    }

    soundFx.playClick();
    setCart((prev) => {
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { product, qty: 1, unitPrice: product.salePrice }];
    });
  };

  const handleUpdateQty = (productId: string, delta: number) => {
    setStockError(null);
    const existingItem = cart.find(item => item.product.id === productId);
    if (existingItem && delta > 0 && existingItem.qty + delta > existingItem.product.qtyOnHand) {
      soundFx.playError();
      setStockError(`Stok tidak mencukupi untuk ${existingItem.product.name}. Tersisa: ${existingItem.product.qtyOnHand} ${existingItem.product.unit}`);
      return;
    }

    soundFx.playClick();
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (productId: string) => {
    soundFx.playClick();
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  const taxAmount = Math.round(subtotal * 0.11);
  const grandTotal = subtotal + taxAmount;

  // Round cash change to nearest Rp 100
  const rawChange = cashTendered > grandTotal ? cashTendered - grandTotal : 0;
  const roundedChange = Math.floor(rawChange / 100) * 100;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (cashTendered < grandTotal) {
      soundFx.playError();
      alert('Uang tunai (Tendered) tidak boleh kurang dari Total Tagihan.');
      return;
    }

    const res = onCompleteSale({
      contactId: selectedCustomerId || contacts[0]?.id || 'cont-1',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      items: cart.map((c) => ({
        productId: c.product.id,
        qty: c.qty,
        unitPrice: c.unitPrice,
      })),
      notes: 'Transaksi Kasir POS Retail (Cash Register)',
      isPOS: true,
      tenderedAmount: cashTendered,
    });

    if (res.success) {
      soundFx.playChaChing();
      setCompletedInvoiceData({
        items: [...cart],
        subtotal,
        taxAmount,
        grandTotal,
        cashTendered,
        roundedChange,
        date: new Date().toLocaleString('id-ID'),
      });
      setIsSuccessReceipt(true);
      setCart([]);
      setCashTendered(0);
    } else {
      soundFx.playError();
      alert(res.error || 'Gagal memproses transaksi kasir');
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-950/80 dark:bg-black/90 backdrop-blur-lg" onClick={onClose} />

      <div className="relative w-full max-w-5xl glass-card bg-white dark:bg-[#2B2D31] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-10 my-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-[#1E1F22]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Terminal Kasir POS Retail & Barcode Scanner
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <Barcode className="w-3 h-3" />
                  Scanner Active (&lt;50ms)
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-[#B5BAC1]">
                Pindai barcode hardware atau klik produk untuk penambahan instan ke keranjang kasir.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {isSuccessReceipt && completedInvoiceData ? (
          <div className="p-8 text-center space-y-6 max-w-md mx-auto overflow-y-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Transaksi Kasir Berhasil Dicatat!
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#B5BAC1] mt-1">
                Jurnal umum berpasangan otomatis terbentuk dan stok barang telah dikurangi.
              </p>
            </div>

            {/* Thermal Receipt Preview */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#1E1F22] border border-dashed border-slate-300 dark:border-slate-700 font-mono text-xs text-left space-y-2 text-slate-800 dark:text-slate-200">
              <div className="text-center font-bold pb-2 border-b border-dashed border-slate-300 dark:border-slate-700">
                TOKO SEJAHTERA RETAIL
                <br />
                <span className="text-[10px] text-slate-400 font-normal">{completedInvoiceData.date}</span>
              </div>
              {completedInvoiceData.items.map((it: CartItem, idx: number) => (
                <div key={idx} className="flex justify-between text-[11px]">
                  <span>
                    {it.product.name} x{it.qty}
                  </span>
                  <span>{formatIDR(it.qty * it.unitPrice)}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-dashed border-slate-300 dark:border-slate-700 space-y-1 text-[11px] font-bold">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatIDR(completedInvoiceData.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>PPN 11%:</span>
                  <span>{formatIDR(completedInvoiceData.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-1">
                  <span>TOTAL:</span>
                  <span>{formatIDR(completedInvoiceData.grandTotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 pt-1">
                  <span>Tunai Diterima:</span>
                  <span>{formatIDR(completedInvoiceData.cashTendered)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-black">
                  <span>Kembalian (Rp 100):</span>
                  <span>{formatIDR(completedInvoiceData.roundedChange)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Struk Thermal</span>
              </button>
              <button
                onClick={() => setIsSuccessReceipt(false)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md"
              >
                Transaksi Baru
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
            {/* Left: Product Catalog Selection (7 Cols) */}
            <div className="lg:col-span-7 p-4 border-r border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
              <div className="flex flex-col gap-2 mb-3">
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700">
                  <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ketik nama atau scan barcode (F4)..."
                    className="w-full bg-transparent text-xs outline-none text-slate-900 dark:text-white"
                  />
                </div>
                {stockError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold px-3 py-2 rounded-xl flex items-center justify-between shadow-sm">
                    <span>{stockError}</span>
                    <button onClick={() => setStockError(null)} className="text-rose-500 hover:text-rose-700">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Products Grid */}
              <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2.5 pr-1">
                {filteredProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleAddToCart(p)}
                    className="p-3 rounded-2xl glass-card text-left border border-slate-200 dark:border-slate-700/70 hover:border-blue-500 dark:hover:border-blue-400 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 block">
                        {p.sku}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2 mt-0.5 group-hover:text-blue-600 transition-colors">
                        {p.name}
                      </h4>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs font-black text-slate-900 dark:text-white">
                      <span>{formatIDR(p.salePrice)}</span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {p.qtyOnHand} {p.unit}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Cart & Checkout (5 Cols) */}
            <div className="lg:col-span-5 p-4 flex flex-col justify-between bg-slate-50/50 dark:bg-[#1E1F22]/50 overflow-hidden">
              {/* Customer Selector */}
              <div className="mb-3">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 dark:text-slate-300 mb-1">
                  Pelanggan Kasir
                </label>
                <select
                  value={selectedCustomerId || contacts.find(c => c.type === 'customer' || c.type === 'keduanya')?.id}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl glass-input font-semibold dark:bg-[#1E1F22] dark:border-[#3F4147] dark:text-[#DBDEE1]"
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

              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 border border-slate-200 dark:border-slate-700 rounded-2xl p-2 bg-white dark:bg-[#2B2D31]">
                {cart.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full">
                      <ShoppingCart className="w-5 h-5 text-slate-300 dark:text-slate-500 dark:text-[#B5BAC1]" />
                    </div>
                    Keranjang kosong. Pindai barcode atau pilih barang di sebelah kiri.
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1E1F22] border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex-1 pr-2">
                        <p className="font-bold text-slate-900 dark:text-white truncate">
                          {item.product.name}
                        </p>
                        <p className="text-[10px] text-slate-400">{formatIDR(item.unitPrice)}</p>
                      </div>

                      {/* Qty Stepper */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleUpdateQty(item.product.id, -1)}
                          className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold w-6 text-center">{item.qty}</span>
                        <button
                          onClick={() => handleUpdateQty(item.product.id, 1)}
                          className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleRemoveItem(item.product.id)}
                          className="text-slate-400 hover:text-rose-600 pl-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Checkout Form & Tendered Amount */}
              <form onSubmit={handleCheckout} className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="space-y-1 text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-mono tabular-nums font-bold">{formatIDR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PPN 11%:</span>
                    <span className="font-mono tabular-nums font-bold">{formatIDR(taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span>Total Tagihan:</span>
                    <span className="font-mono tabular-nums text-blue-600 dark:text-blue-400">{formatIDR(grandTotal)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-[#B5BAC1] mb-0.5">
                      Uang Tunai (Tendered)
                    </label>
                    <CurrencyInput
                      value={cashTendered || ''}
                      onChange={(val) => setCashTendered(val === '' ? 0 : val)}
                      placeholder={grandTotal.toLocaleString('id-ID')}
                      required
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl glass-input font-mono font-bold text-emerald-600 mb-2 dark:bg-[#1E1F22] dark:border-[#3F4147]"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        grandTotal,
                        Math.ceil(grandTotal / 50000) * 50000,
                        Math.ceil(grandTotal / 100000) * 100000,
                      ]
                        .filter((v, i, a) => v >= grandTotal && a.indexOf(v) === i && v > 0)
                        .map((amount) => (
                          <button
                            key={amount}
                            type="button"
                            onClick={() => {
                              soundFx.playClick();
                              setCashTendered(amount);
                            }}
                            className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-200 dark:text-slate-300 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
                          >
                            {amount === grandTotal ? 'Uang Pas' : formatIDR(amount)}
                          </button>
                        ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-[#B5BAC1] mb-0.5">
                      Kembalian (Rp 100)
                    </label>
                    <div className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 font-mono font-black text-slate-900 dark:text-white">
                      {formatIDR(roundedChange)}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={cart.length === 0}
                  className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white text-xs font-black shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
                >
                  Bayar & Terbitkan Faktur (F4)
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
