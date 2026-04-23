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

const INITIAL_STAFF = [
  { name: 'Mwangi Kamau', employee_id: 'GVA-001', department: 'Executive', designation: 'Chief Executive Officer', email: 'ceo@gigva.co.ke', date_employed: '2012-01-01', marital_status: 'Single', basic_pay: 250000, house_allowance: 30000, car_benefit: 20000 },
  { name: 'Aisha Waweru', employee_id: 'GVA-002', department: 'Technology', designation: 'Chief Technology Officer', email: 'cto@gigva.co.ke', date_employed: '2012-01-01', marital_status: 'Single', basic_pay: 220000, house_allowance: 25000, car_benefit: 15000 },
  { name: 'Samuel Otieno', employee_id: 'GVA-003', department: 'Customer Success', designation: 'Head of Customer Success', email: 'samuel.otieno@gigva.co.ke', date_employed: '2012-03-01', marital_status: 'Married', basic_pay: 150000, house_allowance: 20000, car_benefit: 10000 },
  { name: 'Njeri Mwangi', employee_id: 'GVA-004', department: 'Product', designation: 'Product Manager', email: 'njeri.mwangi@gigva.co.ke', date_employed: '2013-06-01', marital_status: 'Single', basic_pay: 140000, house_allowance: 15000, car_benefit: 0 },
  { name: 'Edward Gitau', employee_id: 'GVA-005', department: 'Engineering', designation: 'Lead Engineer', email: 'edward.gitau@gigva.co.ke', date_employed: '2013-06-01', marital_status: 'Single', basic_pay: 135000, house_allowance: 15000, car_benefit: 0 },
  { name: 'Daniel Njoroge', employee_id: 'GVA-006', department: 'Operations', designation: 'Operations Lead', email: 'daniel.njoroge@gigva.co.ke', date_employed: '2014-01-01', marital_status: 'Married', basic_pay: 120000, house_allowance: 12000, car_benefit: 0 },
  { name: 'James Odhiambo', employee_id: 'GVA-007', department: 'Finance', designation: 'Finance Manager', email: 'james.odhiambo@gigva.co.ke', date_employed: '2014-03-01', marital_status: 'Single', basic_pay: 125000, house_allowance: 12000, car_benefit: 0 },
  { name: 'Fatuma Kamau', employee_id: 'GVA-008', department: 'People & Culture', designation: 'People & Culture Manager', email: 'fatuma.kamau@gigva.co.ke', date_employed: '2014-06-01', marital_status: 'Married', basic_pay: 120000, house_allowance: 11750, car_benefit: 0 },
]

export async function POST(req) {
  const user = verifyToken(req)
  if (!user) return NextResponse.json({ ok: false, msg: 'Unauthorized' }, { status: 401 })
  if (!['cto','people_ops','superadmin'].includes(user.role))
    return NextResponse.json({ ok: false, msg: 'Access denied' }, { status: 403 })

  // Check if any employees already exist
  const { data: existing } = await supabase.from('payroll_employees').select('id').limit(1)
  if (existing && existing.length > 0) {
    return NextResponse.json({ ok: true, msg: 'Already seeded', count: existing.length })
  }

  // Insert initial staff
  const { data, error } = await supabase.from('payroll_employees').insert(
    INITIAL_STAFF.map(s => ({ ...s, other_allowances: 0, is_active: true }))
  ).select()

  if (error) return NextResponse.json({ ok: false, msg: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, msg: 'Seeded successfully', count: data.length })
}
