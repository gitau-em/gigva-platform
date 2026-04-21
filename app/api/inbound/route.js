/**
 * app/api/inbound/route.js  —  Resend inbound email webhook
 * Stores raw event data and fetches body via Resend API if needed.
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

// Minimal RFC-2822 MIME parser to extract text/plain and text/html parts
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

  // ── JSON webhook path (Resend sends application/json with svix signature) ──
  if (ct.includes('application/json') || rawBody.trimStart().startsWith('{')) {
    if (WEBHOOK_SECRET && !verifySvix(rawBody, req.headers)) {
      console.log('[inbound] signature check failed')
      return NextResponse.json({ ok: false, msg: 'Forbidden.' }, { status: 403 })
    }
    let event
    try { event = JSON.parse(rawBody) } catch {
      return NextResponse.json({ ok: false, msg: 'Bad JSON' }, { status: 400 })
    }

    console.log('[inbound] type=' + event.type)
    if (event.type !== 'email.received') return NextResponse.json({ ok: true, skipped: true })

    const data = event.data || {}
    console.log('[inbound] data_keys=' + Object.keys(data).join(',')
      + ' text_len=' + (data.text||'').length
      + ' html_len=' + (data.html||'').length
      + ' payload_len=' + (data.payload||'').length
      + ' email_id=' + (data.email_id||data.id||''))

    const fromRaw = data.from || ''
    const toRaw   = data.to   || []
    const subject = data.subject || '(no subject)'

    // Step 1: direct fields
    let bodyText = data.text || data.body_text || data.plain_text || data.plain || ''
    let bodyHtml = data.html || data.body_html || data.html_body  || ''

    // Step 2: parse RFC-2822 from data.payload
    if (!bodyText && !bodyHtml && data.payload) {
      const parsed = parseMime(data.payload)
      bodyText = parsed.text; bodyHtml = parsed.html
      console.log('[inbound] parsed payload: text_len=' + bodyText.length + ' html_len=' + bodyHtml.length)
    }

    // Step 3: fetch from Resend API using email_id
    const emailId = data.email_id || data.id || ''
    if (!bodyText && !bodyHtml && emailId && RESEND_API_KEY) {
      try {
        const r = await fetch('https://api.resend.com/emails/' + emailId, {
          headers: { Authorization: 'Bearer ' + RESEND_API_KEY }
        })
        if (r.ok) {
          const em = await r.json()
          bodyText = em.text || ''
          bodyHtml = em.html || ''
          console.log('[inbound] fetched from API: text_len=' + bodyText.length + ' html_len=' + bodyHtml.length)
        }
      } catch (e) { console.log('[inbound] API fetch error:', e.message) }
    }

    console.log('[inbound] final: text_len=' + bodyText.length + ' html_len=' + bodyHtml.length)
    return storeMessages(fromRaw, toRaw, subject, bodyText, bodyHtml)
  }

  // ── Form-data path ──
  try {
    const form = await new Request(req.url, { method: 'POST', headers: req.headers, body: rawBody }).formData()
    const fromRaw  = String(form.get('from') || '')
    const toRaw    = String(form.get('to')   || '').split(',').map(s => s.trim())
    const subject  = String(form.get('subject') || '(no subject)')
    const bodyText = String(form.get('text') || form.get('plain') || '')
    const bodyHtml = String(form.get('html')  || '')
    console.log('[inbound/form] from=' + fromRaw + ' text_len=' + bodyText.length)
    return storeMessages(fromRaw, toRaw, subject, bodyText, bodyHtml)
  } catch (e) { console.log('[inbound/form] error:', e.message) }

  console.log('[inbound] unknown format, ct=' + ct)
  return NextResponse.json({ ok: false, msg: 'Unknown format' }, { status: 400 })
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
