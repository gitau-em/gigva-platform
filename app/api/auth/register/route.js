import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { hashPassword, signToken } from '@/lib/auth'
import { randomId } from '@/lib/utils'

const schema = z.object({
  name:     z.string().min(2).max(100),
  email:    z.string().email(),
  password: z.string().min(8),
  company:  z.string().max(200).optional().default(''),
  phone:    z.string().max(20).optional().default(''),
  role:     z.string().max(100).optional().default(''),
})

export async function POST(req) {
  try {
    const body   = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || 'Invalid input.'
      return NextResponse.json({ ok: false, msg }, { status: 400 })
    }

    const { name, email, password, company, phone, role } = parsed.data
    const database = db()

    const existing = database.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase())
    if (existing) {
      return NextResponse.json({ ok: false, msg: 'An account with this email already exists.' }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)
    const id           = randomId()

    database.prepare(`
      INSERT INTO users (id, name, email, password_hash, company, phone, role)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, name.trim(), email.toLowerCase(), passwordHash, company, phone, role)

    const user  = database.prepare('SELECT id, name, email, company, phone, role, is_admin, created_at FROM users WHERE id = ?').get(id)
    const token = signToken(user)

    return NextResponse.json({ ok: true, token, user }, { status: 201 })
  } catch (err) {
    console.error('register:', err)
    return NextResponse.json({ ok: false, msg: 'Server error.' }, { status: 500 })
  }
}
