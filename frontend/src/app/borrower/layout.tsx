'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, LayoutDashboard, User, Upload, CreditCard } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { href: '/borrower/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/borrower/personal-details', label: 'Personal Details', icon: User },
  { href: '/borrower/upload', label: 'Salary Slip', icon: Upload },
  { href: '/borrower/loan-config', label: 'Apply for Loan', icon: CreditCard },
];

export default function BorrowerLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
    if (!isLoading && user && user.role !== 'borrower') router.replace('/login');
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed top-0 left-0 h-full shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-white ring-1 ring-slate-200">
              <img src="/loansphere_logo.svg" alt="LoanSphere" className="w-full h-full object-cover" />
            </div>
            <span className="font-display text-xl text-slate-800">LoanSphere</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                pathname === href
                  ? 'bg-primary-50 text-primary-700 border border-primary-200'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              )}
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center text-white font-bold text-sm">
              {user.name[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); router.push('/login'); }}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 p-8 animate-fade-in bg-slate-50 min-h-screen">
        {children}
      </main>
    </div>
  );
}
