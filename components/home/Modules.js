import { CreditCard, BarChart3, Brain, Puzzle } from 'lucide-react'

const MODULES = [
  {
    icon: CreditCard,
    name: 'Payments & Reconciliation',
    tag: 'Core',
    color: 'sky',
    description: 'Every M-Pesa payment your retail shop or logistics firm receives is logged, matched to an invoice, and reconciled automatically. Discrepancies are flagged before they become problems.',
    capabilities: [
      'Real-time C2B transaction ingestion via Daraja v2',
      'Automatic invoice matching by amount and reference',
      'Partial payment and overpayment detection',
      'Unmatched transaction alerts within seconds',
      'Reconciliation audit trail (who matched what, when)',
      'End-of-day cash summary',
    ],
  },
  {
    icon: BarChart3,
    name: 'Analytics & Reporting',
    tag: 'Built-in',
    color: 'violet',
    description: 'Revenue dashboards and financial reports built directly on your live M-Pesa data. See daily totals, customer payment trends, and invoice aging — without exporting a single CSV yourself.',
    capabilities: [
      'Daily, weekly, and monthly revenue charts',
      'Top customers ranked by payment volume',
      'Invoice aging report (30 / 60 / 90+ days)',
      'Failed and pending payment summaries',
      'Download reports as CSV or PDF',
      'Custom date range filtering',
    ],
  },
  {
    icon: Brain,
    name: 'Smart Alerts',
    tag: 'Built-in',
    color: 'emerald',
    description: 'Configurable alerts surface anomalies in your payment data before they cost you money — unusual amounts, duplicates, revenue drops, and missing expected payments.',
    capabilities: [
      'Unusual payment amount detection',
      'Duplicate transaction reference check',
      'Customer missing expected payment reminder',
      'Revenue drop notification (configurable)',
      'Unmatched invoice follow-up alert',
      'In-app and email delivery',
    ],
  },
  {
    icon: Puzzle,
    name: 'Integrations',
    tag: 'Connect',
    color: 'amber',
    description: 'Connect Gigva to your existing tools via REST API or outbound webhooks. Export in formats your accountant can use directly — no manual reformatting.',
    capabilities: [
      'REST API with OpenAPI documentation',
      'Outbound webhooks on payment events',
      'QuickBooks-compatible CSV export',
      'Xero-compatible CSV export',
      'API key management with per-key scopes',
      'Webhook retry with exponential back-off',
    ],
  },
]

const C = {
  sky:    { bg: 'bg-sky-50',    border: 'border-sky-100',    icon: 'bg-sky-100 text-sky-600',    tag: 'bg-sky-100 text-sky-700'    },
  violet: { bg: 'bg-violet-50', border: 'border-violet-100', icon: 'bg-violet-100 text-violet-600', tag: 'bg-violet-100 text-violet-700' },
  emerald:{ bg: 'bg-emerald-50',border: 'border-emerald-100',icon: 'bg-emerald-100 text-emerald-600',tag:'bg-emerald-100 text-emerald-700'},
  amber:  { bg: 'bg-amber-50',  border: 'border-amber-100',  icon: 'bg-amber-100 text-amber-600',  tag: 'bg-amber-100 text-amber-700'  },
}

export default function Modules() {
  return (
    <section className="section bg-slate-50 border-t border-slate-200">
      <div className="inner">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-3">One Platform</p>
          <h2 className="text-3xl md:text-4xl font-display text-slate-900 mb-4">
            Four modules. One account. One invoice.
          </h2>
          <p className="text-slate-600 leading-relaxed">
            Gigva is a single platform — not a bundle of separate products. Every module shares the 
            same transaction data, the same interface, and the same subscription. Retail shops and 
            SMEs get everything they need without paying for tools they will never use.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {MODULES.map(mod => {
            const c = C[mod.color]
            const Icon = mod.icon
            return (
              <div key={mod.name} className={`${c.bg} border ${c.border} rounded-2xl p-6 hover:shadow-sm transition-shadow`}>
                <div className="flex items-start gap-4 mb-5">
                  <div className={`w-10 h-10 rounded-xl ${c.icon} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={19} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-display font-bold text-slate-900 text-base">{mod.name}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.tag}`}>{mod.tag}</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{mod.description}</p>
                  </div>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 pl-14">
                  {mod.capabilities.map(cap => (
                    <li key={cap} className="text-xs text-slate-700 flex items-start gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
                      {cap}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
