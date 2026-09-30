'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'secondary',
      size = 'sm',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      xs: 'px-2.5 py-1 text-[11px] rounded-lg gap-1.5',
      sm: 'px-3.5 py-1.5 text-xs rounded-xl gap-2',
      md: 'px-4 py-2 text-xs font-semibold rounded-full gap-2',
      lg: 'px-6 py-2.5 text-sm font-semibold rounded-full gap-2.5',
    };

    const variantClasses = {
      primary:
        'bg-white text-black hover:bg-slate-100 shadow-md shadow-white/10 active:scale-[0.98]',
      secondary:
        'bg-white/[0.04] text-white hover:bg-white/[0.08] border border-white/[0.12] hover:border-white/[0.22] active:scale-[0.98]',
      outline:
        'bg-transparent text-slate-300 hover:text-white border border-white/[0.15] hover:border-white/[0.3] active:scale-[0.98]',
      ghost:
        'bg-transparent text-slate-400 hover:text-white hover:bg-white/[0.06]',
      danger:
        'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/50',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-200 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
