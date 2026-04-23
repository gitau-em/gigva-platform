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

// Kenyan PAYE tax bands (2024/2025)
function calcPAYE(taxable) {
  let tax = 0
  if (taxable <= 24000) tax = taxable * 0.10
  else if (taxable <= 32333) tax = 2400 + (taxable - 24000) * 0.25
  else if (taxable <= 500000) tax = 2400 + 2083.25 + (taxable - 32333) * 0.30
  else if (taxable <= 800000) tax = 2400 + 2083.25 + 140300.1 + (taxable - 500000) * 0.325
  else tax = 2400 + 2083.25 + 140300.1 + 97500 + (taxable - 800000) * 0.35
  return Math.max(0, tax)
}

// NHIF rates (Kenya)
function calcNHIF(gross) {
  if (gross < 5999) return 150
  if (gross < 7999) return 300
  if (gross < 11999) return 400
  if (gross < 14999) return 500
  if (gross < 19999) return 600
  if (gross < 24999) return 750
  if (gross < 29999) return 850
  if (gross < 34999) return 900
  if (gross < 39999) return 950
  if (gross < 44999) return 1000
  if (gross < 49999) return 1100
  if (gross < 59999) return 1200
  if (gross < 69999) return 1300
  if (gross < 79999) return 1400
  if (gross < 89999) return 1500
  if (gross < 99999) return 1600
  return 1700
}

// GET - list payslips, optional ?employee_id=xxx or ?id=xxx
export async function GET(req) {
  const user = verifyToken(req)
  if (!user || !checkAccess(user)) return NextResponse.json({ ok: false, msg: 'Access denied' }, { status: 403 })
  const { searchParams } = new URL(req.url)
  const empId = searchParams.get('employee_id')
  const slipId = searchParams.get('id')
  let query = supabase.from('payroll_payslips').select('*, payroll_employees(name, email, department, designation, employee_id, address, id_number, bank_name, bank_account, bank_code, marital_status, date_employed, phone)').order('period_year', { ascending: false }).order('period_month', { ascending: false })
  if (empId) query = query.eq('employee_id', empId)
  if (slipId) query = query.eq('id', slipId).single()
  const { data, error } = await query
  if (error) return NextResponse.json({ ok: false, msg: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, payslips: slipId ? [data] : data })
}

// POST - generate/save a payslip
export async function POST(req) {
  const user = verifyToken(req)
  if (!user || !checkAccess(user)) return NextResponse.json({ ok: false, msg: 'Access denied' }, { status: 403 })
  const body = await req.json()

  const basic = parseFloat(body.basic_pay) || 0
  const house = parseFloat(body.house_allowance) || 0
  const car = parseFloat(body.car_benefit) || 0
  const other = parseFloat(body.other_allowances) || 0
  const pension = parseFloat(body.pension_provident) || 0
  const mortgageInterest = parseFloat(body.hosp_mortgage_interest) || 0

  const grossPay = basic + house + car + other
  const nssf = Math.min(grossPay * 0.06, 1080) // NSSF upper limit
  const grossTaxable = grossPay + house // simplified
  const netTaxable = grossTaxable - nssf - pension - mortgageInterest
  const payeGross = calcPAYE(netTaxable)
  const personalRelief = 2400
  const netTax = Math.max(0, payeGross - personalRelief)
  const nhif = calcNHIF(grossPay)
  const netPay = grossPay - nssf - netTax - nhif

  const month = parseInt(body.period_month)
  const year = parseInt(body.period_year)
  const periodStart = new Date(year, month - 1, 1).toISOString().split('T')[0]
  const periodEnd = new Date(year, month, 0).toISOString().split('T')[0]
  const slipRef = 'SLIP/' + String(body.slip_number || 1).padStart(3,'0')

  const { data, error } = await supabase.from('payroll_payslips').insert([{
    employee_id: body.employee_id,
    period_month: month,
    period_year: year,
    period_start: periodStart,
    period_end: periodEnd,
    basic_pay: basic,
    house_allowance: house,
    car_benefit: car,
    other_allowances: other,
    gross_pay: grossPay,
    nssf,
    pension_provident: pension,
    hosp_mortgage_interest: mortgageInterest,
    gross_taxable: grossTaxable,
    net_taxable: netTaxable,
    paye: payeGross,
    personal_relief: personalRelief,
    net_tax: netTax,
    nhif,
    net_pay: netPay,
    leave_balance_days: parseInt(body.leave_balance_days) || 0,
    leave_from: body.leave_from || null,
    leave_to: body.leave_to || null,
    leave_days_taken: parseInt(body.leave_days_taken) || 0,
    notes: body.notes || null,
    slip_ref: slipRef,
    generated_by: user.name || user.email,
  }]).select('*, payroll_employees(name, email, department, designation, employee_id, address, id_number, bank_name, bank_account, bank_code, marital_status, date_employed, phone)').single()

  if (error) return NextResponse.json({ ok: false, msg: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, payslip: data })
}

// DELETE - delete a payslip
export async function DELETE(req) {
  const user = verifyToken(req)
  if (!user || !checkAccess(user)) return NextResponse.json({ ok: false, msg: 'Access denied' }, { status: 403 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ ok: false, msg: 'ID required' }, { status: 400 })
  const { error } = await supabase.from('payroll_payslips').delete().eq('id', id)
  if (error) return NextResponse.json({ ok: false, msg: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
