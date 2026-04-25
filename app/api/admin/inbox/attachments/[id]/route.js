/**
 * app/api/admin/inbox/attachments/[id]/route.js
 * GET /api/admin/inbox/attachments/:id
 * Download an attachment by its attachment id.
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

export async function GET(req, { params }) {
  const user = getUser(req)
  if (!user) return NextResponse.json({ ok: false, msg: 'Unauthorised.' }, { status: 401 })

  const { id } = params

  try {
    const database = db()

    // Get the attachment record
    let row
    try {
      row = database.prepare('SELECT * FROM message_attachments WHERE id = ?').get(id)
    } catch(e) {
      return NextResponse.json({ ok: false, msg: 'Attachment not found.' }, { status: 404 })
    }

    if (!row) {
      return NextResponse.json({ ok: false, msg: 'Attachment not found.' }, { status: 404 })
    }

    // For non-admin users, verify they are the recipient of the parent message
    if (!user.is_admin) {
      let hasAccess = false

      // Check inbox_messages first (primary source for payslips)
      try {
        const inboxMsg = database.prepare(
          'SELECT id FROM inbox_messages WHERE id = ? AND to_email = ? COLLATE NOCASE LIMIT 1'
        ).get(row.message_id, user.email)
        if (inboxMsg) hasAccess = true
      } catch(e) {}

      // Fall back to sent_emails
      if (!hasAccess) {
        try {
          const email = database.prepare(
            'SELECT from_email, to_email FROM sent_emails WHERE id = ? LIMIT 1'
          ).get(row.message_id)
          if (email) {
            const ue = user.email.toLowerCase()
            hasAccess = email.from_email.toLowerCase() === ue || email.to_email.toLowerCase().includes(ue)
          }
        } catch(e) {}
      }

      if (!hasAccess) {
        return NextResponse.json({ ok: false, msg: 'Access denied.' }, { status: 403 })
      }
    }

    // Return file as download
    const fileData = Buffer.isBuffer(row.data) ? row.data : Buffer.from(row.data)

    return new Response(fileData, {
      status: 200,
      headers: {
        'Content-Type': row.mime_type || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${row.filename}"`,
        'Content-Length': String(fileData.length),
      },
    })
  } catch (err) {
    console.error('[attachments download GET]', err)
    return NextResponse.json({ ok: false, msg: 'Server error.' }, { status: 500 })
  }
}
