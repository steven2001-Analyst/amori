'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthView from '@/components/auth/auth-view';
import { useProgressStore } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const isLoggedIn = useProgressStore((state) => state.isLoggedIn);

  // Redirect to dashboard once logged in
  useEffect(() => {
    if (isLoggedIn) {
      router.push('/dashboard');
    }
  }, [isLoggedIn, router]);

  return <AuthView />;
}
