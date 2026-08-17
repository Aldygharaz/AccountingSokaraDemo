import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { CommandPalette } from './components/ui/CommandPalette';
import { PokaYokeModal, PokaYokeAnomaly } from './components/ui/PokaYokeModal';
import { store, resetToDefaultSeed, AppState, useStore } from './lib/storage';
import { soundFx } from './lib/soundFx';

// Code-split heavy views and executive intelligence modals for 60fps & sub-100ms TTI
const CoaView = lazy(() => import('./components/coa/CoaView').then((m) => ({ default: m.CoaView })));
const ContactsView = lazy(() => import('./components/contacts/ContactsView').then((m) => ({ default: m.ContactsView })));
const ProductsView = lazy(() => import('./components/products/ProductsView').then((m) => ({ default: m.ProductsView })));
const TransactionsView = lazy(() => import('./components/transactions/TransactionsView').then((m) => ({ default: m.TransactionsView })));
const ArapView = lazy(() => import('./components/arap/ArapView').then((m) => ({ default: m.ArapView })));
const ReportsView = lazy(() => import('./components/reports/ReportsView').then((m) => ({ default: m.ReportsView })));
const AnalyticsView = lazy(() => import('./components/analytics/AnalyticsView').then((m) => ({ default: m.AnalyticsView })));
const BankReconciliationView = lazy(() => import('./components/banking/BankReconciliationView').then((m) => ({ default: m.BankReconciliationView })));
const FixedAssetsView = lazy(() => import('./components/assets/FixedAssetsView').then((m) => ({ default: m.FixedAssetsView })));
const TaxStudioView = lazy(() => import('./components/tax/TaxStudioView').then((m) => ({ default: m.TaxStudioView })));

// Lazy modals
const PosCashierModal = lazy(() => import('./components/pos/PosCashierModal').then((m) => ({ default: m.PosCashierModal })));
const PeriodClosingModal = lazy(() => import('./components/closing/PeriodClosingModal').then((m) => ({ default: m.PeriodClosingModal })));
const CfoIntelligenceModal = lazy(() => import('./components/cfo/CfoIntelligenceModal').then((m) => ({ default: m.CfoIntelligenceModal })));
const ForensicAuditModal = lazy(() => import('./components/forensic/ForensicAuditModal').then((m) => ({ default: m.ForensicAuditModal })));
const ForexStudioModal = lazy(() => import('./components/forex/ForexStudioModal').then((m) => ({ default: m.ForexStudioModal })));
const AmortizationScheduleModal = lazy(() => import('./components/amortization/AmortizationScheduleModal').then((m) => ({ default: m.AmortizationScheduleModal })));
const OfficialReportExportModal = lazy(() => import('./components/reports/OfficialReportExportModal').then((m) => ({ default: m.OfficialReportExportModal })));
const JobOrderCostingModal = lazy(() => import('./components/costing/JobOrderCostingModal').then((m) => ({ default: m.JobOrderCostingModal })));
const Tax1771Modal = lazy(() => import('./components/tax/Tax1771Modal').then((m) => ({ default: m.Tax1771Modal })));
const DcfValuationModal = lazy(() => import('./components/valuation/DcfValuationModal').then((m) => ({ default: m.DcfValuationModal })));
const EclProvisioningModal = lazy(() => import('./components/ecl/EclProvisioningModal').then((m) => ({ default: m.EclProvisioningModal })));
const ManualBookView = lazy(() => import('./components/manual/ManualBookView').then((m) => ({ default: m.ManualBookView })));

const ViewFallback: React.FC = () => (
  <div className="flex flex-col items-center justify-center p-16 space-y-4">
    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    <p className="text-xs font-bold text-slate-500 dark:text-[#B5BAC1]">Memuat modul akuntansi...</p>
  </div>
);

export const App: React.FC = () => {
    const currentUser = useStore(s => s.currentUser);
    const journalEntries = useStore(s => s.journalEntries);
    const products = useStore(s => s.products);
    const contacts = useStore(s => s.contacts);
    const invoices = useStore(s => s.invoices);
  
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isPosOpen, setIsPosOpen] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [pokaYokeAnomaly, setPokaYokeAnomaly] = useState<PokaYokeAnomaly | null>(null);

  // Executive Modals State
  const [isClosingModalOpen, setIsClosingModalOpen] = useState<boolean>(false);
  const [isCfoModalOpen, setIsCfoModalOpen] = useState<boolean>(false);
  const [isForensicModalOpen, setIsForensicModalOpen] = useState<boolean>(false);
  const [isForexModalOpen, setIsForexModalOpen] = useState<boolean>(false);
  const [isAmortizationModalOpen, setIsAmortizationModalOpen] = useState<boolean>(false);
  const [isOfficialExportModalOpen, setIsOfficialExportModalOpen] = useState<boolean>(false);
  const [isCostingModalOpen, setIsCostingModalOpen] = useState<boolean>(false);
  const [isTax1771ModalOpen, setIsTax1771ModalOpen] = useState<boolean>(false);
  const [isValuationModalOpen, setIsValuationModalOpen] = useState<boolean>(false);
  const [isEclModalOpen, setIsEclModalOpen] = useState<boolean>(false);

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('LEDGER_LOGIC_THEME') === 'dark';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('LEDGER_LOGIC_THEME', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('LEDGER_LOGIC_THEME', 'light');
    }
  }, [isDarkMode]);

  // Global Keyboard Shortcuts (Ctrl+K, Ctrl+N, Ctrl+B, F4, F7, F8, F9, F10, Ctrl+Shift+E, F2)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        soundFx.playClick();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        soundFx.playClick();
        setCurrentTab('transactions');
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        soundFx.playClick();
        setCurrentTab('banking');
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        soundFx.playClick();
        setIsOfficialExportModalOpen(true);
      }
      if (e.key === 'F4') {
        e.preventDefault();
        setIsPosOpen((prev) => {
          if (!prev) {
            soundFx.playClick();
            return true;
          }
          return prev;
        });
      }
      if (e.key === 'F7') {
        e.preventDefault();
        soundFx.playClick();
        setIsCostingModalOpen((prev) => !prev);
      }
      if (e.key === 'F8') {
        e.preventDefault();
        soundFx.playClick();
        setIsClosingModalOpen((prev) => !prev);
      }
      if (e.key === 'F9') {
        e.preventDefault();
        soundFx.playClick();
        setIsCfoModalOpen((prev) => !prev);
      }
      if (e.key === 'F10') {
        e.preventDefault();
        soundFx.playClick();
        setIsForensicModalOpen((prev) => !prev);
      }
      if (e.key === 'F2') {
        e.preventDefault();
        soundFx.playClick();
        store.setCurrentUserRole(currentUser.role === 'admin' ? 'staff' : 'admin');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentUser.role]);

  // Defensive Poka-Yoke Automated Health Check
  const handleOpenPokaYoke = () => {
    // Check 1: Unbalanced journals
    const unbalanced = journalEntries.find((j) => !j.isBalanced);
    if (unbalanced) {
      setPokaYokeAnomaly({
        id: `py-${Date.now()}`,
        type: 'unbalanced_warning',
        title: 'Entri Jurnal Tidak Seimbang Terdeteksi',
        description: `Jurnal nomor ${unbalanced.entryNumber} memiliki selisih debit dan kredit yang tidak sama.`,
        impact: 'Laporan Neraca dan Laba Rugi berpotensi tidak seimbang.',
        recommendedAction: 'Jalankan auto-fix untuk menyelaraskan baris jurnal.',
        autoFixLabel: 'Auto-Fix Jurnal Seimbang',
        onAutoFix: () => {
          store.restoreLedgerIntegrity();
          setPokaYokeAnomaly(null);
        },
      });
      return;
    }

    // Check 2: Low stock under reorder point
    const lowStock = products.find((p) => p.qtyOnHand <= 15);
    if (lowStock) {
      setPokaYokeAnomaly({
        id: `py-${Date.now()}`,
        type: 'low_stock',
        title: `Stok Kritis: ${lowStock.name}`,
        description: `Sisa stok fisik adalah ${lowStock.qtyOnHand} ${lowStock.unit}, berada di bawah batas minimum operasional toko.`,
        impact: 'Potensi kehilangan penjualan akibat kehabisan persediaan (stockout).',
        recommendedAction: 'Terbitkan Purchase Bill otomatis untuk mengisi ulang 50 unit barang.',
        autoFixLabel: 'Auto-Fix Terbitkan PO Restock',
        onAutoFix: () => {
          store.createPurchaseBill({
            contactId: contacts.find((c) => c.type === 'vendor')?.id || contacts[0]?.id || '',
            date: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
            items: [{ productId: lowStock.id, qty: 50, unitCost: lowStock.avgCost, isTaxable: true }],
            notes: `Auto-Fix Poka-Yoke: Restock otomatis ${lowStock.name}`,
          });
          setPokaYokeAnomaly(null);
        },
      });
      return;
    }

    // Check 3: Overdue invoices
    const now = new Date().toISOString().split('T')[0];
    const overdueInv = invoices.find(
      (i) => i.status !== 'lunas' && i.status !== 'void' && i.dueDate < now
    );
    if (overdueInv) {
      setPokaYokeAnomaly({
        id: `py-${Date.now()}`,
        type: 'overdue_ar',
        title: `Piutang Jatuh Tempo: Faktur ${overdueInv.invoiceNumber}`,
        description: `Tagihan ${overdueInv.contactName} sebesar Rp ${overdueInv.remainingAmount.toLocaleString('id-ID')} telah melewati tanggal jatuh tempo (${overdueInv.dueDate}).`,
        impact: 'Mempengaruhi rasio perputaran piutang (DSO) dan arus kas masuk.',
        recommendedAction: 'Catat penerimaan pelunasan piutang ke akun Bank BCA.',
        autoFixLabel: 'Auto-Fix Pelunasan Piutang',
        onAutoFix: () => {
          store.receiveInvoicePayment({
            invoiceId: overdueInv.id,
            date: new Date().toISOString().split('T')[0],
            amount: overdueInv.remainingAmount,
            paymentAccountId: 'acc-1102',
            notes: `Auto-Fix Poka-Yoke: Pelunasan instan tagihan ${overdueInv.invoiceNumber}`,
          });
          setPokaYokeAnomaly(null);
        },
      });
      return;
    }

    // If perfectly clean
    soundFx.playClick();
    setPokaYokeAnomaly({
      id: `py-${Date.now()}`,
      type: 'low_stock', // Using green/safe equivalent later
      title: 'Status Sistem Sempurna',
      description: 'Seluruh jurnal seimbang, stok aman, dan tidak ada anomali piutang.',
      impact: 'Bisnis beroperasi dengan efisiensi maksimal.',
      recommendedAction: 'Teruskan pekerjaan Anda.',
      autoFixLabel: 'Tutup Laporan',
      onAutoFix: () => setPokaYokeAnomaly(null),
    });
  };

  // Validate live journal double-entry state
  const isJournalBalanced = journalEntries.every((j) => j.isBalanced);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#1E1F22] text-slate-900 dark:text-[#F2F3F5] transition-colors duration-200">
      {/* Docked Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onCloseMobileSidebar={() => setIsMobileSidebarOpen(false)}
        onTabChange={(tab) => {
          if (tab === 'pos') {
            setIsPosOpen(true);
          } else if (tab === 'closing') {
            setIsClosingModalOpen(true);
          } else if (tab === 'forensic') {
            setIsForensicModalOpen(true);
          } else if (tab === 'cfo') {
            setIsCfoModalOpen(true);
          } else if (tab === 'tax') {
            setIsTax1771ModalOpen(true);
          } else if (tab === 'valuation') {
            setIsValuationModalOpen(true);
          } else if (tab === 'tax1771') {
            setIsTax1771ModalOpen(true);
          } else if (tab === 'costing') {
            setIsCostingModalOpen(true);
          } else if (tab === 'ecl') {
            setIsEclModalOpen(true);
          } else if (tab === 'forensic') {
            setIsForensicModalOpen(true);
          } else if (tab === 'forex') {
            setIsForexModalOpen(true);
          } else if (tab === 'amortization') {
            setIsAmortizationModalOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        currentUser={currentUser}
        onResetData={() => {
          soundFx.playClick();
          setPokaYokeAnomaly({
            id: `py-reset-${Date.now()}`,
            type: 'destructive_action',
            title: 'Konfirmasi Reset Database',
            description: 'Anda akan menghapus seluruh data transaksi dan mengembalikannya ke data sampel awal. Tindakan ini bersifat permanen dan tidak dapat dibatalkan.',
            impact: 'Seluruh entri jurnal, faktur, laporan keuangan, dan data operasional yang baru ditambahkan akan hilang secara permanen.',
            recommendedAction: 'Pastikan Anda tidak sedang mendemokan data penting kepada klien sebelum melanjutkan.',
            autoFixLabel: 'Ya, Reset Database Sekarang',
            onAutoFix: () => {
              soundFx.playClick();
              resetToDefaultSeed();
              setPokaYokeAnomaly(null);
            },
          });
        }}
      />

      {/* Docked Global Header */}
      <Header
        currentUser={currentUser}
        onRoleToggle={(role) => {
          soundFx.playClick();
          store.setCurrentUserRole(role);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        journalBalanced={isJournalBalanced}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenPokaYoke={handleOpenPokaYoke}
        onOpenClosing={() => setIsClosingModalOpen(true)}
        onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        onOpenCfo={() => setIsCfoModalOpen(true)}
        onOpenForensic={() => setIsForensicModalOpen(true)}
        onOpenOfficialExport={() => setIsOfficialExportModalOpen(true)}
        onOpenCosting={() => setIsCostingModalOpen(true)}
        onOpenManualBook={() => setCurrentTab('manual')}
      />

      {/* Main Workspace View */}
      <main className="lg:ml-72 ml-0 pt-20 px-6 sm:px-8 pb-16 min-h-screen bg-slate-50/50 dark:bg-[#1E1F22]">
        {currentTab === 'dashboard' && (
          <DashboardView
            onOpenNewInvoice={() => setCurrentTab('transactions')}
            onOpenNewBill={() => setCurrentTab('transactions')}
            onOpenNewCash={() => setCurrentTab('transactions')}
            onNavigate={(tab) => setCurrentTab(tab)}
          />
        )}

        <Suspense fallback={<ViewFallback />}>
          {currentTab === 'coa' && (
            <CoaView
              onAddAccount={(acc) => store.addAccount(acc)}
              onDeleteAccount={(id) => store.deleteAccount(id)}
            />
          )}

          {currentTab === 'contacts' && (
            <ContactsView
              onAddContact={(c) => store.addContact(c)}
              onOpenNewInvoiceForContact={() => setCurrentTab('transactions')}
            />
          )}

          {currentTab === 'products' && (
            <ProductsView
              onAddProduct={(p) => store.addProduct(p)}
              onOpenNewBill={() => setCurrentTab('transactions')}
            />
          )}

          {currentTab === 'transactions' && (
            <TransactionsView
              currentUser={currentUser}
              onCreateInvoice={(data) => store.createSalesInvoice(data)}
              onCreateBill={(data) => store.createPurchaseBill(data)}
              onCreateCashTx={(data) => store.createCashTransaction(data)}
              onVoidInvoice={(id) => store.voidSalesInvoice(id)}
            />
          )}

          {currentTab === 'arap' && (
            <ArapView
              onReceiveInvoicePayment={(data) => store.receiveInvoicePayment(data)}
              onPayPurchaseBill={(data) => store.payPurchaseBill(data)}
            />
          )}

          {currentTab === 'banking' && (
            <BankReconciliationView
              onReconcileItem={(statementId) => store.reconcileBankStatement(statementId)}
              onRecordFeeOrInterest={(data) => store.recordBankFeeOrInterest(data)}
            />
          )}

          {currentTab === 'assets' && (
            <FixedAssetsView
              onPostDepreciation={(assetId, date) => store.postAssetDepreciation(assetId, date)}
            />
          )}

          {currentTab === 'tax' && <TaxStudioView />}

          {currentTab === 'reports' && <ReportsView />}

          {currentTab === 'analytics' && <AnalyticsView />}

          {currentTab === 'manual' && (
            <ManualBookView onNavigateToTab={(tab) => setCurrentTab(tab)} />
          )}
        </Suspense>
      </main>

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(tab) => {
          setCurrentTab(tab);
          setIsCommandPaletteOpen(false);
        }}
        onOpenNewInvoice={() => {
          setCurrentTab('transactions');
          setIsCommandPaletteOpen(false);
        }}
        onOpenNewBill={() => {
          setCurrentTab('transactions');
          setIsCommandPaletteOpen(false);
        }}
        onOpenNewCash={() => {
          setCurrentTab('transactions');
          setIsCommandPaletteOpen(false);
        }}
        onOpenPos={() => {
          setIsPosOpen(true);
          setIsCommandPaletteOpen(false);
        }}
        onOpenClosing={() => {
          setIsClosingModalOpen(true);
          setIsCommandPaletteOpen(false);
        }}
        onOpenCfo={() => {
          setIsCfoModalOpen(true);
          setIsCommandPaletteOpen(false);
        }}
        onOpenForensic={() => {
          setIsForensicModalOpen(true);
          setIsCommandPaletteOpen(false);
        }}
        onOpenForex={() => {
          setIsForexModalOpen(true);
          setIsCommandPaletteOpen(false);
        }}
        onOpenAmortization={() => {
          setIsAmortizationModalOpen(true);
          setIsCommandPaletteOpen(false);
        }}
        onOpenCosting={() => {
          setIsCostingModalOpen(true);
          setIsCommandPaletteOpen(false);
        }}
        onOpenTax1771={() => {
          setIsTax1771ModalOpen(true);
          setIsCommandPaletteOpen(false);
        }}
        onOpenValuation={() => {
          setIsValuationModalOpen(true);
          setIsCommandPaletteOpen(false);
        }}
        onOpenEcl={() => {
          setIsEclModalOpen(true);
          setIsCommandPaletteOpen(false);
        }}
        onOpenManualBook={() => {
          setCurrentTab('manual');
          setIsCommandPaletteOpen(false);
        }}
        onToggleDarkMode={() => {
          setIsDarkMode((prev) => !prev);
          setIsCommandPaletteOpen(false);
        }}
        onToggleRole={() => {
          store.setCurrentUserRole(currentUser.role === 'admin' ? 'staff' : 'admin');
          setIsCommandPaletteOpen(false);
        }}
        onResetData={() => {
          soundFx.playClick();
          setPokaYokeAnomaly({
            id: `py-reset-${Date.now()}`,
            type: 'destructive_action',
            title: 'Konfirmasi Reset Database',
            description: 'Anda akan menghapus seluruh data transaksi dan mengembalikannya ke data sampel awal. Tindakan ini bersifat permanen dan tidak dapat dibatalkan.',
            impact: 'Seluruh entri jurnal, faktur, laporan keuangan, dan data operasional yang baru ditambahkan akan hilang secara permanen.',
            recommendedAction: 'Pastikan Anda tidak sedang mendemokan data penting kepada klien sebelum melanjutkan.',
            autoFixLabel: 'Ya, Reset Database Sekarang',
            onAutoFix: () => {
              soundFx.playClick();
              resetToDefaultSeed();
              setPokaYokeAnomaly(null);
              setIsCommandPaletteOpen(false);
            },
          });
        }}
      />

      {/* Lazy Modals with Suspense */}
      <Suspense fallback={null}>
        {/* POS Cashier Terminal Modal (F4) */}
        {isPosOpen && (
          <PosCashierModal
            isOpen={isPosOpen}
            onClose={() => setIsPosOpen(false)}
            products={products}
            contacts={contacts}
            onCompleteSale={(data) => store.createSalesInvoice(data)}
          />
        )}

        {/* Period-End Closing Wizard Modal (F8) */}
        {isClosingModalOpen && (
          <PeriodClosingModal
            isOpen={isClosingModalOpen}
            onClose={() => setIsClosingModalOpen(false)}
          />
        )}

        {/* Executive CFO Intelligence Hub (F9) */}
        {isCfoModalOpen && (
          <CfoIntelligenceModal
            isOpen={isCfoModalOpen}
            onClose={() => setIsCfoModalOpen(false)}
          />
        )}

        {/* Forensic SHA-256 Audit Trail Modal (F10) */}
        {isForensicModalOpen && (
          <ForensicAuditModal
            isOpen={isForensicModalOpen}
            onClose={() => setIsForensicModalOpen(false)}
          />
        )}

        {/* Forex Studio Modal */}
        {isForexModalOpen && (
          <ForexStudioModal
            isOpen={isForexModalOpen}
            onClose={() => setIsForexModalOpen(false)}
          />
        )}

        {/* Prepaid Expense Amortization Schedule Modal */}
        {isAmortizationModalOpen && (
          <AmortizationScheduleModal
            isOpen={isAmortizationModalOpen}
            onClose={() => setIsAmortizationModalOpen(false)}
          />
        )}

        {/* Official PSAK/IFRS Report Exporter Modal */}
        {isOfficialExportModalOpen && (
          <OfficialReportExportModal
            isOpen={isOfficialExportModalOpen}
            onClose={() => setIsOfficialExportModalOpen(false)}
          />
        )}

        {/* Job-Order Costing Modal (F7) */}
        {isCostingModalOpen && (
          <JobOrderCostingModal
            isOpen={isCostingModalOpen}
            onClose={() => setIsCostingModalOpen(false)}
          />
        )}

        {/* SPT Tahunan PPh Badan 1771 Modal */}
        {isTax1771ModalOpen && (
          <Tax1771Modal
            isOpen={isTax1771ModalOpen}
            onClose={() => setIsTax1771ModalOpen(false)}
          />
        )}

        {/* DCF Valuation & WACC Modal */}
        {isValuationModalOpen && (
          <DcfValuationModal
            isOpen={isValuationModalOpen}
            onClose={() => setIsValuationModalOpen(false)}
          />
        )}

        {/* PSAK 71 / IFRS 9 ECL Provisioning Modal */}
        {isEclModalOpen && (
          <EclProvisioningModal
            isOpen={isEclModalOpen}
            onClose={() => setIsEclModalOpen(false)}
          />
        )}
      </Suspense>

      {/* Poka-Yoke Defensive UX Modal */}
      <PokaYokeModal
        isOpen={pokaYokeAnomaly !== null}
        onClose={() => setPokaYokeAnomaly(null)}
        anomaly={pokaYokeAnomaly}
      />
    </div>
  );
};
