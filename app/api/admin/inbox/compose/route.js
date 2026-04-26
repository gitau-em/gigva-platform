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

    const fromEmail = 'Gigva Kenya <cto@gigva.co.ke>'

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
    return NextResponse.json({ ok: true, id: data && data.id })
  } catch (e) {
    return NextResponse.json({ ok: false, msg: e.message }, { status: 500 })
  }
}
