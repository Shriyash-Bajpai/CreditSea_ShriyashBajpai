export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-950 via-slate-900 to-slate-950 flex-col justify-between p-12 relative overflow-hidden border-r border-primary-900/40">
        {/* Background orbs */}
        <div className="absolute top-[-80px] left-[-80px] w-80 h-80 rounded-full bg-primary-600/20 blur-3xl" />
        <div className="absolute bottom-[-60px] right-[-60px] w-64 h-64 rounded-full bg-primary-500/10 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-white/95 border border-primary-400/30">
              <img src="/loansphere_logo.svg" alt="LoanSphere" className="w-full h-full object-cover" />
            </div>
            <span className="font-display text-2xl text-white">LoanSphere</span>
          </div>
          <h1 className="font-display text-5xl text-white leading-tight mb-6">
            Smart lending,<br />simplified.
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Apply for loans in minutes or manage your lending portfolio — all in one place.
          </p>
        </div>

        <div className="relative grid grid-cols-2 gap-4">
          {[
            { label: 'Applications', value: '2,400+' },
            { label: 'Disbursed', value: '₹48Cr' },
            { label: 'Avg. Approval', value: '< 24h' },
            { label: 'Recovery Rate', value: '97.2%' },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-slate-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md animate-slide-up">{children}</div>
      </div>
    </div>
  );
}
