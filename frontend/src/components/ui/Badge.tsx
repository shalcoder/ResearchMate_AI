'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'purple';
  size?: 'xs' | 'sm';
  shimmer?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'xs',
  shimmer = false,
  children,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-white/[0.04] text-slate-300 border-white/[0.12]',
    indigo: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/25',
    emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
    amber: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
    rose: 'bg-rose-500/10 text-rose-300 border-rose-500/25',
    sky: 'bg-sky-500/10 text-sky-300 border-sky-500/25',
    purple: 'bg-purple-500/10 text-purple-300 border-purple-500/25',
  };

  const sizeStyles = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider rounded-full border backdrop-blur-sm',
        shimmer && 'worldlabs-pill',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
