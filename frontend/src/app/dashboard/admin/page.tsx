'use client';

import React from 'react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { StatCard } from '../../../components/dashboard/StatCard';
import { ActivityFeed } from '../../../components/dashboard/ActivityFeed';
import { useAuth } from '../../../lib/auth-context';

export default function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout requiredRoles={['admin']}>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-rose-950/70 via-slate-900 to-slate-900 border border-rose-900/40">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full">
                System Governance & Admin Panel
              </span>
              <span className="text-xs text-slate-400">System Administrator</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-100">
              Platform Administration 🛡️
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Monitor active platform users, regulate Role-Based Access Control (RBAC), inspect Gemini AI token consumption, and manage paper storage.
            </p>
          </div>
          <button className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-all shadow-lg shadow-rose-600/20 self-start md:self-auto">
            ⚙️ System Configuration
          </button>
        </div>

        {/* System Health & Analytics Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Registered Users"
            value="148"
            change="Active platform"
            changeType="positive"
            icon="Users"
            description="Students, Researchers, Professors"
          />
          <StatCard
            title="Gemini AI API Calls"
            value="12,450"
            change="99.8% Grounded"
            changeType="positive"
            icon="Sparkles"
            description="Avg latency: 1.2s"
          />
          <StatCard
            title="Vector Index Size"
            value="45,800"
            change="ChromaDB collection"
            changeType="neutral"
            icon="Database"
            description="Chunks stored"
          />
          <StatCard
            title="Cloudinary PDF Storage"
            value="4.2 GB"
            change="182 PDFs"
            changeType="neutral"
            icon="HardDrive"
            description="Storage usage"
          />
        </div>

        {/* User Management & Role Control Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center justify-between">
                <span>User & RBAC Role Governance</span>
                <span className="text-xs text-rose-400 font-medium cursor-pointer hover:underline">
                  Add User
                </span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800 pb-2">
                      <th className="pb-2 font-semibold">User</th>
                      <th className="pb-2 font-semibold">Email</th>
                      <th className="pb-2 font-semibold">Assigned Role</th>
                      <th className="pb-2 font-semibold text-right">RBAC Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    <tr>
                      <td className="py-3 font-semibold text-slate-200">Yashwanth</td>
                      <td className="py-3 text-slate-400">yashwanth@researchmate.ai</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 text-[10px] bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 uppercase font-bold">
                          Student
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg">
                          Edit Role
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-slate-200">Dr. Steve</td>
                      <td className="py-3 text-slate-400">steveisaiah09@gmail.com</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 text-[10px] bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20 uppercase font-bold">
                          Researcher
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg">
                          Edit Role
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-slate-200">Prof. Vishal</td>
                      <td className="py-3 text-slate-400">vishal.prof@researchmate.ai</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 text-[10px] bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20 uppercase font-bold">
                          Professor
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg">
                          Edit Role
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Admin System Audit Feed */}
          <div>
            <ActivityFeed
              title="Admin Security Audit Log"
              activities={[
                {
                  id: 'aact_1',
                  title: 'Role updated for Dr. Steve',
                  timestamp: '1h ago',
                  type: 'student_review',
                  metadata: 'Changed from Student -> Researcher',
                },
                {
                  id: 'aact_2',
                  title: 'ChromaDB index auto-compacted',
                  timestamp: '4h ago',
                  type: 'paper_upload',
                  metadata: 'Optimized vector similarity lookup',
                },
              ]}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
