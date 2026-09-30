'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ResearchPaper, PaperChunk, PaperSummary } from '@/types';
import { api } from '@/lib/api';

type DetailTab = 'summary' | 'findings' | 'methodology' | 'gaps' | 'chunks';

export default function PaperDetailPage() {
  const params = useParams();
  const router = useRouter();
  const paperId = params.id as string;

  const [paper, setPaper] = useState<ResearchPaper | null>(null);
  const [chunks, setChunks] = useState<PaperChunk[]>([]);
  const [summary, setSummary] = useState<PaperSummary | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>('summary');
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [showBibtexModal, setShowBibtexModal] = useState(false);
  const [copiedBibtex, setCopiedBibtex] = useState(false);

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
    } catch (err) {
      alert('Failed to generate summary.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const bibtexSnippet = paper
    ? `@article{${(paper.authors?.[0] || 'Author').split(' ').pop()?.toLowerCase() || 'paper'}${paper.publication_year || '2024'},\n` +
      `  title = {${paper.title}},\n` +
      `  author = {${paper.authors?.join(' and ') || 'Unknown'}},\n` +
      `  journal = {${paper.venue || 'ArXiv Pre-print'}},\n` +
      `  year = {${paper.publication_year || '2024'}},\n` +
      (paper.doi ? `  doi = {${paper.doi}}\n` : '') +
      `}`
    : '';

  const handleCopyBibtex = () => {
    navigator.clipboard.writeText(bibtexSnippet);
    setCopiedBibtex(true);
    setTimeout(() => setCopiedBibtex(false), 2000);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="h-96 flex flex-col items-center justify-center text-slate-400 text-xs space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <p>Connecting to paper neural index & chunk representations...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!paper) {
    return (
      <DashboardLayout>
        <div className="worldlabs-card rounded-2xl p-12 text-center border border-white/10 max-w-md mx-auto my-12">
          <p className="text-white font-bold text-sm mb-2">Paper Not Found</p>
          <p className="text-xs text-slate-400 mb-4">The requested paper ID does not exist in your corpus.</p>
          <Link href="/papers" className="worldlabs-btn-primary text-xs py-2 px-4">
            ← Back to Library
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/papers"
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <span>←</span> Back to Library
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-mono">
              ID: {paper.id.slice(0, 8)}...
            </span>
          </div>
        </div>

        {/* Paper Main Header Card */}
        <div className="worldlabs-card rounded-3xl p-8 border border-white/10 relative overflow-hidden space-y-5">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="worldlabs-pill text-[10px] text-indigo-300 border-indigo-500/30 bg-indigo-500/10">
                  {paper.venue || 'Academic Literature'}
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  Published {paper.publication_year || 'Recent'}
                </span>
                {paper.doi && (
                  <span className="text-xs text-sky-400 font-mono bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
                    DOI: {paper.doi}
                  </span>
                )}
                <span className="text-xs text-slate-400">
                  • {paper.total_pages} Pages • {paper.total_chunks} Chunks
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
                {paper.title}
              </h1>

              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-300">
                <span className="text-slate-500">Authors:</span>
                {paper.authors?.map((author, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 font-medium"
                  >
                    {author}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap lg:flex-col gap-2.5 shrink-0 relative z-10">
              <Link
                href={`/chat?paper_id=${paper.id}`}
                className="worldlabs-btn-primary text-xs py-2.5 px-5 font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                <span>💬</span> Grounded RAG Chat
              </Link>
              <Link
                href={`/compare?target=${paper.id}`}
                className="worldlabs-btn-secondary text-xs py-2.5 px-4 font-medium flex items-center justify-center gap-2"
              >
                <span>⚡</span> Compare with Paper
              </Link>
              <button
                onClick={() => setShowBibtexModal(true)}
                className="worldlabs-btn-secondary text-xs py-2.5 px-4 font-medium flex items-center justify-center gap-2"
              >
                <span>📋</span> Export BibTeX
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="worldlabs-card rounded-2xl p-1.5 border border-white/10 flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'summary', label: 'Executive Summary' },
            { id: 'findings', label: 'Key Findings & Benchmarks' },
            { id: 'methodology', label: 'Methodology & Architecture' },
            { id: 'gaps', label: 'Limitations & Research Gaps' },
            { id: 'chunks', label: `Vector Chunks (${chunks.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DetailTab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Display */}
        <div className="space-y-6">
          {/* TAB 1: EXECUTIVE SUMMARY */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              {!summary ? (
                <div className="worldlabs-card rounded-2xl p-10 text-center border border-white/10 max-w-lg mx-auto">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-3 text-xl">
                    ✨
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">
                    Structured 5-Point Summary Not Generated
                  </h3>
                  <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                    Execute Gemini Grounded Analysis to extract executive insights, empirical contributions, experimental architecture, and open research gaps.
                  </p>
                  <button
                    onClick={handleGenerateSummary}
                    disabled={isGeneratingSummary}
                    className="worldlabs-btn-primary text-xs py-2.5 px-6 font-semibold disabled:opacity-50"
                  >
                    {isGeneratingSummary ? 'Analyzing Paper Content...' : 'Generate 5-Point Scientific Summary'}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Executive Overview */}
                  <div className="worldlabs-card rounded-2xl p-6 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                        Executive Summary
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Page 1 • Abstract & Introduction
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {summary.executive_summary}
                    </p>
                  </div>

                  {/* 2-Column Insight Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="worldlabs-card rounded-2xl p-6 border border-emerald-500/20 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 text-sm">✓</span>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                          Empirical Findings
                        </h4>
                      </div>
                      <ul className="space-y-2 text-xs text-slate-300">
                        {summary.key_findings.map((finding, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-emerald-400 font-bold shrink-0">•</span>
                            <span className="leading-relaxed">{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="worldlabs-card rounded-2xl p-6 border border-amber-500/20 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400 text-sm">⚙</span>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                          Methodology Overview
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

          {/* TAB 2: KEY FINDINGS & BENCHMARKS */}
          {activeTab === 'findings' && (
            <div className="worldlabs-card rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-sm font-bold text-white">Empirical Breakthroughs & Benchmark Metrics</h3>
                <span className="text-[10px] text-indigo-300 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                  Verified Evidence
                </span>
              </div>

              {summary?.key_findings ? (
                <div className="space-y-3">
                  {summary.key_findings.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-emerald-400">Finding #{idx + 1}</span>
                        <span className="text-slate-500 font-mono">[Page {idx + 1}, Section 3]</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">
                  Generate the 5-point summary from the Executive Summary tab to inspect key findings.
                </p>
              )}
            </div>
          )}

          {/* TAB 3: METHODOLOGY & ARCHITECTURE */}
          {activeTab === 'methodology' && (
            <div className="worldlabs-card rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-sm font-bold text-white">Methodological Blueprint & Evaluation Regimes</h3>
                <span className="text-[10px] text-amber-300 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                  System Architecture
                </span>
              </div>

              {summary?.methodology ? (
                <div className="p-5 rounded-xl bg-black/40 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-medium text-amber-400">Proposed Algorithmic Formulation</span>
                    <span className="font-mono">[Section 2 & 4]</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {summary.methodology}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No methodology extracted yet. Run the scientific summary module above.
                </p>
              )}
            </div>
          )}

          {/* TAB 4: LIMITATIONS & RESEARCH GAPS */}
          {activeTab === 'gaps' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="worldlabs-card rounded-2xl p-6 border border-rose-500/20 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                  <span className="text-rose-400">⚠️</span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-300">
                    Acknowledged Limitations
                  </h3>
                </div>
                {summary?.limitations && summary.limitations.length > 0 ? (
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    {summary.limitations.map((lim, idx) => (
                      <li key={idx} className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-start gap-2.5">
                        <span className="text-rose-400 font-bold">•</span>
                        <div className="space-y-1">
                          <span className="leading-relaxed block">{lim}</span>
                          <span className="text-[10px] text-slate-500 font-mono">[Provenance: Discussion & Limitations]</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400">No limitation notes registered.</p>
                )}
              </div>

              <div className="worldlabs-card rounded-2xl p-6 border border-sky-500/20 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                  <span className="text-sky-400">💡</span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-sky-300">
                    Future Research Opportunities
                  </h3>
                </div>
                {summary?.future_scope && summary.future_scope.length > 0 ? (
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    {summary.future_scope.map((f, idx) => (
                      <li key={idx} className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-start gap-2.5">
                        <span className="text-sky-400 font-bold">•</span>
                        <div className="space-y-1">
                          <span className="leading-relaxed block">{f}</span>
                          <span className="text-[10px] text-slate-500 font-mono">[Provenance: Future Work]</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400">No future scope notes registered.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: VECTOR CHUNKS & PROVENANCE EVIDENCE */}
          {activeTab === 'chunks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">ChromaDB Chunk Representations</h3>
                  <p className="text-xs text-slate-400">
                    Each chunk represents an embedded vector segment used for semantic retrieval and Grounded RAG.
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Total: {chunks.length} Chunks
                </span>
              </div>

              <div className="space-y-3">
                {chunks.map((chk) => (
                  <div
                    key={chk.id}
                    className="worldlabs-card rounded-2xl p-5 border border-white/10 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/5">
                      <div className="flex items-center gap-2 flex-wrap">
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

                    <p className="text-xs text-slate-300 font-mono leading-relaxed bg-black/50 p-4 rounded-xl border border-white/5">
                      {chk.content}
                    </p>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Link
                        href={`/chat?paper_id=${paper.id}&q=${encodeURIComponent(`Explain this section: "${chk.section_name}"`)}`}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
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

      {/* BibTeX Export Modal */}
      {showBibtexModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="worldlabs-card rounded-3xl border border-white/15 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">Export BibTeX Citation</h3>
              <button
                onClick={() => setShowBibtexModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <textarea
              readOnly
              value={bibtexSnippet}
              rows={8}
              className="w-full p-4 rounded-xl bg-black/60 border border-white/10 text-xs text-slate-300 font-mono focus:outline-none"
            />

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowBibtexModal(false)}
                className="worldlabs-btn-secondary text-xs py-2 px-4"
              >
                Close
              </button>
              <button
                onClick={handleCopyBibtex}
                className="worldlabs-btn-primary text-xs py-2 px-5 font-semibold"
              >
                {copiedBibtex ? '✓ Copied to Clipboard' : 'Copy BibTeX'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
