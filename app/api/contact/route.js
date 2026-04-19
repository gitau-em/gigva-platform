import { NextResponse }                           from 'next/server'
import { db }                                      from '@/lib/db'
import { randomId }                                from '@/lib/utils'
import { sendEmail, sendEmailToMany }              from '@/lib/email'
import { contactReceivedStaff, contactAutoReply }  from '@/lib/emailTemplates'
import { getNotifyRecipients }                     from '@/lib/roleConfig'
import { rateLimit }                                from '@/lib/rateLimit'

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

    const id   = randomId()
    const data = {
      name:    name.trim(),
      email:   email.toLowerCase(),
      company: company.trim(),
      role:    role.trim(),
      message: message.trim(),
    }

    db().prepare(`
      INSERT INTO contacts (id, name, email, company, role, message)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, data.name, data.email, data.company, data.role, data.message)

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
