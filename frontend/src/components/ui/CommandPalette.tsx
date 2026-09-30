'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  BookOpen,
  MessageSquareText,
  Columns,
  FolderKanban,
  Sparkles,
  Upload,
  ArrowRight,
  X
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  category: string;
  href?: string;
  action?: () => void;
  icon: React.ReactNode;
  shortcut?: string;
}

interface CommandPaletteProps {
  onOpenUpload?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ onOpenUpload }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const commands: CommandItem[] = [
    {
      id: 'cmd-papers',
      title: 'Open Paper Library',
      category: 'Research',
      href: '/papers',
      icon: <BookOpen className="w-4 h-4 text-cyan-400" />,
      shortcut: 'G P',
    },
    {
      id: 'cmd-upload',
      title: 'Ingest Research Paper (PDF)',
      category: 'Actions',
      action: () => {
        setIsOpen(false);
        onOpenUpload?.();
      },
      icon: <Upload className="w-4 h-4 text-indigo-400" />,
      shortcut: 'U',
    },
    {
      id: 'cmd-chat',
      title: 'Grounded Paper Chat (RAG 2.0)',
      category: 'AI Tools',
      href: '/chat',
      icon: <MessageSquareText className="w-4 h-4 text-emerald-400" />,
      shortcut: 'G C',
    },
    {
      id: 'cmd-compare',
      title: 'Compare Foundation Papers',
      category: 'Research',
      href: '/compare',
      icon: <Columns className="w-4 h-4 text-amber-400" />,
      shortcut: 'G X',
    },
    {
      id: 'cmd-search',
      title: 'Semantic Literature Search',
      category: 'Research',
      href: '/search',
      icon: <Search className="w-4 h-4 text-sky-400" />,
      shortcut: 'G S',
    },
    {
      id: 'cmd-projects',
      title: 'Research Workspaces & Dossiers',
      category: 'Organize',
      href: '/projects',
      icon: <FolderKanban className="w-4 h-4 text-purple-400" />,
      shortcut: 'G W',
    },
    {
      id: 'cmd-mamba',
      title: 'Inspect Paper: Mamba (Selective State Spaces)',
      category: 'Recent Literature',
      href: '/papers',
      icon: <Sparkles className="w-4 h-4 text-indigo-400" />,
    },
    {
      id: 'cmd-r1',
      title: 'Inspect Paper: DeepSeek-R1 (Reasoning RL)',
      category: 'Recent Literature',
      href: '/papers',
      icon: <Sparkles className="w-4 h-4 text-indigo-400" />,
    },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (item: CommandItem) => {
    setIsOpen(false);
    if (item.action) {
      item.action();
    } else if (item.href) {
      router.push(item.href);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="worldlabs-card rounded-3xl border border-white/20 max-w-xl w-full shadow-2xl overflow-hidden space-y-2">
        {/* Search header in modal */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10 gap-3">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search literature..."
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command list */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching commands found.
            </div>
          ) : (
            filteredCommands.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className="w-full p-2.5 rounded-xl hover:bg-white/10 text-left transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 group-hover:border-white/20">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">
                      {item.title}
                    </div>
                    <div className="text-[10px] text-slate-500">{item.category}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.shortcut && (
                    <span className="kbd text-[9px]">{item.shortcut}</span>
                  )}
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2.5 bg-black/40 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-500">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <span className="kbd">↑↓</span>
            <span>Select:</span>
            <span className="kbd">↵</span>
          </div>
          <div>
            <span>Close:</span> <span className="kbd">ESC</span>
          </div>
        </div>
      </div>
    </div>
  );
};
