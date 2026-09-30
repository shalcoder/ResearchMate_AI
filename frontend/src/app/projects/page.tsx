'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Project, ResearchPaper } from '@/types';
import { api } from '@/lib/api';
import { Button, StatusBadge, Skeleton, EmptyState } from '@/components/ui';
import { FolderKanban, Plus, MessageSquare, BookOpen, Trash2, CheckCircle2, Bookmark, Sparkles, FileText } from 'lucide-react';

type ProjectTab = 'papers' | 'notes' | 'gaps';

interface NoteItem {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<ProjectTab>('papers');

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedPaperToPin, setSelectedPaperToPin] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Literature notes state
  const [notes, setNotes] = useState<NoteItem[]>([
    {
      id: 'note-1',
      author: 'Dr. Steve Alexander',
      content: 'Mamba demonstrates linear scaling on 1M token contexts, but Attention remains stronger on multi-hop factual recall. Consider a hybrid selective state-space + sparse attention architecture.',
      timestamp: '2 hours ago',
    },
    {
      id: 'note-2',
      author: 'Prof. Vishal M',
      content: 'Make sure to benchmark DeepSeek-R1 test-time compute on AIME 2024 problems compared to standard o1-mini baselines.',
      timestamp: 'Yesterday',
    },
  ]);
  const [newNoteText, setNewNoteText] = useState('');

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [prjRes, papersRes] = await Promise.all([
        api.get('/projects'),
        api.get('/papers'),
      ]);
      setProjects(prjRes.data || []);
      setPapers(papersRes.data || []);
      if (prjRes.data && prjRes.data.length > 0) {
        setActiveProjectId((prev) => prev || prjRes.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load project workspaces:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await api.post('/projects', {
        title: newTitle.trim(),
        description: newDesc.trim() || undefined,
      });
      setProjects((prev) => [res.data, ...prev]);
      setActiveProjectId(res.data.id);
      setNewTitle('');
      setNewDesc('');
      setIsCreating(false);
    } catch (err) {
      alert('Failed to create project workspace.');
    }
  };

  const handlePinPaper = async () => {
    if (!selectedPaperToPin || !activeProjectId) return;
    try {
      await api.post(`/projects/${activeProjectId}/papers`, {
        paper_id: selectedPaperToPin,
      });
      loadData();
      setSelectedPaperToPin('');
    } catch (err) {
      alert('Failed to pin paper.');
    }
  };

  const handleUnpinPaper = async (paperId: string) => {
    if (!activeProjectId) return;
    try {
      await api.delete(`/projects/${activeProjectId}/papers/${paperId}`);
      loadData();
    } catch (err) {
      alert('Failed to unpin paper.');
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      author: 'You (Researcher)',
      content: newNoteText.trim(),
      timestamp: 'Just now',
    };
    setNotes([newNote, ...notes]);
    setNewNoteText('');
  };

  const activeProject = projects.find((p) => p.id === activeProjectId);

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="worldlabs-pill text-[10px] text-indigo-300 border-indigo-500/30 bg-indigo-500/10">
                Collaborative Lab Spaces
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Research Workspaces & Dossiers
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Organize literature by thematic scope, pin benchmark foundation models, curate lab notes, and collaborate across research teams.
            </p>
          </div>

          <button
            onClick={() => setIsCreating(!isCreating)}
            className="worldlabs-btn-primary text-xs py-2.5 px-5 font-semibold flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isCreating ? 'Cancel' : 'New Lab Workspace'}</span>
          </button>
        </div>

        {/* Create Workspace Inline Modal / Card */}
        {isCreating && (
          <div className="worldlabs-card rounded-3xl p-6 sm:p-8 border border-indigo-500/30 bg-gradient-to-r from-indigo-950/20 to-slate-900/40 animate-in fade-in duration-200">
            <form onSubmit={handleCreateProject} className="space-y-4">
              <h3 className="text-sm font-bold text-white">Create Collaborative Research Lab</h3>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Workspace Title (e.g. Master's Thesis: Neural Representation Learning & State Spaces)"
                className="w-full px-4 py-2.5 text-xs bg-black/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Scope, research questions, benchmark goals, or literature review objectives..."
                rows={3}
                className="w-full px-4 py-2.5 text-xs bg-black/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <div className="flex justify-end gap-2.5">
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                >
                  Save Workspace
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Master-Detail Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Workspaces List (4 of 12 cols) */}
          <div className="md:col-span-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-1">
              Active Laboratories ({projects.length})
            </span>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-28 w-full" />
                ))}
              </div>
            ) : projects.length === 0 ? (
              <EmptyState
                title="No workspaces yet"
                description="Create your first research lab workspace to pin benchmark literature."
                actionLabel="Create Workspace"
                onAction={() => setIsCreating(true)}
              />
            ) : (
              projects.map((p) => {
                const isActive = activeProjectId === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setActiveProjectId(p.id)}
                    className={`p-5 rounded-2xl border text-xs cursor-pointer transition-all space-y-2 ${
                      isActive
                        ? 'bg-indigo-600/15 border-indigo-500/50 shadow-lg shadow-indigo-600/10'
                        : 'worldlabs-card border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                        Research Lab
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {p.papers?.length || 0} papers pinned
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-sm leading-snug">
                      {p.title}
                    </h3>

                    {p.description && (
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {p.description}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Active Workspace Content (8 of 12 cols) */}
          <div className="md:col-span-8 space-y-6">
            {activeProject ? (
              <div className="worldlabs-card rounded-3xl p-8 border border-white/10 space-y-6">
                {/* Workspace Header */}
                <div className="pb-5 border-b border-white/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="worldlabs-pill text-[10px] text-indigo-300 border-indigo-500/30 bg-indigo-500/10">
                      Laboratory Workspace
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {activeProject.papers?.length || 0} Foundation Papers
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    {activeProject.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                    {activeProject.description || 'Dedicated workspace for frontier literature synthesis and foundation model evaluation.'}
                  </p>
                </div>

                {/* Internal Tabs */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10 w-fit">
                  <button
                    onClick={() => setActiveTab('papers')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === 'papers' ? 'bg-white text-black font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Pinned Literature ({activeProject.papers?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab('notes')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === 'notes' ? 'bg-white text-black font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Lab Notes & Hypotheses ({notes.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('gaps')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === 'gaps' ? 'bg-white text-black font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Workspace Gaps (3)
                  </button>
                </div>

                {/* TAB 1: PINNED LITERATURE */}
                {activeTab === 'papers' && (
                  <div className="space-y-4">
                    {/* Pin Paper Action Box */}
                    <div className="p-4 rounded-2xl bg-black/50 border border-white/10 flex flex-col sm:flex-row items-center gap-3">
                      <select
                        value={selectedPaperToPin}
                        onChange={(e) => setSelectedPaperToPin(e.target.value)}
                        className="flex-1 w-full sm:w-auto bg-black border border-white/15 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="">Select literature to pin to this workspace...</option>
                        {papers
                          .filter((p) => !activeProject.papers?.some((pinned) => pinned.id === p.id))
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.title} ({p.publication_year || 'Recent'})
                            </option>
                          ))}
                      </select>
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={!selectedPaperToPin}
                        onClick={handlePinPaper}
                        className="w-full sm:w-auto"
                      >
                        Pin to Lab
                      </Button>
                    </div>

                    {/* Pinned Papers List */}
                    {activeProject.papers?.length === 0 ? (
                      <div className="p-8 text-center rounded-2xl bg-black/30 border border-white/5 text-slate-500 text-xs">
                        No papers pinned to this workspace yet. Select a paper above to pin.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {activeProject.papers?.map((p) => (
                          <div
                            key={p.id}
                            className="p-4 rounded-2xl bg-black/50 border border-white/10 hover:border-indigo-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                  {p.venue ? p.venue.split('(')[0] : 'Academic'}
                                </span>
                                <span className="text-xs text-slate-400 font-mono">
                                  {p.publication_year}
                                </span>
                              </div>
                              <Link
                                href={`/papers/${p.id}`}
                                className="text-xs sm:text-sm font-semibold text-white hover:text-indigo-400 transition-colors block truncate"
                              >
                                {p.title}
                              </Link>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                              <Link
                                href={`/chat?paper_id=${p.id}`}
                                className="worldlabs-btn-secondary text-xs py-1.5 px-3"
                              >
                                Chat
                              </Link>
                              <Link
                                href={`/papers/${p.id}`}
                                className="text-xs px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
                              >
                                Inspect
                              </Link>
                              <button
                                onClick={() => handleUnpinPaper(p.id)}
                                className="text-xs text-rose-400 hover:text-rose-300 p-1.5 rounded-full hover:bg-rose-500/10 transition-colors"
                                title="Unpin paper"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: LAB NOTES & HYPOTHESES */}
                {activeTab === 'notes' && (
                  <div className="space-y-4">
                    <form onSubmit={handleAddNote} className="space-y-3">
                      <textarea
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        placeholder="Draft synthesis note, empirical hypothesis, or literature observation for the lab..."
                        rows={3}
                        className="w-full p-4 rounded-2xl bg-black/50 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                      <div className="flex justify-end">
                        <Button variant="primary" size="sm" type="submit" disabled={!newNoteText.trim()}>
                          Add Lab Note
                        </Button>
                      </div>
                    </form>

                    <div className="space-y-3 pt-2">
                      {notes.map((note) => (
                        <div
                          key={note.id}
                          className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-indigo-300">{note.author}</span>
                            <span className="text-[11px] text-slate-500 font-mono">{note.timestamp}</span>
                          </div>
                          <p className="text-xs text-slate-200 leading-relaxed">
                            {note.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: WORKSPACE RESEARCH GAPS */}
                {activeTab === 'gaps' && (
                  <div className="space-y-3">
                    {[
                      {
                        title: 'Long-Context Associative Recall Breakdown in Selective State Spaces',
                        confidence: '94%',
                        evidence: 'Mamba (Gu & Dao, 2023) §4.3 and Transformer scaling studies',
                      },
                      {
                        title: 'Language Mixing and Readability Drift in Cold-Start Reasoning RL',
                        confidence: '89%',
                        evidence: 'DeepSeek-R1 Technical Report (2025) §3.1',
                      },
                      {
                        title: 'Quadratic Attention Overhead in Real-Time Dense Document Grounding',
                        confidence: '91%',
                        evidence: 'Vaswani et al. (2017) & Lewis et al. (2020)',
                      },
                    ].map((g, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{g.title}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                            {g.confidence}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono">
                          Evidence: {g.evidence}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                title="No active workspace selected"
                description="Select or create a collaborative research workspace to view pinned foundation dossiers."
                actionLabel="Create Workspace"
                onAction={() => setIsCreating(true)}
              />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
