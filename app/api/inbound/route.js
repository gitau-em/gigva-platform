/**
 * app/api/inbound/route.js
 * Resend inbound email handler.
 * Supports both JSON webhook (event.data.payload) and form-data formats.
 */
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'

const WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET || ''

function verifySvix(rawBody, headers) {
  if (!WEBHOOK_SECRET) return true
  try {
    const svixId = headers.get('svix-id') || ''
    const svixTs = headers.get('svix-timestamp') || ''
    const svixSig = headers.get('svix-signature') || ''
    if (!svixId || !svixTs || !svixSig) return false
    const secret = Buffer.from(WEBHOOK_SECRET.startsWith('whsec_') ? WEBHOOK_SECRET.slice(6) : WEBHOOK_SECRET, 'base64')
    const expected = crypto.createHmac('sha256', secret).update(svixId + '.' + svixTs + '.' + rawBody).digest('base64')
    return svixSig.split(' ').some(s => s.startsWith('v1,') && s.slice(3) === expected)
  } catch { return false }
}

// Parse a raw RFC 2822 MIME email to extract text and html parts
function parseMime(raw) {
  let text = '', html = ''

  function decode(headers, body) {
    const enc = (headers['content-transfer-encoding'] || '').toLowerCase().trim()
    if (enc === 'quoted-printable') {
      return body.replace(/=\r?\n/g, '').replace(/=([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h,16)))
    }
    if (enc === 'base64') {
      try { return Buffer.from(body.replace(/\s+/g,''), 'base64').toString('utf8') } catch {}
    }
    return body
  }

  function parseHeaders(block) {
    const h = {}
    let cur = ''
    for (const line of block.split('\n')) {
      if (/^[ \t]/.test(line)) { cur += ' ' + line.trim() }
      else { if (cur) { const c = cur.indexOf(':'); if (c > -1) h[cur.slice(0,c).toLowerCase().trim()] = cur.slice(c+1).trim() } cur = line }
    }
    if (cur) { const c = cur.indexOf(':'); if (c > -1) h[cur.slice(0,c).toLowerCase().trim()] = cur.slice(c+1).trim() }
    return h
  }

  function walk(msg) {
    const sep = msg.indexOf('\n\n')
    if (sep === -1) return
    const hdr = parseHeaders(msg.slice(0, sep))
    const body = msg.slice(sep + 2)
    const ct = (hdr['content-type'] || 'text/plain').toLowerCase()
    const bm = ct.match(/boundary=["']?([^"';\s]+)["']?/i)
    if (bm) {
      const esc = bm[1].replace(/[.*+?^${}()|[\]\\]/g,'\\$&')
      body.split(new RegExp('--' + esc + '(?:--)?')).forEach(p => { const t = p.trim(); if (t && t !== '--') walk(t) })
    } else if (ct.includes('text/html')) {
      const d = decode(hdr, body); if (!html && d.trim()) html = d.trim()
    } else {
      const d = decode(hdr, body); if (!text && d.trim()) text = d.trim()
    }
  }

  walk(raw)
  return { text, html }
}

export async function POST(req) {
  const rawBody = await req.text()
  const ct = req.headers.get('content-type') || ''

  // Try JSON path first
  if (ct.includes('application/json') || rawBody.trimStart().startsWith('{')) {
    if (WEBHOOK_SECRET && !verifySvix(rawBody, req.headers)) {
      return NextResponse.json({ ok: false, msg: 'Forbidden.' }, { status: 403 })
    }
    let event
    try { event = JSON.parse(rawBody) } catch { return NextResponse.json({ ok: false, msg: 'Bad JSON' }, { status: 400 }) }

    if (event.type !== 'email.received') return NextResponse.json({ ok: true, skipped: true })

    const data = event.data || {}
    console.log('[inbound/json] keys:', Object.keys(data).join(', '))

    const fromRaw = data.from || ''
    const toRaw   = data.to   || []
    const subject = data.subject || '(no subject)'
    let bodyText  = data.text || data.body_text || data.plain_text || data.plain || ''
    let bodyHtml  = data.html || data.body_html || data.html_body  || ''

    // Parse from raw RFC 2822 payload if body fields are empty
    if (!bodyText && !bodyHtml && data.payload) {
      console.log('[inbound/json] parsing data.payload len=' + data.payload.length)
      const parsed = parseMime(data.payload)
      bodyText = parsed.text
      bodyHtml = parsed.html
    }

    console.log('[inbound/json] text_len=' + bodyText.length + ' html_len=' + bodyHtml.length)
    return storeMessages(fromRaw, toRaw, subject, bodyText, bodyHtml)
  }

  // Form-data path (legacy Resend inbound format or SendGrid-style)
  try {
    const form = await req.clone().formData().catch(() => null)
    if (form) {
      const fromRaw = form.get('from') || ''
      const toRaw   = form.get('to')   || ''
      const subject = form.get('subject') || '(no subject)'
      const bodyText = form.get('text') || form.get('plain') || ''
      const bodyHtml = form.get('html')  || ''
      console.log('[inbound/form] from=' + fromRaw + ' text_len=' + String(bodyText).length)
      return storeMessages(fromRaw, toRaw.split(','), subject, String(bodyText), String(bodyHtml))
    }
  } catch (e) { console.log('[inbound/form] error:', e.message) }

  console.log('[inbound] unrecognised format, ct=' + ct)
  return NextResponse.json({ ok: false, msg: 'Unrecognised format' }, { status: 400 })
}

function storeMessages(fromRaw, toRaw, subject, bodyText, bodyHtml) {
  const fromMatch = fromRaw.match(/^(.*?)\s*<(.+?)>$/)
  const fromName  = fromMatch ? fromMatch[1].trim() : ''
  const fromEmail = fromMatch ? fromMatch[2].trim() : fromRaw.trim()
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
