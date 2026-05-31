'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Loan } from '@/types';
import { formatCurrency } from '@/lib/loanCalc';
import { ShieldCheck, XCircle, CheckCircle2 } from 'lucide-react';

export default function SanctionPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState<{ loanId: string; open: boolean }>({ loanId: '', open: false });
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchLoans = () => {
    setLoading(true);
    api.get('/ops/sanction/loans').then((r) => setLoans(r.data.data.loans)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLoans(); }, []);

  const handleApprove = async (loanId: string) => {
    setActionLoading(loanId);
    try {
      await api.patch(`/ops/sanction/loans/${loanId}/approve`);
      toast.success('Loan sanctioned!');
      fetchLoans();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast.error('Please enter a rejection reason'); return; }
    setActionLoading(rejectModal.loanId);
    try {
      await api.patch(`/ops/sanction/loans/${rejectModal.loanId}/reject`, { reason: rejectReason });
      toast.success('Loan rejected');
      setRejectModal({ loanId: '', open: false });
      setRejectReason('');
      fetchLoans();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-5xl animate-slide-up">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-slate-900 mb-1">Sanction — Loan Review</h1>
        <p className="text-slate-500">Review and approve or reject pending loan applications.</p>
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-medium text-slate-800">Applied Loans</h2>
          <span className="text-sm text-slate-500">{loans.length} pending</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
          </div>
        ) : loans.length === 0 ? (
          <div className="text-center py-16 text-slate-500">No pending applications.</div>
        ) : (
          <div className="divide-y divide-slate-800">
            {loans.map((loan) => {
              const borrower = loan.borrowerId as any;
              const profile = loan.profileId as any;
              return (
                <div key={loan._id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-medium text-slate-800">{borrower?.name || 'N/A'}</p>
                      <p className="text-sm text-slate-500">{borrower?.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-xl text-slate-900">{formatCurrency(loan.principal)}</p>
                      <p className="text-sm text-slate-500">{loan.tenureDays} days · 12% p.a.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {[
                      { label: 'PAN',             value: profile?.pan || '—' },
                      { label: 'Employment',      value: profile?.employmentMode?.replace('_', ' ') || '—' },
                      { label: 'Monthly Salary',  value: profile?.monthlySalary ? formatCurrency(profile.monthlySalary) : '—' },
                      { label: 'Total Repayment', value: formatCurrency(loan.totalRepayment) },
                    ].map((f) => (
                      <div key={f.label} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                        <p className="text-xs text-slate-500 mb-1">{f.label}</p>
                        <p className="text-sm font-medium text-slate-800 capitalize">{f.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleApprove(loan._id)}
                      disabled={actionLoading === loan._id}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 size={15} />
                      {actionLoading === loan._id ? 'Processing…' : 'Sanction'}
                    </button>
                    <button
                      onClick={() => setRejectModal({ loanId: loan._id, open: true })}
                      disabled={!!actionLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                    >
                      <XCircle size={15} />
                      Reject
                    </button>
                    <span className="text-xs text-slate-500 ml-2">Applied {new Date(loan.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md animate-slide-up shadow-xl">
            <h3 className="font-display text-xl text-slate-900 mb-2">Reject Loan</h3>
            <p className="text-slate-500 text-sm mb-4">Provide a clear reason for the borrower.</p>
            <textarea
              className="input-field resize-none h-28"
              placeholder="e.g. Insufficient income, incomplete documentation…"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-3 mt-4">
              <button onClick={handleReject} disabled={!!actionLoading} className="btn-danger flex-1">
                {actionLoading ? 'Rejecting…' : 'Confirm Reject'}
              </button>
              <button onClick={() => { setRejectModal({ loanId: '', open: false }); setRejectReason(''); }} className="btn-secondary flex-1">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
