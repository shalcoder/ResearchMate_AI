'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Button, StatusBadge, Badge, Card, Skeleton } from '@/components/ui';
import {
  User,
  Mail,
  School,
  Building,
  GraduationCap,
  Microscope,
  BookOpen,
  Shield,
  KeyRound,
  CheckCircle2,
  Clock,
  Sparkles,
  Database,
  FileText,
  Save,
  LogOut,
  ArrowRight
} from 'lucide-react';
import { UserRole } from '@/types';

export default function ProfilePage() {
  const { user, switchRole, logout } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [institution, setInstitution] = useState(user?.institution || '');
  const [bio, setBio] = useState('Frontier foundation models, state space representations, and grounded literature intelligence.');
  const [citationFormat, setCitationFormat] = useState('bibtex');
  const [similarityThreshold, setSimilarityThreshold] = useState('85');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Stats from backend
  const [stats, setStats] = useState({
    papersCount: 4,
    chunksCount: 14,
    projectsCount: 1,
  });

  useEffect(() => {
    if (user) {
      setName(user.name);
      setDepartment(user.department || '');
      setInstitution(user.institution || '');
    }
  }, [user]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [papersRes, prjRes] = await Promise.all([
          api.get('/papers').catch(() => ({ data: [] })),
          api.get('/projects').catch(() => ({ data: [] })),
        ]);
        const papers = papersRes.data || [];
        const totalChunks = papers.reduce((acc: number, p: any) => acc + (p.total_chunks || 0), 0);
        setStats({
          papersCount: papers.length,
          chunksCount: totalChunks,
          projectsCount: (prjRes.data || []).length,
        });
      } catch (_) {}
    };
    loadStats();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const res = await api.put('/auth/me', {
        name: name.trim(),
        department: department.trim() || undefined,
        institution: institution.trim() || undefined,
      });

      if (res.data) {
        // Update user in localStorage
        if (typeof window !== 'undefined') {
          const cachedUser = localStorage.getItem('researchmate_user');
          if (cachedUser) {
            const parsed = JSON.parse(cachedUser);
            const updated = { ...parsed, ...res.data };
            localStorage.setItem('researchmate_user', JSON.stringify(updated));
          }
        }
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err: any) {
      setSaveError(err.response?.data?.detail || err.message || 'Failed to update profile details.');
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'student':
        return <GraduationCap className="w-5 h-5 text-emerald-400" />;
      case 'professor':
        return <BookOpen className="w-5 h-5 text-amber-400" />;
      case 'admin':
        return <Shield className="w-5 h-5 text-purple-400" />;
      default:
        return <Microscope className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-300">
        {/* Header Hero Banner */}
        <div className="worldlabs-card rounded-3xl p-8 sm:p-10 border border-white/10 relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500/20 via-sky-500/10 to-purple-500/20 border border-white/15 flex items-center justify-center text-white text-2xl font-extrabold shadow-2xl shadow-indigo-500/20">
                {user?.name?.charAt(0) || 'R'}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="worldlabs-pill text-[10px] text-indigo-300 border-indigo-500/30 bg-indigo-500/10 flex items-center gap-1.5">
                    {getRoleIcon(user?.role)}
                    <span className="capitalize">{user?.role || 'Researcher'}</span>
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    ID: {user?.id?.slice(0, 8) || 'active'}...
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    JWT Active
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {user?.name || 'Academic Researcher'}
                </h1>

                <p className="text-xs text-slate-400 flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>{user?.email || 'researcher@researchmate.ai'}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <School className="w-3.5 h-3.5 text-slate-500" />
                    <span>{user?.institution || 'Academic Institute'}</span>
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
              <button
                onClick={logout}
                className="worldlabs-btn-secondary text-xs py-2 px-4 flex items-center gap-1.5 text-rose-300 hover:text-white"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Corpus & Workspace Intelligence Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="worldlabs-card rounded-2xl p-5 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Literature Indexed</span>
              <FileText className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">{stats.papersCount}</div>
            <p className="text-[11px] text-slate-500">Vectorized papers in library</p>
          </div>

          <div className="worldlabs-card rounded-2xl p-5 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">ChromaDB Vectors</span>
              <Database className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">{stats.chunksCount}</div>
            <p className="text-[11px] text-slate-500">Dense semantic embeddings</p>
          </div>

          <div className="worldlabs-card rounded-2xl p-5 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Active Labs</span>
              <Building className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">{stats.projectsCount}</div>
            <p className="text-[11px] text-slate-500">Collaborative workspaces</p>
          </div>

          <div className="worldlabs-card rounded-2xl p-5 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Grounding RAG</span>
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">Active</div>
            <p className="text-[11px] text-slate-500">0-hallucination citations</p>
          </div>
        </div>

        {/* Main Details Grid: Edit Profile & Role Persona Switcher */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2 Cols): Edit Academic Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="worldlabs-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
              <div className="pb-4 border-b border-white/10">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Academic Credentials & Affiliation
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update your institutional identity, research focus, and department.
                </p>
              </div>

              {saveSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Profile updated successfully! Database synced.</span>
                </div>
              )}

              {saveError && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{saveError}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Full Academic Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dr. Steve Alexander"
                    className="w-full px-4 py-2.5 text-xs bg-black/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Institutional Email (Read-only)
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-2.5 text-xs bg-black/30 border border-white/5 rounded-xl text-slate-400 cursor-not-allowed font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Managed via authentication provider and JWT claims.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Institution / University
                    </label>
                    <input
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="Stanford University"
                      className="w-full px-4 py-2.5 text-xs bg-black/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Department / Laboratory
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="AI & Neural Systems Lab"
                      className="w-full px-4 py-2.5 text-xs bg-black/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Research Focus & Statement
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe your active research domain and interests..."
                    className="w-full p-4 text-xs bg-black/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="worldlabs-btn-primary text-xs py-2.5 px-6 font-semibold disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Research Intelligence Preferences */}
            <div className="worldlabs-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
              <div className="pb-3 border-b border-white/10">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Workspace & Grounding Preferences
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure default export standards and similarity constraints.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Default Citation Style
                  </label>
                  <select
                    value={citationFormat}
                    onChange={(e) => setCitationFormat(e.target.value)}
                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="bibtex">BibTeX (.bib)</option>
                    <option value="ieee">IEEE Standard</option>
                    <option value="apa">APA 7th Edition</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    RAG Grounding Cutoff
                  </label>
                  <select
                    value={similarityThreshold}
                    onChange={(e) => setSimilarityThreshold(e.target.value)}
                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="90">90% Cosine Similarity (Strict)</option>
                    <option value="85">85% Cosine Similarity (Recommended)</option>
                    <option value="80">80% Cosine Similarity (Broad)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (1 Col): Role Persona Switcher & Fast Links */}
          <div className="space-y-6">
            {/* Quick Persona Switcher Card */}
            <div className="worldlabs-card rounded-3xl p-6 border border-white/10 space-y-4">
              <div className="pb-3 border-b border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Active Persona
                </span>
                <h3 className="text-sm font-bold text-white">Switch Academic Role</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Test and explore role-tailored dashboards with 1-click.
                </p>
              </div>

              <div className="space-y-2">
                {[
                  { role: 'researcher', title: 'Researcher', desc: 'Cross-paper synthesis & RAG chat', icon: <Microscope className="w-4 h-4 text-cyan-400" /> },
                  { role: 'student', title: 'Student', desc: 'Paper summaries & coursework QA', icon: <GraduationCap className="w-4 h-4 text-emerald-400" /> },
                  { role: 'professor', title: 'Professor', desc: 'Faculty advisory & reviews', icon: <BookOpen className="w-4 h-4 text-amber-400" /> },
                  { role: 'admin', title: 'Administrator', desc: 'Platform governance & RBAC', icon: <Shield className="w-4 h-4 text-purple-400" /> },
                ].map((item) => (
                  <button
                    key={item.role}
                    onClick={() => switchRole(item.role as UserRole)}
                    className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                      user?.role === item.role
                        ? 'bg-white text-black font-bold shadow-md shadow-white/10'
                        : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/5 hover:border-white/15 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-xl ${user?.role === item.role ? 'bg-black/10' : 'bg-white/5'}`}>
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-xs font-semibold">{item.title}</div>
                        <div className={`text-[10px] ${user?.role === item.role ? 'text-slate-700' : 'text-slate-500'}`}>
                          {item.desc}
                        </div>
                      </div>
                    </div>

                    {user?.role === item.role && (
                      <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Navigation Card */}
            <div className="worldlabs-card rounded-3xl p-6 border border-white/10 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-white/10">
                Workspace Shortcuts
              </h4>
              <div className="space-y-1.5 text-xs">
                <Link
                  href="/papers"
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-between transition-colors"
                >
                  <span>Paper Library ({stats.papersCount})</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </Link>
                <Link
                  href="/chat"
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-between transition-colors"
                >
                  <span>Grounded RAG Chat</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </Link>
                <Link
                  href="/compare"
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-between transition-colors"
                >
                  <span>Compare Models</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </Link>
                <Link
                  href="/projects"
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-between transition-colors"
                >
                  <span>Collaborative Labs</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
