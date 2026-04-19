import TrialFlow from '@/components/forms/TrialFlow'

export const metadata = {
  title: 'Start Free Trial',
  description: 'Request access to Gigva. Our team will help you connect your M-Pesa system within 24 hours.',
}

export default function TrialPage() {
  return (
    <section className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50 px-5 md:px-8 py-16">
      <TrialFlow />
    </section>
  )
}
