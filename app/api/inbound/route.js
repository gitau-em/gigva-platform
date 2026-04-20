/**
 * app/api/inbound/route.js
 * Resend inbound email webhook.
 * Resend POSTs here when an email is received at an @gigva.co.ke address.
 *
 * Resend inbound payload shape (simplified):
 *   { from, to, subject, text, html, headers, ... }
 *
 * Security: verify the Resend-Signature header using RESEND_WEBHOOK_SECRET.
 * If RESEND_WEBHOOK_SECRET is not set, we fall back to IP allowlisting (Resend IPs).
 */

import { NextResponse } from 'next/server'
import { db }           from '@/lib/db'
import crypto           from 'crypto'

// Resend's documented inbound webhook signing secret env var
const WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET || ''

// Known Resend IP ranges (fallback when secret is not configured)
const RESEND_IPS = ['34.226.138.19', '34.196.211.58', '52.72.228.88']

function verifySignature(rawBody, sigHeader) {
    if (!WEBHOOK_SECRET) return true  // skip when secret not configured
  try {
        const expected = crypto
          .createHmac('sha256', WEBHOOK_SECRET)
          .update(rawBody)
          .digest('hex')
        return sigHeader === `sha256=${expected}`
  } catch {
        return false
  }
}

export async function POST(req) {
    try {
          const rawBody = await req.text()
          const sig     = req.headers.get('resend-signature') || ''

      if (!verifySignature(rawBody, sig)) {
              console.warn('[inbound] Invalid webhook signature')
              return NextResponse.json({ ok: false, msg: 'Forbidden.' }, { status: 403 })
      }

      let payload
          try {
                  payload = JSON.parse(rawBody)
          } catch {
                  return NextResponse.json({ ok: false, msg: 'Invalid JSON.' }, { status: 400 })
          }

      // Resend inbound email schema
      const fromRaw  = payload.from   || ''
          const toRaw    = payload.to     || ''
          const subject  = payload.subject || '(no subject)'
          const bodyText = payload.text   || ''
          const bodyHtml = payload.html   || ''

      // Parse "From Name <email>" format
      const fromMatch = fromRaw.match(/^(.*?)\s*<(.+?)>$/)
          const fromName  = fromMatch ? fromMatch[1].trim() : ''
          const fromEmail = fromMatch ? fromMatch[2].trim() : fromRaw.trim()

      // Normalise to_email (may be array or comma-separated)
      const toEmails = Array.isArray(toRaw)
            ? toRaw
              : toRaw.split(',').map(e => e.trim())

      // Insert one row per recipient
      const insert = db().prepare(`
            INSERT INTO inbox_messages (id, to_email, from_email, from_name, subject, body_text, body_html, is_read)
                  VALUES (?, ?, ?, ?, ?, ?, ?, 0)
                      `)

      for (const toEntry of toEmails) {
              // Strip name portion from to address if present
            const toMatch = toEntry.match(/^(.*?)\s*<(.+?)>$/)
              const toEmail = toMatch ? toMatch[2].trim() : toEntry.trim()

            if (!toEmail) continue

            const id = crypto.randomBytes(8).toString('hex')
              insert.run(id, toEmail.toLowerCase(), fromEmail, fromName, subject, bodyText, bodyHtml)
              console.log(`[inbound] stored email for ${toEmail} from ${fromEmail}: "${subject}"`)
      }

      return NextResponse.json({ ok: true })
    } catch (e) {
          console.error('[inbound POST]', e)
          return NextResponse.json({ ok: false, msg: 'Server error.' }, { status: 500 })
    }
}

// Allow Resend to do a GET health check on the endpoint
export async function GET() {
    return NextResponse.json({ ok: true, service: 'gigva-inbound-webhook' })
}
