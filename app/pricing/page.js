import Link from 'next/link'
import { CheckCircle2, X, ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Pricing',
  description: 'Simple, transparent pricing for Gigva. Free for 3 months, then from KSh 2,999/month. No lock-in.',
}

const PLANS = [
  {
    name: 'Starter',
    price: 'KSh 2,999',
    period: '/month',
    description: 'For small retail shops and service businesses processing up to 500 M-Pesa transactions per month.',
    highlight: false,
    badge: null,
    features: [
      { text: 'Up to 500 transactions / month',         yes: true  },
      { text: 'Real-time M-Pesa transaction ingestion', yes: true  },
      { text: 'Automatic invoice matching',             yes: true  },
      { text: 'Reconciliation dashboard',               yes: true  },
      { text: 'CSV export',                             yes: true  },
      { text: 'Smart alerts (top 3 alert types)',       yes: true  },
      { text: 'Unlimited team members',                 yes: false },
      { text: 'API access',                             yes: false },
      { text: 'Webhook integrations',                   yes: false },
      { text: 'PDF reports',                            yes: false },
    ],
    cta: 'Start free trial',
    ctaHref: '/trial',
  },
  {
    name: 'Growth',
    price: 'KSh 7,499',
    period: '/month',
    description: 'For growing logistics firms, distributors, and SMEs processing higher daily transaction volumes.',
    highlight: true,
    badge: 'Most popular',
    features: [
      { text: 'Up to 5,000 transactions / month',      yes: true  },
      { text: 'Real-time M-Pesa transaction ingestion', yes: true  },
      { text: 'Automatic invoice matching',             yes: true  },
      { text: 'Reconciliation dashboard',               yes: true  },
      { text: 'CSV and PDF export',                     yes: true  },
      { text: 'Smart alerts (all alert types)',         yes: true  },
      { text: 'Unlimited team members',                 yes: true  },
      { text: 'API access',                             yes: true  },
      { text: 'Webhook integrations',                   yes: true  },
      { text: 'Priority email support',                 yes: false },
    ],
    cta: 'Start free trial',
    ctaHref: '/trial',
  },
  {
    name: 'Business',
    price: 'From KSh 14,999',
    period: '/month',
    description: 'For established SMEs, retail chains, and businesses requiring high volumes, dedicated support, and custom setup.',
    highlight: false,
    badge: null,
    features: [
      { text: 'Unlimited transactions',                 yes: true  },
      { text: 'Real-time M-Pesa transaction ingestion', yes: true  },
      { text: 'Automatic invoice matching',             yes: true  },
      { text: 'Reconciliation dashboard',               yes: true  },
      { text: 'CSV and PDF export',                     yes: true  },
      { text: 'Smart alerts (all alert types)',         yes: true  },
      { text: 'Unlimited team members',                 yes: true  },
      { text: 'API access',                             yes: true  },
      { text: 'Webhook integrations',                   yes: true  },
      { text: 'Priority support + onboarding session',  yes: true  },
    ],
    cta: 'Talk to us',
    ctaHref: '/contact',
  },
]

const FAQS = [
  { q: 'What counts as a transaction?', a: 'Any M-Pesa C2B payment received into your registered Paybill or Till number. Outgoing payments (B2C) are not counted toward your limit.' },
  { q: 'What happens after the 3-month free trial?', a: 'We will email you a reminder 7 days before your trial ends. You choose a plan or your account is paused — no automatic charges, no credit card required for the trial.' },
  { q: 'Can I upgrade or downgrade my plan?', a: 'Yes, at any time. Upgrades take effect immediately. Downgrades take effect at the next billing date. You will not be charged twice for the same period.' },
  { q: 'Is the free trial really full access?', a: 'Yes. Every feature in every module is available during your trial. There are no feature gates or plan restrictions for the first 3 months.' },
  { q: 'Do I need to enter a credit card for the trial?', a: 'No. You get 3 months of full access without a payment method. We only ask for payment details when you choose to continue.' },
  { q: 'What happens to my data if I cancel?', a: 'You can export all your transaction data and reports at any time. After cancellation, your account is paused for 90 days before data is deleted — giving you time to reconsider or export.' },
]

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-sky-50 to-white pt-16 pb-12 px-5 md:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-3">Pricing</p>
          <h1 className="text-4xl md:text-5xl font-display text-slate-900 mb-4 leading-tight">
            Simple pricing. No surprises.
          </h1>
          <p className="text-slate-600 text-lg leading-relaxed mb-4">
            Full access for 3 months, free. After that, pay based on how many 
            M-Pesa transactions you process per month. No lock-in, no setup fee.
          </p>
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold px-4 py-2 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            3 months free · No credit card required
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="section bg-white border-t border-slate-100">
        <div className="inner">
          <div className="grid md:grid-cols-3 gap-6 items-start mb-16">
            {PLANS.map(plan => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-6 transition-shadow ${
                  plan.highlight
                    ? 'border-sky-400 ring-2 ring-sky-400/30 shadow-lg shadow-sky-100 bg-white'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                {plan.badge && (
                  <div className="mb-4">
                    <span className="bg-sky-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <h2 className="font-display font-bold text-xl text-slate-900 mb-1">{plan.name}</h2>
                <div className="mb-1 flex items-baseline gap-1">
                  <span className="font-display font-bold text-3xl text-slate-900">{plan.price}</span>
                  <span className="text-slate-500 text-sm">{plan.period}</span>
                </div>
                <p className="text-sm text-slate-600 mb-5 leading-relaxed">{plan.description}</p>

                <Link
                  href={plan.ctaHref}
                  className={`flex w-full justify-center items-center gap-2 mb-6 py-2.5 font-bold text-sm rounded-lg transition-all ${
                    plan.highlight
                      ? 'bg-sky-500 text-white hover:bg-sky-600'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-sky-400 hover:text-sky-600'
                  }`}
                >
                  {plan.cta} <ArrowRight size={14} />
                </Link>

                <ul className="space-y-2.5">
                  {plan.features.map(f => (
                    <li key={f.text} className={`flex items-start gap-2.5 text-sm ${f.yes ? 'text-slate-700' : 'text-slate-400'}`}>
                      {f.yes
                        ? <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                        : <X size={14} className="text-slate-300 flex-shrink-0 mt-0.5" />}
                      {f.text}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="max-w-2xl mx-auto">
            <h3 className="font-display font-bold text-2xl text-slate-900 mb-8 text-center">
              Frequently asked questions
            </h3>
            <div className="space-y-0">
              {FAQS.map(({ q, a }) => (
                <div key={q} className="border-b border-slate-200 py-5 last:border-0">
                  <h4 className="font-semibold text-slate-900 mb-2 text-sm">{q}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{a}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
              <h4 className="font-display font-bold text-slate-900 mb-2">Not sure which plan is right?</h4>
              <p className="text-sm text-slate-600 mb-4">Book a 30-minute call and we will tell you honestly which plan fits your transaction volume — or whether the free trial is enough to decide.</p>
              <Link href="/book-demo" className="btn-primary">Book a demo <ArrowRight size={14} /></Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
