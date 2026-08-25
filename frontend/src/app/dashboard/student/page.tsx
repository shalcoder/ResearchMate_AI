'use client';

import React from 'react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { StatCard } from '../../../components/dashboard/StatCard';
import { ActivityFeed } from '../../../components/dashboard/ActivityFeed';
import { useAuth } from '../../../lib/auth-context';

export default function StudentDashboardPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout requiredRoles={['student', 'admin']}>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-900/40">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                Student Workspace
              </span>
              <span className="text-xs text-slate-400">{user?.department}</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-100">
              Welcome back, {user?.name.split(' ')[0]} 👋
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Organize your research papers, extract key contributions, ask RAG-grounded questions, and complete coursework reviews.
            </p>
          </div>
          <button className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-lg shadow-emerald-600/20 self-start md:self-auto">
            + Upload New Paper
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Saved Papers"
            value="14"
            change="+3 this week"
            changeType="positive"
            icon="Book"
            description="PDFs parsed & indexed"
          />
          <StatCard
            title="Active Chat Threads"
            value="8"
            change="+2 new"
            changeType="positive"
            icon="Chat"
            description="RAG paper QA sessions"
          />
          <StatCard
            title="Study Notes"
            value="32"
            change="5 highlighted"
            changeType="neutral"
            icon="Note"
            description="Page-level annotations"
          />
          <StatCard
            title="Assigned by Faculty"
            value="4"
            change="1 pending review"
            changeType="negative"
            icon="Task"
            description="Prof. Vishal's collection"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions Panel */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">
                Student Core Workflows
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/40 transition-colors cursor-pointer group">
                  <div className="text-emerald-400 font-semibold text-xs mb-1 group-hover:text-emerald-300">
                    📖 Paper Summarizer & Key Metrics
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Extract problem, methodology, dataset, results, and limitations in 1-click.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/40 transition-colors cursor-pointer group">
                  <div className="text-emerald-400 font-semibold text-xs mb-1 group-hover:text-emerald-300">
                    💬 Source-Grounded Paper Q&A
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Ask questions grounded in ChromaDB retrieved page chunks with citation references.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/40 transition-colors cursor-pointer group">
                  <div className="text-emerald-400 font-semibold text-xs mb-1 group-hover:text-emerald-300">
                    🎓 Generate Formatted Citations
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Export IEEE, APA, MLA, and BibTeX citations directly into your coursework.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/40 transition-colors cursor-pointer group">
                  <div className="text-emerald-400 font-semibold text-xs mb-1 group-hover:text-emerald-300">
                    📁 Project Workspace Grouping
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Group literature review papers into projects with custom notes & bookmarks.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div>
            <ActivityFeed
              title="Recent Student Activity"
              activities={[
                {
                  id: 'act_1',
                  title: 'Uploaded "Attention Is All You Need.pdf"',
                  timestamp: '10m ago',
                  type: 'paper_upload',
                  metadata: 'Indexed 12 chunks into ChromaDB',
                },
                {
                  id: 'act_2',
                  title: 'Generated IEEE Citation for ResNet paper',
                  timestamp: '2h ago',
                  type: 'note_created',
                },
                {
                  id: 'act_3',
                  title: 'Chatted with "BERT Pre-training paper"',
                  timestamp: '1d ago',
                  type: 'chat_session',
                  metadata: '4 source-grounded answers generated',
                },
              ]}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
