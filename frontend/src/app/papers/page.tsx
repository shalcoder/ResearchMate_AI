'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PaperCard } from '@/components/papers/PaperCard';
import { PaperRow } from '@/components/papers/PaperRow';
import { UploadModal } from '@/components/papers/UploadModal';
import { SearchInput, EmptyState, Skeleton } from '@/components/ui';
import { ResearchPaper } from '@/types';
import { api } from '@/lib/api';
import { LayoutGrid, List, RefreshCw, FileUp } from 'lucide-react';

type FilterTab = 'all' | 'vector_ready' | 'needs_summary';
type SortOption = 'recent' | 'title' | 'year' | 'chunks';
type ViewMode = 'grid' | 'list';

export default function PapersPage() {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPapers = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/papers');
      setPapers(res.data || []);
    } catch (err) {
      console.error('Failed to load papers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this paper and all associated vector embeddings?')) return;
    try {
      await api.delete(`/papers/${id}`);
      setPapers((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert('Failed to delete paper.');
    }
  };

  // Filter & Sort Logic
  const filteredAndSortedPapers = useMemo(() => {
    let result = papers.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.abstract?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.authors?.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.venue?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeTab === 'vector_ready') return p.total_chunks > 0;
      if (activeTab === 'needs_summary') return !p.summary;
      return true;
    });

    return result.sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'year') return (b.publication_year || 0) - (a.publication_year || 0);
      if (sortBy === 'chunks') return (b.total_chunks || 0) - (a.total_chunks || 0);
      // default recent
      return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    });
  }, [papers, searchQuery, activeTab, sortBy]);

  const totalChunks = papers.reduce((acc, p) => acc + (p.total_chunks || 0), 0);
  const totalPages = papers.reduce((acc, p) => acc + (p.total_pages || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header with Title & Ingest Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="worldlabs-pill text-[10px] text-indigo-300 border-indigo-500/30 bg-indigo-500/10">
                Paper Library
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {papers.length} Papers • {totalChunks} Sections • {totalPages} Pages
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Research Paper Library</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Your academic literature collection. Read AI summaries, explore key sections, verify citations, and compare research findings.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchPapers}
              className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors"
              title="Refresh library"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="worldlabs-btn-primary text-xs py-2.5 px-5 font-semibold flex items-center gap-2 whitespace-nowrap"
            >
              <FileUp className="w-3.5 h-3.5" />
              <span>+ Upload Paper</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs, Search & View Controls */}
        <div className="worldlabs-card rounded-2xl p-4 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: `All Papers (${papers.length})` },
              { id: 'vector_ready', label: `Ready for Q&A (${papers.filter((p) => p.total_chunks > 0).length})` },
              { id: 'needs_summary', label: 'Needs Summary' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as FilterTab)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar, Sort & View Mode Switcher */}
          <div className="flex items-center gap-3">
            <div className="w-full md:w-64">
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
                placeholder="Search title, author, keyword..."
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-black/40 border border-white/10 text-xs text-slate-300 rounded-2xl px-3 py-2.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="recent">Sort: Recently Ingested</option>
              <option value="title">Sort: Title (A-Z)</option>
              <option value="year">Sort: Publication Year</option>
              <option value="chunks">Sort: Chunks Count</option>
            </select>

            {/* Grid vs List toggle */}
            <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/10">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-white/15 text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-white/15 text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="List view"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Papers Stream / Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : filteredAndSortedPapers.length === 0 ? (
          <EmptyState
            title="No research papers found"
            description={
              searchQuery
                ? `No papers match the search query "${searchQuery}". Try a different keyword or reset filters.`
                : 'Your literature library is empty. Upload your first PDF to extract semantic chunks.'
            }
            actionLabel={searchQuery ? 'Clear Search' : 'Ingest Research Paper'}
            onAction={searchQuery ? () => setSearchQuery('') : () => setIsModalOpen(true)}
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAndSortedPapers.map((paper) => (
              <PaperCard key={paper.id} paper={paper} onDelete={handleDelete} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAndSortedPapers.map((paper) => (
              <PaperRow key={paper.id} paper={paper} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      <UploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchPapers}
      />
    </DashboardLayout>
  );
}
