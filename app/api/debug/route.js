// app/api/debug/route.js
// Temporary debug endpoint: stores raw inbound POST body to DB for inspection
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'

export async function POST(req) {
  const rawBody = await req.text()
  const ct = req.headers.get('content-type') || ''
  const id = crypto.randomBytes(8).toString('hex')
  // Store raw body in inbox_messages for retrieval
  db().prepare(
    `INSERT INTO inbox_messages (id, to_email, from_email, from_name, subject, body_text, body_html, is_read)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0)`
  ).run(id, 'debug@gigva.co.ke', 'debug@resend.com', 'DEBUG', 'RAW INBOUND PAYLOAD (content-type: ' + ct + ')', rawBody.substring(0, 5000), rawBody.substring(5000, 10000))
  console.log('[debug] stored raw body len=' + rawBody.length + ' ct=' + ct)
  return NextResponse.json({ ok: true, id, len: rawBody.length })
}

export async function GET(req) {
  const msgs = db().prepare(
    `SELECT * FROM inbox_messages WHERE to_email = 'debug@gigva.co.ke' ORDER BY created_at DESC LIMIT 5`
  ).all()
  return NextResponse.json({ ok: true, messages: msgs })
}
