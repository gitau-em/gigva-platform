'use client' // KRA payroll engine v2
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  DollarSign, FileText, Download, Printer, ChevronLeft,
  UserPlus, Edit3, Eye, Send, Loader2, Users, AlertCircle
} from 'lucide-react'

const MONTHS = ['January','February','March','April','May','June',
  'July','August','September','October','November','December']

function fmtKsh(n) {
  return Number(n||0).toLocaleString('en-KE',{minimumFractionDigits:2,maximumFractionDigits:2})
}

// KRA Tax Bands: returns GROSS TAX (before personal relief)
function calcPAYE(taxable) {
  let tax = 0
  if (taxable <= 0) return 0
  tax += Math.min(taxable, 24000) * 0.10
  if (taxable > 24000) tax += Math.min(taxable - 24000, 32333 - 24000) * 0.25
  if (taxable > 32333) tax += Math.min(taxable - 32333, 500000 - 32333) * 0.30
  if (taxable > 500000) tax += Math.min(taxable - 500000, 800000 - 500000) * 0.325
  if (taxable > 800000) tax += (taxable - 800000) * 0.35
  return Math.round(Math.max(0, tax) * 100) / 100
}

// NHIF rates: applicable for payslips up to November 2024
function calcNHIF(gross) {
  if (gross < 5999) return 150; if (gross < 7999) return 300; if (gross < 11999) return 400
  if (gross < 14999) return 500; if (gross < 19999) return 600; if (gross < 24999) return 750
  if (gross < 29999) return 850; if (gross < 34999) return 900; if (gross < 39999) return 950
  if (gross < 44999) return 1000; if (gross < 49999) return 1100; if (gross < 59999) return 1200
  if (gross < 69999) return 1300; if (gross < 79999) return 1400; if (gross < 89999) return 1500
  if (gross < 99999) return 1600; return 1700
}

// SHIF rates: 2.75% of gross, minimum KES 300 (from December 2024)
function calcSHIF(gross) { return Math.round(gross * 0.0275 * 100) / 100 }

// NSSF 2013 Act - Tier I + Tier II
function calcNSSF(gross) {
  const lel = 6000, uel = 18000
  const tierI = Math.min(gross, lel) * 0.06
  const tierII = Math.max(0, Math.min(gross, uel) - lel) * 0.06
  return { tierI, tierII, total: tierI + tierII }
}

// Affordable Housing Levy: 1.5% of gross
function calcHousingLevy(gross) { return gross * 0.015 }

// Returns true if payslip should use SHIF (Dec 2024+), false for NHIF (up to Nov 2024)
function usesSHIF(month, year) {
  if (year > 2024) return true
  if (year === 2024 && month >= 12) return true
  return false
}
// AHL rule: apply only if payslip date is on or after March 2024 (gazetted March 19 2024)
// Since we only have month/year granularity, March 2024 is treated as applying
function appliesToAHL(month, year) {
  if (year > 2024) return true
  if (year === 2024 && month >= 3) return true
  return false
}

function calcPayroll(basic, house, car, other, pension=0, mi=0, month=new Date().getMonth()+1, year=new Date().getFullYear()) {
  const grossPay = basic + house + car + other
  const nssfResult = calcNSSF(grossPay)
  const nssf = nssfResult.total
  const ahlApplies = appliesToAHL(month, year)
  const housingLevy = ahlApplies ? calcHousingLevy(grossPay) : 0
  const shifApplies = usesSHIF(month, year)
  const healthDeduction = shifApplies ? calcSHIF(grossPay) : calcNHIF(grossPay)
  const shif = shifApplies ? healthDeduction : 0
  const nhif = shifApplies ? 0 : healthDeduction
  // Taxable Income = Gross Pay - NSSF only (SHIF/AHL do NOT reduce taxable income per KRA rules)
  const taxableIncome = Math.max(0, Math.round((grossPay - nssf) * 100) / 100)
  const payeGross = calcPAYE(taxableIncome)
  const personalRelief = 2400
  const netTax = Math.max(0, Math.round((payeGross - personalRelief) * 100) / 100)
  const totalDeductions = Math.round((nssf + netTax + healthDeduction + housingLevy + pension + mi) * 100) / 100
  const netPay = Math.round((grossPay - totalDeductions) * 100) / 100
  return { grossPay, nssf, nssf_tier1: nssfResult.tierI, nssf_tier2: nssfResult.tierII,
    shif, nhif, housing_levy: housingLevy,
    grossTaxable: taxableIncome, netTaxable: taxableIncome, paye: payeGross, personalRelief, netTax,
    total_deductions: totalDeductions, netPay }
}

function PayslipDocument({ slip, emp }) {
  if (!slip || !emp) return null
  const monthName = MONTHS[(slip.period_month || 1) - 1]
  const shifApplies = usesSHIF(slip.period_month, slip.period_year)
  const healthCode   = shifApplies ? 'SHIF'  : 'NHIF'
  const healthLabel  = shifApplies ? 'Social Health Insurance Fund (SHIF) 2.75%' : 'National Hospital Insurance Fund (NHIF)'
  const healthAmt    = shifApplies ? (slip.shif || 0) : (slip.nhif || 0)
  const ahlApplies   = appliesToAHL(slip.period_month, slip.period_year)

  // Payment date = last day of the payroll month
  const lastDay = new Date(slip.period_year, slip.period_month, 0).getDate()
  const paymentDate = lastDay + ' ' + monthName + ' ' + slip.period_year

  // Employee work ID
  const empWorkId = emp.employee_id || ('GV-' + slip.period_year + '-' + String(emp.id || 0).padStart(3, '0'))

  const earningsRows = [
    { code: 'BASIC_PAY',   name: 'Basic Pay',          amount: slip.basic_pay || 0         },
    { code: 'HOUSE_ALLOW', name: 'Housing Allowance',   amount: slip.house_allowance || 0   },
    { code: 'CAR_BENEFIT', name: 'Car Benefit',         amount: slip.car_benefit || 0       },
    { code: 'OTHER_ALLOW', name: 'Other Allowances',    amount: slip.other_allowances || 0  },
    { code: 'GROSS_PAY',   name: 'Gross Pay',           amount: slip.gross_pay || 0, bold: true },
  ]

  const deductionsRows = [
    { code: 'NSSF_T1',    name: 'NSSF Tier I (6% of first KES 6,000)',  amount: slip.nssf_tier1 || 0,         bold: false },
    { code: 'NSSF_T2',    name: 'NSSF Tier II (6% of next KES 12,000)', amount: slip.nssf_tier2 || 0,         bold: false },
    { code: healthCode,   name: healthLabel,                              amount: healthAmt,                    bold: false },
    ...(ahlApplies ? [{ code: 'AHL', name: 'Affordable Housing Levy (1.5%)', amount: slip.housing_levy || 0, bold: false }] : []),
    { code: 'PAYE',       name: 'Pay As You Earn (PAYE)',                amount: slip.paye || 0,               bold: false },
    { code: 'PER_RELIEF', name: 'Personal Tax Relief (Credit)',          amount: slip.personal_relief || 2400, bold: false },
    { code: 'NET_TAX',    name: 'Net Tax Payable',                       amount: slip.net_tax || 0,            bold: true  },
  ]

  const annualEntitlement = slip.annual_leave_entitlement || 25
  const annualTaken       = slip.annual_leave_taken || 0
  const annualBalance     = slip.annual_leave_balance !== undefined ? slip.annual_leave_balance : (annualEntitlement - annualTaken)
  const sickEntitlement   = slip.sick_leave_entitlement || 10
  const sickTaken         = slip.sick_leave_taken || 0
  const sickBalance       = slip.sick_leave_balance !== undefined ? slip.sick_leave_balance : (sickEntitlement - sickTaken)

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', width: '794px', minHeight: '1123px', margin: '0 auto', backgroundColor: '#fff', border: '1px solid #d1d5db', boxSizing: 'border-box', padding: '0', display: 'flex', flexDirection: 'column' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '16px 20px 12px', borderBottom: '2px solid #e5e7eb' }}>
        {/* Left: Business address */}
        <div style={{ fontSize: '11px', color: '#374151', lineHeight: '1.7' }}>
          <div style={{ fontWeight: 'bold', fontSize: '12px' }}>Westlands Business Park, Nairobi</div>
          <div>P.O box 13878-00100 Nairobi</div>
          <div>+254 701 443 444</div>
          <div>hello@gigva.co.ke</div>
          <div>www.gigva.co.ke</div>
        </div>
        {/* Center: Payslip button */}
        <div style={{ textAlign: 'center', paddingTop: '6px' }}>
          <div style={{ display: 'inline-block', backgroundColor: '#1a56db', color: '#fff', fontWeight: 'bold', fontSize: '16px', padding: '7px 30px', borderRadius: '4px' }}>Payslip</div>
        </div>
        {/* Right: Full website SVG logo */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <svg width="152" height="40" viewBox="0 0 152 40" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="40" height="40" rx="9" fill="#0ea5e9"/>
            <path d="M28.5 10.5 A10.5 10.5 0 1 0 28.5 29.5" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none"/>
            <line x1="28.5" y1="20" x2="20.5" y2="20" stroke="#fff" strokeWidth="4" strokeLinecap="round"/>
            <line x1="28.5" y1="29.5" x2="28.5" y2="24" stroke="#fff" strokeWidth="4" strokeLinecap="round"/>
            <circle cx="32" cy="7" r="2.5" fill="#7dd3fc"/>
            <text x="49" y="26" fontFamily="system-ui,sans-serif" fontWeight="800" fontSize="18" fill="#0ea5e9" letterSpacing="-0.5">GIGVA</text>
            <text x="50" y="37" fontFamily="system-ui,sans-serif" fontWeight="700" fontSize="7.5" fill="#7dd3fc" letterSpacing="3.5">KENYA</text>
          </svg>
        </div>
      </div>

      {/* SALARY SLIP TITLE */}
      <div style={{ backgroundColor: '#1a56db', color: '#fff', textAlign: 'center', padding: '7px 10px', fontWeight: 'bold', fontSize: '13px' }}>
        Salary Slip of {emp.name} for {monthName}&#8211;{slip.period_year}
      </div>

      {/* PERSONAL DETAILS */}
      <div style={{ margin: '10px 12px 0' }}>
        <div style={{ backgroundColor: '#1a56db', color: '#fff', padding: '4px 8px', fontSize: '11px', fontWeight: 'bold' }}>Personal Details</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <tbody>
            <tr>
              <td style={{ padding: '5px 8px', width: '50%', border: '1px solid #d1d5db' }}><strong>EMPLOYEE NAME:</strong> {emp.name}</td>
              <td style={{ padding: '5px 8px', width: '50%', border: '1px solid #d1d5db' }}><strong>EMPLOYEE ID:</strong> {empWorkId}</td>
            </tr>
            <tr>
              <td style={{ padding: '5px 8px', border: '1px solid #d1d5db' }}><strong>DESIGNATION:</strong> {emp.designation || emp.role || '—'}</td>
              <td style={{ padding: '5px 8px', border: '1px solid #d1d5db' }}><strong>PAYMENT DATE:</strong> {paymentDate}</td>
            </tr>
            <tr>
              <td style={{ padding: '5px 8px', border: '1px solid #d1d5db' }}><strong>EMAIL:</strong> {emp.email || '—'}</td>
              <td style={{ padding: '5px 8px', border: '1px solid #d1d5db' }}><strong>ADDRESS:</strong> {emp.address || '—'}</td>
            </tr>
            <tr>
              <td style={{ padding: '5px 8px', border: '1px solid #d1d5db' }}><strong>BANK ACCOUNT:</strong> {emp.bank_account || '—'}</td>
              <td style={{ padding: '5px 8px', border: '1px solid #d1d5db' }}><strong>BANK NAME:</strong> {emp.bank_name || '—'}</td>
            </tr>
            <tr>
              <td style={{ padding: '5px 8px', border: '1px solid #d1d5db' }}><strong>REF:</strong> {slip.slip_ref || slip.ref_code || empWorkId}</td>
              <td style={{ padding: '5px 8px', border: '1px solid #d1d5db' }}></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* EARNINGS & DEDUCTIONS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '10px 12px 0' }}>
        <div>
          <div style={{ backgroundColor: '#1a56db', color: '#fff', padding: '4px 8px', fontSize: '11px', fontWeight: 'bold' }}>Earnings</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr>
                <th style={{ padding: '4px 6px', backgroundColor: '#1a56db', color: '#fff', textAlign: 'left', border: '1px solid #4a7ae8' }}>Code</th>
                <th style={{ padding: '4px 6px', backgroundColor: '#1a56db', color: '#fff', textAlign: 'left', border: '1px solid #4a7ae8' }}>Description</th>
                <th style={{ padding: '4px 6px', backgroundColor: '#1a56db', color: '#fff', textAlign: 'right', border: '1px solid #4a7ae8' }}>Amount (KES)</th>
              </tr>
            </thead>
            <tbody>
              {earningsRows.map((row, i) => (
                <tr key={row.code} style={{ backgroundColor: i % 2 === 0 ? '#f0f5ff' : '#fff' }}>
                  <td style={{ padding: '3px 6px', border: '1px solid #d0d8e8', color: row.bold ? '#1a56db' : '#374151', fontWeight: row.bold ? 'bold' : 'normal' }}>{row.code}</td>
                  <td style={{ padding: '3px 6px', border: '1px solid #d0d8e8', color: row.bold ? '#1a56db' : '#374151', fontWeight: row.bold ? 'bold' : 'normal' }}>{row.name}</td>
                  <td style={{ padding: '3px 6px', border: '1px solid #d0d8e8', textAlign: 'right', color: row.bold ? '#1a56db' : '#374151', fontWeight: row.bold ? 'bold' : 'normal', whiteSpace: 'nowrap' }}>{fmtKsh(row.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <div style={{ backgroundColor: '#9b1c1c', color: '#fff', padding: '4px 8px', fontSize: '11px', fontWeight: 'bold' }}>Deductions</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr>
                <th style={{ padding: '4px 6px', backgroundColor: '#9b1c1c', color: '#fff', textAlign: 'left', border: '1px solid #c53030' }}>Code</th>
                <th style={{ padding: '4px 6px', backgroundColor: '#9b1c1c', color: '#fff', textAlign: 'left', border: '1px solid #c53030' }}>Description</th>
                <th style={{ padding: '4px 6px', backgroundColor: '#9b1c1c', color: '#fff', textAlign: 'right', border: '1px solid #c53030' }}>Amount (KES)</th>
              </tr>
            </thead>
            <tbody>
              {deductionsRows.map((row, i) => (
                <tr key={row.code} style={{ backgroundColor: i % 2 === 0 ? '#fff5f5' : '#fff' }}>
                  <td style={{ padding: '3px 6px', border: '1px solid #fca5a5', color: row.bold ? '#b91c1c' : '#374151', fontWeight: row.bold ? 'bold' : 'normal' }}>{row.code}</td>
                  <td style={{ padding: '3px 6px', border: '1px solid #fca5a5', color: row.bold ? '#b91c1c' : '#374151', fontWeight: row.bold ? 'bold' : 'normal' }}>{row.name}</td>
                  <td style={{ padding: '3px 6px', border: '1px solid #fca5a5', textAlign: 'right', color: row.bold ? '#b91c1c' : '#374151', fontWeight: row.bold ? 'bold' : 'normal', whiteSpace: 'nowrap' }}>{fmtKsh(row.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* LEAVE SUMMARY */}
      <div style={{ margin: '10px 12px 0' }}>
        <div style={{ backgroundColor: '#1a56db', color: '#fff', padding: '4px 8px', fontSize: '11px', fontWeight: 'bold' }}>Leave Summary</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr>
              <th style={{ padding: '4px 8px', backgroundColor: '#e8f0fe', color: '#1e3a8a', textAlign: 'left', border: '1px solid #c7d9f8', fontWeight: 'bold' }}>Leave Type</th>
              <th style={{ padding: '4px 8px', backgroundColor: '#e8f0fe', color: '#1e3a8a', textAlign: 'center', border: '1px solid #c7d9f8', fontWeight: 'bold' }}>Entitlement (Days)</th>
              <th style={{ padding: '4px 8px', backgroundColor: '#e8f0fe', color: '#1e3a8a', textAlign: 'center', border: '1px solid #c7d9f8', fontWeight: 'bold' }}>Taken (Days)</th>
              <th style={{ padding: '4px 8px', backgroundColor: '#e8f0fe', color: '#1e3a8a', textAlign: 'center', border: '1px solid #c7d9f8', fontWeight: 'bold' }}>Balance (Days)</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ backgroundColor: '#f7f9ff' }}>
              <td style={{ padding: '4px 8px', border: '1px solid #d0d8e8', fontWeight: 'bold' }}>Annual Leave</td>
              <td style={{ padding: '4px 8px', border: '1px solid #d0d8e8', textAlign: 'center' }}>{annualEntitlement}</td>
              <td style={{ padding: '4px 8px', border: '1px solid #d0d8e8', textAlign: 'center' }}>{annualTaken}</td>
              <td style={{ padding: '4px 8px', border: '1px solid #d0d8e8', textAlign: 'center', fontWeight: 'bold', color: '#1a56db' }}>{annualBalance}</td>
            </tr>
            <tr style={{ backgroundColor: '#fff' }}>
              <td style={{ padding: '4px 8px', border: '1px solid #d0d8e8', fontWeight: 'bold' }}>Sick Leave</td>
              <td style={{ padding: '4px 8px', border: '1px solid #d0d8e8', textAlign: 'center' }}>{sickEntitlement}</td>
              <td style={{ padding: '4px 8px', border: '1px solid #d0d8e8', textAlign: 'center' }}>{sickTaken}</td>
              <td style={{ padding: '4px 8px', border: '1px solid #d0d8e8', textAlign: 'center', fontWeight: 'bold', color: '#1a56db' }}>{sickBalance}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* NET PAY BAR */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', margin: '10px 12px 0', border: '1px solid #1a56db' }}>
        <div style={{ backgroundColor: '#1a56db', color: '#fff', padding: '10px 12px' }}>
          <div style={{ fontSize: '10px', fontWeight: 'bold' }}>GROSS PAY</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>KES {fmtKsh(slip.gross_pay || 0)}</div>
        </div>
        <div style={{ backgroundColor: '#1e3a8a', color: '#fff', padding: '10px 12px', borderLeft: '1px solid #3b82f6', borderRight: '1px solid #3b82f6' }}>
          <div style={{ fontSize: '10px', fontWeight: 'bold' }}>TOTAL DEDUCTIONS</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>KES {fmtKsh(slip.total_deductions || 0)}</div>
        </div>
        <div style={{ backgroundColor: '#1e3a8a', color: '#fbbf24', padding: '10px 12px' }}>
          <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#fff' }}>NET PAY</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>KES {fmtKsh(slip.net_pay || 0)}</div>
        </div>
      </div>

      {/* FOOTER: Prepared By + Stamp + Authorized Signature */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', margin: '18px 12px 12px', paddingTop: '4px' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '8px' }}>Prepared By: FATUMA KAMAU</div>
          <img src="/gigva-stamp.png" alt="Gigva Kenya Stamp" style={{ width: '90px', height: '90px', opacity: 0.85 }} />
        </div>
        <div style={{ fontSize: '11px', color: '#374151', textAlign: 'right', paddingBottom: '12px' }}>
          Authorized Signature:&nbsp;
          <span style={{ display: 'inline-block', borderBottom: '1px solid #374151', width: '160px', marginLeft: '4px' }}>&nbsp;</span>
        </div>
      </div>

      {/* BOTTOM CONTACT BAR */}
      <div style={{ borderTop: '1px solid #e5e7eb', textAlign: 'center', padding: '7px 10px', fontSize: '10px', color: '#6b7280', marginTop: 'auto' }}>
        Gigva Kenya &nbsp;&bull;&nbsp; +254 701 443 444 &nbsp;&bull;&nbsp; hello@gigva.co.ke &nbsp;&bull;&nbsp; www.gigva.co.ke
      </div>

    </div>
  )
}

export default function PayrollPage() {
  const router = useRouter()
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [view, setView] = useState('staff')
  const [employees, setEmployees] = useState([])
  const [selectedEmp, setSelectedEmp] = useState(null)
  const [payslips, setPayslips] = useState([])
  const [currentSlip, setCurrentSlip] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [emailing, setEmailing] = useState(false)

  const [slipForm, setSlipForm] = useState({
    period_month: new Date().getMonth()+1, period_year: new Date().getFullYear(),
    basic_pay:'', house_allowance:'', car_benefit:'', other_allowances:'',
    pension_provident:'0', hosp_mortgage_interest:'0',
    annual_leave_taken:'0', sick_leave_taken:'0', leave_from:'', leave_to:'', notes:''
  })
  const [empForm, setEmpForm] = useState({
    name:'', employee_id:'', department:'', designation:'', email:'', phone:'',
    address:'', date_employed:'', marital_status:'Single', id_number:'',
    bank_name:'', bank_account:'', bank_code:'',
    basic_pay:'0', house_allowance:'0', car_benefit:'0', other_allowances:'0'
  })

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('gigva_token') : null
    if (!t) { router.push('/admin/login'); return }
    try {
      const payload = JSON.parse(atob(t.split('.')[1]))
      if (!['cto','people_ops','superadmin'].includes(payload.role)) {
        router.push('/admin/dashboard'); return
      }
      setToken(t); setUser(payload)
    } catch { router.push('/admin/login') }
  }, [])

  useEffect(() => { if (token) loadEmployees() }, [token])

  const hdr = token ? { 'Authorization': 'Bearer '+token, 'Content-Type': 'application/json' } : {}

  const loadEmployees = async () => {
    setLoading(true)
    try {
      await fetch('/api/admin/payroll/setup', { method: 'POST', headers: hdr })
      const r = await fetch('/api/admin/payroll/staff', { headers: hdr })
      const d = await r.json()
      if (d.ok) {
        if ((d.employees||[]).length === 0) {
          await fetch('/api/admin/payroll/seed', { method: 'POST', headers: hdr })
          const r2 = await fetch('/api/admin/payroll/staff', { headers: hdr })
          const d2 = await r2.json()
          if (d2.ok) setEmployees(d2.employees||[])
        } else { setEmployees(d.employees) }
      }
    } catch(e) { setMsg('Error loading employees') }
    setLoading(false)
  }

  const loadPayslips = async (empId) => {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/payroll/payslips?employee_id='+empId, { headers: hdr })
      const d = await r.json()
      if (d.ok) setPayslips(d.payslips||[])
    } catch(e) {}
    setLoading(false)
  }

  const liveCalc = (() => {
    const b = parseFloat(slipForm.basic_pay)||0, h = parseFloat(slipForm.house_allowance)||0
    const c = parseFloat(slipForm.car_benefit)||0, o = parseFloat(slipForm.other_allowances)||0
    const p = parseFloat(slipForm.pension_provident)||0, mi = parseFloat(slipForm.hosp_mortgage_interest)||0
    return calcPayroll(b,h,c,o,p,mi)
  })()

  const handleSaveEmployee = async () => {
    setSaving(true); setMsg('')
    try {
      const r = await fetch('/api/admin/payroll/staff', {
        method: empForm.id ? 'PUT' : 'POST', headers: hdr, body: JSON.stringify(empForm)
      })
      const d = await r.json()
      if (d.ok) { setMsg('Employee saved'); loadEmployees(); setView('staff') }
      else setMsg(d.msg||'Save failed')
    } catch(e) { setMsg('Error saving') }
    setSaving(false)
  }

  const handleGenerateSlip = async () => {
    if (!selectedEmp) return
    setSaving(true); setMsg('')
    try {
      const b = parseFloat(slipForm.basic_pay)||selectedEmp.basic_pay||0
      const h = parseFloat(slipForm.house_allowance)||selectedEmp.house_allowance||0
      const c = parseFloat(slipForm.car_benefit)||selectedEmp.car_benefit||0
      const o = parseFloat(slipForm.other_allowances)||selectedEmp.other_allowances||0
      const calcMonth = parseInt(slipForm.period_month), calcYear = parseInt(slipForm.period_year)
      const calc = calcPayroll(b,h,c,o,parseFloat(slipForm.pension_provident)||0,parseFloat(slipForm.hosp_mortgage_interest)||0, calcMonth, calcYear)
      const body = {
        employee_id: selectedEmp.id, period_month: parseInt(slipForm.period_month),
        period_year: parseInt(slipForm.period_year),
        basic_pay:b, house_allowance:h, car_benefit:c, other_allowances:o,
        pension_provident:parseFloat(slipForm.pension_provident)||0,
        hosp_mortgage_interest:parseFloat(slipForm.hosp_mortgage_interest)||0,
        annual_leave_taken:parseInt(slipForm.annual_leave_taken)||0,
        sick_leave_taken:parseInt(slipForm.sick_leave_taken)||0,
        leave_from:slipForm.leave_from||null, leave_to:slipForm.leave_to||null,
        notes:slipForm.notes, slip_number: payslips.length+1, ...calc
      }
      const r = await fetch('/api/admin/payroll/payslips', { method:'POST', headers:hdr, body:JSON.stringify(body) })
      const d = await r.json()
      if (d.ok) {
        const emp = d.payslip.payroll_employees||selectedEmp
        setCurrentSlip({ slip: d.payslip, emp }); setView('payslip')
        loadPayslips(selectedEmp.id)
      } else setMsg(d.msg||'Failed')
    } catch(e) { setMsg('Error generating') }
    setSaving(false)
  }

  const handleEmailSlip = async () => {
    if (!currentSlip) return
    setEmailing(true); setMsg('')
    try {
      const r = await fetch('/api/admin/payroll/email', {
        method:'POST', headers:hdr,
        body: JSON.stringify({ slip: currentSlip.slip, employee: currentSlip.emp })
      })
      const d = await r.json()
      if (d.ok) setMsg('Payslip emailed to '+currentSlip.emp.email)
      else setMsg(d.msg||'Email failed')
    } catch(e) { setMsg('Error') }
    setEmailing(false)
  }

  const handleDownloadPDF = () => {
    const el = document.getElementById('payslip-print-area')
    if (!el) return
    const w = window.open('','_blank','width=900,height=700')
    w.document.write('<!DOCTYPE html><html><head><title>Payslip</title><style>@media print{body{margin:0;}}body{font-family:Arial,sans-serif;}</style></head><body>')
    w.document.write(el.outerHTML)
    w.document.write('</body></html>')
    w.document.close(); w.focus()
    setTimeout(() => { w.print() }, 500)
  }

  const handleDownloadWord = () => {
    const el = document.getElementById('payslip-print-area')
    if (!el) return
    const mn = MONTHS[(currentSlip.slip.period_month||1)-1]
    const fn = 'Payslip_'+currentSlip.emp.name.replace(/ /g,'_')+'_'+mn+'_'+currentSlip.slip.period_year+'.doc'
    const html = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'><head><meta charset='utf-8'><title>Payslip</title></head><body>"+el.outerHTML+"</body></html>"
    const blob = new Blob([html], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href=url; a.download=fn; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const yearOptions = []
  for (let y = new Date().getFullYear(); y >= 2012; y--) yearOptions.push(y)

  const th = 'px-3 py-2 text-left text-xs font-semibold text-white bg-blue-700 uppercase'
  const td2 = 'px-3 py-2 text-sm border-b border-slate-100'

  if (!user) return <div className="min-h-screen flex items-center justify-center"><Loader2 size={32} className="animate-spin text-blue-600" /></div>

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-blue-700 px-5 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/admin/dashboard')}
            className="flex items-center gap-1 text-white/80 hover:text-white text-sm">
            <ChevronLeft size={16} /> Dashboard
          </button>
          <span className="text-white/40">|</span>
          <DollarSign size={16} className="text-white" />
          <span className="text-sm font-bold text-white">Payroll System</span>
        </div>
        <div className="text-xs text-white/70">{user.name||user.email}</div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {/* Nav */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {view !== 'staff' && (
              <button onClick={() => { setView('staff'); setMsg(''); setCurrentSlip(null) }}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
                <ChevronLeft size={16} /> Back
              </button>
            )}
            <h2 className="text-lg font-bold text-slate-800">
              {view==='staff'?'Staff Payroll List':view==='generate'?'Generate Payslip — '+(selectedEmp?.name||''):view==='payslip'?'Payslip Preview':view==='history'?'Payslip History — '+(selectedEmp?.name||''):view==='addStaff'?'Add Employee':'Edit Employee'}
            </h2>
          </div>
          {view==='staff' && (
            <button onClick={() => { setEmpForm({name:'',employee_id:'',department:'',designation:'',email:'',phone:'',address:'',date_employed:'',marital_status:'Single',id_number:'',bank_name:'',bank_account:'',bank_code:'',basic_pay:'0',house_allowance:'0',car_benefit:'0',other_allowances:'0'}); setView('addStaff') }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white text-sm font-semibold rounded-lg hover:bg-blue-800">
              <UserPlus size={15} /> Add Employee
            </button>
          )}
          {view==='payslip' && (
            <div className="flex items-center gap-2">
              <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">
                <Printer size={14} /> PDF / Print
              </button>
              <button onClick={handleDownloadWord} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                <Download size={14} /> Word (.doc)
              </button>
              <button onClick={handleEmailSlip} disabled={emailing} className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-60">
                <Send size={14} /> {emailing?'Sending…':'Email to Staff'}
              </button>
            </div>
          )}
        </div>

        {msg && <div className={'text-sm px-4 py-2 rounded-lg '+(msg.includes('Error')||msg.includes('failed')?'bg-red-50 text-red-700':'bg-green-50 text-green-700')}>{msg}</div>}

        {/* STAFF LIST */}
        {view==='staff' && (
          loading ? (
            <div className="flex items-center justify-center py-12 text-slate-500"><Loader2 size={20} className="animate-spin mr-2" /> Loading…</div>
          ) : employees.length===0 ? (
            <div className="text-center py-12 text-slate-500"><Users size={40} className="mx-auto mb-3 text-slate-300" /><p>No payroll employees yet</p></div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
              <table className="w-full border-collapse">
                <thead>
                  <tr><th className={th}>#</th><th className={th}>Name</th><th className={th}>Designation</th><th className={th}>Dept</th><th className={th}>Email</th><th className={th}>Basic Pay</th><th className={th}>Actions</th></tr>
                </thead>
                <tbody>
                  {employees.filter(e=>e.is_active!==false).map((emp,i) => (
                    <tr key={emp.id} className="hover:bg-blue-50">
                      <td className={td2+' text-slate-400'}>{i+1}</td>
                      <td className={td2+' font-semibold'}>{emp.name}</td>
                      <td className={td2}>{emp.designation||'&#x2014;'}</td>
                      <td className={td2}>{emp.department||'&#x2014;'}</td>
                      <td className={td2+' text-slate-500'}>{emp.email}</td>
                      <td className={td2+' font-mono'}>KSh {fmtKsh(emp.basic_pay)}</td>
                      <td className={td2}>
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setSelectedEmp(emp); setSlipForm(f=>({...f,basic_pay:emp.basic_pay||'',house_allowance:emp.house_allowance||'',car_benefit:emp.car_benefit||'',other_allowances:emp.other_allowances||''})); loadPayslips(emp.id); setView('generate') }}
                            className="flex items-center gap-1 px-2 py-1 bg-blue-700 text-white text-xs rounded hover:bg-blue-800"><FileText size={12} /> Generate</button>
                          <button onClick={() => { setSelectedEmp(emp); loadPayslips(emp.id); setView('history') }}
                            className="flex items-center gap-1 px-2 py-1 bg-slate-600 text-white text-xs rounded hover:bg-slate-700"><Eye size={12} /> History</button>
                          <button onClick={() => { setEmpForm({...emp, id:emp.id}); setView('editStaff') }}
                            className="flex items-center gap-1 px-2 py-1 bg-amber-600 text-white text-xs rounded hover:bg-amber-700"><Edit3 size={12} /> Edit</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* ADD/EDIT EMPLOYEE */}
        {(view==='addStaff'||view==='editStaff') && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[['Name *','name','text'],['Employee ID','employee_id','text'],['Department','department','text'],['Designation','designation','text'],['Email *','email','email'],['Phone','phone','tel'],['Address','address','text'],['Date Employed','date_employed','date'],['ID Number','id_number','text'],['Bank Name','bank_name','text'],['Bank Account','bank_account','text'],['Bank Code','bank_code','text']].map(([label,field,type]) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
                  <input type={type} value={empForm[field]||''} onChange={e=>setEmpForm(f=>({...f,[field]:e.target.value}))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Marital Status</label>
                <select value={empForm.marital_status} onChange={e=>setEmpForm(f=>({...f,marital_status:e.target.value}))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
                  <option>Single</option><option>Married</option><option>Divorced</option><option>Widowed</option>
                </select>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-xs font-bold text-blue-700 mb-3 uppercase">Default Salary Components (KSh)</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[['Basic Pay','basic_pay'],['House Allowance','house_allowance'],['Car Benefit','car_benefit'],['Other Allowances','other_allowances']].map(([l,f]) => (
                  <div key={f}>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">{l}</label>
                    <input type="number" value={empForm[f]||0} onChange={e=>setEmpForm(f2=>({...f2,[f]:e.target.value}))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleSaveEmployee} disabled={saving}
                className="px-6 py-2 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 disabled:opacity-60 text-sm">
                {saving?'Saving…':view==='addStaff'?'Add Employee':'Save Changes'}
              </button>
              <button onClick={() => { setView('staff'); setMsg('') }}
                className="px-6 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 text-sm">Cancel</button>
            </div>
          </div>
        )}

        {/* GENERATE PAYSLIP */}
        {view==='generate' && selectedEmp && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase mb-4">Pay Period</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Month</label>
                  <select value={slipForm.period_month} onChange={e=>setSlipForm(f=>({...f,period_month:e.target.value}))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
                    {MONTHS.map((m,i) => <option key={m} value={i+1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Year</label>
                  <select value={slipForm.period_year} onChange={e=>setSlipForm(f=>({...f,period_year:e.target.value}))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
                    {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase mb-4">Salary Components (KSh)</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[['Basic Pay *','basic_pay'],['House Allowance','house_allowance'],['Car Benefit','car_benefit'],['Other Allowances','other_allowances'],['Pension/Provident','pension_provident'],['Mortgage Interest','hosp_mortgage_interest']].map(([l,f]) => (
                  <div key={f}>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">{l}</label>
                    <input type="number" value={slipForm[f]||''} onChange={e=>setSlipForm(f2=>({...f2,[f]:e.target.value}))}
                      placeholder="0" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase mb-4">Leave Details <span className="text-slate-400 font-normal normal-case">(Entitlement: 25 Annual / 10 Sick days per year)</span></p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[['Annual Leave Taken (days)','annual_leave_taken','number'],['Sick Leave Taken (days)','sick_leave_taken','number'],['Leave From','leave_from','date'],['Leave To','leave_to','date']].map(([l,f,t]) => (
                  <div key={f}>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">{l}</label>
                    <input type={t} value={slipForm[f]} onChange={e=>setSlipForm(f2=>({...f2,[f]:e.target.value}))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Notes</label>
                <textarea value={slipForm.notes} onChange={e=>setSlipForm(f=>({...f,notes:e.target.value}))} rows={2} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            {parseFloat(slipForm.basic_pay) > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                <p className="text-xs font-bold text-blue-700 uppercase mb-3">Live Payroll Preview</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[['Gross Pay',liveCalc.grossPay],['NSSF',liveCalc.nssf],['NHIF',liveCalc.nhif],['PAYE',liveCalc.paye],['Personal Relief',liveCalc.personalRelief],['Net Tax',liveCalc.netTax],['Net Taxable',liveCalc.netTaxable],['NET PAY',liveCalc.netPay]].map(([label,val]) => (
                    <div key={label} className={'bg-white rounded-lg p-3 border '+(label==='NET PAY'?'border-blue-500':'border-blue-100')}>
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className={'font-bold '+(label==='NET PAY'?'text-blue-700 text-base':'text-slate-800 text-sm')}>KSh {fmtKsh(val)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button onClick={handleGenerateSlip} disabled={saving}
              className="px-6 py-2 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 disabled:opacity-60 text-sm">
              {saving?'Generating…':'Generate & Preview Payslip'}
            </button>
          </div>
        )}

        {/* HISTORY */}
        {view==='history' && selectedEmp && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12"><Loader2 size={20} className="animate-spin mr-2" /> Loading…</div>
            ) : payslips.length===0 ? (
              <div className="text-center py-12 text-slate-500">No payslips yet for {selectedEmp.name}</div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr><th className={th}>Ref</th><th className={th}>Period</th><th className={th}>Gross</th><th className={th}>Net Pay</th><th className={th}>Generated By</th><th className={th}>Action</th></tr>
                </thead>
                <tbody>
                  {payslips.map(slip => (
                    <tr key={slip.id} className="hover:bg-blue-50">
                      <td className={td2+' font-mono text-xs'}>{slip.slip_ref}</td>
                      <td className={td2}>{MONTHS[(slip.period_month||1)-1]} {slip.period_year}</td>
                      <td className={td2+' font-mono'}>KSh {fmtKsh(slip.gross_pay)}</td>
                      <td className={td2+' font-bold font-mono text-blue-700'}>KSh {fmtKsh(slip.net_pay)}</td>
                      <td className={td2+' text-xs text-slate-400'}>{slip.generated_by}</td>
                      <td className={td2}>
                        <button onClick={() => { const emp=slip.payroll_employees||selectedEmp; setCurrentSlip({slip,emp}); setView('payslip') }}
                          className="flex items-center gap-1 px-2 py-1 bg-blue-700 text-white text-xs rounded hover:bg-blue-800"><Eye size={12} /> View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* PAYSLIP PREVIEW */}
        {view==='payslip' && currentSlip && (
          <div>
            <style>{`@media print{body>*{display:none!important;}#payslip-print-area{display:block!important;}#payslip-print-area,#payslip-print-area *{visibility:visible!important;}}`}</style>
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <PayslipDocument slip={currentSlip.slip} emp={currentSlip.emp} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
