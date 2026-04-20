/**
 * app/api/inbound/route.js
 * Resend inbound email webhook — receives email.received events.
 * Configure in Resend dashboard: Webhooks > Add webhook > email.received
 */

import { NextResponse } from 'next/server'
import { db }           from '@/lib/db'
import crypto           from 'crypto'

const WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET || ''

function verifySignature(rawBody, headers) {
   if (!WEBHOOK_SECRET) return true
   try {
        const svixId        = headers.get('svix-id') || ''
        const svixTimestamp = headers.get('svix-timestamp') || ''
        const svixSignature = headers.get('svix-signature') || ''
        if (!svixId || !svixTimestamp || !svixSignature) return false
        const toSign   = `${svixId}.${svixTimestamp}.${rawBody}`
        const expected = crypto.createHmac('sha256', WEBHOOK_SECRET).update(toSign).digest('base64')
        return svixSignature.split(' ').some(sig => sig.split(',')[1] === expected)
   } catch {
        return false
   }
}

export async function POST(req) {
   try {
        const rawBody = await req.text()
        if (!verifySignature(rawBody, req.headers)) {
               console.warn('[inbound] Invalid webhook signature')
               return NextResponse.json({ ok: false, msg: 'Forbidden.' }, { status: 403 })
        }

     let event
        try { event = JSON.parse(rawBody) } catch {
               return NextResponse.json({ ok: false, msg: 'Invalid JSON.' }, { status: 400 })
        }

     if (event.type !== 'email.received') {
            return NextResponse.json({ ok: true, skipped: true })
     }

     const data     = event.data || {}
          const fromRaw  = data.from    || ''
        const toRaw    = data.to      || []
             const subject  = data.subject || '(no subject)'
        const bodyText = data.text    || ''
        const bodyHtml = data.html    || ''

     const fromMatch = fromRaw.match(/^(.*?)\s*<(.+?)>$/)
        const fromName  = fromMatch ? fromMatch[1].trim() : ''
        const fromEmail = fromMatch ? fromMatch[2].trim() : fromRaw.trim()

     const toEmails = Array.isArray(toRaw) ? toRaw : String(toRaw).split(',').map(e => e.trim())

     const insert = db().prepare(`
           INSERT INTO inbox_messages (id, to_email, from_email, from_name, subject, body_text, body_html, is_read)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 0)
                     `)

     for (const toEntry of toEmails) {
            const m       = toEntry.match(/^(.*?)\s*<(.+?)>$/)
            const toEmail = ((m ? m[2] : toEntry) || '').trim().toLowerCase()
            if (!toEmail) continue
            const id = crypto.randomBytes(8).toString('hex')
            insert.run(id, toEmail, fromEmail, fromName, subject, bodyText, bodyHtml)
            console.log(`[inbound] stored: to=${toEmail} from=${fromEmail} "${subject}"`)
     }

     return NextResponse.json({ ok: true })
   } catch (e) {
        console.error('[inbound POST]', e)
        return NextResponse.json({ ok: false, msg: 'Server error.' }, { status: 500 })
   }
}

export async function GET() {
   return NextResponse.json({ ok: true, service: 'gigva-inbound-webhook' })
}
