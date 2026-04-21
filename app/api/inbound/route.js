/**
 * app/api/inbound/route.js  —  Resend inbound email webhook
 * Debug version: stores raw payload in body_text if body extraction fails.
 */
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'

const WEBHOOK_SECRET  = process.env.RESEND_WEBHOOK_SECRET || ''
const RESEND_API_KEY  = process.env.RESEND_API_KEY || ''

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

function parseMime(raw) {
  if (!raw || typeof raw !== 'string') return { text: '', html: '' }
  let text = '', html = ''
  function hdrs(block) {
    const h = {}; let cur = ''
    for (const line of block.split('\n')) {
      if (/^[ \t]/.test(line)) { cur += ' ' + line.trim() }
      else { if (cur) { const c = cur.indexOf(':'); if (c > -1) h[cur.slice(0,c).toLowerCase().trim()] = cur.slice(c+1).trim() } cur = line }
    }
    if (cur) { const c = cur.indexOf(':'); if (c > -1) h[cur.slice(0,c).toLowerCase().trim()] = cur.slice(c+1).trim() }
    return h
  }
  function dec(h, body) {
    const enc = (h['content-transfer-encoding'] || '').toLowerCase().trim()
    if (enc === 'quoted-printable') return body.replace(/=\r?\n/g,'').replace(/=([0-9A-Fa-f]{2})/g, (_,x) => String.fromCharCode(parseInt(x,16)))
    if (enc === 'base64') { try { return Buffer.from(body.replace(/\s+/g,''),'base64').toString('utf8') } catch {} }
    return body
  }
  function walk(msg) {
    const sep = msg.indexOf('\n\n'); if (sep === -1) return
    const h = hdrs(msg.slice(0, sep)); const body = msg.slice(sep + 2)
    const ct = (h['content-type'] || 'text/plain').toLowerCase()
    const bm = ct.match(/boundary=["']?([^"';\s]+)["']?/i)
    if (bm) { const esc = bm[1].replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); body.split(new RegExp('--' + esc + '(?:--)?')).forEach(p => { const t = p.trim(); if (t && t !== '--') walk(t) }) }
    else if (ct.includes('text/html')) { const d = dec(h,body); if (!html && d.trim()) html = d.trim() }
    else { const d = dec(h,body); if (!text && d.trim()) text = d.trim() }
  }
  walk(raw)
  return { text, html }
}

export async function POST(req) {
  const rawBody = await req.text()
  const ct = (req.headers.get('content-type') || '').toLowerCase()

  if (ct.includes('application/json') || rawBody.trimStart().startsWith('{')) {
    if (WEBHOOK_SECRET && !verifySvix(rawBody, req.headers)) {
      console.log('[inbound] sig fail')
      return NextResponse.json({ ok: false, msg: 'Forbidden.' }, { status: 403 })
    }
    let event
    try { event = JSON.parse(rawBody) } catch { return NextResponse.json({ ok: false, msg: 'Bad JSON' }, { status: 400 }) }
    if (event.type !== 'email.received') return NextResponse.json({ ok: true, skipped: true })

    const data = event.data || {}
    // LOG EVERYTHING to help debug
    console.log('[inbound] data:', JSON.stringify(data).substring(0, 500))

    const fromRaw = data.from || ''
    const toRaw   = data.to   || []
    const subject = data.subject || '(no subject)'

    let bodyText = data.text || data.body_text || data.plain_text || data.plain || ''
    let bodyHtml = data.html || data.body_html || data.html_body  || ''

    if (!bodyText && !bodyHtml && data.payload) {
      const parsed = parseMime(data.payload)
      bodyText = parsed.text; bodyHtml = parsed.html
    }

    // Fallback: fetch via Resend API
    const emailId = data.email_id || data.id || ''
    if (!bodyText && !bodyHtml && emailId && RESEND_API_KEY) {
      try {
        const r = await fetch('https://api.resend.com/emails/' + emailId, { headers: { Authorization: 'Bearer ' + RESEND_API_KEY } })
        if (r.ok) { const em = await r.json(); bodyText = em.text || ''; bodyHtml = em.html || '' }
      } catch {}
    }

    // DEBUG FALLBACK: if still empty, store the raw JSON data so staff can see what arrived
    if (!bodyText && !bodyHtml) {
      bodyText = '[DEBUG - Raw Resend data]: ' + JSON.stringify(data)
    }

    return storeMessages(fromRaw, toRaw, subject, bodyText, bodyHtml)
  }

  // Form-data
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
    console.log('[inbound] stored id=' + id + ' text_len=' + bodyText.length)
  }
  return NextResponse.json({ ok: true })
}
