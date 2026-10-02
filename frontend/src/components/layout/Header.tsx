'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { LogOut, Search, Menu, X } from 'lucide-react';
import { NAVIGATION_SECTIONS } from '../../lib/constants';

interface HeaderProps {
  onOpenCommand?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCommand }) => {
  const router = useRouter();
  const { user, logout, hasRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <div className="w-8 h-8 rounded-xl overflow-hidden border border-white/15 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform bg-[#09090d]">
              <img src="/icon.png" alt="ResearchMate AI" className="w-full h-full object-cover" />
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

        {/* User Actions */}
        <div className="flex items-center gap-3">
          {/* User Info Card */}
          {user ? (
            <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-white/[0.08]">
              <Link
                href="/profile"
                className="flex items-center gap-2.5 group hover:opacity-90 transition-opacity"
                title="View Academic Profile & Settings"
              >
                <div className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/[0.12] flex items-center justify-center text-white text-xs font-bold shadow-inner group-hover:border-white/30 group-hover:scale-105 transition-all">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden md:block text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">{user.name}</span>
                    <span className="worldlabs-pill py-0.5 px-2 text-[9px] border-white/[0.12] bg-white/[0.05]">
                      {user.role}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 block truncate max-w-[140px]">
                    {user.email}
                  </span>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-full border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="worldlabs-btn-secondary py-1.5 px-4 text-xs">
                Sign In
              </Link>
              <Link href="/register" className="worldlabs-btn-primary py-1.5 px-4 text-xs font-semibold">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bottom-0 z-50 bg-[#08080a]/95 backdrop-blur-xl border-t border-white/10 p-5 overflow-y-auto animate-in slide-in-from-top-2 duration-150">
          <div className="space-y-6">
            {/* Authenticated user profile summary in mobile drawer */}
            {user ? (
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white text-sm font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{user.name}</p>
                    <p className="text-[10px] text-zinc-400 capitalize">{user.role} • {user.email}</p>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-zinc-400 hover:text-rose-400"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-1/2 worldlabs-btn-secondary py-2 text-center text-xs"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-1/2 worldlabs-btn-primary py-2 text-center text-xs font-semibold"
                >
                  Sign Up
                </Link>
              </div>
            )}

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
