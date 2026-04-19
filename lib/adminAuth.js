/**
 * lib/adminAuth.js
 * Verifies that a request carries a valid admin JWT.
 * Returns the decoded payload or null if invalid / not admin.
 */

import { verifyToken } from './auth'

export function verifyAdminRequest(req) {
  const auth  = req.headers.get('authorization') || ''
  const token = auth.replace(/^Bearer\s+/i, '').trim()
  if (!token) return null

  try {
    const payload = verifyToken(token)
    if (!payload || !payload.is_admin) return null
    return payload
  } catch {
    return null
  }
}
