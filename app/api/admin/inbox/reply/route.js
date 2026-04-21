/**
 * app/api/admin/inbox/reply/route.js
 * POST /api/admin/inbox/reply
 * Send a reply email to an inbox message sender via Resend.
 * The FROM address is always the @gigva.co.ke address the original
 * message was sent TO (personalised per staff member), regardless of
 * which account is currently logged in (e.g. Super Admin).
 */

import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/db'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req) {
  const auth  = req.headers.get('authorization') || ''
  const token = auth.replace('Bearer ', '')
  const user  = verifyToken(token)
  if (!user) {
    return NextResponse.json({ ok: false, msg: 'Unauthorized' }, { status: 401 })
  }

  let body
  try { body = await req.json() } catch {
    return NextResponse.json({ ok: false, msg: 'Invalid JSON' }, { status: 400 })
  }

  const { messageId, replyText } = body
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

  // Always send from the staff address the original email was addressed TO.
  // This personalises replies: cto@gigva.co.ke replies as cto@gigva.co.ke,
  // samuel@gigva.co.ke replies as samuel@gigva.co.ke, etc.
  // Fall back to the logged-in user's own @gigva.co.ke address if available,
  // otherwise use noreply@gigva.co.ke (should not normally happen).
  const inboxAddress = (original.to_email || '').trim().toLowerCase()
  const staffAddress = (user.email || '').trim().toLowerCase()

  let fromEmail
  if (inboxAddress.endsWith('@gigva.co.ke')) {
    // Use the inbox owner's address — e.g. cto@gigva.co.ke
    fromEmail = inboxAddress
  } else if (staffAddress.endsWith('@gigva.co.ke')) {
    // Logged-in user is a gigva staff member directly
    fromEmail = staffAddress
  } else {
    fromEmail = 'noreply@gigva.co.ke'
  }

  const htmlBody =
    '<div style="font-family:system-ui,sans-serif;font-size:14px;color:#1e293b;line-height:1.6">'
    + replyText.trim().replace(/\n/g, '<br/>')
    + '</div><hr style="margin:24px 0;border:0;border-top:1px solid #e2e8f0"/>'
    + '<p style="font-size:12px;color:#94a3b8">Sent via Gigva Staff Portal</p>'

  let sendResult
  try {
    sendResult = await resend.emails.send({
      from:    fromEmail,
      to:      [replyTo],
      subject: subject,
      text:    replyText.trim(),
      html:    htmlBody,
      replyTo: fromEmail,
    })
  } catch (err) {
    console.error('[inbox/reply] Resend error:', err)
    return NextResponse.json({ ok: false, msg: 'Failed to send', detail: err.message }, { status: 500 })
  }

  if (sendResult.error) {
    return NextResponse.json({ ok: false, msg: sendResult.error.message }, { status: 500 })
  }

  try {
    database.prepare(
      'UPDATE inbox_messages SET replied = 1, replied_at = ?, replied_by = ?, reply_text = ? WHERE id = ?'
    ).run(new Date().toISOString(), fromEmail, replyText.trim(), messageId)
  } catch (dbErr) {
    console.warn('[inbox/reply] DB update failed:', dbErr.message)
  }

  return NextResponse.json({ ok: true, emailId: sendResult.data && sendResult.data.id })
}

