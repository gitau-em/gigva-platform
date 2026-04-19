import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const metadata = { title: '404 — Page not found' }

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-5 py-20 text-center">
      <div className="text-7xl font-display font-bold text-sky-500 mb-4">404</div>
      <h1 className="text-2xl font-display text-slate-900 mb-3">Page not found</h1>
      <p className="text-slate-600 text-sm mb-8 max-w-sm">
        That page does not exist. If you followed a link that should work, let us know at{' '}
        <a href="mailto:hello@gigvakenya.co.ke" className="text-sky-600 hover:underline">
          hello@gigvakenya.co.ke
        </a>
      </p>
      <div className="flex gap-3 flex-col sm:flex-row">
        <Link href="/" className="btn-primary">
          Go to homepage <ArrowRight size={14} />
        </Link>
        <Link href="/contact" className="btn-secondary">
          Contact us
        </Link>
      </div>
    </div>
  )
}
