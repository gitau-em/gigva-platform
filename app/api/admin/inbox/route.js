/**
 * app/api/admin/inbox/route.js
 * Protected endpoint — requires a valid staff/admin JWT.
 * GET  → list inbox messages for the logged-in user (by their email)
 *         superadmin & customer-facing roles also see hello@gigva.co.ke messages
 * PATCH → mark message read/unread { id, is_read: 0|1 }
 * DELETE → delete one message { id }
 */
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// Roles that receive messages sent to hello@gigva.co.ke shared inbox
const SHARED_INBOX_ROLES = ['superadmin', 'ceo', 'cto', 'customer_success']
const SHARED_INBOX_EMAIL = 'hello@gigva.co.ke'

function getUser(req) {
  const auth = req.headers.get('authorization') || ''
  const token = auth.replace(/^Bearer\s+/i, '').trim()
  if (!token) return null
  try { return verifyToken(token) || null } catch { return null }
}

function ensureInboxSchema(database) {
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
      replied INTEGER DEFAULT 0,
      replied_at TEXT DEFAULT NULL,
      replied_by TEXT DEFAULT '',
      reply_text TEXT DEFAULT '',
      created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    )`)
    // Safe migration: add columns if they don't exist yet
    const cols = database.pragma('table_info(inbox_messages)').map(r => r.name)
    const toAdd = [
      { name: 'from_name', def: "TEXT DEFAULT ''" },
      { name: 'source', def: "TEXT DEFAULT ''" },
      { name: 'ref_id', def: "TEXT DEFAULT ''" },
      { name: 'replied', def: 'INTEGER DEFAULT 0' },
      { name: 'replied_at', def: 'TEXT DEFAULT NULL' },
      { name: 'replied_by', def: "TEXT DEFAULT ''" },
      { name: 'reply_text', def: "TEXT DEFAULT ''" },
    ]
    for (const col of toAdd) {
      if (!cols.includes(col.name)) {
        database.exec('ALTER TABLE inbox_messages ADD COLUMN ' + col.name + ' ' + col.def)
      }
    }
  } catch (e) {
    console.warn('[inbox] schema migration:', e.message)
  }
}

export async function GET(req) {
  const user = getUser(req)
  if (!user) return NextResponse.json({ ok: false, msg: 'Unauthorised.' }, { status: 401 })
  try {
    const database = db()
    ensureInboxSchema(database)
    let rows
    if (user.is_admin) {
      // Super admin sees all messages
      rows = database.prepare('SELECT * FROM inbox_messages ORDER BY created_at DESC').all()
    } else if (SHARED_INBOX_ROLES.includes(user.role)) {
      // Customer-facing staff see their own messages PLUS shared hello@gigva.co.ke inbox
      rows = database
        .prepare('SELECT * FROM inbox_messages WHERE to_email = ? COLLATE NOCASE OR to_email = ? COLLATE NOCASE ORDER BY created_at DESC')
        .all(user.email, SHARED_INBOX_EMAIL)
    } else {
      // Other staff see only their own messages
      rows = database
        .prepare('SELECT * FROM inbox_messages WHERE to_email = ? COLLATE NOCASE ORDER BY created_at DESC')
        .all(user.email)
    }
    const unread = rows.filter(r => !r.is_read).length
    return NextResponse.json({ ok: true, messages: rows, unread })
  } catch (e) {
    console.error('[admin/inbox GET]', e)
    return NextResponse.json({ ok: false, msg: 'Server error.' }, { status: 500 })
  }
}

export async function PATCH(req) {
  const user = getUser(req)
  if (!user) return NextResponse.json({ ok: false, msg: 'Unauthorised.' }, { status: 401 })
  try {
    const { id, is_read } = await req.json()
    if (!id) return NextResponse.json({ ok: false, msg: 'id required.' }, { status: 400 })
    const database = db()
    if (!user.is_admin) {
      // Allow marking shared inbox messages too
      const msg = database
        .prepare('SELECT id FROM inbox_messages WHERE id = ? AND (to_email = ? COLLATE NOCASE OR to_email = ? COLLATE NOCASE)')
        .get(id, user.email, SHARED_INBOX_EMAIL)
      if (!msg) return NextResponse.json({ ok: false, msg: 'Not found.' }, { status: 404 })
    }
    database.prepare('UPDATE inbox_messages SET is_read = ? WHERE id = ?').run(is_read ? 1 : 0, id)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[admin/inbox PATCH]', e)
    return NextResponse.json({ ok: false, msg: 'Server error.' }, { status: 500 })
  }
}

export async function DELETE(req) {
  const user = getUser(req)
  if (!user) return NextResponse.json({ ok: false, msg: 'Unauthorised.' }, { status: 401 })
  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ ok: false, msg: 'id required.' }, { status: 400 })
    const database = db()
    if (!user.is_admin) {
      const msg = database
        .prepare('SELECT id FROM inbox_messages WHERE id = ? AND (to_email = ? COLLATE NOCASE OR to_email = ? COLLATE NOCASE)')
        .get(id, user.email, SHARED_INBOX_EMAIL)
      if (!msg) return NextResponse.json({ ok: false, msg: 'Not found.' }, { status: 404 })
    }
    database.prepare('DELETE FROM inbox_messages WHERE id = ?').run(id)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[admin/inbox DELETE]', e)
    return NextResponse.json({ ok: false, msg: 'Server error.' }, { status: 500 })
  }
}
