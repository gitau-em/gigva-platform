/**
 * app/api/admin/inbox/attachments/[id]/route.js
 * GET /api/admin/inbox/attachments/:id
 * Download an attachment from a sent email.
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
    const row = database.prepare(
      'SELECT * FROM message_attachments WHERE id = ?'
    ).get(id)

    if (!row) {
      return NextResponse.json({ ok: false, msg: 'Attachment not found.' }, { status: 404 })
    }

    // For non-admin users, verify they are the recipient or sender of the parent email
    if (!user.is_admin) {
      const email = database.prepare(
        'SELECT from_email, to_email FROM sent_emails WHERE id = ?'
      ).get(row.message_id)

      if (!email) {
        return NextResponse.json({ ok: false, msg: 'Attachment not found.' }, { status: 404 })
      }

      const userEmail = user.email.toLowerCase()
      const isRelated = email.from_email.toLowerCase() === userEmail ||
                        email.to_email.toLowerCase().includes(userEmail)

      if (!isRelated) {
        return NextResponse.json({ ok: false, msg: 'Access denied.' }, { status: 403 })
      }
    }

    // Return the file as a download
    const fileData = Buffer.isBuffer(row.data) ? row.data : Buffer.from(row.data)

    return new Response(fileData, {
      status: 200,
      headers: {
        'Content-Type': row.mime_type || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${row.filename.replace(/"/g, '_')}"`,
        'Content-Length': String(fileData.length),
        'Cache-Control': 'private, no-cache',
      },
    })
  } catch (err) {
    console.error('[attachment GET]', err)
    return NextResponse.json({ ok: false, msg: 'Server error.' }, { status: 500 })
  }
}
