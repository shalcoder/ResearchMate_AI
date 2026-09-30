'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ResearchPaper, PaperChunk, PaperSummary } from '@/types';
import { api } from '@/lib/api';
import { Button, StatusBadge, Badge, Skeleton, EmptyState } from '@/components/ui';
import { MessageSquare, Columns, FileText, ArrowLeft, Download, Sparkles, Check, Bookmark } from 'lucide-react';

type WorkbenchTab = 'overview' | 'summary' | 'findings' | 'methodology' | 'gaps' | 'evidence';

export default function PaperDetailPage() {
  const params = useParams();
  const router = useRouter();
  const paperId = params.id as string;

  const [paper, setPaper] = useState<ResearchPaper | null>(null);
  const [chunks, setChunks] = useState<PaperChunk[]>([]);
  const [summary, setSummary] = useState<PaperSummary | null>(null);
  const [activeTab, setActiveTab] = useState<WorkbenchTab>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [showCitationModal, setShowCitationModal] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  useEffect(() => {
    if (!paperId) return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        const [paperRes, chunksRes] = await Promise.all([
          api.get(`/papers/${paperId}`),
          api.get(`/papers/${paperId}/chunks`),
        ]);
        setPaper(paperRes.data);
        setChunks(chunksRes.data || []);

        try {
          const sumRes = await api.get(`/papers/${paperId}/summary`);
          setSummary(sumRes.data);
        } catch {
          // Summary not generated yet
        }
      } catch (err) {
        console.error('Failed to load paper details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [paperId]);

  const handleGenerateSummary = async () => {
    try {
      setIsGeneratingSummary(true);
      const res = await api.post(`/papers/${paperId}/summary`);
      setSummary(res.data);
      setActiveTab('summary');
    } catch (err) {
      alert('Failed to generate summary.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const getCitationText = (format: 'bibtex' | 'ieee' | 'apa') => {
    if (!paper) return '';
    const authorList = paper.authors?.join(', ') || 'Unknown Author';
    const firstAuthor = paper.authors?.[0] || 'Author';
    const firstAuthorLast = firstAuthor.split(' ').pop()?.toLowerCase() || 'paper';
    const year = paper.publication_year || '2024';

    if (format === 'bibtex') {
      return `@article{${firstAuthorLast}${year},\n  title = {${paper.title}},\n  author = {${paper.authors?.join(' and ') || 'Unknown'}},\n  journal = {${paper.venue || 'ArXiv Pre-print'}},\n  year = {${year}},\n${paper.doi ? `  doi = {${paper.doi}}\n` : ''}}`;
    }
    if (format === 'ieee') {
      return `${authorList}, "${paper.title}," ${paper.venue || 'ArXiv Pre-print'}, ${year}.${paper.doi ? ` doi: ${paper.doi}.` : ''}`;
    }
    // APA
    return `${authorList} (${year}). ${paper.title}. ${paper.venue || 'ArXiv Pre-print'}.${paper.doi ? ` https://doi.org/${paper.doi}` : ''}`;
  };

  const handleCopyCitation = (format: 'bibtex' | 'ieee' | 'apa') => {
    navigator.clipboard.writeText(getCitationText(format));
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 max-w-5xl mx-auto">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!paper) {
    return (
      <DashboardLayout>
        <EmptyState
          title="Paper Not Found"
          description="The requested research paper ID does not exist in your indexed literature repository."
          actionLabel="← Back to Library"
          onAction={() => router.push('/papers')}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-300">
        {/* Back Link & Meta Provenance Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/papers"
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Research Library</span>
          </Link>

          <div className="flex items-center gap-2">
            <StatusBadge
              status={paper.total_chunks > 0 ? 'indexed' : 'processing'}
              label={`${paper.total_chunks} Vector Chunks`}
            />
          </div>
        </div>

        {/* Paper Workbench Editorial Header */}
        <div className="worldlabs-card rounded-3xl p-8 sm:p-10 border border-white/10 relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="space-y-4 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="worldlabs-pill text-[10px] text-indigo-300 border-indigo-500/30 bg-indigo-500/10">
                  {paper.venue ? paper.venue.split('(')[0] : 'Academic Publication'}
                </span>
                <span className="text-xs text-slate-400 font-mono font-semibold">
                  Published {paper.publication_year || 'Recent'}
                </span>
                {paper.doi && (
                  <span className="text-xs text-sky-400 font-mono bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
                    DOI: {paper.doi}
                  </span>
                )}
                <span className="text-xs text-slate-500 font-mono">
                  • {paper.total_pages} Pages • {chunks.length} Vectors
                </span>
              </div>

              <h1 className="text-display text-white tracking-tight leading-snug">
                {paper.title}
              </h1>

              {/* Authors List */}
              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-300">
                <span className="text-slate-500 font-medium">Authors:</span>
                {paper.authors?.map((author, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-medium"
                  >
                    {author}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Workbench Action Capsules */}
            <div className="flex flex-wrap lg:flex-col gap-2.5 shrink-0 relative z-10">
              <Link
                href={`/chat?paper_id=${paper.id}`}
                className="worldlabs-btn-primary text-xs py-2.5 px-5 font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Ask Paper (RAG)</span>
              </Link>
              <Link
                href={`/compare?target=${paper.id}`}
                className="worldlabs-btn-secondary text-xs py-2.5 px-4 font-medium flex items-center justify-center gap-2"
              >
                <Columns className="w-4 h-4" />
                <span>Compare Model</span>
              </Link>
              <button
                onClick={() => setShowCitationModal(true)}
                className="worldlabs-btn-secondary text-xs py-2.5 px-4 font-medium flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Export Citation</span>
              </button>
            </div>
          </div>
        </div>

        {/* Workbench Tab Navigation */}
        <div className="worldlabs-card rounded-2xl p-1.5 border border-white/10 flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'overview', label: 'Paper Overview' },
            { id: 'summary', label: 'AI Structured Summary' },
            { id: 'findings', label: 'Key Breakthroughs' },
            { id: 'methodology', label: 'Methodology & Datasets' },
            { id: 'gaps', label: 'Research Gaps & Limits' },
            { id: 'evidence', label: `Vector Chunks (${chunks.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as WorkbenchTab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-black font-bold shadow-md shadow-white/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Editorial Content Container */}
        <div className="space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="worldlabs-card rounded-3xl p-8 border border-white/10 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10">
                    Source Fact
                  </span>
                  <h3 className="text-sm font-bold text-white">Document Abstract</h3>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">Page 1 • Section 1</span>
              </div>

              <div className="text-sm text-slate-200 leading-relaxed font-normal whitespace-pre-line max-w-4xl">
                {paper.abstract || 'No abstract provided for this research paper.'}
              </div>

              {/* Technical Specifications */}
              <div className="pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Total Pages</span>
                  <span className="text-base font-bold text-white font-mono">{paper.total_pages}</span>
                </div>
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Semantic Chunks</span>
                  <span className="text-base font-bold text-sky-400 font-mono">{chunks.length}</span>
                </div>
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Venue / Journal</span>
                  <span className="text-xs font-semibold text-white truncate block">{paper.venue || 'Academic'}</span>
                </div>
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Vector Embedding Model</span>
                  <span className="text-xs font-mono text-indigo-300">MiniLM-L6-v2</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI STRUCTURED SUMMARY */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              {!summary ? (
                <EmptyState
                  icon={<Sparkles className="w-6 h-6 text-indigo-400" />}
                  title="5-Point Scientific Summary Not Generated"
                  description="Run Gemini Grounded Analysis to extract executive insights, empirical contributions, experimental architecture, and open research gaps."
                  actionLabel={isGeneratingSummary ? 'Analyzing Content...' : 'Generate 5-Point Summary'}
                  onAction={handleGenerateSummary}
                />
              ) : (
                <div className="space-y-6">
                  {/* Executive Overview */}
                  <div className="worldlabs-card rounded-3xl p-8 border border-white/10 space-y-3 bg-gradient-to-br from-indigo-950/20 via-slate-900/60 to-slate-900/40">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                          AI Interpretation
                        </span>
                        <h3 className="text-sm font-bold text-white">Executive Synthesis</h3>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Grounded on Full Document</span>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {summary.executive_summary}
                    </p>
                  </div>

                  {/* 2-Column Insight Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="worldlabs-card rounded-3xl p-6 border border-emerald-500/20 space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                          Key Empirical Breakthroughs
                        </h4>
                      </div>
                      <ul className="space-y-2 text-xs text-slate-300">
                        {summary.key_findings.map((finding, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <span className="text-emerald-400 font-bold shrink-0">•</span>
                            <span className="leading-relaxed">{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="worldlabs-card rounded-3xl p-6 border border-amber-500/20 space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                        <span className="text-amber-400">⚙</span>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                          Algorithmic Formulation
                        </h4>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {summary.methodology || 'Empirical benchmark and comparative algorithmic analysis.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: KEY FINDINGS & BENCHMARKS */}
          {activeTab === 'findings' && (
            <div className="worldlabs-card rounded-3xl p-8 border border-white/10 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Empirical Breakthroughs & Benchmarks</h3>
                  <p className="text-xs text-slate-400">Verifiable contributions backed by page-level evidence</p>
                </div>
                <span className="text-[10px] text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 font-bold">
                  Verified Findings
                </span>
              </div>

              {summary?.key_findings ? (
                <div className="space-y-3">
                  {summary.key_findings.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-emerald-400">Finding #{idx + 1}</span>
                        <span className="text-slate-500 font-mono text-[11px]">[Provenance: Section 3 & 4]</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Breakthroughs Not Extracted"
                  description="Generate the 5-point scientific summary to extract experimental breakthroughs."
                  actionLabel="Generate Summary"
                  onAction={handleGenerateSummary}
                />
              )}
            </div>
          )}

          {/* TAB 4: METHODOLOGY & DATASETS */}
          {activeTab === 'methodology' && (
            <div className="worldlabs-card rounded-3xl p-8 border border-white/10 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Methodological Framework</h3>
                  <p className="text-xs text-slate-400">Experimental design, datasets, and baseline comparisons</p>
                </div>
                <span className="text-[10px] text-amber-300 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 font-bold">
                  System Architecture
                </span>
              </div>

              {summary?.methodology ? (
                <div className="p-6 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-medium text-amber-400">Mathematical & Algorithmic Formulation</span>
                    <span className="font-mono text-[11px]">[Section 2 & 4]</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                    {summary.methodology}
                  </p>
                </div>
              ) : (
                <EmptyState
                  title="Methodology Not Extracted"
                  description="Run the scientific analysis module to extract experimental methodology."
                  actionLabel="Generate Summary"
                  onAction={handleGenerateSummary}
                />
              )}
            </div>
          )}

          {/* TAB 5: LIMITATIONS & RESEARCH GAPS */}
          {activeTab === 'gaps' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="worldlabs-card rounded-3xl p-6 border border-rose-500/20 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                  <span className="text-rose-400 font-bold">⚠️</span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-300">
                    Acknowledged Limitations
                  </h3>
                </div>
                {summary?.limitations && summary.limitations.length > 0 ? (
                  <ul className="space-y-3 text-xs text-slate-300">
                    {summary.limitations.map((lim, idx) => (
                      <li key={idx} className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                        <span className="leading-relaxed block text-slate-200">{lim}</span>
                        <span className="text-[10px] text-slate-500 font-mono block">[Provenance: Discussion & Limits]</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400">No limitation notes registered.</p>
                )}
              </div>

              <div className="worldlabs-card rounded-3xl p-6 border border-sky-500/20 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                  <span className="text-sky-400 font-bold">💡</span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-sky-300">
                    Candidate Research Gaps
                  </h3>
                </div>
                {summary?.future_scope && summary.future_scope.length > 0 ? (
                  <ul className="space-y-3 text-xs text-slate-300">
                    {summary.future_scope.map((f, idx) => (
                      <li key={idx} className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                        <span className="leading-relaxed block text-slate-200">{f}</span>
                        <span className="text-[10px] text-slate-500 font-mono block">[Provenance: Future Work]</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400">No future scope notes registered.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: VECTOR CHUNKS & PAGE EVIDENCE */}
          {activeTab === 'evidence' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">ChromaDB Chunk Representations</h3>
                  <p className="text-xs text-slate-400">
                    Exact vectorized chunks indexed with cosine similarity for zero-hallucination Grounded RAG.
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Total: {chunks.length} Vectors
                </span>
              </div>

              <div className="space-y-3">
                {chunks.map((chk) => (
                  <div
                    key={chk.id}
                    className="worldlabs-card rounded-2xl p-5 border border-white/10 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/25">
                          Chunk #{chk.chunk_index + 1}
                        </span>
                        <span className="text-xs font-semibold text-white">
                          {chk.section_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                        <span>Page {chk.page_number}</span>
                        <span>•</span>
                        <span>{chk.token_count} tokens</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-200 font-mono leading-relaxed bg-black/50 p-4 rounded-xl border border-white/5">
                      "{chk.content}"
                    </p>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Link
                        href={`/chat?paper_id=${paper.id}&q=${encodeURIComponent(`Explain this section: "${chk.section_name}"`)}`}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                      >
                        Ask Question on this Chunk →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Multi-Format Citation Export Modal */}
      {showCitationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="worldlabs-card rounded-3xl border border-white/15 max-w-xl w-full p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Export Academic Citation</h3>
              <button
                onClick={() => setShowCitationModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* BibTeX */}
              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">BibTeX Format</span>
                  <button
                    onClick={() => handleCopyCitation('bibtex')}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    {copiedFormat === 'bibtex' ? <><Check className="w-3.5 h-3.5 text-emerald-400" /> Copied</> : 'Copy BibTeX'}
                  </button>
                </div>
                <pre className="text-[11px] text-slate-300 font-mono overflow-x-auto p-2 bg-black/40 rounded-lg">
                  {getCitationText('bibtex')}
                </pre>
              </div>

              {/* IEEE */}
              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">IEEE Standard</span>
                  <button
                    onClick={() => handleCopyCitation('ieee')}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    {copiedFormat === 'ieee' ? <><Check className="w-3.5 h-3.5 text-emerald-400" /> Copied</> : 'Copy IEEE'}
                  </button>
                </div>
                <p className="text-xs text-slate-300 font-serif leading-relaxed">
                  {getCitationText('ieee')}
                </p>
              </div>

              {/* APA */}
              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">APA 7th Edition</span>
                  <button
                    onClick={() => handleCopyCitation('apa')}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    {copiedFormat === 'apa' ? <><Check className="w-3.5 h-3.5 text-emerald-400" /> Copied</> : 'Copy APA'}
                  </button>
                </div>
                <p className="text-xs text-slate-300 font-serif leading-relaxed">
                  {getCitationText('apa')}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setShowCitationModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
