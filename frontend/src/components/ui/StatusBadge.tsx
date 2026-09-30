'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: 'ready' | 'processing' | 'indexed' | 'failed' | 'live';
  label?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  className,
  ...props
}) => {
  const config = {
    ready: {
      color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
      dot: 'bg-emerald-400',
      pulse: false,
      text: label || 'Ready',
    },
    live: {
      color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
      dot: 'bg-emerald-400',
      pulse: true,
      text: label || 'Live',
    },
    indexed: {
      color: 'bg-sky-500/10 text-sky-300 border-sky-500/25',
      dot: 'bg-sky-400',
      pulse: false,
      text: label || 'ChromaDB Indexed',
    },
    processing: {
      color: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
      dot: 'bg-amber-400',
      pulse: true,
      text: label || 'Processing',
    },
    failed: {
      color: 'bg-rose-500/10 text-rose-300 border-rose-500/25',
      dot: 'bg-rose-400',
      pulse: false,
      text: label || 'Failed',
    },
  }[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border',
        config.color,
        className
      )}
      {...props}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full',
          config.dot,
          config.pulse && 'animate-ping'
        )}
      />
      <span>{config.text}</span>
    </span>
  );
};
