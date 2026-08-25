'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { LoadingState } from '../../components/layout/LoadingState';

export default function DashboardRootPage() {
  const { user, isLoading } = useAuth();
  const router = RouterRedirect();

  useEffect(() => {
    if (!isLoading && user) {
      // Route user to their specific role dashboard shell
      router.replace(`/dashboard/${user.role}`);
    }
  }, [user, isLoading, router]);

  return (
    <DashboardLayout>
      <LoadingState message="Routing to your role-specific research dashboard..." />
    </DashboardLayout>
  );
}

function RouterRedirect() {
  return useRouter();
}
