import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  History,
  FileSpreadsheet,
  TrendingUp,
  Tag,
  Boxes,
} from 'lucide-react';
import { Product, StockMovement } from '../../types/accounting';
import { AppState } from '../../lib/storage';
import { formatIDR } from '../../lib/accountingEngine';
import { Modal } from '../common/Modal';
import { CurrencyInput } from '../common/CurrencyInput';
import { Tooltip } from '../common/Tooltip';
import { soundFx } from '../../lib/soundFx';
import { useStore } from '../../lib/storage';

interface ProductsViewProps {
  onAddProduct: (prod: Omit<Product, 'id' | 'avgCost' | 'qtyOnHand' | 'createdAt'> & { initialQty?: number; initialCost?: number }) => void;
  onOpenNewBill: () => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  onAddProduct,
  onOpenNewBill,
}) => {
  const products = useStore(s => s.products);
  const stockMovements = useStore(s => s.stockMovements);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStockProduct, setSelectedStockProduct] = useState<Product | null>(null);

  // New product form state
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Sembako & Pangan');
  const [unit, setUnit] = useState('Pcs');
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [initialCost, setInitialCost] = useState<number>(0);
  const [initialQty, setInitialQty] = useState<number>(0);
  const [minStockAlert, setMinStockAlert] = useState<number>(15);

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    }
    return true;
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim() || !name.trim()) return;

    soundFx.playClick();
    onAddProduct({
      sku: sku.trim(),
      name: name.trim(),
      category,
      unit,
      salePrice: Number(sellingPrice),
      initialCost: Number(initialCost),
      initialQty: Number(initialQty),
      minStockAlert: Number(minStockAlert),
    });

    setIsAddModalOpen(false);
    setSku('');
    setName('');
    setSellingPrice(0);
    setInitialCost(0);
    setInitialQty(0);
  };

  // Stock movements for selected product
  const movementsForSelected = selectedStockProduct
    ? stockMovements.filter((sm) => sm.productId === selectedStockProduct.id)
    : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title & Add Product */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Produk & Persediaan Barang
            </h1>
            <Tooltip
              title="Persediaan Barang (Moving Average)"
              content="Pencatatan persediaan perpetual di mana Harga Pokok Penjualan (HPP) dihitung otomatis setiap kali ada pembelian barang baru atau transaksi kasir."
              iconOnly
            />
          </div>
          <p className="text-sm text-slate-500 dark:text-[#B5BAC1] mt-1">
            Katalog barang dagang dengan kalkulasi HPP otomatis (Metode Weighted Average Costing).
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Produk Baru</span>
        </button>
      </div>

      {/* Filter Chips & Search */}
      <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Kategori
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center bg-slate-100/90 rounded-xl px-3 py-1.5 w-full md:w-64 border border-slate-200">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari SKU / nama produk..."
            className="bg-transparent text-xs w-full outline-none text-slate-800"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 dark:text-[#B5BAC1] uppercase tracking-wider">
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Nama Produk</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-right">Harga Jual</th>
                <th className="py-3 px-4 text-right bg-blue-50/40 text-blue-900">
                  HPP Average Cost (Auto)
                </th>
                <th className="py-3 px-4 text-center">Stok Berjalan</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((prod) => {
                const isLowStock = prod.qtyOnHand <= prod.minStockAlert;
                const margin = prod.salePrice > 0
                  ? Math.round(((prod.salePrice - prod.avgCost) / prod.salePrice) * 100)
                  : 0;

                return (
                  <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">{prod.sku}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{prod.name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-400">Satuan: {prod.unit}</span>
                        <span className="text-[10px] text-emerald-700 font-semibold">
                          Margin: {margin}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 dark:text-slate-200">
                        {prod.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-slate-900 tabular-nums">
                      {formatIDR(prod.salePrice)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-blue-900 tabular-nums bg-blue-50/20">
                      {formatIDR(prod.avgCost)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <span
                          className={`font-black text-xs px-2.5 py-1 rounded-full ${
                            isLowStock
                              ? 'bg-rose-100 text-rose-800 animate-pulse'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {prod.qtyOnHand} {prod.unit}
                        </span>
                        {isLowStock && (
                          <span title="Stok berada di bawah batas minimum" className="text-rose-600">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedStockProduct(prod)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-[#B5BAC1] hover:text-blue-600 rounded-lg flex items-center gap-1.5 transition-colors group relative"
                        title="Kartu Stok"
                      >
                        <History className="w-4 h-4" />
                        <span className="sr-only sm:not-sr-only sm:text-xs sm:font-bold hidden sm:inline-block">
                          Kartu Stok
                        </span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Produk Baru ke Katalog"
        subtitle="HPP akan otomatis dikalkulasi via Average Costing saat tagihan pembelian dicatat"
      >
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Kode SKU Produk *
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Contoh: SBK-MIE-001"
                required
                className="w-full px-3 py-2 text-xs rounded-xl glass-input font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Kategori Barang *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input font-bold"
              >
                <option value="Sembako & Pangan">Sembako & Pangan</option>
                <option value="Makanan Ringan & Instan">Makanan Ringan & Instan</option>
                <option value="Minuman Kemasan">Minuman Kemasan</option>
                <option value="Perlengkapan Rumah">Perlengkapan Rumah</option>
                <option value="Elektronik & Aksesoris">Elektronik & Aksesoris</option>
                <option value="Kemasan & Plastik">Kemasan & Plastik</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Nama Produk Dagangan *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Minyak Goreng Bimoli 2L"
                required
                className="w-full px-3 py-2 text-xs rounded-xl glass-input font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Satuan Ukuran (Unit) *
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Pcs, Karton, Karung, Pouch..."
                required
                className="w-full px-3 py-2 text-xs rounded-xl glass-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Harga Jual ke Pelanggan (Rp) *
              </label>
              <CurrencyInput
                value={sellingPrice || ''}
                onChange={(val: string | number) => setSellingPrice(val === '' ? 0 : Number(val))}
                placeholder="35.000"
                required
                className="font-bold text-blue-600 dark:text-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Batas Minimum Stok (Alert) *
              </label>
              <input
                type="number"
                value={minStockAlert || ''}
                onChange={(e) => setMinStockAlert(Number(e.target.value))}
                placeholder="15"
                required
                min="1"
                className="w-full px-3 py-2 text-xs rounded-xl glass-input font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 rounded-xl bg-blue-50/60 border border-blue-100">
            <div>
              <label className="block text-[11px] font-bold text-blue-900 mb-1">
                Stok Awal (Opsional)
              </label>
              <input
                type="number"
                value={initialQty || ''}
                onChange={(e) => setInitialQty(Number(e.target.value))}
                placeholder="0"
                min="0"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-blue-200 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-blue-900 mb-1">
                HPP Perolehan Awal (Rp)
              </label>
              <CurrencyInput
                value={initialCost || ''}
                onChange={(val: string | number) => setInitialCost(val === '' ? 0 : Number(val))}
                placeholder="0"
                className="text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition-all"
            >
              Simpan Produk
            </button>
          </div>
        </form>
      </Modal>

      {/* Kartu Stok Modal */}
      {selectedStockProduct && (
        <Modal
          isOpen={!!selectedStockProduct}
          onClose={() => setSelectedStockProduct(null)}
          title={`Kartu Stok (Stock Movements Ledger): ${selectedStockProduct.name}`}
          subtitle={`Audit trail mutasi stok perolehan HPP average costing (SKU: ${selectedStockProduct.sku})`}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-6">
            {/* Header info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Stok Berjalan Saat Ini</p>
                <p className="text-base font-black text-slate-900">
                  {selectedStockProduct.qtyOnHand} {selectedStockProduct.unit}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">HPP Weighted Average</p>
                <p className="text-base font-black text-blue-700 tabular-nums">
                  {formatIDR(selectedStockProduct.avgCost)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Total Nilai Persediaan</p>
                <p className="text-base font-black text-emerald-700 tabular-nums">
                  {formatIDR(selectedStockProduct.qtyOnHand * selectedStockProduct.avgCost)}
                </p>
              </div>
            </div>

            {/* Movements Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-bold text-slate-500 dark:text-[#B5BAC1] uppercase">
                    <th className="py-2.5 px-3">Tanggal</th>
                    <th className="py-2.5 px-3">Tipe</th>
                    <th className="py-2.5 px-3">No. Referensi</th>
                    <th className="py-2.5 px-3 text-right">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Cost</th>
                    <th className="py-2.5 px-3 text-right">Total Nilai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {movementsForSelected.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Belum ada riwayat mutasi stok untuk produk ini.
                      </td>
                    </tr>
                  ) : (
                    movementsForSelected.map((sm) => {
                      const isIncoming = (sm.referenceType || sm.type) === 'in';
                      const refNo = sm.referenceNumber || sm.sourceRefNumber || sm.id;
                      const qtyVal = Math.abs(sm.qtyChange || sm.qty || 0);

                      return (
                        <tr key={sm.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 text-slate-600">{sm.date}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-block text-[9px] uppercase font-black px-2 py-0.5 rounded-full ${
                                isIncoming
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {isIncoming ? 'MASUK (+)' : 'KELUAR (-)'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-blue-600">
                            {refNo}
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-slate-900">
                            {qtyVal} {selectedStockProduct.unit}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-500 dark:text-[#B5BAC1]">
                            {formatIDR(sm.unitPrice || sm.unitCost || 0)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                            {formatIDR(sm.totalValuation || sm.totalValue || 0)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
