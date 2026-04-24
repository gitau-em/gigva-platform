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

// NHIF rates (applicable up to November 2024)
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

// SHIF rates: 2.75% of gross, minimum KES 300 (applicable from December 2024)
function calcSHIF(gross) {
  return Math.max(300, gross * 0.0275)
}

// NSSF 2013 Act - Tier I + Tier II
function calcNSSF(gross) {
  const lel = 6000, uel = 18000
  const tierI = Math.min(gross, lel) * 0.06
  const tierII = Math.max(0, Math.min(gross, uel) - lel) * 0.06
  return { tierI, tierII, total: tierI + tierII }
}

// Affordable Housing Levy: 1.5% of gross
function calcHousingLevy(gross) {
  return gross * 0.015
}

// Determine if payslip should use SHIF (Dec 2024+) or NHIF (up to Nov 2024)
function usesSHIF(month, year) {
  if (year > 2024) return true
  if (year === 2024 && month >= 12) return true
  return false
}

export async function POST(req) {
  const auth = req.headers.get('authorization') || ''
  const user = verifyToken(auth.replace('Bearer ','').trim())
  if (!user || !checkAccess(user)) return NextResponse.json({ ok: false, msg: 'Access denied' }, { status: 403 })
  try {
    const b = await req.json()
    const month = parseInt(b.period_month), year = parseInt(b.period_year)
    const basic = parseFloat(b.basic_pay)||0
    const house = parseFloat(b.house_allowance)||0
    const car = parseFloat(b.car_benefit)||0
    const other = parseFloat(b.other_allowances)||0
    const pension = parseFloat(b.pension_provident)||0
    const mi = parseFloat(b.hosp_mortgage_interest)||0

    const grossPay = basic + house + car + other
    const nssfResult = calcNSSF(grossPay)
    const nssf = nssfResult.total
    const housingLevy = calcHousingLevy(grossPay)

    // Date-based health insurance deduction
    const shifApplies = usesSHIF(month, year)
    const healthDeduction = shifApplies ? calcSHIF(grossPay) : calcNHIF(grossPay)
    const shif = shifApplies ? healthDeduction : 0
    const nhif = shifApplies ? 0 : healthDeduction

    const grossTaxable = grossPay + house
    const netTaxable = Math.max(0, grossTaxable - nssf - pension - mi)
    const payeGross = calcPAYE(netTaxable)
    const personalRelief = 2400
    const netTax = Math.max(0, payeGross - personalRelief)
    const totalDeductions = nssf + netTax + healthDeduction + housingLevy + pension + mi
    const netPay = grossPay - totalDeductions

    const periodStart = b.period_start || ''
    const periodEnd = b.period_end || ''
    const now = new Date().toISOString()
    const slipRef = 'GV-' + year + '-' + String(month).padStart(2,'0') + '-' + Math.random().toString(36).substring(2,7).toUpperCase()

    const result = db().prepare(`INSERT INTO payroll_payslips
       (employee_id, period_month, period_year, period_start, period_end,
        basic_pay, house_allowance, car_benefit, other_allowances, gross_pay,
        nssf, nssf_tier1, nssf_tier2, shif, housing_levy,
        pension_provident, hosp_mortgage_interest,
        gross_taxable, net_taxable, paye, personal_relief, net_tax, nhif,
        total_deductions, net_pay,
        leave_balance_days, leave_from, leave_to, leave_days_taken,
        notes, slip_ref, generated_by, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(b.employee_id, month, year, periodStart, periodEnd,
           basic, house, car, other,
           grossPay, nssf, nssfResult.tierI, nssfResult.tierII, shif, housingLevy,
           pension, mi, grossTaxable, netTaxable, payeGross, personalRelief,
           netTax, nhif, totalDeductions, netPay,
           parseInt(b.leave_balance_days)||0, b.leave_from||'',
           b.leave_to||'', parseInt(b.leave_days_taken)||0, b.notes||'', slipRef,
           user.name||user.email, now)

    const slip = db().prepare(`SELECT p.*, e.name as emp_name, e.email as emp_email, e.department as emp_department,
      e.designation as emp_designation, e.employee_id as emp_employee_id, e.address as emp_address,
      e.bank_account as emp_bank_account, e.bank_name as emp_bank_name, e.bank_code as emp_bank_code,
      e.marital_status as emp_marital_status,
      e.date_employed as emp_date_employed, e.phone as emp_phone
      FROM payroll_payslips p LEFT JOIN payroll_employees e ON p.employee_id = e.id
      WHERE p.slip_ref = ?`).get(slipRef)

    if (!slip) return NextResponse.json({ ok: false, msg: 'Failed to retrieve saved payslip' }, { status: 500 })
    const { emp_name, emp_email, emp_department, emp_designation, emp_employee_id, emp_address,
            emp_bank_account, emp_bank_name, emp_bank_code,
            emp_marital_status, emp_date_employed, emp_phone, ...slipData } = slip
    return NextResponse.json({ ok: true, payslip: { ...slipData,
      payroll_employees: { name: emp_name, email: emp_email, department: emp_department,
        designation: emp_designation, employee_id: emp_employee_id, address: emp_address,
        bank_account: emp_bank_account, bank_name: emp_bank_name, bank_code: emp_bank_code,
        marital_status: emp_marital_status, date_employed: emp_date_employed, phone: emp_phone } } })
  } catch(e) { return NextResponse.json({ ok: false, msg: e.message }, { status: 500 }) }
}

export async function GET(req) {
  const auth = req.headers.get('authorization') || ''
  const user = verifyToken(auth.replace('Bearer ','').trim())
  if (!user || !checkAccess(user)) return NextResponse.json({ ok: false, msg: 'Access denied' }, { status: 403 })
  try {
    const { searchParams } = new URL(req.url)
    const empId = searchParams.get('employee_id')
    if (!empId) return NextResponse.json({ ok: false, msg: 'employee_id required' }, { status: 400 })
    const slips = db().prepare(`SELECT p.*, e.name as emp_name, e.email as emp_email, e.department as emp_department,
      e.designation as emp_designation, e.employee_id as emp_employee_id
      FROM payroll_payslips p LEFT JOIN payroll_employees e ON p.employee_id = e.id
      WHERE p.employee_id = ? ORDER BY p.period_year DESC, p.period_month DESC`).all(empId)
    return NextResponse.json({ ok: true, payslips: slips })
  } catch(e) { return NextResponse.json({ ok: false, msg: e.message }, { status: 500 }) }
}

export async function DELETE(req) {
  const auth = req.headers.get('authorization') || ''
  const user = verifyToken(auth.replace('Bearer ','').trim())
  if (!user || !checkAccess(user)) return NextResponse.json({ ok: false, msg: 'Access denied' }, { status: 403 })
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ ok: false, msg: 'id required' }, { status: 400 })
    db().prepare('DELETE FROM payroll_payslips WHERE id = ?').run(id)
    return NextResponse.json({ ok: true })
  } catch(e) { return NextResponse.json({ ok: false, msg: e.message }, { status: 500 }) }
}

