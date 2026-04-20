/**
 * lib/email.js
 * Email delivery via Resend HTTP API.
 * Domain gigva.co.ke is verified — all emails send from noreply@gigva.co.ke
 */

import { Resend } from 'resend'

let _resend = null

function getClient() {
    if (_resend) return _resend
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
          throw new Error('RESEND_API_KEY environment variable is not set.')
    }
    _resend = new Resend(apiKey)
    return _resend
}

/**
 * sendEmail({ to, subject, html, text, from? })
 * Sends an email using Resend.
 * Returns { ok: true, id } on success or { ok: false, error } on failure.
 */
export async function sendEmail({ to, subject, html, text, from }) {
    const sender = from || 'Gigva Kenya <noreply@gigva.co.ke>'
    const recipients = Array.isArray(to) ? to : [to]

  try {
        const resend = getClient()
        const result = await resend.emails.send({
                from:    sender,
                to:      recipients,
                subject: subject,
                html:    html || '',
                text:    text || '',
        })

      if (result.error) {
              console.error('[email] Resend error:', result.error)
              return { ok: false, error: result.error }
      }

      console.log('[email] sent:', result.data?.id, '+', recipients)
        return { ok: true, id: result.data?.id }
  } catch (err) {
        console.error('[email] sendEmail failed:', err)
        return { ok: false, error: err.message }
  }
}
