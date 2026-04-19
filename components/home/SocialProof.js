export default function SocialProof() {
  return (
    <section className="section bg-white border-t border-slate-200">
      <div className="inner">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <p className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-3">Trusted in Nairobi</p>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Built in Nairobi. Tested by real businesses.
          </h2>
          <p className="text-slate-600 leading-relaxed">
            Gigva has operated in Kenya's M-Pesa payment space since 2012. We work directly
            with retail shops, logistics operators, and service businesses — and every
            feature in the product has been shaped by how those businesses actually work.
          </p>
        </div>

        {/* Honest positioning metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { val: '2012',    lbl: 'Founded in Nairobi' },
            { val: '3 months', lbl: 'Free to start' },
            { val: 'Daraja v2', lbl: 'M-Pesa integration' },
            { val: 'Kenya',   lbl: 'Where data is hosted' },
          ].map(({ val, lbl }) => (
            <div key={lbl} className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
              <div className="font-bold text-xl text-slate-900 leading-none">{val}</div>
              <div className="text-xs text-slate-500 mt-1.5">{lbl}</div>
            </div>
          ))}
        </div>

        {/* Customer quotes */}
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              quote: "I used to spend every Friday afternoon matching M-Pesa payments to invoices in Excel. Gigva replaced that with a 5-minute review of anything flagged.",
              role: 'Owner, wholesale distribution',
              location: 'Industrial Area, Nairobi',
              initials: 'M.N.',
            },
            {
              quote: "The alert when a payment arrives without a matching invoice has already saved us twice. We caught a duplicate payment from a client before it caused confusion.",
              role: 'Finance manager, logistics firm',
              location: 'Westlands, Nairobi',
              initials: 'A.K.',
            },
            {
              quote: "Our accountant now gets a reconciliation report at month-end instead of a pile of M-Pesa screenshots. Setup was less than an hour.",
              role: 'Founder, e-commerce retail',
              location: 'Nairobi CBD',
              initials: 'P.O.',
            },
          ].map(t => (
            <div key={t.role} className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(s => (
                  <svg key={s} className="w-3.5 h-3.5 text-amber-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed italic mb-4">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {t.initials}
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-700">{t.role}</div>
                  <div className="text-[11px] text-slate-400">{t.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
