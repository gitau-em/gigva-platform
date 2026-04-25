import Link from 'next/link'
import { ArrowRight, Heart, FileText, CreditCard, BarChart3, AlertCircle, Users, Shield, ClipboardList } from 'lucide-react'

export const metadata = {
  title: 'Gigva for Clinics & Pharmacies in Kenya | Healthcare Payment & Billing Software',
  description: 'Gigva automates M-Pesa payment reconciliation, patient billing, insurance claims tracking, and supplier invoicing for Kenyan clinics, hospitals, and pharmacies.',
  alternates: { canonical: 'https://gigva.co.ke/for/healthcare' },
}

const HEALTHCARE_FEATURES = [
  {
    icon: CreditCard,
    title: 'Patient Billing & M-Pesa Reconciliation',
    desc: 'Generate patient invoices per consultation, procedure, or dispensed medication. Patients pay via M-Pesa, NHIF, or cash. Gigva matches each payment to the correct patient account automatically.',
  },
  {
    icon: ClipboardList,
    title: 'NHIF & Insurance Claims Tracking',
    desc: 'Track submitted NHIF and private insurance claims per patient. Gigva records claim submission dates, expected reimbursement amounts, and payment status. Flag overdue claims automatically.',
  },
  {
    icon: Heart,
    title: 'Pharmacy Inventory & Dispensing',
    desc: 'Track drug stock levels in real time. When a prescription is dispensed, inventory updates immediately. Expiry date alerts notify you 30, 60, and 90 days before stock expires.',
  },
  {
    icon: BarChart3,
    title: 'Revenue Analytics by Department',
    desc: 'Compare revenue between outpatient, inpatient, pharmacy, and laboratory departments. See which services drive the most revenue and which have the highest outstanding balances.',
  },
  {
    icon: Shield,
    title: 'Patient Data Privacy & Access Control',
    desc: 'Role-based access ensures clinical staff see patient records while billing staff see only financial data. All data is stored in Kenya — compliant with local health data regulations.',
  },
  {
    icon: FileText,
    title: 'Supplier & Medical Consumables Management',
    desc: 'Manage drug supplier accounts, purchase orders for consumables, and delivery verification. Track credit terms, due dates, and outstanding supplier balances — all in one place.',
  },
]

export default function ForHealthcarePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-rose-50 to-white pt-16 pb-12 px-5 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">For Clinics & Pharmacies</span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
            Stop losing revenue to<br className="hidden md:block" /> <span className="text-rose-500">unreconciled patient payments</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            Gigva is built for Kenyan healthcare providers — private clinics, pharmacies, diagnostic labs, and specialist practices. It automates patient billing, matches M-Pesa payments to accounts, tracks NHIF claims, and manages pharmacy stock — so your admin team spends less time on paperwork.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/book-demo?industry=healthcare" className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-bold px-6 py-3 rounded-lg transition-colors">
              Book a Healthcare Demo <ArrowRight size={16} />
            </Link>
            <Link href="/pricing?plan=healthcare" className="inline-flex items-center gap-2 border border-rose-500 text-rose-600 font-bold px-6 py-3 rounded-lg hover:bg-rose-50 transition-colors">
              See Healthcare Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="bg-slate-900 py-12 px-5 md:px-8">
        <div className="max-w-5xl mx-auto">
          <p className="text-rose-400 text-xs font-bold uppercase tracking-widest text-center mb-6">Healthcare Operations Dashboard</p>
          <div className="rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
            <div className="bg-slate-800 flex items-center gap-2 px-4 py-3 border-b border-slate-700">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="text-slate-400 text-xs ml-3">Gigva Healthcare — Nairobi Medical Centre</span>
              <span className="ml-auto text-green-400 text-xs font-bold">● Live</span>
            </div>
            <div className="bg-slate-950 p-5">
              <div className="flex gap-4 border-b border-slate-800 mb-5 text-xs">
                <span className="text-rose-400 border-b-2 border-rose-400 pb-2 font-bold">Today</span>
                <span className="text-slate-500 pb-2">Patients</span>
                <span className="text-slate-500 pb-2">Pharmacy</span>
                <span className="text-slate-500 pb-2">Insurance</span>
                <span className="text-slate-500 pb-2">Reports</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {[
                  { label: "Patients Today", value: "47", sub: "32 outpatient · 15 pharmacy", color: "text-rose-400" },
                  { label: "Revenue Collected", value: "KSh 91,200", sub: "M-Pesa + Cash + NHIF", color: "text-green-400" },
                  { label: "NHIF Pending", value: "KSh 38,500", sub: "12 claims submitted", color: "text-yellow-400" },
                  { label: "Low Stock Drugs", value: "4 items", sub: "Reorder needed", color: "text-red-400" },
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
                  <p className="text-slate-300 text-xs font-bold mb-3">Recent Patient Payments</p>
                  {[
                    { patient: "Amina Juma", amount: "KSh 2,400", type: "Consultation", status: "Paid" },
                    { patient: "Peter Njoroge", amount: "KSh 8,750", type: "Lab + Drugs", status: "Paid" },
                    { patient: "Grace Wanjiku", amount: "KSh 1,200", type: "Consultation", status: "NHIF Claim" },
                  ].map((p, i) => (
                    <div key={i} className="flex justify-between items-center py-1 border-b border-slate-800 text-xs">
                      <span className="text-slate-300">{p.patient}</span>
                      <span className="text-slate-400">{p.type}</span>
                      <span className="text-white">{p.amount}</span>
                      <span className={p.status === 'Paid' ? 'text-green-400' : 'text-yellow-400'}>{p.status}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-900 rounded-lg border border-slate-800 p-4">
                  <p className="text-slate-300 text-xs font-bold mb-3">Low Stock Alerts</p>
                  {[
                    { drug: "Amoxicillin 250mg", qty: "8 strips", reorder: "50 strips" },
                    { drug: "Paracetamol 500mg", qty: "12 packs", reorder: "100 packs" },
                    { drug: "Metformin 500mg", qty: "5 strips", reorder: "40 strips" },
                  ].map((d, i) => (
                    <div key={i} className="flex justify-between items-center py-1 border-b border-slate-800 text-xs">
                      <span className="text-slate-300">{d.drug}</span>
                      <span className="text-red-400 font-bold">{d.qty}</span>
                      <span className="text-slate-500">Reorder: {d.reorder}</span>
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
          <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-3">Built for healthcare administration</h2>
          <p className="text-slate-600 text-center mb-10 max-w-2xl mx-auto">Healthcare billing has unique requirements — NHIF claims, patient privacy, drug tracking, and multiple payment sources all at once.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {HEALTHCARE_FEATURES.map((f) => (
              <div key={f.title} className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center mb-3">
                  <f.icon size={20} className="text-rose-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-14 px-5 md:px-8 bg-rose-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-3">Healthcare pricing by facility size</h2>
          <p className="text-slate-600 mb-8">A single-doctor clinic pays differently from a multi-doctor practice or hospital. All plans include NHIF claim tracking and pharmacy inventory.</p>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { name: "Clinic Basic", price: "KSh 3,499", detail: "1–3 doctors · Outpatient · Pharmacy · M-Pesa", highlight: false },
              { name: "Medical Centre", price: "KSh 7,499", detail: "Up to 10 doctors · Lab + Pharmacy · NHIF tracking", highlight: true },
              { name: "Hospital", price: "KSh 16,999", detail: "Inpatient + Outpatient · Multi-dept · API + Reports", highlight: false },
            ].map((p) => (
              <div key={p.name} className={`rounded-xl p-5 border ${p.highlight ? 'border-rose-500 bg-rose-100' : 'border-slate-200 bg-white'}`}>
                <p className="font-bold text-slate-900">{p.name}</p>
                <p className={`text-2xl font-extrabold mt-1 ${p.highlight ? 'text-rose-600' : 'text-slate-800'}`}>{p.price}<span className="text-sm font-normal text-slate-500">/mo</span></p>
                <p className="text-xs text-slate-500 mt-2">{p.detail}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/pricing?plan=healthcare" className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-bold px-6 py-3 rounded-lg transition-colors">
              See Full Healthcare Pricing <ArrowRight size={16} />
            </Link>
            <Link href="/book-demo?industry=healthcare" className="inline-flex items-center gap-2 border border-slate-300 text-slate-700 font-bold px-6 py-3 rounded-lg hover:bg-white transition-colors">
              Book a Healthcare Demo
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
