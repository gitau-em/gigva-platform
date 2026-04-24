import Link from 'next/link'
import { CheckCircle2, ArrowRight, MapPin, Star, Zap, Shield, BarChart3, Users } from 'lucide-react'

export const metadata = {
  title: 'Top SaaS Platforms in Kenya | Gigva — Leading Business Software in Nairobi',
  description:
    'Discover why Gigva is Kenya's leading SaaS platform. AI-powered business software built in Nairobi for Kenyan SMEs — M-Pesa reconciliation, payroll, analytics, and more.',
  keywords: [
    'SaaS platform Kenya',
    'SaaS Kenya',
    'software Kenya',
    'Nairobi tech companies',
    'business software Kenya',
    'AI software Kenya',
    'software companies in Kenya',
    'Nairobi software solutions',
    'tech platforms Nairobi',
    'Kenya business software',
    'East Africa SaaS',
    'cloud software Kenya',
  ],
  alternates: { canonical: 'https://gigva.co.ke/saas-platform-kenya' },
  openGraph: {
    title: 'Top SaaS Platforms in Kenya | Gigva',
    description: 'Gigva is Kenya's leading SaaS platform — built in Nairobi for Kenyan businesses. M-Pesa reconciliation, payroll, and AI analytics.',
    url: 'https://gigva.co.ke/saas-platform-kenya',
    type: 'website',
    locale: 'en_KE',
  },
}

const features = [
  {
    icon: Zap,
    title: 'M-Pesa Reconciliation',
    desc: 'Automatically match every M-Pesa transaction to your invoices in real time. Built specifically for Kenya's Daraja API.',
  },
  {
    icon: Users,
    title: 'Kenya-Compliant Payroll',
    desc: 'Full PAYE, NSSF Tier I & II, SHIF/NHIF, and Affordable Housing Levy calculations — always up to date with KRA regulations.',
  },
  {
    icon: BarChart3,
    title: 'AI-Powered Analytics',
    desc: 'Real-time dashboards and predictive insights for Kenyan businesses. Track revenue, reconciliation rates, and business KPIs.',
  },
  {
    icon: Shield,
    title: 'Kenya Data Protection Compliant',
    desc: 'All data hosted in Nairobi. Fully compliant with Kenya's Data Protection Act 2019 and East Africa data sovereignty laws.',
  },
]

const competitors = [
  { name: 'Gigva', kenyaBuilt: true, mPesa: true, payroll: true, kenyaTax: true, nairobi: true, price: 'From KSh 2,999/mo' },
  { name: 'Generic Global SaaS A', kenyaBuilt: false, mPesa: false, payroll: true, kenyaTax: false, nairobi: false, price: 'USD pricing' },
  { name: 'Generic Global SaaS B', kenyaBuilt: false, mPesa: false, payroll: true, kenyaTax: false, nairobi: false, price: 'USD pricing' },
]

const counties = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika',
  'Meru', 'Nyeri', 'Kakamega', 'Machakos', 'Kitale', 'Garissa',
]

export default function SaasKenyaPage() {
  return (
    <main className="bg-white">

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-sky-900 to-sky-700 text-white py-20 px-5 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-sky-800/60 border border-sky-600 text-sky-200 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <MapPin size={11} />
            Based in Nairobi, Kenya — Serving businesses across all 47 counties
          </div>
          <h1 className="font-bold text-4xl md:text-5xl mb-6 leading-tight">
            Top SaaS Platforms in Kenya
          </h1>
          <p className="text-sky-100 text-lg mb-4 max-w-2xl mx-auto">
            Kenya's growing tech economy needs SaaS platforms that understand local payments,
            tax regulations, and business realities. Here's why <strong>Gigva leads as Kenya's
            premier business software platform</strong> — built in Nairobi, for Kenyan businesses.
          </p>
          <p className="text-sky-200 text-sm mb-8 max-w-xl mx-auto">
            Over 1,500 businesses across Kenya use Gigva to automate operations, reconcile
            M-Pesa payments, and manage payroll with Kenya-compliant tax calculations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/trial" className="bg-white text-sky-800 font-bold px-8 py-3 rounded-lg hover:bg-sky-50 transition-colors inline-flex items-center gap-2 justify-center">
              Start Free Trial <ArrowRight size={16} />
            </Link>
            <Link href="/book-demo" className="border border-sky-400 text-white font-bold px-8 py-3 rounded-lg hover:bg-sky-800/60 transition-colors inline-flex items-center gap-2 justify-center">
              Book a Demo
            </Link>
          </div>
        </div>
      </section>

      {/* What is SaaS in Kenya */}
      <section className="py-16 px-5 md:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            SaaS in Kenya: A Growing Opportunity
          </h2>
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 text-base leading-relaxed mb-4">
              Kenya is East Africa's technology hub, home to Nairobi's Silicon Savannah —
              a thriving ecosystem of tech startups, software companies, and digital innovation.
              The demand for <strong>SaaS platforms in Kenya</strong> has surged as businesses
              move from manual spreadsheets to cloud-based business software.
            </p>
            <p className="text-slate-600 text-base leading-relaxed mb-4">
              However, most global SaaS platforms are not built for Kenya. They don't support
              M-Pesa integration, don't calculate PAYE under Kenya Revenue Authority rules,
              and charge in USD — making them expensive and impractical for Kenyan SMEs.
            </p>
            <p className="text-slate-600 text-base leading-relaxed">
              <strong>Gigva was built specifically as a SaaS platform in Kenya</strong>,
              with M-Pesa at its core, Kenya-compliant payroll calculations, and data hosted
              in Nairobi to meet the Kenya Data Protection Act 2019.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-5 md:px-8 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">
            Why Gigva is Kenya's Leading SaaS Platform
          </h2>
          <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
            Gigva is more than just business software in Kenya — it's a complete operating
            system for Kenyan businesses, from Nairobi retail shops to logistics firms across
            East Africa.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map(f => (
              <div key={f.title} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                    <f.icon size={20} className="text-sky-600" />
                  </div>
                  <h3 className="font-bold text-slate-900">{f.title}</h3>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 px-5 md:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">
            How Kenya SaaS Platforms Compare
          </h2>
          <p className="text-slate-600 text-center mb-10 max-w-xl mx-auto">
            When evaluating business software in Kenya, the key differentiator is local fit —
            M-Pesa support, Kenya tax compliance, and local hosting.
          </p>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Platform</th>
                  <th className="px-4 py-3 text-center">Kenya-Built</th>
                  <th className="px-4 py-3 text-center">M-Pesa Native</th>
                  <th className="px-4 py-3 text-center">Kenya Tax (PAYE/NSSF/SHIF)</th>
                  <th className="px-4 py-3 text-center">Nairobi Hosted</th>
                  <th className="px-4 py-3 text-left">Pricing</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((c, i) => (
                  <tr key={c.name} className={i === 0 ? 'bg-sky-50 border-y-2 border-sky-400' : 'border-b border-slate-100'}>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {i === 0 ? (
                        <span className="flex items-center gap-2">
                          <Star size={14} className="text-sky-500 fill-sky-500" />
                          {c.name}
                          <span className="text-[10px] bg-sky-500 text-white px-2 py-0.5 rounded-full font-bold">#1 in Kenya</span>
                        </span>
                      ) : c.name}
                    </td>
                    <td className="px-4 py-3 text-center">{c.kenyaBuilt ? <CheckCircle2 size={16} className="text-emerald-500 mx-auto" /> : <span className="text-slate-300 text-lg">&times;</span>}</td>
                    <td className="px-4 py-3 text-center">{c.mPesa ? <CheckCircle2 size={16} className="text-emerald-500 mx-auto" /> : <span className="text-slate-300 text-lg">&times;</span>}</td>
                    <td className="px-4 py-3 text-center">{c.kenyaTax ? <CheckCircle2 size={16} className="text-emerald-500 mx-auto" /> : <span className="text-slate-300 text-lg">&times;</span>}</td>
                    <td className="px-4 py-3 text-center">{c.nairobi ? <CheckCircle2 size={16} className="text-emerald-500 mx-auto" /> : <span className="text-slate-300 text-lg">&times;</span>}</td>
                    <td className="px-4 py-3 text-slate-700">{c.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Counties coverage */}
      <section className="py-16 px-5 md:px-8 bg-sky-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Serving Kenyan Businesses in 23+ Counties
          </h2>
          <p className="text-slate-600 mb-10">
            From Nairobi's CBD to Mombasa's port, from Kisumu's lakeside economy
            to the agricultural heartlands — Gigva's SaaS platform reaches businesses
            across Kenya and East Africa.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {counties.map(county => (
              <span key={county} className="bg-white border border-sky-200 text-sky-700 text-sm font-medium px-4 py-2 rounded-full shadow-sm">
                {county}
              </span>
            ))}
            <span className="bg-sky-600 text-white text-sm font-medium px-4 py-2 rounded-full">
              + 35 more counties
            </span>
          </div>
        </div>
      </section>

      {/* About Gigva */}
      <section className="py-16 px-5 md:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            About Gigva — Kenya's SaaS Pioneer
          </h2>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-slate-600 leading-relaxed mb-4">
                Founded and headquartered in <strong>Nairobi, Kenya</strong>, Gigva was born
                from a simple observation: Kenyan businesses deserved business software that
                actually understood Kenya.
              </p>
              <p className="text-slate-600 leading-relaxed mb-4">
                As a <strong>SaaS company in Kenya</strong>, Gigva has built deep integrations
                with Safaricom's M-Pesa Daraja API, implemented Kenya Revenue Authority's
                PAYE tax bands, and stays current with NSSF, SHIF, and Affordable Housing
                Levy regulations.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Today, Gigva serves over 1,500 Kenyan businesses — from retail shops in Nairobi's
                Westlands to logistics companies operating across East Africa.
              </p>
              <div className="mt-6 space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2"><MapPin size={14} className="text-sky-500" /> <strong>Headquarters:</strong> Westlands Business Park, Nairobi, Kenya</div>
                <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> <strong>Contact:</strong> hello@gigva.co.ke | +254 701 443 444</div>
                <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> <strong>Serving:</strong> Kenya &amp; East Africa</div>
              </div>
            </div>
            <div className="bg-slate-900 rounded-2xl p-6 text-white">
              <h3 className="font-bold text-xl mb-4 text-sky-400">Gigva by the Numbers</h3>
              <div className="space-y-4">
                {[
                  { stat: '1,500+', label: 'Businesses on Gigva SaaS platform' },
                  { stat: '23', label: 'Kenyan counties with active users' },
                  { stat: '99.9%', label: 'Platform uptime SLA guarantee' },
                  { stat: 'KSh 2,999', label: 'Starting price per month' },
                ].map(s => (
                  <div key={s.stat} className="flex items-center gap-4 border-b border-slate-800 pb-4">
                    <span className="text-2xl font-bold text-white">{s.stat}</span>
                    <span className="text-slate-400 text-sm">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-sky-700 py-16 px-5 md:px-8 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            Ready to join Kenya's fastest-growing SaaS platform?
          </h2>
          <p className="text-sky-200 mb-8">
            Join 1,500+ Kenyan businesses using Gigva to automate operations, reconcile
            M-Pesa, and run Kenya-compliant payroll. Serving Nairobi and across Kenya.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/trial" className="bg-white text-sky-800 font-bold px-8 py-3 rounded-lg hover:bg-sky-50 transition-colors inline-flex items-center gap-2 justify-center">
              Start Free 30-Day Trial <ArrowRight size={16} />
            </Link>
            <Link href="/" className="border border-sky-400 text-white font-bold px-8 py-3 rounded-lg hover:bg-sky-600 transition-colors inline-flex items-center gap-2 justify-center">
              Back to Homepage
            </Link>
          </div>
          <p className="mt-6 text-sky-300 text-xs">
            Based in Nairobi, Kenya — hello@gigva.co.ke — +254 701 443 444
          </p>
        </div>
      </section>

    </main>
  )
}
import Link from 'next/link'
import { CheckCircle2, ArrowRight, MapPin, Star, Zap, Shield, BarChart3, Users } from 'lucide-react'

export const metadata = {
  title: 'Top SaaS Platforms in Kenya | Gigva — Leading Business Software in Nairobi',
  description:
    'Discover why Gigva is Kenya's leading SaaS platform. AI-powered business software built in Nairobi for Kenyan SMEs — M-Pesa reconciliation, payroll, analytics, and more.',
  keywords: [
    'SaaS platform Kenya',
    'SaaS Kenya',
    'software Kenya',
    'Nairobi tech companies',
    'business software Kenya',
    'AI software Kenya',
    'software companies in Kenya',
    'Nairobi software solutions',
    'tech platforms Nairobi',
    'Kenya business software',
    'East Africa SaaS',
    'cloud software Kenya',
  ],
  alternates: { canonical: 'https://gigva.co.ke/saas-platform-kenya' },
  openGraph: {
    title: 'Top SaaS Platforms in Kenya | Gigva',
    description: 'Gigva is Kenya's leading SaaS platform — built in Nairobi for Kenyan businesses. M-Pesa reconciliation, payroll, and AI analytics.',
    url: 'https://gigva.co.ke/saas-platform-kenya',
    type: 'website',
    locale: 'en_KE',
  },
}

const features = [
  {
    icon: Zap,
    title: 'M-Pesa Reconciliation',
    desc: 'Automatically match every M-Pesa transaction to your invoices in real time. Built specifically for Kenya's Daraja API.',
  },
  {
    icon: Users,
    title: 'Kenya-Compliant Payroll',
    desc: 'Full PAYE, NSSF Tier I & II, SHIF/NHIF, and Affordable Housing Levy calculations — always up to date with KRA regulations.',
  },
  {
    icon: BarChart3,
    title: 'AI-Powered Analytics',
    desc: 'Real-time dashboards and predictive insights for Kenyan businesses. Track revenue, reconciliation rates, and business KPIs.',
  },
  {
    icon: Shield,
    title: 'Kenya Data Protection Compliant',
    desc: 'All data hosted in Nairobi. Fully compliant with Kenya's Data Protection Act 2019 and East Africa data sovereignty laws.',
  },
]

const competitors = [
  { name: 'Gigva', kenyaBuilt: true, mPesa: true, payroll: true, kenyaTax: true, nairobi: true, price: 'From KSh 2,999/mo' },
  { name: 'Generic Global SaaS A', kenyaBuilt: false, mPesa: false, payroll: true, kenyaTax: false, nairobi: false, price: 'USD pricing' },
  { name: 'Generic Global SaaS B', kenyaBuilt: false, mPesa: false, payroll: true, kenyaTax: false, nairobi: false, price: 'USD pricing' },
]

const counties = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika',
  'Meru', 'Nyeri', 'Kakamega', 'Machakos', 'Kitale', 'Garissa',
]

export default function SaasKenyaPage() {
  return (
    <main className="bg-white">

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-sky-900 to-sky-700 text-white py-20 px-5 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-sky-800/60 border border-sky-600 text-sky-200 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <MapPin size={11} />
            Based in Nairobi, Kenya &mdash; Serving businesses across all 47 counties
          </div>
          <h1 className="font-bold text-4xl md:text-5xl mb-6 leading-tight">
            Top SaaS Platforms in Kenya
          </h1>
          <p className="text-sky-100 text-lg mb-4 max-w-2xl mx-auto">
            Kenya&apos;s growing tech economy needs SaaS platforms that understand local payments,
            tax regulations, and business realities. Here&apos;s why <strong>Gigva leads as Kenya&apos;s
            premier business software platform</strong> — built in Nairobi, for Kenyan businesses.
          </p>
          <p className="text-sky-200 text-sm mb-8 max-w-xl mx-auto">
            Over 1,500 businesses across Kenya use Gigva to automate operations, reconcile
            M-Pesa payments, and manage payroll with Kenya-compliant tax calculations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/trial" className="bg-white text-sky-800 font-bold px-8 py-3 rounded-lg hover:bg-sky-50 transition-colors inline-flex items-center gap-2 justify-center">
              Start Free Trial <ArrowRight size={16} />
            </Link>
            <Link href="/book-demo" className="border border-sky-400 text-white font-bold px-8 py-3 rounded-lg hover:bg-sky-800/60 transition-colors inline-flex items-center gap-2 justify-center">
              Book a Demo
            </Link>
          </div>
        </div>
      </section>

      {/* What is SaaS in Kenya */}
      <section className="py-16 px-5 md:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            SaaS in Kenya: A Growing Opportunity
          </h2>
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 text-base leading-relaxed mb-4">
              Kenya is East Africa&apos;s technology hub, home to Nairobi&apos;s Silicon Savannah —
              a thriving ecosystem of tech startups, software companies, and digital innovation.
              The demand for <strong>SaaS platforms in Kenya</strong> has surged as businesses
              move from manual spreadsheets to cloud-based business software.
            </p>
            <p className="text-slate-600 text-base leading-relaxed mb-4">
              However, most global SaaS platforms are not built for Kenya. They don&apos;t support
              M-Pesa integration, don&apos;t calculate PAYE under Kenya Revenue Authority rules,
              and charge in USD — making them expensive and impractical for Kenyan SMEs.
            </p>
            <p className="text-slate-600 text-base leading-relaxed">
              <strong>Gigva was built specifically as a SaaS platform in Kenya</strong>,
              with M-Pesa at its core, Kenya-compliant payroll calculations, and data hosted
              in Nairobi to meet the Kenya Data Protection Act 2019.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-5 md:px-8 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">
            Why Gigva is Kenya&apos;s Leading SaaS Platform
          </h2>
          <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
            Gigva is more than just business software in Kenya — it&apos;s a complete operating
            system for Kenyan businesses, from Nairobi retail shops to logistics firms across
            East Africa.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map(f => (
              <div key={f.title} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                    <f.icon size={20} className="text-sky-600" />
                  </div>
                  <h3 className="font-bold text-slate-900">{f.title}</h3>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 px-5 md:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">
            How Kenya SaaS Platforms Compare
          </h2>
          <p className="text-slate-600 text-center mb-10 max-w-xl mx-auto">
            When evaluating business software in Kenya, the key differentiator is local fit —
            M-Pesa support, Kenya tax compliance, and local hosting.
          </p>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Platform</th>
                  <th className="px-4 py-3 text-center">Kenya-Built</th>
                  <th className="px-4 py-3 text-center">M-Pesa Native</th>
                  <th className="px-4 py-3 text-center">Kenya Tax (PAYE/NSSF/SHIF)</th>
                  <th className="px-4 py-3 text-center">Nairobi Hosted</th>
                  <th className="px-4 py-3 text-left">Pricing</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((c, i) => (
                  <tr key={c.name} className={i === 0 ? 'bg-sky-50 border-y-2 border-sky-400' : 'border-b border-slate-100'}>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {i === 0 ? (
                        <span className="flex items-center gap-2">
                          <Star size={14} className="text-sky-500 fill-sky-500" />
                          {c.name}
                          <span className="text-[10px] bg-sky-500 text-white px-2 py-0.5 rounded-full font-bold">#1 in Kenya</span>
                        </span>
                      ) : c.name}
                    </td>
                    <td className="px-4 py-3 text-center">{c.kenyaBuilt ? <CheckCircle2 size={16} className="text-emerald-500 mx-auto" /> : <span className="text-slate-300 text-lg">&times;</span>}</td>
                    <td className="px-4 py-3 text-center">{c.mPesa ? <CheckCircle2 size={16} className="text-emerald-500 mx-auto" /> : <span className="text-slate-300 text-lg">&times;</span>}</td>
                    <td className="px-4 py-3 text-center">{c.kenyaTax ? <CheckCircle2 size={16} className="text-emerald-500 mx-auto" /> : <span className="text-slate-300 text-lg">&times;</span>}</td>
                    <td className="px-4 py-3 text-center">{c.nairobi ? <CheckCircle2 size={16} className="text-emerald-500 mx-auto" /> : <span className="text-slate-300 text-lg">&times;</span>}</td>
                    <td className="px-4 py-3 text-slate-700">{c.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Counties coverage */}
      <section className="py-16 px-5 md:px-8 bg-sky-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Serving Kenyan Businesses in 23+ Counties
          </h2>
          <p className="text-slate-600 mb-10">
            From Nairobi&apos;s CBD to Mombasa&apos;s port, from Kisumu&apos;s lakeside economy
            to the agricultural heartlands &mdash; Gigva&apos;s SaaS platform reaches businesses
            across Kenya and East Africa.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {counties.map(county => (
              <span key={county} className="bg-white border border-sky-200 text-sky-700 text-sm font-medium px-4 py-2 rounded-full shadow-sm">
                {county}
              </span>
            ))}
            <span className="bg-sky-600 text-white text-sm font-medium px-4 py-2 rounded-full">
              + 35 more counties
            </span>
          </div>
        </div>
      </section>

      {/* About Gigva */}
      <section className="py-16 px-5 md:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            About Gigva &mdash; Kenya&apos;s SaaS Pioneer
          </h2>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-slate-600 leading-relaxed mb-4">
                Founded and headquartered in <strong>Nairobi, Kenya</strong>, Gigva was born
                from a simple observation: Kenyan businesses deserved business software that
                actually understood Kenya.
              </p>
              <p className="text-slate-600 leading-relaxed mb-4">
                As a <strong>SaaS company in Kenya</strong>, Gigva has built deep integrations
                with Safaricom&apos;s M-Pesa Daraja API, implemented Kenya Revenue Authority&apos;s
                PAYE tax bands, and stays current with NSSF, SHIF, and Affordable Housing
                Levy regulations.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Today, Gigva serves over 1,500 Kenyan businesses — from retail shops in Nairobi&apos;s
                Westlands to logistics companies operating across East Africa.
              </p>
              <div className="mt-6 space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2"><MapPin size={14} className="text-sky-500" /> <strong>Headquarters:</strong> Westlands Business Park, Nairobi, Kenya</div>
                <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> <strong>Contact:</strong> hello@gigva.co.ke | +254 701 443 444</div>
                <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> <strong>Serving:</strong> Kenya &amp; East Africa</div>
              </div>
            </div>
            <div className="bg-slate-900 rounded-2xl p-6 text-white">
              <h3 className="font-bold text-xl mb-4 text-sky-400">Gigva by the Numbers</h3>
              <div className="space-y-4">
                {[
                  { stat: '1,500+', label: 'Businesses on Gigva SaaS platform' },
                  { stat: '23', label: 'Kenyan counties with active users' },
                  { stat: '99.9%', label: 'Platform uptime SLA guarantee' },
                  { stat: 'KSh 2,999', label: 'Starting price per month' },
                ].map(s => (
                  <div key={s.stat} className="flex items-center gap-4 border-b border-slate-800 pb-4">
                    <span className="text-2xl font-bold text-white">{s.stat}</span>
                    <span className="text-slate-400 text-sm">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-sky-700 py-16 px-5 md:px-8 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            Ready to join Kenya&apos;s fastest-growing SaaS platform?
          </h2>
          <p className="text-sky-200 mb-8">
            Join 1,500+ Kenyan businesses using Gigva to automate operations, reconcile
            M-Pesa, and run Kenya-compliant payroll. Serving Nairobi and across Kenya.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/trial" className="bg-white text-sky-800 font-bold px-8 py-3 rounded-lg hover:bg-sky-50 transition-colors inline-flex items-center gap-2 justify-center">
              Start Free 30-Day Trial <ArrowRight size={16} />
            </Link>
            <Link href="/" className="border border-sky-400 text-white font-bold px-8 py-3 rounded-lg hover:bg-sky-600 transition-colors inline-flex items-center gap-2 justify-center">
              Back to Homepage
            </Link>
          </div>
          <p className="mt-6 text-sky-300 text-xs">
            Based in Nairobi, Kenya &mdash; hello@gigva.co.ke &mdash; +254 701 443 444
          </p>
        </div>
      </section>

    </main>
  )
}
