'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserRole } from '../../types';
import { useAuth } from '../../lib/auth-context';
import { ArrowRight, Sparkles, GraduationCap, Microscope, BookOpen, Shield } from 'lucide-react';

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

const ROLES: { role: UserRole; title: string; desc: string; icon: React.ReactNode }[] = [
  {
    role: 'researcher',
    title: 'Researcher',
    desc: 'Semantic RAG, deep cross-paper synthesis & gap analysis',
    icon: <Microscope className="w-4 h-4 text-cyan-400" />,
  },
  {
    role: 'student',
    title: 'Student',
    desc: 'Coursework literature reviews, cited QA & study summaries',
    icon: <GraduationCap className="w-4 h-4 text-emerald-400" />,
  },
  {
    role: 'professor',
    title: 'Professor',
    desc: 'Student feedback, curated collections & advisor oversight',
    icon: <BookOpen className="w-4 h-4 text-amber-400" />,
  },
];

export const RegisterForm: React.FC = () => {
  const router = useRouter();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'researcher' as UserRole,
    department: 'Computer Science',
    institution: 'Research University',
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: FieldErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim() || !formData.email.includes('@')) newErrors.email = 'Valid academic email required';
    if (!formData.password || formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const user = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        department: formData.department,
        institution: formData.institution,
      });

      router.push(`/dashboard/${user.role}`);
    } catch (err: any) {
      setErrors({
        general: err?.response?.data?.detail || err?.message || 'Registration failed. Please check information.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="worldlabs-card rounded-3xl p-8 sm:p-10 relative overflow-hidden">
        {/* Subtle ambient light */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-56 h-56 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8 relative z-10">
          <div className="worldlabs-pill mb-4 border-indigo-500/20 bg-indigo-500/10 text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>New Academic Profile</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Create Account
          </h1>
          <p className="text-xs text-zinc-400 max-w-sm">
            Join ResearchMate AI to index literature, run grounded RAG analysis, and collaborate with your lab.
          </p>
        </div>

        {/* General Error Alert */}
        {errors.general && (
          <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5">
            <span className="text-sm">⚠️</span>
            <div className="leading-relaxed">{errors.general}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Dr. Fei-Fei Li"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl bg-[#09090d] border border-white/[0.08] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
            />
            {errors.name && <p className="text-[11px] text-rose-400 mt-1">{errors.name}</p>}
          </div>

          {/* Academic Email */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Academic Email
            </label>
            <input
              type="email"
              placeholder="feifei@stanford.edu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl bg-[#09090d] border border-white/[0.08] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
            />
            {errors.email && <p className="text-[11px] text-rose-400 mt-1">{errors.email}</p>}
          </div>

          {/* Academic Role Selection */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-2">
              Primary Academic Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: r.role })}
                  className={`p-3 rounded-2xl text-left border transition-all ${
                    formData.role === r.role
                      ? 'bg-white/[0.08] border-indigo-400/50 shadow-md shadow-indigo-500/10'
                      : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-xs font-semibold text-white">
                    {r.icon}
                    <span>{r.title}</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 line-clamp-2 leading-tight">
                    {r.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="At least 8 chars"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-[#09090d] border border-white/[0.08] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
              />
              {errors.password && <p className="text-[10px] text-rose-400 mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Repeat password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-[#09090d] border border-white/[0.08] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
              />
              {errors.confirmPassword && (
                <p className="text-[10px] text-rose-400 mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Department & Institution */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Department
              </label>
              <input
                type="text"
                placeholder="Computer Science"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#09090d] border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Institution
              </label>
              <input
                type="text"
                placeholder="Research University"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#09090d] border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full worldlabs-btn-primary mt-4 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Registering Account...
              </span>
            ) : (
              <span className="flex items-center gap-2 font-semibold">
                Create Account & Access Platform
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-zinc-400 relative z-10">
          Already registered?{' '}
          <Link
            href="/login"
            className="text-white hover:text-indigo-300 font-semibold underline underline-offset-4 transition-colors"
          >
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};
