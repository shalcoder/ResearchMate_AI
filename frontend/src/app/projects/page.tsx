'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Project, ResearchPaper } from '@/types';
import { api } from '@/lib/api';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedPaperToPin, setSelectedPaperToPin] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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
              Organize literature by thematic scope, pin benchmark foundation papers, and collaborate with research advisors and lab partners.
            </p>
          </div>

          <button
            onClick={() => setIsCreating(!isCreating)}
            className="worldlabs-btn-primary text-xs py-2.5 px-5 font-semibold flex items-center gap-2 self-start sm:self-auto"
          >
            {isCreating ? 'Cancel' : '+ New Workspace'}
          </button>
        </div>

        {/* Create Project Workspace Form */}
        {isCreating && (
          <div className="worldlabs-card rounded-3xl p-6 border border-indigo-500/30 bg-gradient-to-r from-indigo-950/20 to-slate-900/40 animate-in fade-in duration-200">
            <form onSubmit={handleCreateProject} className="space-y-4">
              <h3 className="text-sm font-bold text-white">Create Collaborative Workspace</h3>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Workspace Title (e.g. Master's Thesis: Linear State Spaces & Transformers)"
                className="w-full px-4 py-2.5 text-xs bg-black/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Describe scope, benchmark goals, or literature review focus..."
                rows={3}
                className="w-full px-4 py-2.5 text-xs bg-black/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="worldlabs-btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="worldlabs-btn-primary text-xs py-2 px-5 font-semibold"
                >
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Master-Detail Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Workspaces List (4 of 12 cols) */}
          <div className="md:col-span-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-1">
              Active Workspaces ({projects.length})
            </span>

            {projects.map((p) => {
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
                      {p.papers?.length || 0} papers
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
            })}
          </div>

          {/* Right Column: Active Workspace Content (8 of 12 cols) */}
          <div className="md:col-span-8 space-y-6">
            {activeProject ? (
              <div className="worldlabs-card rounded-3xl p-8 border border-white/10 space-y-6">
                {/* Workspace Header */}
                <div className="pb-5 border-b border-white/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="worldlabs-pill text-[10px] text-indigo-300 border-indigo-500/30 bg-indigo-500/10">
                      Workspace Detail
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {activeProject.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {activeProject.description || 'No description specified for this workspace.'}
                  </p>
                </div>

                {/* Pin Paper Action Box */}
                <div className="p-4 rounded-2xl bg-black/50 border border-white/10 flex flex-col sm:flex-row items-center gap-3">
                  <select
                    value={selectedPaperToPin}
                    onChange={(e) => setSelectedPaperToPin(e.target.value)}
                    className="flex-1 w-full sm:w-auto bg-black border border-white/15 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Select paper to pin to this workspace...</option>
                    {papers
                      .filter((p) => !activeProject.papers?.some((pinned) => pinned.id === p.id))
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title} ({p.publication_year || 'Recent'})
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={handlePinPaper}
                    disabled={!selectedPaperToPin}
                    className="worldlabs-btn-primary text-xs py-2.5 px-5 font-semibold disabled:opacity-40 whitespace-nowrap w-full sm:w-auto"
                  >
                    Pin to Lab
                  </button>
                </div>

                {/* Pinned Papers List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      Pinned Research Papers ({activeProject.papers?.length || 0})
                    </h3>
                  </div>

                  {activeProject.papers?.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-black/30 border border-white/5 text-slate-500 text-xs">
                      No papers pinned to this workspace yet. Select a paper from above to pin.
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
                              className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 rounded hover:bg-rose-500/10 transition-colors"
                            >
                              Unpin
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="worldlabs-card rounded-3xl p-12 text-center border border-white/10 text-slate-400 text-xs">
                Select or create a workspace to view pinned research literature.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
