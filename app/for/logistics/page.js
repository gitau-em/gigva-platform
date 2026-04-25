import Link from 'next/link'
import { ArrowRight, Truck, MapPin, FileText, CreditCard, BarChart3, AlertCircle, Package, Users, Clock } from 'lucide-react'

export const metadata = {
  title: 'Gigva for Logistics & Transport Companies in Kenya | Fleet & Payment Software',
  description: 'Gigva automates delivery payment collection, M-Pesa reconciliation, driver cash management, and fleet invoicing for Kenyan logistics and transport businesses.',
  alternates: { canonical: 'https://gigva.co.ke/for/logistics' },
}

const LOGISTICS_FEATURES = [
  {
    icon: CreditCard,
    title: 'Delivery Payment Collection & Reconciliation',
    desc: 'Track payments collected per delivery — M-Pesa, cash-on-delivery, and pre-paid invoices. Every delivery is reconciled automatically. End-of-run cash floats are verified against digital records.',
  },
  {
    icon: Truck,
    title: 'Fleet & Driver Management',
    desc: 'Assign deliveries to specific drivers and vehicles. Track which driver collected how much per run, which deliveries were completed, and which are pending. Generate per-driver settlement reports daily.',
  },
  {
    icon: FileText,
    title: 'Automated Waybills & Delivery Notes',
    desc: 'Generate PDF waybills with customer details, item list, weight, destination, and collection terms. Send directly to drivers via WhatsApp link or email. Track proof of delivery status.',
  },
  {
    icon: MapPin,
    title: 'Route-Level Revenue Analytics',
    desc: 'See revenue, delivery volume, and average payment per route — Nairobi to Mombasa, Nairobi to Kisumu, last-mile Nairobi. Identify high-revenue routes and underperforming legs instantly.',
  },
  {
    icon: AlertCircle,
    title: 'Missing & Short Payment Alerts',
    desc: 'If a driver returns with less cash than the delivery manifest expects, Gigva flags the shortfall automatically. Partial M-Pesa payments are also surfaced with the full customer and delivery context.',
  },
  {
    icon: BarChart3,
    title: 'Client Invoicing & Account Aging',
    desc: 'Invoice corporate logistics clients on credit terms (7, 14, or 30 days). Track outstanding invoices per client, send payment reminders automatically, and see aged debt by client at a glance.',
  },
]

const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Connect M-Pesa and register your fleet',
    detail: 'Link your Paybill to Gigva and add your vehicles and drivers. Each driver gets a Gigva code customers reference when paying for deliveries — Gigva matches payments to the right delivery automatically.',
  },
  {
    step: 2,
    title: 'Dispatch creates a delivery order',
    detail: 'Dispatch logs the delivery: client name, items, destination, weight, collection amount, and assigned driver/vehicle. Gigva generates a waybill PDF and sends it to the driver.',
  },
  {
    step: 3,
    title: 'Customer pays on delivery (M-Pesa or cash)',
    detail: 'The customer pays via M-Pesa using the delivery reference. Gigva matches the payment to the delivery within seconds. Cash-on-delivery is logged by the driver at handoff.',
  },
  {
    step: 4,
    title: 'Gigva reconciles each delivery automatically',
    detail: 'Matched deliveries are marked paid. Unmatched or short payments appear in your exceptions queue with the full delivery manifest and payment history.',
  },
  {
    step: 5,
    title: 'Generate end-of-day fleet settlement report',
    detail: 'Pull a driver settlement report showing total deliveries, total amount collected, M-Pesa vs cash split, and any shortfalls. Export as PDF or CSV for your accounts team.',
  },
]

export default function ForLogisticsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-amber-50 to-white pt-16 pb-12 px-5 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">For Logistics & Transport</span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
            Stop chasing drivers for<br className="hidden md:block" /> <span className="text-amber-500">unaccounted delivery payments</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            Gigva is built for Kenyan logistics and transport companies — courier firms, freight operators, and last-mile delivery businesses. It tracks every delivery payment, reconciles M-Pesa and cash collections per driver per run, and flags shortfalls before your end-of-day close.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/book-demo?industry=logistics" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-lg transition-colors">
              Book a Logistics Demo <ArrowRight size={16} />
            </Link>
            <Link href="/pricing?plan=logistics" className="inline-flex items-center gap-2 border border-amber-500 text-amber-600 font-bold px-6 py-3 rounded-lg hover:bg-amber-50 transition-colors">
              See Logistics Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Logistics Dashboard Preview */}
      <section className="bg-slate-900 py-12 px-5 md:px-8">
        <div className="max-w-5xl mx-auto">
          <p className="text-amber-400 text-xs font-bold uppercase tracking-widest text-center mb-6">Logistics Operations Dashboard</p>
          <div className="rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
            <div className="bg-slate-800 flex items-center gap-2 px-4 py-3 border-b border-slate-700">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="text-slate-400 text-xs ml-3">Gigva Logistics — Fleet Operations</span>
              <span className="ml-auto text-green-400 text-xs font-bold">● Live</span>
            </div>
            <div className="bg-slate-950 p-5">
              <div className="flex gap-4 border-b border-slate-800 mb-5 text-xs">
                <span className="text-amber-400 border-b-2 border-amber-400 pb-2 font-bold">Fleet Overview</span>
                <span className="text-slate-500 pb-2">Deliveries</span>
                <span className="text-slate-500 pb-2">Payments</span>
                <span className="text-slate-500 pb-2">Drivers</span>
                <span className="text-slate-500 pb-2">Reports</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {[
                  { label: "Active Deliveries", value: "34", sub: "12 in transit", color: "text-amber-400" },
                  { label: "Collected Today", value: "KSh 187,500", sub: "28 deliveries done", color: "text-green-400" },
                  { label: "Outstanding", value: "KSh 43,200", sub: "6 deliveries pending", color: "text-yellow-400" },
                  { label: "Driver Shortfalls", value: "2", sub: "Needs review", color: "text-red-400" },
                ].map((card) => (
                  <div key={card.label} className="bg-slate-900 rounded-lg p-3 border border-slate-800">
                    <p className="text-slate-400 text-xs mb-1">{card.label}</p>
                    <p className={`font-bold text-lg ${card.color}`}>{card.value}</p>
                    <p className="text-slate-500 text-xs">{card.sub}</p>
                  </div>
                ))}
              </div>
              <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
                <div className="px-4 py-2 border-b border-slate-800">
                  <span className="text-slate-300 text-xs font-bold">Driver Settlements — Today</span>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="px-4 py-2 text-left text-slate-500 font-normal">Driver</th>
                      <th className="px-4 py-2 text-left text-slate-500 font-normal">Deliveries</th>
                      <th className="px-4 py-2 text-left text-slate-500 font-normal">Expected</th>
                      <th className="px-4 py-2 text-left text-slate-500 font-normal">Collected</th>
                      <th className="px-4 py-2 text-left text-slate-500 font-normal">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { driver: "Moses Kipchoge", del: 11, exp: "KSh 55,000", col: "KSh 55,000", status: "Balanced", color: "text-green-400" },
                      { driver: "Sarah Akinyi", del: 9, exp: "KSh 38,200", col: "KSh 35,700", status: "Short -2,500", color: "text-red-400" },
                      { driver: "Dennis Mwenda", del: 8, exp: "KSh 41,300", col: "KSh 41,300", status: "Balanced", color: "text-green-400" },
                    ].map((d, i) => (
                      <tr key={i} className="border-b border-slate-800">
                        <td className="px-4 py-2 text-slate-300">{d.driver}</td>
                        <td className="px-4 py-2 text-slate-400">{d.del}</td>
                        <td className="px-4 py-2 text-slate-400">{d.exp}</td>
                        <td className="px-4 py-2 text-white font-medium">{d.col}</td>
                        <td className={`px-4 py-2 font-bold ${d.color}`}>{d.status}</td>
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
          <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-3">Built for logistics operations</h2>
          <p className="text-slate-600 text-center mb-10 max-w-2xl mx-auto">Logistics has different problems from retail: you need driver-level accountability, route-level analytics, and delivery note automation.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {LOGISTICS_FEATURES.map((f) => (
              <div key={f.title} className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-3">
                  <f.icon size={20} className="text-amber-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-14 px-5 md:px-8 bg-amber-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-3">Logistics-specific pricing</h2>
          <p className="text-slate-600 mb-8">Priced per active vehicle per month — not per transaction. A 10-vehicle fleet pays differently from a 50-vehicle operator.</p>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { name: "Fleet Starter", price: "KSh 4,999", detail: "Up to 10 vehicles · 3 driver accounts · 1 depot", highlight: false },
              { name: "Fleet Pro", price: "KSh 9,999", detail: "Up to 30 vehicles · Unlimited drivers · 3 depots", highlight: true },
              { name: "Enterprise", price: "KSh 19,999", detail: "Unlimited fleet · Multi-depot · API access · SLA", highlight: false },
            ].map((p) => (
              <div key={p.name} className={`rounded-xl p-5 border ${p.highlight ? 'border-amber-500 bg-amber-100' : 'border-slate-200 bg-white'}`}>
                <p className="font-bold text-slate-900">{p.name}</p>
                <p className={`text-2xl font-extrabold mt-1 ${p.highlight ? 'text-amber-600' : 'text-slate-800'}`}>{p.price}<span className="text-sm font-normal text-slate-500">/mo</span></p>
                <p className="text-xs text-slate-500 mt-2">{p.detail}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/pricing?plan=logistics" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-lg transition-colors">
              See Full Logistics Pricing <ArrowRight size={16} />
            </Link>
            <Link href="/book-demo?industry=logistics" className="inline-flex items-center gap-2 border border-slate-300 text-slate-700 font-bold px-6 py-3 rounded-lg hover:bg-white transition-colors">
              Book a Logistics Demo
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
