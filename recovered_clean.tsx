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
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pilih Pelanggan (Customer) *
              </label>
              <select
                value={invContactId}
                onChange={(e) => setInvContactId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input font-bold"
              >
                {state.contacts
                  .filter((c) => c.type === 'customer' || c.type === 'keduanya')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
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
              <label className="block text-xs font-bold text-slate-700 mb-1">
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
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <select
                    value={item.productId}
                    onChange={(e) => {
                      const prod = state.products.find((p) => p.id === e.target.value);
                      const updated = [...invItems];
                      updated[idx].productId = e.target.value;
                      if (prod) updated[idx].unitPrice = prod.sellingPrice;
                      setInvItems(updated);
                    }}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    {state.products.map((p) => (
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
                      const updated = [...invItems];
                      updated[idx].qty = Number(e.target.value);
                      setInvItems(updated);
                    }}
                    placeholder="Qty"
                    min="1"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-mono"
                  />
                </div>

                <div className="col-span-3">
                  <input
                    type="number"
                    value={item.unitPrice || ''}
                    onChange={(e) => {
                      const updated = [...invItems];
                      updated[idx].unitPrice = Number(e.target.value);
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
                        const updated = [...invItems];
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
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span className="font-mono tabular-nums">{formatIDR(invoiceSubtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
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
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pilih Pemasok / Supplier *
              </label>
              <select
                value={billContactId}
                onChange={(e) => setBillContactId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input font-bold"
              >
                {state.contacts
                  .filter((c) => c.type === 'vendor' || c.type === 'keduanya')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
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
              <label className="block text-xs font-bold text-slate-700 mb-1">
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
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <select
                    value={item.productId}
                    onChange={(e) => {
                      const prod = state.products.find((p) => p.id === e.target.value);
                      const updated = [...billItems];
                      updated[idx].productId = e.target.value;
                      if (prod) updated[idx].unitCost = prod.avgCost;
                      setBillItems(updated);
                    }}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    {state.products.map((p) => (
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
                      const updated = [...billItems];
                      updated[idx].qty = Number(e.target.value);
                      setBillItems(updated);
                    }}
                    placeholder="Qty"
                    min="1"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-mono"
                  />
                </div>

                <div className="col-span-3">
                  <input
                    type="number"
                    value={item.unitCost || ''}
                    onChange={(e) => {
                      const updated = [...billItems];
                      updated[idx].unitCost = Number(e.target.value);
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
                        const updated = [...billItems];
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
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span className="font-mono tabular-nums">{formatIDR(billSubtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
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
