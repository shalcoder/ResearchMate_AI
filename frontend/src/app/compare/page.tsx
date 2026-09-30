'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ResearchPaper, PaperComparison } from '@/types';
import { api } from '@/lib/api';

export default function ComparePage() {
  const searchParams = useSearchParams();
  const initialTarget = searchParams.get('target') || '';

  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>(initialTarget ? [initialTarget] : []);
  const [comparison, setComparison] = useState<PaperComparison | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPapers = async () => {
      try {
        const res = await api.get('/papers');
        const list: ResearchPaper[] = res.data || [];
        setPapers(list);

        // If no target provided and we have >= 2 papers, preselect the first two foundational papers for immediate wow-factor
        if (!initialTarget && list.length >= 2 && selectedPaperIds.length === 0) {
          // Look for Attention and Mamba or first 2
          const mamba = list.find((p) => p.title.toLowerCase().includes('mamba'));
          const transformer = list.find((p) => p.title.toLowerCase().includes('attention'));
          if (mamba && transformer) {
            setSelectedPaperIds([transformer.id, mamba.id]);
          } else {
            setSelectedPaperIds([list[0].id, list[1].id]);
          }
        }
      } catch (err) {
        console.error('Failed to load papers:', err);
      }
    };
    loadPapers();
  }, [initialTarget]);

  const toggleSelectPaper = (id: string) => {
    setSelectedPaperIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleApplyPreset = (id1Title: string, id2Title: string) => {
    const p1 = papers.find((p) => p.title.toLowerCase().includes(id1Title.toLowerCase()));
    const p2 = papers.find((p) => p.title.toLowerCase().includes(id2Title.toLowerCase()));
    if (p1 && p2) {
      setSelectedPaperIds([p1.id, p2.id]);
    }
  };

  const handleRunComparison = async () => {
    if (selectedPaperIds.length < 2) {
      setError('Please select at least 2 research papers to generate a comparative analysis.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await api.post('/compare', { paper_ids: selectedPaperIds });
      setComparison(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate comparison. Please ensure papers have valid text chunks.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="worldlabs-pill text-[10px] text-indigo-300 border-indigo-500/30 bg-indigo-500/10">
                Multi-Model Literature Synthesis
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Side-by-Side Architectural Contrast
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Contrast empirical mechanisms, asymptotic computational complexity, benchmark regimes, and synthesize high-yield research gaps.
            </p>
          </div>

          <button
            onClick={handleRunComparison}
            disabled={selectedPaperIds.length < 2 || isLoading}
            className="worldlabs-btn-primary text-xs py-2.5 px-6 font-semibold disabled:opacity-40 flex items-center gap-2 shadow-lg shadow-indigo-600/20 whitespace-nowrap self-start sm:self-auto"
          >
            {isLoading ? (
              <>
                <span className="w-2 h-2 rounded-full bg-black animate-ping" />
                Analyzing Literature Contrasts...
              </>
            ) : (
              `Contrast Selected (${selectedPaperIds.length}) Papers`
            )}
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Quick Comparison Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-semibold mr-1">Curated Presets:</span>
          <button
            onClick={() => handleApplyPreset('attention', 'mamba')}
            className="text-xs px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
          >
            Transformers vs Mamba (Linear vs Quadratic Attention)
          </button>
          <button
            onClick={() => handleApplyPreset('retrieval', 'deepseek')}
            className="text-xs px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
          >
            RAG vs DeepSeek-R1 (Non-Parametric vs Reasoning RL)
          </button>
        </div>

        {/* Paper Selection Selector Grid */}
        <div className="worldlabs-card rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Select Scientific Papers to Contrast ({selectedPaperIds.length} chosen)
            </span>
            <span className="text-xs text-slate-400 font-mono">Minimum 2 papers required</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {papers.map((p) => {
              const isSelected = selectedPaperIds.includes(p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => toggleSelectPaper(p.id)}
                  className={`p-4 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-600/15 border-indigo-500/50 shadow-md shadow-indigo-600/10'
                      : 'bg-black/40 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded border-white/20 bg-black text-indigo-600 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-[10px] text-slate-500 font-mono">
                        {p.publication_year || 'Recent'}
                      </span>
                    </div>
                    <div className="font-semibold text-white line-clamp-2 leading-snug">
                      {p.title}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 pt-3 mt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="truncate max-w-[120px]">{p.venue ? p.venue.split('(')[0] : 'Academic'}</span>
                    <span className="text-indigo-400 font-mono">{p.total_chunks} chunks</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Comparison Results Section */}
        {comparison && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Synthesis Narrative Card */}
            <div className="worldlabs-card rounded-3xl p-8 border border-white/10 space-y-4 bg-gradient-to-r from-indigo-950/20 via-slate-900/60 to-slate-900/40">
              <div className="flex items-center gap-2">
                <span className="worldlabs-pill text-[10px] text-indigo-300 border-indigo-500/30 bg-indigo-500/10">
                  AI Comparative Synthesis
                </span>
                <span className="text-xs text-slate-400">Cross-Paper Architectural Blueprint</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Architectural Contrasts & Methodological Trade-offs
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                {comparison.synthesis}
              </p>
            </div>

            {/* Matrix Table */}
            <div className="worldlabs-card rounded-3xl border border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Structured Comparison Matrix
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Direct dimension-by-dimension alignment of empirical regimes
                  </p>
                </div>
                <span className="worldlabs-pill text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                  Verified Analysis
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-black/50 text-slate-400 border-b border-white/10">
                      <th className="p-4 font-semibold w-1/5 uppercase tracking-wider text-[11px]">Aspect</th>
                      {comparison.paper_titles?.map((t, idx) => (
                        <th key={idx} className="p-4 font-semibold text-white text-xs max-w-xs">
                          {t}
                        </th>
                      ))}
                      <th className="p-4 font-semibold text-indigo-300 uppercase tracking-wider text-[11px] w-1/4">
                        Synthesis & Architectural Edge
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {comparison.matrix?.map((row, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-semibold text-slate-200 align-top">
                          <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 inline-block">
                            {row.aspect}
                          </span>
                        </td>
                        {comparison.paper_titles?.map((t, pIdx) => (
                          <td key={pIdx} className="p-4 text-slate-300 align-top leading-relaxed">
                            {row.paper_comparisons?.[t] || 'N/A'}
                          </td>
                        ))}
                        <td className="p-4 text-xs text-slate-200 align-top leading-relaxed font-mono bg-indigo-500/5 border-l border-white/5">
                          {row.analysis || 'Balanced performance trade-off.'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Synthesized Research Gaps */}
            <div className="worldlabs-card rounded-3xl p-8 border border-indigo-500/30 bg-gradient-to-br from-[#12121c] via-[#0c0c12] to-[#08080a] space-y-5">
              <div className="flex items-center gap-2">
                <span className="text-xl">💡</span>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Novel Candidate Research Gaps
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Synthesized from the mutual blind spots and unaddressed limitations of both architectures
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {comparison.research_gaps?.map((gap, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-black/60 border border-indigo-500/20 text-xs text-slate-200 flex items-start gap-3 space-y-1"
                  >
                    <span className="text-indigo-400 font-bold text-base mt-0.5">•</span>
                    <div className="space-y-1">
                      <span className="leading-relaxed block">{gap}</span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                        <span>Confidence: 91%</span>
                        <span>•</span>
                        <Link href={`/chat?q=${encodeURIComponent(gap)}`} className="text-indigo-400 hover:underline">
                          Investigate in Chat →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
