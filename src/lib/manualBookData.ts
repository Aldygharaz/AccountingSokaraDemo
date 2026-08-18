export interface ManualTopic {
  id: string;
  category: 'workflow' | 'coa' | 'closing' | 'tax' | 'executive' | 'glossary';
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  formulaOrRule?: string;
  businessContext: string;
  practicalSteps: string[];
  keyTerms: { term: string; explanation: string }[];
  targetTab?: string;
}

export const MANUAL_TOPICS: ManualTopic[] = [
  // ==========================================
  // 1. Alur Transaksi, Kasir POS & Penagihan AR
  // ==========================================
  {
    id: 'workflow-pos-sales',
    category: 'workflow',
    title: 'Alur Kasir POS & Penjualan Tunai Retail',
    subtitle: 'Pencatatan penjualan cepat dengan barcode scanner hardware (<50ms)',
    badge: 'Retail POS',
    description:
      'Setiap kali kasir memproses barang di kasir POS, sistem secara simultan membuat jurnal kas dan memotong kuantitas persediaan fisik di gudang secara otomatis dengan metode Moving Average Costing.',
    formulaOrRule:
      'Jurnal Otomatis:\n[Debit] Kas Toko (1101)  =  [Kredit] Pendapatan Penjualan (4101) + PPN Keluaran 11% (2102)\n[Debit] Beban Pokok Penjualan HPP (5101)  =  [Kredit] Persediaan Barang Dagang (1104)',
    businessContext:
      'Mencegah selisih kas fisik di akhir shift dan mencegah stok minus atau fiktif tanpa perlu staf menginput jurnal umum secara manual.',
    practicalSteps: [
      'Buka Terminal Kasir POS dengan menekan tombol shortcut F4.',
      'Arahkan barcode scanner hardware ke produk atau klik item pada daftar barang.',
      'Masukkan nominal uang tunai yang diterima (sistem otomatis membulatkan kembalian ke Rp 100 terdekat).',
      'Tekan Cetak Struk / Selesaikan Transaksi — jurnal berpasangan otomatis terbentuk dan struk thermal 78mm siap dicetak.',
    ],
    keyTerms: [
      {
        term: 'Moving Average Costing',
        explanation: 'Harga pokok rata-rata tertimbang yang dihitung ulang setiap kali ada pembelian barang baru.',
      },
      {
        term: 'Cash Change Rounding',
        explanation: 'Pembulatan nilai kembalian ke pecahan Rp 100 terdekat sesuai standar peritel modern di Indonesia.',
      },
    ],
    targetTab: 'pos',
  },
  {
    id: 'workflow-b2b-invoice-collection',
    category: 'workflow',
    title: 'Faktur Penjualan Kredit & Penagihan 1-Klik WhatsApp',
    subtitle: 'Penagihan invoice tempo (Net 30/60) dengan verifikasi silang neraca dan auto WA reminder',
    badge: 'B2B & AR Aging',
    description:
      'Digunakan untuk penjualan barang dalam partai besar ke distributor atau toko mitra dengan termin pembayaran mundur. Sistem mencatat Piutang Usaha, menghitung umur piutang (Aging), dan menyediakan tombol 1-klik template WhatsApp penagihan.',
    formulaOrRule:
      'Saat Terbit Faktur:\n[Debit] Piutang Usaha (1103)  =  [Kredit] Penjualan (4101) + PPN 11% (2102)\nSaat Pelunasan:\n[Debit] Bank BCA (1102)  =  [Kredit] Piutang Usaha (1103)',
    businessContext:
      'Menjaga Days Sales Outstanding (DSO) tetap rendah (<30 hari) agar arus kas operasional toko tidak macet di tangan pembeli.',
    practicalSteps: [
      'Buka menu Transaksi lalu klik "+ Faktur Penjualan".',
      'Pilih nama pelanggan terdaftar dan tentukan tanggal jatuh tempo (misal: Net 30 hari).',
      'Pilih produk dan tentukan kuantitas penjualan.',
      'Klik Simpan Faktur — sistem mencatat piutang dan mengupdate buku pembantu piutang pelanggan.',
      'Jika invoice mendekati/lewat jatuh tempo, klik ikon WA di tabel AR untuk mengirim pesan tagihan instan.',
    ],
    keyTerms: [
      {
        term: 'Days Sales Outstanding (DSO)',
        explanation: 'Rata-rata waktu (dalam hari) yang dibutuhkan untuk mengumpulkan uang tunai dari penjualan kredit.',
      },
      {
        term: 'Aging Buckets',
        explanation: 'Pengelompokan faktur belum bayar berdasarkan usia: 0-30 hari, 31-60 hari, 61-90 hari, dan >90 hari.',
      },
    ],
    targetTab: 'arap',
  },
  {
    id: 'workflow-sku-profitability',
    category: 'workflow',
    title: 'Matriks Profitabilitas SKU & Analisis Kontribusi Produk',
    subtitle: 'Evaluasi margin kotor dan ranking kontribusi laba per produk barang dagang',
    badge: 'SKU Economics',
    description:
      'Menganalisis margin kotor riil setiap SKU berdasarkan selisih harga jual dan moving average cost, serta menghitung persentase kontribusi laba tiap produk terhadap total keuntungan kotor bisnis.',
    formulaOrRule:
      'Gross Margin % = ((Harga Jual - Rata-rata HPP) / Harga Jual) * 100%\nKontribusi Laba % = (Total Profit SKU / Total Profit Seluruh SKU) * 100%',
    businessContext:
      'Membantu pemilik toko mengidentifikasi produk "Star" (volume tinggi, margin tinggi) dan menghentikan atau merevisi harga produk "Dog" (margin tipis atau minus).',
    practicalSteps: [
      'Buka menu Analisis Finansial.',
      'Scroll ke bagian "Matriks Kontribusi & Profitabilitas SKU".',
      'Filter berdasarkan kategori (Sembako, Minuman, Makanan Ringan, dsb).',
      'Periksa persentase margin kotor dan ranking kontributor keuntungan teratas.',
    ],
    keyTerms: [
      {
        term: 'Margin Kotor (Gross Margin)',
        explanation: 'Selisih persentase antara harga jual ke konsumen dengan modal beli rata-rata barang.',
      },
      {
        term: 'Profit Contribution Share',
        explanation: 'Porsi kontribusi nominal keuntungan produk tertentu terhadap total keuntungan toko.',
      },
    ],
    targetTab: 'analytics',
  },

  // ==========================================
  // 2. Chart of Accounts (COA) & Aturan Double-Entry
  // ==========================================
  {
    id: 'coa-basics',
    category: 'coa',
    title: 'Struktur Bagan Akun (Chart of Accounts) & Invarian Double-Entry',
    subtitle: 'Hirarki 5 kategori akun standar PSAK / SAK EMKM Indonesia',
    badge: 'Fondasi Akuntansi',
    description:
      'Setiap akun dalam sistem memiliki nomor kode unik, klasifikasi sub-tipe, dan saldo normal (Debit atau Kredit) yang menjamin persamaan dasar akuntansi selalu seimbang.',
    formulaOrRule: 'Persamaan Dasar Akuntansi:\nASET = LIABILITAS + EKUITAS + (PENDAPATAN - BEBAN)',
    businessContext:
      'Menjadi pondasi tunggal bagi penyusunan Laporan Laba Rugi dan Neraca tanpa rekayasa angka manual.',
    practicalSteps: [
      'Grup 1xxx: Aset (Kas, Bank, Piutang, Persediaan, Aset Tetap) — Saldo Normal DEBIT.',
      'Grup 2xxx: Liabilitas (Hutang Usaha, PPN Keluaran, Hutang Bank) — Saldo Normal KREDIT.',
      'Grup 3xxx: Ekuitas (Modal Disetor, Laba Ditahan) — Saldo Normal KREDIT.',
      'Grup 4xxx: Pendapatan (Penjualan Retail, Jasa Distribusi) — Saldo Normal KREDIT.',
      'Grup 5xxx & 6xxx: Beban (HPP, Gaji, Sewa, Listrik, Penyusutan) — Saldo Normal DEBIT.',
    ],
    keyTerms: [
      {
        term: 'Saldo Normal',
        explanation: 'Sisi (Debit atau Kredit) di mana nilai akun akan bertambah nilainya.',
      },
      {
        term: 'T-Account Drilldown',
        explanation: 'Buku besar interaktif yang merinci mutasi kronologis dari setiap akun spesifik.',
      },
    ],
    targetTab: 'coa',
  },

  // ==========================================
  // 3. Tutup Buku, Rekonsiliasi Bank & Cash Flow
  // ==========================================
  {
    id: 'closing-month-end',
    category: 'closing',
    title: 'Prosedur Tutup Buku Periode (Month-End Closing Wizard)',
    subtitle: 'Penguncian mutasi fiskal dan pemindahan laba bersih ke Laba Ditahan',
    badge: 'Kepatuhan PSAK',
    description:
      'Fitur tutup buku bulanan mengenolkan akun-akun nominal (Pendapatan & Beban) pada Ikhtisar Laba Rugi dan memindahkan surplus keuntungan bersih ke akun Ekuitas Laba Ditahan (Akun 3102).',
    formulaOrRule:
      'Jurnal Penutup:\n[Debit] Seluruh Akun Pendapatan (4xxx)  =  [Kredit] Ikhtisar Laba Rugi (3999)\n[Debit] Ikhtisar Laba Rugi (3999)  =  [Kredit] Seluruh Akun Beban (5xxx & 6xxx)\n[Debit] Ikhtisar Laba Rugi (3999)  =  [Kredit] Laba Ditahan (3102)',
    businessContext:
      'Mengunci data masa lalu agar tidak dapat diedit atau dimanipulasi secara retrospektif oleh staf, memenuhi syarat audit BPK / KAP independen.',
    practicalSteps: [
      'Pastikan seluruh mutasi bank telah direkonsiliasi di menu Rekonsiliasi Bank (Ctrl + B).',
      'Jalankan penyusutan aset bulanan di menu Aset Tetap.',
      'Tekan shortcut F8 untuk membuka Period Closing Wizard.',
      'Pilih bulan buku yang akan ditutup lalu klik "Kunci & Terbitkan Jurnal Penutup".',
    ],
    keyTerms: [
      {
        term: 'Retained Earnings (Laba Ditahan)',
        explanation: 'Akumulasi laba bersih historis perusahaan yang tidak dibagikan sebagai dividen.',
      },
      {
        term: 'Period Lock',
        explanation: 'Status proteksi yang menolak penerbitan transaksi baru dengan tanggal di masa yang telah ditutup.',
      },
    ],
    targetTab: 'closing',
  },
  {
    id: 'bank-reconciliation-heuristics',
    category: 'closing',
    title: 'Rekonsiliasi Bank Otomatis (Multi-Heuristic Confidence Match)',
    subtitle: 'Pencocokan mutasi rekening koran bank vs buku kas internal dengan confidence score',
    badge: 'Cash Control',
    description:
      'Sistem mencocokkan baris mutasi rekening koran (BCA/Mandiri) dengan jurnal kas internal menggunakan 3 tingkatan heuristik kecocokan.',
    formulaOrRule:
      'Confidence Tiers:\n- 100% Match: Nomor referensi/faktur transaksi persis sama.\n- 90% Match: Nominal persis sama & tanggal mutasi berada dalam rentang +-3 hari.\n- 75% Match: Deteksi kata kunci biaya admin bank / bunga tabungan untuk auto-posting jurnal penyesuaian.',
    businessContext:
      'Menghilangkan selisih antara saldo buku kas perusahaan dengan saldo riil rekening koran di bank.',
    practicalSteps: [
      'Buka menu Rekonsiliasi Bank (Ctrl + B).',
      'Periksa baris mutasi rekening koran yang belum cocok.',
      'Klik tombol "Cocokkan Semua (Auto-Match)" untuk mengeksekusi rekonsiliasi instan pada mutasi berconfidence tinggi.',
      'Verifikasi bahwa Selisih Rekonsiliasi menjadi Rp 0.',
    ],
    keyTerms: [
      {
        term: 'Outstanding Cheques / Deposit in Transit',
        explanation: 'Transaksi yang sudah dicatat di pembukuan internal tetapi belum tercatat di mutasi bank.',
      },
      {
        term: 'Biaya Administrasi Bank',
        explanation: 'Biaya potongan bulanan oleh pihak bank yang otomatis dijurnal sebagai Beban Operasional.',
      },
    ],
    targetTab: 'banking',
  },
  {
    id: 'cash-flow-forecast-90-days',
    category: 'closing',
    title: 'Proyeksi Arus Kas 90 Hari (Rolling Cash Flow Forecast)',
    subtitle: 'Simulasi likuiditas harian, safety buffer, dan titik kritis kas masa depan',
    badge: 'Liquidity Model',
    description:
      'Memetakan posisi saldo kas awal, jadwal jatuh tempo tagihan piutang dan hutang yang telah terjadwal, serta memproyeksikan burn rate harian yang dinamis terhadap slider pertumbuhan penjualan dan inflasi.',
    formulaOrRule:
      'Kas Hari ke-N = Kas Hari ke-(N-1) + AR Due Hari N - AP Due Hari N + (Proyeksi Penjualan Harian - Proyeksi Beban Harian)\nSafety Buffer Kas = Rp 10.000.000',
    businessContext:
      'Memberikan peringatan dini (early warning) hingga 3 bulan ke depan sebelum perusahaan mengalami krisis likuiditas atau kekurangan kas untuk membayar supplier.',
    practicalSteps: [
      'Buka menu Laporan Keuangan lalu pilih tab "Simulasi Kas & Margin".',
      'Amati kurva area arus kas 90 hari dan garis Safety Buffer merah (Rp 10 Juta).',
      'Geser slider Pertumbuhan Penjualan, Inflasi HPP, atau Efisiensi Beban untuk melihat respon kurva kas secara langsung.',
    ],
    keyTerms: [
      {
        term: 'Lowest Liquidity Point',
        explanation: 'Titik terendah saldo kas yang diperkirakan terjadi dalam 90 hari ke depan beserta tanggal estimasinya.',
      },
      {
        term: 'Safety Buffer',
        explanation: 'Batas cadangan kas minimum yang wajib dipertahankan untuk mengantisipasi ketidakpastian operasional.',
      },
    ],
    targetTab: 'reports',
  },

  // ==========================================
  // 4. Pajak & Kepatuhan Fiskal Indonesia
  // ==========================================
  {
    id: 'tax-indonesia-compliance',
    category: 'tax',
    title: 'Kepatuhan Pajak Indonesia: PPN 11%, PPh 23, & SPT 1771',
    subtitle: 'Perhitungan pajak otomatis dan kertas kerja rekonsiliasi fiskal UU HPP',
    badge: 'DJP & UU HPP',
    description:
      'Software secara otomatis memisahkan PPN Masukan (pembelian) dan PPN Keluaran (penjualan) untuk menghasilkan Surat Pemberitahuan (SPT) PPN Kurang/Lebih Bayar, serta modul SPT Tahunan Badan 1771 dengan Koreksi Fiskal Positif & Negatif.',
    formulaOrRule:
      'SPT PPN:\nPPN Kurang Bayar = PPN Keluaran (Penjualan 11%) - PPN Masukan (Pembelian 11%)\n\nPasal 31E UU PPh:\nBadan Usaha omset <= Rp 4.8 Miliar mendapatkan diskon tarif pajak 50% (yaitu tarif efektif 11%).',
    businessContext:
      'Menghindarkan perusahaan dari denda sanksi perpajakan DJP dan memudahkan pengisian formulir SPT elektronik (e-Faktur & e-SPT).',
    practicalSteps: [
      'Setiap faktur penjualan otomatis memungut PPN 11% ke akun 2102.',
      'Setiap tagihan pembelian bahan/stok otomatis mencatat PPN Masukan ke akun 1105.',
      'Buka menu Tax Studio untuk melihat komparasi PPN Masukan vs Keluaran.',
      'Tekan menu SPT 1771 untuk mengkalkulasi koreksi fiskal biaya non-deductible (natura PMK-66, sumbangan, denda).',
    ],
    keyTerms: [
      {
        term: 'Koreksi Fiskal Positif',
        explanation: 'Biaya komersial yang tidak boleh diakui menurut aturan pajak sehingga menambah laba kena pajak.',
      },
      {
        term: 'PPh Pasal 23',
        explanation: 'Pajak pemotongan 2% atas transaksi jasa teknik, manajemen, dan konsultan bisnis.',
      },
    ],
    targetTab: 'tax',
  },

  // ==========================================
  // 5. Metrik Keuangan Eksekutif & Investor
  // ==========================================
  {
    id: 'executive-cfo-metrics',
    category: 'executive',
    title: 'Pusat Analisis Eksekutif, DCF Valuation & Altman Z-Score',
    subtitle: 'Instrumen evaluasi kesehatan finansial untuk CEO, CFO, & Calon Investor',
    badge: 'CFO Studio',
    description:
      'Mengolah data historis pembukuan menjadi instrumen proyeksi masa depan: Free Cash Flow to Firm (FCFF), WACC, DuPont 3-Stage Breakdown, dan skor solvabilitas Altman Z-Score.',
    formulaOrRule:
      'Altman Z-Score = 1.2(X1) + 1.4(X2) + 3.3(X3) + 0.6(X4) + 0.999(X5)\nSkor > 2.99 = Safe Zone (Bebas Risiko Kepailitan)\n\nDuPont ROE = Margin Laba Bersih x Perputaran Aset x Financial Leverage',
    businessContext:
      'Menjawab pertanyaan kritis pemilik bisnis: "Apakah bisnis kita menghasilkan kas riil?", "Berapa nilai valuasi wajar perusahaan?", dan "Kapan kita butuh suntikan modal baru?".',
    practicalSteps: [
      'Buka Dashboard Eksekutif untuk memantau Runway Kas dan Working Capital Cycle.',
      'Tekan shortcut F9 untuk membuka Analisis Kinerja Keuangan (DuPont ROE & Working Capital Breakdown).',
      'Pilih menu Valuasi DCF untuk mensimulasikan nilai valuasi ekuitas saham berdasarkan proyeksi arus kas 5 tahun.',
      'Cetak laporan Ringkasan Eksekutif untuk presentasi kepada investor atau perbankan.',
    ],
    keyTerms: [
      {
        term: 'WACC (Weighted Average Cost of Capital)',
        explanation: 'Rata-rata tertimbang biaya modal sendiri (ekuitas) dan biaya hutang berbunga.',
      },
      {
        term: 'Cash Runway',
        explanation: 'Jumlah bulan perusahaan dapat bertahan hidup beroperasi jika tanpa pemasukan baru.',
      },
    ],
    targetTab: 'cfo',
  },

  // ==========================================
  // 6. Glosarium Istilah Akuntansi A-Z
  // ==========================================
  {
    id: 'glossary-quick-reference',
    category: 'glossary',
    title: 'Kamus Istilah Akuntansi & Finansial Bisnis (A-Z Glossary)',
    subtitle: 'Definisi ringkas istilah pembukuan untuk pemilik usaha non-keuangan',
    badge: 'Kamus Bisnis',
    description:
      'Panduan referensi cepat yang menjelaskan istilah-istilah akuntansi modern dalam bahasa bisnis yang mudah dipahami.',
    businessContext:
      'Menjembatani komunikasi antara pemilik bisnis, staf operasional, akuntan internal, dan auditor eksternal.',
    practicalSteps: [
      'Gunakan kotak pencarian di atas untuk mencari istilah seperti "ECL", "Amortisasi", "HPP", "DuPont", atau "Depresiasi".',
      'Setiap istilah dilengkapi dengan formula dan contoh dampaknya terhadap kas perusahaan.',
    ],
    keyTerms: [
      {
        term: 'Accrual Basis (Basis Akrual)',
        explanation: 'Metode pencatatan di mana pendapatan dan beban diakui saat transaksi terjadi, bukan saat uang kas diterima/dibayar.',
      },
      {
        term: 'Amortisasi (PSAK 1)',
        explanation: 'Pengalokasian biaya dibayar dimuka (seperti sewa gedung tahunan) menjadi beban operasional bulanan secara proporsional.',
      },
      {
        term: 'BOP (Biaya Overhead Pabrik)',
        explanation: 'Biaya produksi selain bahan baku langsung dan tenaga kerja langsung (misal: listrik mesin, depresiasi alat pabrik).',
      },
      {
        term: 'CKPN / ECL (Expected Credit Loss - PSAK 71)',
        explanation: 'Alokasi cadangan risiko kerugian atas piutang pelanggan yang berpotensi macet atau gagal bayar berdasarkan bucket umur faktur.',
      },
      {
        term: 'Depresiasi Garis Lurus (Straight-Line Depreciation)',
        explanation: 'Metode penyusutan aset tetap di mana nilai beban penyusutan bernilai sama setiap bulannya sepanjang umur ekonomis.',
      },
      {
        term: 'FIFO (First-In, First-Out)',
        explanation: 'Asumsi arus persediaan di mana barang yang pertama kali dibeli adalah yang pertama kali dikeluarkan/dijual.',
      },
      {
        term: 'HPP (Harga Pokok Penjualan / COGS)',
        explanation: 'Total biaya perolehan persediaan atau biaya produksi langsung atas barang dagangan yang berhasil terjual.',
      },
      {
        term: 'Jurnal Balik (Reversing Entry)',
        explanation: 'Entri jurnal opsional di awal periode baru untuk membalik jurnal penyesuaian periode sebelumnya.',
      },
      {
        term: 'Neraca Scontro (Balance Sheet)',
        explanation: 'Laporan posisi keuangan format horizontal di mana Aset berada di sisi kiri dan Liabilitas + Ekuitas di sisi kanan.',
      },
      {
        term: 'Internal Control & Validasi Jurnal Otomatis',
        explanation: 'Mekanisme pencegahan kesalahan operasional dengan tombol 1-klik koreksi untuk menyelesaikan anomali pembukuan.',
      },
      {
        term: 'Audit Trail Kriptografis SHA-256 (Anti-Tamper Ledger)',
        explanation: 'Penyegelan integritas buku besar dengan tanda tangan hash kriptografi SHA-256 untuk mendeteksi manipulasi jurnal.',
      },
      {
        term: 'Valuta Asing Revaluasi (PSAK 10)',
        explanation: 'Penyesuaian saldo piutang/hutang mata uang asing ke kurs tengah Bank Indonesia (JISDOR) pada tanggal pelaporan.',
      },
    ],
  },
];
