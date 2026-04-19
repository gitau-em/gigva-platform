import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { comparePassword, hashPassword, signToken } from '@/lib/auth'

export async function POST(req) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ ok: false, msg: 'Email and password are required.' }, { status: 400 })
    }

    const database = db()
    const user     = database.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase())

    if (!user) {
      // Constant-time response — prevent user enumeration
      await comparePassword(password, '$2b$12$invalidhashtopreventtimingattackxxxxxxxxxxxxxxxxxxxx')
      return NextResponse.json({ ok: false, msg: 'Incorrect email or password.' }, { status: 401 })
    }
    if (user.status !== 'active') {
      return NextResponse.json({ ok: false, msg: 'This account has been disabled.' }, { status: 403 })
    }

    const match = await comparePassword(password, user.password_hash)
    if (!match) {
      return NextResponse.json({ ok: false, msg: 'Incorrect email or password.' }, { status: 401 })
    }

    const { password_hash, ...safeUser } = user
    const token = signToken(safeUser)
    return NextResponse.json({ ok: true, token, user: safeUser })
  } catch (err) {
    console.error('login:', err)
    return NextResponse.json({ ok: false, msg: 'Server error.' }, { status: 500 })
  }
}
