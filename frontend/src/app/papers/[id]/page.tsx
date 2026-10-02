import React from 'react';
import PaperDetailClient from './PaperDetailClient';

// Required for Next.js static export (GitHub Pages)
export function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: 'attention-is-all-you-need' },
    { id: 'mamba-linear-time-sequence-modeling' },
    { id: 'deepseek-r1-incentivizing-reasoning' },
  ];
}

export default function PaperDetailPage() {
  return <PaperDetailClient />;
}
