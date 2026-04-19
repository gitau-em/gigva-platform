import Link from 'next/link'
import DashboardPreview from '@/components/product/DashboardPreview'
import {
  ArrowRight, CreditCard, BarChart3, Brain, Puzzle, CheckCircle2,
  RefreshCcw, Bell, ShoppingBag, Truck, UtensilsCrossed, Briefcase,
} from 'lucide-react'

export const metadata = {
  title: 'Product',
  description:
    'One platform to reconcile M-Pesa payments, track revenue, and generate reports for Kenyan retail shops, logistics firms, and SMEs.',
}

/* ─── Feature data ──────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: CreditCard,
    title: 'M-Pesa Payment Tracking',
    tag: 'Core',
    summary: 'Every inbound M-Pesa payment is captured in real time.',
    detail: `When a customer pays to your Paybill or Till number, Safaricom sends a webhook notification via the Daraja v2 API. Gigva receives that notification within 3–5 seconds and records the transaction — including the amount, customer reference, MSISDN, and timestamp — against your account. The transaction is immediately visible in your dashboard without any manual data entry, download, or refresh. You see every payment as it happens, whether you process 10 or 500 transactions a day.`,
    items: [
      'Real-time C2B ingest via Daraja v2 webhook',
      'Auto-capture: amount, reference, sender, timestamp',
      'Partial payment and overpayment detection',
      'Duplicate reference detection across payment dates',
      'Immutable transaction history with audit trail',
      'Searchable by amount, reference, or customer number',
    ],
    color: 'sky',
  },
  {
    icon: RefreshCcw,
    title: 'Automated Reconciliation',
    tag: 'Core',
    summary: 'Payments are matched to invoices automatically — no spreadsheets.',
    detail: `As each M-Pesa payment arrives, Gigva compares it against your open invoices using the customer reference number and payment amount. When a match is found, the invoice is marked reconciled and the payment is linked to it. Partial payments are flagged separately so you know which invoices are still outstanding and by how much. Payments that cannot be matched automatically are placed in a flagged queue with all the information needed to resolve them quickly — the entire process runs without manual intervention.`,
    items: [
      'Auto-match by customer reference and amount',
      'Partial payment tracking with outstanding balance',
      'Overpayment detection and credit allocation',
      'Unmatched payment queue with resolution workflow',
      'End-of-day reconciliation summary report',
      'Full reconciliation log: who matched what, and when',
    ],
    color: 'violet',
  },
  {
    icon: BarChart3,
    title: 'Transaction Dashboard',
    tag: 'Built-in',
    summary: 'A live view of your payment activity — updated automatically.',
    detail: `The Gigva dashboard gives you a real-time view of today's incoming payments, total revenue, and any transactions that need attention. Every figure is drawn from your actual transaction data, not a sample or estimate. Retail operators can see which customers have paid and which invoices are outstanding at any point in the day. Logistics teams can filter by delivery order or customer account. The dashboard retains a full searchable history so you can review any prior period without downloading anything.`,
    items: [
      'Live today-view: payments received, total revenue',
      'Search and filter by customer, date range, or amount',
      'Outstanding invoice summary with aging flags',
      'Flagged and unmatched transaction review queue',
      'Per-customer payment history view',
      'Mobile-accessible from any device',
    ],
    color: 'emerald',
  },
  {
    icon: BarChart3,
    title: 'Reporting & Analytics',
    tag: 'Built-in',
    summary: 'Revenue reports built from your live data, ready for your accountant.',
    detail: `Gigva generates daily, weekly, and monthly revenue reports from your reconciled transaction data. Invoice aging reports show which customers owe money and for how long — at 30, 60, and 90+ day thresholds. Top-customer reports rank payers by volume so you can identify which accounts drive the most revenue. All reports export as PDF or CSV in a format compatible with QuickBooks and Xero, so you can hand a clean report to your accountant without any additional formatting.`,
    items: [
      'Daily, weekly, and monthly revenue charts',
      'Invoice aging report: 30 / 60 / 90+ days overdue',
      'Top customers by M-Pesa payment volume',
      'Failed and pending payment summaries',
      'PDF and CSV export for accountants',
      'Custom date-range filtering across all reports',
    ],
    color: 'sky',
  },
  {
    icon: Bell,
    title: 'Alerts & Notifications',
    tag: 'Built-in',
    summary: 'Configurable alerts that catch payment problems before they cost you.',
    detail: `Gigva monitors your payment data continuously and sends alerts when something requires attention. If a payment arrives with an unusual amount compared to historical patterns for that customer, you are notified. If a customer who pays on a regular cycle misses their expected payment window, you receive a reminder with the invoice details. Revenue drop alerts fire if daily income falls below a threshold you configure. Alerts are delivered in-app and by email, each linking directly to the relevant transaction or invoice.`,
    items: [
      'Unusual payment amount detection',
      'Duplicate transaction reference check',
      'Customer missing expected payment alert',
      'Revenue drop notification (configurable threshold)',
      'Unmatched invoice follow-up reminder',
      'In-app and email delivery with direct transaction links',
    ],
    color: 'amber',
  },
  {
    icon: Puzzle,
    title: 'Integrations',
    tag: 'Connect',
    summary: 'Connect Gigva to your existing tools via REST API or outbound webhooks.',
    detail: `Gigva exposes a fully documented REST API that allows your developers to push invoice data in, pull reconciled payment data out, and trigger workflows programmatically. Outbound webhooks notify your own systems when a payment is reconciled or an alert fires — useful for triggering fulfilment workflows in logistics platforms or updating balances in accounting software. API keys are scoped per integration, so a read-only key shared with your accountant cannot modify data. A sandbox environment lets developers test integrations without touching live transaction data.`,
    items: [
      'REST API with full OpenAPI documentation',
      'Outbound webhooks on payment and reconciliation events',
      'QuickBooks and Xero-compatible CSV export',
      'Per-key permission scopes for API credentials',
      'Webhook retry with exponential back-off',
      'Sandbox / test mode for integration development',
    ],
    color: 'violet',
  },
]

/* ─── Industry use-cases ─────────────────────────────────────────────────── */
const USE_CASES = [
  {
    slug: 'retail',
    icon: ShoppingBag,
    industry: 'Retail Shops',
    tagline: 'High transaction volume. Zero time to reconcile manually.',
    problem: `A retail or wholesale shop collecting M-Pesa payments can process 50–300 transactions a day across Paybill and Till numbers. By Friday, someone on the team downloads the M-Pesa statement, opens Excel, and tries to match each line to a sale or outstanding customer balance. A single day's mismatch can take 2–3 hours to trace. Over a month, disputed payments and unposted credits accumulate into material accounting errors that are difficult and time-consuming to untangle.`,
    solution: `Gigva ingests each payment as it arrives and checks it immediately against open customer invoices. A retail operator starting the day in Gigva sees which customers paid overnight, which invoices are still outstanding, and how yesterday's revenue compares to the same day last week. Daily and weekly reconciliation reports are available without any manual work — ready to share with a bookkeeper or accountant at any time.`,
    outcomes: [
      'End-of-day reconciliation completed automatically',
      'Outstanding customer balances visible in real time',
      'Weekly revenue reports available without spreadsheet work',
    ],
    color: 'sky',
  },
  {
    slug: 'logistics',
    icon: Truck,
    industry: 'Logistics Firms',
    tagline: 'Match payments to deliveries. Eliminate payment disputes.',
    problem: `For a logistics or courier business, each delivery generates a payment instruction: the customer pays M-Pesa on receipt of goods. With 40–200 deliveries per day, tracking which payments have arrived — and matching each to the correct delivery order — becomes a full-time administrative task. Disputes arise when drivers report a delivery as complete but payment is unconfirmed, or when M-Pesa references do not match order numbers in the system.`,
    solution: `Gigva lets logistics operators load delivery orders as invoices and match incoming M-Pesa payments to specific delivery references. When a payment arrives with the correct order reference, it is reconciled automatically. Unmatched or incorrectly referenced payments are flagged immediately, so dispatch teams can follow up with the driver or customer before the end of the day — rather than discovering the discrepancy at week-end.`,
    outcomes: [
      'Each delivery payment matched to its order automatically',
      'Disputed and unmatched payments resolved same day',
      'Payment confirmation available to dispatch in real time',
    ],
    color: 'violet',
  },
  {
    slug: 'restaurants',
    icon: UtensilsCrossed,
    industry: 'Restaurants & F&B',
    tagline: 'Multiple daily transactions. End-of-day accounts done automatically.',
    problem: `Restaurants and food service businesses collecting M-Pesa payments — from dine-in customers, delivery orders, or wholesale distributors — accumulate dozens to hundreds of transactions per day. Matching those payments to individual orders or customer accounts at day-end is time-consuming. Errors are easy to miss until month-end, when cash flow does not reconcile with the register and tracing the source takes significant time.`,
    solution: `Gigva provides F&B operators a live dashboard of the day's M-Pesa receipts sorted by time and amount. For businesses with recurring distributor payments, Gigva tracks expected payment cycles and alerts staff when a regular payment is overdue. End-of-day totals are generated automatically with a breakdown by payment type, ready to hand directly to a bookkeeper without additional formatting.`,
    outcomes: [
      'Live view of the day\'s M-Pesa receipts at any point',
      'Regular distributor payments tracked and flagged if late',
      'End-of-day cash reconciliation generated automatically',
    ],
    color: 'emerald',
  },
  {
    slug: 'services',
    icon: Briefcase,
    industry: 'Service Businesses',
    tagline: 'Invoice-based payments. Know exactly who has paid and who has not.',
    problem: `Clinics, schools, professional services firms, and other invoice-based businesses issue payment instructions to clients and then wait for M-Pesa payments to arrive. Without an automated system, tracking which clients have paid — and which invoices remain outstanding — requires regularly cross-referencing M-Pesa statements against a debtor list. Unpaid invoices are easy to miss, particularly at month-end when chasing them becomes urgent and cash flow is under pressure.`,
    solution: `Gigva tracks each issued invoice and matches incoming M-Pesa payments to the correct client account by reference. As payments arrive, invoices are marked settled automatically. Overdue invoices appear on the aging report, giving finance or admin staff a clear, current list of who to follow up with and exactly how much each client owes. Partial payments are tracked and the outstanding balance is updated in real time.`,
    outcomes: [
      'Every invoice matched to its M-Pesa payment automatically',
      'Overdue invoice list always current — no manual tracking needed',
      'Partial payment balances tracked and updated in real time',
    ],
    color: 'amber',
  },
]

/* ─── Color map ──────────────────────────────────────────────────────────── */
const COLOR = {
  sky:     { border: 'border-sky-100',     bg: 'bg-sky-50',     icon: 'bg-sky-100 text-sky-600',      tag: 'bg-sky-100 text-sky-700',      accent: 'text-sky-600'     },
  violet:  { border: 'border-violet-100',  bg: 'bg-violet-50',  icon: 'bg-violet-100 text-violet-600', tag: 'bg-violet-100 text-violet-700', accent: 'text-violet-600'  },
  emerald: { border: 'border-emerald-100', bg: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-600', tag: 'bg-emerald-100 text-emerald-700', accent: 'text-emerald-600' },
  amber:   { border: 'border-amber-100',   bg: 'bg-amber-50',   icon: 'bg-amber-100 text-amber-600',   tag: 'bg-amber-100 text-amber-700',   accent: 'text-amber-600'   },
}

export default function ProductPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-b from-sky-50 to-white pt-16 pb-12 px-5 md:px-8">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-3">The Product</p>
          <h1 className="text-4xl md:text-5xl font-display text-slate-900 mb-5 leading-tight">
            One platform.<br />
            <span className="text-sky-500">Every M-Pesa payment accounted for.</span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed mb-6 max-w-2xl">
            Gigva is a unified business operating system built for Kenyan retail shops,
            logistics firms, and SMEs. It is one platform — not a bundle of separate tools —
            where your M-Pesa payments, financial reports, and business alerts all live together.
          </p>
          <div className="inline-flex items-center gap-3 bg-slate-900 text-white rounded-xl px-5 py-3 mb-8">
            <span className="text-sky-400 font-display font-bold text-xl">300+</span>
            <span className="text-sm text-slate-300">daily M-Pesa transactions reconciled automatically — in under 60 seconds</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/book-demo" className="btn-primary py-3 px-6 text-sm">
              Book a demo <ArrowRight size={15} />
            </Link>
            <Link href="/pricing" className="btn-secondary py-3 px-6 text-sm">
              See pricing
            </Link>
          </div>
        </div>
      </section>

      {/* ── Product Overview ── */}
      <section className="section bg-white border-t border-slate-200">
        <div className="inner max-w-4xl">
          <div className="mb-10">
            <p className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-3">What Gigva Is</p>
            <h2 className="text-3xl font-display text-slate-900 mb-2">
              A payment operations platform built for how Kenyan businesses actually work
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-5 text-sm text-slate-700 leading-relaxed">
              <p>
                Gigva is a web-based platform that connects to your M-Pesa Paybill or Till number
                and gives you a complete, real-time record of every inbound payment. It then
                matches those payments to your invoices automatically — without you downloading
                statements, opening Excel, or doing any manual cross-referencing.
              </p>
              <p>
                The platform is built for Kenyan small and medium businesses that collect payments
                via M-Pesa: retail and wholesale shops, logistics operators, restaurants, clinics,
                schools, and service-based businesses. If your business receives M-Pesa payments
                and you currently track them manually — in a spreadsheet, a notebook, or the
                M-Pesa portal — Gigva is designed to replace that process entirely.
              </p>
              <p>
                The core problem Gigva solves is specific: M-Pesa is Kenya's dominant payment
                method, but Safaricom's business tools are designed to confirm transactions, not
                manage them. Reconciling M-Pesa statements against invoices is a manual process
                that costs businesses 3–10 hours per week and produces errors that are often only
                discovered weeks after the fact.
              </p>
            </div>
            <div className="space-y-5 text-sm text-slate-700 leading-relaxed">
              <p>
                Gigva integrates directly with Safaricom Daraja v2 via a C2B webhook. When a
                customer pays your Paybill or Till, Safaricom sends a notification to Gigva within
                3–5 seconds. Gigva records the payment, compares it against your open invoices,
                and marks the invoice reconciled if the reference and amount match. Payments that
                do not match are flagged for review with enough information to resolve them quickly.
              </p>
              <p>
                Beyond reconciliation, the platform provides analytics, reporting, and configurable
                alerts — all built on your actual transaction data. There is no manual data entry
                required at any point. Reports are generated from the same data that drives
                reconciliation, so what you see in a report reflects exactly what happened.
              </p>
              <p>
                Gigva does not replace your accounting software. It sits between your M-Pesa
                account and your books, handling the step that accounting software does not do for
                M-Pesa: payment tracking and automated reconciliation.
              </p>
            </div>
          </div>

          {/* How it works */}
          <div className="mt-12 bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8">
            <h3 className="font-display font-bold text-slate-900 mb-6 text-sm uppercase tracking-wider">How it works</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { step: '01', title: 'Customer pays', detail: 'Customer sends M-Pesa to your Paybill or Till number as normal' },
                { step: '02', title: 'Gigva captures', detail: 'Daraja webhook delivers the transaction to Gigva within 3–5 seconds' },
                { step: '03', title: 'Auto-match', detail: 'Gigva compares the payment against your open invoices and reconciles if matched' },
                { step: '04', title: 'Dashboard updates', detail: 'Payment appears in your dashboard. Reports and alerts reflect the new data immediately' },
              ].map(({ step, title, detail }) => (
                <div key={step} className="flex flex-col gap-2">
                  <div className="text-xs font-bold text-sky-500 font-display">{step}</div>
                  <div className="font-semibold text-slate-900 text-sm">{title}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Live dashboard ── */}
      <DashboardPreview />

      {/* ── Architecture callout ── */}
      <section className="bg-slate-900 py-10 px-5 md:px-8 border-y border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'M-Pesa integration', val: 'Daraja v2 C2B' },
              { label: 'Transaction capture', val: '3–5 seconds' },
              { label: 'Password hashing', val: 'bcrypt cost 12' },
              { label: 'Data location', val: 'Kenya-hosted' },
            ].map(({ label, val }) => (
              <div key={label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                <div className="text-[11px] text-slate-500 mb-1">{label}</div>
                <div className="font-display font-bold text-sky-400 text-sm">{val}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features (detailed) ── */}
      <section className="section bg-white border-t border-slate-200">
        <div className="inner">
          <div className="max-w-xl mb-12">
            <p className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-3">Platform Features</p>
            <h2 className="text-3xl font-display text-slate-900 mb-4">
              Six features. One subscription.
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              Every feature is available on every plan. The difference between plans is transaction
              volume capacity, not feature access. A retail shop on Starter gets the same
              reconciliation engine as a logistics operator on Business.
            </p>
          </div>

          <div className="space-y-6">
            {FEATURES.map(feat => {
              const c = COLOR[feat.color]
              const Icon = feat.icon
              return (
                <div key={feat.title} className={`${c.bg} border ${c.border} rounded-2xl p-6 md:p-8`}>
                  <div className="grid md:grid-cols-5 gap-6">
                    <div className="md:col-span-3 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-xl ${c.icon} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <Icon size={19} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-display font-bold text-slate-900">{feat.title}</h3>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${c.tag}`}>{feat.tag}</span>
                          </div>
                          <p className={`text-sm font-semibold ${c.accent} mb-3`}>{feat.summary}</p>
                          <p className="text-sm text-slate-700 leading-relaxed">{feat.detail}</p>
                        </div>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">What's included</p>
                      <ul className="space-y-2">
                        {feat.items.map(item => (
                          <li key={item} className="flex items-start gap-2 text-xs text-slate-700">
                            <CheckCircle2 size={12} className="text-slate-400 mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Industry Use Cases ── */}
      <section className="section bg-slate-50 border-t border-slate-200">
        <div className="inner">
          <div className="max-w-xl mb-12">
            <p className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-3">Who Gigva Is For</p>
            <h2 className="text-3xl font-display text-slate-900 mb-4">
              Built for businesses that run on M-Pesa
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              Gigva is not a general-purpose accounting tool. It is designed specifically for
              Kenyan businesses where M-Pesa is the primary payment method and manual
              reconciliation is a daily operational cost.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {USE_CASES.map(uc => {
              const c = COLOR[uc.color]
              const Icon = uc.icon
              return (
                <div key={uc.industry} id={uc.slug} className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-5 scroll-mt-24">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl ${c.icon} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={19} />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-slate-900 mb-0.5">{uc.industry}</h3>
                      <p className={`text-xs font-semibold ${c.accent}`}>{uc.tagline}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">The problem</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{uc.problem}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">How Gigva helps</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{uc.solution}</p>
                  </div>

                  <div className={`${c.bg} border ${c.border} rounded-xl p-4`}>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Outcomes</p>
                    <ul className="space-y-1.5">
                      {uc.outcomes.map(o => (
                        <li key={o} className="flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle2 size={11} className={`${c.accent} mt-0.5 flex-shrink-0`} />
                          {o}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-8 bg-white border border-slate-200 rounded-xl p-5 max-w-2xl">
            <p className="text-sm text-slate-700 leading-relaxed">
              <span className="font-semibold text-slate-900">Not sure if Gigva fits your business?</span>{' '}
              Book a 30-minute demo and describe your current payment workflow. We will walk you
              through a realistic scenario based on your transaction type and tell you honestly
              whether Gigva will solve your problem.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section bg-sky-500">
        <div className="inner text-center max-w-xl">
          <h2 className="text-3xl font-display text-white mb-4">See it with your own transactions</h2>
          <p className="text-sky-100 mb-6 text-sm leading-relaxed">
            Book a 30-minute demo and we will walk through the platform using a realistic
            dataset that mirrors your business type.
          </p>
          <div className="flex gap-3 justify-center flex-col sm:flex-row">
            <Link href="/book-demo" className="btn-primary bg-white text-sky-600 border-white hover:bg-sky-50 justify-center">
              Book a demo <ArrowRight size={15} />
            </Link>
            <Link href="/pricing" className="btn-secondary bg-transparent text-sky-100 border-sky-300 hover:bg-sky-400 hover:text-white justify-center">
              See pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
