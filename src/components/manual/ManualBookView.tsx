import React, { useState } from 'react';
import { Lightbulb,

  BookOpen,
  Search,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Calculator,
  ShieldCheck,
  FileText,
  DollarSign,
  Receipt,
  Building2,
  Printer,
  ChevronDown,
  ChevronUp,
  Tag,
  ExternalLink,
} from 'lucide-react';
import { MANUAL_TOPICS, ManualTopic } from '../../lib/manualBookData';
import { soundFx } from '../../lib/soundFx';

interface ManualBookViewProps {
  onNavigateToTab: (tabId: string) => void;
}

export const ManualBookView: React.FC<ManualBookViewProps> = ({ onNavigateToTab }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(MANUAL_TOPICS[0].id);

  const categories = [
    { id: 'all', label: 'Semua Panduan' },
    { id: 'workflow', label: '1. Alur Transaksi & Kasir POS' },
    { id: 'coa', label: '2. Bagan Akun (COA)' },
    { id: 'closing', label: '3. Tutup Buku & Bank' },
    { id: 'tax', label: '4. Pajak PPN & SPT 1771' },
    { id: 'executive', label: '5. Analisis CFO & Investor' },
    { id: 'glossary', label: '6. Kamus Istilah A-Z' },
  ];

  const filteredTopics = MANUAL_TOPICS.filter((t) => {
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchSubtitle = t.subtitle.toLowerCase().includes(q);
      const matchDesc = t.description.toLowerCase().includes(q);
      const matchTerms = t.keyTerms.some(
        (k) => k.term.toLowerCase().includes(q) || k.explanation.toLowerCase().includes(q)
      );
      return matchTitle || matchSubtitle || matchDesc || matchTerms;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-blue-300" />
                Sokara Knowledge Center
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Dokumentasi SOP & Akuntansi
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Buku Panduan & Standard Operating Procedure (SOP)
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed">
              Panduan interaktif pembukuan akuntansi modern, alur kerja transaksi harian, kepatuhan fiskal DJP, formula perhitungan rasio, dan glosarium istilah bisnis untuk pemilik usaha & staf.
            </p>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              window.print();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black border border-white/20 transition-all backdrop-blur-md self-start md:self-auto shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen SOP (A4)</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="glass-card rounded-2xl p-4 bg-white dark:bg-[#2B2D31] border border-slate-200 dark:border-[#3F4147] flex flex-col lg:flex-row items-center justify-between gap-4 shadow-sm">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                soundFx.playClick();
                setSelectedCategory(c.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                selectedCategory === c.id
                  ? 'bg-blue-600 dark:bg-[#0984E3] text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-100 dark:bg-[#1E1F22] text-slate-700 dark:text-[#DBDEE1] hover:bg-slate-200 dark:hover:bg-[#383A40]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Quick Search Box */}
        <div className="flex items-center bg-slate-100 dark:bg-[#1E1F22] rounded-xl px-3 py-2 w-full lg:w-80 border border-slate-200 dark:border-[#3F4147]">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kata kunci: FIFO, ECL, Altman, PPN..."
            className="bg-transparent text-xs w-full outline-none text-slate-800 dark:text-[#F2F3F5] placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Main Topic Articles List */}
      <div className="space-y-4">
        {filteredTopics.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-2xl bg-white dark:bg-[#2B2D31] border border-slate-200 dark:border-[#3F4147]">
            <HelpCircle className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-50" />
            <h3 className="text-base font-black text-slate-800 dark:text-white">Topik Tidak Ditemukan</h3>
            <p className="text-xs text-slate-500 dark:text-[#B5BAC1] mt-1">
              Coba gunakan kata kunci pencarian yang lebih umum seperti "Jurnal", "Kasir", atau "Pajak".
            </p>
          </div>
        ) : (
          filteredTopics.map((topic) => {
            const isExpanded = expandedTopicId === topic.id;

            return (
              <div
                key={topic.id}
                className="glass-card rounded-2xl overflow-hidden bg-white dark:bg-[#2B2D31] border border-slate-200 dark:border-[#3F4147] transition-all shadow-sm"
              >
                {/* Topic Header Row */}
                <div
                  onClick={() => {
                    soundFx.playClick();
                    setExpandedTopicId(isExpanded ? null : topic.id);
                  }}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 dark:hover:bg-[#383A40]/40 transition-colors"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800 shrink-0 mt-0.5">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {topic.badge}
                        </span>
                        <h2 className="text-base font-black text-slate-900 dark:text-white truncate">
                          {topic.title}
                        </h2>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-[#B5BAC1] truncate">
                        {topic.subtitle}
                      </p>
                    </div>
                  </div>

                  <button
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                    aria-label="Toggle detail"
                  >
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>

                {/* Expanded Topic Details */}
                {isExpanded && (
                  <div className="px-5 pb-6 pt-2 border-t border-slate-100 dark:border-[#3F4147] space-y-5 animate-in fade-in duration-150">
                    {/* General Explanation */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1E1F22] border border-slate-200/80 dark:border-[#3F4147]">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-[#B5BAC1] mb-1.5">
                        Ringkasan Konsep & Logika Bisnis
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-[#DBDEE1] leading-relaxed">
                        {topic.description}
                      </p>
                      <div className="mt-2 text-xs text-blue-700 dark:text-blue-400 font-bold">
                        <div className="flex items-center gap-1.5"><Lightbulb className="w-3.5 h-3.5 text-blue-500" /> Dampak Finansial: {topic.businessContext}</div>
                      </div>
                    </div>

                    {/* Formula / Accounting Journal Box */}
                    {topic.formulaOrRule && (
                      <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-1.5 text-xs font-black text-blue-900 dark:text-blue-300 mb-2">
                          <Calculator className="w-4 h-4" />
                          <span>Formula & Struktur Jurnal Berpasangan (Double-Entry)</span>
                        </div>
                        <pre className="font-mono text-xs text-blue-950 dark:text-blue-200 bg-white/90 dark:bg-[#1E1F22] p-3 rounded-lg border border-blue-100 dark:border-blue-900/60 overflow-x-auto whitespace-pre-wrap">
                          {topic.formulaOrRule}
                        </pre>
                      </div>
                    )}

                    {/* Step-by-Step SOP Checklist */}
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-[#B5BAC1] mb-2.5">
                        Langkah Operasional SOP (Step-by-Step)
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {topic.practicalSteps.map((step, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-white dark:bg-[#1E1F22] border border-slate-200 dark:border-[#3F4147] flex items-start gap-2.5"
                          >
                            <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <p className="text-xs text-slate-700 dark:text-[#DBDEE1] leading-relaxed">
                              {step}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Key Terms Glossary Breakdown */}
                    {topic.keyTerms.length > 0 && (
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-[#B5BAC1] mb-2.5">
                          Istilah & Terminologi Kunci
                        </h3>
                        <div className="space-y-2">
                          {topic.keyTerms.map((term, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-xl bg-slate-50/70 dark:bg-[#1E1F22] border border-slate-200/80 dark:border-[#3F4147] flex flex-col sm:flex-row sm:items-baseline justify-between gap-1"
                            >
                              <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                                <Tag className="w-3 h-3 text-blue-500" />
                                <span>{term.term}</span>
                              </div>
                              <div className="text-xs text-slate-600 dark:text-[#DBDEE1]">
                                {term.explanation}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Button: Jump to Screen */}
                    {topic.targetTab && (
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => {
                            soundFx.playClick();
                            onNavigateToTab(topic.targetTab!);
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 dark:bg-[#0984E3] hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <span>Buka Modul Ini di Aplikasi</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
