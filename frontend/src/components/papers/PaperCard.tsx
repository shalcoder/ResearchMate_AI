'use client';

import React from 'react';
import Link from 'next/link';
import { ResearchPaper } from '@/types';

interface PaperCardProps {
  paper: ResearchPaper;
  onDelete?: (id: string) => void;
}

export const PaperCard: React.FC<PaperCardProps> = ({ paper, onDelete }) => {
  const authorDisplay = paper.authors?.length > 0 ? paper.authors.join(', ') : 'Unknown Authors';
  const fileSizeMb = (paper.file_size / (1024 * 1024)).toFixed(2);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-200 flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {paper.venue || 'Academic Paper'} • {paper.publication_year || 'Recent'}
          </span>
          <span className="text-xs text-slate-400">
            {paper.total_pages} {paper.total_pages === 1 ? 'page' : 'pages'}
          </span>
        </div>

        <Link href={`/papers/${paper.id}`} className="block">
          <h3 className="text-base font-semibold text-white group-hover:text-indigo-400 transition-colors line-clamp-2 mb-1.5">
            {paper.title}
          </h3>
        </Link>

        <p className="text-xs text-slate-400 mb-3 line-clamp-1">
          {authorDisplay}
        </p>

        {paper.abstract && (
          <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
            {paper.abstract}
          </p>
        )}
      </div>

      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>{paper.total_chunks} Chunks</span>
          <span>•</span>
          <span>{fileSizeMb} MB</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/papers/${paper.id}`}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            Inspect
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(paper.id)}
              className="text-xs text-red-400 hover:text-red-300 px-2 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
              title="Delete paper"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
