'use client';

import React, { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type PipelineStep = 'validating' | 'extracting' | 'chunking' | 'embedding' | 'summarizing' | 'complete';

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [venue, setVenue] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [researchArea, setResearchArea] = useState('Machine Learning & AI');
  const [generateSummary, setGenerateSummary] = useState(true);
  const [generateEmbeddings, setGenerateEmbeddings] = useState(true);
  const [extractGaps, setExtractGaps] = useState(true);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [currentStep, setCurrentStep] = useState<PipelineStep | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const uploadController = useRef<AbortController | null>(null);
  const stepTimerRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setCurrentStep(null);
      setUploadPercent(0);
    } else {
      uploadController.current?.abort();
      stepTimerRef.current.forEach(clearTimeout);
      stepTimerRef.current = [];
    }
  }, [isOpen]);

  useEffect(() => () => {
    uploadController.current?.abort();
    stepTimerRef.current.forEach(clearTimeout);
  }, []);

  if (!isOpen) return null;

  const handleClose = () => {
    if (isUploading) {
      if (!confirm('An ingestion pipeline is currently active. Are you sure you want to cancel?')) return;
    }
    uploadController.current?.abort();
    stepTimerRef.current.forEach(clearTimeout);
    setIsUploading(false);
    onClose();
  };

  const processFileSelection = (selected: File) => {
    if (!selected.name.toLowerCase().endsWith('.pdf') && !selected.name.toLowerCase().endsWith('.txt')) {
      setError('Please select a valid PDF (.pdf) or text (.txt) research paper.');
      return;
    }
    if (selected.size > 50 * 1024 * 1024) {
      setError('File size exceeds the 50MB maximum limit for single-paper ingestion.');
      return;
    }
    setError(null);
    setFile(selected);
    if (!title) {
      // Auto-extract title from file name
      const cleanName = selected.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      setTitle(cleanName);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select or drop a PDF research paper.');
      return;
    }

    setIsUploading(true);
    setUploadPercent(0);
    setCurrentStep('validating');
    setError(null);

    const controller = new AbortController();
    uploadController.current = controller;

    // Simulate animated pipeline stages smoothly so the researcher can observe each sub-phase
    const t1 = setTimeout(() => setCurrentStep('extracting'), 600);
    const t2 = setTimeout(() => setCurrentStep('chunking'), 1400);
    const t3 = setTimeout(() => setCurrentStep('embedding'), 2200);
    if (generateSummary) {
      const t4 = setTimeout(() => setCurrentStep('summarizing'), 3200);
      stepTimerRef.current.push(t4);
    }
    stepTimerRef.current.push(t1, t2, t3);

    const formData = new FormData();
    formData.append('file', file);
    if (title.trim()) formData.append('title', title.trim());
    if (venue.trim()) formData.append('venue', venue.trim());
    if (year.trim()) formData.append('publication_year', year.trim());

    try {
      const res = await api.upload('/papers/upload', formData, {
        signal: controller.signal,
        onProgress: ({ percent }) => {
          if (percent !== undefined) setUploadPercent(percent);
        },
        onUploadComplete: () => {
          setUploadPercent(100);
        },
      });

      if (res.status === 201 || res.status === 200) {
        setCurrentStep('complete');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 800);
      }
    } catch (err: any) {
      stepTimerRef.current.forEach(clearTimeout);
      if (err.name === 'AbortError') {
        setError('Ingestion canceled by user.');
      } else {
        setError(err.response?.data?.detail || err.message || 'Failed to ingest paper. Please check the file.');
      }
      setIsUploading(false);
      setCurrentStep(null);
    } finally {
      if (uploadController.current === controller) uploadController.current = null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="worldlabs-card rounded-3xl border border-white/15 max-w-2xl w-full p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle glow accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-5 mb-5 border-b border-white/10 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="worldlabs-pill text-[10px] text-indigo-300 border-indigo-500/30 bg-indigo-500/10">
                Scientific Ingestion Pipeline
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Ingest Research Literature</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Vectorize PDF chunks into ChromaDB and generate structured academic grounding.
            </p>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close upload dialog"
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Live Pipeline Visualizer */}
        {isUploading && (
          <div className="mb-6 p-5 rounded-2xl bg-black/50 border border-white/10 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                Autonomous Ingestion in Progress
              </span>
              <span className="text-slate-400 font-mono">{uploadPercent}% uploaded</span>
            </div>

            {/* Stages indicator */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
              <div className={`p-2 rounded-lg border text-center transition-all ${
                currentStep ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300 font-semibold' : 'bg-white/5 border-white/5 text-slate-500'
              }`}>
                <span>✓ Validating</span>
              </div>
              <div className={`p-2 rounded-lg border text-center transition-all ${
                ['extracting', 'chunking', 'embedding', 'summarizing', 'complete'].includes(currentStep || '')
                  ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300 font-semibold'
                  : 'bg-white/5 border-white/5 text-slate-500'
              }`}>
                <span>✓ OCR Extract</span>
              </div>
              <div className={`p-2 rounded-lg border text-center transition-all ${
                ['chunking', 'embedding', 'summarizing', 'complete'].includes(currentStep || '')
                  ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300 font-semibold'
                  : 'bg-white/5 border-white/5 text-slate-500'
              }`}>
                <span>✓ Semantic Chunks</span>
              </div>
              <div className={`p-2 rounded-lg border text-center transition-all ${
                ['embedding', 'summarizing', 'complete'].includes(currentStep || '')
                  ? 'bg-sky-500/15 border-sky-500/40 text-sky-300 font-semibold'
                  : 'bg-white/5 border-white/5 text-slate-500'
              }`}>
                <span>● Embeddings</span>
              </div>
              <div className={`p-2 rounded-lg border text-center transition-all ${
                currentStep === 'complete'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold'
                  : currentStep === 'summarizing'
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-semibold'
                  : 'bg-white/5 border-white/5 text-slate-500'
              }`}>
                <span>{currentStep === 'complete' ? '★ Ready' : 'AI Analysis'}</span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Drag & Drop PDF Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative rounded-2xl border-2 border-dashed p-6 text-center transition-all cursor-pointer ${
              isDragOver
                ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]'
                : file
                ? 'border-emerald-500/40 bg-emerald-500/5'
                : 'border-white/15 bg-black/30 hover:border-white/30'
            }`}
          >
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={(e) => e.target.files && e.target.files[0] && processFileSelection(e.target.files[0])}
              disabled={isUploading}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg">
                  ✓
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-white">{file.name}</div>
                  <div className="text-[11px] text-slate-400">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for ingestion
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto text-xl">
                  📁
                </div>
                <div className="text-xs font-semibold text-white">
                  Drop scientific PDF here, or <span className="text-indigo-400 underline">browse files</span>
                </div>
                <p className="text-[11px] text-slate-500">Supports PDF, text documents up to 50MB</p>
              </div>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Paper Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isUploading}
                placeholder="e.g. FlashAttention: Fast and Memory-Efficient Exact Attention"
                className="w-full px-3.5 py-2.5 text-xs bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Conference / Journal / Venue
              </label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                disabled={isUploading}
                placeholder="e.g. NeurIPS, ICML, CVPR, ArXiv"
                className="w-full px-3.5 py-2.5 text-xs bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Publication Year
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                disabled={isUploading}
                placeholder="2025"
                className="w-full px-3.5 py-2.5 text-xs bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Autonomous Processing Options */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Autonomous Ingestion Modules
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={generateEmbeddings}
                  onChange={(e) => setGenerateEmbeddings(e.target.checked)}
                  disabled={isUploading}
                  className="rounded border-white/20 bg-black/50 text-indigo-600 focus:ring-0"
                />
                <span>ChromaDB Vectors</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={generateSummary}
                  onChange={(e) => setGenerateSummary(e.target.checked)}
                  disabled={isUploading}
                  className="rounded border-white/20 bg-black/50 text-indigo-600 focus:ring-0"
                />
                <span>5-Point Summary</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={extractGaps}
                  onChange={(e) => setExtractGaps(e.target.checked)}
                  disabled={isUploading}
                  className="rounded border-white/20 bg-black/50 text-indigo-600 focus:ring-0"
                />
                <span>Research Gaps</span>
              </label>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="worldlabs-btn-secondary text-xs py-2 px-4"
            >
              {isUploading ? 'Cancel Ingestion' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isUploading || !file}
              className="worldlabs-btn-primary text-xs py-2.5 px-6 font-semibold disabled:opacity-50 flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-black animate-ping" />
                  Processing Ingestion Pipeline...
                </>
              ) : (
                'Start Ingestion Pipeline'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
