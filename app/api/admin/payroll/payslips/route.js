import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/db'

function checkAccess(user) {
  return user && ['cto','people_ops','superadmin'].includes(user.role)
}

function calcPAYE(taxable) {
  let tax = 0
  if (taxable <= 24000) tax = taxable * 0.10
  else if (taxable <= 32333) tax = 2400 + (taxable - 24000) * 0.25
  else if (taxable <= 500000) tax = 2400 + 2083.25 + (taxable - 32333) * 0.30
  else if (taxable <= 800000) tax = 2400 + 2083.25 + 140300.1 + (taxable - 500000) * 0.325
  else tax = 2400 + 2083.25 + 140300.1 + 97500 + (taxable - 800000) * 0.35
  return Math.max(0, tax)
}

function calcNHIF(gross) {
  if (gross < 5999) return 150; if (gross < 7999) return 300; if (gross < 11999) return 400
  if (gross < 14999) return 500; if (gross < 19999) return 600; if (gross < 24999) return 750
  if (gross < 29999) return 850; if (gross < 34999) return 900; if (gross < 39999) return 950
  if (gross < 44999) return 1000; if (gross < 49999) return 1100; if (gross < 59999) return 1200
  if (gross < 69999) return 1300; if (gross < 79999) return 1400; if (gross < 89999) return 1500
  if (gross < 99999) return 1600; return 1700
}

export async function GET(req) {
  const auth = req.headers.get('authorization') || ''
  const user = verifyToken(auth.replace('Bearer ','').trim())
  if (!user || !checkAccess(user)) return NextResponse.json({ ok: false, msg: 'Access denied' }, { status: 403 })
  try {
    const { searchParams } = new URL(req.url)
    const empId = searchParams.get('employee_id')
    const slipId = searchParams.get('id')
    let query = `SELECT p.*, e.name as emp_name, e.email as emp_email, e.department as emp_department,
      e.designation as emp_designation, e.employee_id as emp_employee_id, e.address as emp_address,
      e.id_number as emp_id_number, e.bank_name as emp_bank_name, e.bank_account as emp_bank_account,
      e.bank_code as emp_bank_code, e.marital_status as emp_marital_status,
      e.date_employed as emp_date_employed, e.phone as emp_phone
      FROM payroll_payslips p LEFT JOIN payroll_employees e ON p.employee_id = e.id`
    const params = []
    if (empId) { query += ' WHERE p.employee_id=?'; params.push(empId) }
    else if (slipId) { query += ' WHERE p.id=?'; params.push(slipId) }
    query += ' ORDER BY p.period_year DESC, p.period_month DESC'
    const payslips = db().prepare(query).all(...params)
    // Transform to include employee object
    const formatted = payslips.map(row => {
      const { emp_name, emp_email, emp_department, emp_designation, emp_employee_id,
              emp_address, emp_id_number, emp_bank_name, emp_bank_account, emp_bank_code,
              emp_marital_status, emp_date_employed, emp_phone, ...slip } = row
      return { ...slip, payroll_employees: { name: emp_name, email: emp_email, department: emp_department,
        designation: emp_designation, employee_id: emp_employee_id, address: emp_address,
        id_number: emp_id_number, bank_name: emp_bank_name, bank_account: emp_bank_account,
        bank_code: emp_bank_code, marital_status: emp_marital_status, date_employed: emp_date_employed,
        phone: emp_phone } }
    })
    return NextResponse.json({ ok: true, payslips: formatted })
  } catch(e) { return NextResponse.json({ ok: false, msg: e.message }, { status: 500 }) }
}

export async function POST(req) {
  const auth = req.headers.get('authorization') || ''
  const user = verifyToken(auth.replace('Bearer ','').trim())
  if (!user || !checkAccess(user)) return NextResponse.json({ ok: false, msg: 'Access denied' }, { status: 403 })
  try {
    const b = await req.json()
    const basic = parseFloat(b.basic_pay)||0, house = parseFloat(b.house_allowance)||0
    const car = parseFloat(b.car_benefit)||0, other = parseFloat(b.other_allowances)||0
    const pension = parseFloat(b.pension_provident)||0, mi = parseFloat(b.hosp_mortgage_interest)||0
    const grossPay = basic + house + car + other
    const nssf = Math.min(grossPay * 0.06, 1080)
    const grossTaxable = grossPay + house
    const netTaxable = grossTaxable - nssf - pension - mi
    const payeGross = calcPAYE(netTaxable)
    const personalRelief = 2400
    const netTax = Math.max(0, payeGross - personalRelief)
    const nhif = calcNHIF(grossPay)
    const netPay = grossPay - nssf - netTax - nhif
    const month = parseInt(b.period_month), year = parseInt(b.period_year)
    const periodStart = new Date(year, month-1, 1).toISOString().split('T')[0]
    const periodEnd = new Date(year, month, 0).toISOString().split('T')[0]
    const slipRef = 'SLIP/' + String(b.slip_number||1).padStart(3,'0')
    const now = new Date().toISOString()
    const result = db().prepare(`INSERT INTO payroll_payslips
      (employee_id, period_month, period_year, period_start, period_end, basic_pay, house_allowance,
       car_benefit, other_allowances, gross_pay, nssf, pension_provident, hosp_mortgage_interest,
       gross_taxable, net_taxable, paye, personal_relief, net_tax, nhif, net_pay,
       leave_balance_days, leave_from, leave_to, leave_days_taken, notes, slip_ref, generated_by, created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(b.employee_id, month, year, periodStart, periodEnd, basic, house, car, other,
           grossPay, nssf, pension, mi, grossTaxable, netTaxable, payeGross, personalRelief,
           netTax, nhif, netPay, parseInt(b.leave_balance_days)||0, b.leave_from||'',
           b.leave_to||'', parseInt(b.leave_days_taken)||0, b.notes||'', slipRef,
           user.name||user.email, now)
    const slip = db().prepare(`SELECT p.*, e.name as emp_name, e.email as emp_email, e.department as emp_department,
      e.designation as emp_designation, e.employee_id as emp_employee_id, e.address as emp_address,
      e.id_number as emp_id_number, e.bank_name as emp_bank_name, e.bank_account as emp_bank_account,
      e.bank_code as emp_bank_code, e.marital_status as emp_marital_status,
      e.date_employed as emp_date_employed, e.phone as emp_phone
      FROM payroll_payslips p LEFT JOIN payroll_employees e ON p.employee_id = e.id
      WHERE p.rowid=?`).get(result.lastInsertRowid)
    const { emp_name, emp_email, emp_department, emp_designation, emp_employee_id,
            emp_address, emp_id_number, emp_bank_name, emp_bank_account, emp_bank_code,
            emp_marital_status, emp_date_employed, emp_phone, ...slipData } = slip
    const payslip = { ...slipData, payroll_employees: { name: emp_name, email: emp_email,
      department: emp_department, designation: emp_designation, employee_id: emp_employee_id,
      address: emp_address, id_number: emp_id_number, bank_name: emp_bank_name,
      bank_account: emp_bank_account, bank_code: emp_bank_code, marital_status: emp_marital_status,
      date_employed: emp_date_employed, phone: emp_phone } }
    return NextResponse.json({ ok: true, payslip })
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
    db().prepare('DELETE FROM payroll_payslips WHERE id=?').run(id)
    return NextResponse.json({ ok: true })
  } catch(e) { return NextResponse.json({ ok: false, msg: e.message }, { status: 500 }) }
}
