'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { NAVIGATION_SECTIONS } from '../../lib/constants';
import {
  LayoutDashboard,
  BookOpen,
  MessageSquareText,
  Columns,
  Search,
  FolderKanban,
  GraduationCap,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="w-4 h-4" />,
  BookOpen: <BookOpen className="w-4 h-4" />,
  MessageSquareText: <MessageSquareText className="w-4 h-4" />,
  Columns: <Columns className="w-4 h-4" />,
  Search: <Search className="w-4 h-4" />,
  FolderKanban: <FolderKanban className="w-4 h-4" />,
  GraduationCap: <GraduationCap className="w-4 h-4" />,
  ShieldCheck: <ShieldCheck className="w-4 h-4" />,
};

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, hasRole } = useAuth();

  return (
    <aside className="w-64 bg-[#08080a] border-r border-white/[0.08] flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div>
        {/* Active Role Card */}
        <div className="mb-5 p-3.5 rounded-2xl bg-[#0f0f14] border border-white/[0.08] shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500 block mb-1">
            Current Workspace
          </span>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white capitalize flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              {user?.role ? `${user.role} Mode` : 'Guest'}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>

        {/* Sectioned Navigation Menu */}
        <div className="space-y-4">
          {NAVIGATION_SECTIONS.map((section) => {
            const visibleItems = section.items.filter((item) => hasRole(item.roles));
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.sectionTitle}>
                <p className="px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500 mb-1.5">
                  {section.sectionTitle}
                </p>
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-white text-black font-bold shadow-md shadow-white/10'
                            : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {ICON_MAP[item.icon] || <span className="w-1.5 h-1.5 rounded-full bg-white/40" />}
                          <span>{item.title}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`px-2 py-0.2 text-[9px] font-bold rounded-full border ${
                              isActive
                                ? 'bg-black/10 border-black/20 text-black'
                                : 'bg-white/[0.08] border-white/[0.12] text-zinc-300'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security & Provenance Footer */}
      <div className="mt-6 p-3 rounded-2xl bg-[#0f0f14] border border-white/[0.06] text-center">
        <p className="text-[11px] text-zinc-300 font-semibold">Grounded Evidence Engine</p>
        <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">ChromaDB • Provenance v1.0</p>
      </div>
    </aside>
  );
};
