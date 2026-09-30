'use client';

import React from 'react';
import Link from 'next/link';
import { LoginForm } from '../../../components/auth/LoginForm';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen spatial-mesh-bg flex flex-col justify-between p-6 relative overflow-hidden">
      {/* Top minimal navigation */}
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between py-2 relative z-20">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-white text-black font-extrabold flex items-center justify-center text-sm shadow-md shadow-white/10 group-hover:scale-105 transition-transform">
            R
          </div>
          <span className="font-bold tracking-tight text-white text-base">
            ResearchMate <span className="text-zinc-500 font-normal">AI</span>
          </span>
        </Link>

        <Link
          href="/"
          className="worldlabs-btn-secondary text-xs py-2 px-4 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Main Form Center */}
      <div className="w-full my-auto py-12 relative z-10">
        <LoginForm />
      </div>

      {/* Bottom minimal footer */}
      <div className="w-full max-w-7xl mx-auto text-center py-4 text-xs text-zinc-500 relative z-20">
        © 2026 ResearchMate AI • Grounded Multimodal Academic Workspace
      </div>
    </div>
  );
}
