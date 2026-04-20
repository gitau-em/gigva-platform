/**
 * lib/email.js
 * Email delivery via Resend HTTP API.
 * Falls back to onboarding@resend.dev if domain not yet verified.
 */

import { Resend } from 'resend'

let _resend = null

function getClient() {
  if (_resend) return _resend
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY not set')
    return null
  }
  _resend = new Resend(apiKey)
  return _resend
}

// Try sending with given from address; if domain not verified, retry with fallback
async function trySend(client, payload) {
  const { data, error } = await client.emails.send(payload)
  if (error) {
    const msg = error.message || ''
    // If domain not verified, retry with Resend sandbox address
    if (msg.includes('not verified') || msg.includes('validation_error') || msg.includes('domain')) {
      console.warn('[email] domain not verified, retrying with sandbox from:', msg)
      const fallback = { ...payload, from: '"Gigva Kenya" <onboarding@resend.dev>' }
      return await client.emails.send(fallback)
    }
    return { data: null, error }
  }
  return { data, error: null }
}

export async function sendEmail({ to, subject, html, replyTo, text }) {
  const client = getClient()
  if (!client) {
    console.warn('[email] skipping send:', subject)
    return { ok: false, reason: 'resend_not_configured' }
  }
  const from = process.env.SMTP_FROM || '"Gigva Kenya" <noreply@gigva.co.ke>'
  const recipients = Array.isArray(to) ? to : [to]
  try {
    const { data, error } = await trySend(client, {
      from,
      to: recipients,
      reply_to: replyTo,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(),
    })
    if (error) {
      console.error('[email] send failed:', error.message)
      return { ok: false, reason: error.message }
    }
    console.log('[email] sent:', data?.id, '+', recipients)
    return { ok: true, messageId: data?.id }
  } catch (err) {
    console.error('[email] send failed:', err.message)
    return { ok: false, reason: err.message }
  }
}

export async function sendEmailToMany(addresses, { subject, html, replyTo }) {
  if (!addresses?.length) return { sent: 0, failed: 0 }
  const results = await Promise.allSettled(
    addresses.map(addr => sendEmail({ to: addr, subject, html, replyTo }))
  )
  const failed = results.filter(r => r.status === 'rejected' || !r.value?.ok)
  if (failed.length) {
    console.warn('[email] some sends failed:', failed.length, '/', addresses.length)
  }
  return { sent: addresses.length - failed.length, failed: failed.length }
}

export async function verifySMTP() {
  const client = getClient()
  if (!client) return { ok: false, reason: 'resend_not_configured' }
  try {
    const { data, error } = await client.domains.list()
    if (error) return { ok: false, reason: error.message }
    return { ok: true }
  } catch (err) {
    return { ok: false, reason: err.message }
  }
}
