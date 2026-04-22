import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Mail, ArrowRight, Target, Users, Calendar } from 'lucide-react'

export const metadata = {
  title: 'About',
  description: 'Gigva Kenya Limited has been building M-Pesa payment management software for Kenyan SMBs since 2012. Learn our history, mission, and team.',
}

const LEADERSHIP = [
  {
    initials: 'MK',
    name: 'Mwangi Kamau',
    role: 'CEO',
    since: 'With Gigva since 2012',
    bio: 'Co-founded Gigva in 2012 after working on M-Pesa payment integrations in Nairobi\'s retail sector. Responsible for business strategy and customer partnerships.',
    photo: '/team/mwangi-kamau.webp',
    email: 'ceo@gigva.co.ke',
  },
  {
    initials: 'AW',
    name: 'Aisha Waweru',
    role: 'CTO',
    since: 'With Gigva since 2012',
    bio: 'Co-founded Gigva and has led platform engineering since 2012. Designed the original statement parser, the first Daraja API integration, and the current Daraja v2 C2B webhook architecture.',
    photo: '/team/aisha-waweru.webp',
    email: 'cto@gigva.co.ke',
  },
  {
    initials: 'SO',
    name: 'Samuel Otieno',
    role: 'Head of Customer Success',
    since: 'With Gigva since 2014',
    bio: 'Accountant by training. Ensures reconciliation outputs are correct and useful, and leads all customer onboarding and ongoing support.',
    photo: '/team/samuel-otieno.jpg',
    email: 'samuel.otieno@gigva.co.ke',
  },
]

const TEAM = [
  {
    initials: 'NM',
    name: 'Njeri Mwangi',
    role: 'Head of Product',
    since: 'With Gigva since 2017',
    bio: 'Leads product strategy and roadmap. Works directly with customers across retail and logistics.',
    photo: '/team/njeri-mwangi.webp',
  },
  {
    initials: 'EG',
    name: 'Edward Gitau',
    role: 'Lead Engineer',
    since: 'With Gigva since 2016',
    bio: 'Joined Gigva in 2016 as an IT Support Technician and progressed through the ranks to Senior Software Engineer before being appointed Lead Engineer in 2021. His journey reflects strong technical growth and a deep understanding of the company\'s systems and product development, contributing significantly to the development, reliability, and evolution of the platform.',
    photo: '/team/edward-gitau.webp',
  },
  {
    initials: 'DN',
    name: 'Daniel Njoroge',
    role: 'Operations Lead',
    since: 'With Gigva since 2020',
    bio: 'Oversees the day-to-day operational processes that support platform delivery.',
    photo: '/team/daniel-njoroge.jpg',
  },
  {
    initials: 'JO',
    name: 'James Odhiambo',
    role: 'Finance & Compliance Lead',
    since: 'With Gigva since 2016',
    bio: 'Manages financial operations and ensures compliance with the Kenya Data Protection Act 2019.',
    photo: '/team/james-odhiambo.jpg',
  },
  {
    initials: 'FK',
    name: 'Fatuma Kamau',
    role: 'People & Operations Lead',
    since: 'With Gigva since 2018',
    bio: 'Responsible for people management, hiring, and internal processes.',
    photo: '/team/fatuma-kamau.webp',
  },
]

function MemberCard({ person, size = 'md' }) {
  const isLg = size === 'lg'
  return (
    <div className={`group bg-white border border-slate-200 rounded-2xl overflow-hidden
                     shadow-sm hover:shadow-md hover:-translate-y-0.5
                     transition-all duration-200 flex flex-col`}>
      {/* Photo */}
      <div className={`relative overflow-hidden bg-slate-100 ${isLg ? 'aspect-square' : 'aspect-square'}`}>
        {person.photo ? (
          <Image
            src={person.photo}
            alt={`${person.name}, ${person.role} at Gigva Kenya`}
            fill
            sizes={isLg ? '(max-width:768px) 100vw, 33vw' : '(max-width:768px) 50vw, 25vw'}
            className="object-cover object-top group-hover:scale-[1.03] transition-transform duration-300"
            quality={85}
          />
        ) : (
          /* Fallback initials */
          <div className="absolute inset-0 flex items-center justify-center bg-sky-50">
            <span className={`font-bold text-sky-600 select-none ${isLg ? 'text-4xl' : 'text-2xl'}`}>
              {person.initials}
            </span>
          </div>
        )}
        {/* Subtle gradient overlay at bottom for text legibility below */}
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white/30 to-transparent" />
      </div>

      {/* Info */}
      <div className={`p-4 flex-1 flex flex-col ${isLg ? 'p-5' : 'p-4'}`}>
        <div className="font-bold text-slate-900 text-sm leading-tight mb-0.5">{person.name}</div>
        <div className="text-xs text-sky-600 font-semibold mb-1">{person.role}</div>
        <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mb-3">
          {person.since}
        </div>
        <p className="text-xs text-slate-600 leading-relaxed flex-1">{person.bio}</p>
        {person.email && (
          <a
            href={`mailto:${person.email}`}
            className="mt-3 flex items-center gap-1.5 text-[11px] text-sky-600 hover:text-sky-700
                       font-medium truncate transition-colors duration-150 group/email"
          >
            <Mail size={11} className="flex-shrink-0 opacity-70 group-hover/email:opacity-100" />
            {person.email}
          </a>
        )}
      </div>
    </div>
  )
}

export default function AboutPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-b from-sky-50 to-white pt-16 pb-12 px-5 md:px-8">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-3">About Gigva</p>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-5 leading-tight tracking-tight">
            Solving the same problem<br />
            <span className="text-sky-500">since 2012.</span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Gigva Kenya Limited was founded in Nairobi in 2012 to solve a specific, persistent
            problem in Kenyan business operations: the manual work of tracking and reconciling
            M-Pesa payments. Over thirteen years, that focus has not changed.
          </p>
        </div>
      </section>

      {/* ── At a glance ── */}
      <section className="section bg-white border-t border-slate-200">
        <div className="inner max-w-4xl">
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: Calendar,
                label: 'Founded',
                text: 'Established in Nairobi in 2012. Over thirteen years of operating in Kenya\'s SMB payment management space.',
              },
              {
                icon: Users,
                label: 'Who we serve',
                text: 'Retail shops, logistics firms, restaurants, service businesses, and any Kenyan SME where M-Pesa is the primary payment method.',
              },
              {
                icon: Target,
                label: 'Our focus',
                text: 'M-Pesa payment tracking and automated reconciliation. One problem, solved properly — we have not tried to be everything to everyone.',
              },
            ].map(({ icon: Icon, label, text }) => (
              <div key={label} className="bg-sky-50 border border-sky-100 rounded-2xl p-5">
                <div className="w-9 h-9 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={16} className="text-sky-600" />
                </div>
                <div className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-2">{label}</div>
                <p className="text-sm text-slate-700 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>

          {/* Milestone strip */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Company history</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200">
              {[
                { year: '2012', event: 'Gigva Kenya Limited incorporated. First product: manual M-Pesa statement parser for retail shops in Nairobi.' },
                { year: '2015', event: 'Launched first web-based dashboard. Integrated with early Safaricom Daraja API on release. Expanded to logistics sector customers.' },
                { year: '2019', event: 'Rebuilt reconciliation engine to support Daraja v2 C2B webhooks. Added real-time transaction ingestion, reducing capture time to under 5 seconds.' },
                { year: '2024', event: 'Launched current platform with analytics, configurable alerts, and REST API integrations. Serving businesses across retail, logistics, F&B, and services.' },
              ].map(({ year, event }) => (
                <div key={year} className="p-5">
                  <div className="font-bold text-sky-500 text-lg mb-2">{year}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">{event}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── History ── */}
      <section className="section bg-slate-50 border-t border-slate-200">
        <div className="inner max-w-3xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">How we got here</h2>
          <div className="space-y-5 text-slate-700 leading-relaxed text-sm">
            <p>
              Gigva was founded in Nairobi in 2012 at a time when M-Pesa had already become the
              primary payment channel for millions of Kenyan businesses. The technology was
              mature. The volume was large. But the operational tooling for business owners had
              not kept pace — there was no straightforward way for a retail shop or distributor
              to connect their M-Pesa receipts to their invoices without downloading statements
              and working through them manually.
            </p>
            <p>
              The company's first product was a desktop application that parsed M-Pesa
              statements and matched them against a manually maintained invoice list. It was
              not elegant, but it replaced a process that was costing our early customers
              several hours a week.
            </p>
            <p>
              When Safaricom launched the Daraja API, we were among the first software
              providers to integrate with C2B webhooks. That integration transformed the
              product from a statement-processing tool into a real-time payment operations
              platform. Payments began appearing in customer dashboards within seconds of
              being made, and reconciliation shifted from a weekly batch process to a
              continuous, automated one.
            </p>
            <p>
              Over thirteen years, the businesses we serve have grown more sophisticated
              in how they use financial data, and so has the platform. What has not changed
              is the focus: every feature in Gigva exists to make M-Pesa payment management
              faster, more accurate, and less dependent on manual work.
            </p>
          </div>
        </div>
      </section>

      {/* ── Leadership ── */}
      <section className="section bg-white border-t border-slate-200">
        <div className="inner">
          <div className="mb-10">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Leadership</p>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">The people who built Gigva</h2>
            <p className="text-slate-500 text-sm max-w-xl">
              Based in Nairobi since 2012. We respond to every message personally.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {LEADERSHIP.map(p => (
              <MemberCard key={p.name} person={p} size="lg" />
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="section bg-slate-50 border-t border-slate-200">
        <div className="inner">
          <div className="mb-10">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Team</p>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">The team behind the platform</h2>
            <div className="bg-sky-50 border border-sky-100 rounded-xl px-5 py-4 max-w-2xl">
              <p className="text-sm text-slate-700 leading-relaxed">
                Our platform is built and maintained by a dedicated team of 20 focused
                on payment systems, data accuracy, and reliability.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {TEAM.map(p => (
              <MemberCard key={p.name} person={p} size="sm" />
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section className="section bg-white border-t border-slate-200">
        <div className="inner max-w-xl text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Get in touch</h2>
          <p className="text-sm text-slate-600 mb-5">
            We have been answering every email ourselves since 2012. No ticketing system, no automated replies.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Mail size={15} className="text-sky-500" />
              <a href="mailto:hello@gigva.co.ke" className="hover:text-sky-600 transition-colors">hello@gigva.co.ke</a>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <MapPin size={15} className="text-sky-500" />
              <span>Westlands, Nairobi, Kenya</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/contact" className="btn-secondary">Send a message</Link>
          </div>
        </div>
      </section>
    </>
  )
}
