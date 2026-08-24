'use client';

import React from 'react';
import { useAuth } from '../../lib/auth-context';
import { UserRole } from '../../types';

const ROLE_BADGE_STYLES: Record<UserRole, string> = {
  student: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  researcher: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  professor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  admin: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
};

export const Header: React.FC = () => {
  const { user, switchRole, logout } = useAuth();

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Brand & Workspace Title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20">
          R
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-100 leading-tight">ResearchMate AI</h1>
          <p className="text-xs text-slate-400">Academic Knowledge Workspace</p>
        </div>
      </div>

      {/* Role Switcher & User Actions */}
      <div className="flex items-center gap-4">
        {/* Role Quick Switcher (Demo Feature) */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 px-2 font-medium">Switch Role:</span>
          {(['student', 'researcher', 'professor', 'admin'] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => switchRole(r)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all capitalize ${
                user?.role === r
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* User Info Card */}
        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 text-xs font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="hidden sm:block text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-200">{user.name}</span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${
                    ROLE_BADGE_STYLES[user.role]
                  }`}
                >
                  {user.role}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block truncate max-w-[180px]">
                {user.email}
              </span>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
