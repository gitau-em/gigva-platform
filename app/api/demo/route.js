import { NextResponse }                          from 'next/server'
import { db }                                     from '@/lib/db'
import { randomId }                               from '@/lib/utils'
import { sendEmail, sendEmailToMany }             from '@/lib/email'
import { demoBookedStaff, demoBookedAutoReply }   from '@/lib/emailTemplates'
import { getNotifyRecipients }                    from '@/lib/roleConfig'
import { rateLimit }                               from '@/lib/rateLimit'

export async function POST(req) {
  try {
    // Rate limit: 5 demo bookings per IP per minute
    if (rateLimit(req, { max: 5, windowMs: 60_000 })) {
      return NextResponse.json({ ok: false, msg: 'Too many requests. Please try again shortly.' }, { status: 429 })
    }

    const body = await req.json()
    const {
      name, email, company = '', phone = '',
      message = '', interests = [], businessType = '',
      source = 'demo',
    } = body

    if (!name?.trim() || !email?.trim() || !company?.trim()) {
      return NextResponse.json(
        { ok: false, msg: 'Name, email, and business name are required.' },
        { status: 400 }
      )
    }
    if (!email.includes('@')) {
      return NextResponse.json(
        { ok: false, msg: 'Please enter a valid email address.' },
        { status: 400 }
      )
    }

    const id   = randomId()
    const data = {
      name:         name.trim(),
      email:        email.toLowerCase().trim(),
      company:      company.trim(),
      phone:        phone.trim(),
      message:      message.trim(),
      interests:    Array.isArray(interests) ? interests : [],
      businessType: businessType.trim(),
      source:       ['demo', 'book-demo', 'trial', 'api'].includes(source) ? source : 'demo',
    }

    db().prepare(`
      INSERT INTO demos (id, name, email, company, phone, message, interests, business_type, source)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, data.name, data.email, data.company, data.phone,
      data.message, JSON.stringify(data.interests), data.businessType, data.source
    )

    // Fire-and-forget notifications
    sendEmailToMany(getNotifyRecipients('demo'), demoBookedStaff(data))
      .catch(e => console.error('[demo/notify]', e.message))

    sendEmail({ to: data.email, ...demoBookedAutoReply(data) })
      .catch(e => console.error('[demo/autoreply]', e.message))

    return NextResponse.json({ ok: true, id }, { status: 201 })
  } catch (err) {
    console.error('[api/demo POST]', err)
    return NextResponse.json({ ok: false, msg: 'Server error. Please try again.' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const demos = db()
      .prepare('SELECT * FROM demos ORDER BY created_at DESC')
      .all()
    return NextResponse.json({
      ok: true,
      demos: demos.map(d => ({
        ...d,
        interests: JSON.parse(d.interests || '[]'),
      })),
    })
  } catch (err) {
    console.error('[api/demo GET]', err)
    return NextResponse.json({ ok: false, msg: 'Server error.' }, { status: 500 })
  }
}
