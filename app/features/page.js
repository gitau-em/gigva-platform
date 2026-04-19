import { CheckCircle2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Features',
  description:
    'Full feature list for Gigva — how M-Pesa reconciliation, analytics, smart alerts, and integrations work for Kenyan retail shops, logistics firms, and SMEs.',
}

const WORKFLOWS = [
  {
    id: 'reconciliation',
    title: 'How M-Pesa reconciliation works',
    subtitle: 'From payment received to reconciled invoice — for retail shops processing 50–500 daily M-Pesa transactions',
    steps: [
      {
        label: 'Customer pays your Paybill or Till',
        detail: 'Your customer sends M-Pesa to your registered Paybill or Till number. Safaricom processes the payment and sends a C2B callback to Gigva within 3–5 seconds.',
        in:  'Customer M-Pesa payment',
        out: 'C2B webhook delivered to Gigva',
      },
      {
        label: 'Transaction is recorded immediately',
        detail: 'Gigva logs the full transaction: sender name, phone number, M-Pesa reference code, amount, and exact timestamp. This record is immutable — it cannot be edited, only supplemented.',
        in:  'Raw Daraja C2B payload',
        out: 'Structured transaction record (name, phone, ref, amount, timestamp)',
      },
      {
        label: 'System attempts to match to an open invoice',
        detail: 'Gigva compares the payment amount and reference against your open invoices. If the amount matches an outstanding invoice exactly, the invoice is marked paid and the transaction is marked reconciled automatically.',
        in:  'Transaction + your open invoices',
        out: 'Invoice marked paid · transaction status: Reconciled',
      },
      {
        label: 'Mismatches are flagged for review',
        detail: 'Partial payments, unrecognised references, and amounts that do not match any open invoice are flagged in your dashboard. Each flag includes the full transaction detail and a list of the closest matching open invoices.',
        in:  'Unmatched or partial payment',
        out: 'Flag in dashboard + email alert + suggested invoices',
      },
      {
        label: 'You resolve flags with one action',
        detail: 'For each flagged transaction, you choose: match to a suggested invoice, match to any other invoice manually, split across multiple invoices, or mark as other income. Every action is logged.',
        in:  'Admin review action',
        out: 'Transaction resolved · override logged with user and timestamp',
      },
      {
        label: 'Reports are available any time',
        detail: 'Pull a reconciliation report for any date range: all transactions, their match status, outstanding invoices, and a cash summary. Download as CSV for import into your accounting tool or PDF for filing.',
        in:  'Date range + status filter',
        out: 'Reconciliation report (CSV or PDF)',
      },
    ],
  },
  {
    id: 'alerts',
    title: 'How smart alerts work',
    subtitle: 'How Gigva surfaces payment anomalies for logistics firms and SMEs before they become problems',
    steps: [
      {
        label: 'Baseline established over 30 days',
        detail: 'Gigva learns your payment patterns during the first 30 days: typical daily volume, average transaction amounts, and which customers pay regularly. This baseline is used for anomaly detection.',
        in:  '30 days of transaction history',
        out: 'Customer baseline model (per account)',
      },
      {
        label: 'Every transaction is scored',
        detail: 'Each incoming payment is compared against your baseline. Transactions with amounts significantly above or below your typical range for that customer are flagged for review.',
        in:  'Incoming transaction',
        out: 'Anomaly score (high / normal / low)',
      },
      {
        label: 'Rule-based checks run in parallel',
        detail: 'Alongside anomaly scoring, fixed rules run every time: duplicate reference detection (same reference used twice), missing invoice check (transaction has no matching invoice after 24 hours), and configured revenue thresholds.',
        in:  'Transaction + business rules',
        out: 'Rule match flags (duplicate / missing invoice / threshold breach)',
      },
      {
        label: 'Alert created with context',
        detail: 'When a score or rule triggers, Gigva creates an alert that includes the full transaction detail, the specific rule or score that triggered it, and a suggested action (review transaction, chase invoice, check for duplicate).',
        in:  'Anomaly score or rule match',
        out: 'Structured alert with context and suggested action',
      },
      {
        label: 'Alert delivered and resolved',
        detail: 'Alerts appear in your dashboard notification panel and are sent to your registered email address. You mark each alert resolved or take the suggested action. Resolved alerts are logged with a timestamp.',
        in:  'Unresolved alert',
        out: 'Email notification + in-app alert · resolved with audit log entry',
      },
    ],
  },
]

const ALL_FEATURES = [
  {
    category: 'Payments & Reconciliation',
    items: [
      'M-Pesa C2B Daraja v2 webhook ingestion',
      'Real-time transaction feed (3–5 second capture)',
      'Auto-match by payment amount and customer reference',
      'Partial payment detection and flagging',
      'Duplicate transaction reference detection',
      'Manual match with override log (user + timestamp)',
      'Invoice status sync: paid, partial, outstanding',
      'End-of-day reconciliation summary (in-app + email)',
    ],
  },
  {
    category: 'Analytics & Reporting',
    items: [
      'Daily revenue chart with previous period comparison',
      'Weekly and monthly revenue summaries',
      'Top customers by M-Pesa payment volume',
      'Invoice aging report: 30 / 60 / 90+ days',
      'Failed and pending payment summaries',
      'Payment timing analysis (when customers pay)',
      'CSV export — all transactions, all date ranges',
      'PDF report formatted for accountants',
    ],
  },
  {
    category: 'Smart Alerts',
    items: [
      'Unusual payment amount alert (per-customer baseline)',
      'Duplicate transaction reference detection',
      'Revenue below threshold notification',
      'Customer missing expected payment alert',
      'Invoice unmatched after 24 hours',
      'Invoice overdue escalation (configurable days)',
      'Configurable alert thresholds per business',
      'In-app and email delivery per alert type',
    ],
  },
  {
    category: 'Integrations',
    items: [
      'REST API with OpenAPI documentation',
      'Outbound webhooks: payment.received, payment.reconciled, payment.flagged',
      'QuickBooks-compatible CSV export format',
      'Xero-compatible CSV export format',
      'API key management with per-key permission scopes',
      'Request log with HTTP status and latency',
      'Webhook retry: exponential back-off, up to 5 attempts',
      'Test mode for integration development (no real data)',
    ],
  },
  {
    category: 'Account & Security',
    items: [
      'Multi-user accounts with roles: owner, accountant, viewer',
      'bcrypt password hashing — cost factor 12 (~250ms per hash)',
      'JWT sessions — 7-day expiry, HS256',
      'Login audit log (IP, timestamp, outcome)',
      'AES-256 data encryption at rest',
      'TLS 1.3 for all data in transit',
      'Kenya-hosted data — no cross-border transfer',
      'Two-factor authentication (roadmap Q3 2025)',
    ],
  },
]

export default function FeaturesPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-sky-50 to-white pt-16 pb-12 px-5 md:px-8">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-3">Features</p>
          <h1 className="text-4xl md:text-5xl font-display text-slate-900 mb-5 leading-tight">
            What Gigva does, step by step
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            No marketing descriptions. Below is exactly how Gigva works — workflow by workflow, 
            with the specific input and output at each step. Designed for Kenyan retail shops, 
            logistics operators, and SMEs handling daily M-Pesa transactions.
          </p>
        </div>
      </section>

      {/* Workflow walkthroughs */}
      <section className="section bg-white border-t border-slate-200">
        <div className="inner">
          <div className="space-y-20">
            {WORKFLOWS.map(wf => (
              <div key={wf.id}>
                <div className="max-w-2xl mb-8">
                  <h2 className="text-2xl font-display text-slate-900 mb-2">{wf.title}</h2>
                  <p className="text-sm text-slate-500 leading-relaxed">{wf.subtitle}</p>
                </div>

                <div className="relative">
                  <div className="absolute left-[19px] top-5 bottom-5 w-0.5 bg-sky-100 hidden md:block" />
                  <div className="space-y-3">
                    {wf.steps.map((s, i) => (
                      <div key={i} className="relative md:pl-14">
                        {/* Step circle */}
                        <div className="hidden md:flex absolute left-0 top-3 w-10 h-10 rounded-full bg-sky-500 text-white items-center justify-center font-display font-bold text-sm z-10 shadow-sm">
                          {i + 1}
                        </div>
                        <div className="border border-slate-200 bg-slate-50 rounded-xl p-4 hover:border-sky-200 transition-colors">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="md:hidden w-7 h-7 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {i + 1}
                            </div>
                            <h3 className="font-semibold text-slate-900 text-sm">{s.label}</h3>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed mb-3">{s.detail}</p>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs flex-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex-shrink-0">IN</span>
                              <span className="text-slate-700">{s.in}</span>
                            </div>
                            <div className="hidden sm:flex items-center text-slate-300 font-bold">→</div>
                            <div className="flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-lg px-3 py-1.5 text-xs flex-1">
                              <span className="text-[10px] font-bold text-sky-500 uppercase tracking-wide flex-shrink-0">OUT</span>
                              <span className="text-slate-700">{s.out}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full feature list */}
      <section className="section bg-slate-50 border-t border-slate-200">
        <div className="inner">
          <div className="mb-10">
            <h2 className="text-2xl font-display text-slate-900 mb-2">Complete feature list</h2>
            <p className="text-sm text-slate-600">Everything in Gigva right now. Updated when features ship.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ALL_FEATURES.map(({ category, items }) => (
              <div key={category} className="bg-white border border-slate-200 rounded-2xl p-5">
                <h3 className="font-display font-bold text-slate-900 text-sm mb-4 pb-2 border-b border-slate-100">
                  {category}
                </h3>
                <ul className="space-y-2">
                  {items.map(item => (
                    <li key={item} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                      <CheckCircle2 size={12} className="text-sky-500 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-sky-500">
        <div className="inner text-center max-w-xl">
          <h2 className="text-2xl font-display text-white mb-3">See every feature in action</h2>
          <p className="text-sky-100 text-sm mb-5">
            Book a 30-minute walkthrough. We will demo each workflow using a dataset 
            that matches your business — retail, logistics, or services.
          </p>
          <Link href="/book-demo" className="btn-primary bg-white text-sky-600 border-white hover:bg-sky-50">
            Book a demo <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </>
  )
}
