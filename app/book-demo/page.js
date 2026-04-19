import BookDemoForm from '@/components/forms/BookDemoForm'
import { CheckCircle2, Clock, Video, MessageSquare } from 'lucide-react'

export const metadata = {
  title: 'Book a Demo',
  description: 'Schedule a 30-minute walkthrough of Gigva. See the real product with data that reflects your business.',
}

export default function BookDemoPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-sky-50 to-white pt-16 pb-10 px-5 md:px-8">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-3">Book a Demo</p>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight tracking-tight">
            See Gigva with your<br />
            <span className="text-sky-500">own business data.</span>
          </h1>
          <p className="text-slate-600 text-base leading-relaxed max-w-xl">
            A 30-minute walkthrough — no slides, no pitches. Just the real product,
            configured to reflect your transaction type and business.
          </p>
        </div>
      </section>

      <section className="section bg-white border-t border-slate-200">
        <div className="inner">
          <div className="grid md:grid-cols-3 gap-10 items-start">

            {/* Left — what to expect */}
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">What to expect</p>
                <ol className="space-y-4">
                  {[
                    { icon: MessageSquare, step: 'We review your request', desc: 'Same business day. We read every submission.' },
                    { icon: Clock,         step: 'You receive a calendar link', desc: 'Choose a time that suits you — morning or afternoon.' },
                    { icon: Video,         step: '30-minute video walkthrough', desc: 'Bring your team. We show you live reconciliation with realistic data.' },
                    { icon: CheckCircle2,  step: 'Honest fit assessment', desc: 'We tell you plainly whether Gigva is right for your setup.' },
                  ].map(({ icon: Icon, step, desc }, i) => (
                    <li key={step} className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-full bg-sky-50 border border-sky-200 text-sky-600
                                       flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-slate-800">{step}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="bg-sky-50 border border-sky-100 rounded-xl p-4">
                <p className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-3">Gigva is built for</p>
                <ul className="space-y-2">
                  {[
                    'Retail and wholesale shops',
                    'Logistics and courier businesses',
                    'Restaurants and food distributors',
                    'Clinics, schools, and service firms',
                    'Any Kenyan SME with daily M-Pesa receipts',
                  ].map(t => (
                    <li key={t} className="flex items-center gap-2 text-xs text-slate-700">
                      <CheckCircle2 size={11} className="text-sky-500 flex-shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right — form */}
            <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-sky-500">
                <h2 className="font-bold text-lg text-white">Request a demo</h2>
                <p className="text-sm mt-1 text-sky-100">We respond within one business day to confirm a time.</p>
              </div>
              <div className="p-6">
                <BookDemoForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
