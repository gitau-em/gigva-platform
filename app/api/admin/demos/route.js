/**
 * app/api/admin/demos/route.js
 * Protected endpoint — requires a valid admin JWT.
 * GET   → list demos/trials. ?source=demo|trial|all (default all)
 * PATCH → update status / notes     { id, status?, notes? }
 * DELETE→ delete one or many        { ids: string[] }
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
    const { searchParams } = new URL(req.url)
    const source = searchParams.get('source') // 'demo' | 'trial' | null → all

    let rows
    if (source === 'demo' || source === 'trial') {
      rows = db()
        .prepare('SELECT * FROM demos WHERE source = ? ORDER BY created_at DESC')
        .all(source)
    } else {
      rows = db()
        .prepare('SELECT * FROM demos ORDER BY created_at DESC')
        .all()
    }

    const mapped = rows.map(d => ({
      ...d,
      interests: (() => { try { return JSON.parse(d.interests || '[]') } catch { return [] } })(),
    }))

    return NextResponse.json({ ok: true, demos: mapped })
  } catch (e) {
    console.error('[admin/demos GET]', e)
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

    db().prepare(`UPDATE demos SET ${sets.join(', ')} WHERE id = ?`).run(...values)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[admin/demos PATCH]', e)
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
    db().prepare(`DELETE FROM demos WHERE id IN (${placeholders})`).run(...ids)
    return NextResponse.json({ ok: true, deleted: ids.length })
  } catch (e) {
    console.error('[admin/demos DELETE]', e)
    return NextResponse.json({ ok: false, msg: 'Server error.' }, { status: 500 })
  }
}
