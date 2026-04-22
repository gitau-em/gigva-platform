/**
 * app/api/admin/inbox/reply/route.js
 * POST /api/admin/inbox/reply
 * Send a reply email to an inbox message sender via Resend.
 * Supports multipart/form-data for file attachments.
 */
import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/db'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req) {
  const auth = req.headers.get('authorization') || ''
  const token = auth.replace('Bearer ', '')
  const user = verifyToken(token)
  if (!user) {
    return NextResponse.json({ ok: false, msg: 'Unauthorized' }, { status: 401 })
  }

  let messageId, replyText, attachments = []
  const contentType = req.headers.get('content-type') || ''

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData()
    messageId = formData.get('messageId')
    replyText = formData.get('replyText')
    const files = formData.getAll('attachments')
    for (const file of files) {
      if (file && file.size > 0) {
        const buffer = await file.arrayBuffer()
        attachments.push({ filename: file.name, content: Buffer.from(buffer) })
      }
    }
  } else {
    let body
    try { body = await req.json() } catch {
      return NextResponse.json({ ok: false, msg: 'Invalid body' }, { status: 400 })
    }
    messageId = body.messageId
    replyText = body.replyText
  }

  if (!messageId || !replyText || !replyText.trim()) {
    return NextResponse.json({ ok: false, msg: 'messageId and replyText required' }, { status: 400 })
  }

  const database = db()
  const original = database.prepare('SELECT * FROM inbox_messages WHERE id = ?').get(messageId)
  if (!original) {
    return NextResponse.json({ ok: false, msg: 'Message not found' }, { status: 404 })
  }

  const replyTo = original.from_email
  if (!replyTo) {
    return NextResponse.json({ ok: false, msg: 'No sender address' }, { status: 400 })
  }

  const subject = original.subject && !original.subject.startsWith('Re:')
    ? 'Re: ' + original.subject
    : (original.subject || 'Re: (no subject)')

  const inboxAddress = (original.to_email || '').trim().toLowerCase()
  const staffAddress = (user.email || '').trim().toLowerCase()
  let fromEmail
  if (inboxAddress.endsWith('@gigva.co.ke')) {
    fromEmail = inboxAddress
  } else if (staffAddress.endsWith('@gigva.co.ke')) {
    fromEmail = staffAddress
  } else {
    fromEmail = 'noreply@gigva.co.ke'
  }

  const SIG_HTML = [
    '<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">',
    '<tr><td style="background:#000000;padding:20px 24px;border-top:3px solid #0ea5e9;">',
    '<table cellpadding="0" cellspacing="0">',
    '<tr><td style="background:#0ea5e9;border-radius:7px;padding:7px 10px;vertical-align:middle;">',
    '<span style="color:#fff;font-size:15px;font-weight:800;letter-spacing:-0.5px;font-family:system-ui,sans-serif;">GIGVA</span>',
    '<span style="color:#bae6fd;font-size:7px;font-weight:700;letter-spacing:3.5px;display:block;margin-top:1px;font-family:system-ui,sans-serif;">KENYA</span>',
    '</td></tr></table>',
    '<p style="margin:12px 0 8px;font-size:12px;font-style:italic;color:#7dd3fc;font-family:system-ui,sans-serif;">',
    'Powering Innovation with Smart Software Solutions in Kenya',
    '</p>',
    '<p style="margin:0;font-size:11px;color:#475569;font-family:system-ui,sans-serif;">',
    '<a href="https://gigva.co.ke" style="color:#0ea5e9;text-decoration:none;">gigva.co.ke</a>',
    '</p>',
    '</td></tr></table>'
  ].join('')

  const htmlBody =
    '<div style="font-family:system-ui,sans-serif;font-size:14px;color:#1e293b;line-height:1.6">' +
    replyText.trim().replace(/\n/g, '<br/>') +
    '</div>' + SIG_HTML

  const emailPayload = { from: fromEmail, to: [replyTo], subject, text: replyText.trim(), html: htmlBody, replyTo: fromEmail }
  if (attachments.length > 0) emailPayload.attachments = attachments

  let sendResult
  try {
    sendResult = await resend.emails.send(emailPayload)
  } catch (err) {
    console.error('[inbox/reply] Resend error:', err)
    return NextResponse.json({ ok: false, msg: 'Failed to send', detail: err.message }, { status: 500 })
  }

  if (sendResult.error) {
    return NextResponse.json({ ok: false, msg: sendResult.error.message }, { status: 500 })
  }

  try {
    database.prepare(
      'INSERT INTO sent_emails (from_email, to_email, subject, body_text, body_html, resend_id) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(fromEmail, replyTo, subject, replyText.trim(), htmlBody, sendResult.data?.id || null)
  } catch (dbErr) { console.warn('[inbox/reply] sent_emails insert failed:', dbErr.message) }

  try {
    database.prepare(
      'UPDATE inbox_messages SET replied = 1, replied_at = ?, replied_by = ?, reply_text = ? WHERE id = ?'
    ).run(new Date().toISOString(), fromEmail, replyText.trim(), messageId)
  } catch (dbErr) { console.warn('[inbox/reply] DB update failed:', dbErr.message) }

  return NextResponse.json({ ok: true, emailId: sendResult.data && sendResult.data.id })
}
