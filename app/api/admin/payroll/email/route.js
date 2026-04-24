import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/db'

const resend = new Resend(process.env.RESEND_API_KEY)

function checkAccess(user) {
  return user && ['cto','people_ops','superadmin'].includes(user.role)
}

function fmt(n) {
  return Number(n||0).toLocaleString('en-KE',{minimumFractionDigits:2,maximumFractionDigits:2})
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

// Determine if payslip uses SHIF (Dec 2024+) or NHIF (up to Nov 2024)
function usesSHIF(month, year) {
  if (year > 2024) return true
  if (year === 2024 && month >= 12) return true
  return false
}

const GIGVA_LOGO = '<svg width="152" height="40" viewBox="0 0 152 40" xmlns="http://www.w3.org/2000/svg"><g><rect x="0" y="0" width="40" height="40" rx="9" fill="#0ea5e9"/><path d="M28.5 10.5 A10.5 10.5 0 1 0 28.5 29.5" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none"/><line x1="28.5" y1="20" x2="20.5" y2="20" stroke="#fff" stroke-width="4" stroke-linecap="round"/><line x1="28.5" y1="29.5" x2="28.5" y2="24" stroke="#fff" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="7" r="2.5" fill="#7dd3fc"/></g><text x="49" y="24" font-family="system-ui,sans-serif" font-weight="800" font-size="18" fill="#0ea5e9" letter-spacing="-.5">GIGVA</text><text x="50" y="35" font-family="system-ui,sans-serif" font-weight="700" font-size="7.5" fill="#7dd3fc" letter-spacing="3.5">KENYA</text></svg>'

function buildPayslipHtml(slip, emp) {
  const monthName = MONTHS[(slip.period_month||1)-1]
  const shifApplies = usesSHIF(slip.period_month, slip.period_year)

  // Health insurance label
  const healthLabel = shifApplies
    ? 'Social Health Insurance Fund (SHIF) 2.75%'
    : 'National Hospital Insurance Fund (NHIF)'
  const healthCode = shifApplies ? 'SHIF' : 'NHIF'
  const healthAmount = shifApplies ? (slip.shif || 0) : (slip.nhif || 0)

  const th = 'padding:6px 8px;border:1px solid #4a7ae8;background:#1a56db;color:#fff;font-size:12px;text-align:left;'
  const td1 = 'padding:5px 8px;border:1px solid #d0d8e8;font-size:12px;'
  const td2 = 'padding:5px 8px;border:1px solid #d0d8e8;font-size:12px;text-align:right;'

  const earningsRows = [
    { code: 'BASIC_PAY', name: 'Basic Pay', amount: slip.basic_pay || 0 },
    { code: 'HOUSE_ALLOW', name: 'Housing Allowance', amount: slip.house_allowance || 0 },
    { code: 'CAR_BENEFIT', name: 'Car Benefit', amount: slip.car_benefit || 0 },
    { code: 'OTHER_ALLOW', name: 'Other Allowances', amount: slip.other_allowances || 0 },
    { code: 'GROSS_PAY', name: 'Gross Pay', amount: slip.gross_pay || 0 },
  ]

  const deductionsRows = [
    { code: 'NSSF_T1', name: 'NSSF Tier I (6% of first KES 6,000)', amount: slip.nssf_tier1 || 0 },
    { code: 'NSSF_T2', name: 'NSSF Tier II (6% of next KES 12,000)', amount: slip.nssf_tier2 || 0 },
    { code: healthCode, name: healthLabel, amount: healthAmount },
    { code: 'AHL', name: 'Affordable Housing Levy (1.5%)', amount: slip.housing_levy || 0 },
    { code: 'PAYE', name: 'Pay As You Earn (PAYE)', amount: slip.paye || 0 },
    { code: 'PER_RELIEF', name: 'Personal Tax Relief', amount: slip.personal_relief || 0, credit: true },
    { code: 'NET_TAX', name: 'Net Tax Payable', amount: slip.net_tax || 0 },
  ].filter(r => r.amount > 0)

  const earnHtml = earningsRows
    .map((it, i) => `<tr style="background:${i%2===0?'#f9fbff':'#fff'}">
      <td style="${td1}">${it.code}</td><td style="${td1}">${it.name}</td>
      <td style="${td2}${it.code==='GROSS_PAY'?'font-weight:bold;background:#e8f0fe;':''}">${fmt(it.amount)}</td>
    </tr>`).join('')

  const dedHtml = deductionsRows
    .map((it, i) => `<tr style="background:${i%2===0?'#fff5f5':'#fff'}">
      <td style="${td1}">${it.code}</td><td style="${td1}">${it.name}</td>
      <td style="${td2}${it.code==='NET_TAX'?'font-weight:bold;':''}color:#b91c1c;">${fmt(it.amount)}</td>
    </tr>`).join('')

  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>body{font-family:Arial,sans-serif;font-size:13px;color:#222;margin:0;padding:20px;}</style>
</head><body>
<div style="text-align:center;margin-bottom:8px;">${GIGVA_LOGO}</div>
<h2 style="text-align:center;color:#1a56db;margin:4px 0 2px;">GIGVA KENYA</h2>
<p style="text-align:center;font-size:11px;margin:0 0 8px;">Westlands Business Park, Nairobi, Kenya 00100 &bull; +254 701 443 444 &bull; hello@gigva.co.ke</p>
<hr/>
<h3 style="text-align:center;background:#1a56db;color:#fff;padding:8px;margin:10px 0;">PAYSLIP</h3>
<h4 style="text-align:center;color:#1a56db;">Salary Slip of ${emp.name} for ${monthName} ${slip.period_year}</h4>
<table style="width:100%;border-collapse:collapse;border:1px solid #ccc;margin-bottom:12px;">
  <tr style="background:#1a56db;color:#fff;"><td colspan="3" style="padding:6px 10px;font-weight:bold;">Employee Details</td></tr>
  <tr><td style="${td1}"><b>NAME:</b> ${emp.name}</td><td style="${td1}"><b>DEPT:</b> ${emp.department||''}</td><td style="${td1}"><b>REF:</b> ${slip.slip_ref||''}</td></tr>
  <tr><td style="${td1}"><b>EMAIL:</b> ${emp.email||''}</td><td style="${td1}"><b>DESIGNATION:</b> ${emp.designation||''}</td><td style="${td1}"><b>PERIOD:</b> ${monthName} ${slip.period_year}</td></tr>
  <tr><td style="${td1}"><b>BANK ACCOUNT:</b> ${emp.bank_account||''}</td><td style="${td1}"><b>BANK NAME:</b> ${emp.bank_name||''}</td><td style="${td1}"><b>MARITAL STATUS:</b> ${emp.marital_status||'Single'}</td></tr>
</table>
<table style="width:100%;border-collapse:collapse;margin-bottom:12px;"><tr valign="top">
<td style="width:50%;padding-right:6px;">
  <table style="width:100%;border-collapse:collapse;border:1px solid #ccc;">
    <tr><th colspan="3" style="${th}">Earnings</th></tr>
    <tr><th style="${th}">Code</th><th style="${th}">Description</th><th style="${th};text-align:right;">Amount (KES)</th></tr>
    ${earnHtml}
  </table>
</td>
<td style="width:50%;padding-left:6px;">
  <table style="width:100%;border-collapse:collapse;border:1px solid #ccc;">
    <tr><th colspan="3" style="${th};background:#b91c1c;">Deductions</th></tr>
    <tr><th style="${th}">Code</th><th style="${th}">Description</th><th style="${th};text-align:right;">Amount (KES)</th></tr>
    ${dedHtml}
  </table>
</td>
</tr></table>
<table style="width:100%;border-collapse:collapse;border:1px solid #1a56db;margin-bottom:12px;">
<tr style="background:#1a56db;color:#fff;">
  <td style="padding:8px 10px;font-weight:bold;">GROSS PAY</td>
  <td style="padding:8px 10px;text-align:right;font-weight:bold;">KES ${fmt(slip.gross_pay)}</td>
  <td style="padding:8px 10px;font-weight:bold;">TOTAL DEDUCTIONS</td>
  <td style="padding:8px 10px;text-align:right;font-weight:bold;">KES ${fmt(slip.total_deductions||(slip.gross_pay-slip.net_pay))}</td>
  <td style="padding:8px 10px;font-weight:bold;background:#0ea5e9;">NET PAY</td>
  <td style="padding:8px 10px;text-align:right;font-weight:bold;font-size:14px;background:#0ea5e9;">KES ${fmt(slip.net_pay)}</td>
</tr>
</table>
<table style="width:100%;"><tr>
  <td style="width:50%;"><p style="font-size:12px;"><b>Prepared By: GIGVA HR</b></p><p style="font-size:11px;color:#666;">This payslip is system generated</p></td>
  <td style="width:50%;text-align:right;"><p style="font-size:12px;">Authorized Signature: ___________________________</p></td>
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

    const monthName = MONTHS[(slip.period_month||1)-1]
    const htmlContent = buildPayslipHtml(slip, employee)
    const filename = 'Payslip_' + employee.name.replace(/ /g,'_') + '_' + monthName + '_' + slip.period_year + '.html'

    // Get signature
    let signatureHtml = ''
    try {
      const sigRow = db().prepare("SELECT html FROM email_signatures WHERE id = 'universal' LIMIT 1").get()
      if (sigRow?.html) signatureHtml = '<br><br><hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0">' + sigRow.html
    } catch(e) {}

    const emailBody = '<div style="font-family:Arial,sans-serif;font-size:14px;color:#333;max-width:600px;margin:0 auto;padding:24px;">' +
      '<div style="text-align:center;margin-bottom:16px;">' + GIGVA_LOGO + '</div>' +
      '<p>Dear ' + employee.name + ',</p>' +
      '<p>Please find attached your payslip for <strong>' + monthName + ' ' + slip.period_year + '</strong>.</p>' +
      '<ul style="font-size:13px;line-height:1.8;">' +
      '<li><b>Gross Pay:</b> KES ' + fmt(slip.gross_pay) + '</li>' +
      '<li><b>Total Deductions:</b> KES ' + fmt(slip.total_deductions||(slip.gross_pay-slip.net_pay)) + '</li>' +
      '<li><b>Net Pay:</b> KES ' + fmt(slip.net_pay) + '</li>' +
      '</ul>' +
      '<p style="font-size:12px;color:#666;">For questions, contact HR at <a href="mailto:hello@gigva.co.ke">hello@gigva.co.ke</a>.</p>' +
      '<p>Best regards,<br><b>Gigva HR &amp; Payroll Team</b></p>' +
      signatureHtml + '</div>'

    const { data, error } = await resend.emails.send({
      from: 'Gigva Payroll <cto@gigva.co.ke>',
      to: [employee.email],
      subject: 'Your Payslip for ' + monthName + ' ' + slip.period_year + ' - Gigva Kenya',
      html: emailBody,
      attachments: [{ filename, content: Buffer.from(htmlContent).toString('base64') }],
    })
    if (error) return NextResponse.json({ ok: false, msg: error.message }, { status: 500 })

    // Store in DB for inbox download
    try {
      const now = new Date().toISOString()
      const msgId = 'payroll-' + (slip.id||slip.slip_ref) + '-' + Date.now()
      db().prepare('INSERT OR IGNORE INTO sent_emails (id, from_email, to_email, subject, body_html, created_at) VALUES (?,?,?,?,?,?)')
        .run(msgId, 'cto@gigva.co.ke', employee.email,
          'Your Payslip for ' + monthName + ' ' + slip.period_year + ' - Gigva Kenya',
          emailBody, now)
      db().prepare('INSERT INTO message_attachments (message_id, filename, content_type, data, created_at) VALUES (?,?,?,?,?)')
        .run(msgId, filename, 'text/html', Buffer.from(htmlContent), now)
    } catch(e) {}

    return NextResponse.json({ ok: true, data })
  } catch(e) { return NextResponse.json({ ok: false, msg: e.message }, { status: 500 }) }
}
