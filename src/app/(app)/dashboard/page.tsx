'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardView from '@/components/dashboard/dashboard-view';

export default function DashboardPage() {
  const router = useRouter();
  return <DashboardView onNavigate={(section: string) => router.push('/' + section)} />;
}
