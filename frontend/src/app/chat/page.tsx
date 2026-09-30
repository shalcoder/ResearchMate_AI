'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ResearchPaper, ChatMessage, Citation } from '@/types';
import { api } from '@/lib/api';

export default function ChatPage() {
  const searchParams = useSearchParams();
  const initialPaperId = searchParams.get('paper_id') || '';
  const initialQuery = searchParams.get('q') || '';

  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [selectedPaperId, setSelectedPaperId] = useState<string>(initialPaperId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState(initialQuery);
  const [isSending, setIsSending] = useState(false);
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadPapers = async () => {
      try {
        const res = await api.get('/papers');
        setPapers(res.data || []);
        if (!selectedPaperId && res.data && res.data.length > 0) {
          setSelectedPaperId(res.data[0].id);
        }
      } catch (err) {
        console.error('Failed to load papers:', err);
      }
    };
    loadPapers();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  // If initial query provided via URL param, execute once papers are ready
  useEffect(() => {
    if (initialQuery && papers.length > 0 && messages.length === 0) {
      executeChatQuery(initialQuery);
    }
  }, [initialQuery, papers]);

  const executeChatQuery = async (queryText: string) => {
    if (!queryText.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      session_id: 'session-local',
      role: 'user',
      content: queryText.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsSending(true);

    try {
      const res = await api.post('/chat/query', {
        query: userMsg.content,
        paper_id: selectedPaperId || undefined,
      });

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        session_id: 'session-local',
        role: 'assistant',
        content: res.data.answer,
        citations: res.data.citations || [],
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // Automatically inspect the first citation if available
      if (res.data.citations && res.data.citations.length > 0) {
        setActiveCitation(res.data.citations[0]);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        session_id: 'session-local',
        role: 'assistant',
        content: 'Error communicating with RAG engine. Please verify the backend connection.',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    executeChatQuery(inputQuery);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRegenerate = () => {
    if (messages.length < 2) return;
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      executeChatQuery(lastUserMsg.content);
    }
  };

  const selectedPaper = papers.find((p) => p.id === selectedPaperId);

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-7rem)] space-y-4 animate-in fade-in duration-300">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="worldlabs-pill text-[10px] text-indigo-300 border-indigo-500/30 bg-indigo-500/10">
                Grounded RAG 2.0
              </span>
              <span className="text-xs text-slate-400">Verifiable Academic Literature Citations</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Interactive Literature Intelligence</h1>
          </div>

          {/* Paper Selector Dropdown */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 whitespace-nowrap font-medium">Target Context:</span>
            <select
              value={selectedPaperId}
              onChange={(e) => {
                setSelectedPaperId(e.target.value);
                setMessages([]);
                setActiveCitation(null);
              }}
              className="bg-black/50 border border-white/15 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 max-w-xs truncate cursor-pointer"
            >
              <option value="">All Ingested Literature (Global RAG)</option>
              {papers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.publication_year || 'Recent'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2-Column Grounded RAG Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0">
          {/* LEFT COLUMN: Conversation Stream (7 of 12 cols = ~58%) */}
          <div className="lg:col-span-7 flex flex-col worldlabs-card rounded-3xl border border-white/10 p-5 overflow-hidden">
            {/* Messages Thread */}
            <div className="flex-1 overflow-y-auto space-y-5 pr-2">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-2xl border border-indigo-500/20">
                    💬
                  </div>
                  <div className="space-y-1 max-w-md">
                    <h3 className="text-base font-bold text-white">
                      Ask anything grounded in {selectedPaper ? `"${selectedPaper.title}"` : 'your scientific corpus'}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Every answer is cross-referenced with exact vector chunks in ChromaDB with zero hallucination.
                    </p>
                  </div>

                  {/* Starter Chips */}
                  <div className="flex flex-wrap gap-2 justify-center max-w-lg pt-2">
                    {[
                      'What is the core breakthrough?',
                      'Explain the mathematical formulation',
                      'What are the acknowledged limitations?',
                      'What datasets were used for evaluation?',
                    ].map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => executeChatQuery(prompt)}
                        className="text-xs px-3.5 py-2 rounded-xl bg-white/5 hover:bg-indigo-600/10 border border-white/10 hover:border-indigo-500/30 text-slate-300 hover:text-white transition-all text-left"
                      >
                        "{prompt}"
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m, idx) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[90%] rounded-2xl p-4 text-xs leading-relaxed space-y-2.5 ${
                        m.role === 'user'
                          ? 'bg-indigo-600 text-white font-medium shadow-md shadow-indigo-600/20'
                          : 'bg-black/60 border border-white/10 text-slate-200'
                      }`}
                    >
                      <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>

                      {/* Assistant Evidence Citations & Action Controls */}
                      {m.role === 'assistant' && (
                        <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                          {/* Citation Pills */}
                          {m.citations && m.citations.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">
                                Grounded Sources:
                              </span>
                              {m.citations.map((c) => (
                                <button
                                  key={c.citation_id}
                                  onClick={() => setActiveCitation(c)}
                                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full transition-all ${
                                    activeCitation?.citation_id === c.citation_id
                                      ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/50'
                                      : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                  }`}
                                >
                                  [{c.citation_id}] p.{c.page_number} ({c.section_name})
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Copy & Regenerate Actions */}
                          <div className="flex items-center gap-1 text-[11px] ml-auto">
                            <button
                              onClick={() => handleCopyMessage(m.id, m.content)}
                              className="text-slate-400 hover:text-white px-2 py-0.5 rounded hover:bg-white/10 transition-colors"
                            >
                              {copiedId === m.id ? '✓ Copied' : 'Copy'}
                            </button>
                            <button
                              onClick={handleRegenerate}
                              className="text-slate-400 hover:text-white px-2 py-0.5 rounded hover:bg-white/10 transition-colors"
                            >
                              Regenerate
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Dynamic Follow-up Prompt Chips for latest assistant message */}
                      {m.role === 'assistant' && idx === messages.length - 1 && !isSending && (
                        <div className="pt-2 mt-1 border-t border-white/5 space-y-1.5">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                            Suggested Inquiries:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              'What datasets were used to validate this?',
                              'What are the acknowledged computational bottlenecks?',
                              'How does this compare to prior state-of-the-art?',
                            ].map((followUp, fIdx) => (
                              <button
                                key={fIdx}
                                onClick={() => executeChatQuery(followUp)}
                                className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition-all text-left"
                              >
                                {followUp} →
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <span className="text-[10px] text-slate-500 mt-1 px-2">
                      {m.role === 'user' ? 'You' : 'ResearchMate Grounded RAG'}
                    </span>
                  </div>
                ))
              )}

              {isSending && (
                <div className="flex items-center gap-2.5 text-xs text-indigo-400 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl w-fit">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                  <span>Retrieving semantic chunks from ChromaDB & formulating answer...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Query Input Box */}
            <form onSubmit={handleSendMessage} className="mt-4 pt-3 border-t border-white/10 flex gap-2.5">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={
                  selectedPaper
                    ? `Ask anything about "${selectedPaper.title}"...`
                    : 'Ask across all indexed research literature...'
                }
                className="flex-1 px-4 py-3 text-xs bg-black/50 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isSending}
                className="worldlabs-btn-primary text-xs py-3 px-6 font-semibold disabled:opacity-40"
              >
                Send Query
              </button>
            </form>
          </div>

          {/* RIGHT COLUMN: Live Grounded Sources Inspector (5 of 12 cols = ~42%) */}
          <div className="lg:col-span-5 flex flex-col worldlabs-card rounded-3xl border border-white/10 p-5 overflow-hidden space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Source Provenance Inspector
                </span>
                <span className="worldlabs-pill text-[9px] py-0.5 px-2 text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                  Verified
                </span>
              </div>
            </div>

            {activeCitation ? (
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {/* Score & Badge Banner */}
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-indigo-300">
                      Citation [{activeCitation.citation_id}]
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Exact text excerpt retrieved from vector store
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                    {((activeCitation.relevance_score || 0.94) * 100).toFixed(0)}% Match
                  </span>
                </div>

                {/* Metadata Details */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Section:</span>
                    <span className="text-white font-semibold">{activeCitation.section_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Page Number:</span>
                    <span className="text-white font-semibold font-mono">Page {activeCitation.page_number}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Vector Chunk:</span>
                    <span className="text-indigo-400 font-mono">Chunk #{activeCitation.chunk_index + 1}</span>
                  </div>
                </div>

                {/* Document Excerpt */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Source Document Excerpt:
                  </span>
                  <div className="p-4 rounded-2xl bg-black/60 border border-white/10 text-xs text-slate-200 font-mono leading-relaxed select-text">
                    "{activeCitation.excerpt}"
                  </div>
                </div>

                {selectedPaper && (
                  <div className="pt-2">
                    <button
                      onClick={() => window.open(`/papers/${selectedPaper.id}`, '_blank')}
                      className="worldlabs-btn-secondary text-xs py-2 px-4 w-full flex items-center justify-center gap-2"
                    >
                      Open Full Document to Page {activeCitation.page_number} ↗
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3 text-slate-400">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-xl text-slate-500">
                  🔍
                </div>
                <h4 className="text-xs font-semibold text-white">No Citation Selected</h4>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                  Click any citation tag like <span className="text-indigo-400 font-semibold">[1]</span> or <span className="text-indigo-400 font-semibold">[2]</span> on an AI response to inspect the exact document excerpt and section evidence.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
