import Link from 'next/link'
import { ArrowRight, CheckCircle2, TrendingUp, MapPin } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-b from-sky-50 via-white to-slate-50 pt-20 pb-16 px-5 md:px-8 overflow-hidden">
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 0%, black 20%, transparent 75%)',
        }}
      />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-10 items-center">

          {/* Left — copy */}
          <div>
            {/* Location trust badge */}
            <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
              <MapPin size={11} className="flex-shrink-0" />
              Kenya&rsquo;s Leading SaaS Platform &mdash; Based in Nairobi
            </div>

            {/* Stage pill */}
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 ml-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              Free for your first 30 days &mdash; no credit card
            </div>

            {/* H1 — primary keyword target */}
            <h1 className="font-display font-bold text-4xl md:text-5xl text-slate-900 leading-[1.08] mb-5">
              Kenya&rsquo;s #1 SaaS platform<br />
              for business<br />
              <span className="text-sky-500">automation &amp; payments</span>
            </h1>

            {/* First paragraph — keyword rich, readable */}
            <p className="text-slate-600 leading-relaxed mb-6 text-base">
              Gigva is a SaaS platform in Kenya built for Nairobi businesses and SMEs across Kenya.
              It automatically reconciles M-Pesa transactions, manages payroll with Kenya-compliant
              tax calculations, and delivers real-time analytics &mdash; so your business runs smarter,
              not harder.
            </p>

            {/* Quantifiable value statement */}
            <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 mb-6 flex items-start gap-3">
              <TrendingUp size={18} className="text-sky-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-700">
                <strong className="text-slate-900">Over 1,500 businesses across Kenya&rsquo;s 23 counties</strong>{' '}
                use Gigva to automate payments, reconcile M-Pesa, and manage their teams &mdash; saving 3&ndash;4 hours of manual work every week.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Link href="/book-demo" className="btn-primary py-3 px-6 text-sm font-bold justify-center">
                Book a free demo <ArrowRight size={15} />
              </Link>
              <Link href="/trial" className="btn-secondary py-3 px-6 text-sm font-bold justify-center">
                Start free trial
              </Link>
            </div>

            {/* Trust micro-copy */}
            <div className="flex flex-wrap gap-x-5 gap-y-1.5">
              {[
                'No setup fee',
                'M-Pesa connected in under 10 min',
                'Cancel any time',
                'Kenya-hosted data',
              ].map(p => (
                <div key={p} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0" />
                  {p}
                </div>
              ))}
            </div>

            {/* H2 — secondary keyword targeting */}
            <h2 className="mt-6 text-sm font-semibold text-slate-500 uppercase tracking-widest">
              Kenya&rsquo;s Most Trusted Business Software &mdash; Serving Nairobi &amp; East Africa
            </h2>
          </div>

          {/* Right — mini dashboard preview */}
          <div className="hidden md:block">
            <div className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-800 bg-slate-950/70">
                <div className="flex gap-1"><div className="w-2 h-2 rounded-full bg-red-500/60"/><div className="w-2 h-2 rounded-full bg-amber-500/60"/><div className="w-2 h-2 rounded-full bg-emerald-500/60"/></div>
                <span className="text-[10px] text-slate-600 font-mono ml-1">Gigva Dashboard &mdash; Nairobi</span>
                <span className="ml-auto text-[10px] text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"/>Live</span>
              </div>
              {/* Metrics */}
              <div className="grid grid-cols-2 gap-px bg-slate-800 border-b border-slate-800">
                {[
                  { l: "Today's revenue", v: 'KSh 99,250', d: '+12%', c: 'text-emerald-400' },
                  { l: 'Reconciled', v: '5 / 7', d: '71%', c: 'text-sky-400' },
                  { l: 'Unmatched', v: '1', d: 'Review', c: 'text-amber-400' },
                  { l: 'Failed', v: '1', d: 'Alert', c: 'text-red-400' },
                ].map(m => (
                  <div key={m.l} className="bg-slate-900 p-3">
                    <div className="text-[10px] text-slate-500 mb-1">{m.l}</div>
                    <div className="font-display font-bold text-base text-white">{m.v}</div>
                    <div className={`text-[10px] font-semibold ${m.c}`}>{m.d}</div>
                  </div>
                ))}
              </div>
              {/* Mini tx list */}
              <div className="divide-y divide-slate-800">
                {[
                  { from: 'James Mwangi', amount: '15,500', status: 'success', label: 'Reconciled' },
                  { from: 'Sarah Kamau',  amount: '8,200',  status: 'success', label: 'Reconciled' },
                  { from: 'Peter Otieno', amount: '32,000', status: 'flagged', label: 'Unmatched'  },
                  { from: 'Ann Wanjiru',  amount: '5,750',  status: 'success', label: 'Reconciled' },
                ].map((tx, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-800/40">
                    <div>
                      <div className="text-xs text-slate-200 font-medium">{tx.from}</div>
                      <div className="text-[10px] text-slate-500">M-Pesa &middot; C2B</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-display font-bold text-white">KSh {tx.amount}</div>
                      <div className={`text-[10px] font-semibold ${tx.status === 'success' ? 'text-emerald-400' : 'text-amber-400'}`}>{tx.label}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-800">
                <span className="text-[10px] text-slate-600">Last sync: <span className="text-emerald-500">2s ago</span> &middot; Daraja API &middot; Kenya</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
