import {
  Account,
  Contact,
  Product,
  Invoice,
  PurchaseBill,
  CashTransaction,
  Payment,
  JournalEntry,
  StockMovement,
} from '../types/accounting';

export const INITIAL_ACCOUNTS: Account[] = [
  // 1. ASET LANCAR
  {
    id: 'acc-1101',
    code: '1101',
    name: 'Kas Operasional Toko',
    type: 'aset',
    subType: 'aset_lancar',
    normalBalance: 'debit',
    description: 'Uang kas fisik di kasir toko',
    isSystem: true,
    isActive: true,
  },
  {
    id: 'acc-1102',
    code: '1102',
    name: 'Bank BCA - 8820192834',
    type: 'aset',
    subType: 'aset_lancar',
    normalBalance: 'debit',
    description: 'Rekening operasional utama bisnis',
    isSystem: true,
    isActive: true,
  },
  {
    id: 'acc-1103',
    code: '1103',
    name: 'Piutang Usaha (AR)',
    type: 'aset',
    subType: 'aset_lancar',
    normalBalance: 'debit',
    description: 'Tagihan penjualan kredit ke pelanggan',
    isSystem: true,
    isActive: true,
  },
  {
    id: 'acc-1104',
    code: '1104',
    name: 'Persediaan Barang Dagang',
    type: 'aset',
    subType: 'aset_lancar',
    normalBalance: 'debit',
    description: 'Stok barang fisik di gudang & toko',
    isSystem: true,
    isActive: true,
  },
  {
    id: 'acc-1105',
    code: '1105',
    name: 'PPN Masukan (Pajak Pembelian)',
    type: 'aset',
    subType: 'aset_lancar',
    normalBalance: 'debit',
    description: 'Pajak masukan yang dapat dikreditkan',
    isSystem: true,
    isActive: true,
  },
  {
    id: 'acc-1106',
    code: '1106',
    name: 'Persediaan Dalam Proses (WIP)',
    type: 'aset',
    subType: 'aset_lancar',
    normalBalance: 'debit',
    description: 'Barang dalam proses manufaktur',
    isSystem: true,
    isActive: true,
  },
  {
    id: 'acc-1107',
    code: '1107',
    name: 'Cadangan Kerugian Piutang (ECL)',
    type: 'aset',
    subType: 'aset_lancar',
    normalBalance: 'kredit',
    description: 'Penyisihan piutang tak tertagih PSAK 71',
    isSystem: true,
    isActive: true,
  },
  // 1. ASET TETAP
  {
    id: 'acc-1201',
    code: '1201',
    name: 'Peralatan Toko & Rak Display',
    type: 'aset',
    subType: 'aset_tetap',
    normalBalance: 'debit',
    description: 'Aset fisik operasional toko',
    isSystem: false,
    isActive: true,
  },
  {
    id: 'acc-1202',
    code: '1202',
    name: 'Akumulasi Penyusutan Peralatan',
    type: 'aset',
    subType: 'aset_tetap',
    normalBalance: 'kredit', // Contra asset
    description: 'Akumulasi depresiasi peralatan toko',
    isSystem: false,
    isActive: true,
  },
  // 2. LIABILITAS LANCAR
  {
    id: 'acc-2101',
    code: '2101',
    name: 'Hutang Usaha (AP)',
    type: 'liabilitas',
    subType: 'liabilitas_lancar',
    normalBalance: 'kredit',
    description: 'Kewajiban tagihan ke pemasok/supplier',
    isSystem: true,
    isActive: true,
  },
  {
    id: 'acc-2102',
    code: '2102',
    name: 'PPN Keluaran (Pajak Penjualan)',
    type: 'liabilitas',
    subType: 'liabilitas_lancar',
    normalBalance: 'kredit',
    description: 'PPN 11% yang dipungut dari customer',
    isSystem: true,
    isActive: true,
  },
  {
    id: 'acc-2103',
    code: '2103',
    name: 'Beban Akrual & Hutang Gaji',
    type: 'liabilitas',
    subType: 'liabilitas_lancar',
    normalBalance: 'kredit',
    description: 'Kewajiban jangka pendek operasional',
    isSystem: false,
    isActive: true,
  },
  // 2. LIABILITAS JANGKA PANJANG
  {
    id: 'acc-2201',
    code: '2201',
    name: 'Hutang Bank Jangka Panjang (Kredit Usaha)',
    type: 'liabilitas',
    subType: 'liabilitas_jangka_panjang',
    normalBalance: 'kredit',
    description: 'Pinjaman modal kerja jangka panjang dari bank',
    isSystem: false,
    isActive: true,
  },
  // 3. EKUITAS
  {
    id: 'acc-3101',
    code: '3101',
    name: 'Modal Disetor Pemilik',
    type: 'ekuitas',
    subType: 'ekuitas_modal',
    normalBalance: 'kredit',
    description: 'Setoran modal awal pemilik bisnis',
    isSystem: true,
    isActive: true,
  },
  {
    id: 'acc-3201',
    code: '3201',
    name: 'Laba Ditahan Tahun Lalu',
    type: 'ekuitas',
    subType: 'ekuitas_laba_ditahan',
    normalBalance: 'kredit',
    description: 'Akumulasi laba bersih tahun-tahun sebelumnya',
    isSystem: true,
    isActive: true,
  },
  // 4. PENDAPATAN
  {
    id: 'acc-7101',
    code: '7101',
    name: 'Pendapatan Bunga',
    type: 'pendapatan',
    subType: 'pendapatan_lain',
    normalBalance: 'kredit',
    description: 'Pendapatan jasa giro & deposito',
    isSystem: true,
    isActive: true,
  },
  {
    id: 'acc-7102',
    code: '7102',
    name: 'Laba (Rugi) Selisih Kurs',
    type: 'pendapatan',
    subType: 'pendapatan_lain',
    normalBalance: 'kredit',
    description: 'Revaluasi valuta asing',
    isSystem: true,
    isActive: true,
  },
  {
    id: 'acc-4101',
    code: '4101',
    name: 'Pendapatan Penjualan Barang',
    type: 'pendapatan',
    subType: 'pendapatan_usaha',
    normalBalance: 'kredit',
    description: 'Omzet dari penjualan barang dagangan',
    isSystem: true,
    isActive: true,
  },
  {
    id: 'acc-4201',
    code: '4201',
    name: 'Pendapatan Lain-lain & Ongkir',
    type: 'pendapatan',
    subType: 'pendapatan_lain',
    normalBalance: 'kredit',
    description: 'Pendapatan jasa antar dan pendapatan sampingan',
    isSystem: false,
    isActive: true,
  },
  // 5. HPP & BEBAN
  {
    id: 'acc-5101',
    code: '5101',
    name: 'Harga Pokok Penjualan (HPP)',
    type: 'beban',
    subType: 'hpp',
    normalBalance: 'debit',
    description: 'Biaya perolehan barang dagangan yang terjual',
    isSystem: true,
    isActive: true,
  },
  {
    id: 'acc-6101',
    code: '6101',
    name: 'Beban Gaji & Upah Karyawan',
    type: 'beban',
    subType: 'beban_operasional',
    normalBalance: 'debit',
    description: 'Gaji staf toko, kasir, dan gudang',
    isSystem: false,
    isActive: true,
  },
  {
    id: 'acc-6102',
    code: '6102',
    name: 'Beban Sewa Ruko & Gudang',
    type: 'beban',
    subType: 'beban_operasional',
    normalBalance: 'debit',
    description: 'Biaya sewa tempat usaha per bulan',
    isSystem: false,
    isActive: true,
  },
  {
    id: 'acc-6103',
    code: '6103',
    name: 'Beban Listrik, Air & Internet',
    type: 'beban',
    subType: 'beban_operasional',
    normalBalance: 'debit',
    description: 'Biaya utilitas operasional toko',
    isSystem: false,
    isActive: true,
  },
  {
    id: 'acc-6104',
    code: '6104',
    name: 'Beban Administrasi Bank & QRIS',
    type: 'beban',
    subType: 'beban_operasional',
    normalBalance: 'debit',
    description: 'Biaya MDR QRIS, EDC, dan admin rekening',
    isSystem: false,
    isActive: true,
  },
];

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'ct-01',
    name: 'PT Sumber Makmur Retail',
    companyName: 'PT Sumber Makmur Retail',
    type: 'customer',
    email: 'finance@sumbermakmur.co.id',
    phone: '021-5890214',
    address: 'Jl. Daan Mogot No. 88, Jakarta Barat',
    taxId: '01.234.567.8-012.000',
    arBalance: 24500000,
    apBalance: 0,
    openBalanceAR: 24500000,
    openBalanceAP: 0,
    totalSales: 145000000,
    totalPurchases: 0,
    createdAt: '2026-02-01',
  },
  {
    id: 'ct-02',
    name: 'CV Sentosa Jaya Abadi',
    companyName: 'Sentosa Mini Market Group',
    type: 'customer',
    email: 'purchasing@sentosajaya.com',
    phone: '021-7782190',
    address: 'Jl. Raya Margonda No. 120, Depok',
    taxId: '02.456.789.0-034.000',
    arBalance: 18200000,
    apBalance: 0,
    openBalanceAR: 18200000,
    openBalanceAP: 0,
    totalSales: 98000000,
    totalPurchases: 0,
    createdAt: '2026-02-01',
  },
  {
    id: 'ct-03',
    name: 'Toko Berkah Kelontong',
    companyName: 'Toko Berkah Pasar Minggu',
    type: 'customer',
    email: 'haji.subur@berkahkelontong.com',
    phone: '0812-9821-3441',
    address: 'Pasar Minggu Blok A No. 15, Jakarta Selatan',
    arBalance: 5400000,
    apBalance: 0,
    openBalanceAR: 5400000,
    openBalanceAP: 0,
    totalSales: 42000000,
    totalPurchases: 0,
    createdAt: '2026-02-15',
  },
  {
    id: 'ct-04',
    name: 'Supermarket Bintang Timur',
    companyName: 'PT Bintang Timur Swalayan',
    type: 'customer',
    email: 'ap.invoices@bintangtimur.co.id',
    phone: '021-8601245',
    address: 'Jl. Pemuda No. 45, Jakarta Timur',
    taxId: '01.888.999.4-021.000',
    arBalance: 31000000,
    apBalance: 0,
    openBalanceAR: 31000000,
    openBalanceAP: 0,
    totalSales: 165000000,
    totalPurchases: 0,
    createdAt: '2026-03-01',
  },
  {
    id: 'ct-05',
    name: 'PT Unilever Distributor Nusantara',
    companyName: 'PT Unilever Distributor Nusantara',
    type: 'vendor',
    email: 'orders.idn@unilever-dist.co.id',
    phone: '021-8990123',
    address: 'Kawasan Industri Jababeka 1, Cikarang',
    taxId: '01.999.888.7-091.000',
    arBalance: 0,
    apBalance: 32000000,
    openBalanceAR: 0,
    openBalanceAP: 32000000,
    totalSales: 0,
    totalPurchases: 220000000,
    createdAt: '2026-02-02',
  },
  {
    id: 'ct-06',
    name: 'CV Maju Pangan Sejahtera (Beras & Gula)',
    companyName: 'CV Maju Pangan Sejahtera',
    type: 'vendor',
    email: 'sales@majupangan.co.id',
    phone: '0267-401923',
    address: 'Sentra Pergudangan Karawang Timur No. 45',
    taxId: '03.111.222.3-044.000',
    arBalance: 0,
    apBalance: 15400000,
    openBalanceAR: 0,
    openBalanceAP: 15400000,
    totalSales: 0,
    totalPurchases: 185000000,
    createdAt: '2026-02-03',
  },
  {
    id: 'ct-07',
    name: 'PT Indofood CBP Distributor',
    companyName: 'PT Indofood CBP Sukses Makmur Tbk',
    type: 'vendor',
    email: 'distribusi.jkt@indofood.co.id',
    phone: '021-5228888',
    address: 'Jl. Jend. Sudirman Kav. 76-78, Jakarta Pusat',
    taxId: '01.333.444.5-055.000',
    arBalance: 0,
    apBalance: 21800000,
    openBalanceAR: 0,
    openBalanceAP: 21800000,
    totalSales: 0,
    totalPurchases: 140000000,
    createdAt: '2026-02-10',
  },
  {
    id: 'ct-08',
    name: 'Distributor Kemasan & Plastik CV Mulia',
    companyName: 'CV Mulia Packindo',
    type: 'vendor',
    email: 'muliapack@gmail.com',
    phone: '021-6590123',
    address: 'Kawasan Pergudangan Pluit Blok D No. 2, Jakarta Utara',
    arBalance: 0,
    apBalance: 3500000,
    openBalanceAR: 0,
    openBalanceAP: 3500000,
    totalSales: 0,
    totalPurchases: 28000000,
    createdAt: '2026-02-20',
  },
  {
    id: 'ct-09',
    name: 'PT Mitra Retail Bersama (Mitra 2 Arah)',
    companyName: 'Mitra Retail & Distribusi Group',
    type: 'keduanya',
    email: 'partners@mitraretail.com',
    phone: '021-8890234',
    address: 'Jl. KH Noer Ali No. 17, Bekasi Barat',
    taxId: '01.777.666.5-077.000',
    arBalance: 9200000,
    apBalance: 8500000,
    openBalanceAR: 9200000,
    openBalanceAP: 8500000,
    totalSales: 54000000,
    totalPurchases: 45000000,
    createdAt: '2026-03-10',
  },
  {
    id: 'ct-10',
    name: 'Bapak Hendra Kusuma',
    companyName: 'Warung Hendra Jaya',
    type: 'customer',
    email: 'hendra.kusuma@gmail.com',
    phone: '0812-7711-2299',
    address: 'Jl. Kebon Jeruk Raya No. 40, Jakarta Barat',
    arBalance: 3100000,
    apBalance: 0,
    openBalanceAR: 3100000,
    openBalanceAP: 0,
    totalSales: 22000000,
    totalPurchases: 0,
    createdAt: '2026-03-25',
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-01',
    sku: 'SBK-BRS-001',
    name: 'Beras Premium Ramos 5kg',
    category: 'Sembako & Pangan',
    unit: 'Karung',
    salePrice: 78000,
    sellingPrice: 78000,
    avgCost: 62000,
    qtyOnHand: 250,
    minStockAlert: 30,
    createdAt: '2026-02-01',
  },
  {
    id: 'prod-02',
    sku: 'SBK-MYK-002',
    name: 'Minyak Goreng Sania Pouch 2L',
    category: 'Sembako & Pangan',
    unit: 'Pouch',
    salePrice: 38500,
    sellingPrice: 38500,
    avgCost: 31000,
    qtyOnHand: 320,
    minStockAlert: 50,
    createdAt: '2026-02-01',
  },
  {
    id: 'prod-03',
    sku: 'SBK-GLA-003',
    name: 'Gula Pasir Kristal Putih 1kg (Gulaku)',
    category: 'Sembako & Pangan',
    unit: 'Bungkus',
    salePrice: 18500,
    sellingPrice: 18500,
    avgCost: 14800,
    qtyOnHand: 410,
    minStockAlert: 60,
    createdAt: '2026-02-01',
  },
  {
    id: 'prod-04',
    sku: 'MIE-IND-001',
    name: 'Indomie Goreng Spesial (Karton / 40 pcs)',
    category: 'Makanan Ringan & Instan',
    unit: 'Karton',
    salePrice: 122000,
    sellingPrice: 122000,
    avgCost: 101000,
    qtyOnHand: 185,
    minStockAlert: 20,
    createdAt: '2026-02-01',
  },
  {
    id: 'prod-05',
    sku: 'MIE-IND-002',
    name: 'Indomie Kuah Ayam Bawang (Karton / 40 pcs)',
    category: 'Makanan Ringan & Instan',
    unit: 'Karton',
    salePrice: 118000,
    sellingPrice: 118000,
    avgCost: 97500,
    qtyOnHand: 140,
    minStockAlert: 15,
    createdAt: '2026-02-01',
  },
  {
    id: 'prod-06',
    sku: 'MNM-THP-001',
    name: 'Teh Botol Sosro Kotak 250ml (Karton / 24 pcs)',
    category: 'Minuman Kemasan',
    unit: 'Karton',
    salePrice: 72000,
    sellingPrice: 72000,
    avgCost: 57000,
    qtyOnHand: 150,
    minStockAlert: 20,
    createdAt: '2026-02-02',
  },
  {
    id: 'prod-07',
    sku: 'MNM-AQU-002',
    name: 'Aqua Galon 19L (Refill Isi)',
    category: 'Minuman Kemasan',
    unit: 'Galon',
    salePrice: 21000,
    sellingPrice: 21000,
    avgCost: 16000,
    qtyOnHand: 190,
    minStockAlert: 25,
    createdAt: '2026-02-02',
  },
  {
    id: 'prod-08',
    sku: 'PRL-SAB-001',
    name: 'Deterjen Rinso Molto Anti Noda 770g',
    category: 'Perlengkapan Rumah',
    unit: 'Pcs',
    salePrice: 24000,
    sellingPrice: 24000,
    avgCost: 19000,
    qtyOnHand: 215,
    minStockAlert: 30,
    createdAt: '2026-02-03',
  },
  {
    id: 'prod-09',
    sku: 'PRL-SAB-002',
    name: 'Sabun Cuci Piring Sunlight Jeruk Nipis 750ml',
    category: 'Perlengkapan Rumah',
    unit: 'Pouch',
    salePrice: 17500,
    sellingPrice: 17500,
    avgCost: 13800,
    qtyOnHand: 240,
    minStockAlert: 40,
    createdAt: '2026-02-03',
  },
  {
    id: 'prod-10',
    sku: 'SNK-BIS-001',
    name: 'Biskuit Roma Kelapa 300g',
    category: 'Makanan Ringan & Instan',
    unit: 'Pcs',
    salePrice: 11500,
    sellingPrice: 11500,
    avgCost: 9000,
    qtyOnHand: 280,
    minStockAlert: 40,
    createdAt: '2026-02-04',
  },
  {
    id: 'prod-11',
    sku: 'ELK-BTR-001',
    name: 'Baterai Alkaline AA Pack Isi 4',
    category: 'Elektronik & Aksesoris',
    unit: 'Pack',
    salePrice: 32000,
    sellingPrice: 32000,
    avgCost: 24000,
    qtyOnHand: 120,
    minStockAlert: 15,
    createdAt: '2026-02-05',
  },
  {
    id: 'prod-12',
    sku: 'KMS-KDK-001',
    name: 'Kantong Plastik Kresek Tebal Putih Ukuran 28',
    category: 'Kemasan & Plastik',
    unit: 'Pack / 50 lembar',
    salePrice: 14000,
    sellingPrice: 14000,
    avgCost: 10200,
    qtyOnHand: 195,
    minStockAlert: 20,
    createdAt: '2026-02-05',
  },
  {
    id: 'prod-13',
    sku: 'SBK-TEL-004',
    name: 'Telur Ayam Negeri Fresh (Tray / 30 Butir)',
    category: 'Sembako & Pangan',
    unit: 'Tray',
    salePrice: 58000,
    sellingPrice: 58000,
    avgCost: 48000,
    qtyOnHand: 85,
    minStockAlert: 10,
    createdAt: '2026-02-06',
  },
  {
    id: 'prod-14',
    sku: 'MNM-KOP-003',
    name: 'Kopi Kapal Api Spesial Mix (Renceng / 10 sachet)',
    category: 'Minuman Kemasan',
    unit: 'Renceng',
    salePrice: 16000,
    sellingPrice: 16000,
    avgCost: 12500,
    qtyOnHand: 260,
    minStockAlert: 40,
    createdAt: '2026-02-07',
  },
  {
    id: 'prod-15',
    sku: 'PRL-PAS-003',
    name: 'Pasta Gigi Pepsodent Jumbo 190g',
    category: 'Perlengkapan Rumah',
    unit: 'Tube',
    salePrice: 19500,
    sellingPrice: 19500,
    avgCost: 15500,
    qtyOnHand: 175,
    minStockAlert: 20,
    createdAt: '2026-02-08',
  },
];

// Helper to generate full historical transactions & strictly balanced journals
export const generateSeedAccountingData = () => {
  const accounts = [...INITIAL_ACCOUNTS];
  const contacts = [...INITIAL_CONTACTS];
  const products = [...INITIAL_PRODUCTS];

  const journalEntries: JournalEntry[] = [];
  const invoices: Invoice[] = [];
  const purchaseBills: PurchaseBill[] = [];
  const cashTransactions: CashTransaction[] = [];
  const payments: Payment[] = [];
  const stockMovements: StockMovement[] = [];

  let journalIndex = 1;
  const createJournal = (
    date: string,
    sourceType: JournalEntry['sourceType'],
    sourceId: string,
    description: string,
    lines: { accountId: string; debit: number; kredit: number; memo?: string }[]
  ): JournalEntry => {
    let totDebit = 0;
    let totKredit = 0;
    const formattedLines: JournalEntry['lines'] = lines.map((l, idx) => {
      totDebit += l.debit;
      totKredit += l.kredit;
      return {
        id: `jl-${journalIndex}-${idx + 1}`,
        journalEntryId: `je-${journalIndex}`,
        accountId: l.accountId,
        debit: l.debit,
        kredit: l.kredit,
        memo: l.memo || description,
      };
    });

    const isBalanced = Math.abs(totDebit - totKredit) < 0.01;
    if (!isBalanced) {
      console.error(`[SEED ERROR] Unbalanced journal: ${description}`, { totDebit, totKredit });
    }

    const je: JournalEntry = {
      id: `je-${journalIndex}`,
      entryNumber: `JV-2026${String(journalIndex).padStart(4, '0')}`,
      date,
      sourceType,
      sourceId,
      description,
      lines: formattedLines,
      totalDebit: totDebit,
      totalKredit: totKredit,
      isBalanced,
      createdAt: date,
      createdBy: 'System Seed',
    };
    journalIndex++;
    journalEntries.push(je);
    return je;
  };

  // 1. FEB 2026: Setoran Modal Awal Pemilik (Rp 450,000,000 ke Bank BCA & Kas)
  createJournal('2026-02-01', 'journal_manual', 'init-capital', 'Setoran Modal Awal Pemilik Toko Sejahtera', [
    { accountId: 'acc-1102', debit: 400000000, kredit: 0, memo: 'Setoran modal ke Bank BCA' },
    { accountId: 'acc-1101', debit: 50000000, kredit: 0, memo: 'Kas awal kasir toko' },
    { accountId: 'acc-3101', debit: 0, kredit: 450000000, memo: 'Modal Disetor Pemilik' },
  ]);

  // 2. FEB 2026: Pembelian Peralatan Toko & Rak Display (Rp 35,000,000)
  createJournal('2026-02-03', 'cash_transaction', 'ct-init-equip', 'Pembelian Rak Display Toko & Komputer Kasir POS', [
    { accountId: 'acc-1201', debit: 35000000, kredit: 0, memo: 'Peralatan Toko & Rak Display' },
    { accountId: 'acc-1102', debit: 0, kredit: 35000000, memo: 'Pembayaran transfer Bank BCA' },
  ]);
  cashTransactions.push({
    id: 'ct-init-equip',
    transactionNumber: 'CSH-202602-001',
    date: '2026-02-03',
    type: 'keluar',
    cashAccountId: 'acc-1102',
    contraAccountId: 'acc-1201',
    category: 'Pembelian Aset Tetap',
    amount: 35000000,
    description: 'Pembelian Rak Display Toko & Komputer Kasir POS',
    createdAt: '2026-02-03',
  });

  // 3. FEB 2026: Pembayaran Sewa Ruko 6 Bulan (Rp 18,000,000 / Rp 3,000,000 per bulan)
  createJournal('2026-02-04', 'cash_transaction', 'ct-rent-feb', 'Pembayaran Sewa Ruko Toko Sejahtera Periode Semester 1', [
    { accountId: 'acc-6102', debit: 18000000, kredit: 0, memo: 'Beban Sewa Ruko' },
    { accountId: 'acc-1102', debit: 0, kredit: 18000000, memo: 'Pembayaran transfer Bank BCA' },
  ]);
  cashTransactions.push({
    id: 'ct-rent-feb',
    transactionNumber: 'CSH-202602-002',
    date: '2026-02-04',
    type: 'keluar',
    cashAccountId: 'acc-1102',
    contraAccountId: 'acc-6102',
    category: 'Beban Operasional',
    amount: 18000000,
    description: 'Pembayaran Sewa Ruko Toko Sejahtera Periode Semester 1',
    createdAt: '2026-02-04',
  });

  // 4. FEB - JUL 2026: Purchase Bills (Pembelian Barang Dagang dengan PPN Masukan 11%)
  const historicalBills = [
    {
      id: 'pb-01',
      billNumber: 'PB-202602-001',
      contactId: 'ct-06',
      contactName: 'CV Maju Pangan Sejahtera (Beras & Gula)',
      date: '2026-02-06',
      dueDate: '2026-03-06',
      items: [
        { id: 'pbi-01', productId: 'prod-01', productName: 'Beras Premium Ramos 5kg', qty: 200, unitCost: 62000, subtotal: 12400000, isTaxable: true, taxAmount: 1364000 },
        { id: 'pbi-02', productId: 'prod-03', productName: 'Gula Pasir Kristal Putih 1kg (Gulaku)', qty: 300, unitCost: 14800, subtotal: 4440000, isTaxable: true, taxAmount: 488400 },
      ],
      subtotal: 16840000,
      taxAmount: 1852400,
      total: 18692400,
      paidAmount: 18692400,
      remainingAmount: 0,
      status: 'lunas' as const,
    },
    {
      id: 'pb-02',
      billNumber: 'PB-202603-002',
      contactId: 'ct-07',
      contactName: 'PT Indofood CBP Distributor',
      date: '2026-03-05',
      dueDate: '2026-04-05',
      items: [
        { id: 'pbi-03', productId: 'prod-04', productName: 'Indomie Goreng Spesial (Karton / 40 pcs)', qty: 150, unitCost: 101000, subtotal: 15150000, isTaxable: true, taxAmount: 1666500 },
        { id: 'pbi-04', productId: 'prod-05', productName: 'Indomie Kuah Ayam Bawang (Karton / 40 pcs)', qty: 120, unitCost: 97500, subtotal: 11700000, isTaxable: true, taxAmount: 1287000 },
      ],
      subtotal: 26850000,
      taxAmount: 2953500,
      total: 29803500,
      paidAmount: 29803500,
      remainingAmount: 0,
      status: 'lunas' as const,
    },
    {
      id: 'pb-03',
      billNumber: 'PB-202604-003',
      contactId: 'ct-05',
      contactName: 'PT Unilever Distributor Nusantara',
      date: '2026-04-10',
      dueDate: '2026-05-10',
      items: [
        { id: 'pbi-05', productId: 'prod-08', productName: 'Deterjen Rinso Molto Anti Noda 770g', qty: 180, unitCost: 19000, subtotal: 3420000, isTaxable: true, taxAmount: 376200 },
        { id: 'pbi-06', productId: 'prod-09', productName: 'Sabun Cuci Piring Sunlight 750ml', qty: 200, unitCost: 13800, subtotal: 2760000, isTaxable: true, taxAmount: 303600 },
      ],
      subtotal: 6180000,
      taxAmount: 679800,
      total: 6859800,
      paidAmount: 6859800,
      remainingAmount: 0,
      status: 'lunas' as const,
    },
    {
      id: 'pb-04',
      billNumber: 'PB-202605-004',
      contactId: 'ct-05',
      contactName: 'PT Unilever Distributor Nusantara',
      date: '2026-05-15',
      dueDate: '2026-06-15',
      items: [
        { id: 'pbi-07', productId: 'prod-08', productName: 'Deterjen Rinso Molto Anti Noda 770g', qty: 120, unitCost: 19000, subtotal: 2280000, isTaxable: true, taxAmount: 250800 },
        { id: 'pbi-08', productId: 'prod-15', productName: 'Pasta Gigi Pepsodent Jumbo 190g', qty: 140, unitCost: 15500, subtotal: 2170000, isTaxable: true, taxAmount: 238700 },
      ],
      subtotal: 4450000,
      taxAmount: 489500,
      total: 4939500,
      paidAmount: 0,
      remainingAmount: 4939500, // Aging: >60 hari
      status: 'belum_dibayar' as const,
    },
    {
      id: 'pb-05',
      billNumber: 'PB-202606-005',
      contactId: 'ct-06',
      contactName: 'CV Maju Pangan Sejahtera (Beras & Gula)',
      date: '2026-06-18',
      dueDate: '2026-07-18',
      items: [
        { id: 'pbi-09', productId: 'prod-01', productName: 'Beras Premium Ramos 5kg', qty: 150, unitCost: 62000, subtotal: 9300000, isTaxable: true, taxAmount: 1023000 },
        { id: 'pbi-10', productId: 'prod-02', productName: 'Minyak Goreng Sania Pouch 2L', qty: 250, unitCost: 31000, subtotal: 7750000, isTaxable: true, taxAmount: 852500 },
      ],
      subtotal: 17050000,
      taxAmount: 1875500,
      total: 18925500,
      paidAmount: 10000000,
      remainingAmount: 8925500, // Aging: 31-60 hari
      status: 'dibayar_sebagian' as const,
    },
    {
      id: 'pb-06',
      billNumber: 'PB-202607-006',
      contactId: 'ct-07',
      contactName: 'PT Indofood CBP Distributor',
      date: '2026-07-20',
      dueDate: '2026-08-20',
      items: [
        { id: 'pbi-11', productId: 'prod-04', productName: 'Indomie Goreng Spesial (Karton / 40 pcs)', qty: 100, unitCost: 101000, subtotal: 10100000, isTaxable: true, taxAmount: 1111000 },
        { id: 'pbi-12', productId: 'prod-06', productName: 'Teh Botol Sosro Kotak (Karton / 24 pcs)', qty: 100, unitCost: 57000, subtotal: 5700000, isTaxable: true, taxAmount: 627000 },
      ],
      subtotal: 15800000,
      taxAmount: 1738000,
      total: 17538000,
      paidAmount: 0,
      remainingAmount: 17538000, // Aging: Belum Jatuh Tempo
      status: 'belum_dibayar' as const,
    },
  ];

  historicalBills.forEach((b) => {
    purchaseBills.push({
      ...b,
      createdAt: b.date,
    });

    createJournal(b.date, 'purchase_bill', b.id, `Tagihan Pembelian Barang: ${b.billNumber} dari ${b.contactName}`, [
      { accountId: 'acc-1104', debit: b.subtotal, kredit: 0, memo: `Persediaan Barang Dagang (${b.billNumber})` },
      { accountId: 'acc-1105', debit: b.taxAmount, kredit: 0, memo: `PPN Masukan 11% (${b.billNumber})` },
      { accountId: 'acc-2101', debit: 0, kredit: b.total, memo: `Hutang Usaha (${b.contactName})` },
    ]);

    b.items.forEach((item) => {
      stockMovements.push({
        id: `sm-in-${item.id}`,
        productId: item.productId,
        productName: item.productName,
        date: b.date,
        type: 'in',
        qty: item.qty,
        unitCost: item.unitCost,
        totalValue: item.subtotal,
        runningBalanceQty: 0,
        runningBalanceValue: 0,
        sourceType: 'purchase_bill',
        sourceId: b.id,
        sourceRefNumber: b.billNumber,
        createdAt: b.date,
      });
    });

    if (b.paidAmount > 0) {
      const payDate = b.date;
      payments.push({
        id: `pay-bill-${b.id}`,
        paymentNumber: `PAY-OUT-${b.id}`,
        type: 'dibayar',
        contactId: b.contactId,
        contactName: b.contactName,
        purchaseBillId: b.id,
        date: payDate,
        amount: b.paidAmount,
        paymentMethod: 'bank_bca',
        paymentAccountId: 'acc-1102',
        notes: `Pelunasan tagihan supplier ${b.billNumber}`,
        createdAt: payDate,
      });

      createJournal(payDate, 'payment_out', b.id, `Pembayaran Tagihan Supplier ${b.billNumber} ke ${b.contactName}`, [
        { accountId: 'acc-2101', debit: b.paidAmount, kredit: 0, memo: `Pelunasan Hutang Usaha (${b.billNumber})` },
        { accountId: 'acc-1102', debit: 0, kredit: b.paidAmount, memo: `Pengeluaran Kas/Bank BCA` },
      ]);
    }
  });

  // 5. FEB - AUG 2026: Sales Invoices (Penjualan Grosir & Retail dengan PPN 11% & HPP)
  const historicalInvoices = [
    {
      id: 'inv-01',
      invoiceNumber: 'INV-202602-001',
      contactId: 'ct-01',
      contactName: 'PT Sumber Makmur Retail',
      date: '2026-02-15',
      dueDate: '2026-03-15',
      items: [
        { id: 'ii-01', productId: 'prod-01', productName: 'Beras Premium Ramos 5kg', qty: 80, unitPrice: 78000, subtotal: 6240000, avgCostSnapshot: 62000, isTaxable: true, taxAmount: 686400 },
        { id: 'ii-02', productId: 'prod-03', productName: 'Gula Pasir Kristal Putih 1kg (Gulaku)', qty: 120, unitPrice: 18500, subtotal: 2220000, avgCostSnapshot: 14800, isTaxable: true, taxAmount: 244200 },
      ],
      subtotal: 8460000,
      taxAmount: 930600,
      total: 9390600,
      paidAmount: 9390600,
      remainingAmount: 0,
      status: 'lunas' as const,
    },
    {
      id: 'inv-02',
      invoiceNumber: 'INV-202603-002',
      contactId: 'ct-02',
      contactName: 'CV Sentosa Jaya Abadi',
      date: '2026-03-18',
      dueDate: '2026-04-18',
      items: [
        { id: 'ii-03', productId: 'prod-04', productName: 'Indomie Goreng Spesial (Karton)', qty: 70, unitPrice: 122000, subtotal: 8540000, avgCostSnapshot: 101000, isTaxable: true, taxAmount: 939400 },
        { id: 'ii-04', productId: 'prod-06', productName: 'Teh Botol Sosro Kotak (Karton)', qty: 50, unitPrice: 72000, subtotal: 3600000, avgCostSnapshot: 57000, isTaxable: true, taxAmount: 396000 },
      ],
      subtotal: 12140000,
      taxAmount: 1335400,
      total: 13475400,
      paidAmount: 13475400,
      remainingAmount: 0,
      status: 'lunas' as const,
    },
    {
      id: 'inv-03',
      invoiceNumber: 'INV-202604-003',
      contactId: 'ct-03',
      contactName: 'Toko Berkah Kelontong',
      date: '2026-04-22',
      dueDate: '2026-05-22',
      items: [
        { id: 'ii-05', productId: 'prod-01', productName: 'Beras Premium Ramos 5kg', qty: 60, unitPrice: 78000, subtotal: 4680000, avgCostSnapshot: 62000, isTaxable: true, taxAmount: 514800 },
        { id: 'ii-06', productId: 'prod-08', productName: 'Deterjen Rinso Molto 770g', qty: 80, unitPrice: 24000, subtotal: 1920000, avgCostSnapshot: 19000, isTaxable: true, taxAmount: 211200 },
      ],
      subtotal: 6600000,
      taxAmount: 726000,
      total: 7326000,
      paidAmount: 0,
      remainingAmount: 7326000, // Aging: >60 hari
      status: 'belum_dibayar' as const,
    },
    {
      id: 'inv-04',
      invoiceNumber: 'INV-202605-004',
      contactId: 'ct-01',
      contactName: 'PT Sumber Makmur Retail',
      date: '2026-05-25',
      dueDate: '2026-06-25',
      items: [
        { id: 'ii-07', productId: 'prod-04', productName: 'Indomie Goreng Spesial (Karton)', qty: 80, unitPrice: 122000, subtotal: 9760000, avgCostSnapshot: 101000, isTaxable: true, taxAmount: 1073600 },
        { id: 'ii-08', productId: 'prod-02', productName: 'Minyak Goreng Sania Pouch 2L', qty: 100, unitPrice: 38500, subtotal: 3850000, avgCostSnapshot: 31000, isTaxable: true, taxAmount: 423500 },
      ],
      subtotal: 13610000,
      taxAmount: 1497100,
      total: 15107100,
      paidAmount: 6000000,
      remainingAmount: 9107100, // Aging: 31-60 hari
      status: 'dibayar_sebagian' as const,
    },
    {
      id: 'inv-05',
      invoiceNumber: 'INV-202606-005',
      contactId: 'ct-04',
      contactName: 'Ibu Ratna Wijaya',
      date: '2026-06-28',
      dueDate: '2026-07-28',
      items: [
        { id: 'ii-09', productId: 'prod-01', productName: 'Beras Premium Ramos 5kg', qty: 50, unitPrice: 78000, subtotal: 3900000, avgCostSnapshot: 62000, isTaxable: true, taxAmount: 429000 },
        { id: 'ii-10', productId: 'prod-13', productName: 'Telur Ayam Negeri (Tray)', qty: 60, unitPrice: 58000, subtotal: 3480000, avgCostSnapshot: 48000, isTaxable: true, taxAmount: 382800 },
      ],
      subtotal: 7380000,
      taxAmount: 811800,
      total: 8191800,
      paidAmount: 0,
      remainingAmount: 8191800, // Aging: 1-30 hari
      status: 'belum_dibayar' as const,
    },
    {
      id: 'inv-06',
      invoiceNumber: 'INV-202607-006',
      contactId: 'ct-02',
      contactName: 'CV Sentosa Jaya Abadi',
      date: '2026-07-24',
      dueDate: '2026-08-24',
      items: [
        { id: 'ii-11', productId: 'prod-02', productName: 'Minyak Goreng Sania Pouch 2L', qty: 120, unitPrice: 38500, subtotal: 4620000, avgCostSnapshot: 31000, isTaxable: true, taxAmount: 508200 },
        { id: 'ii-12', productId: 'prod-06', productName: 'Teh Botol Sosro Kotak (Karton)', qty: 60, unitPrice: 72000, subtotal: 4320000, avgCostSnapshot: 57000, isTaxable: true, taxAmount: 475200 },
      ],
      subtotal: 8940000,
      taxAmount: 983400,
      total: 9923400,
      paidAmount: 0,
      remainingAmount: 9923400, // Aging: Belum Jatuh Tempo
      status: 'belum_dibayar' as const,
    },
  ];

  historicalInvoices.forEach((inv) => {
    invoices.push({
      ...inv,
      createdAt: inv.date,
    });

    const totalCOGS = inv.items.reduce((sum, item) => sum + item.qty * item.avgCostSnapshot, 0);

    createJournal(inv.date, 'sales_invoice', inv.id, `Faktur Penjualan: ${inv.invoiceNumber} ke ${inv.contactName}`, [
      { accountId: 'acc-1103', debit: inv.total, kredit: 0, memo: `Piutang Usaha (${inv.invoiceNumber})` },
      { accountId: 'acc-4101', debit: 0, kredit: inv.subtotal, memo: `Pendapatan Penjualan (${inv.invoiceNumber})` },
      { accountId: 'acc-2102', debit: 0, kredit: inv.taxAmount, memo: `PPN Keluaran 11% (${inv.invoiceNumber})` },
      { accountId: 'acc-5101', debit: totalCOGS, kredit: 0, memo: `HPP Penjualan (${inv.invoiceNumber})` },
      { accountId: 'acc-1104', debit: 0, kredit: totalCOGS, memo: `Pengurangan Persediaan Barang (${inv.invoiceNumber})` },
    ]);

    inv.items.forEach((item) => {
      stockMovements.push({
        id: `sm-out-${item.id}`,
        productId: item.productId,
        productName: item.productName,
        date: inv.date,
        type: 'out',
        qty: item.qty,
        unitCost: item.avgCostSnapshot,
        totalValue: item.qty * item.avgCostSnapshot,
        runningBalanceQty: 0,
        runningBalanceValue: 0,
        sourceType: 'sales_invoice',
        sourceId: inv.id,
        sourceRefNumber: inv.invoiceNumber,
        createdAt: inv.date,
      });
    });

    if (inv.paidAmount > 0) {
      payments.push({
        id: `pay-inv-${inv.id}`,
        paymentNumber: `PAY-IN-${inv.id}`,
        type: 'diterima',
        contactId: inv.contactId,
        contactName: inv.contactName,
        invoiceId: inv.id,
        date: inv.date,
        amount: inv.paidAmount,
        paymentMethod: 'bank_bca',
        paymentAccountId: 'acc-1102',
        notes: `Penerimaan pembayaran invoice ${inv.invoiceNumber}`,
        createdAt: inv.date,
      });

      createJournal(inv.date, 'payment_in', inv.id, `Penerimaan Pelunasan Invoice ${inv.invoiceNumber} dari ${inv.contactName}`, [
        { accountId: 'acc-1102', debit: inv.paidAmount, kredit: 0, memo: `Penerimaan Dana ke Bank BCA` },
        { accountId: 'acc-1103', debit: 0, kredit: inv.paidAmount, memo: `Pelunasan Piutang Usaha (${inv.invoiceNumber})` },
      ]);
    }
  });

  // 6. Direct POS Retail Cash Sales (Harian Kas Masuk dari Kasir Toko Sejahtera)
  // Generating steady cash sales per month
  const monthlyRetailSales = [
    { date: '2026-02-27', amount: 18500000, cogs: 13500000, desc: 'Penjualan Kasir POS Retail Toko Februari' },
    { date: '2026-03-30', amount: 22400000, cogs: 16200000, desc: 'Penjualan Kasir POS Retail Toko Maret' },
    { date: '2026-04-29', amount: 24800000, cogs: 17900000, desc: 'Penjualan Kasir POS Retail Toko April' },
    { date: '2026-05-30', amount: 26500000, cogs: 19100000, desc: 'Penjualan Kasir POS Retail Toko Mei' },
    { date: '2026-06-29', amount: 28200000, cogs: 20400000, desc: 'Penjualan Kasir POS Retail Toko Juni' },
    { date: '2026-07-30', amount: 31500000, cogs: 22800000, desc: 'Penjualan Kasir POS Retail Toko Juli' },
  ];

  monthlyRetailSales.forEach((pos, idx) => {
    createJournal(pos.date, 'cash_transaction', `pos-sale-${idx}`, pos.desc, [
      { accountId: 'acc-1101', debit: pos.amount, kredit: 0, memo: 'Penerimaan Kasir POS Tunai/QRIS' },
      { accountId: 'acc-4101', debit: 0, kredit: pos.amount, memo: 'Pendapatan Penjualan Retail' },
      { accountId: 'acc-5101', debit: pos.cogs, kredit: 0, memo: 'HPP Penjualan Kasir' },
      { accountId: 'acc-1104', debit: 0, kredit: pos.cogs, memo: 'Pengurangan Stok Barang Kasir' },
    ]);

    cashTransactions.push({
      id: `pos-sale-${idx}`,
      transactionNumber: `CSH-POS-${idx}`,
      date: pos.date,
      type: 'masuk',
      cashAccountId: 'acc-1101',
      contraAccountId: 'acc-4101',
      category: 'Penjualan Kasir Retail',
      amount: pos.amount,
      description: pos.desc,
      createdAt: pos.date,
    });
  });

  // 7. Monthly Operating Expenses (Gaji, Listrik, Internet) across 6 months
  const monthlyExpenses = [
    { date: '2026-02-28', salary: 4500000, utilities: 850000, bankFee: 50000 },
    { date: '2026-03-31', salary: 4500000, utilities: 890000, bankFee: 55000 },
    { date: '2026-04-30', salary: 4500000, utilities: 920000, bankFee: 60000 },
    { date: '2026-05-31', salary: 4500000, utilities: 900000, bankFee: 55000 },
    { date: '2026-06-30', salary: 5000000, utilities: 950000, bankFee: 65000 },
    { date: '2026-07-31', salary: 5000000, utilities: 980000, bankFee: 70000 },
  ];

  monthlyExpenses.forEach((exp, idx) => {
    // Salary
    createJournal(exp.date, 'cash_transaction', `salary-${idx}`, `Pembayaran Gaji Karyawan Periode ${exp.date}`, [
      { accountId: 'acc-6101', debit: exp.salary, kredit: 0, memo: 'Beban Gaji Karyawan' },
      { accountId: 'acc-1102', debit: 0, kredit: exp.salary, memo: 'Transfer Payroll Bank BCA' },
    ]);
    cashTransactions.push({
      id: `salary-${idx}`,
      transactionNumber: `CSH-PAYROLL-${idx}`,
      date: exp.date,
      type: 'keluar',
      cashAccountId: 'acc-1102',
      contraAccountId: 'acc-6101',
      category: 'Beban Gaji Karyawan',
      amount: exp.salary,
      description: `Payroll Gaji Karyawan (${exp.date})`,
      createdAt: exp.date,
    });

    // Utilities
    createJournal(exp.date, 'cash_transaction', `util-${idx}`, `Pembayaran Tagihan Listrik PLN & Internet Toko (${exp.date})`, [
      { accountId: 'acc-6103', debit: exp.utilities, kredit: 0, memo: 'Beban Listrik, Air & Internet' },
      { accountId: 'acc-1101', debit: 0, kredit: exp.utilities, memo: 'Pembayaran Kas Operasional' },
    ]);
    cashTransactions.push({
      id: `util-${idx}`,
      transactionNumber: `CSH-UTIL-${idx}`,
      date: exp.date,
      type: 'keluar',
      cashAccountId: 'acc-1101',
      contraAccountId: 'acc-6103',
      category: 'Beban Listrik & Utilitas',
      amount: exp.utilities,
      description: `Listrik PLN & Internet Toko (${exp.date})`,
      createdAt: exp.date,
    });

    // Bank Admin Fee
    createJournal(exp.date, 'cash_transaction', `fee-${idx}`, `Beban Administrasi Bank BCA & QRIS (${exp.date})`, [
      { accountId: 'acc-6104', debit: exp.bankFee, kredit: 0, memo: 'Beban Administrasi Bank' },
      { accountId: 'acc-1102', debit: 0, kredit: exp.bankFee, memo: 'Auto Debet Rekening BCA' },
    ]);
  });

  return {
    accounts,
    contacts,
    products,
    invoices,
    purchaseBills,
    cashTransactions,
    payments,
    journalEntries,
    stockMovements,
  };
};
