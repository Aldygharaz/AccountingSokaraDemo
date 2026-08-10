import React, { useState } from 'react';
import {
  Users,
  Plus,
  Mail,
  Phone,
  MapPin,
  FileText,
  Search,
  Building2,
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { Contact, ContactType } from '../../types/accounting';
import { AppState } from '../../lib/storage';
import { formatIDR } from '../../lib/accountingEngine';
import { Modal } from '../common/Modal';
import { Tooltip } from '../common/Tooltip';
import { useStore } from '../../lib/storage';

interface ContactsViewProps {
  onAddContact: (contact: Omit<Contact, 'id' | 'openBalanceAR' | 'openBalanceAP' | 'totalSales' | 'totalPurchases' | 'createdAt'>) => void;
  onOpenNewInvoiceForContact?: (contactId: string) => void;
}

export const ContactsView: React.FC<ContactsViewProps> = ({
  onAddContact,
}) => {
  const contacts = useStore(s => s.contacts);
  const invoices = useStore(s => s.invoices);
  const purchaseBills = useStore(s => s.purchaseBills);

  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedContactHistory, setSelectedContactHistory] = useState<Contact | null>(null);

  // New Contact Form state
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [type, setType] = useState<ContactType>('customer');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [taxId, setTaxId] = useState('');

  const filteredContacts = contacts.filter((c) => {
    if (filterType === 'customer' && c.type !== 'customer' && c.type !== 'keduanya') return false;
    if (filterType === 'vendor' && c.type !== 'vendor' && c.type !== 'keduanya') return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.companyName && c.companyName.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q))
      );
    }
    return true;
  });

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddContact({
      name: name.trim(),
      companyName: companyName.trim() || undefined,
      type,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      taxId: taxId.trim() || undefined,
      arBalance: 0,
      apBalance: 0,
    });

    setIsAddModalOpen(false);
    setName('');
    setCompanyName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setTaxId('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Kontak Pelanggan & Pemasok
            </h1>
            <Tooltip
              title="Buku Pembantu Piutang / Hutang"
              content="Daftar mitra bisnis, pelanggan B2B, dan supplier dengan histori buku pembantu (sub-ledger) saldo piutang (AR) dan tagihan (AP) terintegrasi."
              iconOnly
            />
          </div>
          <p className="text-sm text-slate-500 dark:text-[#B5BAC1] mt-1">
            Kelola data mitra bisnis, pelanggan tetap, supplier dagang, dan saldo tagihan terbuka.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kontak Baru</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { id: 'all', label: 'Semua Kontak' },
            { id: 'customer', label: 'Pelanggan (Customer)' },
            { id: 'vendor', label: 'Pemasok (Vendor)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center bg-slate-100/90 rounded-xl px-3 py-1.5 w-full md:w-64 border border-slate-200">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama, PT, email, telp..."
            className="bg-transparent text-xs w-full outline-none text-slate-800"
          />
        </div>
      </div>

      {/* Contacts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            className="glass-card glass-card-hover rounded-2xl p-5 flex flex-col justify-between relative group"
          >
            {/* Type badge */}
            <div className="absolute top-4 right-4">
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                  contact.type === 'customer'
                    ? 'bg-blue-100 text-blue-800'
                    : contact.type === 'vendor'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-purple-100 text-purple-800'
                }`}
              >
                {contact.type === 'customer' ? 'Pelanggan' : contact.type === 'vendor' ? 'Pemasok' : 'Keduanya'}
              </span>
            </div>

            <div>
              {/* Header Icon + Name */}
              <div className="flex items-center gap-3 mb-4 pr-16">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 border border-slate-300/50 flex items-center justify-center font-black text-slate-700 dark:text-slate-200 text-base shadow-sm">
                  {contact.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">{contact.name}</h3>
                  {contact.companyName && (
                    <p className="text-[11px] text-slate-500 dark:text-[#B5BAC1] font-medium">{contact.companyName}</p>
                  )}
                </div>
              </div>

              {/* Financial Balances Row */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50/90 border border-slate-200/60 mb-4">
                {contact.type !== 'vendor' && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Piutang Terbuka
                    </span>
                    <span
                      className={`text-xs font-black tabular-nums ${
                        (contact.openBalanceAR || contact.arBalance || 0) > 0 ? 'text-rose-600' : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {formatIDR(contact.openBalanceAR || contact.arBalance || 0)}
                    </span>
                  </div>
                )}
                {contact.type !== 'customer' && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Hutang Belum Lunas
                    </span>
                    <span
                      className={`text-xs font-black tabular-nums ${
                        (contact.openBalanceAP || contact.apBalance || 0) > 0 ? 'text-amber-600' : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {formatIDR(contact.openBalanceAP || contact.apBalance || 0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Details List */}
              <div className="space-y-1.5 text-xs text-slate-600">
                {contact.email && (
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{contact.phone}</span>
                  </div>
                )}
                {contact.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-[11px] text-slate-500 dark:text-[#B5BAC1] line-clamp-2">{contact.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Button */}
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setSelectedContactHistory(contact)}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Riwayat Transaksi</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Contact Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Kontak Pelanggan / Vendor Baru"
        subtitle="Registrasi kontak untuk pembuatan invoice penjualan dan tagihan supplier"
      >
        <form onSubmit={handleCreateContact} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Tipe Kontak *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ContactType)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input font-bold"
              >
                <option value="customer">Pelanggan (Customer)</option>
                <option value="vendor">Pemasok / Supplier (Vendor)</option>
                <option value="keduanya">Keduanya (Pelanggan & Vendor)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Nama Kontak / Individu *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: PT Sumber Rezeki"
                required
                className="w-full px-3 py-2 text-xs rounded-xl glass-input font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Nama Perusahaan / Bisnis (Opsional)
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Contoh: Sumber Rezeki Retail Group"
                className="w-full px-3 py-2 text-xs rounded-xl glass-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                NPWP / Tax ID (Opsional)
              </label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="01.234.567.8-012.000"
                className="w-full px-3 py-2 text-xs rounded-xl glass-input font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Email Kontak
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="finance@partner.com"
                className="w-full px-3 py-2 text-xs rounded-xl glass-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Nomor Telepon / WhatsApp
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812-xxxx-xxxx"
                className="w-full px-3 py-2 text-xs rounded-xl glass-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
              Alamat Lengkap Kantor / Toko
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              placeholder="Jl. Sudirman No. 123, Jakarta..."
              className="w-full px-3 py-2 text-xs rounded-xl glass-input"
            />
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
              Simpan Kontak
            </button>
          </div>
        </form>
      </Modal>

      {/* Transaction History Modal */}
      {selectedContactHistory && (
        <Modal
          isOpen={!!selectedContactHistory}
          onClose={() => setSelectedContactHistory(null)}
          title={`Riwayat Transaksi: ${selectedContactHistory.name}`}
          subtitle="Daftar faktur penjualan, tagihan pembelian, dan mutasi saldo terbuka"
          maxWidth="max-w-3xl"
        >
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <p className="text-xs text-slate-500 dark:text-[#B5BAC1] font-bold uppercase">
                  {selectedContactHistory.type === 'vendor' ? 'Total Pembelian (Purchases)' : 'Total Penjualan (Sales)'}
                </p>
                <p className="text-base font-black text-slate-900 tabular-nums">
                  {formatIDR((selectedContactHistory.type === 'vendor' ? selectedContactHistory.totalPurchases : selectedContactHistory.totalSales) || 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-[#B5BAC1] font-bold uppercase">Sisa Tagihan Terbuka</p>
                <p className="text-base font-black text-rose-600 tabular-nums">
                  {formatIDR(selectedContactHistory.arBalance || selectedContactHistory.apBalance || 0)}
                </p>
              </div>
            </div>

            {/* Invoices List for this contact */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Riwayat Transaksi Terkait
              </h4>
              {(() => {
                const salesInvoices = invoices.filter((i) => i.contactId === selectedContactHistory.id);
                const filteredPurchaseBills = (purchaseBills || []).filter((b) => b.contactId === selectedContactHistory.id);
                const totalTransactions = salesInvoices.length + filteredPurchaseBills.length;

                if (totalTransactions === 0) {
                  return <p className="text-xs text-slate-400">Belum ada riwayat transaksi.</p>;
                }

                return (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                    {salesInvoices.map((inv) => (
                      <div key={inv.id} className="p-3 flex items-center justify-between bg-white hover:bg-slate-50">
                        <div>
                          <p className="font-bold text-blue-600">{inv.invoiceNumber}</p>
                          <p className="text-[11px] text-slate-400">Tgl: {inv.date} • Jatuh Tempo: {inv.dueDate}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900 tabular-nums">{formatIDR(inv.total)}</p>
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${inv.status === 'lunas' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {inv.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    {filteredPurchaseBills.map((bill) => (
                      <div key={bill.id} className="p-3 flex items-center justify-between bg-white hover:bg-slate-50">
                        <div>
                          <p className="font-bold text-purple-600">{bill.billNumber}</p>
                          <p className="text-[11px] text-slate-400">Tgl: {bill.date} • Jatuh Tempo: {bill.dueDate}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900 tabular-nums">{formatIDR(bill.total)}</p>
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${bill.status === 'lunas' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {bill.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
