/**
 * components/CompanyLogo.js
 * Centralized Gigva Kenya branding component.
 *
 * Single source of truth for the Gigva logo across:
 * - Payslips (variant="document")
 * - Reference letters (variant="document")
 * - Email footers (variant="email")
 * - Compact usage (variant="compact")
 *
 * LOGO_WIDTH = 140px (standard) | range: 120-160px
 * Source: /public/assets/gigva-logo.svg (primary)
 * Fallback: /gigva-logo.png (high-res PNG)
 */
'use client'

import Image from 'next/image'
import { useState } from 'react'

// === GLOBAL BRAND CONSTANTS ===
export const LOGO_WIDTH = 140       // Standard logo width (px) — range: 120–160px
export const LOGO_ASPECT = 80 / 304 // Native SVG aspect ratio (h/w)
export const LOGO_SRC_SVG = '/assets/gigva-logo.svg'
export const LOGO_SRC_PNG = '/gigva-logo.png'

// Variant config: width (px) and any extra style overrides
const VARIANTS = {
  default:  { width: LOGO_WIDTH,  label: 'default'  },
  document: { width: LOGO_WIDTH,  label: 'document' }, // payslips, reference letters
  email:    { width: 110,         label: 'email'    }, // email footer — 100-120px range
  compact:  { width: 100,         label: 'compact'  }, // inline / small contexts
}

/**
 * CompanyLogo
 *
 * @param {string}  variant   - "default" | "document" | "email" | "compact"
 * @param {number}  [width]   - Override width (px). Aspect ratio preserved automatically.
 * @param {string}  [className] - Additional CSS classes
 * @param {object}  [style]   - Inline style overrides
 * @param {string}  [alt]     - Alt text (defaults to "Gigva Kenya")
 */
export default function CompanyLogo({
  variant = 'default',
  width,
  className = '',
  style = {},
  alt = 'Gigva Kenya',
}) {
  const [usePng, setUsePng] = useState(false)
  const cfg = VARIANTS[variant] || VARIANTS.default
  const finalWidth  = width || cfg.width
  const finalHeight = Math.round(finalWidth * LOGO_ASPECT)

  const imgStyle = {
    width:     finalWidth  + 'px',
    height:    'auto',
    maxWidth:  '100%',
    objectFit: 'contain',
    display:   'block',
    ...style,
  }

  return (
    <img
      src={usePng ? LOGO_SRC_PNG : LOGO_SRC_SVG}
      alt={alt}
      width={finalWidth}
      height={finalHeight}
      style={imgStyle}
      className={'gigva-logo gigva-logo--' + cfg.label + (className ? ' ' + className : '')}
      onError={() => {
        if (!usePng) setUsePng(true) // fallback: SVG failed -> try PNG
      }}
      data-variant={variant}
    />
  )
}

/**
 * logoHtmlEmail
 * Returns an HTML string for use in email bodies (not JSX).
 * Inline styles only — compatible with Gmail and Outlook.
 *
 * @param {'email'|'compact'} variant
 * @returns {string} HTML <img> tag
 */
export function logoHtmlEmail(variant = 'email') {
  const cfg = VARIANTS[variant] || VARIANTS.email
  const w = cfg.width
  const h = Math.round(w * LOGO_ASPECT)
  // Use absolute URL for email clients
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gigva.co.ke'
  const src = baseUrl + LOGO_SRC_PNG // PNG for max email client compatibility
  return (
    '<img' +
    ' src="' + src + '"' +
    ' alt="Gigva Kenya"' +
    ' width="' + w + '"' +
    ' height="' + h + '"' +
    ' style="display:block;border:0;outline:none;text-decoration:none;width:' + w + 'px;height:auto;max-width:100%;"' +
    ' />'
  )
}

/**
 * emailFooterHtml
 * Returns a complete HTML email footer block with logo, name, website, and contact.
 * Uses compact logo variant, inline styles for email client compatibility.
 *
 * @returns {string} HTML string
 */
export function emailFooterHtml() {
  const logoImg = logoHtmlEmail('compact')
  return (
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px;border-top:2px solid #0ea5e9;padding-top:20px;">' +
    '<tr>' +
    '<td style="padding:0;">' +
    logoImg +
    '<p style="margin:8px 0 2px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#0ea5e9;letter-spacing:1px;">GIGVA KENYA</p>' +
    '<p style="margin:0 0 2px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#64748b;">' +
    '<a href="https://gigva.co.ke" style="color:#0ea5e9;text-decoration:none;">www.gigva.co.ke</a>' +
    '</p>' +
    '<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#64748b;">' +
    '<a href="mailto:hello@gigva.co.ke" style="color:#64748b;text-decoration:none;">hello@gigva.co.ke</a>' +
    '</p>' +
    '</td>' +
    '</tr>' +
    '</table>'
  )
}
