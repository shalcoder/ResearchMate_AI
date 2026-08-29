'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PaperCard } from '@/components/papers/PaperCard';
import { UploadModal } from '@/components/papers/UploadModal';
import { ResearchPaper } from '@/types';
import { api } from '@/lib/api';

export default function PapersPage() {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
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
    if (!confirm('Are you sure you want to delete this paper and its indexed vectors?')) return;
    try {
      await api.delete(`/papers/${id}`);
      setPapers((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert('Failed to delete paper.');
    }
  };

  const filteredPapers = papers.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.abstract?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.authors?.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Research Paper Library</h1>
            <p className="text-xs text-slate-400 mt-1">
              Ingest scientific literature, manage chunks, generate AI summaries, and inspect vector collections.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all"
          >
            <span>+</span> Upload Paper
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800/80 rounded-xl px-4 py-2.5">
          <span className="text-slate-400 text-xs">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, author, or keyword..."
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Paper Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-56 bg-slate-900/40 border border-slate-800/60 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredPapers.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl p-8">
            <p className="text-sm font-medium text-slate-300">No research papers found</p>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Upload your first PDF to extract chunks and vectorize scientific literature.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 rounded-lg border border-indigo-500/20"
            >
              Upload PDF Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPapers.map((paper) => (
              <PaperCard key={paper.id} paper={paper} onDelete={handleDelete} />
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
