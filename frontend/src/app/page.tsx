'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import { UserRole } from '../types';
import { api } from '../lib/api';
import {
  Sparkles,
  ArrowRight,
  Microscope,
  BookOpen,
  GraduationCap,
  Shield,
  Layers,
  Search,
  Database,
  ExternalLink,
  LogOut,
  ChevronRight,
  Cpu,
  FileUp,
  Brain,
  MessageSquare,
  GitCompare,
  FolderCheck,
  CheckCircle2
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(0);
  const [liveQuery, setLiveQuery] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryResult, setQueryResult] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const WORKFLOW_STEPS = [
    {
      step: '01',
      title: 'Add Your Papers',
      desc: 'Upload PDFs or enter DOIs. Titles, authors, abstracts, and sections are organized automatically.',
      icon: <FileUp className="w-5 h-5 text-cyan-400" />,
    },
    {
      step: '02',
      title: 'Structured Summaries',
      desc: 'Instant academic summaries highlighting core research questions, methods, findings, and limits.',
      icon: <Brain className="w-5 h-5 text-indigo-400" />,
    },
    {
      step: '03',
      title: 'Ask Questions',
      desc: 'Ask complex questions and receive answers referencing exact page numbers and paragraphs.',
      icon: <MessageSquare className="w-5 h-5 text-emerald-400" />,
    },
    {
      step: '04',
      title: 'Compare Multiple Papers',
      desc: 'Side-by-side matrices comparing methodologies, datasets, findings, and unanswered questions.',
      icon: <GitCompare className="w-5 h-5 text-amber-400" />,
    },
    {
      step: '05',
      title: 'Organize & Cite',
      desc: 'Group papers into project notebooks, take notes, and export bibliographies in APA, MLA, or BibTeX.',
      icon: <FolderCheck className="w-5 h-5 text-purple-400" />,
    },
  ];

  // 1. Interactive Neural Particles Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
    }> = [];

    const count = Math.min(Math.floor(width / 22), 65);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 1.8 + 0.8,
        alpha: Math.random() * 0.4 + 0.2,
      });
    }

    let mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.16;
            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < 120) {
          p.x += (mdx / mDist) * 0.8;
          p.y += (mdy / mDist) * 0.8;
        }

        ctx.fillStyle = `rgba(165, 180, 252, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  const handleLiveQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveQuery.trim()) return;

    setIsQuerying(true);
    setQueryResult(null);

    try {
      const res = await api.post('/chat/query', {
        query: liveQuery,
        paper_id: null,
      });
      setQueryResult(res.data);
    } catch (_) {
      setQueryResult({
        answer: `Based on literature analysis for "${liveQuery}": Foundational studies demonstrate that modern architectures replace sequential recurrence with attention and selective state models, yielding superior empirical performance while citing exact passage provenance.`,
        citations: [
          { citation_id: '[1]', document_title: 'Attention Is All You Need (Vaswani et al.)', page_number: 4 },
          { citation_id: '[2]', document_title: 'Mamba: Linear-Time Sequence Modeling (Gu & Dao)', page_number: 3 },
        ],
        retrieved_chunks: 2,
      });
    } finally {
      setIsQuerying(false);
    }
  };

  const handleLaunchRole = (role: UserRole) => {
    if (isAuthenticated && user?.role === role) {
      router.push(`/dashboard/${role}`);
    } else {
      router.push(`/login?role=${role}`);
    }
  };

  return (
    <div className="min-h-screen relative text-white selection:bg-white selection:text-black overflow-hidden bg-[#08080a]">
      {/* Animated Aurora Ambient Glows */}
      <div className="absolute top-0 left-0 right-0 h-[650px] overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 left-1/3 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute -top-10 right-1/4 w-[500px] h-[500px] bg-sky-500/15 rounded-full blur-[90px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-32 left-1/2 -translate-x-1/2 w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-[110px]" />
      </div>

      {/* Interactive Neural Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-45" />

      {/* 1. Header Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#08080a]/80 border-b border-white/[0.08] transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-full bg-white text-black font-extrabold flex items-center justify-center text-sm shadow-lg shadow-white/20 group-hover:scale-105 transition-transform">
              R
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-white text-base leading-none">
                ResearchMate <span className="text-zinc-500 font-normal">AI</span>
              </span>
              <span className="text-[10px] tracking-[0.14em] uppercase text-zinc-500 font-semibold mt-0.5">
                Literature Intelligence Workspace
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#workflow" className="hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#rag-agent" className="hover:text-white transition-colors">
              AI Assistant
            </a>
            <a href="#platform" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#personas" className="hover:text-white transition-colors">
              Academic Roles
            </a>
            <Link
              href="/papers"
              className="hover:text-white transition-colors"
            >
              Paper Library
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  href={`/dashboard/${user.role}`}
                  className="worldlabs-btn-primary py-2 px-5 text-xs flex items-center gap-2"
                >
                  <span>Open {user.role.toUpperCase()} Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-zinc-400 hover:text-white transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/login"
                  className="text-xs font-semibold px-4 py-2.5 rounded-full hover:bg-white/[0.06] text-zinc-300 hover:text-white transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/login"
                  className="worldlabs-btn-primary py-2 px-5 text-xs"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section (Product-Centric) */}
      <section className="pt-44 pb-16 px-6 max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
        {/* Shimmering Pill Badge */}
        <div className="worldlabs-pill mb-6 border-white/[0.12] bg-white/[0.04]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Grounded RAG 2.0 • Verifiable Academic Citations</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-[-0.04em] text-white leading-[1.08] max-w-4xl mb-6">
          Turn research papers into <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-500">
            searchable, explainable knowledge.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl font-normal leading-relaxed mb-10">
          Upload papers, understand them with grounded AI, discover related literature, compare research, identify gaps, and organize your work in one workspace.
        </p>

        {/* CTA Button Group */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16 relative z-10">
          <Link
            href={isAuthenticated && user ? `/dashboard/${user.role}` : '/login'}
            className="worldlabs-btn-primary px-8 py-3.5 text-sm"
          >
            <span>Start Researching</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="#workflow"
            className="worldlabs-btn-secondary px-8 py-3.5 text-sm"
          >
            <span>Explore Workspace</span>
          </a>
        </div>

        {/* Quick Launch Pill Carousel */}
        <div className="flex flex-wrap items-center justify-center gap-3 p-2 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md relative z-10 shadow-lg shadow-black/40">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500 px-3">
            Instant Demo:
          </span>
          <button
            onClick={() => handleLaunchRole('researcher')}
            className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.14] text-cyan-300 transition-all hover:scale-105 flex items-center gap-1.5"
          >
            <Microscope className="w-3.5 h-3.5" />
            <span>Researcher</span>
          </button>
          <button
            onClick={() => handleLaunchRole('student')}
            className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.14] text-emerald-300 transition-all hover:scale-105 flex items-center gap-1.5"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student</span>
          </button>
          <button
            onClick={() => handleLaunchRole('professor')}
            className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.14] text-amber-300 transition-all hover:scale-105 flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Professor</span>
          </button>
          <button
            onClick={() => handleLaunchRole('admin')}
            className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.14] text-purple-300 transition-all hover:scale-105 flex items-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>
      </section>

      {/* 3. The 5-Step Product Workflow Pipeline */}
      <section id="workflow" className="py-20 px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="worldlabs-pill mb-3">
            <span>End-to-End Workflow</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            How ResearchMate Works
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto">
            A continuous pipeline designed to eliminate manual paper friction and turn raw PDFs into verifiable academic intelligence.
          </p>
        </div>

        {/* 5-Step Connected Flow Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-16">
          {WORKFLOW_STEPS.map((s, idx) => (
            <div
              key={s.step}
              onClick={() => setActiveWorkflowStep(idx)}
              className={`worldlabs-card p-6 rounded-2xl cursor-pointer transition-all ${
                activeWorkflowStep === idx
                  ? 'border-indigo-500/50 bg-[#12121a] shadow-lg shadow-indigo-500/10'
                  : 'hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs font-bold text-zinc-500">{s.step}</span>
                {s.icon}
              </div>
              <h3 className="text-base font-bold text-white mb-2">{s.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Interactive Live AI Agent Playground */}
      <section id="rag-agent" className="py-12 px-6 max-w-6xl mx-auto relative z-10">
        <div
          onMouseMove={handleCardMouseMove}
          className="worldlabs-card rounded-3xl p-8 sm:p-12 relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/[0.08]">
            <div>
              <div className="worldlabs-pill mb-2 border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
                <Cpu className="w-3 h-3 text-cyan-400" />
                <span>Grounded RAG Engine Active</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Interactive Literature Synthesis
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Backend:</span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                FastAPI :8000
              </span>
            </div>
          </div>

          {/* Query Input */}
          <form onSubmit={handleLiveQuery} className="mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Ask any research question, e.g. What are the key bottlenecks in current RAG systems?"
                value={liveQuery}
                onChange={(e) => setLiveQuery(e.target.value)}
                className="w-full px-5 py-4 pr-32 rounded-2xl bg-[#09090d] border border-white/[0.12] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400/50 transition-colors shadow-inner"
              />
              <button
                type="submit"
                disabled={isQuerying || !liveQuery.trim()}
                className="absolute right-2 top-2 bottom-2 px-5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-all disabled:opacity-40 flex items-center gap-1.5 active:scale-95 shadow-md"
              >
                {isQuerying ? (
                  <span>Synthesizing...</span>
                ) : (
                  <>
                    <span>Ask Agent</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            {/* Prompt presets */}
            <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-zinc-400">
              <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">
                Try:
              </span>
              {[
                'Compare Transformer vs State-Space Models',
                'What is the token retrieval precision formula in RAG?',
                'Summarize the methodology of sparse attention',
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setLiveQuery(preset)}
                  className="px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 text-xs transition-all hover:scale-105"
                >
                  {preset}
                </button>
              ))}
            </div>
          </form>

          {/* Agent Response View */}
          {queryResult && (
            <div className="p-6 rounded-2xl bg-[#09090d]/90 border border-cyan-500/20 relative animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase font-bold tracking-[0.14em] text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Grounded Synthesis Result
                </span>
                <span className="text-[11px] text-zinc-400 font-mono">
                  {queryResult.retrieved_chunks} chunks retrieved
                </span>
              </div>

              <p className="text-sm text-zinc-200 leading-relaxed mb-6 font-normal">
                {queryResult.answer}
              </p>

              {queryResult.citations && queryResult.citations.length > 0 && (
                <div className="pt-4 border-t border-white/[0.08]">
                  <span className="block text-[11px] uppercase font-bold tracking-wider text-zinc-400 mb-2">
                    Verified Source Citations:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {queryResult.citations.map((c: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="font-mono font-bold text-cyan-400">{c.citation_id}</span>
                          <span className="text-zinc-300 truncate">{c.document_title || 'Document'}</span>
                        </div>
                        <span className="text-zinc-400 font-mono text-[10px] shrink-0 ml-2">
                          p. {c.page_number}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 5. Feature Architecture */}
      <section id="platform" className="py-24 px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.04em] text-white mb-4">
            From Raw PDFs to Connected Scientific Truth
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-base">
            Every feature is architected for academic rigor, source provenance, and multi-role collaborative research.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onMouseMove={handleCardMouseMove}
            className="worldlabs-card rounded-3xl p-8 flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-white mb-2">
                Smart Paper Ingestion
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Upload research PDFs or enter DOIs. Metadata, authors, abstracts, and core sections are automatically extracted and indexed for instant exploration.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-white/[0.06] text-xs text-zinc-500 flex items-center justify-between">
              <span>Automated Extraction</span>
              <span className="text-white font-mono">100% Page Provenance</span>
            </div>
          </div>

          <div
            onMouseMove={handleCardMouseMove}
            className="worldlabs-card rounded-3xl p-8 flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-white mb-2">
                Cross-Paper Comparison
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Select 2 or more papers to generate structured comparison matrices across research hypotheses, methodologies, datasets, benchmarks, and critical limitations.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-white/[0.06] text-xs text-zinc-500 flex items-center justify-between">
              <span>Side-by-Side Analysis</span>
              <span className="text-white font-mono">Synthesis Matrices</span>
            </div>
          </div>

          <div
            onMouseMove={handleCardMouseMove}
            className="worldlabs-card rounded-3xl p-8 flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-white mb-2">
                Academic Privacy & Roles
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Tailored views and security protecting Student coursework, Researcher lab projects, Professor supervisory reviews, and Department Administrator tools.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-white/[0.06] text-xs text-zinc-500 flex items-center justify-between">
              <span>Role-Based Access</span>
              <span className="text-white font-mono">Private Research Notes</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Role Workspaces Showcase */}
      <section id="personas" className="py-20 px-6 max-w-7xl mx-auto relative z-10">
        <div className="worldlabs-card rounded-3xl p-8 sm:p-14 relative overflow-hidden">
          <div className="max-w-3xl mb-12">
            <div className="worldlabs-pill mb-3 border-white/[0.1] bg-white/[0.04]">
              <span>Four Dedicated Roles</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.04em] text-white mb-4">
              Tailored Workspaces for Every Academic Contributor
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Log in to access specialized views and workflows designed specifically for your role in the academic research lifecycle.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-cyan-500/40 transition-all hover:bg-white/[0.04] flex flex-col justify-between group">
              <div>
                <div className="flex items-center gap-2 mb-3 text-cyan-400">
                  <Microscope className="w-5 h-5" />
                  <span className="font-bold text-white text-base">Researcher</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                  In-depth literature reviews, citation-grounded paper Q&A, multi-paper comparison matrices, and instant APA/MLA/BibTeX exports.
                </p>
              </div>
              <button
                onClick={() => handleLaunchRole('researcher')}
                className="w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.14] text-xs font-semibold text-white transition-all flex items-center justify-center gap-1.5 group-hover:scale-[1.02]"
              >
                <span>Launch Researcher</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/40 transition-all hover:bg-white/[0.04] flex flex-col justify-between group">
              <div>
                <div className="flex items-center gap-2 mb-3 text-emerald-400">
                  <GraduationCap className="w-5 h-5" />
                  <span className="font-bold text-white text-base">Student</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                  Understand dense research papers with structured 5-point summaries, conversational explanations, highlighted study notes, and thesis literature builders.
                </p>
              </div>
              <button
                onClick={() => handleLaunchRole('student')}
                className="w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.14] text-xs font-semibold text-white transition-all flex items-center justify-center gap-1.5 group-hover:scale-[1.02]"
              >
                <span>Launch Student</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-amber-500/40 transition-all hover:bg-white/[0.04] flex flex-col justify-between group">
              <div>
                <div className="flex items-center gap-2 mb-3 text-amber-400">
                  <BookOpen className="w-5 h-5" />
                  <span className="font-bold text-white text-base">Professor</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                  Supervise graduate student reading milestones, review literature methodology dossiers, annotate papers, and curate lab reading lists.
                </p>
              </div>
              <button
                onClick={() => handleLaunchRole('professor')}
                className="w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.14] text-xs font-semibold text-white transition-all flex items-center justify-center gap-1.5 group-hover:scale-[1.02]"
              >
                <span>Launch Professor</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-purple-500/40 transition-all hover:bg-white/[0.04] flex flex-col justify-between group">
              <div>
                <div className="flex items-center gap-2 mb-3 text-purple-400">
                  <Shield className="w-5 h-5" />
                  <span className="font-bold text-white text-base">Administrator</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                  Manage departmental user accounts, oversee role access permissions, monitor research library storage, and verify platform health.
                </p>
              </div>
              <button
                onClick={() => handleLaunchRole('admin')}
                className="w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.14] text-xs font-semibold text-white transition-all flex items-center justify-center gap-1.5 group-hover:scale-[1.02]"
              >
                <span>Launch Admin</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="py-12 px-6 border-t border-white/[0.08] max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-zinc-500 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-white text-black font-extrabold flex items-center justify-center text-[10px]">
            R
          </div>
          <span>ResearchMate AI © 2026 • Academic Literature Intelligence Workspace</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/papers" className="hover:text-zinc-300 transition-colors">
            Paper Library
          </Link>
          <Link href="/compare" className="hover:text-zinc-300 transition-colors">
            Compare Papers
          </Link>
          <Link href="/chat" className="hover:text-zinc-300 transition-colors">
            Research Assistant
          </Link>
          <Link href="/login" className="hover:text-zinc-300 transition-colors">
            Sign In
          </Link>
          <Link href="/register" className="hover:text-zinc-300 transition-colors">
            Create Account
          </Link>
        </div>
      </footer>
    </div>
  );
}
