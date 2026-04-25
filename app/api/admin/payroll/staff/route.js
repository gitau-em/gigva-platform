import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/db'

function checkAccess(user) {
  return user && ['cto','people_ops','superadmin'].includes(user.role)
}

// Auto-assign employee IDs (GV-YYYY-NNN) to any employees that lack one
function backfillEmployeeIds(database) {
  try {
    const staff = database.prepare("SELECT id FROM payroll_employees WHERE employee_id IS NULL OR employee_id = '' ORDER BY id").all()
    if (staff.length === 0) return
    const year = new Date().getFullYear()
    // Get the highest existing numeric suffix for GV-YYYY- IDs
    const existing = database.prepare("SELECT employee_id FROM payroll_employees WHERE employee_id LIKE 'GV-%'").all()
    let maxNum = 0
    existing.forEach(r => {
      const parts = (r.employee_id || '').split('-')
      const n = parseInt(parts[parts.length - 1], 10)
      if (!isNaN(n) && n > maxNum) maxNum = n
    })
    const stmt = database.prepare("UPDATE payroll_employees SET employee_id = ? WHERE id = ?")
    staff.forEach((emp, i) => {
      maxNum++
      const empId = 'GV-' + year + '-' + String(maxNum).padStart(3, '0')
      stmt.run(empId, emp.id)
    })
  } catch(e) {
    console.error('[staff/route] backfillEmployeeIds error:', e.message)
  }
}

export async function GET(req) {
  const auth = req.headers.get('authorization') || ''
  const user = verifyToken(auth.replace('Bearer ','').trim())
  if (!user || !checkAccess(user)) return NextResponse.json({ ok: false, msg: 'Access denied' }, { status: 403 })
  try {
    const database = db()
    backfillEmployeeIds(database)
    const employees = database.prepare('SELECT * FROM payroll_employees ORDER BY name').all()
    return NextResponse.json({ ok: true, employees })
  } catch(e) { return NextResponse.json({ ok: false, msg: e.message }, { status: 500 }) }
}

export async function POST(req) {
  const auth = req.headers.get('authorization') || ''
  const user = verifyToken(auth.replace('Bearer ','').trim())
  if (!user || !checkAccess(user)) return NextResponse.json({ ok: false, msg: 'Access denied' }, { status: 403 })
  try {
    const b = await req.json()
    const now = new Date().toISOString()
    // Auto-generate employee ID if not provided
    let empId = b.employee_id || null
    if (!empId) {
      const database = db()
      const year = new Date().getFullYear()
      const existing = database.prepare("SELECT employee_id FROM payroll_employees WHERE employee_id LIKE 'GV-%'").all()
      let maxNum = 0
      existing.forEach(r => {
        const parts = (r.employee_id || '').split('-')
        const n = parseInt(parts[parts.length - 1], 10)
        if (!isNaN(n) && n > maxNum) maxNum = n
      })
      maxNum++
      empId = 'GV-' + year + '-' + String(maxNum).padStart(3, '0')
    }
    const result = db().prepare(`INSERT INTO payroll_employees 
      (name, employee_id, department, designation, email, phone, address, date_employed, marital_status, id_number,
       bank_name, bank_account, bank_code, basic_pay, house_allowance, car_benefit, other_allowances, is_active, created_at, updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,?,?)`)
      .run(b.name, empId, b.department||'', b.designation||'', b.email, b.phone||'',
           b.address||'', b.date_employed||'', b.marital_status||'Single', b.id_number||'',
           b.bank_name||'', b.bank_account||'', b.bank_code||'',
           parseFloat(b.basic_pay)||0, parseFloat(b.house_allowance)||0,
           parseFloat(b.car_benefit)||0, parseFloat(b.other_allowances)||0, now, now)
    const employee = db().prepare('SELECT * FROM payroll_employees WHERE rowid=?').get(result.lastInsertRowid)
    return NextResponse.json({ ok: true, employee })
  } catch(e) { return NextResponse.json({ ok: false, msg: e.message }, { status: 500 }) }
}

export async function PUT(req) {
  const auth = req.headers.get('authorization') || ''
  const user = verifyToken(auth.replace('Bearer ','').trim())
  if (!user || !checkAccess(user)) return NextResponse.json({ ok: false, msg: 'Access denied' }, { status: 403 })
  try {
    const b = await req.json()
    const { id, ...fields } = b
    if (!id) return NextResponse.json({ ok: false, msg: 'ID required' }, { status: 400 })
    const now = new Date().toISOString()
    db().prepare(`UPDATE payroll_employees SET
      name=?, employee_id=?, department=?, designation=?, email=?, phone=?, address=?,
      date_employed=?, marital_status=?, id_number=?, bank_name=?, bank_account=?, bank_code=?,
      basic_pay=?, house_allowance=?, car_benefit=?, other_allowances=?, is_active=?, updated_at=?
      WHERE id=?`)
      .run(fields.name||'', fields.employee_id||null, fields.department||'', fields.designation||'',
           fields.email||'', fields.phone||'', fields.address||'', fields.date_employed||'',
           fields.marital_status||'Single', fields.id_number||'', fields.bank_name||'',
           fields.bank_account||'', fields.bank_code||'',
           parseFloat(fields.basic_pay)||0, parseFloat(fields.house_allowance)||0,
           parseFloat(fields.car_benefit)||0, parseFloat(fields.other_allowances)||0,
           fields.is_active !== false ? 1 : 0, now, id)
    const employee = db().prepare('SELECT * FROM payroll_employees WHERE id=?').get(id)
    return NextResponse.json({ ok: true, employee })
  } catch(e) { return NextResponse.json({ ok: false, msg: e.message }, { status: 500 }) }
}

export async function DELETE(req) {
  const auth = req.headers.get('authorization') || ''
  const user = verifyToken(auth.replace('Bearer ','').trim())
  if (!user || !checkAccess(user)) return NextResponse.json({ ok: false, msg: 'Access denied' }, { status: 403 })
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ ok: false, msg: 'ID required' }, { status: 400 })
    db().prepare('UPDATE payroll_employees SET is_active=0 WHERE id=?').run(id)
    return NextResponse.json({ ok: true })
  } catch(e) { return NextResponse.json({ ok: false, msg: e.message }, { status: 500 }) }
}
