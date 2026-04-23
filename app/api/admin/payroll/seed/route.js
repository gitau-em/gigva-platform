import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function POST(req) {
  const auth = req.headers.get('authorization') || ''
  const user = verifyToken(auth.replace('Bearer ','').trim())
  if (!user) return NextResponse.json({ ok: false, msg: 'Unauthorized' }, { status: 401 })
  if (!['cto','people_ops','superadmin'].includes(user.role))
    return NextResponse.json({ ok: false, msg: 'Access denied' }, { status: 403 })
  // Seeding is handled automatically by lib/db.js migration
  return NextResponse.json({ ok: true, msg: 'Seed handled by DB migration' })
}
