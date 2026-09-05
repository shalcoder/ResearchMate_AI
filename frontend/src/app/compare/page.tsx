'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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

  useEffect(() => {
    const loadPapers = async () => {
      try {
        const res = await api.get('/papers');
        setPapers(res.data || []);
      } catch (err) {
        console.error('Failed to load papers:', err);
      }
    };
    loadPapers();
  }, []);

  const toggleSelectPaper = (id: string) => {
    setSelectedPaperIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleRunComparison = async () => {
    if (selectedPaperIds.length < 2) {
      alert('Please select at least 2 research papers to generate a comparative analysis.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/compare', { paper_ids: selectedPaperIds });
      setComparison(res.data);
    } catch (err) {
      alert('Failed to generate comparison. Please ensure papers have valid text chunks.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Side-by-Side Paper Comparison
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Analyze architectural contrasts, empirical benchmarks, and synthesize novel research gaps across multiple papers.
          </p>
        </div>

        {/* Paper Selection Checklist */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Select Papers to Contrast ({selectedPaperIds.length} selected)
            </span>
            <button
              onClick={handleRunComparison}
              disabled={selectedPaperIds.length < 2 || isLoading}
              className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg transition-colors"
            >
              {isLoading ? 'Analyzing Contrasts...' : 'Compare Selected Papers'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {papers.map((p) => {
              const isSelected = selectedPaperIds.includes(p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => toggleSelectPaper(p.id)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-600/10 border-indigo-500/50 text-white'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                    />
                    <span className="font-medium truncate">{p.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 pl-5">
                    {p.venue || 'Academic Paper'} • {p.total_chunks} chunks
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Comparison Results */}
        {comparison && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Synthesis Narrative */}
            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">
                Comparative Synthesis & Trade-off Analysis
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed">
                {comparison.synthesis}
              </p>
            </div>

            {/* Matrix Table */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Feature & Methodology Comparison Matrix
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                      <th className="p-4 font-semibold w-1/4">Evaluation Aspect</th>
                      {comparison.paper_titles?.map((t, idx) => (
                        <th key={idx} className="p-4 font-semibold text-white">
                          {t}
                        </th>
                      ))}
                      <th className="p-4 font-semibold text-indigo-400">Analysis & Edge</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {comparison.matrix?.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-4 font-medium text-slate-300 align-top">
                          {row.aspect}
                        </td>
                        {comparison.paper_titles?.map((t, pIdx) => (
                          <td key={pIdx} className="p-4 text-slate-300 align-top leading-relaxed">
                            {row.paper_comparisons?.[t] || 'N/A'}
                          </td>
                        ))}
                        <td className="p-4 text-xs text-slate-400 align-top leading-relaxed font-mono bg-slate-950/30">
                          {row.analysis || 'Balanced performance tradeoff.'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Research Gaps Identification */}
            <div className="p-5 bg-gradient-to-br from-indigo-950/30 to-purple-950/20 border border-indigo-500/30 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">💡</span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  Synthesized Research Gaps & Novel Opportunities
                </h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                These open questions and technical vulnerabilities were synthesized by contrasting the experimental limits of both papers:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {comparison.research_gaps?.map((gap, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-950/80 border border-indigo-500/20 rounded-lg text-xs text-slate-300 flex items-start gap-2"
                  >
                    <span className="text-indigo-400 font-bold">•</span>
                    <span>{gap}</span>
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
