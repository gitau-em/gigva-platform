import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomId } from '@/lib/utils'

export async function POST(req) {
  try {
    const { email } = await req.json()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ ok: false, msg: 'Valid email required.' }, { status: 400 })
    }
    const database  = db()
    const existing  = database.prepare('SELECT id FROM newsletter WHERE email = ?').get(email.toLowerCase())
    if (existing) {
      return NextResponse.json({ ok: true, msg: 'Already subscribed.' })
    }
    database.prepare('INSERT INTO newsletter (id, email) VALUES (?, ?)').run(randomId(), email.toLowerCase())
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('newsletter:', err)
    return NextResponse.json({ ok: false, msg: 'Server error.' }, { status: 500 })
  }
}
