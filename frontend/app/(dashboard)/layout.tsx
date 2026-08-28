'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      router.push('/login');
      return;
    }

    setIsAuthenticated(true);
    setIsLoading(false);
  }, [router, pathname]);

  if (isLoading) {
    return (
      <div style={{ background: 'var(--background)' }} className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-3xl flex items-center justify-center pulse-glow" style={{ background: 'var(--accent-gradient)' }}>
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p style={{ color: 'var(--text-muted)' }} className="text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div style={{ background: 'var(--background)' }} className="min-h-screen">
      <Sidebar />
      <div className="ml-[280px]">
        <Header />
        <main className="p-6 page-enter">
          {children}
        </main>
      </div>
    </div>
  );
}
