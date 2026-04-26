import { NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/adminAuth'
import { Resend } from 'resend'
import { STAFF_ROSTER } from '@/lib/roleConfig'
import { appendSignature } from '@/lib/emailSignature'

const resend = new Resend(process.env.RESEND_API_KEY)

// POST /api/admin/assign
// Body: { type, rowId, staffEmail, subject, bodyHtml, bodyText, fromName, fromEmail }
export async function POST(req) {
  const auth = await verifyAdminRequest(req)
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 })

  let body
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Bad request' }, { status: 400 }) }

  const { type, rowId, staffEmail, subject, bodyHtml, bodyText, fromName, fromEmail } = body

  if (!staffEmail || !subject) {
    return NextResponse.json({ error: 'staffEmail and subject are required' }, { status: 400 })
  }

  // Validate staffEmail is in STAFF_ROSTER
  const staffMember = STAFF_ROSTER.find(s => s.email === staffEmail)
  if (!staffMember) {
    return NextResponse.json({ error: 'Invalid staff email' }, { status: 400 })
  }

  const assignedBy = auth.user.name || auth.user.email
  const typeLabel = type === 'demo' ? 'Demo Booking' : type === 'trial' ? 'Free Trial Request' : 'Contact Message'

  const emailHtml = appendSignature(`
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1e293b;">
      <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
        <p style="margin:0;font-size:13px;color:#0369a1;font-weight:600;">
          📋 Assigned to you by ${assignedBy}
        </p>
        <p style="margin:4px 0 0;font-size:12px;color:#0284c7;">
          Type: ${typeLabel}${rowId ? ' · Ref #' + rowId : ''}
        </p>
      </div>
      <h2 style="font-size:16px;font-weight:700;margin:0 0 16px;">${subject}</h2>
      ${bodyHtml || (bodyText ? '<pre style="white-space:pre-wrap;font-size:13px;color:#334155;">' + bodyText + '</pre>' : '<p style="color:#64748b;font-size:13px;">No message body provided.</p>')}
      ${fromName || fromEmail ? `
        <div style="margin-top:20px;padding-top:16px;border-top:1px solid #e2e8f0;">
          <p style="font-size:12px;color:#64748b;margin:0;">From: <strong>${fromName || ''}</strong>${fromEmail ? ' &lt;' + fromEmail + '&gt;' : ''}</p>
        </div>
      ` : ''}
    </div>
  `)

  const emailText = [
    `Assigned to you by ${assignedBy}`,
    `Type: ${typeLabel}${rowId ? ' - Ref #' + rowId : ''}`,
    '',
    subject,
    '',
    bodyText || '(No message body)',
    fromName || fromEmail ? `\nFrom: ${fromName || ''} ${fromEmail ? '<' + fromEmail + '>' : ''}`.trim() : '',
  ].filter(l => l !== undefined).join('\n')

  try {
    await resend.emails.send({
      from: 'Gigva Staff Portal <noreply@gigva.co.ke>',
      to: staffEmail,
      subject: `[Assigned] ${subject}`,
      html: emailHtml,
      text: emailText,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('assign email error', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
