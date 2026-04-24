import '../styles/globals.css'
import Navbar   from '@/components/layout/Navbar'
import Footer   from '@/components/layout/Footer'
import TawkChat from '@/components/chat/TawkChat'
import Script from 'next/script'

export const metadata = {
  title: {
    default: 'Gigva | Leading SaaS Platform in Kenya for Business Automation',
    template: '%s | Gigva Kenya',
  },
  description:
    'Gigva is a leading SaaS platform in Kenya offering AI-powered analytics, M-Pesa reconciliation, payroll, payments, and marketplace solutions for businesses in Nairobi and across Kenya.',
  keywords: [
    'SaaS platform Kenya',
    'business software Kenya',
    'software companies in Kenya',
    'tech platforms Nairobi',
    'AI software Kenya',
    'Nairobi software solutions',
    'M-Pesa reconciliation Kenya',
    'business automation Kenya',
    'cloud software Kenya',
    'SME software Nairobi',
    'Kenya SaaS company',
    'East Africa business software',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    siteName: 'Gigva',
    url: 'https://gigva.co.ke',
    title: 'Gigva | Leading SaaS Platform in Kenya for Business Automation',
    description:
      'Gigva is Kenya\'s leading SaaS platform. AI-powered analytics, M-Pesa reconciliation, payroll, and marketplace solutions for Nairobi businesses and SMEs across Kenya.',
    images: [
      {
        url: 'https://gigva.co.ke/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Gigva — Kenya SaaS Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gigva | Leading SaaS Platform in Kenya',
    description:
      'AI-powered SaaS for Kenyan businesses: M-Pesa reconciliation, payroll, analytics, marketplace. Serving businesses across Kenya and East Africa.',
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://gigva.co.ke'),
  alternates: { canonical: 'https://gigva.co.ke' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  verification: {
    google: 'Bh5VO_YqheUXH9N-htKFE7Y1EiumRbp5Bjo9ivUMq3o',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Gigva',
  url: 'https://gigva.co.ke',
  logo: 'https://gigva.co.ke/logo.png',
  description: 'Leading SaaS platform in Kenya for business automation, M-Pesa reconciliation, payroll, and AI-powered analytics.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Westlands Business Park',
    addressLocality: 'Nairobi',
    addressRegion: 'Nairobi County',
    postalCode: '00100',
    addressCountry: 'KE',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+254-701-443-444',
    contactType: 'customer service',
    email: 'hello@gigva.co.ke',
    areaServed: 'KE',
    availableLanguage: ['English', 'Swahili'],
  },
  sameAs: [
    'https://www.linkedin.com/in/gigva-kenya-7b19b1402',
  ],
  foundingLocation: {
    '@type': 'Place',
    name: 'Nairobi, Kenya',
  },
  areaServed: ['Kenya', 'East Africa'],
}

export default function RootLayout({ children }) {
  return (
    <html lang="en-KE">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-700">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-sky-500 text-white px-4 py-2 rounded-lg text-sm font-semibold z-[100]">
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content" className="flex-1 pt-16">
          {children}
        </main>
        <Footer />
        {/* Tawk.to live chat — loads async after page render */}
        <TawkChat />
        {/* Google Analytics 4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-LHE5L3HBKJ"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-LHE5L3HBKJ', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
      </body>
    </html>
  )
}
