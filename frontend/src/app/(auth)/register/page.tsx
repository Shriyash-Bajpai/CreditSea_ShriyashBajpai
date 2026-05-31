'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      const { token, user } = res.data.data;
      login(token, user);
      toast.success('Account created! Welcome to LoanSphere.');
      router.push('/borrower/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration failed');
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
        <h2 className="font-display text-3xl text-white mb-2">Create account</h2>
        <p className="text-slate-400">Start your loan application today</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Full Name</label>
          <input className="input-field" placeholder="Rahul Sharma" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <label className="label">Email address</label>
          <input type="email" className="input-field" placeholder="you@example.com" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div>
          <label className="label">Password</label>
          <input type="password" className="input-field" placeholder="Min. 6 characters" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </div>
        <div>
          <label className="label">Confirm Password</label>
          <input type="password" className="input-field" placeholder="Repeat password" value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-slate-400 mt-6 text-sm">
        Already have an account?{' '}
        <Link href="/login" className="text-primary-400 hover:text-primary-300 font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
