import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

export default function CtaBanner() {
  return (
    <section className="section bg-slate-900">
      <div className="inner">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            Stop reconciling M-Pesa payments manually.<br />
            <span className="text-sky-400">Start doing it in seconds.</span>
          </h2>
          <p className="text-slate-400 mb-8 leading-relaxed max-w-xl mx-auto">
            Retail shops, logistics firms, and SMEs across Nairobi use Gigva to eliminate
            spreadsheet reconciliation. 3 months free, full access, no credit card.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Link href="/trial" className="btn-primary py-3 px-7 text-base justify-center">
              Start free trial <ArrowRight size={16} />
            </Link>
            <Link href="/book-demo" className="btn-secondary py-3 px-7 text-base justify-center bg-transparent text-slate-300 border-slate-700 hover:border-slate-500 hover:text-white">
              Book a demo
            </Link>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
            {[
              'No credit card for trial',
              'Guided setup included',
              'Kenya-hosted data',
              'Cancel any time',
            ].map(p => (
              <div key={p} className="flex items-center gap-1.5 text-xs text-slate-500">
                <CheckCircle2 size={12} className="text-sky-500 flex-shrink-0" />
                {p}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
