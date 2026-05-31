'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Loan } from '@/types';
import { formatCurrency } from '@/lib/loanCalc';
import { Banknote, Send } from 'lucide-react';

export default function DisbursementPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchLoans = () => {
    setLoading(true);
    api.get('/ops/disbursement/loans').then((r) => setLoans(r.data.data.loans)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLoans(); }, []);

  const handleDisburse = async (loanId: string) => {
    setActionLoading(loanId);
    try {
      await api.patch(`/ops/disbursement/loans/${loanId}/disburse`);
      toast.success('Loan disbursed successfully! Funds released.');
      fetchLoans();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Disbursement failed');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-5xl animate-slide-up">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-slate-900 mb-1">Disbursement</h1>
        <p className="text-slate-500">Release funds for sanctioned loans.</p>
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-medium text-slate-800">Sanctioned Loans</h2>
          <span className="text-sm text-slate-500">{loans.length} ready</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
          </div>
        ) : loans.length === 0 ? (
          <div className="text-center py-16">
            <Banknote size={36} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500">No sanctioned loans awaiting disbursement.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {loans.map((loan) => {
              const borrower = loan.borrowerId as any;
              const profile = loan.profileId as any;
              return (
                <div key={loan._id} className="p-6 flex items-center gap-6">
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{borrower?.name}</p>
                    <p className="text-sm text-slate-500">{borrower?.email}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      PAN: {profile?.pan} · {profile?.employmentMode?.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="font-display text-2xl text-slate-900">{formatCurrency(loan.principal)}</p>
                    <p className="text-xs text-slate-500">{loan.tenureDays} days</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-500">Total Repayable</p>
                    <p className="font-medium text-primary-300">{formatCurrency(loan.totalRepayment)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 mb-2">Sanctioned {loan.sanctionedAt ? new Date(loan.sanctionedAt).toLocaleDateString('en-IN') : '—'}</p>
                    <button
                      onClick={() => handleDisburse(loan._id)}
                      disabled={actionLoading === loan._id}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                    >
                      <Send size={14} />
                      {actionLoading === loan._id ? 'Disbursing…' : 'Disburse Funds'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
