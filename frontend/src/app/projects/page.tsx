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

  const loadData = async () => {
    try {
      const [prjRes, papersRes] = await Promise.all([
        api.get('/projects'),
        api.get('/papers'),
      ]);
      setProjects(prjRes.data || []);
      setPapers(papersRes.data || []);
      if (!activeProjectId && prjRes.data && prjRes.data.length > 0) {
        setActiveProjectId(prjRes.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load project workspaces:', err);
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
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Collaborative Project Workspaces
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Curate literature collections, pin benchmark papers, and share research dossiers with your research advisor.
            </p>
          </div>

          <button
            onClick={() => setIsCreating(!isCreating)}
            className="px-4 py-2.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
          >
            {isCreating ? 'Cancel' : '+ New Workspace'}
          </button>
        </div>

        {/* Create Project Modal / Inline Form */}
        {isCreating && (
          <form onSubmit={handleCreateProject} className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Create New Research Workspace
            </h3>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Workspace Title (e.g. Master's Thesis: Neural Representation Learning)"
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              required
            />
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Scope, research questions, and literature goals..."
              rows={2}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
            >
              Save Workspace
            </button>
          </form>
        )}

        {/* Workspaces Master-Detail Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Projects Sidebar */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-1">
              Your Collections ({projects.length})
            </span>
            {projects.map((p) => (
              <div
                key={p.id}
                onClick={() => setActiveProjectId(p.id)}
                className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                  activeProjectId === p.id
                    ? 'bg-indigo-600/10 border-indigo-500/50 text-white shadow-md'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold text-white truncate">{p.title}</div>
                {p.description && (
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">{p.description}</p>
                )}
                <div className="text-[10px] text-slate-500 mt-2">
                  {p.papers?.length || 0} pinned papers
                </div>
              </div>
            ))}
          </div>

          {/* Active Project Detail */}
          <div className="md:col-span-2 space-y-5">
            {activeProject ? (
              <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-white">{activeProject.title}</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {activeProject.description || 'No description provided.'}
                  </p>
                </div>

                {/* Pin Paper Control */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3">
                  <select
                    value={selectedPaperToPin}
                    onChange={(e) => setSelectedPaperToPin(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Select paper to pin to this workspace...</option>
                    {papers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handlePinPaper}
                    disabled={!selectedPaperToPin}
                    className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg transition-colors"
                  >
                    Pin Paper
                  </button>
                </div>

                {/* Pinned Papers List */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Pinned Scientific Papers ({activeProject.papers?.length || 0})
                  </h3>

                  {activeProject.papers?.length === 0 ? (
                    <p className="text-xs text-slate-500 py-6 text-center">
                      No papers pinned to this workspace yet. Select a paper from above to pin.
                    </p>
                  ) : (
                    activeProject.papers?.map((p) => (
                      <div
                        key={p.id}
                        className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between gap-4"
                      >
                        <div className="min-w-0">
                          <Link
                            href={`/papers/${p.id}`}
                            className="text-xs font-semibold text-white hover:text-indigo-400 transition-colors block truncate"
                          >
                            {p.title}
                          </Link>
                          <span className="text-[11px] text-slate-400">
                            {p.venue || 'Academic'} • {p.total_chunks} chunks
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/chat?paper_id=${p.id}`}
                            className="text-xs px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
                          >
                            Chat
                          </Link>
                          <button
                            onClick={() => handleUnpinPaper(p.id)}
                            className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1"
                          >
                            Unpin
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-xl p-8 text-slate-500 text-xs">
                Select or create a workspace to view pinned research dossiers.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
