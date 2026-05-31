'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      const { token, user } = res.data.data;
      login(token, user);
      toast.success(`Welcome back, ${user.name}!`);
      const roleMap: Record<string, string> = {
        borrower: '/borrower/dashboard',
        admin: '/ops/sales',
        sales: '/ops/sales',
        sanction: '/ops/sanction',
        disbursement: '/ops/disbursement',
        collection: '/ops/collection',
      };
      router.push(roleMap[user.role] || '/');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-white ring-1 ring-slate-200">
            <img src="/loansphere_logo.svg" alt="LoanSphere" className="w-full h-full object-cover" />
          </div>
          <span className="font-display text-xl text-white">LoanSphere</span>
        </div>
        <h2 className="font-display text-3xl text-white mb-2">Sign in</h2>
        <p className="text-slate-400">Access your account to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">Email address</label>
          <input
            type="email"
            className="input-field"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            type="password"
            className="input-field"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-slate-400 mt-6 text-sm">
        New borrower?{' '}
        <Link href="/register" className="text-primary-400 hover:text-primary-300 font-medium">
          Create account
        </Link>
      </p>

      {/* Quick-fill demo credentials */}
      <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wide">Demo credentials (Click on credentials to fill details)</p>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { role: 'Borrower', email: 'borrower@lms.com', pass: 'Borrower@123' },
            { role: 'Admin', email: 'admin@lms.com', pass: 'Admin@123' },
            { role: 'Sales', email: 'sales@lms.com', pass: 'Sales@123' },
            { role: 'Sanction', email: 'sanction@lms.com', pass: 'Sanction@123' },
            { role: 'Disburse', email: 'disbursement@lms.com', pass: 'Disburse@123' },
            { role: 'Collect', email: 'collection@lms.com', pass: 'Collect@123' },
          ].map((c) => (
            <button
              key={c.role}
              type="button"
              onClick={() => setForm({ email: c.email, password: c.pass })}
              className="text-left px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <div className="text-xs font-medium text-slate-700">{c.role}</div>
              <div className="text-[10px] text-slate-400 truncate">{c.email}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
