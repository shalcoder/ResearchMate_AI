'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ResearchPaper } from '@/types';

interface PaperCardProps {
  paper: ResearchPaper;
  onDelete?: (id: string) => void;
}

export const PaperCard: React.FC<PaperCardProps> = ({ paper, onDelete }) => {
  const [isAbstractExpanded, setIsAbstractExpanded] = useState(false);
  const authorDisplay = paper.authors?.length > 0 ? paper.authors.join(', ') : 'Unknown Authors';
  const fileSizeMb = (paper.file_size / (1024 * 1024)).toFixed(2);

  return (
    <div className="worldlabs-card rounded-2xl p-6 border border-white/10 hover:border-indigo-500/40 transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Top Badges & Meta */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/25 uppercase tracking-wider">
              {paper.venue ? paper.venue.split('(')[0].trim() : 'Academic Publication'}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {paper.publication_year || 'Recent'}
            </span>
          </div>

          <span className="text-[11px] text-slate-400 font-mono">
            {paper.total_pages} {paper.total_pages === 1 ? 'page' : 'pages'}
          </span>
        </div>

        {/* Paper Title */}
        <Link href={`/papers/${paper.id}`} className="block group-hover:text-indigo-400 transition-colors">
          <h3 className="text-base font-bold text-white leading-snug line-clamp-2 mb-2">
            {paper.title}
          </h3>
        </Link>

        {/* Authors */}
        <p className="text-xs text-slate-400 mb-3 line-clamp-1 font-medium">
          {authorDisplay}
        </p>

        {/* Abstract with toggle */}
        {paper.abstract && (
          <div className="mb-4">
            <p className={`text-xs text-slate-400 leading-relaxed ${isAbstractExpanded ? '' : 'line-clamp-2'}`}>
              {paper.abstract}
            </p>
            {paper.abstract.length > 140 && (
              <button
                type="button"
                onClick={() => setIsAbstractExpanded(!isAbstractExpanded)}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium mt-1 focus:outline-none"
              >
                {isAbstractExpanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        )}

        {/* Lifecycle Status Pipeline Badges */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 pb-3 mb-3 border-t border-white/5">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span>✓</span> Parsed
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <span>●</span> {paper.total_chunks} Vectors
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            <span>✓</span> RAG Grounded
          </span>
          {paper.doi && (
            <span className="text-[10px] text-slate-500 font-mono truncate max-w-[120px]" title={paper.doi}>
              DOI: {paper.doi}
            </span>
          )}
        </div>
      </div>

      {/* Bottom Actions Bar */}
      <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
          <span>{fileSizeMb} MB</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/chat?paper_id=${paper.id}`}
            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 transition-colors"
          >
            Ask Paper
          </Link>
          <Link
            href={`/compare?target=${paper.id}`}
            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 transition-colors"
          >
            Compare
          </Link>
          <Link
            href={`/papers/${paper.id}`}
            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20"
          >
            Inspect
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(paper.id)}
              className="text-xs text-rose-400 hover:text-rose-300 p-1.5 rounded-full hover:bg-rose-500/10 transition-colors"
              title="Delete paper"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
