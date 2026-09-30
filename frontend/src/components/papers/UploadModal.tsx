'use client';

import React, { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [venue, setVenue] = useState('');
  const [year, setYear] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState<'uploading' | 'processing' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const uploadController = useRef<AbortController | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
    } else {
      uploadController.current?.abort();
    }
  }, [isOpen]);

  useEffect(() => () => uploadController.current?.abort(), []);

  if (!isOpen) return null;

  const handleClose = () => {
    uploadController.current?.abort();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF research paper to upload.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStage('uploading');
    setError(null);
    const controller = new AbortController();
    uploadController.current = controller;

    const formData = new FormData();
    formData.append('file', file);
    if (title.trim()) formData.append('title', title.trim());
    if (venue.trim()) formData.append('venue', venue.trim());
    if (year.trim()) formData.append('publication_year', year.trim());

    try {
      const res = await api.upload('/papers/upload', formData, {
        signal: controller.signal,
        onProgress: ({ percent }) => {
          if (percent !== undefined) setUploadProgress(percent);
        },
        onUploadComplete: () => {
          setUploadProgress(100);
          setUploadStage('processing');
        },
      });
      if (res.status === 201 || res.status === 200) {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Upload canceled. If the file was already sent, server-side processing may continue.');
      } else {
        setError(err.response?.data?.detail || err.message || 'Failed to upload paper. Please check the file.');
      }
    } finally {
      if (uploadController.current === controller) uploadController.current = null;
      setIsUploading(false);
      setUploadStage(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white">Upload Research Paper</h2>
          <button onClick={handleClose} aria-label="Close upload dialog" className="text-slate-400 hover:text-white transition-colors">
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
            {error}
          </div>
        )}

        {isUploading && (
          <div className="mb-4 space-y-2" aria-live="polite">
            <div className="flex justify-between text-xs text-slate-300">
              <span>{uploadStage === 'processing' ? 'Processing and indexing paper...' : 'Uploading paper...'}</span>
              <span>{uploadStage === 'processing' ? 'Processing' : `${uploadProgress}%`}</span>
            </div>
            <div
              role="progressbar"
              aria-label="Paper upload progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={uploadProgress}
              className="h-2 overflow-hidden rounded-full bg-slate-800"
            >
              <div className="h-full bg-indigo-500 transition-[width] duration-150" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Select Research File *
            </label>
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileChange}
              disabled={isUploading}
              required
              className="w-full text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Paper Title (Auto-inferred if blank)
            </label>
            <input
              type="text"
              value={title}
              disabled={isUploading}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deep Residual Learning for Image Recognition"
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Venue / Conference
              </label>
              <input
                type="text"
                value={venue}
                disabled={isUploading}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. CVPR, NeurIPS, IEEE"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Publication Year
              </label>
              <input
                type="number"
                value={year}
                disabled={isUploading}
                onChange={(e) => setYear(e.target.value)}
                placeholder="e.g. 2024"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                if (isUploading) {
                  uploadController.current?.abort();
                } else {
                  onClose();
                }
              }}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              {isUploading ? 'Cancel upload' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {isUploading ? 'Processing & Indexing...' : 'Upload & Process'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
