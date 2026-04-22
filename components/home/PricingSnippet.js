import Link from 'next/link'
import { CheckCircle2, ArrowRight } from 'lucide-react'

export default function PricingSnippet() {
  return (
    <section className="section bg-sky-50 border-t border-sky-100">
      <div className="inner">
        <div className="grid md:grid-cols-2 gap-10 items-center max-w-4xl mx-auto">
          <div>
            <p className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Free for 30 days.<br />From KSh 2,999 after that.
            </h2>
            <p className="text-slate-600 mb-5 text-sm leading-relaxed">
              Full access to every feature from day one — payments, analytics, alerts,
              and integrations. No credit card required. No feature gates during trial.
            </p>
            <div className="flex gap-3">
              <Link href="/pricing" className="btn-secondary text-sm">View all plans <ArrowRight size={14} /></Link>
              <Link href="/trial" className="btn-primary text-sm">Start free trial</Link>
            </div>
          </div>

          <div className="space-y-2.5">
            {[
              { plan: 'Starter',  price: 'KSh 2,999/mo',      for: 'Up to 500 transactions / month' },
              { plan: 'Growth',   price: 'KSh 7,499/mo',      for: 'Up to 5,000 transactions / month', popular: true },
              { plan: 'Business', price: 'From KSh 14,999/mo', for: 'Unlimited transactions' },
            ].map(p => (
              <div key={p.plan} className={`flex items-center justify-between bg-white border rounded-xl px-4 py-3 ${p.popular ? 'border-sky-300 ring-1 ring-sky-300' : 'border-slate-200'}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">{p.plan}</span>
                    {p.popular && <span className="text-[10px] font-bold bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">Popular</span>}
                  </div>
                  <div className="text-xs text-slate-500">{p.for}</div>
                </div>
                <div className="font-bold text-slate-900 text-sm whitespace-nowrap">{p.price}</div>
              </div>
            ))}
            <div className="flex items-center gap-2 pt-1">
              <CheckCircle2 size={13} className="text-emerald-500" />
              <span className="text-xs text-slate-600">All plans include full module access and a 30-day free trial</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
