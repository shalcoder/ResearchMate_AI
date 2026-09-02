'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ResearchPaper, ChatSession, ChatMessage, Citation } from '@/types';
import { api } from '@/lib/api';

export default function ChatPage() {
  const searchParams = useSearchParams();
  const initialPaperId = searchParams.get('paper_id') || '';

  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [selectedPaperId, setSelectedPaperId] = useState<string>(initialPaperId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
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
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      session_id: 'session-local',
      role: 'user',
      content: inputQuery.trim(),
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

  const selectedPaper = papers.find((p) => p.id === selectedPaperId);

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)] space-y-4">
        {/* Header & Paper Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Grounded Paper Chat</h1>
            <p className="text-xs text-slate-400">
              Query scientific literature with verifiable chunk citations and zero hallucination.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 whitespace-nowrap">Target Paper:</span>
            <select
              value={selectedPaperId}
              onChange={(e) => {
                setSelectedPaperId(e.target.value);
                setMessages([]);
              }}
              className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 max-w-xs truncate"
            >
              <option value="">All Uploaded Papers</option>
              {papers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Chat Stream & Citations Inspector */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
          {/* Messages Panel */}
          <div className="lg:col-span-2 flex flex-col bg-slate-900/60 border border-slate-800 rounded-2xl p-4 overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-3 text-lg">
                    💬
                  </div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-1">
                    Ask anything about {selectedPaper ? `"${selectedPaper.title}"` : 'your research library'}
                  </h3>
                  <p className="text-xs max-w-sm mb-4">
                    e.g., "What dataset was used for evaluation?", "What are the core limitations?", "Summarize the proposed architecture."
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[
                      'What is the core breakthrough?',
                      'Explain the methodology',
                      'What are the limitations?',
                    ].map((s) => (
                      <button
                        key={s}
                        onClick={() => setInputQuery(s)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-indigo-600 text-white font-medium'
                          : 'bg-slate-950/80 border border-slate-800/80 text-slate-200'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{m.content}</div>

                      {/* Citations badges for assistant */}
                      {m.role === 'assistant' && m.citations && m.citations.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-slate-800/60 flex flex-wrap gap-1.5 items-center">
                          <span className="text-[10px] uppercase font-bold text-slate-500 mr-1">
                            Sources:
                          </span>
                          {m.citations.map((c) => (
                            <button
                              key={c.citation_id}
                              onClick={() => setActiveCitation(c)}
                              className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 transition-colors"
                            >
                              {c.citation_id} p.{c.page_number} ({c.section_name})
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 px-1">
                      {m.role === 'user' ? 'You' : 'ResearchMate AI'}
                    </span>
                  </div>
                ))
              )}
              {isSending && (
                <div className="flex items-center gap-2 text-xs text-indigo-400 p-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                  Retrieving grounded chunks & formulating answer...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input form */}
            <form onSubmit={handleSendMessage} className="mt-3 pt-3 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={selectedPaper ? `Ask about ${selectedPaper.title}...` : 'Ask a research question...'}
                className="flex-1 px-4 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isSending}
                className="px-5 py-2.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
              >
                Send
              </button>
            </form>
          </div>

          {/* Source Citation Inspector Drawer */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col overflow-hidden">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800">
              Verified Source Evidence
            </h3>

            {activeCitation ? (
              <div className="mt-3 flex-1 overflow-y-auto space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                    Citation {activeCitation.citation_id}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Relevance: {((activeCitation.relevance_score || 0.9) * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                  <div className="text-slate-400">
                    Section: <span className="text-white font-medium">{activeCitation.section_name}</span>
                  </div>
                  <div className="text-slate-400">
                    Page Number: <span className="text-white font-medium">{activeCitation.page_number}</span>
                  </div>
                  <div className="text-slate-400">
                    Chunk Index: <span className="text-white font-medium">#{activeCitation.chunk_index + 1}</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-slate-400 font-medium block mb-1">
                    Document Excerpt:
                  </span>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed">
                    {activeCitation.excerpt}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-slate-500 text-xs">
                Click any citation tag like [1] or [2] on an AI response to inspect the exact source text and page evidence.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
