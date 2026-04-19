'use client'

/**
 * components/chat/TawkChat.js
 *
 * Integrates Tawk.to live chat across the entire site.
 *
 * SETUP (one-time):
 *   1. Create a free account at https://www.tawk.to
 *   2. Add a new Property → name it "Gigva Kenya"
 *   3. Copy your Property ID and Widget ID from:
 *      Dashboard → Administration → Channels → Chat Widget → Direct Chat Link
 *      It looks like: https://tawk.to/chat/{PROPERTY_ID}/{WIDGET_ID}
 *   4. In your .env.local (and hosting environment variables) add:
 *        NEXT_PUBLIC_TAWK_PROPERTY_ID=your_property_id_here
 *        NEXT_PUBLIC_TAWK_WIDGET_ID=your_widget_id_here
 *   5. In Tawk.to dashboard configure:
 *      - Inbox email: samuel.otieno@gigva.co.ke
 *      - Offline email: samuel.otieno@gigva.co.ke
 *      - Widget color: #0ea5e9
 *      - Pre-chat form: name + email (required)
 *
 * USER IDENTIFICATION:
 *   When a visitor is logged in (JWT in localStorage), their name and email
 *   are passed to Tawk.to automatically so staff see who they're talking to.
 */

import { useEffect } from 'react'
import Script from 'next/script'

// Tawk.to property and widget IDs from environment variables.
// Fall back to placeholder values so the build doesn't break before they're set.
const TAWK_PROPERTY_ID = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID || 'YOUR_PROPERTY_ID'
const TAWK_WIDGET_ID   = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID   || 'default'

export default function TawkChat() {
  // Skip rendering if IDs aren't configured yet
  if (
    TAWK_PROPERTY_ID === 'YOUR_PROPERTY_ID' ||
    !TAWK_PROPERTY_ID ||
    !TAWK_WIDGET_ID
  ) {
    if (process.env.NODE_ENV === 'development') {
      console.info(
        '[TawkChat] Widget not loaded — set NEXT_PUBLIC_TAWK_PROPERTY_ID and ' +
        'NEXT_PUBLIC_TAWK_WIDGET_ID in .env.local'
      )
    }
    return null
  }

  return (
    <>
      {/**
       * Tawk.to asynchronous embed script.
       * strategy="afterInteractive" means Next.js loads it after hydration —
       * it never blocks the critical rendering path.
       */}
      <Script
        id="tawk-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            var Tawk_API = Tawk_API || {};
            var Tawk_LoadStart = new Date();

            // ── Branding & welcome messages ────────────────────────────────
            Tawk_API.onLoad = function() {
              // Set widget theme color to match Gigva sky-blue
              Tawk_API.setAttributes({
                'name':  Tawk_API.getVisitor ? Tawk_API.getVisitor('name')  : '',
                'email': Tawk_API.getVisitor ? Tawk_API.getVisitor('email') : ''
              }, function(error) {});

              // Attempt user identification from stored JWT (logged-in users)
              try {
                var token = localStorage.getItem('gigva_token');
                if (token) {
                  var parts   = token.split('.');
                  var payload = JSON.parse(atob(parts[1]));
                  // Only identify if token is not expired
                  if (payload && payload.exp * 1000 > Date.now()) {
                    Tawk_API.setAttributes({
                      'name':  payload.name  || '',
                      'email': payload.email || ''
                    }, function(error) {});
                  }
                }
              } catch (e) {
                // Silently ignore — visitor just won't be pre-identified
              }
            };

            // ── Load the Tawk.to script ────────────────────────────────────
            (function() {
              var s1 = document.createElement('script');
              var s0 = document.getElementsByTagName('script')[0];
              s1.async = true;
              s1.src   = 'https://embed.tawk.to/${TAWK_PROPERTY_ID}/${TAWK_WIDGET_ID}';
              s1.charset     = 'UTF-8';
              s1.setAttribute('crossorigin', '*');
              s0.parentNode.insertBefore(s1, s0);
            })();
          `,
        }}
      />
    </>
  )
}
