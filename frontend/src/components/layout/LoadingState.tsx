import React from 'react';

export const LoadingState: React.FC<{ message?: string }> = ({
  message = 'Verifying authentication and role permissions...',
}) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-slate-950/50 rounded-2xl border border-slate-800/80 backdrop-blur-md">
      <div className="relative flex items-center justify-center mb-6">
        <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
        <div className="absolute w-8 h-8 rounded-full border-4 border-cyan-400/30 border-b-cyan-400 animate-spin animate-reverse" />
      </div>
      <h3 className="text-lg font-semibold text-slate-200 mb-2">ResearchMate AI</h3>
      <p className="text-sm text-slate-400 max-w-sm">{message}</p>
    </div>
  );
};
