/**
 * app/api/admin/inbox/compose/route.js
 * POST /api/admin/inbox/compose
 * Compose and send a new email via Resend with attachment support (max 25MB total).
 * Stores a record in sent_emails on success.
 * Stores attachment blobs in message_attachments for later download.
 */

import { NextResponse } from 'next/server'
import { Resend }       from 'resend'
import { db }           from '@/lib/db'
import { verifyToken }  from '@/lib/auth'

const resend  = new Resend(process.env.RESEND_API_KEY)
const MAX_BYTES = 25 * 1024 * 1024

function getUser(req) {
  const auth  = req.headers.get('authorization') || ''
  const token = auth.replace(/^Bearer\s+/i, '').trim()
  if (!token) return null
  try { return verifyToken(token) || null } catch { return null }
}

export async function POST(req) {
  const user = getUser(req)
  if (!user) return NextResponse.json({ ok: false, msg: 'Unauthorised.' }, { status: 401 })

  let to = '', cc = '', bcc = '', subject = '', bodyText = ''
  let attachments = []
  let rawFiles = []
  let totalSize = 0

  const ct = req.headers.get('content-type') || ''
  if (ct.includes('multipart/form-data')) {
    const formData = await req.formData()
    to       = formData.get('to')       || ''
    cc       = formData.get('cc')       || ''
    bcc      = formData.get('bcc')      || ''
    subject  = formData.get('subject')  || ''
    bodyText = formData.get('bodyText') || ''
    const files = formData.getAll('attachments')
    for (const file of files) {
      if (file && file.size > 0) {
        totalSize += file.size
        if (totalSize > MAX_BYTES) {
          return NextResponse.json({ ok: false, msg: 'Total attachments exceed 25 MB limit' }, { status: 400 })
        }
        const buffer = await file.arrayBuffer()
        const buf = Buffer.from(buffer)
        attachments.push({ filename: file.name, content: buf })
        rawFiles.push({ filename: file.name, mime_type: file.type || 'application/octet-stream', size: file.size, data: buf })
      }
    }
  } else {
    let body
    try { body = await req.json() } catch {
      return NextResponse.json({ ok: false, msg: 'Invalid body' }, { status: 400 })
    }
    to       = body.to       || ''
    cc       = body.cc       || ''
    bcc      = body.bcc      || ''
    subject  = body.subject  || ''
    bodyText = body.bodyText || ''
  }

  if (!to.trim())       return NextResponse.json({ ok: false, msg: 'Recipient (To) is required' }, { status: 400 })
  if (!subject.trim())  return NextResponse.json({ ok: false, msg: 'Subject is required' }, { status: 400 })
  if (!bodyText.trim()) return NextResponse.json({ ok: false, msg: 'Message body is required' }, { status: 400 })

  const toList  = to.split(',').map(s => s.trim()).filter(Boolean)
  const ccList  = cc  ? cc.split(',').map(s => s.trim()).filter(Boolean)  : undefined
  const bccList = bcc ? bcc.split(',').map(s => s.trim()).filter(Boolean) : undefined

  const fromEmail = user.email
  const escapedBody = bodyText.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  const htmlBody = `<div style="font-family:sans-serif;white-space:pre-wrap;">${escapedBody}</div>`

  let signatureHtml = ''
  try {
    const database = db()
    const sigRow = database.prepare("SELECT html FROM email_signatures WHERE id = 'universal' LIMIT 1").get()
    if (sigRow?.html) signatureHtml = `<br><br><hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0">${sigRow.html}`
  } catch {}

  const fullHtml = htmlBody + signatureHtml

  try {
    const payload = {
      from: fromEmail,
      to:   toList,
      subject,
      html: fullHtml,
      text: bodyText,
      ...(ccList  && ccList.length  ? { cc:  ccList  } : {}),
      ...(bccList && bccList.length ? { bcc: bccList } : {}),
      ...(attachments.length        ? { attachments }  : {}),
    }
    const result = await resend.emails.send(payload)
    const resendId = result?.data?.id || result?.id || ''

    // Store sent email record
    let emailId = ''
    try {
      const database = db()
      emailId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
      database.prepare(
        `INSERT INTO sent_emails (id, from_email, to_email, subject, body_text, body_html, resend_id, sent_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`
      ).run(emailId, fromEmail, toList.join(', '), subject, bodyText, fullHtml, resendId)

      // Store attachments in message_attachments table for download
      if (rawFiles.length > 0) {
        const insertAttach = database.prepare(
          `INSERT INTO message_attachments (id, message_id, message_type, filename, mime_type, size, data)
           VALUES (?, ?, 'sent', ?, ?, ?, ?)`
        )
        for (const f of rawFiles) {
          const attId = Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
          insertAttach.run(attId, emailId, f.filename, f.mime_type, f.size, f.data)
        }
      }
    } catch {}

    return NextResponse.json({ ok: true, resendId })
  } catch (err) {
    console.error('Compose send error:', err)
    return NextResponse.json({ ok: false, msg: err?.message || 'Failed to send' }, { status: 500 })
  }
}
