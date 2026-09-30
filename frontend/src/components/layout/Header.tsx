'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { UserRole } from '../../types';
import { LogOut, Microscope, GraduationCap, BookOpen, Shield } from 'lucide-react';

const ROLE_ICONS: Record<UserRole, React.ReactNode> = {
  student: <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />,
  researcher: <Microscope className="w-3.5 h-3.5 text-cyan-400" />,
  professor: <BookOpen className="w-3.5 h-3.5 text-amber-400" />,
  admin: <Shield className="w-3.5 h-3.5 text-purple-400" />,
};

export const Header: React.FC = () => {
  const router = useRouter();
  const { user, switchRole, logout } = useAuth();

  const handleRoleSwitch = async (role: UserRole) => {
    await switchRole(role);
    router.push(`/dashboard/${role}`);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="h-16 border-b border-white/[0.08] bg-[#08080a]/90 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand & Workspace Title */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-white text-black font-extrabold flex items-center justify-center text-xs shadow-md shadow-white/20 group-hover:scale-105 transition-transform">
            R
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white tracking-tight leading-none">ResearchMate</h1>
              <span className="text-[10px] tracking-[0.14em] uppercase text-zinc-500 font-semibold">AI</span>
            </div>
            <p className="text-[10px] text-zinc-400 mt-0.5">Frontier Academic Workspace</p>
          </div>
        </Link>
      </div>

      {/* Role Switcher & User Actions */}
      <div className="flex items-center gap-4">
        {/* Quick Role Switcher */}
        <div className="hidden lg:flex items-center gap-1.5 p-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs">
          <span className="text-zinc-500 px-2.5 font-bold uppercase tracking-[0.12em] text-[10px]">
            Role:
          </span>
          {(['student', 'researcher', 'professor', 'admin'] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => handleRoleSwitch(r)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all capitalize flex items-center gap-1.5 ${
                user?.role === r
                  ? 'bg-white text-black shadow-sm font-bold'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              {user?.role === r && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
              {r}
            </button>
          ))}
        </div>

        {/* User Info Card */}
        {user ? (
          <div className="flex items-center gap-3 pl-3 border-l border-white/[0.08]">
            <div className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/[0.12] flex items-center justify-center text-white text-xs font-bold shadow-inner">
              {user.name.charAt(0)}
            </div>
            <div className="hidden sm:block text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-200">{user.name}</span>
                <span className="worldlabs-pill py-0.5 px-2 text-[9px] border-white/[0.12] bg-white/[0.05]">
                  {user.role}
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 block truncate max-w-[160px]">
                {user.email}
              </span>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-full border border-transparent hover:border-rose-500/20 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login" className="worldlabs-btn-secondary py-1.5 px-4 text-xs">
              Sign In
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
