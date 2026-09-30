'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SearchResultItem } from '@/types';
import { api } from '@/lib/api';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [venueFilter, setVenueFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const executeSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      const params: any = { q: searchQuery.trim() };
      if (venueFilter.trim()) params.venue = venueFilter.trim();
      if (yearFilter.trim()) params.year = parseInt(yearFilter.trim(), 10);

      const res = await api.get('/search', { params });
      setResults(res.data.results || []);
    } catch (err) {
      console.error('Failed to search papers:', err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const handleChipClick = (prompt: string) => {
    setQuery(prompt);
    executeSearch(prompt);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Header */}
        <div className="pb-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="worldlabs-pill text-[10px] text-indigo-300 border-indigo-500/30 bg-indigo-500/10">
              ChromaDB Vector Retrieval
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Semantic Literature Discovery
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Search scientific concepts by semantic intent rather than literal keyword matching. Query high-dimensional embeddings across paper sections.
          </p>
        </div>

        {/* Search Bar & Filter Form */}
        <div className="worldlabs-card rounded-3xl p-6 border border-white/10 space-y-4">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Linear state spaces, self-attention complexity, parametric memory, RL reasoning..."
                  className="w-full pl-11 pr-4 py-3 text-xs bg-black/50 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                disabled={!query.trim() || isLoading}
                className="worldlabs-btn-primary text-xs py-3 px-8 font-semibold disabled:opacity-50 whitespace-nowrap self-stretch sm:self-auto"
              >
                {isLoading ? 'Searching...' : 'Vector Search'}
              </button>
            </div>

            {/* Quick Prompt Chips */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-[11px] text-slate-500 font-medium mr-1">Suggested Searches:</span>
              {[
                'Self-attention quadratic complexity',
                'Parametric and non-parametric memory in RAG',
                'Selective structured state space models',
                'Reinforcement learning cold-start reasoning',
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleChipClick(chip)}
                  className="text-[11px] px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-white/10">
              <span className="text-xs text-slate-400 font-medium">Metadata Filters:</span>
              <input
                type="text"
                value={venueFilter}
                onChange={(e) => setVenueFilter(e.target.value)}
                placeholder="Venue (e.g. NeurIPS, ArXiv)"
                className="px-3 py-1.5 text-xs bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <input
                type="number"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                placeholder="Year (e.g. 2025)"
                className="w-28 px-3 py-1.5 text-xs bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              {(venueFilter || yearFilter) && (
                <button
                  type="button"
                  onClick={() => {
                    setVenueFilter('');
                    setYearFilter('');
                  }}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Results Stream */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-white/5 border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : hasSearched && results.length === 0 ? (
          <div className="worldlabs-card rounded-2xl p-12 text-center border border-white/10 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 text-xl text-slate-400">
              🔍
            </div>
            <h3 className="text-sm font-bold text-white mb-1">No matching chunks found</h3>
            <p className="text-xs text-slate-400 mb-4">
              Try rephrasing your research question or loosening metadata filters.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((r, idx) => (
              <div
                key={`${r.paper_id}-${r.chunk_index}-${idx}`}
                className="worldlabs-card rounded-2xl p-6 border border-white/10 hover:border-indigo-500/40 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/5">
                  <Link
                    href={`/papers/${r.paper_id}`}
                    className="text-sm font-bold text-white hover:text-indigo-400 transition-colors"
                  >
                    {r.paper_title}
                  </Link>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                      {(r.relevance_score * 100).toFixed(0)}% Semantic Match
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {r.venue || 'Academic'} • {r.publication_year || 'Recent'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 font-semibold border border-indigo-500/20">
                    {r.section_name}
                  </span>
                  <span>•</span>
                  <span>Page {r.page_number}</span>
                  <span>•</span>
                  <span>Chunk #{r.chunk_index + 1}</span>
                </div>

                <p className="text-xs text-slate-200 font-mono leading-relaxed bg-black/50 p-4 rounded-xl border border-white/5">
                  "{r.content_snippet}"
                </p>

                <div className="pt-2 flex items-center justify-end gap-3 text-xs">
                  <Link
                    href={`/chat?paper_id=${r.paper_id}&q=${encodeURIComponent(query)}`}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    Chat with paper on this topic →
                  </Link>
                  <span className="text-slate-600">•</span>
                  <Link
                    href={`/papers/${r.paper_id}`}
                    className="text-slate-400 hover:text-white"
                  >
                    Inspect paper →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
