import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/db'

function checkAccess(user) {
  return user && ['cto','people_ops','superadmin'].includes(user.role)
}

// KRA Tax Bands: returns GROSS TAX (before personal relief)
function calcGrossTax(taxable) {
  let tax = 0
  if (taxable <= 0) return 0
  tax += Math.min(taxable, 24000) * 0.10
  if (taxable > 24000) tax += Math.min(taxable - 24000, 32333 - 24000) * 0.25
  if (taxable > 32333) tax += Math.min(taxable - 32333, 500000 - 32333) * 0.30
  if (taxable > 500000) tax += Math.min(taxable - 500000, 800000 - 500000) * 0.325
  if (taxable > 800000) tax += (taxable - 800000) * 0.35
  return Math.round(tax * 100) / 100
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

// SHIF: 2.75% of gross (applicable from December 2024)
function calcSHIF(gross) {
  return Math.round(gross * 0.0275 * 100) / 100
}

// NSSF 2013 Act: Tier I + Tier II. Flat KES 1,080 for gross >= 18,000
function calcNSSF(gross) {
  const lel = 6000, uel = 18000
  const tierI = Math.min(gross, lel) * 0.06
  const tierII = Math.max(0, Math.min(gross, uel) - lel) * 0.06
  return { tierI: Math.round(tierI * 100) / 100, tierII: Math.round(tierII * 100) / 100, total: Math.round((tierI + tierII) * 100) / 100 }
}

// Affordable Housing Levy: 1.5% of gross
function calcHousingLevy(gross) {
  return Math.round(gross * 0.015 * 100) / 100
}

// Determine if SHIF (Dec 2024+) or NHIF applies
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

    // Step 1: Gross Pay
    const grossPay = Math.round((basic + house + car + other) * 100) / 100

    // Step 1: NSSF (flat KES 1,080 for gross >= 18,000)
    const nssfResult = calcNSSF(grossPay)
    const nssf = nssfResult.total

    // Step 1: SHIF/NHIF and AHL
    const shifApplies = usesSHIF(month, year)
    const shif = shifApplies ? calcSHIF(grossPay) : 0
    const nhif = shifApplies ? 0 : calcNHIF(grossPay)
    const healthDeduction = shif || nhif
    const housingLevy = calcHousingLevy(grossPay)

    // Step 2: Taxable Income = Gross Pay - NSSF only (SHIF/AHL do NOT reduce taxable income)
    const taxableIncome = Math.max(0, Math.round((grossPay - nssf) * 100) / 100)

    // Step 3: Gross Tax from KRA bands
    const payeGross = calcGrossTax(taxableIncome)

    // Step 4: Net Tax (PAYE) = Gross Tax - Personal Relief (KES 2,400)
    const personalRelief = 2400
    const netTax = Math.max(0, Math.round((payeGross - personalRelief) * 100) / 100)

    // Step 5: Total Deductions and Net Pay
    const totalDeductions = Math.round((nssf + healthDeduction + housingLevy + netTax + pension + mi) * 100) / 100
    const netPay = Math.round((grossPay - totalDeductions) * 100) / 100

    const periodStart = b.period_start || ''
    const periodEnd = b.period_end || ''
    const now = new Date().toISOString()
    const slipRef = 'GV-' + year + '-' + String(month).padStart(2,'0') + '-' + Math.random().toString(36).substring(2,7).toUpperCase()

    // Leave entitlements (statutory: 25 annual, 10 sick)
    const annualLeaveEntitlement = 25
    const annualLeaveTaken = parseInt(b.annual_leave_taken) || 0
    const annualLeaveBalance = annualLeaveEntitlement - annualLeaveTaken
    const sickLeaveEntitlement = 10
    const sickLeaveTaken = parseInt(b.sick_leave_taken) || 0
    const sickLeaveBalance = sickLeaveEntitlement - sickLeaveTaken
    const leaveFrom = b.leave_from || ''
    const leaveTo = b.leave_to || ''

    const result = db().prepare(`INSERT INTO payroll_payslips
       (employee_id, period_month, period_year, period_start, period_end,
        basic_pay, house_allowance, car_benefit, other_allowances, gross_pay,
        nssf, nssf_tier1, nssf_tier2, shif, housing_levy,
        pension_provident, hosp_mortgage_interest,
        gross_taxable, net_taxable, paye, personal_relief, net_tax, nhif,
        total_deductions, net_pay,
        annual_leave_entitlement, annual_leave_taken, annual_leave_balance,
        sick_leave_entitlement, sick_leave_taken, sick_leave_balance,
        leave_from, leave_to,
        notes, slip_ref, generated_by, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(b.employee_id, month, year, periodStart, periodEnd,
           basic, house, car, other,
           grossPay, nssf, nssfResult.tierI, nssfResult.tierII, shif, housingLevy,
           pension, mi, taxableIncome, taxableIncome, payeGross, personalRelief,
           netTax, nhif, totalDeductions, netPay,
           annualLeaveEntitlement, annualLeaveTaken, annualLeaveBalance,
           sickLeaveEntitlement, sickLeaveTaken, sickLeaveBalance,
           leaveFrom, leaveTo, b.notes||'', slipRef,
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
