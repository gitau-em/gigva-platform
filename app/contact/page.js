import ContactForm from '@/components/forms/ContactForm'
import { Mail, MapPin, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Contact',
  description: 'Send a message to the Gigva team. We respond within one business day.',
}

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-sky-50 to-white pt-16 pb-10 px-5 md:px-8">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-3">Contact</p>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight tracking-tight">
            Get in touch
          </h1>
          <p className="text-slate-600 text-base leading-relaxed">
            We respond to every message personally, usually within one business day (EAT).
            No ticketing system, no automated replies.
          </p>
        </div>
      </section>

      <section className="section bg-white border-t border-slate-200">
        <div className="inner">
          <div className="grid md:grid-cols-3 gap-10 items-start">

            {/* Left — contact details */}
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 mb-4 text-sm">Contact details</h3>
                <div className="space-y-3">
                  {[
                    { icon: Mail,   label: 'Email',    value: 'hello@gigva.co.ke', href: 'mailto:hello@gigva.co.ke' },
                    { icon: MapPin, label: 'Location', value: 'Westlands, Nairobi, Kenya' },
                    { icon: Clock,  label: 'Hours',    value: 'Mon – Fri, 8 am – 6 pm EAT' },
                  ].map(({ icon: Icon, label, value, href }) => (
                    <div key={label} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-sky-50 border border-sky-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon size={14} className="text-sky-600" />
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-500 mb-0.5 font-medium">{label}</div>
                        {href
                          ? <a href={href} className="text-sm text-sky-600 hover:underline">{value}</a>
                          : <div className="text-sm text-slate-700">{value}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Want a demo instead? */}
              <div className="bg-sky-50 border border-sky-100 rounded-xl p-4">
                <p className="text-xs font-bold text-sky-700 mb-1">Want a product walkthrough?</p>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  If you'd like to see Gigva in action, book a 30-minute demo with our team.
                </p>
                <Link href="/book-demo" className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700">
                  Book a demo <ArrowRight size={12} />
                </Link>
              </div>
            </div>

            {/* Right — contact form */}
            <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
                <h2 className="font-bold text-lg text-slate-900">Send us a message</h2>
                <p className="text-sm mt-1 text-slate-500">We respond within one business day.</p>
              </div>
              <div className="p-6">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
