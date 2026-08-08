# 📘 LedgerLogic Portfolio Edition — Demo Software Akuntansi Double-Entry

> **Demo Portofolio Akuntansi Bisnis Dagang & Retail ("Toko Sejahtera Retail & Distribusi")**  
> Dibangun dengan **React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Decimal Precision + Vitest**.

---

## 🌟 Demo Credentials & Quick Switcher

Aplikasi dilengkapi dengan role switcher 1-klik di pojok kanan atas (*Admin* vs *Staff*):

| Role | Nama | Email | Akses & Batasan |
| :--- | :--- | :--- | :--- |
| **Administrator** | Budi Santoso, S.Ak | `admin@tokosejahtera.com` | Akses Penuh: Input Transaksi, Void Jurnal, Laporan Keuangan, Analisa Rasio Finansial (F-17) |
| **Staff Akuntansi** | Siti Rahma | `staff@tokosejahtera.com` | Data Entry: Input Faktur & Kas, Tidak bisa Void, Dibatasi dari Analisa Rasio Finansial |

---

## 💎 Prinsip Teknis Akuntansi yang Wajib Dipatuhi (PRD §4)

1. **Uang Selalu Precision / Numeric (§4.1)**: Seluruh operasi finansial menggunakan `Decimal.js` dan pembulatan per sen tanpa floating-point drift.
2. **Double-Entry Bookkeeping (§4.2)**: Setiap transaksi (Faktur Penjualan, Tagihan Pembelian, Kas Masuk/Keluar, Pelunasan) otomatis menghasilkan $\ge 2$ baris jurnal seimbang.
3. **Validasi Balance Sebelum Commit (§4.3)**: Sistem memvalidasi $\sum \text{Debit} \equiv \sum \text{Kredit}$ sebelum disimpan. Transaksi tidak seimbang otomatis ditolak.
4. **Laporan Dinamis dari Journal Lines (§4.4)**: Laporan Laba Rugi, Neraca, Arus Kas, dan Rasio Finansial dihitung langsung dari baris jurnal berjalan.
5. **Keseimbangan Neraca Terjamin (§4.5 / F-14)**: $\text{Total Aset} \equiv \text{Total Liabilitas} + \text{Total Ekuitas}$ (termasuk Laba Ditahan dan Laba Bersih Tahun Berjalan).

---

## 🚀 Fitur yang Tersedia (PRD §6)

- **F-01: Chart of Accounts (COA)** — Master akun 5 tipe utama (`aset`, `liabilitas`, `ekuitas`, `pendapatan`, `beban`) dengan saldo berjalan dinamis dan proteksi hapus.
- **F-02: Kontak Pelanggan & Pemasok** — Manajemen Customer & Vendor dengan saldo piutang (AR) dan hutang (AP) terbuka serta riwayat transaksi.
- **F-03: Katalog Produk & Persediaan** — Manajemen SKU barang dagang dengan `avgCost` dan `qtyOnHand` otomatis read-only.
- **F-04: Faktur Penjualan (Sales Invoice)** — Multi-item dengan PPN 11%, pengurangan stok, pengakuan HPP otomatis, dan jurnal berpasangan seimbang.
- **F-05: Kas Masuk & Kas Keluar** — Pencatatan transaksi operasional non-faktur (gaji karyawan, sewa ruko, utilitas listrik/air, setoran modal).
- **F-06: Tagihan Pembelian (Purchase Bill)** — Pembelian barang dari supplier dengan PPN masukan 11% dan rekalkulasi HPP rata-rata tertimbang.
- **F-07: Piutang Usaha (AR) + 5 Aging Buckets** — Pengelompokan umur piutang (*Belum Jatuh Tempo, 1-30, 31-60, 61-90, >90 hari*) + modal pelunasan dengan validasi silang Neraca.
- **F-08: Hutang Usaha (AP) + 5 Aging Buckets** — Pengelompokan umur hutang tagihan supplier + modal pembayaran dengan validasi silang Neraca.
- **F-11: HPP Otomatis (Weighted Average Costing)** — Formula rata-rata tertimbang:  
  $$\text{AvgCost}_{\text{baru}} = \frac{(\text{Qty}_{\text{lama}} \times \text{AvgCost}_{\text{lama}}) + (\text{Qty}_{\text{beli}} \times \text{Harga}_{\text{beli}})}{\text{Qty}_{\text{lama}} + \text{Qty}_{\text{beli}}}$$
- **F-12: Kartu Stok (Stock Movements Ledger)** — Riwayat mutasi kuantitas & nilai barang per produk.
- **F-13: Laporan Laba Rugi (Income Statement / P&L)** — Pendapatan, HPP, Laba Kotor, Beban Operasional, dan Laba Bersih.
- **F-14: Laporan Neraca (Balance Sheet)** — Posisi keuangan Aset, Liabilitas, Ekuitas dengan bukti matematis keseimbangan 100%.
- **F-15: Laporan Arus Kas (Direct Method)** — Aliran kas Aktivitas Operasi, Investasi, dan Pendanaan.
- **F-16: Executive Dashboard** — KPI cards (*Kas & Bank, Piutang, Hutang, Laba Bersih*), quick actions, dan grafik tren.
- **F-17: Analisa Rasio Finansial Otomatis** — Current Ratio, Quick Ratio, GPM, NPM, Debt-to-Equity, ROE dengan evaluasi sehat/peringatan.
- **F-18: Grafik Tren MoM** — Visualisasi SVG performa pendapatan vs beban 6 bulan terakhir.
- **F-20: Multi-User Role Based Access Control (RBAC)** — Admin (Full) vs Staff (Data Entry).
- **F-21: Export PDF & Print Layout** — Tampilan cetak siap ekspor untuk laporan keuangan dan faktur.

---

## 🧪 Menjalankan Pengujian Otomatis (Vitest)

```bash
# Menjalankan seluruh test suite akuntansi
npm test
```

Test mencakup 5 validasi inti:
1. Validasi keseimbangan jurnal ($\sum \text{Debit} \equiv \sum \text{Kredit}$)
2. Kalkulasi HPP rata-rata tertimbang (Weighted Average Costing)
3. Konsistensi matematis Neraca (Total Aset = Total Liabilitas + Total Ekuitas)
4. Kalkulasi rasio finansial (Current Ratio, GPM, NPM, DER)
5. Klasifikasi bucket umur piutang & hutang (Aging buckets)

---

## 📦 Menjalankan Secara Lokal

```bash
# Install dependencies
npm install

# Jalankan server pengembangan
npm run dev

# Build untuk produksi
npm run build
```
