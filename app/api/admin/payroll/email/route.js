import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { verifyToken } from '@/lib/auth'

const resend = new Resend(process.env.RESEND_API_KEY)
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gigva.co.ke'

function checkAccess(user) {
  return user && ['cto','people_ops','superadmin'].includes(user.role)
}

function fmt(n) {
  return Number(n||0).toLocaleString('en-KE',{minimumFractionDigits:2,maximumFractionDigits:2})
}

function buildPayslipHtml(slip, emp) {
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const monthName = MONTHS[(slip.period_month||1)-1]
  const items = [
    {code:'BASIC_PAY',name:'Basic Pay',amount:slip.basic_pay},
    {code:'GROSS_PAY',name:'Gross Pay',amount:slip.gross_pay},
    {code:'CAR',name:'Car Benefit',amount:slip.car_benefit},
    {code:'HOUSE',name:'Housing Allowance',amount:slip.house_allowance},
    {code:'GROSS_TAXABLE',name:'Gross Taxable Pay',amount:slip.gross_taxable},
    {code:'NSSF',name:'National Social Security Fund',amount:slip.nssf},
    {code:'PENS_PROV',name:'Pension/Provident Fund Scheme',amount:slip.pension_provident},
    {code:'HOSP_MI',name:'Home Ownership/Mortgage Interest',amount:slip.hosp_mortgage_interest},
    {code:'NET_TAXABLE',name:'Net Taxable Pay',amount:slip.net_taxable},
    {code:'PAYE',name:'Pay As You Earn',amount:slip.paye},
    {code:'PER_RELIEF',name:'Personal Tax Relief',amount:slip.personal_relief},
    {code:'NET_TAX',name:'Net Tax',amount:slip.net_tax},
    {code:'NHIF',name:'National Hospital Insurance Fund',amount:slip.nhif},
    {code:'NET_PAY',name:'Net Pay',amount:slip.net_pay},
  ]
  const rows = items.map((it,i) => `<tr style="background:${i%2===0?'#f9fbff':'#fff'}">
    <td style="padding:5px 8px;border:1px solid #d0d8e8;font-size:12px;">${i+1}</td>
    <td style="padding:5px 8px;border:1px solid #d0d8e8;font-size:12px;">${it.code}</td>
    <td style="padding:5px 8px;border:1px solid #d0d8e8;font-size:12px;">${it.name}</td>
    <td style="padding:5px 8px;border:1px solid #d0d8e8;font-size:12px;text-align:right;">1.00</td>
    <td style="padding:5px 8px;border:1px solid #d0d8e8;font-size:12px;text-align:right;">${fmt(it.amount)} KSh</td>
    <td style="padding:5px 8px;border:1px solid #d0d8e8;font-size:12px;text-align:right;font-weight:${it.code==='NET_PAY'?'bold':'normal'};">${fmt(it.amount)} KSh</td>
  </tr>`).join('')
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;font-size:13px;color:#222;margin:0;padding:20px;}</style></head><body>
<div style="text-align:center;margin-bottom:4px;"><img src="${SITE_URL}/logo.png" alt="Gigva" style="height:48px;" /></div>
<h2 style="text-align:center;color:#1a56db;margin:4px 0 2px;">GIGVA KENYA</h2>
<p style="text-align:center;font-size:11px;margin:0 0 8px;">Westlands Business Park, Nairobi, Kenya 00100 &bull; +254 701 443 444 &bull; hello@gigva.co.ke</p>
<hr/>
<h3 style="text-align:center;background:#1a56db;color:#fff;padding:8px;margin:10px 0;">PAYSLIP</h3>
<h4 style="text-align:center;color:#1a56db;">Salary Slip of ${emp.name} for ${monthName}-${slip.period_year}</h4>
<table style="width:100%;border-collapse:collapse;border:1px solid #ccc;margin-bottom:12px;">
  <tr style="background:#1a56db;color:#fff;"><td colspan="3" style="padding:6px 10px;font-weight:bold;">Personal Details</td></tr>
  <tr><td style="padding:4px 8px;border:1px solid #d0d8e8;"><b>EMP NAME:</b> ${emp.name}</td><td style="padding:4px 8px;border:1px solid #d0d8e8;"><b>DEPT:</b> ${emp.department||''}</td><td style="padding:4px 8px;border:1px solid #d0d8e8;"><b>REF:</b> ${slip.slip_ref||''}</td></tr>
  <tr><td style="padding:4px 8px;border:1px solid #d0d8e8;"><b>ADDRESS:</b> ${emp.address||''}</td><td style="padding:4px 8px;border:1px solid #d0d8e8;"><b>DESIGNATION:</b> ${emp.designation||''}</td><td style="padding:4px 8px;border:1px solid #d0d8e8;"><b>PERIOD START:</b> ${slip.period_start||''}</td></tr>
  <tr><td style="padding:4px 8px;border:1px solid #d0d8e8;"><b>EMAIL:</b> ${emp.email||''}</td><td style="padding:4px 8px;border:1px solid #d0d8e8;"><b>DATE EMPLOYED:</b> ${emp.date_employed||''}</td><td style="padding:4px 8px;border:1px solid #d0d8e8;"><b>PERIOD END:</b> ${slip.period_end||''}</td></tr>
  <tr><td style="padding:4px 8px;border:1px solid #d0d8e8;"><b>BANK ACCOUNT:</b> ${emp.bank_account||''}</td><td style="padding:4px 8px;border:1px solid #d0d8e8;"><b>BANK NAME:</b> ${emp.bank_name||''}</td><td style="padding:4px 8px;border:1px solid #d0d8e8;"><b>MARITAL STATUS:</b> ${emp.marital_status||'Single'}</td></tr>
</table>
${(slip.leave_balance_days>0||slip.leave_from)?'<table style="width:100%;border-collapse:collapse;border:1px solid #ccc;margin-bottom:12px;"><tr style="background:#1a56db;color:#fff;"><td colspan="3" style="padding:6px 10px;font-weight:bold;">Leave Details</td></tr><tr><td style="padding:4px 8px;border:1px solid #d0d8e8;"><b>Leave Balance:</b> '+slip.leave_balance_days+' days</td><td style="padding:4px 8px;border:1px solid #d0d8e8;"><b>Leave Taken:</b> '+(slip.leave_from||'')+ ' to '+(slip.leave_to||'')+'</td><td style="padding:4px 8px;border:1px solid #d0d8e8;"><b>Days Taken:</b> '+slip.leave_days_taken+'</td></tr></table>':''}
<table style="width:100%;border-collapse:collapse;border:1px solid #ccc;margin-bottom:20px;">
  <tr style="background:#1a56db;color:#fff;"><th style="padding:6px 8px;">Item</th><th style="padding:6px 8px;">Code</th><th style="padding:6px 8px;width:35%;">Name</th><th style="padding:6px 8px;">Qty/Rate</th><th style="padding:6px 8px;">Amount</th><th style="padding:6px 8px;">Total</th></tr>
  ${rows}
</table>
<table style="width:100%;"><tr>
  <td style="width:50%;vertical-align:top;">
    <p style="font-size:12px;"><b>Prepared By: FATUMA KAMAU</b></p>
    <img src="${SITE_URL}/gigva-stamp.png" alt="Gigva Stamp" style="height:80px;opacity:0.85;" />
  </td>
  <td style="width:50%;text-align:right;vertical-align:top;"><p style="font-size:12px;">Authorized Signature: _______________________</p></td>
</tr></table>
<hr/><p style="text-align:center;font-size:10px;color:#666;">Gigva Kenya &bull; +254 701 443 444 &bull; hello@gigva.co.ke &bull; www.gigva.co.ke</p>
</body></html>`
}

export async function POST(req) {
  const auth = req.headers.get('authorization') || ''
  const user = verifyToken(auth.replace('Bearer ','').trim())
  if (!user || !checkAccess(user)) return NextResponse.json({ ok: false, msg: 'Access denied' }, { status: 403 })
  try {
    const body = await req.json()
    const { slip, employee } = body
    if (!slip || !employee) return NextResponse.json({ ok: false, msg: 'slip and employee required' }, { status: 400 })
    const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
    const monthName = MONTHS[(slip.period_month||1)-1]
    const html = buildPayslipHtml(slip, employee)
    const { data, error } = await resend.emails.send({
      from: 'Gigva Payroll <cto@gigva.co.ke>',
      to: [employee.email],
      subject: 'Your Payslip for ' + monthName + ' ' + slip.period_year + ' - Gigva Kenya',
      html,
      reply_to: 'cto@gigva.co.ke',
    })
    if (error) return NextResponse.json({ ok: false, msg: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, resendId: data.id })
  } catch(e) { return NextResponse.json({ ok: false, msg: e.message }, { status: 500 }) }
}
