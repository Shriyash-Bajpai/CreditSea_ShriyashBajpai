'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { Loan, BorrowerProfile } from '@/types';
import { formatCurrency } from '@/lib/loanCalc';
import Link from 'next/link';
import { ArrowRight, AlertCircle, CheckCircle2, Clock, XCircle, Banknote, RefreshCw } from 'lucide-react';
import clsx from 'clsx';

const statusConfig = {
  applied:    { label: 'Applied',    color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' },
  sanctioned: { label: 'Sanctioned', color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
  rejected:   { label: 'Rejected',   color: 'text-rose-400 bg-rose-400/10 border-rose-400/30' },
  disbursed:  { label: 'Disbursed',  color: 'text-purple-400 bg-purple-400/10 border-purple-400/30' },
  closed:     { label: 'Closed',     color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' },
};

export default function BorrowerDashboard() {
  const { user } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [profile, setProfile] = useState<BorrowerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [lRes, pRes] = await Promise.all([
          api.get('/borrower/loans'),
          api.get('/borrower/profile'),
        ]);
        setLoans(lRes.data.data.loans);
        setProfile(pRes.data.data.profile);
      } catch {}
      setLoading(false);
    };
    fetch();
  }, []);

  const latestLoan = loans[0];

  const steps = [
    { label: 'Personal Details', done: !!profile?.breCleared, href: '/borrower/personal-details' },
    { label: 'Salary Slip',      done: !!profile?.salarySlipPath, href: '/borrower/upload' },
    { label: 'Loan Applied',     done: loans.length > 0, href: '/borrower/loan-config' },
  ];

  const nextStep = steps.find((s) => !s.done);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" /></div>;

  return (
    <div className="max-w-4xl animate-slide-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl text-slate-900 mb-1">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-slate-500">Here's an overview of your loan journey.</p>
      </div>

      {/* Progress Steps */}
      <div className="card p-6 mb-6">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-5">Application Progress</h2>
        <div className="flex items-center gap-0">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={clsx(
                  'w-9 h-9 rounded-full flex items-center justify-center border-2 mb-2 transition-all',
                  step.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600 bg-slate-800'
                )}>
                  {step.done
                    ? <CheckCircle2 size={18} className="text-white" />
                    : <span className="text-slate-400 text-sm font-bold">{i + 1}</span>
                  }
                </div>
                <span className={clsx('text-xs text-center', step.done ? 'text-emerald-400' : 'text-slate-500')}>{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={clsx('h-0.5 flex-1 mx-2 mb-5 rounded', step.done ? 'bg-emerald-500' : 'bg-slate-700')} />
              )}
            </div>
          ))}
        </div>
        {nextStep && (
          <div className="mt-5 pt-5 border-t border-slate-800">
            <Link href={nextStep.href} className="btn-primary inline-flex items-center gap-2 text-sm">
              Continue: {nextStep.label} <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>

      {/* Latest Loan */}
      {latestLoan ? (
        <div className="card p-6 mb-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="font-medium text-white text-lg">Current Loan</h2>
              <p className="text-slate-400 text-sm">Applied {new Date(latestLoan.createdAt).toLocaleDateString('en-IN')}</p>
            </div>
            <span className={clsx('status-badge border', statusConfig[latestLoan.status].color)}>
              {statusConfig[latestLoan.status].label}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            {[
              { label: 'Principal', value: formatCurrency(latestLoan.principal) },
              { label: 'Tenure', value: `${latestLoan.tenureDays} days` },
              { label: 'Interest', value: formatCurrency(latestLoan.simpleInterest) },
              { label: 'Total Repayment', value: formatCurrency(latestLoan.totalRepayment) },
            ].map((s) => (
              <div key={s.label} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                <p className="font-semibold text-slate-800 text-sm">{s.value}</p>
              </div>
            ))}
          </div>

          {latestLoan.status === 'disbursed' && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Repayment Progress</span>
                <span className="text-sm font-medium text-white">
                  {formatCurrency(latestLoan.totalPaid)} / {formatCurrency(latestLoan.totalRepayment)}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-primary-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (latestLoan.totalPaid / latestLoan.totalRepayment) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">Outstanding: {formatCurrency(latestLoan.totalRepayment - latestLoan.totalPaid)}</p>
            </div>
          )}

          {latestLoan.status === 'rejected' && (
            <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/30 rounded-xl p-4">
              <XCircle size={18} className="text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-rose-300">Loan Rejected</p>
                <p className="text-sm text-slate-400 mt-0.5">{latestLoan.rejectionReason || 'No reason provided'}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card p-8 text-center mb-6">
          <Banknote size={40} className="text-slate-600 mx-auto mb-3" />
          <h3 className="font-medium text-slate-300 mb-1">No loan yet</h3>
          <p className="text-slate-500 text-sm mb-4">Complete the steps above to apply for your first loan.</p>
        </div>
      )}
    </div>
  );
}
