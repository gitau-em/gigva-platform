/**
 * app/api/admin/contacts/route.js
 * Protected endpoint — requires a valid admin JWT.
 * GET   → list all contacts
 * PATCH → update status / notes for one contact  { id, status?, notes? }
 * DELETE→ delete one or many contacts             { ids: string[] }
 */

import { NextResponse }        from 'next/server'
import { db }                  from '@/lib/db'
import { verifyAdminRequest }  from '@/lib/adminAuth'

function guard(req) {
  const user = verifyAdminRequest(req)
  if (!user) return NextResponse.json({ ok: false, msg: 'Unauthorised.' }, { status: 401 })
  return null
}

export async function GET(req) {
  const err = guard(req)
  if (err) return err
  try {
    const rows = db()
      .prepare('SELECT * FROM contacts ORDER BY created_at DESC')
      .all()
    return NextResponse.json({ ok: true, contacts: rows })
  } catch (e) {
    console.error('[admin/contacts GET]', e)
    return NextResponse.json({ ok: false, msg: 'Server error.' }, { status: 500 })
  }
}

export async function PATCH(req) {
  const err = guard(req)
  if (err) return err
  try {
    const { id, status, notes } = await req.json()
    if (!id) return NextResponse.json({ ok: false, msg: 'id is required.' }, { status: 400 })

    const sets   = []
    const values = []

    if (status !== undefined) { sets.push('status = ?'); values.push(status) }
    if (notes  !== undefined) { sets.push('notes = ?');  values.push(notes)  }
    if (!sets.length) return NextResponse.json({ ok: false, msg: 'Nothing to update.' }, { status: 400 })

    sets.push("updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')")
    values.push(id)

    db().prepare(`UPDATE contacts SET ${sets.join(', ')} WHERE id = ?`).run(...values)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[admin/contacts PATCH]', e)
    return NextResponse.json({ ok: false, msg: 'Server error.' }, { status: 500 })
  }
}

export async function DELETE(req) {
  const err = guard(req)
  if (err) return err
  try {
    const { ids } = await req.json()
    if (!Array.isArray(ids) || !ids.length) {
      return NextResponse.json({ ok: false, msg: 'ids array is required.' }, { status: 400 })
    }
    const placeholders = ids.map(() => '?').join(',')
    db().prepare(`DELETE FROM contacts WHERE id IN (${placeholders})`).run(...ids)
    return NextResponse.json({ ok: true, deleted: ids.length })
  } catch (e) {
    console.error('[admin/contacts DELETE]', e)
    return NextResponse.json({ ok: false, msg: 'Server error.' }, { status: 500 })
  }
}
