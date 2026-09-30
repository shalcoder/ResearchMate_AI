'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export interface ErrorStateProps {
  title?: string;
  reason?: string;
  onRetry?: () => void;
  actionLabel?: string;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Action Encountered An Issue',
  reason = 'Unable to complete the operation. Please verify network and backend services.',
  onRetry,
  actionLabel = 'Try Again',
  className,
}) => {
  return (
    <div
      className={cn(
        'worldlabs-card rounded-3xl p-8 sm:p-10 border border-rose-500/20 bg-rose-950/10 text-center max-w-md mx-auto my-6 space-y-4 flex flex-col items-center',
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-xl border border-rose-500/30">
        <AlertTriangle className="w-6 h-6" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>
        <p className="text-xs text-rose-200/80 leading-relaxed font-mono">{reason}</p>
      </div>

      {onRetry && (
        <div className="pt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onRetry}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
