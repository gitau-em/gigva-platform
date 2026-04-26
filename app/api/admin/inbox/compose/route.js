/**
 * app/api/admin/inbox/compose/route.js
 * POST /api/admin/inbox/compose
 * Send a new composed email via Resend.
 * Supports JSON body or multipart/form-data for file attachments.
 */
import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { Resend } from 'resend'
import { appendSignature } from '@/lib/emailSignature'
import { db } from '@/lib/db'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req) {
  // Auth check
  const auth = req.headers.get('authorization') || ''
  const token = auth.replace('Bearer ', '').trim()
  const user = await verifyToken(token)
  if (!user) return NextResponse.json({ ok: false, msg: 'Unauthorized' }, { status: 401 })

  try {
    let to, cc, bcc, subject, bodyText
    const attachments = []
    const contentType = req.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      // Handle form-data with file attachments
      const formData = await req.formData()
      to = formData.get('to') || ''
      cc = formData.get('cc') || ''
      bcc = formData.get('bcc') || ''
      subject = formData.get('subject') || ''
      bodyText = formData.get('bodyText') || ''
      // Process file attachments
      const files = formData.getAll('attachments')
      for (const file of files) {
        if (file && file.size > 0) {
          const buffer = await file.arrayBuffer()
          attachments.push({
            filename: file.name,
            content: Buffer.from(buffer),
          })
        }
      }
    } else {
      // Handle JSON body
      const body = await req.json()
      to = body.to || ''
      cc = body.cc || ''
      bcc = body.bcc || ''
      subject = body.subject || ''
      bodyText = body.bodyText || ''
    }

    if (!to) return NextResponse.json({ ok: false, msg: 'Recipient email is required' }, { status: 400 })
    if (!subject) return NextResponse.json({ ok: false, msg: 'Subject is required' }, { status: 400 })

    // Parse recipients
    const toList = to.split(/[,;]+/).map(e => e.trim()).filter(Boolean)
    const ccList = cc ? cc.split(/[,;]+/).map(e => e.trim()).filter(Boolean) : []
    const bccList = bcc ? bcc.split(/[,;]+/).map(e => e.trim()).filter(Boolean) : []

    // Build HTML body
    const rawBody = '<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#222;">' +
      bodyText.replace(/\n/g, '<br/>') +
      '</div>'

    // Append centralized Gigva signature (duplicate-safe)
    const htmlBody = appendSignature(rawBody)

    // Build sender from authenticated user's own email (not hardcoded cto address)
  // user.email is a @gigva.co.ke address from the JWT — Resend allows any sender on the verified domain
  const senderName = user.name || 'Gigva Staff'
  const senderEmail = user.email || 'hello@gigva.co.ke'
  const fromEmail = senderName + ' <' + senderEmail + '>'

    const sendOptions = {
      from: fromEmail,
      to: toList,
      subject,
      html: htmlBody,
      text: bodyText,
    }
    if (ccList.length > 0) sendOptions.cc = ccList
    if (bccList.length > 0) sendOptions.bcc = bccList
    if (attachments.length > 0) sendOptions.attachments = attachments

    const { data, error } = await resend.emails.send(sendOptions)
    if (error) {
      return NextResponse.json({ ok: false, msg: error.message }, { status: 500 })
    }
    // Save sent email to DB so it appears in Sent tab
    try {
      const database = db()
      // Ensure sent_emails table exists
      database.exec(`CREATE TABLE IF NOT EXISTS sent_emails (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
        from_email TEXT NOT NULL,
        to_email TEXT NOT NULL,
        subject TEXT NOT NULL DEFAULT '',
        body_text TEXT NOT NULL DEFAULT '',
        body_html TEXT NOT NULL DEFAULT '',
        resend_id TEXT NOT NULL DEFAULT '',
        sent_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`)
      const sentId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
      database.prepare(
        'INSERT INTO sent_emails (id, from_email, to_email, subject, body_text, body_html, resend_id, sent_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime(\'now\'))'
      ).run(sentId, senderEmail, toList.join(', '), subject, bodyText || '', htmlBody, data?.id || '')
    } catch (dbErr) {
      console.warn('[inbox/compose] sent_emails insert failed:', dbErr.message)
    }
    return NextResponse.json({ ok: true, id: data && data.id })
  } catch (e) {
    return NextResponse.json({ ok: false, msg: e.message }, { status: 500 })
  }
}
