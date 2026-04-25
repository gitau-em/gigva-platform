import Link from 'next/link'
import { ArrowRight, ShoppingCart, Truck, Coffee, Heart, Briefcase } from 'lucide-react'

export const metadata = {
  title: 'Who Gigva Is For | Industry-Specific SaaS for Kenyan Businesses',
  description: 'Gigva builds industry-specific software for Kenyan businesses. See how Gigva works for retail shops, logistics companies, hotels, clinics, and SMEs.',
  alternates: { canonical: 'https://gigva.co.ke/for' },
}

const INDUSTRIES = [
  {
    icon: ShoppingCart,
    name: 'Retail Shops',
    desc: 'Supermarkets, dukas, pharmacies, and convenience stores. Automatic M-Pesa reconciliation, inventory tracking, multi-cashier management, and daily sales reports.',
    href: '/for/retail',
    color: 'bg-sky-100 text-sky-600',
    border: 'border-sky-200 hover:border-sky-400',
    cta: 'See Retail Features',
    demoHref: '/book-demo?industry=retail',
    pricingHref: '/pricing?plan=retail',
    price: 'From KSh 2,999/mo',
  },
  {
    icon: Truck,
    name: 'Logistics & Transport',
    desc: 'Courier firms, freight operators, and last-mile delivery businesses. Per-driver payment tracking, waybill automation, route revenue analytics, and fleet settlement reports.',
    href: '/for/logistics',
    color: 'bg-amber-100 text-amber-600',
    border: 'border-amber-200 hover:border-amber-400',
    cta: 'See Logistics Features',
    demoHref: '/book-demo?industry=logistics',
    pricingHref: '/pricing?plan=logistics',
    price: 'From KSh 4,999/mo',
  },
  {
    icon: Coffee,
    name: 'Hotels & Restaurants',
    desc: 'Cafés, restaurants, lodges, and catering businesses. Table billing with M-Pesa, food cost tracking, reservation management, and shift revenue analytics.',
    href: '/for/hospitality',
    color: 'bg-emerald-100 text-emerald-600',
    border: 'border-emerald-200 hover:border-emerald-400',
    cta: 'See Hospitality Features',
    demoHref: '/book-demo?industry=hospitality',
    pricingHref: '/pricing?plan=hospitality',
    price: 'From KSh 3,999/mo',
  },
  {
    icon: Heart,
    name: 'Clinics & Pharmacies',
    desc: 'Private clinics, diagnostic labs, and pharmacies. Patient billing, NHIF claims tracking, drug inventory with expiry alerts, and department-level revenue analytics.',
    href: '/for/healthcare',
    color: 'bg-rose-100 text-rose-600',
    border: 'border-rose-200 hover:border-rose-400',
    cta: 'See Healthcare Features',
    demoHref: '/book-demo?industry=healthcare',
    pricingHref: '/pricing?plan=healthcare',
    price: 'From KSh 3,499/mo',
  },
  {
    icon: Briefcase,
    name: 'SMEs & Service Businesses',
    desc: 'Agencies, consultants, and growing businesses with 2–50 staff. Professional invoicing, M-Pesa payment links, payroll with KRA compliance, and cash flow dashboard.',
    href: '/for/smes',
    color: 'bg-violet-100 text-violet-600',
    border: 'border-violet-200 hover:border-violet-400',
    cta: 'See SME Features',
    demoHref: '/book-demo?industry=smes',
    pricingHref: '/pricing?plan=smes',
    price: 'From KSh 1,999/mo',
  },
]

export default function ForIndexPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-slate-50 to-white pt-16 pb-12 px-5 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">Who Gigva Is For</span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
            Industry-specific software for<br className="hidden md:block" /> <span className="text-sky-500">Kenyan businesses</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Gigva is not generic business software. Every industry page below shows you exactly what Gigva does for that type of business — the specific processes it automates, the features it includes, and the price you pay.
          </p>
        </div>
      </section>

      {/* Industry Cards */}
      <section className="py-12 px-5 md:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {INDUSTRIES.map((ind) => (
              <div key={ind.name} className={`bg-white rounded-xl p-6 border-2 ${ind.border} transition-colors shadow-sm`}>
                <div className={`w-12 h-12 ${ind.color} rounded-xl flex items-center justify-center mb-4`}>
                  <ind.icon size={22} />
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 mb-2">{ind.name}</h2>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">{ind.desc}</p>
                <p className="text-xs font-bold text-slate-500 mb-4">{ind.price}</p>
                <div className="flex flex-col gap-2">
                  <Link href={ind.href} className="inline-flex items-center gap-2 text-sky-600 font-bold text-sm hover:underline">
                    {ind.cta} <ArrowRight size={14} />
                  </Link>
                  <div className="flex gap-3 text-xs">
                    <Link href={ind.demoHref} className="text-slate-600 hover:text-sky-600 font-medium">Book a demo →</Link>
                    <Link href={ind.pricingHref} className="text-slate-600 hover:text-sky-600 font-medium">See pricing →</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 px-5 md:px-8 bg-slate-50 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-3">Not sure which plan fits your business?</h2>
          <p className="text-slate-600 mb-6">Book a 30-minute demo and we will show you exactly how Gigva works for your industry, your transaction volume, and your team size.</p>
          <Link href="/book-demo" className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold px-8 py-3 rounded-lg transition-colors">
            Book a Free Demo <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  )
}
