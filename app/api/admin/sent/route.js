/**
 * app/api/admin/sent/route.js
 * GET  - list sent emails for the current user (or all for superadmin)
 * POST - store a sent email record in the database
 */
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

function getUser(req) {
  const auth  = req.headers.get('authorization') || ''
  const token = auth.replace(/^Bearer\s+/i, '').trim()
  if (!token) return null
  try { return verifyToken(token) || null } catch { return null }
}

export async function GET(req) {
  const user = getUser(req)
  if (!user) return NextResponse.json({ ok: false, msg: 'Unauthorised.' }, { status: 401 })
  try {
    const database = db()
    let rows
    if (user.is_admin) {
      rows = database.prepare('SELECT * FROM sent_emails ORDER BY sent_at DESC').all()
    } else {
      rows = database.prepare('SELECT * FROM sent_emails WHERE from_email = ? COLLATE NOCASE ORDER BY sent_at DESC').all(user.email)
    }
    return NextResponse.json({ ok: true, emails: rows })
  } catch (e) {
    return NextResponse.json({ ok: false, msg: 'Server error.' }, { status: 500 })
  }
}

export async function POST(req) {
  const user = getUser(req)
  if (!user) return NextResponse.json({ ok: false, msg: 'Unauthorised.' }, { status: 401 })
  try {
    const body = await req.json()
    const { to_email, subject, body_text, body_html, resend_id } = body
    const database = db()
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
    database.prepare(
      'INSERT INTO sent_emails (id, from_email, to_email, subject, body_text, body_html, resend_id, sent_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime(\'now\'))'
    ).run(id, user.email, to_email, subject, body_text || '', body_html || '', resend_id || '')
    return NextResponse.json({ ok: true, id })
  } catch (e) {
    return NextResponse.json({ ok: false, msg: 'Server error.' }, { status: 500 })
  }
}
