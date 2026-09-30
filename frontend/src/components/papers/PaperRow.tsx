'use client';

import React from 'react';
import Link from 'next/link';
import { ResearchPaper } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatFileSize } from '@/lib/utils';
import { BookOpen, MessageSquare, Columns, Trash2 } from 'lucide-react';

interface PaperRowProps {
  paper: ResearchPaper;
  onDelete?: (id: string) => void;
}

export const PaperRow: React.FC<PaperRowProps> = ({ paper, onDelete }) => {
  const authorDisplay = paper.authors?.length > 0 ? paper.authors.join(', ') : 'Unknown Authors';

  return (
    <div className="worldlabs-card rounded-xl p-4 border border-white/10 hover:border-indigo-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 group">
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2.5 flex-wrap">
          <StatusBadge
            status={paper.total_chunks > 0 ? 'indexed' : 'processing'}
            label={`${paper.total_chunks} Vectors`}
          />
          <span className="text-[11px] font-semibold text-indigo-300">
            {paper.venue ? paper.venue.split('(')[0] : 'Academic'}
          </span>
          <span className="text-xs text-slate-500 font-mono">
            {paper.publication_year || 'Recent'}
          </span>
          {paper.doi && (
            <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
              DOI: {paper.doi}
            </span>
          )}
        </div>

        <Link href={`/papers/${paper.id}`} className="block">
          <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors truncate">
            {paper.title}
          </h3>
        </Link>

        <p className="text-xs text-slate-400 truncate">
          {authorDisplay}
        </p>
      </div>

      <div className="flex items-center gap-4 text-xs shrink-0 self-end md:self-center">
        <div className="hidden lg:flex items-center gap-2 text-slate-400 font-mono text-[11px]">
          <span>{paper.total_pages} pages</span>
          <span>•</span>
          <span>{formatFileSize(paper.file_size)}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            href={`/chat?paper_id=${paper.id}`}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
            title="Chat with paper"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </Link>
          <Link
            href={`/compare?target=${paper.id}`}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
            title="Compare paper"
          >
            <Columns className="w-3.5 h-3.5" />
          </Link>
          <Link
            href={`/papers/${paper.id}`}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Inspect</span>
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(paper.id)}
              className="p-2 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-500/10 transition-colors"
              title="Delete paper"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
