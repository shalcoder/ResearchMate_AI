'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserRole } from '../../types';
import { useAuth } from '../../lib/auth-context';

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
  general?: string;
}

const ROLE_OPTIONS: { role: UserRole; title: string; desc: string; icon: string }[] = [
  {
    role: 'student',
    title: 'Student',
    desc: 'Literature reviews, coursework paper QA, notes & summaries',
    icon: '🎓',
  },
  {
    role: 'researcher',
    title: 'Researcher',
    desc: 'Semantic search, paper matrix comparison & gap analysis',
    icon: '🔬',
  },
  {
    role: 'professor',
    title: 'Professor / Faculty',
    desc: 'Supervise student reviews, curate collections & feedback',
    icon: '📚',
  },
  {
    role: 'admin',
    title: 'Administrator',
    desc: 'System health, governance, user management & AI analytics',
    icon: '🛡️',
  },
];

export const RegisterForm: React.FC = () => {
  const router = useRouter();
  const { switchRole } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' as UserRole,
    department: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Client-side Validation Logic
  const validateField = (fieldName: string, value: string): string => {
    switch (fieldName) {
      case 'name':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        return '';
      case 'email':
        if (!value.trim()) return 'Email address is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/(?=.*[A-Za-z])(?=.*\d)/.test(value))
          return 'Password must contain at least one letter and one number';
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time error clearing/validation
    if (errors[name as keyof FieldErrors]) {
      const errorMsg = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const nameError = validateField('name', formData.name);
    const emailError = validateField('email', formData.email);
    const passwordError = validateField('password', formData.password);
    const confirmPasswordError = validateField('confirmPassword', formData.confirmPassword);

    const newErrors: FieldErrors = {
      name: nameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    };

    setErrors(newErrors);

    const hasError = Object.values(newErrors).some((err) => !!err);
    if (hasError) return;

    setIsSubmitting(true);

    // Simulate API registration request
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      switchRole(formData.role);

      setTimeout(() => {
        router.push(`/dashboard/${formData.role}`);
      }, 1200);
    }, 800);
  };

  return (
    <div className="w-full max-w-lg mx-auto p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
      {/* Form Header */}
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 mx-auto flex items-center justify-center text-white font-bold text-xl mb-3 shadow-lg shadow-indigo-500/25">
          R
        </div>
        <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Create Research Account</h2>
        <p className="text-xs text-slate-400 mt-1">
          Join ResearchMate AI to store papers, generate summaries & grounded answers
        </p>
      </div>

      {submitSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-3 animate-pulse">
          <span className="text-lg">✅</span>
          <span>Registration successful! Directing to your {formData.role} workspace...</span>
        </div>
      )}

      {errors.general && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
          ⚠️ {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name *</label>
          <input
            type="text"
            name="name"
            placeholder="e.g., Yashwanth Marimuthu"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-colors ${
              errors.name
                ? 'border-rose-500/80 focus:border-rose-400'
                : 'border-slate-800 focus:border-indigo-500'
            }`}
          />
          {errors.name && <p className="text-[11px] text-rose-400 mt-1 font-medium">{errors.name}</p>}
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Academic Email *</label>
          <input
            type="email"
            name="email"
            placeholder="e.g., yashwanth@researchmate.ai"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-colors ${
              errors.email
                ? 'border-rose-500/80 focus:border-rose-400'
                : 'border-slate-800 focus:border-indigo-500'
            }`}
          />
          {errors.email && <p className="text-[11px] text-rose-400 mt-1 font-medium">{errors.email}</p>}
        </div>

        {/* Password & Confirm Password Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Min 8 characters"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-colors ${
                  errors.password
                    ? 'border-rose-500/80 focus:border-rose-400'
                    : 'border-slate-800 focus:border-indigo-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-[11px] text-slate-400 hover:text-slate-200"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-rose-400 mt-1 font-medium leading-tight">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm Password *</label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-colors ${
                errors.confirmPassword
                  ? 'border-rose-500/80 focus:border-rose-400'
                  : 'border-slate-800 focus:border-indigo-500'
              }`}
            />
            {errors.confirmPassword && (
              <p className="text-[11px] text-rose-400 mt-1 font-medium">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        {/* Role Selection Grid */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">Select Your Primary Role *</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {ROLE_OPTIONS.map((item) => {
              const isSelected = formData.role === item.role;
              return (
                <div
                  key={item.role}
                  onClick={() => handleRoleSelect(item.role)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-600/15 border-indigo-500 text-slate-100 shadow-md shadow-indigo-600/10'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{item.icon}</span>
                    <span className="text-xs font-bold">{item.title}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department / Institution (Optional) */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Department / Institution <span className="text-slate-500 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            name="department"
            placeholder="e.g., Computer Science & Engineering"
            value={formData.department}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || submitSuccess}
          className="w-full py-3 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-500 rounded-xl transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            'Complete Registration'
          )}
        </button>
      </form>

      {/* Switch to Login Link */}
      <div className="text-center mt-6 pt-4 border-t border-slate-800/80">
        <p className="text-xs text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-400 font-semibold hover:underline">
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
};
