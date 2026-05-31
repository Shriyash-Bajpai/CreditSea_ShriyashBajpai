'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { BorrowerProfile } from '@/types';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function PersonalDetailsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<BorrowerProfile | null>(null);
  const [form, setForm] = useState({
    fullName: '', pan: '', dateOfBirth: '', monthlySalary: '', employmentMode: 'salaried',
  });
  const [loading, setLoading] = useState(false);
  const [breErrors, setBreErrors] = useState<string[]>([]);

  useEffect(() => {
    api.get('/borrower/profile').then((res) => {
      const p = res.data.data.profile;
      if (p) {
        setProfile(p);
        setForm({
          fullName: p.fullName || '',
          pan: p.pan || '',
          dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split('T')[0] : '',
          monthlySalary: p.monthlySalary?.toString() || '',
          employmentMode: p.employmentMode || 'salaried',
        });
      }
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setBreErrors([]);
    try {
      await api.post('/borrower/personal-details', {
        ...form,
        monthlySalary: Number(form.monthlySalary),
      });
      toast.success('Details saved! Eligibility check passed ✓');
      router.push('/borrower/upload');
    } catch (err: any) {
      const data = err?.response?.data;
      if (data?.data?.breResult?.failedRules?.length) {
        setBreErrors(data.data.breResult.failedRules);
      } else {
        toast.error(data?.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl animate-slide-up">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-slate-900 mb-1">Personal Details</h1>
        <p className="text-slate-500">We'll run an eligibility check on submission.</p>
      </div>

      {profile?.breCleared && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-6">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <p className="text-sm text-emerald-300">Eligibility check already cleared. You can update your details.</p>
        </div>
      )}

      {breErrors.length > 0 && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <XCircle size={18} className="text-rose-400" />
            <p className="font-medium text-rose-300">Eligibility Check Failed</p>
          </div>
          <ul className="space-y-1.5">
            {breErrors.map((err, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="text-rose-400 mt-0.5">•</span>{err}
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label className="label">Full Name</label>
          <input className="input-field" placeholder="As per PAN card" value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">PAN Number</label>
            <input className="input-field uppercase" placeholder="ABCDE1234F" maxLength={10}
              value={form.pan} onChange={(e) => setForm({ ...form, pan: e.target.value.toUpperCase() })} required />
            <p className="text-xs text-slate-500 mt-1">Format: 5 letters · 4 digits · 1 letter</p>
          </div>
          <div>
            <label className="label">Date of Birth</label>
            <input type="date" className="input-field" value={form.dateOfBirth}
              onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} required />
            <p className="text-xs text-slate-500 mt-1">Must be 23–50 years old</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Monthly Salary (₹)</label>
            <input type="number" className="input-field" placeholder="e.g. 50000" min={0}
              value={form.monthlySalary} onChange={(e) => setForm({ ...form, monthlySalary: e.target.value })} required />
            <p className="text-xs text-slate-500 mt-1">Min. ₹25,000 required</p>
          </div>
          <div>
            <label className="label">Employment Mode</label>
            <select className="input-field" value={form.employmentMode}
              onChange={(e) => setForm({ ...form, employmentMode: e.target.value })}>
              <option value="salaried">Salaried</option>
              <option value="self_employed">Self-Employed</option>
              <option value="unemployed">Unemployed</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Checking eligibility…' : 'Save & Check Eligibility'}
          </button>
        </div>
      </form>
    </div>
  );
}
