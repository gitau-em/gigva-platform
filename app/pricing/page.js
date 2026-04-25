import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Pricing | Gigva Kenya',
  description: 'Gigva pricing plans for retail, logistics, hospitality, healthcare, and SMEs across Kenya.',
}

export default function PricingPage() {
  redirect('/for')
}
