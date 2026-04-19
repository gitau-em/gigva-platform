import { NextResponse }                                from 'next/server'
import { db }                                           from '@/lib/db'
import { randomId }                                     from '@/lib/utils'
import { sendEmail, sendEmailToMany }                   from '@/lib/email'
import { trialRequestedStaff, trialRequestedAutoReply } from '@/lib/emailTemplates'
import { getNotifyRecipients }                          from '@/lib/roleConfig'
import { rateLimit }                                    from '@/lib/rateLimit'

export async function POST(req) {
  try {
    // Rate limit: 5 trial requests per IP per minute
    if (rateLimit(req, { max: 5, windowMs: 60_000 })) {
      return NextResponse.json({ ok: false, msg: 'Too many requests. Please try again shortly.' }, { status: 429 })
    }

    const body = await req.json()
    const {
      fullName, email, phone = '',
      businessName, businessType = '', description = '',
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

    const id   = randomId()
    const data = {
      fullName:     fullName.trim(),
      email:        email.toLowerCase().trim(),
      phone:        phone.trim(),
      businessName: businessName.trim(),
      businessType: businessType.trim(),
      description:  description.trim(),
    }

    db().prepare(`
      INSERT INTO demos (id, name, email, company, phone, message, interests, business_type, source)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, data.fullName, data.email, data.businessName,
      data.phone, data.description, JSON.stringify([]), data.businessType, 'trial'
    )

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
