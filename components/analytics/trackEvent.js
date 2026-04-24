'use client'

/**
   * trackEvent — utility function for GA4 event tracking.
   *
   * Usage:
   *   import { trackEvent } from '@/components/analytics/trackEvent'
   *   trackEvent('cta_click', { button_label: 'Start Free Trial', page: '/saas-platform-kenya' })
   *
   * Also exports TrackableLink — a client-side Link wrapper that fires a GA4
   * event before navigating. Replaces standard <Link> for key CTA buttons.
   */

import Link from 'next/link'

/**
   * Fire a GA4 custom event safely (guards against gtag not yet loaded).
   * @param {string} eventName - GA4 event name (snake_case)
   * @param {Object} params   - Additional event parameters
   */
export function trackEvent(eventName, params = {}) {
    if (typeof window === 'undefined') return
    if (typeof window.gtag !== 'function') return
    window.gtag('event', eventName, params)
}

/**
 * TrackableLink — drop-in replacement for next/link that fires a GA4 event on click.
 *
 * Props:
 *   href         {string}  - Destination URL
 *   eventName    {string}  - GA4 event name (default: 'cta_click')
 *   eventParams  {Object}  - Extra GA4 event params
 *   children     {node}    - Link content
 *   className    {string}  - Tailwind classes
 */
export function TrackableLink({
    href,
    eventName = 'cta_click',
    eventParams = {},
    children,
    className,
    ...rest
}) {
    const handleClick = () => {
          trackEvent(eventName, {
                  button_label: typeof children === 'string' ? children : eventName,
                  destination: href,
                  ...eventParams,
          })
    }

  return (
        <Link href={href} className={className} onClick={handleClick} {...rest}>
  {children}
  </Link>
    )
}
