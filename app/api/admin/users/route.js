/**
 * app/api/admin/users/route.js
 * Protected — requires superadmin JWT (is_admin === 1).
 *
 * GET    → list all users
 * POST   → create new staff user  { name, email, role, company? }
 * PATCH  → update user            { id, name?, role?, status? }
 * DELETE → delete user(s)         { ids: string[] }
 */

import { NextResponse }         from 'next/server'
import { db }                   from '@/lib/db'
import { verifyAdminRequest }   from '@/lib/adminAuth'
import { hashPassword }         from '@/lib/auth'
import { randomId }             from '@/lib/utils'
import { sendEmail }            from '@/lib/email'
import { newStaffAccount }      from '@/lib/emailTemplates'
import { ROLES, STAFF_DEFAULT_PASSWORD } from '@/lib/roleConfig'
import crypto                   from 'crypto'

function guard(req) {
  const user = verifyAdminRequest(req)
  if (!user || !user.is_admin) {
    return NextResponse.json({ ok: false, msg: 'Superadmin access required.' }, { status: 403 })
  }
  return null
}

// ── GET — list all users ──────────────────────────────────────────────────────
export async function GET(req) {
  const err = guard(req)
  if (err) return err
  try {
    const users = db()
      .prepare(`SELECT id, name, email, company, role, is_admin, status, created_at, updated_at
                FROM users ORDER BY is_admin DESC, created_at ASC`)
      .all()
    return NextResponse.json({ ok: true, users })
  } catch (e) {
    console.error('[admin/users GET]', e)
    return NextResponse.json({ ok: false, msg: 'Server error.' }, { status: 500 })
  }
}

// ── POST — create staff user ──────────────────────────────────────────────────
export async function POST(req) {
  const err = guard(req)
  if (err) return err
  try {
    const { name, email, role, company = 'Gigva Kenya', password } = await req.json()

    if (!name?.trim())  return NextResponse.json({ ok: false, msg: 'Name is required.'  }, { status: 400 })
    if (!email?.includes('@')) return NextResponse.json({ ok: false, msg: 'Valid email required.' }, { status: 400 })
    if (!role || !ROLES[role]) {
      return NextResponse.json({ ok: false, msg: `Invalid role. Valid roles: ${Object.keys(ROLES).join(', ')}` }, { status: 400 })
    }

    const existing = db().prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase())
    if (existing) {
      return NextResponse.json({ ok: false, msg: 'A user with that email already exists.' }, { status: 409 })
    }

    const tempPassword = password || STAFF_DEFAULT_PASSWORD
    const hash         = await hashPassword(tempPassword)
    const id           = crypto.randomBytes(8).toString('hex')

    db().prepare(`
      INSERT INTO users (id, name, email, password_hash, company, role, is_admin, status)
      VALUES (?, ?, ?, ?, ?, ?, 0, 'active')
    `).run(id, name.trim(), email.toLowerCase(), hash, company.trim(), role)

    // Send welcome email (fire-and-forget)
    const webmailUrl = process.env.NEXT_PUBLIC_WEBMAIL_URL || null
    const tmpl = newStaffAccount({
      name: name.trim(),
      email: email.toLowerCase(),
      role: ROLES[role]?.label || role,
      tempPassword,
      webmailUrl,
    })
    sendEmail({ to: email.toLowerCase(), ...tmpl })
      .catch(e => console.error('[admin/users] welcome email failed:', e.message))

    return NextResponse.json({ ok: true, id }, { status: 201 })
  } catch (e) {
    console.error('[admin/users POST]', e)
    return NextResponse.json({ ok: false, msg: 'Server error.' }, { status: 500 })
  }
}

// ── PATCH — update user ───────────────────────────────────────────────────────
export async function PATCH(req) {
  const err = guard(req)
  if (err) return err
  try {
    const { id, name, role, status, password } = await req.json()
    if (!id) return NextResponse.json({ ok: false, msg: 'id is required.' }, { status: 400 })

    const sets   = []
    const values = []

    if (name     !== undefined) { sets.push('name = ?');   values.push(name.trim()) }
    if (role     !== undefined) { sets.push('role = ?');   values.push(role) }
    if (status   !== undefined) { sets.push('status = ?'); values.push(status) }
    if (password !== undefined) {
      const hash = await hashPassword(password)
      sets.push('password_hash = ?')
      values.push(hash)
    }

    if (!sets.length) return NextResponse.json({ ok: false, msg: 'Nothing to update.' }, { status: 400 })

    sets.push("updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')")
    values.push(id)

    db().prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...values)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[admin/users PATCH]', e)
    return NextResponse.json({ ok: false, msg: 'Server error.' }, { status: 500 })
  }
}

// ── DELETE — remove user(s) ───────────────────────────────────────────────────
export async function DELETE(req) {
  const err = guard(req)
  if (err) return err
  try {
    const { ids } = await req.json()
    if (!Array.isArray(ids) || !ids.length) {
      return NextResponse.json({ ok: false, msg: 'ids array required.' }, { status: 400 })
    }
    const placeholders = ids.map(() => '?').join(',')
    // Prevent deleting own account
    const requestingAdmin = verifyAdminRequest(req)
    const safeIds = ids.filter(i => i !== requestingAdmin?.id)
    if (!safeIds.length) {
      return NextResponse.json({ ok: false, msg: 'Cannot delete your own account.' }, { status: 400 })
    }
    db().prepare(`DELETE FROM users WHERE id IN (${safeIds.map(() => '?').join(',')}) AND is_admin = 0`)
        .run(...safeIds)
    return NextResponse.json({ ok: true, deleted: safeIds.length })
  } catch (e) {
    console.error('[admin/users DELETE]', e)
    return NextResponse.json({ ok: false, msg: 'Server error.' }, { status: 500 })
  }
}
