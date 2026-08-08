import {
  Account,
  Contact,
  Product,
  JournalEntry,
  SalesInvoice,
  PurchaseBill,
  CashTransaction,
  StockMovement,
  UserSession,
  FixedAsset,
  BankStatementItem,
} from '../types/accounting';
import {
  INITIAL_ACCOUNTS,
  INITIAL_CONTACTS,
  INITIAL_PRODUCTS,
  generateSeedAccountingData,
} from './seedData';
import { INITIAL_USERS } from './userData';
import {
  validateJournalBalance,
  calculateWeightedAverageCost,
  formatIDR,
} from './accountingEngine';
import Decimal from 'decimal.js';

import {
  ClosedPeriod,
} from '../types/accounting';
import {
  generateClosingEntries,
  isPeriodLocked,
} from './closingEngine';
import {
  buildLedgerHashChain,
  verifyLedgerChainIntegrity,
  AuditHashBlock,
} from './forensicAudit';
import {
  DEFAULT_FOREX_RATES,
  DEMO_FOREX_EXPOSURES,
  generateForexRevaluationJournal,
  ForexCurrency,
  ForexAccountExposure,
} from './forexEngine';
import {
  INITIAL_PREPAID_EXPENSES,
  generateAmortizationJournal,
  PrepaidExpense,
} from './amortizationEngine';

export interface AppState {
  accounts: Account[];
  contacts: Contact[];
  products: Product[];
  journalEntries: JournalEntry[];
  invoices: SalesInvoice[];
  purchaseBills: PurchaseBill[];
  cashTransactions: CashTransaction[];
  stockMovements: StockMovement[];
  fixedAssets: FixedAsset[];
  bankStatements: BankStatementItem[];
  closedPeriods: ClosedPeriod[];
  prepaidExpenses: PrepaidExpense[];
  forexRates: ForexCurrency[];
  forexExposures: ForexAccountExposure[];
  currentUser: UserSession;
}

const STORAGE_KEY = 'LEDGER_LOGIC_ACCOUNTING_DB_V3';

export const INITIAL_FIXED_ASSETS: FixedAsset[] = [
  {
    id: 'fa-1',
    code: 'AST-001',
    name: 'Rak Display Minimarket & Gondola Baja',
    category: 'peralatan',
    acquisitionDate: '2026-02-05',
    acquisitionCost: 15000000,
    salvageValue: 1000000,
    usefulLifeMonths: 48,
    assetAccountId: 'acc-1201',
    accumulatedDeprAccountId: 'acc-1202',
    deprExpenseAccountId: 'acc-6103',
    accumulatedDepreciation: 1750000,
    netBookValue: 13250000,
    lastDepreciationDate: '2026-07-31',
  },
  {
    id: 'fa-2',
    code: 'AST-002',
    name: 'Komputer Kasir POS Touchscreen & Thermal Printer',
    category: 'elektronik',
    acquisitionDate: '2026-02-10',
    acquisitionCost: 12000000,
    salvageValue: 1000000,
    usefulLifeMonths: 36,
    assetAccountId: 'acc-1201',
    accumulatedDeprAccountId: 'acc-1202',
    deprExpenseAccountId: 'acc-6103',
    accumulatedDepreciation: 1833333,
    netBookValue: 10166667,
    lastDepreciationDate: '2026-07-31',
  },
];

export const INITIAL_BANK_STATEMENTS: BankStatementItem[] = [
  {
    id: 'bs-1',
    date: '2026-08-01',
    description: 'TRSF CR TOKO AMANAH JAYA PELUNASAN',
    amount: 17926500,
    type: 'credit',
    isReconciled: true,
    referenceNo: 'INV-2026-0001',
  },
  {
    id: 'bs-2',
    date: '2026-08-02',
    description: 'TRSF DB PT INDOFOOD DISTRIBUSI TAGIHAN',
    amount: 14763000,
    type: 'debit',
    isReconciled: true,
    referenceNo: 'BILL-2026-0001',
  },
  {
    id: 'bs-3',
    date: '2026-08-05',
    description: 'BIAYA ADM REK BANK BCA BULANAN',
    amount: 25000,
    type: 'debit',
    isReconciled: false,
  },
  {
    id: 'bs-4',
    date: '2026-08-05',
    description: 'PENDAPATAN BUNGA JASA GIRO BANK BCA',
    amount: 185000,
    type: 'credit',
    isReconciled: false,
  },
];

function loadInitialState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.accounts) && Array.isArray(parsed.journalEntries)) {
        return {
          accounts: parsed.accounts,
          contacts: parsed.contacts || INITIAL_CONTACTS,
          products: parsed.products || INITIAL_PRODUCTS,
          journalEntries: parsed.journalEntries,
          invoices: parsed.invoices || [],
          purchaseBills: parsed.purchaseBills || [],
          cashTransactions: parsed.cashTransactions || [],
          stockMovements: parsed.stockMovements || [],
          fixedAssets: parsed.fixedAssets || INITIAL_FIXED_ASSETS,
          bankStatements: parsed.bankStatements || INITIAL_BANK_STATEMENTS,
          closedPeriods: parsed.closedPeriods || [],
          prepaidExpenses: parsed.prepaidExpenses || INITIAL_PREPAID_EXPENSES,
          forexRates: parsed.forexRates || DEFAULT_FOREX_RATES,
          forexExposures: parsed.forexExposures || DEMO_FOREX_EXPOSURES,
          currentUser: parsed.currentUser || INITIAL_USERS[0],
        };
      }
    }
  } catch (err) {
    console.error('Failed to load storage, resetting to seed:', err);
  }

  const seeded = generateSeedAccountingData();

  // Convert seeded types to store types
  const convertedInvoices: SalesInvoice[] = seeded.invoices.map((inv: any) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    contactId: inv.contactId,
    contactName: inv.contactName,
    date: inv.date,
    dueDate: inv.dueDate,
    items: inv.items.map((it: any) => ({
      productId: it.productId,
      qty: it.qty,
      unitPrice: it.unitPrice,
      subtotal: it.subtotal,
      cogsAmount: it.cogsAmount || it.subtotal * 0.75,
    })),
    subtotal: inv.subtotal,
    taxRate: inv.taxRate || 0.11,
    taxAmount: inv.taxAmount,
    total: inv.total,
    paidAmount: inv.paidAmount,
    remainingAmount: inv.remainingAmount,
    status: inv.status,
    journalEntryId: inv.journalEntryId,
    notes: inv.notes,
  }));

  const convertedBills: PurchaseBill[] = seeded.purchaseBills.map((b: any) => ({
    id: b.id,
    billNumber: b.billNumber,
    contactId: b.contactId,
    contactName: b.contactName,
    date: b.date,
    dueDate: b.dueDate,
    items: b.items.map((it: any) => ({
      productId: it.productId,
      qty: it.qty,
      unitCost: it.unitCost,
      subtotal: it.subtotal,
      isTaxable: it.isTaxable ?? true,
    })),
    subtotal: b.subtotal,
    taxAmount: b.taxAmount,
    total: b.total,
    paidAmount: b.paidAmount,
    remainingAmount: b.remainingAmount,
    status: b.status,
    journalEntryId: b.journalEntryId,
    notes: b.notes,
  }));

  const convertedCash: CashTransaction[] = seeded.cashTransactions.map((c: any) => ({
    id: c.id,
    txNumber: c.transactionNumber || c.txNumber || `CSH-${c.id}`,
    date: c.date,
    type: c.type,
    fromToAccountId: c.cashAccountId || c.fromToAccountId || 'acc-1101',
    oppositeAccountId: c.contraAccountId || c.oppositeAccountId || 'acc-6101',
    amount: c.amount,
    recipientOrPayer: c.recipientOrPayer || c.description,
    category: c.category,
    notes: c.notes,
    journalEntryId: c.journalEntryId,
  }));

  return {
    accounts: seeded.accounts,
    contacts: seeded.contacts,
    products: seeded.products,
    journalEntries: seeded.journalEntries,
    invoices: convertedInvoices,
    purchaseBills: convertedBills,
    cashTransactions: convertedCash,
    stockMovements: seeded.stockMovements,
    fixedAssets: INITIAL_FIXED_ASSETS,
    bankStatements: INITIAL_BANK_STATEMENTS,
    closedPeriods: [],
    prepaidExpenses: INITIAL_PREPAID_EXPENSES,
    forexRates: DEFAULT_FOREX_RATES,
    forexExposures: DEMO_FOREX_EXPOSURES,
    currentUser: INITIAL_USERS[0],
  };
}

class AccountingStore {
  private state: AppState;
  private subscribers: Array<() => void> = [];

  constructor() {
    this.state = loadInitialState();
  }

  public getState(): AppState {
    return this.state;
  }

  public subscribe(callback: () => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== callback);
    };
  }

  private notify() {
    this.state = {
      ...this.state,
      journalEntries: [...this.state.journalEntries],
      invoices: [...this.state.invoices],
      purchaseBills: [...this.state.purchaseBills],
      cashTransactions: [...this.state.cashTransactions],
      accounts: [...this.state.accounts],
      contacts: [...this.state.contacts],
      products: [...this.state.products],
      stockMovements: [...this.state.stockMovements]
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (err) {
      console.error('Storage sync error:', err);
    }
    this.subscribers.forEach((cb) => cb());
  }

  public setRole(role: 'admin' | 'staff') {
    const user = INITIAL_USERS.find((u) => u.role === role) || INITIAL_USERS[0];
    this.state.currentUser = user;
    this.notify();
  }

  public addAccount(account: Omit<Account, 'id' | 'isSystem' | 'isActive'>): { success: boolean; error?: string } {
    if (this.state.accounts.some((a) => a.code === account.code)) {
      return { success: false, error: `Kode akun ${account.code} sudah terdaftar.` };
    }
    const newAccount: Account = {
      ...account,
      id: `acc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      isActive: true,
      isSystem: false,
    };
    this.state.accounts.push(newAccount);
    this.notify();
    return { success: true };
  }

  public deleteAccount(id: string): { success: boolean; error?: string } {
    const target = this.state.accounts.find((a) => a.id === id);
    if (!target) return { success: false, error: 'Akun tidak ditemukan' };
    if (target.isSystem) return { success: false, error: 'Akun sistem tidak dapat dihapus.' };

    const hasJournalUsage = this.state.journalEntries.some((j) =>
      j.lines.some((l) => l.accountId === id)
    );
    if (hasJournalUsage) {
      return { success: false, error: 'Akun tidak dapat dihapus karena sudah memiliki mutasi riwayat jurnal.' };
    }

    this.state.accounts = this.state.accounts.filter((a) => a.id !== id);
    this.notify();
    return { success: true };
  }

  public addContact(contact: Omit<Contact, 'id' | 'arBalance' | 'apBalance' | 'createdAt'>): { success: boolean; contactId: string } {
    const newContact: Contact = {
      ...contact,
      id: `cont-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      arBalance: 0,
      apBalance: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.state.contacts.push(newContact);
    this.notify();
    return { success: true, contactId: newContact.id };
  }

  public addProduct(product: Omit<Product, 'id' | 'avgCost' | 'qtyOnHand'>): { success: boolean; productId: string } {
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      avgCost: 0,
      qtyOnHand: 0,
    };
    this.state.products.push(newProduct);
    this.notify();
    return { success: true, productId: newProduct.id };
  }

  public createSalesInvoice(data: {
    contactId: string;
    date: string;
    dueDate: string;
    items: { productId: string; qty: number; unitPrice: number }[];
    notes?: string;
    isPOS?: boolean;
    tenderedAmount?: number;
  }): { success: boolean; error?: string; invoiceId?: string } {
    const contact = this.state.contacts.find((c) => c.id === data.contactId);
    if (!contact) return { success: false, error: 'Pelanggan tidak ditemukan' };

    let totalSubtotalDec = new Decimal(0);
    let totalCogsDec = new Decimal(0);
    const invoiceItems = [];

    for (const it of data.items) {
      const prod = this.state.products.find((p) => p.id === it.productId);
      if (!prod) return { success: false, error: `Produk ID ${it.productId} tidak ditemukan` };
      if (prod.qtyOnHand < it.qty) {
        return {
          success: false,
          error: `Stok produk "${prod.name}" tidak mencukupi. Tersedia: ${prod.qtyOnHand}, diminta: ${it.qty}`,
        };
      }

      const itemSubtotalDec = new Decimal(it.qty).times(it.unitPrice);
      const itemCogsDec = new Decimal(it.qty).times(prod.avgCost);

      totalSubtotalDec = totalSubtotalDec.plus(itemSubtotalDec);
      totalCogsDec = totalCogsDec.plus(itemCogsDec);

      invoiceItems.push({
        productId: prod.id,
        qty: it.qty,
        unitPrice: it.unitPrice,
        subtotal: itemSubtotalDec.toNumber(),
        cogsAmount: itemCogsDec.toNumber(),
      });
    }

    const subtotal = totalSubtotalDec.toNumber();
    const taxAmount = totalSubtotalDec.times(0.11).toDecimalPlaces(0).toNumber();
    const grandTotal = totalSubtotalDec.plus(taxAmount).toNumber();
    const totalCogs = totalCogsDec.toNumber();

    const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const journalNumber = `JV-INV-${Date.now().toString().slice(-4)}`;

    const journalLines = [
      { id: `jl-1`, accountId: 'acc-1103', debit: grandTotal, kredit: 0, memo: `Piutang Usaha ${contact.name}` },
      { id: `jl-2`, accountId: 'acc-4101', debit: 0, kredit: subtotal, memo: `Penjualan Barang Dagang` },
      { id: `jl-3`, accountId: 'acc-2102', debit: 0, kredit: taxAmount, memo: `PPN Keluaran 11%` },
      { id: `jl-4`, accountId: 'acc-5101', debit: totalCogs, kredit: 0, memo: `Pengakuan HPP Barang Terjual` },
      { id: `jl-5`, accountId: 'acc-1104', debit: 0, kredit: totalCogs, memo: `Pengurangan Persediaan Barang` },
    ];

    const validation = validateJournalBalance(journalLines);
    if (!validation.isBalanced) {
      return { success: false, error: 'Jurnal tidak seimbang' };
    }

    const journalEntry: JournalEntry = {
      id: `je-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      entryNumber: journalNumber,
      date: data.date,
      description: `Faktur Penjualan No. ${invoiceNumber} (${contact.name})`,
      sourceType: 'sales_invoice',
      lines: journalLines,
      totalDebit: validation.totalDebit,
      totalKredit: validation.totalKredit,
      isBalanced: true,
      createdBy: this.state.currentUser.name,
      createdAt: new Date().toISOString(),
    };

    const invoiceId = `inv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const invoice: SalesInvoice = {
      id: invoiceId,
      invoiceNumber,
      contactId: contact.id,
      contactName: contact.name,
      date: data.date,
      dueDate: data.dueDate,
      items: invoiceItems,
      subtotal,
      taxRate: 0.11,
      taxAmount,
      total: grandTotal,
      paidAmount: 0,
      remainingAmount: grandTotal,
      status: 'terkirim',
      journalEntryId: journalEntry.id,
      notes: data.notes,
    };

    for (const it of invoiceItems) {
      const prod = this.state.products.find((p) => p.id === it.productId)!;
      prod.qtyOnHand -= it.qty;
      this.state.stockMovements.push({
        id: `sm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}${prod.id}`,
        productId: prod.id,
        date: data.date,
        referenceType: 'out',
        referenceNumber: invoiceNumber,
        qtyChange: -it.qty,
        unitPrice: prod.avgCost,
        newQtyOnHand: prod.qtyOnHand,
        newAvgCost: prod.avgCost,
        totalValuation: prod.qtyOnHand * prod.avgCost,
      });
    }

    contact.arBalance += grandTotal;
    this.state.journalEntries.push(journalEntry);
    this.state.invoices.push(invoice);
    this.notify();

    if (data.isPOS && data.tenderedAmount !== undefined && data.tenderedAmount >= grandTotal) {
      const cashAccount = this.state.accounts.find(a => a.code === '1101');
      if (cashAccount) {
        this.receiveInvoicePayment({
          invoiceId: invoice.id,
          date: data.date,
          amount: grandTotal,
          paymentAccountId: cashAccount.id,
          notes: 'Pembayaran Lunas via Kasir POS',
        });
      }
    }

    return { success: true, invoiceId };
  }

  public createPurchaseBill(data: {
    contactId: string;
    date: string;
    dueDate: string;
    items: { productId: string; qty: number; unitCost: number; isTaxable: boolean }[];
    notes?: string;
  }): { success: boolean; error?: string; billId?: string } {
    const contact = this.state.contacts.find((c) => c.id === data.contactId);
    if (!contact) return { success: false, error: 'Vendor tidak ditemukan' };

    let totalSubtotalDec = new Decimal(0);
    let totalTaxDec = new Decimal(0);
    const billItems = [];

    for (const it of data.items) {
      const prod = this.state.products.find((p) => p.id === it.productId);
      if (!prod) return { success: false, error: `Produk ID ${it.productId} tidak ditemukan` };

      const itemSubtotalDec = new Decimal(it.qty).times(it.unitCost);
      const itemTaxDec = it.isTaxable ? itemSubtotalDec.times(0.11).toDecimalPlaces(0) : new Decimal(0);

      totalSubtotalDec = totalSubtotalDec.plus(itemSubtotalDec);
      totalTaxDec = totalTaxDec.plus(itemTaxDec);

      billItems.push({
        productId: prod.id,
        qty: it.qty,
        unitCost: it.unitCost,
        subtotal: itemSubtotalDec.toNumber(),
        isTaxable: it.isTaxable,
      });
    }

    const subtotal = totalSubtotalDec.toNumber();
    const taxAmount = totalTaxDec.toNumber();
    const grandTotal = totalSubtotalDec.plus(taxAmount).toNumber();

    const billNumber = `BILL-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const journalNumber = `JV-BILL-${Date.now().toString().slice(-4)}`;

    const journalLines = [
      { id: `jl-1`, accountId: 'acc-1104', debit: subtotal, kredit: 0, memo: `Penambahan Persediaan Barang Dagang` },
      ...(taxAmount > 0
        ? [{ id: `jl-2`, accountId: 'acc-1105', debit: taxAmount, kredit: 0, memo: `PPN Masukan 11% Tagihan Pembelian` }]
        : []),
      { id: `jl-3`, accountId: 'acc-2101', debit: 0, kredit: grandTotal, memo: `Hutang Usaha ke ${contact.name}` },
    ];

    const validation = validateJournalBalance(journalLines);
    if (!validation.isBalanced) {
      return { success: false, error: 'Jurnal tidak seimbang' };
    }

    const journalEntry: JournalEntry = {
      id: `je-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      entryNumber: journalNumber,
      date: data.date,
      description: `Tagihan Pembelian No. ${billNumber} (${contact.name})`,
      sourceType: 'purchase_bill',
      lines: journalLines,
      totalDebit: validation.totalDebit,
      totalKredit: validation.totalKredit,
      isBalanced: true,
      createdBy: this.state.currentUser.name,
      createdAt: new Date().toISOString(),
    };

    const billId = `bill-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const bill: PurchaseBill = {
      id: billId,
      billNumber,
      contactId: contact.id,
      contactName: contact.name,
      date: data.date,
      dueDate: data.dueDate,
      items: billItems,
      subtotal,
      taxAmount,
      total: grandTotal,
      paidAmount: 0,
      remainingAmount: grandTotal,
      status: 'terbit',
      journalEntryId: journalEntry.id,
      notes: data.notes,
    };

    for (const it of billItems) {
      const prod = this.state.products.find((p) => p.id === it.productId)!;
      const calc = calculateWeightedAverageCost(prod.qtyOnHand, prod.avgCost, it.qty, it.unitCost);
      prod.qtyOnHand = calc.newQty;
      prod.avgCost = calc.newAvgCost;

      this.state.stockMovements.push({
        id: `sm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}${prod.id}`,
        productId: prod.id,
        date: data.date,
        referenceType: 'in',
        referenceNumber: billNumber,
        qtyChange: it.qty,
        unitPrice: it.unitCost,
        newQtyOnHand: prod.qtyOnHand,
        newAvgCost: prod.avgCost,
        totalValuation: prod.qtyOnHand * prod.avgCost,
      });
    }

    contact.apBalance += grandTotal;
    this.state.journalEntries.push(journalEntry);
    this.state.purchaseBills.push(bill);
    this.notify();

    return { success: true, billId };
  }

  public createCashTransaction(data: {
    date: string;
    type: 'masuk' | 'keluar';
    fromToAccountId: string;
    oppositeAccountId: string;
    amount: number;
    recipientOrPayer: string;
    category: string;
    notes?: string;
  }): { success: boolean; error?: string; txId?: string } {
    if (data.amount <= 0) return { success: false, error: 'Nominal transaksi harus lebih besar dari 0' };

    const txNumber = `CASH-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const journalNumber = `JV-CASH-${Date.now().toString().slice(-4)}`;

    let journalLines = [];
    if (data.type === 'masuk') {
      journalLines = [
        { id: `jl-1`, accountId: data.fromToAccountId, debit: data.amount, kredit: 0, memo: `Penerimaan Kas dari ${data.recipientOrPayer}` },
        { id: `jl-2`, accountId: data.oppositeAccountId, debit: 0, kredit: data.amount, memo: data.notes || data.category },
      ];
    } else {
      journalLines = [
        { id: `jl-1`, accountId: data.oppositeAccountId, debit: data.amount, kredit: 0, memo: data.notes || data.category },
        { id: `jl-2`, accountId: data.fromToAccountId, debit: 0, kredit: data.amount, memo: `Pengeluaran Kas untuk ${data.recipientOrPayer}` },
      ];
    }

    const validation = validateJournalBalance(journalLines);
    if (!validation.isBalanced) {
      return { success: false, error: 'Jurnal tidak seimbang' };
    }

    const journalEntry: JournalEntry = {
      id: `je-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      entryNumber: journalNumber,
      date: data.date,
      description: `Transaksi Kas ${data.type === 'masuk' ? 'Masuk' : 'Keluar'}: ${data.recipientOrPayer} (${data.category})`,
      sourceType: 'cash_transaction',
      lines: journalLines,
      totalDebit: validation.totalDebit,
      totalKredit: validation.totalKredit,
      isBalanced: true,
      createdBy: this.state.currentUser.name,
      createdAt: new Date().toISOString(),
    };

    const txId = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const cashTx: CashTransaction = {
      id: txId,
      txNumber,
      date: data.date,
      type: data.type,
      fromToAccountId: data.fromToAccountId,
      oppositeAccountId: data.oppositeAccountId,
      amount: data.amount,
      recipientOrPayer: data.recipientOrPayer,
      category: data.category,
      notes: data.notes,
      journalEntryId: journalEntry.id,
    };

    this.state.journalEntries.push(journalEntry);
    this.state.cashTransactions.push(cashTx);
    this.notify();

    return { success: true, txId };
  }

  public receiveInvoicePayment(data: {
    invoiceId: string;
    date: string;
    amount: number;
    paymentAccountId: string;
    notes?: string;
  }): { success: boolean; error?: string } {
    const invoice = this.state.invoices.find((i) => i.id === data.invoiceId);
    if (!invoice) return { success: false, error: 'Faktur tidak ditemukan' };
    if (data.amount <= 0 || data.amount > invoice.remainingAmount) {
      return { success: false, error: `Nominal tidak valid. Sisa tagihan adalah Rp ${invoice.remainingAmount}` };
    }

    const contact = this.state.contacts.find((c) => c.id === invoice.contactId);
    const journalNumber = `JV-AR-PAY-${Date.now().toString().slice(-4)}`;

    const journalLines = [
      { id: `jl-1`, accountId: data.paymentAccountId, debit: data.amount, kredit: 0, memo: `Penerimaan Pelunasan Faktur ${invoice.invoiceNumber}` },
      { id: `jl-2`, accountId: 'acc-1103', debit: 0, kredit: data.amount, memo: `Pelunasan Piutang ${invoice.contactName}` },
    ];

    const validation = validateJournalBalance(journalLines);
    if (!validation.isBalanced) return { success: false, error: 'Jurnal tidak seimbang' };

    const journalEntry: JournalEntry = {
      id: `je-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      entryNumber: journalNumber,
      date: data.date,
      description: `Penerimaan Pembayaran Faktur No. ${invoice.invoiceNumber} (${invoice.contactName})`,
      sourceType: 'payment_received',
      lines: journalLines,
      totalDebit: validation.totalDebit,
      totalKredit: validation.totalKredit,
      isBalanced: true,
      createdBy: this.state.currentUser.name,
      createdAt: new Date().toISOString(),
    };

    invoice.paidAmount += data.amount;
    invoice.remainingAmount = Math.max(0, invoice.remainingAmount - data.amount);
    invoice.status = invoice.remainingAmount === 0 ? 'lunas' : 'sebagian';

    if (contact) {
      contact.arBalance = Math.max(0, Math.round(contact.arBalance - data.amount));
    }

    this.state.journalEntries.push(journalEntry);
    this.notify();
    return { success: true };
  }

  public payPurchaseBill(data: {
    billId: string;
    date: string;
    amount: number;
    paymentAccountId: string;
    notes?: string;
  }): { success: boolean; error?: string } {
    const bill = this.state.purchaseBills.find((b) => b.id === data.billId);
    if (!bill) return { success: false, error: 'Tagihan tidak ditemukan' };
    if (data.amount <= 0 || data.amount > bill.remainingAmount) {
      return { success: false, error: `Nominal tidak valid. Sisa hutang adalah Rp ${bill.remainingAmount}` };
    }

    const contact = this.state.contacts.find((c) => c.id === bill.contactId);
    const journalNumber = `JV-AP-PAY-${Date.now().toString().slice(-4)}`;

    const journalLines = [
      { id: `jl-1`, accountId: 'acc-2101', debit: data.amount, kredit: 0, memo: `Pembayaran Hutang Tagihan ${bill.billNumber}` },
      { id: `jl-2`, accountId: data.paymentAccountId, debit: 0, kredit: data.amount, memo: `Pengeluaran Kas/Bank ke ${bill.contactName}` },
    ];

    const validation = validateJournalBalance(journalLines);
    if (!validation.isBalanced) return { success: false, error: 'Jurnal tidak seimbang' };

    const journalEntry: JournalEntry = {
      id: `je-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      entryNumber: journalNumber,
      date: data.date,
      description: `Pembayaran Tagihan Supplier No. ${bill.billNumber} (${bill.contactName})`,
      sourceType: 'bill_payment',
      lines: journalLines,
      totalDebit: validation.totalDebit,
      totalKredit: validation.totalKredit,
      isBalanced: true,
      createdBy: this.state.currentUser.name,
      createdAt: new Date().toISOString(),
    };

    bill.paidAmount += data.amount;
    bill.remainingAmount = Math.max(0, bill.remainingAmount - data.amount);
    bill.status = bill.remainingAmount === 0 ? 'lunas' : 'sebagian';

    if (contact) {
      contact.apBalance = Math.max(0, Math.round(contact.apBalance - data.amount));
    }

    this.state.journalEntries.push(journalEntry);
    this.notify();
    return { success: true };
  }

  public voidInvoice(invoiceId: string): { success: boolean; error?: string } {
    if (this.state.currentUser.role !== 'admin') {
      return { success: false, error: 'Hanya Admin yang berwenang melakukan Void / Pembatalan Faktur.' };
    }

    const invoice = this.state.invoices.find((i) => i.id === invoiceId);
    if (!invoice) return { success: false, error: 'Faktur tidak ditemukan' };
    if (invoice.status === 'void') return { success: false, error: 'Faktur sudah dibatalkan sebelumnya.' };
    if (invoice.paidAmount > 0) return { success: false, error: 'Faktur yang sudah memiliki riwayat pembayaran tidak dapat di-void.' };

    const originalJournal = this.state.journalEntries.find((j) => j.id === invoice.journalEntryId);
    if (!originalJournal) return { success: false, error: 'Jurnal asal tidak ditemukan' };

    const reversalLines = originalJournal.lines.map((l) => ({
      id: `jl-rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}${l.id}`,
      accountId: l.accountId,
      debit: l.kredit,
      kredit: l.debit,
      memo: `Pembalik Void Faktur ${invoice.invoiceNumber}: ${l.memo || ''}`,
    }));

    const validation = validateJournalBalance(reversalLines);
    if (!validation.isBalanced) return { success: false, error: 'Jurnal pembalik tidak seimbang' };

    const reversalJournal: JournalEntry = {
      id: `je-rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      entryNumber: `JV-VOID-${invoice.invoiceNumber}`,
      date: new Date().toISOString().split('T')[0],
      description: `Jurnal Pembalik (Void) Faktur Penjualan No. ${invoice.invoiceNumber}`,
      sourceType: 'sales_invoice',
      lines: reversalLines,
      totalDebit: validation.totalDebit,
      totalKredit: validation.totalKredit,
      isBalanced: true,
      createdBy: this.state.currentUser.name,
      createdAt: new Date().toISOString(),
    };

    for (const it of invoice.items) {
      const prod = this.state.products.find((p) => p.id === it.productId);
      if (prod) {
        prod.qtyOnHand += it.qty;
        this.state.stockMovements.push({
          id: `sm-rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}${prod.id}`,
          productId: prod.id,
          date: new Date().toISOString().split('T')[0],
          referenceType: 'adjustment',
          referenceNumber: `VOID-${invoice.invoiceNumber}`,
          qtyChange: it.qty,
          unitPrice: prod.avgCost,
          newQtyOnHand: prod.qtyOnHand,
          newAvgCost: prod.avgCost,
          totalValuation: prod.qtyOnHand * prod.avgCost,
        });
      }
    }

    const contact = this.state.contacts.find((c) => c.id === invoice.contactId);
    if (contact) {
      contact.arBalance -= invoice.total;
    }

    invoice.status = 'void';
    originalJournal.isVoided = true;

    this.state.journalEntries.push(reversalJournal);
    this.notify();
    return { success: true };
  }

  public postAssetDepreciation(assetId: string, date: string): { success: boolean; error?: string } {
    const asset = this.state.fixedAssets.find((a) => a.id === assetId);
    if (!asset) return { success: false, error: 'Aset tidak ditemukan' };

    const cost = new Decimal(asset.acquisitionCost);
    const salvage = new Decimal(asset.salvageValue);
    const monthlyDepr = cost.minus(salvage).dividedBy(asset.usefulLifeMonths).toDecimalPlaces(0).toNumber();

    if (asset.netBookValue <= asset.salvageValue) {
      return { success: false, error: 'Aset telah terdepresiasi penuh hingga nilai residu.' };
    }

    const journalNumber = `JV-DEPR-${Date.now().toString().slice(-4)}`;
    const journalLines = [
      { id: 'jl-1', accountId: asset.deprExpenseAccountId, debit: monthlyDepr, kredit: 0, memo: `Beban Penyusutan ${asset.name}` },
      { id: 'jl-2', accountId: asset.accumulatedDeprAccountId, debit: 0, kredit: monthlyDepr, memo: `Akumulasi Penyusutan ${asset.name}` },
    ];

    const validation = validateJournalBalance(journalLines);
    if (!validation.isBalanced) return { success: false, error: 'Jurnal depresiasi tidak seimbang' };

    const journalEntry: JournalEntry = {
      id: `je-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      entryNumber: journalNumber,
      date,
      description: `Penyusutan Bulanan Aset Tetap: ${asset.name} (${asset.code})`,
      sourceType: 'depreciation_entry',
      lines: journalLines,
      totalDebit: validation.totalDebit,
      totalKredit: validation.totalKredit,
      isBalanced: true,
      createdBy: this.state.currentUser.name,
      createdAt: new Date().toISOString(),
    };

    asset.accumulatedDepreciation += monthlyDepr;
    asset.netBookValue = asset.acquisitionCost - asset.accumulatedDepreciation;
    asset.lastDepreciationDate = date;

    this.state.journalEntries.push(journalEntry);
    this.notify();
    return { success: true };
  }

  public reconcileBankItem(statementId: string): { success: boolean } {
    const item = this.state.bankStatements.find((b) => b.id === statementId);
    if (item) {
      item.isReconciled = true;
      this.notify();
    }
    return { success: true };
  }

  public recordBankFeeOrInterest(data: {
    type: 'fee' | 'interest';
    amount: number;
    date: string;
    bankAccountId: string;
  }): { success: boolean; error?: string } {
    const journalNumber = `JV-BANK-${Date.now().toString().slice(-4)}`;
    let journalLines = [];

    if (data.type === 'fee') {
      journalLines = [
        { id: 'jl-1', accountId: 'acc-6104', debit: data.amount, kredit: 0, memo: 'Beban Administrasi Bank BCA' },
        { id: 'jl-2', accountId: data.bankAccountId, debit: 0, kredit: data.amount, memo: 'Potongan Saldo Bank BCA' },
      ];
    } else {
      journalLines = [
        { id: 'jl-1', accountId: data.bankAccountId, debit: data.amount, kredit: 0, memo: 'Penerimaan Bunga Giro Bank BCA' },
        { id: 'jl-2', accountId: 'acc-4201', debit: 0, kredit: data.amount, memo: 'Pendapatan Bunga Jasa Giro' },
      ];
    }

    const validation = validateJournalBalance(journalLines);
    if (!validation.isBalanced) return { success: false, error: 'Jurnal bank tidak seimbang' };

    const journalEntry: JournalEntry = {
      id: `je-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      entryNumber: journalNumber,
      date: data.date,
      description: data.type === 'fee' ? 'Biaya Administrasi Bank Bulanan' : 'Pendapatan Bunga Giro Bank',
      sourceType: 'bank_reconciliation',
      lines: journalLines,
      totalDebit: validation.totalDebit,
      totalKredit: validation.totalKredit,
      isBalanced: true,
      createdBy: this.state.currentUser.name,
      createdAt: new Date().toISOString(),
    };

    this.state.journalEntries.push(journalEntry);
    this.notify();
    return { success: true };
  }

  // ==================== 1. PERIOD CLOSING & RETAINED EARNINGS ====================
  public closeFiscalPeriod(periodMonth: string): { success: boolean; error?: string; certificateNumber?: string } {
    if (this.state.closedPeriods.some((p) => p.periodMonth === periodMonth)) {
      return { success: false, error: `Periode ${periodMonth} sudah pernah ditutup sebelumnya.` };
    }

    const result = generateClosingEntries(
      this.state.accounts,
      this.state.journalEntries,
      periodMonth,
      this.state.currentUser.name
    );

    const certNo = `CERT-CLOSE-${periodMonth.replace('-', '')}-${Date.now().toString().slice(-4)}`;
    this.state.journalEntries.push(result.closingEntry);

    const closedRecord: ClosedPeriod = {
      periodMonth,
      closedAt: result.closedAt,
      closedBy: this.state.currentUser.name,
      netIncome: result.netIncome,
      totalRevenue: result.totalRevenue,
      totalExpense: result.totalExpense,
      closingEntryId: result.closingEntry.id,
      certificateNumber: certNo,
    };

    this.state.closedPeriods.push(closedRecord);
    this.notify();

    return { success: true, certificateNumber: certNo };
  }

  public unlockFiscalPeriod(periodMonth: string): { success: boolean } {
    this.state.closedPeriods = this.state.closedPeriods.filter((p) => p.periodMonth !== periodMonth);
    this.state.journalEntries = this.state.journalEntries.filter(
      (j) => j.sourceType !== 'closing_entry' || j.sourceId !== periodMonth
    );
    this.notify();
    return { success: true };
  }

  // ==================== 2. FOREX REVALUATION (PSAK 10) ====================
  public postForexRevaluation(periodDate: string = new Date().toISOString().split('T')[0]): {
    success: boolean;
    error?: string;
    gainLoss?: number;
  } {
    const res = generateForexRevaluationJournal(
      this.state.forexExposures,
      periodDate,
      this.state.currentUser.name
    );

    this.state.journalEntries.push(res.journalEntry);
    this.notify();
    return { success: true, gainLoss: res.netGainLoss };
  }

  // ==================== 3. PREPAID EXPENSE AMORTIZATION (PSAK 1) ====================
  public postMonthlyAmortization(periodMonth: string = '2026-08'): { success: boolean; error?: string } {
    const res = generateAmortizationJournal(
      this.state.prepaidExpenses,
      periodMonth,
      this.state.currentUser.name
    );

    if (res.totalAmortized <= 0) {
      return { success: false, error: 'Tidak ada saldo biaya dibayar dimuka yang tersisa untuk diamortisasi.' };
    }

    this.state.prepaidExpenses.forEach((p) => {
      p.remainingBalance = Math.max(0, p.remainingBalance - p.monthlyAmortization);
      p.amortizedAmount += p.monthlyAmortization;
      p.lastAmortizedMonth = periodMonth;
    });

    this.state.journalEntries.push(res.journalEntry);
    this.notify();
    return { success: true };
  }

  // ==================== 4. FORENSIC AUDIT HASH-CHAIN ====================
  public getHashChain(): AuditHashBlock[] {
    return buildLedgerHashChain(this.state.journalEntries);
  }

  public verifyLedgerIntegrity(): {
    isValid: boolean;
    totalBlocks: number;
    corruptedBlockIndex?: number;
    error?: string;
  } {
    const chain = this.getHashChain();
    return verifyLedgerChainIntegrity(chain, this.state.journalEntries);
  }

  public tamperDemoLedgerEntry(entryId?: string): { success: boolean } {
    const target = entryId
      ? this.state.journalEntries.find((e) => e.id === entryId)
      : this.state.journalEntries[0];

    if (target && target.lines.length > 0) {
      // Intentionally tamper with debit amount by 1000 rupiah
      target.lines[0].debit += 1000;
      this.notify();
      return { success: true };
    }
    return { success: false };
  }

  public restoreLedgerIntegrity(): { success: boolean } {
    const seeded = generateSeedAccountingData();
    this.state.journalEntries = seeded.journalEntries;
    this.notify();
    return { success: true };
  }

  public setCurrentUserRole(role: 'admin' | 'staff') {
    this.state.currentUser.role = role;
    this.notify();
  }

  public voidSalesInvoice(id: string) {
    return this.voidInvoice(id);
  }

  public reconcileBankStatement(statementId: string) {
    return this.reconcileBankItem(statementId);
  }

  public addFixedAsset(asset: any) {
    const newAsset: FixedAsset = {
      ...asset,
      id: `fa-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      accumulatedDepreciation: 0,
      netBookValue: asset.purchasePrice,
      status: 'aktif',
    };
    this.state.fixedAssets.push(newAsset);
    this.notify();
    return { success: true };
  }

  public deleteContact(id: string) {
    this.state.contacts = this.state.contacts.filter((c) => c.id !== id);
    this.notify();
    return { success: true };
  }

  public deleteProduct(id: string) {
    this.state.products = this.state.products.filter((p) => p.id !== id);
    this.notify();
    return { success: true };
  }
}

export const store = new AccountingStore();

export function resetToDefaultSeed(): AppState {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
  const fresh = loadInitialState();
  (store as any).state = fresh;
  (store as any).notify();
  return fresh;
}
