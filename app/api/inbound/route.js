/**
 * app/api/inbound/route.js  – inbound email webhook
 *
 * Primary: Mailgun inbound routing (multipart/form-data)
 *   Fields: from, recipient, to, subject, body-plain, body-html,
 *           stripped-text, stripped-html, Message-Id
 * Fallback: Resend email.received JSON (metadata only, no body)
 */
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function POST(req) {
  try {
    const contentType = req.headers.get('content-type') || ''

    // ── Mailgun path: multipart/form-data ──────────────────────────
    if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
      const form = await req.formData()

      const fromRaw   = String(form.get('from')          || form.get('From')          || '')
      const toRaw     = String(form.get('recipient')     || form.get('to')            || form.get('To') || '')
      const subject   = String(form.get('subject')       || form.get('Subject')       || '(no subject)')
      const bodyText  = String(form.get('body-plain')    || form.get('stripped-text') || form.get('text') || '')
      const bodyHtml  = String(form.get('body-html')     || form.get('stripped-html') || form.get('html') || '')
      const messageId = String(form.get('Message-Id')    || form.get('message-id')    || form.get('Message-ID') || '')

      console.log('[inbound/mailgun] from=' + fromRaw + ' to=' + toRaw + ' subj=' + subject + ' body_len=' + bodyText.length)
      return storeMessages(fromRaw, toRaw, subject, bodyText, bodyHtml, messageId)
    }

    // ── JSON path (Resend or other JSON webhook) ───────────────────
    const rawBody = await req.text()
    let parsed
    try { parsed = JSON.parse(rawBody) } catch { parsed = null }

    if (parsed) {
      const data      = parsed.data || parsed
      const fromRaw   = String(data.from       || '')
      const toRaw     = String(Array.isArray(data.to) ? data.to.join(',') : (data.to || ''))
      const subject   = String(data.subject    || '(no subject)')
      const bodyText  = String(data.text       || data['body-plain'] || data.plain || '')
      const bodyHtml  = String(data.html       || data['body-html']  || '')
      const messageId = String(data.message_id || data.email_id      || '')

      console.log('[inbound/json] from=' + fromRaw + ' to=' + toRaw + ' subj=' + subject + ' body_len=' + bodyText.length)
      return storeMessages(fromRaw, toRaw, subject, bodyText, bodyHtml, messageId)
    }

    return NextResponse.json({ ok: false, msg: 'Unknown format' }, { status: 400 })
  } catch (err) {
    console.error('[inbound] Error:', err)
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

function storeMessages(fromRaw, toRaw, subject, bodyText, bodyHtml, messageId) {
  const fm        = fromRaw.match(/^(.*?)\s*<(.+?)>$/)
  const fromName  = fm ? fm[1].trim() : ''
  const fromEmail = fm ? fm[2].trim() : fromRaw.trim()

  const toEmails  = (Array.isArray(toRaw) ? toRaw : String(toRaw).split(',')).map(e => e.trim()).filter(Boolean)

  const database  = db()
  const insert    = database.prepare(
    `INSERT INTO inbox_messages
       (id, to_email, from_email, from_name, subject, body_text, body_html, message_id, is_read)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`
  )

  const baseId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  let stored = 0

  for (const toEmail of toEmails) {
    try {
      const uid = baseId + '_' + toEmail.replace(/[^a-z0-9]/gi, '').slice(0, 12)
      insert.run(uid, toEmail, fromEmail, fromName, subject, bodyText, bodyHtml, messageId)
      stored++
    } catch (e) {
      console.error('[inbound] insert error for', toEmail, e.message)
    }
  }

  return NextResponse.json({ ok: true, stored })
}

// Health check
export async function GET() {
  return NextResponse.json({ ok: true, service: 'inbound-mailgun' })
}
