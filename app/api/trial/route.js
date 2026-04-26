import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomId } from '@/lib/utils'
import { sendEmail, sendEmailToMany } from '@/lib/email'
import { trialRequestedStaff, trialRequestedAutoReply } from '@/lib/emailTemplates'
import { getNotifyRecipients } from '@/lib/roleConfig'
import { rateLimit } from '@/lib/rateLimit'

export async function POST(req) {
  try {
    // Rate limit: 5 trial requests per IP per minute
    if (rateLimit(req, { max: 5, windowMs: 60_000 })) {
      return NextResponse.json({ ok: false, msg: 'Too many requests. Please try again shortly.' }, { status: 429 })
    }

    const body = await req.json()
    const {
      fullName, email, phone = '', businessName, businessType = '', description = '',
    } = body

    if (!fullName?.trim()) {
      return NextResponse.json({ ok: false, msg: 'Full name is required.' }, { status: 400 })
    }
    if (!email?.includes('@')) {
      return NextResponse.json({ ok: false, msg: 'Please enter a valid email address.' }, { status: 400 })
    }
    if (!businessName?.trim()) {
      return NextResponse.json({ ok: false, msg: 'Business name is required.' }, { status: 400 })
    }

    const id = randomId()
    const data = {
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      businessName: businessName.trim(),
      businessType: businessType.trim(),
      description: description.trim(),
    }

    const database = db()

    database.prepare(`
      INSERT INTO demos (id, name, email, company, phone, message, interests, business_type, source)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, data.fullName, data.email, data.businessName, data.phone, data.description,
      JSON.stringify([]), data.businessType, 'trial'
    )

    // Save to inbox_messages for hello@gigva.co.ke (customer experience team)
    try {
      database.exec(`CREATE TABLE IF NOT EXISTS inbox_messages (
        id TEXT PRIMARY KEY,
        from_name TEXT DEFAULT '',
        from_email TEXT NOT NULL,
        to_email TEXT NOT NULL,
        subject TEXT DEFAULT '',
        body_text TEXT DEFAULT '',
        body_html TEXT DEFAULT '',
        is_read INTEGER DEFAULT 0,
        source TEXT DEFAULT '',
        ref_id TEXT DEFAULT '',
        created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
      )`)

      const msgSubject = 'New Free Trial Request: ' + data.fullName + ' (' + data.businessName + ')'
      const bodyLines = [
        'FREE TRIAL REQUEST RECEIVED',
        '',
        'Name: ' + data.fullName,
        'Email: ' + data.email,
        'Phone: ' + (data.phone || 'N/A'),
        'Business Name: ' + data.businessName,
        'Business Type: ' + (data.businessType || 'N/A'),
        'Description: ' + (data.description || 'N/A'),
      ]
      const bodyText = bodyLines.join('\n')

      const htmlLines = [
        '<h2 style="color:#0f2d5c;font-family:Arial,sans-serif;">Free Trial Request Received</h2>',
        '<table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse;width:100%;max-width:600px;">',
        '<tr><td style="padding:8px 12px;background:#f1f5f9;font-weight:bold;width:140px;">Name</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">' + data.fullName + '</td></tr>',
        '<tr><td style="padding:8px 12px;background:#f1f5f9;font-weight:bold;">Email</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;"><a href="mailto:' + data.email + '">' + data.email + '</a></td></tr>',
        '<tr><td style="padding:8px 12px;background:#f1f5f9;font-weight:bold;">Phone</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">' + (data.phone || 'N/A') + '</td></tr>',
        '<tr><td style="padding:8px 12px;background:#f1f5f9;font-weight:bold;">Business Name</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">' + data.businessName + '</td></tr>',
        '<tr><td style="padding:8px 12px;background:#f1f5f9;font-weight:bold;">Business Type</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">' + (data.businessType || 'N/A') + '</td></tr>',
        '<tr><td style="padding:8px 12px;background:#f1f5f9;font-weight:bold;vertical-align:top;">Description</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">' + (data.description || 'N/A') + '</td></tr>',
        '</table>',
      ]
      const bodyHtml = htmlLines.join('')

      const msgId = randomId()
      database.prepare(`INSERT OR IGNORE INTO inbox_messages
        (id, from_name, from_email, to_email, subject, body_text, body_html, is_read, source, ref_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'trial', ?)
      `).run(msgId, data.fullName, data.email, 'hello@gigva.co.ke', msgSubject, bodyText, bodyHtml, id)
    } catch (inboxErr) {
      console.warn('[trial] inbox_messages insert failed:', inboxErr.message)
    }

    // Fire-and-forget notifications
    sendEmailToMany(getNotifyRecipients('trial'), trialRequestedStaff(data))
      .catch(e => console.error('[trial/notify]', e.message))
    sendEmail({ to: data.email, ...trialRequestedAutoReply(data) })
      .catch(e => console.error('[trial/autoreply]', e.message))

    return NextResponse.json({ ok: true, id }, { status: 201 })
  } catch (err) {
    console.error('[api/trial POST]', err)
    return NextResponse.json({ ok: false, msg: 'Server error. Please try again.' }, { status: 500 })
  }
}
