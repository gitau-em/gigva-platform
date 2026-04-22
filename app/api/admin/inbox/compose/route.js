/**
 * app/api/admin/inbox/compose/route.js
 * POST /api/admin/inbox/compose
 * Compose and send a new email via Resend with attachment support (max 25MB total).
 * Stores a record in sent_emails on success.
 */
import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/db'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const MAX_BYTES = 25 * 1024 * 1024  // 25 MB

export async function POST(req) {
  const auth  = req.headers.get('authorization') || ''
  const token = auth.replace('Bearer ', '').trim()
  const user  = verifyToken(token)
  if (!user) return NextResponse.json({ ok: false, msg: 'Unauthorized' }, { status: 401 })

  let to, cc, bcc, subject, bodyText, attachments = []
  let totalSize = 0
  const contentType = req.headers.get('content-type') || ''

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData()
    to       = formData.get('to')       || ''
    cc       = formData.get('cc')       || ''
    bcc      = formData.get('bcc')      || ''
    subject  = formData.get('subject')  || ''
    bodyText = formData.get('bodyText') || ''
    const files = formData.getAll('attachments')
    for (const file of files) {
      if (file && file.size > 0) {
        totalSize += file.size
        if (totalSize > MAX_BYTES) {
          return NextResponse.json({ ok: false, msg: 'Total attachments exceed 25 MB limit' }, { status: 400 })
        }
        const buffer = await file.arrayBuffer()
        attachments.push({ filename: file.name, content: Buffer.from(buffer) })
      }
    }
  } else {
    let body
    try { body = await req.json() } catch {
      return NextResponse.json({ ok: false, msg: 'Invalid body' }, { status: 400 })
    }
    to       = body.to       || ''
    cc       = body.cc       || ''
    bcc      = body.bcc      || ''
    subject  = body.subject  || ''
    bodyText = body.bodyText || ''
  }

  if (!to.trim())       return NextResponse.json({ ok: false, msg: 'Recipient (To) is required' }, { status: 400 })
  if (!subject.trim())  return NextResponse.json({ ok: false, msg: 'Subject is required' }, { status: 400 })
  if (!bodyText.trim()) return NextResponse.json({ ok: false, msg: 'Message body is required' }, { status: 400 })

  const toList  = to.split(',').map(s => s.trim()).filter(Boolean)
  const ccList  = cc  ? cc.split(',').map(s => s.trim()).filter(Boolean)  : undefined
  const bccList = bcc ? bcc.split(',').map(s => s.trim()).filter(Boolean) : undefined

  const fromEmail = user.email
  const escapedBody = bodyText.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  const htmlBody = `<div style="font-family:sans-serif;white-space:pre-wrap;">${escapedBody}</div>`

  let signatureHtml = ''
  try {
    const database = db()
    const sigRow = database.prepare("SELECT html FROM email_signatures WHERE id = 'universal' LIMIT 1").get()
    if (sigRow?.html) signatureHtml = `<br><br><hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0">${sigRow.html}`
  } catch {}

  const fullHtml = htmlBody + signatureHtml

  try {
    const payload = {
      from: fromEmail,
      to:   toList,
      subject,
      html: fullHtml,
      text: bodyText,
      ...(ccList  && ccList.length  ? { cc:  ccList  } : {}),
      ...(bccList && bccList.length ? { bcc: bccList } : {}),
      ...(attachments.length        ? { attachments }  : {}),
    }
    const result = await resend.emails.send(payload)
    const resendId = result?.data?.id || result?.id || ''

    try {
      const database = db()
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
      database.prepare(
        `INSERT INTO sent_emails (id, from_email, to_email, subject, body_text, body_html, resend_id, sent_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`
      ).run(id, fromEmail, toList.join(', '), subject, bodyText, fullHtml, resendId)
    } catch {}

    return NextResponse.json({ ok: true, resendId })
  } catch (err) {
    console.error('Compose send error:', err)
    return NextResponse.json({ ok: false, msg: err?.message || 'Failed to send' }, { status: 500 })
  }
}
