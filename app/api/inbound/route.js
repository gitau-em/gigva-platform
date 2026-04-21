/**
 * app/api/inbound/route.js
 * Resend inbound email webhook — receives email.received events.
 * Configure in Resend dashboard: Webhooks > Add webhook > email.received
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'

const WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET || ''

function verifySignature(rawBody, headers) {
  if (!WEBHOOK_SECRET) return true
  try {
    const svixId        = headers.get('svix-id')        || ''
    const svixTimestamp = headers.get('svix-timestamp') || ''
    const svixSignature = headers.get('svix-signature') || ''

    if (!svixId || !svixTimestamp || !svixSignature) return false

    // Resend uses whsec_ prefix — strip it and base64-decode the key bytes
    const secretBytes = Buffer.from(
      WEBHOOK_SECRET.startsWith('whsec_')
        ? WEBHOOK_SECRET.slice(6)
        : WEBHOOK_SECRET,
      'base64'
    )

    const toSign   = svixId + '.' + svixTimestamp + '.' + rawBody
    const expected = crypto.createHmac('sha256', secretBytes).update(toSign).digest('base64')

    const svixSigs = svixSignature.split(' ')
    return svixSigs.some(sig => sig.startsWith('v1,') && sig.slice(3) === expected)
  } catch {
    return false
  }
}

export async function POST(req) {
  const rawBody = await req.text()

  if (!verifySignature(rawBody, req.headers)) {
    return NextResponse.json({ ok: false, msg: 'Forbidden.' }, { status: 403 })
  }

  let event
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ ok: false, msg: 'Invalid JSON.' }, { status: 400 })
  }

  if (event.type !== 'email.received') {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const data = event.data || {}

  // Log the data keys for debugging (helps identify actual field names Resend sends)
  console.log('[inbound] event.data keys:', Object.keys(data).join(', '))

  const fromRaw  = data.from    || ''
  const toRaw    = data.to      || []
  const subject  = data.subject || '(no subject)'

  // Try multiple possible field names for body content (Resend may use different keys)
  const bodyText = data.text    || data.body_text || data.plain_text || data.plain || data.body || ''
  const bodyHtml = data.html    || data.body_html || data.html_body  || ''

  const fromMatch = fromRaw.match(/^(.*?)\s*<(.+?)>$/)
  const fromName  = fromMatch ? fromMatch[1].trim() : ''
  const fromEmail = fromMatch ? fromMatch[2].trim() : fromRaw.trim()

  const toEmails = Array.isArray(toRaw) ? toRaw : String(toRaw).split(',').map(e => e.trim())

  const insert = db().prepare(`
    INSERT INTO inbox_messages (id, to_email, from_email, from_name, subject, body_text, body_html, is_read)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0)
  `)

  for (const toEntry of toEmails) {
    const m       = toEntry.match(/^(.*?)\s*<(.+?)>$/)
    const toEmail = ((m ? m[2] : toEntry) || '').trim().toLowerCase()
    if (!toEmail) continue
    const id = crypto.randomBytes(8).toString('hex')
    insert.run(id, toEmail, fromEmail, fromName, subject, bodyText, bodyHtml)
    console.log('[inbound] stored msg id=' + id + ' to=' + toEmail + ' body_text_len=' + bodyText.length + ' body_html_len=' + bodyHtml.length)
  }

  return NextResponse.json({ ok: true })
}
