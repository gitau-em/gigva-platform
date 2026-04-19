import { Clock, FileX, AlertTriangle } from 'lucide-react'

const PAINS = [
  {
    icon: Clock,
    title: '3–4 hours every week on manual reconciliation',
    body: 'Most SMEs and retail shops download M-Pesa statements, paste them into Excel, and spend their Friday afternoons matching payments to invoices line by line. Every entry is a chance for a mistake.',
  },
  {
    icon: FileX,
    title: 'No live view of what has been paid and what has not',
    body: 'Without a real-time dashboard, logistics firms and retailers either call customers to confirm payment or discover a missed invoice weeks after it was due — costing time and cash flow.',
  },
  {
    icon: AlertTriangle,
    title: 'Month-end is a scramble',
    body: "Pulling reports from M-Pesa, bank statements, and a separate invoicing tool means your accountant gets the numbers late or wrong. For SMEs handling hundreds of daily payments, this compounds fast.",
  },
]

export default function ProblemStatement() {
  return (
    <section className="section bg-white border-y border-slate-200">
      <div className="inner">
        <div className="max-w-2xl mb-10">
          <p className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-3">The Problem</p>
          <h2 className="text-3xl md:text-4xl font-display text-slate-900 mb-4">
            M-Pesa handles 80% of your revenue.<br />Excel handles your reconciliation.
          </h2>
          <p className="text-slate-600 leading-relaxed">
            Kenyan retail shops, logistics firms, and SMEs process the majority of their revenue through 
            M-Pesa — but Safaricom was built as a payment network, not an accounting system. That gap 
            is costing businesses hours every week and thousands of shillings in missed discrepancies.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {PAINS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-red-50/60 border border-red-100 rounded-xl p-5">
              <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center mb-4 flex-shrink-0">
                <Icon size={17} className="text-red-600" />
              </div>
              <h3 className="font-display font-bold text-slate-900 text-sm mb-2 leading-snug">{title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
