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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      const params: any = { q: query.trim() };
      if (venueFilter.trim()) params.venue = venueFilter.trim();
      if (yearFilter.trim()) params.year = parseInt(yearFilter.trim(), 10);

      const res = await api.get('/search', { params });
      setResults(res.data.results || []);
    } catch (err) {
      console.error('Failed to search papers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Semantic Scientific Search</h1>
          <p className="text-xs text-slate-400 mt-1">
            Query across your repository using natural language embeddings and deep vector similarity.
          </p>
        </div>

        {/* Search & Filter Form */}
        <form onSubmit={handleSearch} className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. self-attention complexity in machine translation, vision transformers, convolutional architectures..."
              className="flex-1 px-4 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!query.trim() || isLoading}
              className="px-6 py-2.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-800/60">
            <span className="text-xs text-slate-400 font-medium">Filters:</span>
            <input
              type="text"
              value={venueFilter}
              onChange={(e) => setVenueFilter(e.target.value)}
              placeholder="Venue (e.g. NeurIPS, ICML, CVPR)"
              className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="number"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              placeholder="Year (e.g. 2024)"
              className="w-32 px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
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

        {/* Results Stream */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-slate-900/40 border border-slate-800/60 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : hasSearched && results.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-xl p-8">
            <p className="text-sm font-semibold text-slate-300">No matching chunks found</p>
            <p className="text-xs text-slate-500 mt-1">
              Try rephrasing your research query or removing venue/year constraints.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((r, idx) => (
              <div
                key={idx}
                className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl hover:border-indigo-500/40 transition-all space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <Link
                    href={`/papers/${r.paper_id}`}
                    className="text-sm font-semibold text-white hover:text-indigo-400 transition-colors"
                  >
                    {r.paper_title}
                  </Link>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {(r.relevance_score * 100).toFixed(0)}% Match
                    </span>
                    <span className="text-xs text-slate-400">
                      {r.venue || 'Academic'} • {r.publication_year || 'Recent'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-400">
                    {r.section_name}
                  </span>
                  <span>•</span>
                  <span>Page {r.page_number}</span>
                  <span>•</span>
                  <span>Chunk #{r.chunk_index + 1}</span>
                </div>

                <p className="text-xs text-slate-300 font-mono leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                  {r.content_snippet}
                </p>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <Link
                    href={`/chat?paper_id=${r.paper_id}`}
                    className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
                  >
                    Chat with paper →
                  </Link>
                  <Link
                    href={`/papers/${r.paper_id}`}
                    className="text-xs font-medium text-slate-400 hover:text-slate-200"
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
