'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { UserRole } from '../../types';
import { ArrowRight, Sparkles, Shield, User, GraduationCap, Microscope, BookOpen, KeyRound } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const { login, quickLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeQuickRole, setActiveQuickRole] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide both academic email and password.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const user = await login({ email: email.trim(), password });
      router.push(`/dashboard/${user.role}`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    setError('');
    setActiveQuickRole(role);
    try {
      const user = await quickLogin(role);
      router.push(`/dashboard/${user.role}`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || `Failed to sign in as ${role}`);
    } finally {
      setActiveQuickRole(null);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Outer Glow Card Container */}
      <div className="worldlabs-card rounded-3xl p-8 sm:p-10 relative overflow-hidden">
        {/* Subtle top ambient glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8 relative z-10">
          <div className="worldlabs-pill mb-4 border-indigo-500/20 bg-indigo-500/10 text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>ResearchMate AI Platform</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Sign In
          </h1>
          <p className="text-xs text-zinc-400 max-w-xs">
            Authenticate to access your indexed literature, grounded RAG sessions, and collaboration workspaces.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5">
            <span className="text-sm">⚠️</span>
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Academic Email
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="researcher@researchmate.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#09090d] border border-white/[0.08] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-zinc-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-zinc-400 hover:text-white transition-colors"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#09090d] border border-white/[0.08] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !!activeQuickRole}
            className="w-full worldlabs-btn-primary mt-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Signing In...
              </span>
            ) : (
              <span className="flex items-center gap-2 font-semibold">
                Sign In with Credentials
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-8 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/[0.08]" />
          </div>
          <span className="relative z-10 px-3 bg-[#111116] text-[10px] uppercase font-bold tracking-[0.16em] text-zinc-500">
            Instant Demo Access
          </span>
        </div>

        {/* 1-Click Fast Role Sign-in Grid */}
        <div className="grid grid-cols-2 gap-2.5 relative z-10">
          <button
            type="button"
            onClick={() => handleQuickLogin('researcher')}
            disabled={!!activeQuickRole || isSubmitting}
            className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-indigo-500/40 text-left transition-all group"
          >
            <div className="flex items-center gap-2 mb-1 text-xs font-semibold text-zinc-200 group-hover:text-white">
              <Microscope className="w-3.5 h-3.5 text-cyan-400" />
              <span>Researcher</span>
            </div>
            <p className="text-[10px] text-zinc-400">RAG Chat & Syntheses</p>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('student')}
            disabled={!!activeQuickRole || isSubmitting}
            className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-emerald-500/40 text-left transition-all group"
          >
            <div className="flex items-center gap-2 mb-1 text-xs font-semibold text-zinc-200 group-hover:text-white">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Student</span>
            </div>
            <p className="text-[10px] text-zinc-400">Papers, Notes & QA</p>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('professor')}
            disabled={!!activeQuickRole || isSubmitting}
            className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-amber-500/40 text-left transition-all group"
          >
            <div className="flex items-center gap-2 mb-1 text-xs font-semibold text-zinc-200 group-hover:text-white">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Professor</span>
            </div>
            <p className="text-[10px] text-zinc-400">Reviews & Oversight</p>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('admin')}
            disabled={!!activeQuickRole || isSubmitting}
            className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-purple-500/40 text-left transition-all group"
          >
            <div className="flex items-center gap-2 mb-1 text-xs font-semibold text-zinc-200 group-hover:text-white">
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              <span>Admin</span>
            </div>
            <p className="text-[10px] text-zinc-400">System Governance</p>
          </button>
        </div>

        {/* Register Footer Link */}
        <div className="mt-8 text-center text-xs text-zinc-400 relative z-10">
          Need a new academic account?{' '}
          <Link
            href="/register"
            className="text-white hover:text-indigo-300 font-semibold underline underline-offset-4 transition-colors"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};
