'use client';

import React, { ReactNode, useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { LoadingState } from './LoadingState';
import { UnauthorizedState } from './UnauthorizedState';
import { useAuth } from '../../lib/auth-context';
import { UserRole } from '../../types';
import { CommandPalette } from '../ui/CommandPalette';
import { UploadModal } from '../papers/UploadModal';

interface DashboardLayoutProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  requiredRoles,
}) => {
  const { user, isLoading, hasRole, switchRole } = useAuth();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const isRoleAllowed = !requiredRoles || hasRole(requiredRoles);

  return (
    <div className="min-h-screen spatial-mesh-bg text-white font-sans antialiased flex flex-col selection:bg-white selection:text-black">
      <Header onOpenCommand={() => setIsCommandOpen(true)} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-[#09090d]/80 backdrop-blur-sm overflow-y-auto">
          {isLoading ? (
            <LoadingState />
          ) : !isRoleAllowed ? (
            <UnauthorizedState
              requiredRoles={requiredRoles || []}
              currentRole={user?.role}
              onSwitchRole={switchRole}
            />
          ) : (
            children
          )}
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette onOpenUpload={() => setIsUploadOpen(true)} />

      {/* Global Upload Ingestion Modal Triggerable from Command Palette */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => {
          if (typeof window !== 'undefined') window.location.reload();
        }}
      />
    </div>
  );
};
