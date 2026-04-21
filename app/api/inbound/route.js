/**
 * app/api/inbound/route.js  —  Resend inbound email webhook
 *
 * NOTE: Resend's email.received webhook only sends metadata
 * (from, to, subject, email_id) — NOT the email body.
 * We try to fetch body via Resend API using email_id as fallback.
 */
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'

const WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET || ''
const RESEND_API_KEY = process.env.RESEND_API_KEY        || ''

function verifySvix(rawBody, headers) {
  if (!WEBHOOK_SECRET) return true
  try {
    const svixId  = headers.get('svix-id')        || ''
    const svixTs  = headers.get('svix-timestamp') || ''
    const svixSig = headers.get('svix-signature') || ''
    if (!svixId || !svixTs || !svixSig) return false
    const secret   = Buffer.from(WEBHOOK_SECRET.startsWith('whsec_') ? WEBHOOK_SECRET.slice(6) : WEBHOOK_SECRET, 'base64')
    const expected = crypto.createHmac('sha256', secret).update(svixId + '.' + svixTs + '.' + rawBody).digest('base64')
    return svixSig.split(' ').some(s => s.startsWith('v1,') && s.slice(3) === expected)
  } catch { return false }
}

export async function POST(req) {
  const rawBody = await req.text()
  const ct = (req.headers.get('content-type') || '').toLowerCase()

  // ── JSON path (Resend sends application/json with svix signature) ──
  if (ct.includes('application/json') || rawBody.trimStart().startsWith('{')) {
    if (WEBHOOK_SECRET && !verifySvix(rawBody, req.headers)) {
      return NextResponse.json({ ok: false, msg: 'Forbidden.' }, { status: 403 })
    }
    let event
    try { event = JSON.parse(rawBody) } catch {
      return NextResponse.json({ ok: false, msg: 'Bad JSON' }, { status: 400 })
    }
    if (event.type !== 'email.received') return NextResponse.json({ ok: true, skipped: true })

    const data = event.data || {}
    const fromRaw = data.from    || ''
    const toRaw   = data.to      || []
    const subject = data.subject || '(no subject)'
    const emailId = data.email_id || data.id || ''

    // Resend's inbound webhook does NOT include body text/html.
    // Try fetching via Resend API using email_id.
    let bodyText = ''
    let bodyHtml = ''

    if (emailId && RESEND_API_KEY) {
      try {
        const r = await fetch('https://api.resend.com/emails/' + emailId, {
          headers: { Authorization: 'Bearer ' + RESEND_API_KEY, 'Content-Type': 'application/json' }
        })
        if (r.ok) {
          const em = await r.json()
          bodyText = em.text || ''
          bodyHtml = em.html || ''
          console.log('[inbound] API fetch ok, text_len=' + bodyText.length + ' html_len=' + bodyHtml.length)
        } else {
          console.log('[inbound] API fetch failed status=' + r.status)
        }
      } catch (e) {
        console.log('[inbound] API fetch error:', e.message)
      }
    }

    return storeMessages(fromRaw, toRaw, subject, bodyText, bodyHtml)
  }

  // ── Form-data path (legacy / alternative inbound formats) ──
  try {
    const form = await new Request(req.url, { method: 'POST', headers: req.headers, body: rawBody }).formData()
    return storeMessages(
      String(form.get('from') || ''),
      String(form.get('to') || '').split(',').map(s => s.trim()),
      String(form.get('subject') || '(no subject)'),
      String(form.get('text') || form.get('plain') || ''),
      String(form.get('html') || '')
    )
  } catch {}

  return NextResponse.json({ ok: false, msg: 'Unknown format' }, { status: 400 })
}

function storeMessages(fromRaw, toRaw, subject, bodyText, bodyHtml) {
  const fm = fromRaw.match(/^(.*?)\s*<(.+?)>$/)
  const fromName  = fm ? fm[1].trim() : ''
  const fromEmail = fm ? fm[2].trim() : fromRaw.trim()
  const toEmails  = Array.isArray(toRaw) ? toRaw : String(toRaw).split(',').map(e => e.trim())
  const insert = db().prepare(
    `INSERT INTO inbox_messages (id, to_email, from_email, from_name, subject, body_text, body_html, is_read)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0)`
  )
  for (const toEntry of toEmails) {
    const m = toEntry.match(/^(.*?)\s*<(.+?)>$/)
    const toEmail = ((m ? m[2] : toEntry) || '').trim().toLowerCase()
    if (!toEmail) continue
    const id = crypto.randomBytes(8).toString('hex')
    insert.run(id, toEmail, fromEmail, fromName, subject, bodyText, bodyHtml)
    console.log('[inbound] stored id=' + id + ' to=' + toEmail + ' text_len=' + bodyText.length)
  }
  return NextResponse.json({ ok: true })
}
