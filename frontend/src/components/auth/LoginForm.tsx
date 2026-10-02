'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { ArrowRight, Sparkles, KeyRound } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
            disabled={isSubmitting}
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

        {/* Register Footer Link */}
        <div className="mt-8 text-center text-xs text-zinc-400 relative z-10 border-t border-white/[0.08] pt-6">
          Don&apos;t have an academic account yet?{' '}
          <Link
            href="/register"
            className="text-white hover:text-indigo-300 font-semibold underline underline-offset-4 transition-colors ml-1"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};
