'use client';

import React from 'react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { StatCard } from '../../../components/dashboard/StatCard';
import { ActivityFeed } from '../../../components/dashboard/ActivityFeed';
import { useAuth } from '../../../lib/auth-context';

export default function ResearcherDashboardPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout requiredRoles={['researcher', 'admin']}>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-900/40">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                Researcher Intelligence Hub
              </span>
              <span className="text-xs text-slate-400">{user?.institution}</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-100">
              Welcome back, {user?.name} 🔬
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Conduct semantic literature search, perform side-by-side paper comparisons, detect candidate research gaps, and build your persistent corpus memory.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-lg shadow-indigo-600/20">
              ⚡ Compare Papers
            </button>
            <button className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all">
              🔍 Semantic Search
            </button>
          </div>
        </div>

        {/* Key Intelligence Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Corpus Embeddings"
            value="1,420"
            change="ChromaDB Indexed"
            changeType="positive"
            icon="Database"
            description="Vector representations ready"
          />
          <StatCard
            title="Comparisons Run"
            value="18"
            change="+4 this week"
            changeType="positive"
            icon="Columns"
            description="Side-by-side matrices"
          />
          <StatCard
            title="Research Gap Signals"
            value="12"
            change="3 high relevance"
            changeType="positive"
            icon="Sparkles"
            description="Extracted from future work"
          />
          <StatCard
            title="Active Projects"
            value="6"
            change="2 shared"
            changeType="neutral"
            icon="Folder"
            description="Literature review workspaces"
          />
        </div>

        {/* Research Intelligence Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Research Gap Assistant Card */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Candidate Research Gap Signals</span>
                <span className="text-[10px] px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-md">
                  Gemini Grounded Analysis
                </span>
              </h3>
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-indigo-300">
                      Unresolved Scalability in Sparse Vision Transformers
                    </span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      92% Confidence
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Identified across 3 papers (Dosovitskiy et al., 2021 & Liu et al., 2022). Limitations highlight memory bottlenecks on fine-grained video tokenization.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-indigo-300">
                      Cross-Lingual Embedding Drift in Small LLMs
                    </span>
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
                      85% Confidence
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Extracted from limitation sections of 2 low-resource translation studies. Candidate area for retrieval augmentation research.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div>
            <ActivityFeed
              title="Recent Research Activities"
              activities={[
                {
                  id: 'ract_1',
                  title: 'Compared "LLaMA-3" vs "Mistral-7B"',
                  timestamp: '45m ago',
                  type: 'comparison',
                  metadata: 'Side-by-side methodology matrix generated',
                },
                {
                  id: 'ract_2',
                  title: 'Semantic Query: "RAG chunking strategies"',
                  timestamp: '3h ago',
                  type: 'chat_session',
                  metadata: 'Top 5 papers retrieved with similarity > 0.84',
                },
                {
                  id: 'ract_3',
                  title: 'Exported BibTeX literature review batch',
                  timestamp: '1d ago',
                  type: 'note_created',
                },
              ]}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
