'use client';

import React from 'react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { StatCard } from '../../../components/dashboard/StatCard';
import { ActivityFeed } from '../../../components/dashboard/ActivityFeed';
import { useAuth } from '../../../lib/auth-context';

export default function ProfessorDashboardPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout requiredRoles={['professor', 'admin']}>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-slate-900 border border-amber-900/40">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                Faculty & Advisory Portal
              </span>
              <span className="text-xs text-slate-400">{user?.department}</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-100">
              Welcome back, {user?.name} 🎓
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Supervise student literature reviews, review annotations and paper summaries, curate paper collections, and broadcast recommendations.
            </p>
          </div>
          <button className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-xl transition-all shadow-lg shadow-amber-600/20 self-start md:self-auto">
            + Share Collection to Students
          </button>
        </div>

        {/* Professor Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Supervised Students"
            value="16"
            change="Active researchers"
            changeType="neutral"
            icon="Users"
            description="Linked to faculty dashboard"
          />
          <StatCard
            title="Pending Reviews"
            value="5"
            change="Needs feedback"
            changeType="negative"
            icon="Clock"
            description="Student summaries & notes"
          />
          <StatCard
            title="Curated Collections"
            value="7"
            change="32 papers shared"
            changeType="positive"
            icon="Folder"
            description="Shared reading assignments"
          />
          <StatCard
            title="Recommended Papers"
            value="19"
            change="80% open rate"
            changeType="positive"
            icon="Share"
            description="Pushed to student feeds"
          />
        </div>

        {/* Supervised Students Overview Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center justify-between">
                <span>Supervised Student Progress</span>
                <span className="text-xs text-amber-400 font-medium cursor-pointer hover:underline">
                  Manage Group
                </span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800 pb-2">
                      <th className="pb-2 font-semibold">Student Name</th>
                      <th className="pb-2 font-semibold">Project Title</th>
                      <th className="pb-2 font-semibold">Papers Reviewed</th>
                      <th className="pb-2 font-semibold">Status</th>
                      <th className="pb-2 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    <tr>
                      <td className="py-3 font-semibold text-slate-200">Yashwanth S.</td>
                      <td className="py-3 text-slate-400">RAG Evaluation Benchmarks</td>
                      <td className="py-3 text-slate-300 font-mono">14 / 20</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 text-[10px] bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                          On Track
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg">
                          Review
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-slate-200">Ananya R.</td>
                      <td className="py-3 text-slate-400">Multimodal Embeddings</td>
                      <td className="py-3 text-slate-300 font-mono">8 / 15</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 text-[10px] bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">
                          Pending Review
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button className="px-2.5 py-1 text-[11px] bg-amber-600/20 text-amber-300 hover:bg-amber-600/30 rounded-lg">
                          Feedback
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Recent Faculty Activity */}
          <div>
            <ActivityFeed
              title="Recent Advisory Activity"
              activities={[
                {
                  id: 'pact_1',
                  title: 'Reviewed Yashwanth\'s paper note',
                  timestamp: '15m ago',
                  type: 'student_review',
                  metadata: 'Added 2 feedback comments on methodology',
                },
                {
                  id: 'pact_2',
                  title: 'Recommended "ChromaDB RAG Paper"',
                  timestamp: '2h ago',
                  type: 'chat_session',
                  metadata: 'Broadcast to CS-2026 research group',
                },
              ]}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
