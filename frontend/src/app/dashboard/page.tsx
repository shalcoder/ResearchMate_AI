'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { LoadingState } from '../../components/layout/LoadingState';

export default function DashboardRootPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace(`/dashboard/${user.role}`);
      } else {
        router.replace('/login');
      }
    }
  }, [user, isLoading, router]);

  return (
    <DashboardLayout>
      <LoadingState message="Connecting to your research workspace..." />
    </DashboardLayout>
  );
}
