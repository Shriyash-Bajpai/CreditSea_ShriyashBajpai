'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Users, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

interface Lead {
  user: { id: string; name: string; email: string; createdAt: string };
  profile: any;
  hasApplied: boolean;
  stage: string;
}

const stageConfig: Record<string, { label: string; color: string }> = {
  registered:       { label: 'Registered',         color: 'text-slate-400 bg-slate-400/10 border-slate-400/30' },
  profile_incomplete: { label: 'Profile Pending',  color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' },
  needs_salary_slip: { label: 'Docs Pending',      color: 'text-orange-400 bg-orange-400/10 border-orange-400/30' },
  ready_to_apply:   { label: 'Ready to Apply',     color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
  applied:          { label: 'Applied',             color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' },
};

export default function SalesPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/ops/sales/leads').then((r) => setLeads(r.data.data.leads)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const stats = {
    total: leads.length,
    applied: leads.filter((l) => l.hasApplied).length,
    pending: leads.filter((l) => !l.hasApplied).length,
  };

  return (
    <div className="max-w-5xl animate-slide-up">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-slate-900 mb-1">Sales — Lead Tracker</h1>
        <p className="text-slate-500">Monitor borrower registration and application progress.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Borrowers', value: stats.total, icon: Users, color: 'text-primary-400' },
          { label: 'Applied', value: stats.applied, icon: CheckCircle2, color: 'text-emerald-400' },
          { label: 'Not Yet Applied', value: stats.pending, icon: Clock, color: 'text-amber-400' },
        ].map((s) => (
          <div key={s.label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-400">{s.label}</span>
              <s.icon size={18} className={s.color} />
            </div>
            <p className="font-display text-3xl text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h2 className="font-medium text-slate-800">All Leads</h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-16 text-slate-500">No borrowers registered yet.</div>
        ) : (
          <div className="divide-y divide-slate-800">
            {leads.map((lead) => (
              <div key={lead.user.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-800/50 transition-colors">
                <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {lead.user.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">{lead.user.name}</p>
                  <p className="text-sm text-slate-500 truncate">{lead.user.email}</p>
                </div>
                <div className="text-sm text-slate-500">
                  {lead.profile ? (
                    <span className="text-slate-300">{lead.profile.employmentMode?.replace('_', ' ')}</span>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </div>
                <div className="text-xs text-slate-500">
                  {new Date(lead.user.createdAt).toLocaleDateString('en-IN')}
                </div>
                <span className={clsx('status-badge border', stageConfig[lead.stage]?.color)}>
                  {stageConfig[lead.stage]?.label || lead.stage}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
