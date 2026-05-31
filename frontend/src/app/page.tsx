'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) { router.replace('/login'); return; }
    if (user.role === 'borrower') { router.replace('/borrower/dashboard'); return; }
    // All ops roles go to their module
    const roleMap: Record<string, string> = {
      admin: '/ops/sales',
      sales: '/ops/sales',
      sanction: '/ops/sanction',
      disbursement: '/ops/disbursement',
      collection: '/ops/collection',
    };
    router.replace(roleMap[user.role] || '/login');
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
        <p className="text-slate-400 text-sm">Loading LoanSphere…</p>
      </div>
    </div>
  );
}
