'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { NAVIGATION_ITEMS } from '../../lib/constants';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, hasRole } = useAuth();

  const visibleNavItems = NAVIGATION_ITEMS.filter((item) => hasRole(item.roles));

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div>
        {/* Active Role Context Banner */}
        <div className="mb-6 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Active Workspace Role
          </span>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-indigo-400 capitalize">
              {user?.role || 'Guest'}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>

        {/* Dynamic Navigation Menu */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Navigation Menu
          </p>
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50" />
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-[9px] font-bold bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Role Notice & Security Footer */}
      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-center">
        <p className="text-[11px] text-slate-400 font-medium">RBAC Security Active</p>
        <p className="text-[10px] text-slate-400 mt-0.5">Role-filtered navigation enabled</p>
      </div>
    </aside>
  );
};
