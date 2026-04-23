/**
 * app/api/admin/inbox/attachments/route.js
 * GET /api/admin/inbox/attachments?messageId=xxx
 * List attachments for a sent email message.
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

    // Verify the user has access to this email
    if (!user.is_admin) {
      const email = database.prepare(
        'SELECT from_email, to_email FROM sent_emails WHERE id = ?'
      ).get(messageId)

      if (!email) {
        return NextResponse.json({ ok: true, attachments: [] })
      }

      const userEmail = user.email.toLowerCase()
      const isRelated = email.from_email.toLowerCase() === userEmail ||
                        email.to_email.toLowerCase().includes(userEmail)

      if (!isRelated) {
        return NextResponse.json({ ok: false, msg: 'Access denied.' }, { status: 403 })
      }
    }

    // Get attachments without the data blob (just metadata)
    const rows = database.prepare(
      'SELECT id, filename, mime_type, size, created_at FROM message_attachments WHERE message_id = ? ORDER BY rowid ASC'
    ).all(messageId)

    return NextResponse.json({ ok: true, attachments: rows })
  } catch (err) {
    console.error('[attachments list GET]', err)
    return NextResponse.json({ ok: false, msg: 'Server error.' }, { status: 500 })
  }
}
