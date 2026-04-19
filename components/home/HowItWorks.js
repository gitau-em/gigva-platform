const STEPS = [
  {
    n: '1',
    title: 'Connect your M-Pesa Paybill or Till number',
    body: 'Enter your Safaricom Daraja credentials in Settings. Gigva registers a C2B webhook URL with Safaricom — this is a one-time setup that takes under 10 minutes.',
    input:  'Your Paybill number + Daraja API credentials',
    output: 'Live webhook active — payments start streaming in',
    badge:  'Setup once',
  },
  {
    n: '2',
    title: 'Every payment is captured the moment it arrives',
    body: 'When a customer pays your Paybill, Safaricom sends a callback to Gigva within 3–5 seconds. Gigva records the sender name, phone number, amount, reference code, and exact timestamp.',
    input:  'Customer M-Pesa payment (C2B)',
    output: 'Structured transaction record with full metadata',
    badge:  '3–5 second capture',
  },
  {
    n: '3',
    title: 'Transactions are automatically matched to invoices',
    body: 'Gigva compares each incoming payment against your open invoices using the payment amount and customer reference. When the match is exact, the invoice is marked paid and the transaction is reconciled instantly.',
    input:  'Incoming payment + your open invoices',
    output: 'Invoice marked paid · transaction reconciled',
    badge:  'Automatic',
  },
  {
    n: '4',
    title: 'Mismatches and errors are flagged immediately',
    body: 'Partial payments, wrong reference codes, or amounts that do not match any invoice are surfaced in your dashboard with full context. You see exactly what the issue is and can resolve it in one click — manual override or create a new invoice.',
    input:  'Unmatched or partial payment',
    output: 'Alert with transaction detail + resolution options',
    badge:  'Instant alert',
  },
  {
    n: '5',
    title: 'Generate your reconciliation report at any time',
    body: 'Pull a reconciliation report for any date range: all transactions, their match status, outstanding invoices, and a cash summary. Download as CSV for your accountant or PDF for your records.',
    input:  'Date range + filters',
    output: 'Reconciliation report in CSV or PDF',
    badge:  'One click',
  },
]

export default function HowItWorks() {
  return (
    <section className="section bg-white border-t border-slate-200">
      <div className="inner">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-3">How It Works</p>
          <h2 className="text-3xl md:text-4xl font-display text-slate-900 mb-4">
            From M-Pesa payment to reconciled books — automatically
          </h2>
          <p className="text-slate-600 leading-relaxed">
            Here is exactly what Gigva does for retail shops, logistics companies, and SMEs 
            that handle daily M-Pesa transactions. No vague promises — just the specific steps.
          </p>
        </div>

        <div className="relative">
          {/* Connector line desktop */}
          <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-sky-100 hidden md:block" />

          <div className="space-y-0">
            {STEPS.map((step, i) => (
              <div key={step.n} className="relative md:pl-14 pb-8 last:pb-0">
                {/* Step circle */}
                <div className="hidden md:flex absolute left-0 top-0 w-10 h-10 rounded-full bg-sky-500 text-white items-center justify-center font-display font-bold text-sm z-10 shadow-sm shadow-sky-200">
                  {step.n}
                </div>

                <div className={`border border-slate-200 rounded-xl p-5 bg-slate-50 hover:border-sky-200 hover:bg-sky-50/30 transition-colors ${i < STEPS.length - 1 ? 'mb-4' : ''}`}>
                  <div className="flex items-start gap-3 mb-3">
                    {/* Mobile number */}
                    <div className="md:hidden w-7 h-7 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {step.n}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-display font-bold text-slate-900 text-base">{step.title}</h3>
                        <span className="text-[10px] font-bold bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full whitespace-nowrap">{step.badge}</span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">{step.body}</p>
                    </div>
                  </div>

                  {/* Input → Output */}
                  <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center mt-3 pl-0 md:pl-0">
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs flex-1">
                      <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wide flex-shrink-0">IN</span>
                      <span className="text-slate-700">{step.input}</span>
                    </div>
                    <div className="hidden sm:flex items-center text-slate-300 font-bold text-lg">→</div>
                    <div className="flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-lg px-3 py-2 text-xs flex-1">
                      <span className="font-bold text-sky-500 uppercase text-[10px] tracking-wide flex-shrink-0">OUT</span>
                      <span className="text-slate-700">{step.output}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
