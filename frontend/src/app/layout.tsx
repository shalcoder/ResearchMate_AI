import React from 'react';
import './globals.css';
import { AuthProvider } from '../lib/auth-context';

export const metadata = {
  title: 'ResearchMate AI - Academic Knowledge Workspace',
  description: 'AI-enabled persistent academic research workspace and literature-review platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
