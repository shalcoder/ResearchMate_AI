'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
  showShortcut?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  className,
  value,
  onChange,
  onClear,
  showShortcut = false,
  placeholder = 'Search papers, keywords, topics...',
  ...props
}) => {
  return (
    <div className="relative flex items-center w-full">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn(
          'w-full pl-10 pr-10 py-2.5 text-xs bg-black/40 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 transition-all',
          className
        )}
        {...props}
      />
      {value && onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white rounded-md transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      ) : showShortcut ? (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 kbd">
          ⌘K
        </span>
      ) : null}
    </div>
  );
};
