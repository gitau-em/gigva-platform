import Link from 'next/link'

const COLS = [
  {
    title: 'Platform',
    links: [
      { href: '/product',   label: 'Product overview' },
      { href: '/features',  label: 'Features'         },
      { href: '/pricing',   label: 'Pricing'          },
      { href: '/saas-platform-kenya', label: 'SaaS Platform Kenya' },
    ],
  },
  {
    title: "Who it's for",
    links: [
      { href: '/product#retail',       label: 'Retail shops'       },
      { href: '/product#logistics',    label: 'Logistics firms'    },
      { href: '/product#restaurants',  label: 'Restaurants & F&B'  },
      { href: '/product#services',     label: 'Service businesses' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about',     label: 'About us'  },
      { href: '/security',  label: 'Security'  },
      { href: '/contact',   label: 'Contact'   },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy policy'   },
      { href: '/terms',   label: 'Terms of service' },
    ],
  },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-slate-900 text-slate-400 pt-14 pb-8 px-5 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 pb-12 border-b border-slate-800">

          {/* Brand column */}
          <div className="col-span-2">
            <Link href="/" className="inline-block mb-4" aria-label="Gigva home">
              <svg width="130" height="34" viewBox="0 0 152 40" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="40" height="40" rx="9" fill="#0ea5e9"/>
                <path d="M28.5 10.5 A10.5 10.5 0 1 0 28.5 29.5" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none"/>
                <line x1="28.5" y1="20" x2="20.5" y2="20" stroke="#fff" strokeWidth="4" strokeLinecap="round"/>
                <line x1="28.5" y1="29.5" x2="28.5" y2="24" stroke="#fff" strokeWidth="4" strokeLinecap="round"/>
                <circle cx="32" cy="7" r="2.5" fill="#7dd3fc"/>
                <text x="49" y="24" fontFamily="system-ui,sans-serif" fontWeight="800" fontSize="18" fill="#0ea5e9" letterSpacing="-.5">GIGVA</text>
                <text x="50" y="35" fontFamily="system-ui,sans-serif" fontWeight="700" fontSize="7.5" fill="#7dd3fc" letterSpacing="3.5">KENYA</text>
              </svg>
            </Link>
            <p className="text-sm leading-relaxed text-slate-500 max-w-[240px] mb-4">
              Kenya&apos;s leading SaaS platform for business automation. M-Pesa automation, reconciliation,
              and AI-powered analytics for Nairobi businesses and SMEs across Kenya.
            </p>
            <div className="space-y-1 text-xs text-slate-600">
              <div className="font-semibold text-slate-400">&#x1F1F0;&#x1F1EA; Based in Nairobi, Kenya</div>
              <div>Westlands Business Park, Nairobi 00100</div>
              <a
                href="tel:+254701443444"
                className="block text-slate-500 hover:text-sky-400 transition-colors"
              >
                +254 701 443 444
              </a>
              <a
                href="mailto:hello@gigva.co.ke"
                className="block text-slate-500 hover:text-sky-400 transition-colors"
              >
                hello@gigva.co.ke
              </a>
            </div>
            {/* Social links */}
            <div className="flex items-center gap-3 mt-4">
              <a
                href="https://www.linkedin.com/in/gigva-kenya-7b19b1402"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Gigva Kenya on LinkedIn"
                className="text-slate-400 hover:text-sky-400 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Link columns */}
          {COLS.map(col => (
            <div key={col.title}>
              <h5 className="text-[11px] font-bold text-slate-300 uppercase tracking-widest mb-3">
                {col.title}
              </h5>
              <ul className="flex flex-col gap-2">
                {col.links.map(l => (
                  <li key={l.href + l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-slate-500 hover:text-sky-400 transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <span className="text-xs text-slate-600">
            &copy; {year} Gigva Kenya Limited. All rights reserved. &mdash; SaaS Platform in Kenya
          </span>
          <div className="flex items-center gap-4 text-xs text-slate-700">
            <span>Kenya Data Protection Act 2019 compliant</span>
            <span>Data hosted in Nairobi &#x1F1F0;&#x1F1EA;</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
