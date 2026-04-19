/**
 * lib/email.js
 * Nodemailer transport — supports Google Workspace SMTP and Zoho Mail SMTP.
 *
 * Configuration (set in .env.local):
 *
 *   Google Workspace:
 *     SMTP_HOST=smtp.gmail.com
 *     SMTP_PORT=587
 *     SMTP_SECURE=false
 *     SMTP_USER=noreply@gigva.co.ke         ← the sending address
 *     SMTP_PASS=<16-char app password>       ← from Google Account → Security → App passwords
 *     SMTP_FROM="Gigva Kenya <noreply@gigva.co.ke>"
 *
 *   Zoho Mail:
 *     SMTP_HOST=smtp.zoho.com
 *     SMTP_PORT=587
 *     SMTP_SECURE=false
 *     SMTP_USER=noreply@gigva.co.ke
 *     SMTP_PASS=<app-specific password from Zoho Mail settings>
 *     SMTP_FROM="Gigva Kenya <noreply@gigva.co.ke>"
 *
 * Server-only — never imported on the client side.
 */

import nodemailer from 'nodemailer'

// ── Lazy transporter ─────────────────────────────────────────────────────────
let _transporter = null

function getTransporter() {
  if (_transporter) return _transporter

  const host   = process.env.SMTP_HOST
  const port   = parseInt(process.env.SMTP_PORT || '587', 10)
  const secure = process.env.SMTP_SECURE === 'true'   // true only for port 465
  const user   = process.env.SMTP_USER
  const pass   = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    console.warn('[email] SMTP not configured — check SMTP_HOST / SMTP_USER / SMTP_PASS in .env.local')
    return null
  }

  _transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    // Keep connection pool alive between requests
    pool: true,
    maxConnections: 3,
    rateDelta: 1000,
    rateLimit: 5,
    tls: {
      // Reject unauthorised certificates in production
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  })

  return _transporter
}

// ── Core send function ────────────────────────────────────────────────────────
/**
 * Send a single email.
 *
 * @param {Object} opts
 * @param {string|string[]} opts.to        - Recipient(s)
 * @param {string}          opts.subject   - Email subject
 * @param {string}          opts.html      - HTML body
 * @param {string}          [opts.replyTo] - Reply-to address
 * @param {string}          [opts.text]    - Plain-text fallback (auto-generated if omitted)
 *
 * @returns {Promise<{ok:boolean, messageId?:string, reason?:string}>}
 */
export async function sendEmail({ to, subject, html, replyTo, text }) {
  const transport = getTransporter()

  if (!transport) {
    // Graceful degradation — log but don't crash the request
    console.warn('[email] skipping send (SMTP not configured):', subject)
    return { ok: false, reason: 'smtp_not_configured' }
  }

  const from = process.env.SMTP_FROM
    || `"Gigva Kenya" <${process.env.SMTP_USER}>`

  const recipients = Array.isArray(to) ? to.join(', ') : to

  try {
    const info = await transport.sendMail({
      from,
      to: recipients,
      replyTo,
      subject,
      html,
      text: text || htmlToPlainText(html),
    })

    console.log('[email] sent:', info.messageId, '→', recipients)
    return { ok: true, messageId: info.messageId }
  } catch (err) {
    console.error('[email] send failed:', err.message, '→', recipients)
    return { ok: false, reason: err.message }
  }
}

/**
 * Send the same email to multiple recipients individually (BCC-style privacy).
 * Each recipient gets a separate email addressed only to them.
 */
export async function sendEmailToMany(addresses, { subject, html, replyTo }) {
  const results = await Promise.allSettled(
    addresses.map(addr => sendEmail({ to: addr, subject, html, replyTo }))
  )
  const failed = results.filter(r => r.status === 'rejected' || !r.value?.ok)
  if (failed.length) {
    console.warn('[email] some sends failed:', failed.length, '/', addresses.length)
  }
  return { sent: addresses.length - failed.length, failed: failed.length }
}

// ── Verify SMTP connection (use for health checks) ────────────────────────────
export async function verifySMTP() {
  const transport = getTransporter()
  if (!transport) return { ok: false, reason: 'smtp_not_configured' }
  try {
    await transport.verify()
    return { ok: true }
  } catch (err) {
    return { ok: false, reason: err.message }
  }
}

// ── Minimal HTML → plain text strip ─────────────────────────────────────────
function htmlToPlainText(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
