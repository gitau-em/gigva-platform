/**
 * lib/auth.js
 * bcrypt password hashing and JWT signing — server-side only.
 */

import bcrypt from 'bcrypt'
import jwt    from 'jsonwebtoken'

const SALT_ROUNDS = 12
const JWT_EXPIRY  = process.env.JWT_EXPIRY  || '7d'

// In production, refuse to start if JWT_SECRET is not properly set
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET || JWT_SECRET === 'replace_with_64_byte_random_hex') {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('[auth] FATAL: JWT_SECRET env var is not set. Set a 64-byte random hex string in your environment before deploying.')
  }
  console.warn('[auth] WARNING: JWT_SECRET is not set. Using insecure dev fallback. Set it in .env.local.')
}
const SECRET = JWT_SECRET || 'dev_secret_CHANGE_IN_PRODUCTION'

export async function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS)
}

export async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash)
}

export function signToken(user) {
  return jwt.sign(
    {
      id:       user.id,
      name:     user.name,
      email:    user.email,
      role:     user.role     || '',
      is_admin: user.is_admin || 0,
    },
    SECRET,
    { expiresIn: JWT_EXPIRY }
  )
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET)
}
