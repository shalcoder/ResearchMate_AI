'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { useAuth } from '../../../lib/auth-context';
import { api } from '../../../lib/api';
import { ResearchPaper } from '../../../types';
import { UploadModal } from '../../../components/papers/UploadModal';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  useEffect(() => {
    api.get('/papers').then((res) => setPapers(res.data || [])).catch(() => {});
  }, []);

  return (
    <DashboardLayout requiredRoles={['student', 'admin']}>
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Welcome Header */}
        <div className="worldlabs-card rounded-3xl p-8 border border-white/10 relative overflow-hidden space-y-4">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="worldlabs-pill text-[10px] text-emerald-300 border-emerald-500/30 bg-emerald-500/10">
                  Student Research Space
                </span>
                <span className="text-xs text-slate-400">{user?.department || 'Computer Science'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Welcome back, {user?.name.split(' ')[0]} 👋
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Read assigned papers with simplified summaries, ask interactive questions with exact page references, and export citations for your coursework.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsUploadOpen(true)}
                className="worldlabs-btn-primary text-xs py-2.5 px-5 font-semibold flex items-center gap-2 whitespace-nowrap"
              >
                <span>+</span> Upload Paper
              </button>
            </div>
          </div>
        </div>

        {/* Quick Workflows Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/papers"
            className="worldlabs-card rounded-2xl p-5 border border-white/10 hover:border-emerald-500/40 transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xl">📖</span>
              <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10">
                {papers.length} Ready
              </span>
            </div>
            <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
              Study Guides & Summaries
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Read key hypotheses, methods, findings, and limits in plain language.
            </p>
          </Link>

          <Link
            href="/chat"
            className="worldlabs-card rounded-2xl p-5 border border-white/10 hover:border-indigo-500/40 transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xl">💬</span>
              <span className="text-[10px] text-indigo-300 font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10">
                Verified
              </span>
            </div>
            <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
              Ask the Paper (Q&A)
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Ask questions about difficult concepts and see exact page quotes.
            </p>
          </Link>

          <Link
            href="/compare"
            className="worldlabs-card rounded-2xl p-5 border border-white/10 hover:border-sky-500/40 transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xl">⚡</span>
              <span className="text-[10px] text-sky-300 font-semibold px-2 py-0.5 rounded-full bg-sky-500/10">
                Compare
              </span>
            </div>
            <h4 className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
              Compare 2 Papers
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              See side-by-side differences in methodology, results, and conclusions.
            </p>
          </Link>

          <Link
            href="/projects"
            className="worldlabs-card rounded-2xl p-5 border border-white/10 hover:border-amber-500/40 transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xl">📁</span>
              <span className="text-[10px] text-amber-300 font-semibold px-2 py-0.5 rounded-full bg-amber-500/10">
                Collections
              </span>
            </div>
            <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
              Coursework Workspaces
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Curate literature reviews and pin benchmark papers.
            </p>
          </Link>
        </div>

        {/* Assigned & Seeded Literature */}
        <div className="worldlabs-card rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-sm font-bold text-white">Assigned & Recommended Literature</h3>
            <Link href="/papers" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold">
              View All ({papers.length}) →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {papers.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-emerald-500/30 transition-all flex flex-col justify-between space-y-2"
              >
                <div>
                  <span className="text-[10px] text-slate-500 font-mono block mb-1">
                    {p.publication_year} • {p.venue ? p.venue.split('(')[0] : 'Academic'}
                  </span>
                  <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                    {p.title}
                  </h4>
                </div>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <Link href={`/chat?paper_id=${p.id}`} className="text-emerald-400 hover:text-emerald-300 font-medium">
                    Chat
                  </Link>
                  <Link href={`/papers/${p.id}`} className="text-slate-400 hover:text-white">
                    Inspect →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => {
          api.get('/papers').then((res) => setPapers(res.data || [])).catch(() => {});
        }}
      />
    </DashboardLayout>
  );
}
