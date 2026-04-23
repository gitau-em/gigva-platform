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

export async function POST(req) {
  const user = verifyToken(req)
  if (!user) return NextResponse.json({ ok: false, msg: 'Unauthorized' }, { status: 401 })
  if (!['cto','people_ops','superadmin'].includes(user.role))
    return NextResponse.json({ ok: false, msg: 'Access denied' }, { status: 403 })

  // Create payroll_employees table
  await supabase.rpc('exec_sql', { sql: `
    CREATE TABLE IF NOT EXISTS payroll_employees (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      employee_id TEXT UNIQUE,
      department TEXT,
      designation TEXT,
      email TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      date_employed DATE,
      marital_status TEXT DEFAULT 'Single',
      id_number TEXT,
      bank_name TEXT,
      bank_account TEXT,
      bank_code TEXT,
      basic_pay NUMERIC(12,2) DEFAULT 0,
      house_allowance NUMERIC(12,2) DEFAULT 0,
      car_benefit NUMERIC(12,2) DEFAULT 0,
      other_allowances NUMERIC(12,2) DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    )
  `}).catch(() => null)

  // Create payroll_payslips table
  await supabase.rpc('exec_sql', { sql: `
    CREATE TABLE IF NOT EXISTS payroll_payslips (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      employee_id UUID REFERENCES payroll_employees(id),
      period_month INTEGER NOT NULL,
      period_year INTEGER NOT NULL,
      period_start DATE,
      period_end DATE,
      basic_pay NUMERIC(12,2) DEFAULT 0,
      house_allowance NUMERIC(12,2) DEFAULT 0,
      car_benefit NUMERIC(12,2) DEFAULT 0,
      other_allowances NUMERIC(12,2) DEFAULT 0,
      gross_pay NUMERIC(12,2) DEFAULT 0,
      nssf NUMERIC(12,2) DEFAULT 0,
      pension_provident NUMERIC(12,2) DEFAULT 0,
      hosp_mortgage_interest NUMERIC(12,2) DEFAULT 0,
      gross_taxable NUMERIC(12,2) DEFAULT 0,
      net_taxable NUMERIC(12,2) DEFAULT 0,
      paye NUMERIC(12,2) DEFAULT 0,
      personal_relief NUMERIC(12,2) DEFAULT 0,
      net_tax NUMERIC(12,2) DEFAULT 0,
      nhif NUMERIC(12,2) DEFAULT 0,
      net_pay NUMERIC(12,2) DEFAULT 0,
      leave_balance_days INTEGER DEFAULT 0,
      leave_from DATE,
      leave_to DATE,
      leave_days_taken INTEGER DEFAULT 0,
      notes TEXT,
      slip_ref TEXT,
      generated_by TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `}).catch(() => null)

  return NextResponse.json({ ok: true, msg: 'Payroll tables ready' })
}
