'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ResearchPaper, PaperChunk, PaperSummary } from '@/types';
import { api } from '@/lib/api';

export default function PaperDetailPage() {
  const params = useParams();
  const router = useRouter();
  const paperId = params.id as string;

  const [paper, setPaper] = useState<ResearchPaper | null>(null);
  const [chunks, setChunks] = useState<PaperChunk[]>([]);
  const [summary, setSummary] = useState<PaperSummary | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'chunks' | 'metadata'>('summary');
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

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

        // Fetch summary if available
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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
          Loading paper intelligence...
        </div>
      </DashboardLayout>
    );
  }

  if (!paper) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <p className="text-slate-300 text-sm">Paper not found.</p>
          <Link href="/papers" className="text-indigo-400 text-xs mt-2 inline-block">
            ← Back to Library
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back navigation & Header */}
        <div>
          <Link href="/papers" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mb-2">
            ← Back to Library
          </Link>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {paper.venue || 'Scientific Publication'} • {paper.publication_year || 'Recent'}
              </span>
              <h1 className="text-2xl font-bold text-white tracking-tight mt-2">
                {paper.title}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {paper.authors?.join(', ') || 'Unknown Authors'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/chat?paper_id=${paper.id}`}
                className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
              >
                Chat with Paper
              </Link>
              <Link
                href={`/compare?target=${paper.id}`}
                className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all"
              >
                Compare
              </Link>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800">
          {[
            { id: 'summary', label: 'AI Structured Summary' },
            { id: 'chunks', label: `Vector Chunks (${chunks.length})` },
            { id: 'metadata', label: 'Metadata & DOI' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-all ${
                activeTab === t.id
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        {activeTab === 'summary' && (
          <div className="space-y-5">
            {!summary ? (
              <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl">
                <p className="text-sm font-semibold text-white mb-1">
                  AI Summary Not Generated Yet
                </p>
                <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                  Run our 5-point Gemini scientific summarizer to parse key findings, experimental methodology, limitations, and future research paths.
                </p>
                <button
                  onClick={handleGenerateSummary}
                  disabled={isGeneratingSummary}
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  {isGeneratingSummary ? 'Analyzing Content...' : 'Generate 5-Point Summary'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Executive Summary */}
                <div className="md:col-span-2 p-5 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">
                    Executive Summary
                  </h3>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {summary.executive_summary}
                  </p>
                </div>

                {/* Key Findings */}
                <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">
                    Key Findings
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
                    {summary.key_findings.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>

                {/* Methodology */}
                <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
                    Methodology
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {summary.methodology || 'Empirical benchmark and comparative algorithmic analysis.'}
                  </p>
                </div>

                {/* Limitations */}
                <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-3">
                    Limitations
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
                    {summary.limitations.map((lim, i) => (
                      <li key={i}>{lim}</li>
                    ))}
                  </ul>
                </div>

                {/* Future Scope */}
                <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3">
                    Future Scope & Research Gaps
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
                    {summary.future_scope.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'chunks' && (
          <div className="space-y-3">
            {chunks.map((chk) => (
              <div
                key={chk.id}
                className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-indigo-400 border border-slate-700">
                      Chunk #{chk.chunk_index + 1}
                    </span>
                    <span className="text-xs font-medium text-slate-300">
                      {chk.section_name}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    Page {chk.page_number} • {chk.token_count} tokens
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-mono leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-900">
                  {chk.content}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'metadata' && (
          <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-xs text-slate-500 block">Total Pages</span>
                <span className="text-sm font-semibold text-white">{paper.total_pages}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Total Chunks</span>
                <span className="text-sm font-semibold text-white">{paper.total_chunks}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">File Size</span>
                <span className="text-sm font-semibold text-white">
                  {(paper.file_size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">DOI</span>
                <span className="text-sm font-semibold text-indigo-400">{paper.doi || 'N/A'}</span>
              </div>
            </div>

            {paper.abstract && (
              <div className="pt-4 border-t border-slate-800">
                <span className="text-xs text-slate-500 block mb-1">Abstract</span>
                <p className="text-xs text-slate-300 leading-relaxed">{paper.abstract}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
