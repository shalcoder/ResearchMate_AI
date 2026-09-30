'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { useAuth } from '../../../lib/auth-context';
import { Card, Button, Badge, StatusBadge } from '../../../components/ui';
import { BookOpen, Users, Clock, CheckCircle2, MessageSquare, ArrowRight, Share2, Sparkles } from 'lucide-react';

interface StudentReviewItem {
  id: string;
  name: string;
  topic: string;
  papersReviewed: number;
  targetPapers: number;
  status: 'on_track' | 'needs_feedback' | 'pending';
  lastActivity: string;
}

export default function ProfessorDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'students' | 'shared_collections'>('students');

  const students: StudentReviewItem[] = [
    {
      id: 'stud-1',
      name: 'Yashwanth Marimuthu',
      topic: 'RAG Grounding & Parametric Memory Drift',
      papersReviewed: 14,
      targetPapers: 20,
      status: 'on_track',
      lastActivity: '35m ago',
    },
    {
      id: 'stud-2',
      name: 'Ananya Sharma',
      topic: 'Multimodal Vision-Language Representation Alignment',
      papersReviewed: 9,
      targetPapers: 15,
      status: 'needs_feedback',
      lastActivity: '3h ago',
    },
    {
      id: 'stud-3',
      name: 'David Chen',
      topic: 'Linear-Time Sequence Modeling vs Multi-Head Attention',
      papersReviewed: 18,
      targetPapers: 20,
      status: 'on_track',
      lastActivity: 'Yesterday',
    },
  ];

  return (
    <DashboardLayout requiredRoles={['professor', 'admin']}>
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Welcome Header */}
        <div className="worldlabs-card rounded-3xl p-8 sm:p-10 border border-white/10 relative overflow-hidden space-y-4">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="worldlabs-pill text-[10px] text-amber-300 border-amber-500/30 bg-amber-500/10">
                  Faculty Advisory Portal
                </span>
                <span className="text-xs text-slate-400">{user?.department || 'Advanced AI Systems'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Welcome back, {user?.name || 'Professor'} 🎓
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Supervise graduate research dossiers, review student methodology notes and citations, curate lab paper collections, and broadcast reading recommendations.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/projects"
                className="worldlabs-btn-primary text-xs py-2.5 px-5 font-semibold flex items-center gap-2 whitespace-nowrap"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Collection to Lab</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Professor Intelligence Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="worldlabs-card rounded-2xl p-5 border border-white/10">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-400">Supervised Students</span>
              <Users className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white">16</div>
            <p className="text-[11px] text-slate-500 mt-1">Active lab researchers</p>
          </div>

          <div className="worldlabs-card rounded-2xl p-5 border border-white/10">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-400">Review Queue</span>
              <Clock className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-white">3</div>
            <p className="text-[11px] text-slate-500 mt-1">Pending methodology feedback</p>
          </div>

          <div className="worldlabs-card rounded-2xl p-5 border border-white/10">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-400">Curated Labs</span>
              <BookOpen className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white">4</div>
            <p className="text-[11px] text-slate-500 mt-1">Shared reading workspaces</p>
          </div>

          <div className="worldlabs-card rounded-2xl p-5 border border-white/10">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-400">Gap Validations</span>
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white">8</div>
            <p className="text-[11px] text-slate-500 mt-1">Approved candidate hypotheses</p>
          </div>
        </div>

        {/* Supervised Students Overview Table */}
        <div className="worldlabs-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Supervised Student Progress & Literature Reviews</h3>
              <p className="text-xs text-slate-400">Monitor reading throughput, annotation rigor, and thesis milestones</p>
            </div>
            <Link href="/projects" className="text-xs font-semibold text-amber-400 hover:text-amber-300">
              Manage Lab Groups →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-black/50 text-slate-400 border-b border-white/10">
                  <th className="p-4 font-semibold uppercase tracking-wider text-[11px]">Student</th>
                  <th className="p-4 font-semibold uppercase tracking-wider text-[11px]">Thesis / Project Focus</th>
                  <th className="p-4 font-semibold uppercase tracking-wider text-[11px]">Papers Reviewed</th>
                  <th className="p-4 font-semibold uppercase tracking-wider text-[11px]">Advisory Status</th>
                  <th className="p-4 font-semibold uppercase tracking-wider text-[11px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-white">
                      <div>{s.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Active {s.lastActivity}</div>
                    </td>
                    <td className="p-4 text-slate-300">
                      {s.topic}
                    </td>
                    <td className="p-4 font-mono text-slate-200">
                      {s.papersReviewed} / {s.targetPapers} ({Math.round((s.papersReviewed / s.targetPapers) * 100)}%)
                    </td>
                    <td className="p-4">
                      {s.status === 'on_track' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          On Track
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Feedback Required
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/chat?q=${encodeURIComponent(`Review thesis progress and methodology notes for ${s.name}: topic "${s.topic}"`)}`}
                        className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors inline-block"
                      >
                        Provide Feedback
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
