/**
 * app/api/admin/inbox/route.js
 * Protected endpoint — requires a valid staff/admin JWT.
 * GET    → list inbox messages for the logged-in user (by their email)
 *          superadmin sees all messages
 * PATCH  → mark message read/unread  { id, is_read: 0|1 }
 * DELETE → delete one message        { id }
 */

import { NextResponse }  from 'next/server'
import { db }            from '@/lib/db'
import { verifyToken }   from '@/lib/auth'

function getUser(req) {
    const auth  = req.headers.get('authorization') || ''
    const token = auth.replace(/^Bearer\s+/i, '').trim()
    if (!token) return null
    try {
          return verifyToken(token) || null
        } catch {
          return null
        }
  }

export async function GET(req) {
    const user = getUser(req)
    if (!user) return NextResponse.json({ ok: false, msg: 'Unauthorised.' }, { status: 401 })

    try {
          let rows
          if (user.is_admin) {
                  // Superadmin sees all messages
                  rows = db()
                    .prepare('SELECT * FROM inbox_messages ORDER BY created_at DESC')
                    .all()
                } else {
                  // Staff sees only messages addressed to their email
                  rows = db()
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

          if (!user.is_admin) {
                  const msg = db()
                    .prepare('SELECT id FROM inbox_messages WHERE id = ? AND to_email = ? COLLATE NOCASE')
                    .get(id, user.email)
                  if (!msg) return NextResponse.json({ ok: false, msg: 'Not found.' }, { status: 404 })
                }

          db().prepare('UPDATE inbox_messages SET is_read = ? WHERE id = ?').run(is_read ? 1 : 0, id)
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

          if (!user.is_admin) {
                  const msg = db()
                    .prepare('SELECT id FROM inbox_messages WHERE id = ? AND to_email = ? COLLATE NOCASE')
                    .get(id, user.email)
                  if (!msg) return NextResponse.json({ ok: false, msg: 'Not found.' }, { status: 404 })
                }

          db().prepare('DELETE FROM inbox_messages WHERE id = ?').run(id)
          return NextResponse.json({ ok: true })
        } catch (e) {
          console.error('[admin/inbox DELETE]', e)
          return NextResponse.json({ ok: false, msg: 'Server error.' }, { status: 500 })
        }
  }
