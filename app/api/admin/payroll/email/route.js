import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/db'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

const resend = new Resend(process.env.RESEND_API_KEY)

function checkAccess(user) {
  return user && ['cto','people_ops','superadmin'].includes(user.role)
}

function fmt(n) {
  return Number(n||0).toLocaleString('en-KE',{minimumFractionDigits:2,maximumFractionDigits:2})
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function usesSHIF(month, year) {
  if (year > 2024) return true
  if (year === 2024 && month >= 12) return true
  return false
}

// Ensure messaging tables exist
function ensureInboxSchema(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS inbox_messages (
      id         TEXT PRIMARY KEY,
      to_email   TEXT NOT NULL,
      from_email TEXT NOT NULL DEFAULT '',
      from_name  TEXT NOT NULL DEFAULT '',
      subject    TEXT NOT NULL DEFAULT '',
      body_text  TEXT NOT NULL DEFAULT '',
      body_html  TEXT NOT NULL DEFAULT '',
      message_id TEXT NOT NULL DEFAULT '',
      is_read    INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS sent_emails (
      id          TEXT PRIMARY KEY,
      from_email  TEXT NOT NULL,
      to_email    TEXT NOT NULL,
      subject     TEXT NOT NULL DEFAULT '',
      body_text   TEXT NOT NULL DEFAULT '',
      body_html   TEXT NOT NULL DEFAULT '',
      resend_id   TEXT NOT NULL DEFAULT '',
      sent_at     TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS message_attachments (
      id           TEXT PRIMARY KEY,
      message_id   TEXT NOT NULL,
      filename     TEXT NOT NULL,
      mime_type    TEXT NOT NULL DEFAULT 'application/octet-stream',
      size         INTEGER NOT NULL DEFAULT 0,
      data         BLOB,
      created_at   TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_inbox_to_email ON inbox_messages(to_email);
    CREATE INDEX IF NOT EXISTS idx_msg_attachments_msg_id ON message_attachments(message_id);
  `)
}

// Helper: draw a filled rectangle
function drawRect(page, x, y, w, h, colorHex) {
  const c = hexToRgb(colorHex)
  page.drawRectangle({ x, y, width: w, height: h, color: rgb(c.r, c.g, c.b) })
}

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#',''), 16)
  return { r: ((n>>16)&255)/255, g: ((n>>8)&255)/255, b: (n&255)/255 }
}

// Generate PDF payslip buffer using pdf-lib (pure JS, no filesystem fonts)
async function buildPayslipPdf(slip, emp) {
  const monthName = MONTHS[(slip.period_month||1)-1]
  const shifApplies = usesSHIF(slip.period_month, slip.period_year)
  const healthLabel = shifApplies ? 'SHIF (2.75%)' : 'NHIF'
  const healthCode  = shifApplies ? 'SHIF' : 'NHIF'
  const healthAmount = shifApplies ? (slip.shif || 0) : (slip.nhif || 0)

  const annualEntitlement = slip.annual_leave_entitlement || 25
  const annualTaken       = slip.annual_leave_taken || 0
  const annualBalance     = slip.annual_leave_balance !== undefined ? slip.annual_leave_balance : (annualEntitlement - annualTaken)
  const sickEntitlement   = slip.sick_leave_entitlement || 10
  const sickTaken         = slip.sick_leave_taken || 0
  const sickBalance       = slip.sick_leave_balance !== undefined ? slip.sick_leave_balance : (sickEntitlement - sickTaken)

  const pdfDoc = await PDFDocument.create()
  const helvetica     = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  // A4 page: 595.28 x 841.89 pt. pdf-lib origin is bottom-left.
  const pageW_pt = 595.28
  const pageH_pt = 841.89
  const page = pdfDoc.addPage([pageW_pt, pageH_pt])

  const margin = 40
  const contentW = pageW_pt - margin * 2

  // pdf-lib uses bottom-left origin: y = pageH - top_offset
  function topY(topOffset) { return pageH_pt - topOffset }

  // ── BLUE HEADER ──
  const headerTop = 40
  const headerH   = 55
  drawRect(page, margin, topY(headerTop + headerH), contentW, headerH, '#1a56db')

  page.drawText('GIGVA KENYA', {
    x: margin + contentW / 2 - helveticaBold.widthOfTextAtSize('GIGVA KENYA', 20) / 2,
    y: topY(headerTop + 26),
    font: helveticaBold, size: 20, color: rgb(1,1,1)
  })
  const subLine = 'Westlands Business Park, Nairobi | +254 701 443 444 | hello@gigva.co.ke'
  page.drawText(subLine, {
    x: margin + contentW / 2 - helvetica.widthOfTextAtSize(subLine, 8) / 2,
    y: topY(headerTop + 46),
    font: helvetica, size: 8, color: rgb(0.58,0.77,0.99)
  })

  // ── PAYSLIP TITLE ──
  const titleTop = headerTop + headerH + 10
  const titleText = 'PAYSLIP - ' + monthName + ' ' + slip.period_year
  page.drawText(titleText, {
    x: margin + contentW / 2 - helveticaBold.widthOfTextAtSize(titleText, 13) / 2,
    y: topY(titleTop + 13),
    font: helveticaBold, size: 13, color: hexToRgb('#1a56db') ? rgb(...Object.values(hexToRgb('#1a56db'))) : rgb(0.1,0.34,0.86)
  })
  const subTitle = 'Salary Slip of ' + emp.name + ' for ' + monthName + ' ' + slip.period_year
  page.drawText(subTitle, {
    x: margin + contentW / 2 - helvetica.widthOfTextAtSize(subTitle, 9) / 2,
    y: topY(titleTop + 26),
    font: helvetica, size: 9, color: rgb(0.42,0.45,0.50)
  })

  // ── EMPLOYEE DETAILS HEADER ──
  const empSecTop = titleTop + 34
  drawRect(page, margin, topY(empSecTop + 16), contentW, 16, '#1a56db')
  page.drawText('Employee Details', {
    x: margin + 5, y: topY(empSecTop + 13),
    font: helveticaBold, size: 9, color: rgb(1,1,1)
  })

  const col3 = contentW / 3
  const empDataTop = empSecTop + 20

  function drawCell(label, value, cx, cy) {
    const lbl = (label + ':')
    page.drawText(lbl, { x: cx, y: topY(cy + 8), font: helveticaBold, size: 7.5, color: rgb(0.1,0.34,0.86) })
    page.drawText((value || '-').toString().substring(0,28), { x: cx + 52, y: topY(cy + 8), font: helvetica, size: 7.5, color: rgb(0.07,0.09,0.15) })
  }

  drawCell('NAME',        emp.name,             margin,            empDataTop)
  drawCell('DEPT',        emp.department,        margin + col3,     empDataTop)
  drawCell('REF',         slip.slip_ref,         margin + col3 * 2, empDataTop)
  drawCell('EMAIL',       emp.email,             margin,            empDataTop + 14)
  drawCell('DESIGNATION', emp.designation,       margin + col3,     empDataTop + 14)
  drawCell('PERIOD',      monthName + ' ' + slip.period_year, margin + col3 * 2, empDataTop + 14)
  drawCell('BANK ACC',    emp.bank_account,      margin,            empDataTop + 28)
  drawCell('BANK NAME',   emp.bank_name,         margin + col3,     empDataTop + 28)
  drawCell('STATUS',      emp.marital_status || 'Single', margin + col3 * 2, empDataTop + 28)

  // ── LEAVE SUMMARY ──
  const leaveTop = empDataTop + 44
  drawRect(page, margin, topY(leaveTop + 14), contentW, 14, '#1a56db')
  page.drawText('Leave Summary', {
    x: margin + 5, y: topY(leaveTop + 11),
    font: helveticaBold, size: 9, color: rgb(1,1,1)
  })

  const leaveDataTop = leaveTop + 18
  function drawLeaveCell(label, val, cx, cy) {
    page.drawText((label + ':'), { x: cx, y: topY(cy + 8), font: helveticaBold, size: 7.5, color: rgb(0.1,0.34,0.86) })
    page.drawText(String(val), { x: cx + 80, y: topY(cy + 8), font: helvetica, size: 7.5, color: rgb(0.07,0.09,0.15) })
  }
  const col6 = contentW / 3
  drawLeaveCell('Annual Entitlement', annualEntitlement + ' days', margin,         leaveDataTop)
  drawLeaveCell('Annual Taken',       annualTaken + ' days',       margin + col6,  leaveDataTop)
  drawLeaveCell('Annual Balance',     annualBalance + ' days',     margin + col6*2,leaveDataTop)
  drawLeaveCell('Sick Entitlement',   sickEntitlement + ' days',   margin,         leaveDataTop + 14)
  drawLeaveCell('Sick Taken',         sickTaken + ' days',         margin + col6,  leaveDataTop + 14)
  drawLeaveCell('Sick Balance',       sickBalance + ' days',       margin + col6*2,leaveDataTop + 14)

  // ── EARNINGS & DEDUCTIONS ──
  const tableTop = leaveDataTop + 30
  const halfW    = (contentW - 10) / 2
  const dx       = margin + halfW + 10

  // Earnings header
  drawRect(page, margin, topY(tableTop + 14), halfW, 14, '#1a56db')
  page.drawText('Earnings', { x: margin + 5, y: topY(tableTop + 11), font: helveticaBold, size: 9, color: rgb(1,1,1) })

  const earnings = [
    { code: 'BASIC_PAY',   name: 'Basic Pay',         amount: slip.basic_pay || 0,        bold: false },
    { code: 'HOUSE_ALLOW', name: 'Housing Allowance',  amount: slip.house_allowance || 0,  bold: false },
    { code: 'CAR_BENEFIT', name: 'Car Benefit',        amount: slip.car_benefit || 0,       bold: false },
    { code: 'OTHER_ALLOW', name: 'Other Allowances',   amount: slip.other_allowances || 0, bold: false },
    { code: 'GROSS_PAY',   name: 'Gross Pay',          amount: slip.gross_pay || 0,        bold: true  },
  ]

  let ey = tableTop + 18
  earnings.forEach((item, i) => {
    if (i % 2 === 0) drawRect(page, margin, topY(ey + 13), halfW, 13, '#f0f5ff')
    const font = item.bold ? helveticaBold : helvetica
    const color = item.bold ? rgb(0.1,0.34,0.86) : rgb(0.07,0.09,0.15)
    page.drawText(item.code, { x: margin + 3, y: topY(ey + 10), font, size: 7.5, color })
    page.drawText(item.name.substring(0,22), { x: margin + 58, y: topY(ey + 10), font, size: 7.5, color })
    const amtTxt = 'KES ' + fmt(item.amount)
    page.drawText(amtTxt, {
      x: margin + halfW - helvetica.widthOfTextAtSize(amtTxt, 7.5) - 4,
      y: topY(ey + 10), font, size: 7.5, color
    })
    ey += 13
  })

  // Deductions header
  drawRect(page, dx, topY(tableTop + 14), halfW, 14, '#b91c1c')
  page.drawText('Deductions', { x: dx + 5, y: topY(tableTop + 11), font: helveticaBold, size: 9, color: rgb(1,1,1) })

  const deductions = [
    { code: 'NSSF_T1', name: 'NSSF Tier I',     amount: slip.nssf_tier1 || 0,    bold: false },
    { code: 'NSSF_T2', name: 'NSSF Tier II',    amount: slip.nssf_tier2 || 0,    bold: false },
    { code: healthCode, name: healthLabel,        amount: healthAmount,             bold: false },
    { code: 'AHL',     name: 'Housing Levy',     amount: slip.housing_levy || 0,  bold: false },
    { code: 'PAYE',    name: 'PAYE',             amount: slip.paye || 0,          bold: false },
    { code: 'NET_TAX', name: 'Net Tax Payable',  amount: slip.net_tax || 0,       bold: true  },
  ].filter(r => r.amount > 0)

  let dy2 = tableTop + 18
  deductions.forEach((item, i) => {
    if (i % 2 === 0) drawRect(page, dx, topY(dy2 + 13), halfW, 13, '#fff5f5')
    const font = item.bold ? helveticaBold : helvetica
    const color = item.bold ? rgb(0.72,0.11,0.11) : rgb(0.07,0.09,0.15)
    page.drawText(item.code, { x: dx + 3, y: topY(dy2 + 10), font, size: 7.5, color })
    page.drawText(item.name.substring(0,22), { x: dx + 52, y: topY(dy2 + 10), font, size: 7.5, color })
    const amtTxt = 'KES ' + fmt(item.amount)
    page.drawText(amtTxt, {
      x: dx + halfW - helvetica.widthOfTextAtSize(amtTxt, 7.5) - 4,
      y: topY(dy2 + 10), font, size: 7.5, color
    })
    dy2 += 13
  })

  // ── NET PAY SUMMARY BAR ──
  const summaryTop = Math.max(ey, dy2) + 10
  drawRect(page, margin, topY(summaryTop + 24), contentW, 24, '#1a56db')

  const grossTxt = 'Gross: KES ' + fmt(slip.gross_pay)
  const dedTxt   = 'Deductions: KES ' + fmt(slip.total_deductions || (slip.gross_pay - slip.net_pay))
  const netTxt   = 'NET PAY: KES ' + fmt(slip.net_pay)

  page.drawText(grossTxt, { x: margin + 5, y: topY(summaryTop + 15), font: helveticaBold, size: 8, color: rgb(0.88,0.95,0.99) })
  page.drawText(dedTxt,   { x: margin + contentW * 0.36, y: topY(summaryTop + 15), font: helveticaBold, size: 8, color: rgb(0.99,0.64,0.64) })
  page.drawText(netTxt,   {
    x: margin + contentW - helveticaBold.widthOfTextAtSize(netTxt, 10) - 5,
    y: topY(summaryTop + 16), font: helveticaBold, size: 10, color: rgb(0.98,0.75,0.14)
  })

  // ── FOOTER ──
  const footerTop = summaryTop + 34
  page.drawLine({ start: { x: margin, y: topY(footerTop) }, end: { x: margin + contentW, y: topY(footerTop) }, thickness: 0.5, color: rgb(0.82,0.84,0.87) })
  page.drawText('Prepared By: GIGVA HR  |  System-generated payslip', { x: margin, y: topY(footerTop + 12), font: helvetica, size: 8, color: rgb(0.42,0.45,0.50) })
  page.drawText('Gigva Kenya | +254 701 443 444 | hello@gigva.co.ke', {
    x: margin + contentW - helvetica.widthOfTextAtSize('Gigva Kenya | +254 701 443 444 | hello@gigva.co.ke', 8) - 2,
    y: topY(footerTop + 12), font: helvetica, size: 8, color: rgb(0.42,0.45,0.50)
  })

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}

function buildEmailBodyHtml(slip, employee, monthName, filename) {
  const LOGO = '<svg width="120" height="32" viewBox="0 0 152 40" xmlns="http://www.w3.org/2000/svg"><g><rect x="0" y="0" width="40" height="40" rx="9" fill="#0ea5e9"/><path d="M28.5 10.5 A10.5 10.5 0 1 0 28.5 29.5" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none"/><line x1="28.5" y1="20" x2="20.5" y2="20" stroke="#fff" stroke-width="4" stroke-linecap="round"/><line x1="28.5" y1="29.5" x2="28.5" y2="24" stroke="#fff" stroke-width="4" stroke-linecap="round"/></g><text x="49" y="24" font-family="system-ui,sans-serif" font-weight="800" font-size="18" fill="#0ea5e9">GIGVA</text><text x="50" y="35" font-family="system-ui,sans-serif" font-weight="700" font-size="7.5" fill="#7dd3fc" letter-spacing="3.5">KENYA</text></svg>'

  function fmtH(n) { return Number(n||0).toLocaleString('en-KE',{minimumFractionDigits:2,maximumFractionDigits:2}) }

  const total = slip.total_deductions || (slip.gross_pay - slip.net_pay)
  return '<div style="font-family:Arial,sans-serif;font-size:14px;color:#333;max-width:600px;margin:0 auto;padding:24px;">' +
    '<div style="text-align:center;margin-bottom:16px;">' + LOGO + '</div>' +
    '<p>Dear ' + employee.name + ',</p>' +
    '<p>Please find your payslip for <strong>' + monthName + ' ' + slip.period_year + '</strong> attached as a PDF to this email.</p>' +
    '<table style="width:100%;border-collapse:collapse;background:#f0f5ff;border:2px solid #1a56db;margin:12px 0;">' +
    '<tr><td colspan="2" style="padding:10px 14px;font-weight:bold;color:#fff;background:#1a56db;font-size:13px;">Payslip Summary - ' + monthName + ' ' + slip.period_year + '</td></tr>' +
    '<tr><td style="padding:6px 14px;">Gross Pay</td><td style="padding:6px 14px;font-weight:bold;text-align:right;">KES ' + fmtH(slip.gross_pay) + '</td></tr>' +
    '<tr style="background:#e8f0fe;"><td style="padding:6px 14px;">Total Deductions</td><td style="padding:6px 14px;font-weight:bold;text-align:right;color:#b91c1c;">KES ' + fmtH(total) + '</td></tr>' +
    '<tr style="background:#dbeafe;"><td style="padding:8px 14px;font-weight:bold;font-size:15px;">NET PAY</td><td style="padding:8px 14px;font-weight:bold;text-align:right;color:#1a56db;font-size:16px;">KES ' + fmtH(slip.net_pay) + '</td></tr>' +
    '</table>' +
    '<div style="background:#ecfdf5;border:2px solid #10b981;border-radius:6px;padding:12px 16px;margin:12px 0;">' +
    '<p style="margin:0;font-size:14px;"><strong>PDF Attachment:</strong> Your full payslip is attached as <strong>' + filename + '</strong>.</p>' +
    '<p style="margin:6px 0 0;font-size:12px;color:#059669;">Open the attached PDF to view all earnings, deductions, and leave details. You can also download it from your inbox.</p>' +
    '</div>' +
    '<p style="font-size:12px;color:#666;">For questions contact HR: <a href="mailto:hello@gigva.co.ke">hello@gigva.co.ke</a></p>' +
    '<p>Best regards,<br><b>Gigva HR &amp; People Team</b></p></div>'
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
    const filename  = 'Payslip_' + employee.name.replace(/\s+/g,'_') + '_' + monthName + '_' + slip.period_year + '.pdf'

    // Generate PDF using pdf-lib (pure JS, no filesystem font files)
    const pdfBuffer = await buildPayslipPdf(slip, employee)
    const pdfBase64 = pdfBuffer.toString('base64')

    // Build email body
    const emailBody = buildEmailBodyHtml(slip, employee, monthName, filename)

    // Optional signature
    let signatureHtml = ''
    try {
      const sigRow = db().prepare("SELECT html FROM email_signatures WHERE id = 'universal' LIMIT 1").get()
      if (sigRow?.html) signatureHtml = '<br><hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0">' + sigRow.html
    } catch(e) {}

    const fullBody = emailBody + signatureHtml

    // Send via Resend
    const { data, error } = await resend.emails.send({
      from: 'Gigva Payroll <cto@gigva.co.ke>',
      to: [employee.email],
      subject: 'Your Payslip for ' + monthName + ' ' + slip.period_year + ' - Gigva Kenya',
      html: fullBody,
      attachments: [{ filename, content: pdfBase64 }],
    })
    if (error) return NextResponse.json({ ok: false, msg: error.message }, { status: 500 })

    // Store in inbox_messages + message_attachments for staff inbox
    try {
      const database = db()
      ensureInboxSchema(database)
      const now = new Date().toISOString()
      const msgId = 'payroll-' + (slip.id || slip.slip_ref || 'x') + '-' + Date.now().toString(36)

      database.prepare(
        'INSERT OR IGNORE INTO inbox_messages (id,to_email,from_email,from_name,subject,body_text,body_html,message_id,is_read,created_at) VALUES (?,?,?,?,?,?,?,?,0,?)'
      ).run(msgId, employee.email, 'cto@gigva.co.ke', 'Gigva Payroll',
        'Your Payslip for ' + monthName + ' ' + slip.period_year + ' - Gigva Kenya',
        'Payslip for ' + monthName + ' ' + slip.period_year + '. See PDF attachment.',
        fullBody, data?.id || msgId, now)

      database.prepare(
        'INSERT OR IGNORE INTO message_attachments (id,message_id,filename,mime_type,size,data,created_at) VALUES (?,?,?,?,?,?,?)'
      ).run(msgId + '-a1', msgId, filename, 'application/pdf', pdfBuffer.length, pdfBuffer, now)

      database.prepare(
        'INSERT OR IGNORE INTO sent_emails (id,from_email,to_email,subject,body_text,body_html,resend_id,sent_at) VALUES (?,?,?,?,?,?,?,?)'
      ).run(msgId + '-s', 'cto@gigva.co.ke', employee.email,
        'Your Payslip for ' + monthName + ' ' + slip.period_year + ' - Gigva Kenya',
        'Payslip ' + monthName + ' ' + slip.period_year, fullBody, data?.id || '', now)
    } catch(e) {
      console.error('[payroll/email] db store error:', e.message)
    }

    return NextResponse.json({ ok: true, data })
  } catch(e) { return NextResponse.json({ ok: false, msg: e.message }, { status: 500 }) }
}
