import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomId } from '@/lib/utils'
import { sendEmail, sendEmailToMany } from '@/lib/email'
import { contactReceivedStaff, contactAutoReply } from '@/lib/emailTemplates'
import { getNotifyRecipients } from '@/lib/roleConfig'
import { rateLimit } from '@/lib/rateLimit'

export async function POST(req) {
  try {
    // Rate limit: 5 submissions per IP per minute
    if (rateLimit(req, { max: 5, windowMs: 60_000 })) {
      return NextResponse.json({ ok: false, msg: 'Too many requests. Please try again shortly.' }, { status: 429 })
    }

    const body = await req.json()
    const { name, email, company = '', role = '', message } = body

    if (!name || !email || !message) {
      return NextResponse.json({ ok: false, msg: 'Name, email, and message are required.' }, { status: 400 })
    }
    if (message.length < 5) {
      return NextResponse.json({ ok: false, msg: 'Message is too short.' }, { status: 400 })
    }

    const id = randomId()
    const data = {
      name: name.trim(),
      email: email.toLowerCase(),
      company: company.trim(),
      role: role.trim(),
      message: message.trim(),
    }

    const database = db()

    database.prepare(`
      INSERT INTO contacts (id, name, email, company, role, message)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, data.name, data.email, data.company, data.role, data.message)

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

      const msgSubject = 'Contact Us: ' + data.name + (data.company ? ' (' + data.company + ')' : '')
      const bodyLines = [
        'CONTACT FORM SUBMISSION',
        '',
        'Name: ' + data.name,
        'Email: ' + data.email,
        'Company: ' + (data.company || 'N/A'),
        'Role: ' + (data.role || 'N/A'),
        '',
        'Message:',
        data.message,
      ]
      const bodyText = bodyLines.join('\n')

      const htmlLines = [
        '<h2 style="color:#0f2d5c;font-family:Arial,sans-serif;">Contact Form Message</h2>',
        '<table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse;width:100%;max-width:600px;">',
        '<tr><td style="padding:8px 12px;background:#f1f5f9;font-weight:bold;width:120px;">Name</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">' + data.name + '</td></tr>',
        '<tr><td style="padding:8px 12px;background:#f1f5f9;font-weight:bold;">Email</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;"><a href="mailto:' + data.email + '">' + data.email + '</a></td></tr>',
        '<tr><td style="padding:8px 12px;background:#f1f5f9;font-weight:bold;">Company</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">' + (data.company || 'N/A') + '</td></tr>',
        '<tr><td style="padding:8px 12px;background:#f1f5f9;font-weight:bold;">Role</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">' + (data.role || 'N/A') + '</td></tr>',
        '<tr><td style="padding:8px 12px;background:#f1f5f9;font-weight:bold;vertical-align:top;">Message</td><td style="padding:8px 12px;white-space:pre-wrap;">' + data.message.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</td></tr>',
        '</table>',
      ]
      const bodyHtml = htmlLines.join('')

      const msgId = randomId()
      database.prepare(`INSERT OR IGNORE INTO inbox_messages
        (id, from_name, from_email, to_email, subject, body_text, body_html, is_read, source, ref_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'contact', ?)
      `).run(msgId, data.name, data.email, 'hello@gigva.co.ke', msgSubject, bodyText, bodyHtml, id)
    } catch (inboxErr) {
      console.warn('[contact] inbox_messages insert failed:', inboxErr.message)
    }

    // Fire-and-forget — never block the response
    sendEmailToMany(getNotifyRecipients('contact'), contactReceivedStaff(data))
      .catch(e => console.error('[contact/notify]', e.message))
    sendEmail({ to: data.email, ...contactAutoReply(data) })
      .catch(e => console.error('[contact/autoreply]', e.message))

    return NextResponse.json({ ok: true, id }, { status: 201 })
  } catch (err) {
    console.error('contact:', err)
    return NextResponse.json({ ok: false, msg: 'Server error.' }, { status: 500 })
  }
}
