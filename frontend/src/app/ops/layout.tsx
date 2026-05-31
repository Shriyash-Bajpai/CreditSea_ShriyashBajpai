'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, Users, ShieldCheck, Banknote, Wallet, LayoutGrid } from 'lucide-react';
import clsx from 'clsx';
import { Role } from '@/types';

const allNavItems = [
  { href: '/ops/sales',        label: 'Sales',        icon: Users,       roles: ['admin','sales'] },
  { href: '/ops/sanction',     label: 'Sanction',     icon: ShieldCheck, roles: ['admin','sanction'] },
  { href: '/ops/disbursement', label: 'Disbursement', icon: Banknote,    roles: ['admin','disbursement'] },
  { href: '/ops/collection',   label: 'Collection',   icon: Wallet,      roles: ['admin','collection'] },
];

const OPS_ROLES: Role[] = ['admin', 'sales', 'sanction', 'disbursement', 'collection'];

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) { router.replace('/login'); return; }
    if (!isLoading && user && !OPS_ROLES.includes(user.role)) { router.replace('/login'); }
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  const navItems = allNavItems.filter((n) => n.roles.includes(user.role));

  const roleColors: Record<string, string> = {
    admin: 'bg-primary-600', sales: 'bg-emerald-600',
    sanction: 'bg-blue-600', disbursement: 'bg-purple-600', collection: 'bg-amber-600',
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed top-0 left-0 h-full shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-white ring-1 ring-slate-200">
              <img src="/loansphere_logo.svg" alt="LoanSphere" className="w-full h-full object-cover" />
            </div>
            <span className="font-display text-xl text-slate-800">LoanSphere</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={clsx('text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full text-white', roleColors[user.role] || 'bg-slate-600')}>
              {user.role}
            </span>
            <span className="text-xs text-slate-500">Dashboard</span>
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
            <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm', roleColors[user.role] || 'bg-slate-600')}>
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

      <main className="flex-1 ml-64 p-8 animate-fade-in bg-slate-50 min-h-screen">
        {children}
      </main>
    </div>
  );
}
