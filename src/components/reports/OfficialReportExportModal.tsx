import React, { useState } from 'react';
import { Landmark,
  FileSpreadsheet,
  Printer,
  Download,
  Building2,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
} from 'lucide-react';
import { AppState } from '../../lib/storage';
import {
  generateBalanceSheet,
  generateIncomeStatement,
  generateCashFlowDirect,
  formatIDR,
} from '../../lib/accountingEngine';
import { Modal } from '../common/Modal';
import { soundFx } from '../../lib/soundFx';
import { useStore } from '../../lib/storage';

interface OfficialReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  }

export const OfficialReportExportModal: React.FC<OfficialReportExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const accounts = useStore(s => s.accounts);
  const journalEntries = useStore(s => s.journalEntries);
  const currentUser = useStore(s => s.currentUser);

  const [reportType, setReportType] = useState<'balance_sheet' | 'income_statement' | 'cash_flow'>('balance_sheet');
  const [asOfDate, setAsOfDate] = useState('2026-08-31');

  const bs = generateBalanceSheet(accounts, journalEntries, asOfDate);
  const pnl = generateIncomeStatement(accounts, journalEntries, undefined, asOfDate);
  const cf = generateCashFlowDirect(accounts, journalEntries, undefined, asOfDate);

  const handlePrint = () => {
    soundFx.playChime();
    window.print();
  };

  const handleDownloadCsv = () => {
    soundFx.playChaChing();
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += `LAPORAN KEUANGAN RESMI - PT SOKARA DEMO ACCOUNTING\n`;
    csvContent += `Periode: Per ${asOfDate}\n\n`;

    if (reportType === 'balance_sheet') {
      csvContent += `Kategori,Kode Akun,Nama Akun,Jumlah (IDR)\n`;
      bs.currentAssets.forEach((a) => {
        csvContent += `Aset Lancar,${a.accountCode},"${a.accountName}",${a.amount}\n`;
      });
      bs.nonCurrentAssets.forEach((a) => {
        csvContent += `Aset Tidak Lancar,${a.accountCode},"${a.accountName}",${a.amount}\n`;
      });
      bs.currentLiabilities.forEach((l) => {
        csvContent += `Liabilitas Lancar,${l.accountCode},"${l.accountName}",${l.amount}\n`;
      });
      bs.equityItems.forEach((e) => {
        csvContent += `Ekuitas,${e.accountCode},"${e.accountName}",${e.amount}\n`;
      });
    } else if (reportType === 'income_statement') {
      csvContent += `Kategori,Kode Akun,Nama Akun,Jumlah (IDR)\n`;
      pnl.revenues.forEach((r) => {
        csvContent += `Pendapatan Usaha,${r.accountCode},"${r.accountName}",${r.amount}\n`;
      });
      pnl.cogs.forEach((c) => {
        csvContent += `HPP,${c.accountCode},"${c.accountName}",${c.amount}\n`;
      });
      pnl.operatingExpenses.forEach((o) => {
        csvContent += `Beban Operasional,${o.accountCode},"${o.accountName}",${o.amount}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_${reportType}_${asOfDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ekspor Laporan Keuangan Resmi (Standar PSAK / SAK EMKM)" icon={<Landmark className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
      maxWidth="max-w-5xl"
    >
      <div className="space-y-6">
        {/* Controls bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#2B2D31] border border-slate-200/80 dark:border-[#3F4147]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setReportType('balance_sheet')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                reportType === 'balance_sheet'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-[#1E1F22] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#3F4147]'
              }`}
            >
              Neraca (Posisi Keuangan)
            </button>
            <button
              type="button"
              onClick={() => setReportType('income_statement')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                reportType === 'income_statement'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-[#1E1F22] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#3F4147]'
              }`}
            >
              Laba Rugi Komprehensif
            </button>
            <button
              type="button"
              onClick={() => setReportType('cash_flow')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                reportType === 'cash_flow'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-[#1E1F22] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#3F4147]'
              }`}
            >
              Arus Kas (Direct Method)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#1E1F22] border border-slate-200 dark:border-[#3F4147] text-slate-800 dark:text-white font-bold"
            />
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-[#3F4147] text-slate-700 dark:text-slate-200 text-xs font-black flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-[#383A40]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Excel / CSV</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black flex items-center gap-1.5 shadow-md"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak PDF Resmi</span>
            </button>
          </div>
        </div>

        {/* Printable Official Letterhead Container */}
        <div className="p-8 rounded-3xl bg-white dark:bg-[#1E1F22] border border-slate-200 dark:border-[#3F4147] shadow-sm space-y-6 text-slate-900 dark:text-white">
          {/* Formal Company Header */}
          <div className="text-center border-b-2 border-slate-800 dark:border-slate-300 pb-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-black tracking-tight uppercase">
                PT LEDGERLOGIC INDONESIA SEJAHTERA
              </h2>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-[#B5BAC1] font-medium">
              NPWP: 01.234.567.8-012.000 • Gedung Bursa Efek Indonesia Tower 2 Lt. 18, SCBD Jakarta Selatan
            </div>
            <div className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 mt-2">
              {reportType === 'balance_sheet' && 'LAPORAN POSISI KEUANGAN (NERACA)'}
              {reportType === 'income_statement' && 'LAPORAN LABA RUGI KOMPREHENSIF'}
              {reportType === 'cash_flow' && 'LAPORAN ARUS KAS (METODE LANGSUNG)'}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Periode yang Berakhir pada {asOfDate} (Dalam Rupiah Indonesia)
            </div>
          </div>

          {/* Report Body */}
          {reportType === 'balance_sheet' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
              {/* Left Column: Assets */}
              <div className="space-y-4">
                <div className="border-b border-slate-300 dark:border-[#3F4147] pb-1 font-black uppercase text-blue-600 dark:text-blue-400">
                  ASET (AKTIVA)
                </div>
                <div className="space-y-2">
                  <div className="font-bold text-slate-700 dark:text-slate-300">Aset Lancar:</div>
                  {bs.currentAssets.map((a) => (
                    <div key={a.accountId} className="flex justify-between pl-3 text-slate-600 dark:text-[#DBDEE1]">
                      <span>{a.accountName}</span>
                      <span className="font-mono tabular-nums">{formatIDR(a.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold border-t border-slate-200 dark:border-[#3F4147] pt-1">
                    <span>Total Aset Lancar</span>
                    <span className="font-mono tabular-nums">{formatIDR(bs.totalCurrentAssets)}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="font-bold text-slate-700 dark:text-slate-300">Aset Tidak Lancar (Aset Tetap):</div>
                  {bs.nonCurrentAssets.map((a) => (
                    <div key={a.accountId} className="flex justify-between pl-3 text-slate-600 dark:text-[#DBDEE1]">
                      <span>{a.accountName}</span>
                      <span className="font-mono tabular-nums">{formatIDR(a.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold border-t border-slate-200 dark:border-[#3F4147] pt-1">
                    <span>Total Aset Tidak Lancar</span>
                    <span className="font-mono tabular-nums">{formatIDR(bs.totalNonCurrentAssets)}</span>
                  </div>
                </div>

                <div className="flex justify-between font-black text-sm border-t-2 border-slate-800 dark:border-white pt-2 text-slate-900 dark:text-white">
                  <span>JUMLAH ASET</span>
                  <span className="font-mono tabular-nums">{formatIDR(bs.totalAssets)}</span>
                </div>
              </div>

              {/* Right Column: Liabilities & Equity */}
              <div className="space-y-4">
                <div className="border-b border-slate-300 dark:border-[#3F4147] pb-1 font-black uppercase text-indigo-600 dark:text-indigo-400">
                  LIABILITAS & EKUITAS (PASIVA)
                </div>
                <div className="space-y-2">
                  <div className="font-bold text-slate-700 dark:text-slate-300">Liabilitas Jangka Pendek:</div>
                  {bs.currentLiabilities.map((l) => (
                    <div key={l.accountId} className="flex justify-between pl-3 text-slate-600 dark:text-[#DBDEE1]">
                      <span>{l.accountName}</span>
                      <span className="font-mono tabular-nums">{formatIDR(l.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold border-t border-slate-200 dark:border-[#3F4147] pt-1">
                    <span>Total Liabilitas</span>
                    <span className="font-mono tabular-nums">{formatIDR(bs.totalCurrentLiabilities)}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="font-bold text-slate-700 dark:text-slate-300">Ekuitas Pemilik:</div>
                  {bs.equityItems.map((e) => (
                    <div key={e.accountId} className="flex justify-between pl-3 text-slate-600 dark:text-[#DBDEE1]">
                      <span>{e.accountName}</span>
                      <span className="font-mono tabular-nums">{formatIDR(e.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pl-3 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Laba Bersih Periode Berjalan</span>
                    <span className="font-mono tabular-nums">{formatIDR(bs.currentPeriodNetIncome)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-slate-200 dark:border-[#3F4147] pt-1">
                    <span>Total Ekuitas</span>
                    <span className="font-mono tabular-nums">{formatIDR(bs.totalEquity)}</span>
                  </div>
                </div>

                <div className="flex justify-between font-black text-sm border-t-2 border-slate-800 dark:border-white pt-2 text-slate-900 dark:text-white">
                  <span>JUMLAH LIABILITAS & EKUITAS</span>
                  <span className="font-mono tabular-nums">{formatIDR(bs.totalLiabilitiesAndEquity)}</span>
                </div>
              </div>
            </div>
          )}

          {reportType === 'income_statement' && (
            <div className="max-w-2xl mx-auto space-y-4 text-xs">
              <div className="flex justify-between font-black text-sm border-b border-slate-300 pb-1">
                <span>PENDAPATAN USAHA (REVENUE)</span>
                <span className="font-mono tabular-nums text-emerald-600">{formatIDR(pnl.totalRevenue)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                <span>BEBAN POKOK PENJUALAN (HPP)</span>
                <span className="font-mono tabular-nums text-rose-600">({formatIDR(pnl.totalCogs)})</span>
              </div>
              <div className="flex justify-between font-black text-sm bg-slate-50 dark:bg-[#2B2D31] p-2.5 rounded-xl">
                <span>LABA KOTOR (GROSS PROFIT)</span>
                <span className="font-mono tabular-nums text-blue-600">{formatIDR(pnl.grossProfit)}</span>
              </div>

              <div className="pt-2 space-y-1.5">
                <div className="font-bold text-slate-700 dark:text-slate-300">Beban Operasional:</div>
                {pnl.operatingExpenses.map((o) => (
                  <div key={o.accountId} className="flex justify-between pl-3 text-slate-600 dark:text-[#DBDEE1]">
                    <span>{o.accountName}</span>
                    <span className="font-mono tabular-nums">{formatIDR(o.amount)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-black text-base border-t-2 border-slate-800 dark:border-white pt-3 text-emerald-600 dark:text-emerald-400">
                <span>LABA BERSIH TAHUN/PERIODE BERJALAN</span>
                <span className="font-mono tabular-nums">{formatIDR(pnl.netIncome)}</span>
              </div>
            </div>
          )}

          {/* Formal Signatures & Corporate Stamp Block */}
          <div className="pt-8 border-t border-slate-200 dark:border-[#3F4147] grid grid-cols-2 text-center text-xs">
            <div>
              <div className="text-slate-400 mb-12">Disiapkan Oleh:</div>
              <div className="font-black text-slate-900 dark:text-white uppercase">{currentUser.name}</div>
              <div className="text-[10px] text-slate-500">Chief Accountant / Controller (BKP/CPA)</div>
            </div>
            <div>
              <div className="text-slate-400 mb-12">Disetujui & Diotorisasi:</div>
              <div className="font-black text-slate-900 dark:text-white uppercase">Ir. Hendra Gunawan, MBA</div>
              <div className="text-[10px] text-slate-500">Direktur Utama / Chief Executive Officer</div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
