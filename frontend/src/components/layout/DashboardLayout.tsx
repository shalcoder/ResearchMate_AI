'use client';

import React, { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { LoadingState } from './LoadingState';
import { UnauthorizedState } from './UnauthorizedState';
import { useAuth } from '../../lib/auth-context';
import { UserRole } from '../../types';

interface DashboardLayoutProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  requiredRoles,
}) => {
  const { user, isLoading, hasRole, switchRole } = useAuth();

  const isRoleAllowed = !requiredRoles || hasRole(requiredRoles);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 bg-slate-950/90 overflow-y-auto">
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
    </div>
  );
};
