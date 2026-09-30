'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { UserRole } from '../../types';
import { LogOut, Microscope, GraduationCap, BookOpen, Shield, Search, Menu, X } from 'lucide-react';
import { NAVIGATION_SECTIONS } from '../../lib/constants';

interface HeaderProps {
  onOpenCommand?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCommand }) => {
  const router = useRouter();
  const { user, switchRole, logout, hasRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleRoleSwitch = async (role: UserRole) => {
    await switchRole(role);
    router.push(`/dashboard/${role}`);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      <header className="h-16 border-b border-white/[0.08] bg-[#08080a]/90 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        {/* Brand & Mobile Hamburger */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-white text-black font-extrabold flex items-center justify-center text-xs shadow-md shadow-white/20 group-hover:scale-105 transition-transform">
              R
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-bold text-white tracking-tight leading-none">ResearchMate</h1>
                <span className="text-[10px] tracking-[0.14em] uppercase text-zinc-500 font-semibold">AI</span>
              </div>
              <p className="text-[10px] text-zinc-400 hidden sm:block">Frontier Academic Workspace</p>
            </div>
          </Link>

          {/* Quick Command Trigger in Top Bar */}
          <button
            onClick={onOpenCommand}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-slate-400 hover:text-slate-200 transition-colors ml-4 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[11px]">Command Menu</span>
            <span className="kbd text-[9px] ml-1">⌘K</span>
          </button>
        </div>

        {/* Role Switcher & User Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Role Switcher (Tablet & Desktop) */}
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
            <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-white/[0.08]">
              <div className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/[0.12] flex items-center justify-center text-white text-xs font-bold shadow-inner">
                {user.name.charAt(0)}
              </div>
              <div className="hidden md:block text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-zinc-200">{user.name}</span>
                  <span className="worldlabs-pill py-0.5 px-2 text-[9px] border-white/[0.12] bg-white/[0.05]">
                    {user.role}
                  </span>
                </div>
                <span className="text-[11px] text-zinc-400 block truncate max-w-[140px]">
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

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bottom-0 z-50 bg-[#08080a]/95 backdrop-blur-xl border-t border-white/10 p-5 overflow-y-auto animate-in slide-in-from-top-2 duration-150">
          <div className="space-y-6">
            {/* Quick role switcher for mobile */}
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Switch Academic Role
              </span>
              <div className="grid grid-cols-2 gap-2">
                {(['student', 'researcher', 'professor', 'admin'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      handleRoleSwitch(r);
                      setMobileMenuOpen(false);
                    }}
                    className={`p-2 rounded-xl text-xs font-medium capitalize text-center transition-all ${
                      user?.role === r
                        ? 'bg-white text-black font-bold'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu links */}
            <div className="space-y-4">
              {NAVIGATION_SECTIONS.map((section) => {
                const visibleItems = section.items.filter((item) => hasRole(item.roles));
                if (visibleItems.length === 0) return null;

                return (
                  <div key={section.sectionTitle} className="space-y-1">
                    <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      {section.sectionTitle}
                    </p>
                    {visibleItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-xs font-medium text-slate-200"
                      >
                        <span>{item.title}</span>
                        {item.badge && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
