import Link from 'next/link'
import { CheckCircle2, ArrowRight, ShoppingCart, BarChart3, Zap, Shield, CreditCard, Package, TrendingUp, AlertCircle, FileText, Users } from 'lucide-react'

export const metadata = {
  title: 'Gigva for Retail Shops in Kenya | M-Pesa Reconciliation & POS Software',
  description: 'Gigva automates M-Pesa reconciliation, inventory tracking, and daily sales reports for Kenyan retail shops.',
  alternates: { canonical: 'https://gigva.co.ke/for/retail' },
}

const RETAIL_FEATURES = [
  {
    icon: CreditCard,
    title: 'Automatic M-Pesa & Cash Reconciliation',
    desc: "Every M-Pesa Paybill and Till payment is matched to a sale within seconds. Mixed payment (cash + M-Pesa) is tracked separately. End-of-day totals are generated automatically with no manual counting.",
  },
  {
    icon: Package,
    title: 'Real-Time Inventory Management',
    desc: "Track stock levels across your shop floor in real time. Low-stock alerts trigger automatically when items fall below your set reorder point. Import product lists via CSV or scan barcodes.",
  },
  {
    icon: BarChart3,
    title: 'Daily Sales & Revenue Dashboard',
    desc: "See daily revenue by the hour, best-selling products, and payment method breakdown — M-Pesa, cash, and card — on one screen. Filter by date, cashier, or product category.",
  },
  {
    icon: FileText,
    title: 'Automated Supplier Invoices & POs',
    desc: "Create purchase orders from your reorder alerts and send them to suppliers directly from Gigva. Track delivery status, match received stock to invoices, and log discrepancies.",
  },
  {
    icon: AlertCircle,
    title: 'Fraud & Discrepancy Detection',
    desc: "Gigva flags cashier shortfalls, duplicate M-Pesa references, and payments that do not match any active invoice. Suspicious transactions surface in your alerts within 30 seconds.",
  },
  {
    icon: Users,
    title: 'Multi-Cashier & Branch Management',
    desc: "Assign each cashier a unique login. Track sales, voids, and refunds per cashier. If you run multiple branches, each location gets its own dashboard with consolidated reports.",
  },
]

const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Connect your M-Pesa Paybill or Till',
    detail: "Enter your Safaricom Daraja credentials in Settings. Gigva registers a live C2B webhook in under 10 minutes — no manual M-Pesa statement downloads ever again.",
  },
  {
    step: 2,
    title: 'Log sales at the point of sale',
    detail: "Use Gigva POS to record cash, M-Pesa, and card sales. Cashiers select items, enter quantities, and confirm payment. Each sale updates inventory in real time.",
  },
  {
    step: 3,
    title: 'Gigva reconciles every payment automatically',
    detail: "When a customer pays via M-Pesa, Safaricom sends a callback to Gigva within 3 to 5 seconds. Gigva matches the payment to the open sale, marks it paid, and deducts stock.",
  },
  {
    step: 4,
    title: 'Resolve exceptions in one click',
    detail: "Unmatched payments, partial payments, and stock discrepancies are surfaced in your alerts dashboard. Click to view full context, then override, create a credit note, or escalate.",
  },
  {
    step: 5,
    title: 'Pull reports for your accountant',
    detail: "Generate a daily reconciliation report, VAT summary, or stock movement report in one click. Export as CSV or PDF formatted to work directly with QuickBooks and Xero.",
  },
]

export default function ForRetailPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-sky-50 to-white pt-16 pb-12 px-5 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-sky-100 text-sky-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">For Retail Shops</span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
            Stop reconciling M-Pesa payments<br className="hidden md:block" /> <span className="text-sky-500">in Excel, manually</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            Gigva is built for Kenyan retail shops — supermarkets, dukas, pharmacies, and convenience stores. It automatically matches every M-Pesa payment to a sale, tracks inventory, and generates end-of-day reports so your cashiers can close faster and your accountant gets accurate numbers every morning.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/book-demo?industry=retail" className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold px-6 py-3 rounded-lg transition-colors">
              Book a Retail Demo <ArrowRight size={16} />
            </Link>
            <Link href="/pricing?plan=retail" className="inline-flex items-center gap-2 border border-sky-500 text-sky-600 font-bold px-6 py-3 rounded-lg hover:bg-sky-50 transition-colors">
              See Retail Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Retail Dashboard Preview */}
      <section className="bg-slate-900 py-12 px-5 md:px-8">
        <div className="max-w-5xl mx-auto">
          <p className="text-sky-400 text-xs font-bold uppercase tracking-widest text-center mb-6">What Your Dashboard Looks Like</p>
          <div className="rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
            <div className="bg-slate-800 flex items-center gap-2 px-4 py-3 border-b border-slate-700">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="text-slate-400 text-xs ml-3">Gigva Retail — Nairobi Branch</span>
              <span className="ml-auto text-green-400 text-xs font-bold">Live</span>
            </div>
            <div className="bg-slate-950 p-5">
              <div className="flex gap-4 border-b border-slate-800 mb-5 text-xs">
                <span className="text-sky-400 border-b-2 border-sky-400 pb-2 font-bold">Overview</span>
                <span className="text-slate-500 pb-2">Sales</span>
                <span className="text-slate-500 pb-2">Inventory</span>
                <span className="text-slate-500 pb-2">M-Pesa</span>
                <span className="text-slate-500 pb-2">Reports</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {[
                  { label: "Today's Sales", value: "KSh 84,200", sub: "+18% vs yesterday", color: "text-green-400" },
                  { label: "M-Pesa Matched", value: "47 / 49", sub: "96% match rate", color: "text-sky-400" },
                  { label: "Low Stock Items", value: "7", sub: "Reorder triggered", color: "text-yellow-400" },
                  { label: "Cash Variance", value: "KSh 0.00", sub: "Balanced", color: "text-green-400" },
                ].map((card) => (
                  <div key={card.label} className="bg-slate-900 rounded-lg p-3 border border-slate-800">
                    <p className="text-slate-400 text-xs mb-1">{card.label}</p>
                    <p className={`font-bold text-lg ${card.color}`}>{card.value}</p>
                    <p className="text-slate-500 text-xs">{card.sub}</p>
                  </div>
                ))}
              </div>
              <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
                <div className="px-4 py-2 border-b border-slate-800 flex justify-between items-center">
                  <span className="text-slate-300 text-xs font-bold">Recent M-Pesa Transactions</span>
                  <span className="text-slate-500 text-xs">Last sync: 2s ago</span>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="px-4 py-2 text-left text-slate-500 font-normal">Sender</th>
                      <th className="px-4 py-2 text-left text-slate-500 font-normal">Amount</th>
                      <th className="px-4 py-2 text-left text-slate-500 font-normal">Invoice</th>
                      <th className="px-4 py-2 text-left text-slate-500 font-normal">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "Wanjiku Kamau", amount: "KSh 1,250", inv: "INV-0412", status: "Reconciled", color: "text-green-400" },
                      { name: "Brian Otieno", amount: "KSh 3,800", inv: "INV-0413", status: "Reconciled", color: "text-green-400" },
                      { name: "Fatuma Hassan", amount: "KSh 650",  inv: "unmatched", status: "Review", color: "text-yellow-400" },
                      { name: "Joseph Mwangi", amount: "KSh 5,200", inv: "INV-0414", status: "Reconciled", color: "text-green-400" },
                    ].map((tx, i) => (
                      <tr key={i} className="border-b border-slate-800 hover:bg-slate-800">
                        <td className="px-4 py-2 text-slate-300">{tx.name}</td>
                        <td className="px-4 py-2 text-white font-medium">{tx.amount}</td>
                        <td className="px-4 py-2 text-slate-400">{tx.inv}</td>
                        <td className={`px-4 py-2 font-bold ${tx.color}`}>{tx.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-5 md:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-3">Built specifically for retail shops</h2>
          <p className="text-slate-600 text-center mb-10 max-w-2xl mx-auto">Every feature was designed around how Kenyan retail shops actually operate — high M-Pesa volume, mixed payment types, multiple cashiers, and daily stock counts.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {RETAIL_FEATURES.map((f) => (
              <div key={f.title} className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center mb-3">
                  <f.icon size={20} className="text-sky-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-5 md:px-8 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-10">How it works for retail shops</h2>
          <div className="space-y-6">
            {HOW_IT_WORKS.map((s) => (
              <div key={s.step} className="flex gap-4 bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                <div className="w-9 h-9 bg-sky-500 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">{s.step}</div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{s.title}</h3>
                  <p className="text-slate-600 text-sm">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Callout */}
      <section className="py-14 px-5 md:px-8 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-3">Retail pricing that scales with your shop</h2>
          <p className="text-slate-600 mb-8">Starter plan covers small dukas processing up to 500 M-Pesa transactions per month. Growth covers busy supermarkets with up to 5,000 transactions. All plans include inventory, reconciliation, and cashier management.</p>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { name: "Starter", price: "KSh 2,999", detail: "Up to 500 txns/mo · 1 to 3 cashiers · 1 branch", highlight: false },
              { name: "Growth", price: "KSh 5,999", detail: "Up to 5,000 txns/mo · Unlimited cashiers · 3 branches", highlight: true },
              { name: "Business", price: "KSh 11,999", detail: "Unlimited txns · Multi-branch · Priority support", highlight: false },
            ].map((p) => (
              <div key={p.name} className={`rounded-xl p-5 border ${p.highlight ? 'border-sky-500 bg-sky-50' : 'border-slate-200 bg-slate-50'}`}>
                <p className="font-bold text-slate-900">{p.name}</p>
                <p className={`text-2xl font-extrabold mt-1 ${p.highlight ? 'text-sky-600' : 'text-slate-800'}`}>{p.price}<span className="text-sm font-normal text-slate-500">/mo</span></p>
                <p className="text-xs text-slate-500 mt-2">{p.detail}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/pricing?plan=retail" className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold px-6 py-3 rounded-lg transition-colors">
              See Full Retail Pricing <ArrowRight size={16} />
            </Link>
            <Link href="/book-demo?industry=retail" className="inline-flex items-center gap-2 border border-slate-300 text-slate-700 font-bold px-6 py-3 rounded-lg hover:bg-slate-50 transition-colors">
              Book a 30-min Retail Demo
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
