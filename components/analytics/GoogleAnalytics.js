'use client'

/**
   * GoogleAnalytics — client component for SPA page view tracking.
   *
   * Fires a GA4 page_view event on every Next.js App Router navigation.
   * Loaded once in app/layout.js so it runs on ALL pages.
   *
   * Why this pattern:
   * - The global gtag script in layout.js fires once on hard load.
   * - This component listens to usePathname changes (client-side navigation)
   *   and sends a page_view event for each route transition.
   * - Together they give complete coverage: hard loads + SPA navigations.
   */

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function GoogleAnalytics({ gaId }) {
    const pathname = usePathname()

  useEffect(() => {
        if (typeof window === 'undefined') return
        if (!window.gtag) return
        if (!gaId) return

                // Fire page_view on every client-side route change
                window.gtag('event', 'page_view', {
                        page_path: pathname,
                        page_location: window.location.href,
                        page_title: document.title,
                })
  }, [pathname, gaId])

  // This component renders nothing — purely a tracking side-effect
  return null
}
