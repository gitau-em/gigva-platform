/**
 * app/api/admin/inbox/attachments/route.js
 * GET /api/admin/inbox/attachments?messageId=xxx
 *   List attachments for an inbox message.
 * GET /api/admin/inbox/attachments/:id
 *   Download a specific attachment by its id.
 * Requires valid staff/admin JWT.
 */

import { NextResponse } from 'next/server'
import { db }           from '@/lib/db'
import { verifyToken }  from '@/lib/auth'

function getUser(req) {
  const auth  = req.headers.get('authorization') || ''
  const token = auth.replace(/^Bearer\s+/i, '').trim()
  if (!token) return null
  try { return verifyToken(token) || null } catch { return null }
}

export async function GET(req) {
  const user = getUser(req)
  if (!user) return NextResponse.json({ ok: false, msg: 'Unauthorised.' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const messageId = searchParams.get('messageId')

  if (!messageId) {
    return NextResponse.json({ ok: false, msg: 'messageId is required.' }, { status: 400 })
  }

  try {
    const database = db()

    // Verify the user has access to this message (by inbox_messages table)
    if (!user.is_admin) {
      let hasAccess = false
      try {
        const inboxMsg = database.prepare(
          'SELECT id FROM inbox_messages WHERE id = ? AND to_email = ? COLLATE NOCASE LIMIT 1'
        ).get(messageId, user.email)
        if (inboxMsg) hasAccess = true
      } catch(e) {}

      // Also check sent_emails as fallback
      if (!hasAccess) {
        try {
          const sentMsg = database.prepare(
            'SELECT id FROM sent_emails WHERE id = ? AND (from_email = ? OR to_email LIKE ?) COLLATE NOCASE LIMIT 1'
          ).get(messageId, user.email, '%' + user.email + '%')
          if (sentMsg) hasAccess = true
        } catch(e) {}
      }

      if (!hasAccess) {
        return NextResponse.json({ ok: true, attachments: [] })
      }
    }

    // Get attachments metadata (no data blob)
    let rows = []
    try {
      rows = database.prepare(
        'SELECT id, filename, mime_type, size, created_at FROM message_attachments WHERE message_id = ? ORDER BY rowid ASC'
      ).all(messageId)
    } catch(e) {
      // Table may not exist yet
      rows = []
    }

    return NextResponse.json({ ok: true, attachments: rows })
  } catch (err) {
    console.error('[attachments list GET]', err)
    return NextResponse.json({ ok: false, msg: 'Server error.' }, { status: 500 })
  }
}
