import Hero              from '@/components/home/Hero'
import ProblemStatement  from '@/components/home/ProblemStatement'
import HowItWorks        from '@/components/home/HowItWorks'
import DashboardPreview  from '@/components/product/DashboardPreview'
import Modules           from '@/components/home/Modules'
import SocialProof       from '@/components/home/SocialProof'
import PricingSnippet    from '@/components/home/PricingSnippet'
import CtaBanner         from '@/components/home/CtaBanner'

export const metadata = {
  title: 'Gigva — M-Pesa Reconciliation for Kenyan SMBs',
  description:
    'Gigva automatically reconciles M-Pesa transactions for Kenyan retail shops, logistics firms, and SMEs. Real-time dashboard, invoice matching, and financial reports.',
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
    </>
  )
}
