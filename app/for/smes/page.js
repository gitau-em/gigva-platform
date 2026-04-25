import Link from 'next/link'
import { ArrowRight, Briefcase, BarChart3, CreditCard, FileText, Users, Zap, Globe, TrendingUp } from 'lucide-react'

export const metadata = {
  title: 'Gigva for SMEs & Service Businesses in Kenya | Business Automation Software',
  description: 'Gigva automates M-Pesa reconciliation, invoicing, expense tracking, and payroll for Kenyan SMEs and service businesses — from freelancers to 50-person agencies.',
  alternates: { canonical: 'https://gigva.co.ke/for/smes' },
}

const SME_FEATURES = [
  {
    icon: CreditCard,
    title: 'M-Pesa Collections & Automatic Reconciliation',
    desc: 'Every client payment via M-Pesa is logged and matched to the correct invoice automatically. No more manually checking your M-Pesa statement at month end. Outstanding invoices are flagged in real time.',
  },
  {
    icon: FileText,
    title: 'Professional Invoicing & Quotes',
    desc: 'Create branded invoices and quotes in 30 seconds. Send by email or WhatsApp link. Clients pay directly via M-Pesa from the invoice. Payment status updates automatically when payment is received.',
  },
  {
    icon: BarChart3,
    title: 'Revenue & Cash Flow Dashboard',
    desc: 'See monthly revenue vs expenses, outstanding receivables, and cash flow projections. Know exactly whether you can cover payroll next month — before it's a problem.',
  },
  {
    icon: Users,
    title: 'Payroll & Staff Payments',
    desc: 'Calculate staff salaries with automatic KRA tax, NSSF, SHIF, and AHL deductions. Generate payslips, send them by email, and initiate M-Pesa bulk payments to staff bank accounts.',
  },
  {
    icon: TrendingUp,
    title: 'Expense Tracking & Supplier Payments',
    desc: 'Log business expenses by category, attach receipts, and track VAT. Schedule supplier payments and reconcile your bank account against M-Pesa outflows. Export for your accountant in one click.',
  },
  {
    icon: Globe,
    title: 'Client Portal & Payment Links',
    desc: 'Give clients access to a branded portal where they view their invoices, payment history, and outstanding balances. Share a payment link — clients pay via M-Pesa without calling you.',
  },
]

export default function ForSMEsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-violet-50 to-white pt-16 pb-12 px-5 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-violet-100 text-violet-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">For SMEs & Service Businesses</span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
            One platform to invoice clients,<br className="hidden md:block" /> <span className="text-violet-500">collect M-Pesa, and pay your team</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            Gigva is the operating system for Kenyan SMEs and service businesses — agencies, consultants, service providers, and growing businesses with 2–50 employees. It handles your invoicing, M-Pesa reconciliation, payroll, and cash flow in one place so you can focus on delivering work, not chasing numbers.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/book-demo?industry=smes" className="inline-flex items-center gap-2 bg-violet-500 hover:bg-violet-600 text-white font-bold px-6 py-3 rounded-lg transition-colors">
              Book an SME Demo <ArrowRight size={16} />
            </Link>
            <Link href="/pricing?plan=smes" className="inline-flex items-center gap-2 border border-violet-500 text-violet-600 font-bold px-6 py-3 rounded-lg hover:bg-violet-50 transition-colors">
              See SME Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="bg-slate-900 py-12 px-5 md:px-8">
        <div className="max-w-5xl mx-auto">
          <p className="text-violet-400 text-xs font-bold uppercase tracking-widest text-center mb-6">SME Business Dashboard</p>
          <div className="rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
            <div className="bg-slate-800 flex items-center gap-2 px-4 py-3 border-b border-slate-700">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="text-slate-400 text-xs ml-3">Gigva Business — Nairobi Digital Agency</span>
              <span className="ml-auto text-green-400 text-xs font-bold">● Live</span>
            </div>
            <div className="bg-slate-950 p-5">
              <div className="flex gap-4 border-b border-slate-800 mb-5 text-xs">
                <span className="text-violet-400 border-b-2 border-violet-400 pb-2 font-bold">Overview</span>
                <span className="text-slate-500 pb-2">Invoices</span>
                <span className="text-slate-500 pb-2">Expenses</span>
                <span className="text-slate-500 pb-2">Payroll</span>
                <span className="text-slate-500 pb-2">Reports</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {[
                  { label: "This Month Revenue", value: "KSh 342,000", sub: "+24% vs last month", color: "text-violet-400" },
                  { label: "Outstanding", value: "KSh 87,500", sub: "3 invoices unpaid", color: "text-yellow-400" },
                  { label: "Monthly Expenses", value: "KSh 121,300", sub: "On budget", color: "text-green-400" },
                  { label: "Net Profit", value: "KSh 220,700", sub: "64.5% margin", color: "text-sky-400" },
                ].map((card) => (
                  <div key={card.label} className="bg-slate-900 rounded-lg p-3 border border-slate-800">
                    <p className="text-slate-400 text-xs mb-1">{card.label}</p>
                    <p className={`font-bold text-lg ${card.color}`}>{card.value}</p>
                    <p className="text-slate-500 text-xs">{card.sub}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 rounded-lg border border-slate-800 p-4">
                  <p className="text-slate-300 text-xs font-bold mb-3">Outstanding Invoices</p>
                  {[
                    { client: "TechHub Nairobi", inv: "INV-0089", amount: "KSh 45,000", due: "Overdue 3d" },
                    { client: "GreenBuild Ltd", inv: "INV-0091", amount: "KSh 28,500", due: "Due today" },
                    { client: "StartUp Hub", inv: "INV-0094", amount: "KSh 14,000", due: "Due in 5d" },
                  ].map((inv, i) => (
                    <div key={i} className="flex justify-between items-center py-1 border-b border-slate-800 text-xs">
                      <span className="text-slate-300">{inv.client}</span>
                      <span className="text-white font-medium">{inv.amount}</span>
                      <span className={inv.due.includes('Overdue') ? 'text-red-400' : 'text-yellow-400'}>{inv.due}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-900 rounded-lg border border-slate-800 p-4">
                  <p className="text-slate-300 text-xs font-bold mb-3">Payroll This Month</p>
                  {[
                    { name: "Brian Ochieng", role: "Developer", net: "KSh 78,450", status: "Pending" },
                    { name: "Amina Said", role: "Designer", net: "KSh 62,180", status: "Pending" },
                    { name: "Kevin Mwangi", role: "PM", net: "KSh 91,220", status: "Pending" },
                  ].map((s, i) => (
                    <div key={i} className="flex justify-between items-center py-1 border-b border-slate-800 text-xs">
                      <span className="text-slate-300">{s.name}</span>
                      <span className="text-slate-400">{s.role}</span>
                      <span className="text-white font-medium">{s.net}</span>
                      <span className="text-yellow-400">{s.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-5 md:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-3">Everything an SME needs to run finances</h2>
          <p className="text-slate-600 text-center mb-10 max-w-2xl mx-auto">SMEs need invoicing, M-Pesa matching, payroll, and cash flow in one system — not four separate tools with four separate subscriptions.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SME_FEATURES.map((f) => (
              <div key={f.title} className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center mb-3">
                  <f.icon size={20} className="text-violet-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-14 px-5 md:px-8 bg-violet-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-3">SME pricing that grows with you</h2>
          <p className="text-slate-600 mb-8">Start with solo invoicing for KSh 1,999/month and scale to full payroll and client portal as your team grows.</p>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { name: "Solo", price: "KSh 1,999", detail: "1 user · Invoicing · M-Pesa matching · Basic reports", highlight: false },
              { name: "Team", price: "KSh 5,499", detail: "Up to 10 users · Payroll · Expenses · Client portal", highlight: true },
              { name: "Business", price: "KSh 10,999", detail: "Unlimited users · Multi-entity · API · Priority support", highlight: false },
            ].map((p) => (
              <div key={p.name} className={`rounded-xl p-5 border ${p.highlight ? 'border-violet-500 bg-violet-100' : 'border-slate-200 bg-white'}`}>
                <p className="font-bold text-slate-900">{p.name}</p>
                <p className={`text-2xl font-extrabold mt-1 ${p.highlight ? 'text-violet-600' : 'text-slate-800'}`}>{p.price}<span className="text-sm font-normal text-slate-500">/mo</span></p>
                <p className="text-xs text-slate-500 mt-2">{p.detail}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/pricing?plan=smes" className="inline-flex items-center gap-2 bg-violet-500 hover:bg-violet-600 text-white font-bold px-6 py-3 rounded-lg transition-colors">
              See Full SME Pricing <ArrowRight size={16} />
            </Link>
            <Link href="/book-demo?industry=smes" className="inline-flex items-center gap-2 border border-slate-300 text-slate-700 font-bold px-6 py-3 rounded-lg hover:bg-white transition-colors">
              Book an SME Demo
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
