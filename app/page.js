import Hero              from '@/components/home/Hero'
import ProblemStatement  from '@/components/home/ProblemStatement'
import HowItWorks        from '@/components/home/HowItWorks'
import DashboardPreview  from '@/components/product/DashboardPreview'
import Modules           from '@/components/home/Modules'
import SocialProof       from '@/components/home/SocialProof'
import PricingSnippet    from '@/components/home/PricingSnippet'
import CtaBanner         from '@/components/home/CtaBanner'
import Link              from 'next/link'

export const metadata = {
  title: 'Gigva | Leading SaaS Platform in Kenya for Business Automation',
  description:
    'Gigva is a leading SaaS platform in Kenya offering AI-powered analytics, M-Pesa reconciliation, payroll, and marketplace solutions for businesses in Nairobi and across Kenya.',
  keywords: [
    'SaaS platform Kenya',
    'business software Kenya',
    'Nairobi software solutions',
    'AI software Kenya',
    'M-Pesa reconciliation Kenya',
  ],
  alternates: { canonical: 'https://gigva.co.ke' },
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProblemStatement />
      <DashboardPreview />
      <HowItWorks />
      <Modules />
      <SocialProof />
      <PricingSnippet />
      <CtaBanner />

      {/* Internal link to Kenya SaaS landing page — boosts topical authority */}
      <section className="bg-sky-50 border-t border-sky-100 py-10 px-5 text-center">
        <p className="text-slate-600 text-sm mb-3">
          Looking for the best SaaS platform in Kenya?
        </p>
        <Link
          href="/saas-platform-kenya"
          className="inline-flex items-center gap-2 text-sky-600 font-semibold text-sm hover:underline"
        >
          Discover why Gigva leads Kenya's SaaS market &rarr;
        </Link>
      </section>
    </>
  )
}
