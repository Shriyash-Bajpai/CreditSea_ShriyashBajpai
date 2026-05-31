'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Loan } from '@/types';
import { formatCurrency } from '@/lib/loanCalc';
import { Wallet, Plus, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

interface PaymentForm { utrNumber: string; amount: string; date: string; }

export default function CollectionPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [payForms, setPayForms] = useState<Record<string, PaymentForm>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchLoans = () => {
    setLoading(true);
    api.get('/ops/collection/loans').then((r) => setLoans(r.data.data.loans)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLoans(); }, []);

  const getForm = (id: string): PaymentForm =>
    payForms[id] || { utrNumber: '', amount: '', date: new Date().toISOString().split('T')[0] };

  const setForm = (id: string, f: Partial<PaymentForm>) =>
    setPayForms((prev) => ({ ...prev, [id]: { ...getForm(id), ...f } }));

  const handlePayment = async (loanId: string) => {
    const form = getForm(loanId);
    if (!form.utrNumber || !form.amount) { toast.error('UTR and amount are required'); return; }
    setActionLoading(loanId);
    try {
      const res = await api.post(`/ops/collection/loans/${loanId}/payments`, {
        utrNumber: form.utrNumber,
        amount: Number(form.amount),
        date: form.date,
      });
      toast.success(res.data.message);
      setPayForms((prev) => ({ ...prev, [loanId]: { utrNumber: '', amount: '', date: new Date().toISOString().split('T')[0] } }));
      fetchLoans();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Payment recording failed');
    } finally {
      setActionLoading(null);
    }
  };

  const activeLoan = loans.filter((l) => l.status === 'disbursed');
  const closedLoans = loans.filter((l) => l.status === 'closed');

  return (
    <div className="max-w-5xl animate-slide-up">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-slate-900 mb-1">Collection</h1>
        <p className="text-slate-500">Record payments and track repayments for disbursed loans.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {[
          { label: 'Active Loans', value: activeLoan.length, color: 'text-purple-400' },
          { label: 'Closed Loans', value: closedLoans.length, color: 'text-emerald-400' },
        ].map((s) => (
          <div key={s.label} className="card p-5">
            <p className="text-sm text-slate-400 mb-1">{s.label}</p>
            <p className={clsx('font-display text-3xl font-bold', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
        </div>
      ) : loans.length === 0 ? (
        <div className="card p-12 text-center">
          <Wallet size={36} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500">No disbursed loans yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {loans.map((loan) => {
            const borrower = loan.borrowerId as any;
            const outstanding = loan.totalRepayment - loan.totalPaid;
            const pct = Math.min(100, (loan.totalPaid / loan.totalRepayment) * 100);
            const isExpanded = expanded === loan._id;
            const form = getForm(loan._id);

            return (
              <div key={loan._id} className="card overflow-hidden">
                <div
                  className="p-5 cursor-pointer hover:bg-slate-800/50 transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : loan._id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-medium text-slate-800">{borrower?.name}</p>
                        <span className={clsx(
                          'status-badge border text-xs',
                          loan.status === 'closed'
                            ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30'
                            : 'text-purple-400 bg-purple-400/10 border-purple-400/30'
                        )}>
                          {loan.status === 'closed' ? 'Closed' : 'Active'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400">{borrower?.email}</p>
                    </div>
                    <div className="text-right mr-4">
                      <p className="text-sm text-slate-400 mb-0.5">Outstanding</p>
                      <p className={clsx('font-semibold', outstanding > 0 ? 'text-amber-400' : 'text-emerald-400')}>
                        {formatCurrency(outstanding)}
                      </p>
                    </div>
                    <div className="w-40">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>{pct.toFixed(0)}% paid</span>
                        <span>{formatCurrency(loan.totalRepayment)}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-primary-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-200 p-5 animate-fade-in bg-slate-50">
                    {/* Payment history */}
                    {loan.payments.length > 0 && (
                      <div className="mb-5">
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Payment History</h4>
                        <div className="space-y-2">
                          {loan.payments.map((p, i) => (
                            <div key={i} className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm">
                              <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                              <span className="font-mono text-slate-600 text-xs">{p.utrNumber}</span>
                              <span className="flex-1" />
                              <span className="text-slate-400">{new Date(p.date).toLocaleDateString('en-IN')}</span>
                              <span className="font-semibold text-white">{formatCurrency(p.amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Record payment form */}
                    {loan.status === 'disbursed' && (
                      <div>
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Record Payment</h4>
                        <div className="grid grid-cols-3 gap-3 mb-3">
                          <div>
                            <label className="label text-xs">UTR Number</label>
                            <input
                              className="input-field text-sm font-mono"
                              placeholder="Unique UTR"
                              value={form.utrNumber}
                              onChange={(e) => setForm(loan._id, { utrNumber: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="label text-xs">Amount (₹) · Max: {formatCurrency(outstanding)}</label>
                            <input
                              type="number"
                              className="input-field text-sm"
                              placeholder="0.00"
                              min={1}
                              max={outstanding}
                              value={form.amount}
                              onChange={(e) => setForm(loan._id, { amount: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="label text-xs">Date</label>
                            <input
                              type="date"
                              className="input-field text-sm"
                              value={form.date}
                              onChange={(e) => setForm(loan._id, { date: e.target.value })}
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => handlePayment(loan._id)}
                          disabled={actionLoading === loan._id}
                          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                        >
                          <Plus size={15} />
                          {actionLoading === loan._id ? 'Recording…' : 'Record Payment'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
