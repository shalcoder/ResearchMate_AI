'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'circular' | 'text';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  ...props
}) => {
  const variantStyles = {
    rectangular: 'rounded-2xl',
    circular: 'rounded-full',
    text: 'h-4 rounded-md',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-white/[0.04] border border-white/[0.04]',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
};
