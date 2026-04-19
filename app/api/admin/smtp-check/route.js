/**
 * app/api/admin/smtp-check/route.js
 * Protected — superadmin only.
 * GET → verifies the SMTP connection is working.
 * Use this after configuring your .env.local SMTP settings.
 */

import { NextResponse }        from 'next/server'
import { verifyAdminRequest }  from '@/lib/adminAuth'
import { verifySMTP }          from '@/lib/email'

export async function GET(req) {
  const user = verifyAdminRequest(req)
  if (!user || !user.is_admin) {
    return NextResponse.json({ ok: false, msg: 'Superadmin access required.' }, { status: 403 })
  }

  const configured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
  if (!configured) {
    return NextResponse.json({
      ok:      false,
      status:  'not_configured',
      msg:     'SMTP credentials are not set. Add SMTP_HOST, SMTP_USER, and SMTP_PASS to .env.local.',
      provider: null,
    })
  }

  const result = await verifySMTP()

  const providerMap = {
    'smtp.gmail.com':  'Google Workspace',
    'smtp.zoho.com':   'Zoho Mail',
    'smtp.office365.com': 'Microsoft 365',
  }
  const provider = providerMap[process.env.SMTP_HOST] || process.env.SMTP_HOST

  return NextResponse.json({
    ok:       result.ok,
    status:   result.ok ? 'connected' : 'failed',
    provider,
    host:     process.env.SMTP_HOST,
    user:     process.env.SMTP_USER,
    from:     process.env.SMTP_FROM || process.env.SMTP_USER,
    msg:      result.ok
                ? `SMTP connected via ${provider}`
                : `Connection failed: ${result.reason}`,
  })
}
