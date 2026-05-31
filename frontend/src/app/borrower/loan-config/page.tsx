'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { calculateLoan, formatCurrency } from '@/lib/loanCalc';
import { BorrowerProfile } from '@/types';
import { AlertCircle, TrendingUp } from 'lucide-react';

const MIN_AMOUNT = 50000;
const MAX_AMOUNT = 500000;
const MIN_TENURE = 30;
const MAX_TENURE = 365;
const INTEREST_RATE = 12;

export default function LoanConfigPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<BorrowerProfile | null>(null);
  const [hasActiveLoan, setHasActiveLoan] = useState(false);
  const [principal, setPrincipal] = useState(200000);
  const [tenure, setTenure] = useState(180);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const { simpleInterest, totalRepayment } = calculateLoan(principal, tenure);
  const dailyInterest = simpleInterest / tenure;

  useEffect(() => {
    Promise.all([
      api.get('/borrower/profile'),
      api.get('/borrower/loans'),
    ]).then(([pRes, lRes]) => {
      setProfile(pRes.data.data.profile);
      const loans = lRes.data.data.loans;
      const active = loans.find((l: any) => ['applied', 'sanctioned', 'disbursed'].includes(l.status));
      if (active) setHasActiveLoan(true);
    }).catch(() => {}).finally(() => setPageLoading(false));
  }, []);

  const handleApply = async () => {
    setLoading(true);
    try {
      await api.post('/borrower/apply', { principal, tenureDays: tenure });
      toast.success('Loan application submitted! 🎉');
      router.push('/borrower/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Application failed');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" /></div>;

  if (!profile?.breCleared) return (
    <div className="max-w-xl card p-8 text-center">
      <AlertCircle size={40} className="text-amber-400 mx-auto mb-3" />
      <h3 className="font-medium text-slate-900 mb-1">Complete previous steps first</h3>
      <p className="text-slate-500 text-sm">Please complete personal details and salary slip upload.</p>
    </div>
  );

  if (!profile?.salarySlipPath) return (
    <div className="max-w-xl card p-8 text-center">
      <AlertCircle size={40} className="text-amber-400 mx-auto mb-3" />
      <h3 className="font-medium text-slate-900 mb-1">Upload salary slip first</h3>
      <a href="/borrower/upload" className="btn-primary inline-block mt-4">Upload Salary Slip</a>
    </div>
  );

  if (hasActiveLoan) return (
    <div className="max-w-xl card p-8 text-center">
      <AlertCircle size={40} className="text-blue-400 mx-auto mb-3" />
      <h3 className="font-medium text-slate-900 mb-1">Active loan in progress</h3>
      <p className="text-slate-500 text-sm mb-4">You already have an active loan application. Please check your dashboard.</p>
      <a href="/borrower/dashboard" className="btn-primary inline-block">View Dashboard</a>
    </div>
  );

  return (
    <div className="max-w-3xl animate-slide-up">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-slate-900 mb-1">Configure Your Loan</h1>
        <p className="text-slate-500">Adjust the sliders to see live repayment calculations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sliders */}
        <div className="card p-6 space-y-8">
          {/* Amount Slider */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-600">Loan Amount</label>
              <span className="font-display text-xl text-slate-900">{formatCurrency(principal)}</span>
            </div>
            <input
              type="range" min={MIN_AMOUNT} max={MAX_AMOUNT} step={5000}
              value={principal} onChange={(e) => setPrincipal(Number(e.target.value))}
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>₹50K</span><span>₹5L</span>
            </div>
          </div>

          {/* Tenure Slider */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-600">Loan Tenure</label>
              <span className="font-display text-xl text-slate-900">{tenure} days</span>
            </div>
            <input
              type="range" min={MIN_TENURE} max={MAX_TENURE} step={5}
              value={tenure} onChange={(e) => setTenure(Number(e.target.value))}
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>30 days</span><span>365 days</span>
            </div>
          </div>

          <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 text-xs text-slate-500">
            <span className="text-primary-400 font-medium">Fixed Rate:</span> {INTEREST_RATE}% p.a. · Simple Interest formula
          </div>
        </div>

        {/* Calculation Panel */}
        <div className="card p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={18} className="text-primary-400" />
            <h3 className="font-medium text-slate-800">Repayment Summary</h3>
          </div>

          <div className="space-y-4 flex-1">
            {[
              { label: 'Principal Amount', value: formatCurrency(principal), highlight: false },
              { label: 'Interest Rate', value: `${INTEREST_RATE}% p.a.`, highlight: false },
              { label: 'Tenure', value: `${tenure} days`, highlight: false },
              { label: 'Simple Interest (SI)', value: formatCurrency(simpleInterest), highlight: false },
              { label: 'Daily Interest', value: `${formatCurrency(dailyInterest)}/day`, highlight: false },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between text-sm">
                <span className="text-slate-500">{row.label}</span>
                <span className="font-medium text-slate-700">{row.value}</span>
              </div>
            ))}

            <div className="border-t border-slate-700 pt-4 flex items-center justify-between">
              <span className="font-semibold text-slate-900">Total Repayment</span>
              <span className="font-display text-2xl text-primary-300">{formatCurrency(totalRepayment)}</span>
            </div>
          </div>

          <div className="mt-2 text-xs text-slate-500 bg-slate-100 border border-slate-200 rounded-lg p-3">
            SI = (P × R × T) / (365 × 100)<br/>
            = ({formatCurrency(principal)} × {INTEREST_RATE} × {tenure}) / 36500<br/>
            = {formatCurrency(simpleInterest)}
          </div>

          <button
            onClick={handleApply}
            disabled={loading}
            className="btn-primary w-full mt-6 text-base py-3"
          >
            {loading ? 'Submitting…' : `Apply for ${formatCurrency(principal)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
