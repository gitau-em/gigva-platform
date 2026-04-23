import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
const JWT_SECRET = process.env.JWT_SECRET

function verifyToken(req) {
  const auth = req.headers.get('authorization') || ''
  const token = auth.replace('Bearer ', '')
  if (!token) return null
  try { return jwt.verify(token, JWT_SECRET) } catch { return null }
}

function checkAccess(user) {
  return user && ['cto','people_ops','superadmin'].includes(user.role)
}

// GET - list all payroll employees
export async function GET(req) {
  const user = verifyToken(req)
  if (!user || !checkAccess(user)) return NextResponse.json({ ok: false, msg: 'Access denied' }, { status: 403 })
  const { data, error } = await supabase
    .from('payroll_employees')
    .select('*')
    .order('name')
  if (error) return NextResponse.json({ ok: false, msg: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, employees: data })
}

// POST - create new payroll employee
export async function POST(req) {
  const user = verifyToken(req)
  if (!user || !checkAccess(user)) return NextResponse.json({ ok: false, msg: 'Access denied' }, { status: 403 })
  const body = await req.json()
  const { data, error } = await supabase
    .from('payroll_employees')
    .insert([{
      name: body.name,
      employee_id: body.employee_id,
      department: body.department,
      designation: body.designation,
      email: body.email,
      phone: body.phone,
      address: body.address,
      date_employed: body.date_employed || null,
      marital_status: body.marital_status || 'Single',
      id_number: body.id_number,
      bank_name: body.bank_name,
      bank_account: body.bank_account,
      bank_code: body.bank_code,
      basic_pay: parseFloat(body.basic_pay) || 0,
      house_allowance: parseFloat(body.house_allowance) || 0,
      car_benefit: parseFloat(body.car_benefit) || 0,
      other_allowances: parseFloat(body.other_allowances) || 0,
      is_active: true,
    }])
    .select()
    .single()
  if (error) return NextResponse.json({ ok: false, msg: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, employee: data })
}

// PUT - update payroll employee
export async function PUT(req) {
  const user = verifyToken(req)
  if (!user || !checkAccess(user)) return NextResponse.json({ ok: false, msg: 'Access denied' }, { status: 403 })
  const body = await req.json()
  const { id, ...fields } = body
  if (!id) return NextResponse.json({ ok: false, msg: 'ID required' }, { status: 400 })
  const updateData = {}
  const allowed = ['name','employee_id','department','designation','email','phone','address',
    'date_employed','marital_status','id_number','bank_name','bank_account','bank_code',
    'basic_pay','house_allowance','car_benefit','other_allowances','is_active']
  allowed.forEach(k => { if (fields[k] !== undefined) updateData[k] = fields[k] })
  updateData.updated_at = new Date().toISOString()
  const { data, error } = await supabase.from('payroll_employees').update(updateData).eq('id', id).select().single()
  if (error) return NextResponse.json({ ok: false, msg: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, employee: data })
}

// DELETE - deactivate employee
export async function DELETE(req) {
  const user = verifyToken(req)
  if (!user || !checkAccess(user)) return NextResponse.json({ ok: false, msg: 'Access denied' }, { status: 403 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ ok: false, msg: 'ID required' }, { status: 400 })
  const { error } = await supabase.from('payroll_employees').update({ is_active: false }).eq('id', id)
  if (error) return NextResponse.json({ ok: false, msg: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
