import Link from 'next/link'
import { ArrowRight, Coffee, BarChart3, CreditCard, Users, FileText, AlertCircle, Calendar, Star } from 'lucide-react'

export const metadata = {
  title: 'Gigva for Hotels & Restaurants in Kenya | Hospitality Payment & POS Software',
  description: 'Gigva helps Kenyan hotels, restaurants, and lodges manage M-Pesa payments, table billing, reservations, and supplier accounts — with automated reconciliation and real-time revenue reporting.',
  alternates: { canonical: 'https://gigva.co.ke/for/hospitality' },
}

const HOSPITALITY_FEATURES = [
  {
    icon: CreditCard,
    title: 'Table & Room Billing with M-Pesa',
    desc: 'Assign bills to tables or room numbers. Customers pay via M-Pesa, card, or cash. Gigva reconciles each payment to the correct bill in real time — no end-of-shift manual balancing.',
  },
  {
    icon: Coffee,
    title: 'Menu & Inventory Cost Tracking',
    desc: 'Map each menu item to its ingredient costs. As dishes are sold, Gigva deducts stock levels automatically. You see food cost percentage, gross margin per dish, and daily consumption in real time.',
  },
  {
    icon: Calendar,
    title: 'Reservation & Occupancy Management',
    desc: 'Track hotel room bookings, restaurant reservations, and private event bookings in one calendar. Gigva sends automated confirmation messages and payment reminders to guests.',
  },
  {
    icon: BarChart3,
    title: 'Revenue Analytics by Outlet & Shift',
    desc: 'Compare revenue between your restaurant, bar, and room service by shift or day. Identify peak hours, best-selling dishes, and which table sections generate the most covers per service.',
  },
  {
    icon: Users,
    title: 'Staff & Shift Management',
    desc: 'Log shift start and end times for front-of-house and kitchen staff. Track sales and tips per server. Generate payroll-ready summaries showing hours worked and service charge allocation.',
  },
  {
    icon: FileText,
    title: 'Supplier Invoices & F&B Procurement',
    desc: 'Manage food and beverage supplier accounts, purchase orders, and delivery notes. Match supplier invoices to received goods, track payment terms, and see monthly F&B cost against budget.',
  },
]

export default function ForHospitalityPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-emerald-50 to-white pt-16 pb-12 px-5 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">For Hotels & Restaurants</span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
            Replace your shift-close spreadsheet<br className="hidden md:block" /> <span className="text-emerald-500">with real-time hospitality analytics</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            Gigva is built for Kenyan hotels, restaurants, lodges, and catering businesses. It connects M-Pesa to your billing system, tracks food cost against revenue, and generates shift reports automatically — so your F&B manager focuses on service, not spreadsheets.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/book-demo?industry=hospitality" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-lg transition-colors">
              Book a Hospitality Demo <ArrowRight size={16} />
            </Link>
            <Link href="/pricing?plan=hospitality" className="inline-flex items-center gap-2 border border-emerald-500 text-emerald-600 font-bold px-6 py-3 rounded-lg hover:bg-emerald-50 transition-colors">
              See Hospitality Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="bg-slate-900 py-12 px-5 md:px-8">
        <div className="max-w-5xl mx-auto">
          <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest text-center mb-6">Hospitality Operations Dashboard</p>
          <div className="rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
            <div className="bg-slate-800 flex items-center gap-2 px-4 py-3 border-b border-slate-700">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="text-slate-400 text-xs ml-3">Gigva Hospitality — Safari Lodge Nairobi</span>
              <span className="ml-auto text-green-400 text-xs font-bold">● Live</span>
            </div>
            <div className="bg-slate-950 p-5">
              <div className="flex gap-4 border-b border-slate-800 mb-5 text-xs">
                <span className="text-emerald-400 border-b-2 border-emerald-400 pb-2 font-bold">Today</span>
                <span className="text-slate-500 pb-2">Reservations</span>
                <span className="text-slate-500 pb-2">F&B</span>
                <span className="text-slate-500 pb-2">Rooms</span>
                <span className="text-slate-500 pb-2">Staff</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {[
                  { label: "Today's Revenue", value: "KSh 142,800", sub: "Restaurant + Bar + Rooms", color: "text-emerald-400" },
                  { label: "Occupancy", value: "18 / 24", sub: "75% rooms occupied", color: "text-sky-400" },
                  { label: "Active Tables", value: "9 / 16", sub: "Dinner service live", color: "text-yellow-400" },
                  { label: "F&B Cost %", value: "28.4%", sub: "Target: 30%", color: "text-green-400" },
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
                  <p className="text-slate-300 text-xs font-bold mb-3">Active Table Bills</p>
                  {[
                    { table: "Table 4", amount: "KSh 3,850", status: "Open", guests: 3 },
                    { table: "Table 7", amount: "KSh 8,200", status: "Paid - M-Pesa", guests: 6 },
                    { table: "Table 12", amount: "KSh 1,450", status: "Open", guests: 2 },
                  ].map((t, i) => (
                    <div key={i} className="flex justify-between items-center py-1 border-b border-slate-800 text-xs">
                      <span className="text-slate-400">{t.table} ({t.guests} guests)</span>
                      <span className="text-white">{t.amount}</span>
                      <span className={t.status.includes('Paid') ? 'text-green-400' : 'text-yellow-400'}>{t.status}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-900 rounded-lg border border-slate-800 p-4">
                  <p className="text-slate-300 text-xs font-bold mb-3">Top Sellers This Service</p>
                  {[
                    { item: "Nyama Choma (1kg)", sold: 14, revenue: "KSh 28,000" },
                    { item: "Tusker (500ml)", sold: 38, revenue: "KSh 15,200" },
                    { item: "Ugali & Sukuma", sold: 22, revenue: "KSh 8,800" },
                  ].map((s, i) => (
                    <div key={i} className="flex justify-between items-center py-1 border-b border-slate-800 text-xs">
                      <span className="text-slate-300">{s.item}</span>
                      <span className="text-slate-500">{s.sold} sold</span>
                      <span className="text-emerald-400 font-bold">{s.revenue}</span>
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
          <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-3">Built for hospitality operations</h2>
          <p className="text-slate-600 text-center mb-10 max-w-2xl mx-auto">Hospitality needs more than M-Pesa matching — it needs table billing, food cost tracking, and occupancy management in one system.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {HOSPITALITY_FEATURES.map((f) => (
              <div key={f.title} className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
                  <f.icon size={20} className="text-emerald-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-14 px-5 md:px-8 bg-emerald-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-3">Hospitality-specific pricing</h2>
          <p className="text-slate-600 mb-8">Priced by covers and room count — not transaction volume. A café pays differently from a boutique hotel.</p>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { name: "Café / Bistro", price: "KSh 3,999", detail: "Up to 20 tables · 1 outlet · 2 staff logins", highlight: false },
              { name: "Restaurant", price: "KSh 7,999", detail: "Up to 50 tables · 3 outlets · Unlimited staff", highlight: true },
              { name: "Hotel / Lodge", price: "KSh 14,999", detail: "Rooms + F&B · Multi-outlet · Reservations · API", highlight: false },
            ].map((p) => (
              <div key={p.name} className={`rounded-xl p-5 border ${p.highlight ? 'border-emerald-500 bg-emerald-100' : 'border-slate-200 bg-white'}`}>
                <p className="font-bold text-slate-900">{p.name}</p>
                <p className={`text-2xl font-extrabold mt-1 ${p.highlight ? 'text-emerald-600' : 'text-slate-800'}`}>{p.price}<span className="text-sm font-normal text-slate-500">/mo</span></p>
                <p className="text-xs text-slate-500 mt-2">{p.detail}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/pricing?plan=hospitality" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-lg transition-colors">
              See Full Hospitality Pricing <ArrowRight size={16} />
            </Link>
            <Link href="/book-demo?industry=hospitality" className="inline-flex items-center gap-2 border border-slate-300 text-slate-700 font-bold px-6 py-3 rounded-lg hover:bg-white transition-colors">
              Book a Hospitality Demo
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
