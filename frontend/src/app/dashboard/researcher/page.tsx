'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { useAuth } from '../../../lib/auth-context';
import { api } from '../../../lib/api';
import { ResearchPaper, Project } from '../../../types';
import { UploadModal } from '../../../components/papers/UploadModal';

export default function ResearcherDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Dynamic greeting based on current local time
  const [greeting, setGreeting] = useState('Welcome back');
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [papersRes, projectsRes] = await Promise.all([
        api.get('/papers'),
        api.get('/projects'),
      ]);
      setPapers(papersRes.data || []);
      setProjects(projectsRes.data || []);
    } catch (err) {
      console.error('Failed to load researcher workspace data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const totalChunks = papers.reduce((acc, p) => acc + (p.total_chunks || 0), 0);
  const activeProject = projects[0];

  return (
    <DashboardLayout requiredRoles={['researcher', 'admin']}>
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Top Research Intelligence Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#12121c] via-[#0c0c12] to-[#08080a] border border-white/10 p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="worldlabs-pill text-[10px] tracking-wider text-indigo-300 border-indigo-500/30 bg-indigo-500/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  Autonomous Academic Literature Workspace
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {user?.institution || 'Academic Institute'} • {user?.department || 'Advanced AI Systems'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {greeting}, {user?.name || 'Researcher'} 🔬
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Continue your literature synthesis. Your workspace has indexed foundational models with verified chunk citations, semantic similarity projections, and automated research gap discovery.
              </p>
            </div>

            {/* Quick Action Capsules */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setIsUploadOpen(true)}
                className="worldlabs-btn-primary text-xs py-2.5 px-5 font-semibold flex items-center gap-2"
              >
                <span>+</span> Ingest Research Paper
              </button>
              <Link
                href="/compare"
                className="worldlabs-btn-secondary text-xs py-2.5 px-4 font-medium flex items-center gap-2"
              >
                <span>⚡</span> Compare Papers
              </Link>
              <Link
                href="/chat"
                className="worldlabs-btn-secondary text-xs py-2.5 px-4 font-medium flex items-center gap-2"
              >
                <span>💬</span> Grounded RAG Chat
              </Link>
            </div>
          </div>
        </div>

        {/* Live Corpus Intelligence Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="worldlabs-card rounded-2xl p-5 border border-white/10">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-400">Literature Ingested</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Live</span>
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">{papers.length}</div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="text-emerald-400">✓</span> Full-text parsed & OCR verified
            </p>
          </div>

          <div className="worldlabs-card rounded-2xl p-5 border border-white/10">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-400">ChromaDB Vectors</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20">Indexed</span>
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">{totalChunks}</div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="text-sky-400">●</span> 384-dim semantic embeddings
            </p>
          </div>

          <div className="worldlabs-card rounded-2xl p-5 border border-white/10">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-400">Collaborative Labs</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Shared</span>
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">{projects.length}</div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="text-indigo-400">★</span> Pinned literature collections
            </p>
          </div>

          <div className="worldlabs-card rounded-2xl p-5 border border-white/10">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-400">Gap Signals</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20">Extracted</span>
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">8</div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="text-amber-400">💡</span> High-yield research opportunities
            </p>
          </div>
        </div>

        {/* Active Project Workspace Spotlight */}
        {activeProject && (
          <div className="worldlabs-card rounded-2xl p-6 border border-indigo-500/20 bg-gradient-to-r from-indigo-950/20 via-slate-900/60 to-slate-900/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                    Active Research Workspace
                  </span>
                  <span className="text-xs text-slate-500">
                    {activeProject.papers?.length || 0} Pinned Foundation Papers
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {activeProject.title}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeProject.description || 'Frontier Foundation Models and Grounded RAG benchmark collection.'}
                </p>
              </div>

              <Link
                href="/projects"
                className="worldlabs-btn-secondary text-xs py-2 px-4 whitespace-nowrap self-start sm:self-auto"
              >
                Open Full Project Workspace →
              </Link>
            </div>

            {/* Pinned papers row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
              {activeProject.papers?.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-xl bg-black/40 border border-white/5 hover:border-indigo-500/30 transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 block mb-1">
                      {p.publication_year} • {p.venue ? p.venue.split('(')[0] : 'Academic'}
                    </span>
                    <h4 className="text-xs font-semibold text-white line-clamp-2 leading-snug">
                      {p.title}
                    </h4>
                  </div>
                  <div className="pt-3 mt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">{p.total_chunks} chunks</span>
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/chat?paper_id=${p.id}`}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                      >
                        Chat
                      </Link>
                      <span className="text-slate-600">•</span>
                      <Link
                        href={`/papers/${p.id}`}
                        className="text-[11px] text-slate-400 hover:text-white font-medium"
                      >
                        Inspect
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Split: Recent Papers & Candidate Research Gaps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Recent Papers Library (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Recent Corpus Additions</h3>
                <p className="text-xs text-slate-400">Scientific literature ready for grounding and multi-vector search</p>
              </div>
              <Link
                href="/papers"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                View all ({papers.length}) →
              </Link>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
                ))}
              </div>
            ) : papers.length === 0 ? (
              <div className="worldlabs-card rounded-2xl p-8 text-center border border-white/10">
                <p className="text-sm font-semibold text-slate-300 mb-1">No papers ingested yet</p>
                <p className="text-xs text-slate-500 mb-4">Ingest your first PDF paper to extract semantic chunks and build your research knowledge base.</p>
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="worldlabs-btn-primary text-xs py-2 px-4"
                >
                  Upload Research Paper
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {papers.slice(0, 4).map((paper) => (
                  <div
                    key={paper.id}
                    className="worldlabs-card rounded-2xl p-5 border border-white/10 hover:border-indigo-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {paper.venue || 'Academic'}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {paper.publication_year || 'Recent'}
                        </span>
                        <span className="text-[11px] text-emerald-400/90 font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Vectors Ready ({paper.total_chunks} chunks)
                        </span>
                      </div>
                      <Link href={`/papers/${paper.id}`} className="block">
                        <h4 className="text-sm font-bold text-white hover:text-indigo-400 transition-colors line-clamp-1">
                          {paper.title}
                        </h4>
                      </Link>
                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        {paper.authors?.join(', ') || 'Unknown Authors'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <Link
                        href={`/chat?paper_id=${paper.id}`}
                        className="worldlabs-btn-secondary text-xs py-1.5 px-3"
                      >
                        Ask Paper
                      </Link>
                      <Link
                        href={`/compare?target=${paper.id}`}
                        className="worldlabs-btn-secondary text-xs py-1.5 px-3 text-slate-400 hover:text-white"
                      >
                        Compare
                      </Link>
                      <Link
                        href={`/papers/${paper.id}`}
                        className="text-xs px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
                      >
                        Inspect
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Grounded Research Gaps & Quick Prompts */}
          <div className="space-y-6">
            <div className="worldlabs-card rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 text-sm">💡</span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Candidate Research Gaps
                  </h3>
                </div>
                <span className="text-[10px] text-indigo-300 font-semibold px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                  Gemini Grounded
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-300">
                      State Space Memory in Non-Autoregressive Tasks
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                      94%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Extracted from Mamba & Transformer limitations: Linear state-space architectures degrade on copy-paste and associative retrieval compared to full self-attention.
                  </p>
                  <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Evidence: Gu & Dao (2023) §4.3</span>
                    <Link href="/compare" className="text-indigo-400 hover:underline">Contrast Models →</Link>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-300">
                      Reasoning Collapse in Small Cold-Start RL
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                      89%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Synthesized from DeepSeek-R1-Zero: Pure RL without supervised cold-start exhibits language mixing and readability breakdown during test-time compute.
                  </p>
                  <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Evidence: DeepSeek-AI (2025) §3.1</span>
                    <Link href="/compare" className="text-indigo-400 hover:underline">Explore Gap →</Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Grounded Question Starters */}
            <div className="worldlabs-card rounded-2xl p-6 border border-white/10 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-white/10">
                Quick Literature Prompts
              </h3>
              <div className="space-y-2">
                {[
                  'Why does multi-head attention scale quadratically with sequence length?',
                  'How does parametric vs non-parametric memory interact in RAG?',
                  'What is the cold-start data strategy in DeepSeek-R1?',
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => router.push(`/chat?q=${encodeURIComponent(prompt)}`)}
                    className="w-full text-left p-2.5 rounded-xl bg-white/5 hover:bg-indigo-600/10 border border-white/5 hover:border-indigo-500/30 text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between group"
                  >
                    <span className="truncate pr-2">"{prompt}"</span>
                    <span className="text-slate-500 group-hover:text-indigo-400 transition-colors">→</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={loadDashboardData}
      />
    </DashboardLayout>
  );
}
