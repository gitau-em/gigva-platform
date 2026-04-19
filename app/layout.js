import '../styles/globals.css'
import Navbar   from '@/components/layout/Navbar'
import Footer   from '@/components/layout/Footer'
import TawkChat from '@/components/chat/TawkChat'

export const metadata = {
  title: {
    default: 'Gigva â M-Pesa Reconciliation for Kenyan SMBs',
    template: '%s | Gigva Kenya',
  },
  description:
    'Gigva automatically reconciles M-Pesa transactions for Kenyan retail shops, logistics firms, and SMEs. Real-time dashboard, invoice matching, and financial reports â from KSh 2,999/month.',
  keywords: [
    'M-Pesa reconciliation Kenya',
    'M-Pesa dashboard for business',
    'Kenya SMB accounting software',
    'Daraja API dashboard',
    'M-Pesa invoice matching',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    siteName: 'Gigva Kenya',
    title: 'Gigva â M-Pesa Reconciliation for Kenyan SMBs',
    description:
      'Reconcile M-Pesa transactions automatically. Real-time dashboard for Kenyan retail shops, logistics firms, and SMEs.',
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://gigvakenya.co.ke'),
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en-KE">
      <head />
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-700">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-sky-500 text-white px-4 py-2 rounded-lg text-sm font-semibold z-[100]">
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content" className="flex-1 pt-16">
          {children}
        </main>
        <Footer />
        {/* Tawk.to live chat â loads async after page render */}
        <TawkChat />
      </body>
    </html>
  )
}
