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

  // pdf-lib: y = pageH - topOffset (bottom-left origin)
  function topY(topOffset) { return pageH_pt - topOffset }

  // ── HEADER: address left | Payslip center | Logo right ──
  const headerTop = 36
  const addrLines = [
    { text: 'Westlands Business Park, Nairobi', bold: true,  size: 9 },
    { text: 'P.O Box 00100, Kenya',             bold: false, size: 8 },
    { text: '+254 701 443 444',                  bold: false, size: 8 },
    { text: 'hello@gigva.co.ke',                 bold: false, size: 8 },
    { text: 'www.gigva.co.ke',                   bold: false, size: 8 },
  ]
  addrLines.forEach((l, i) => {
    page.drawText(l.text, { x: margin, y: topY(headerTop + i * 11), font: l.bold ? helveticaBold : helvetica, size: l.size, color: rgb(0.22, 0.27, 0.36) })
  })

  // Center: "Payslip" button box
  const psLabel = 'Payslip'
  const psBtnW = helveticaBold.widthOfTextAtSize(psLabel, 14) + 28
  const psBtnX = margin + contentW / 2 - psBtnW / 2
  const psBtnTop = headerTop + 5
  drawRect(page, psBtnX, topY(psBtnTop + 22), psBtnW, 22, '#1a56db')
  page.drawText(psLabel, { x: psBtnX + 14, y: topY(psBtnTop + 15), font: helveticaBold, size: 14, color: rgb(1,1,1) })

  // Right: GIGVA logo
  const logoX = margin + contentW - 110
  const logoTop = headerTop + 2
  drawRect(page, logoX, topY(logoTop + 34), 34, 34, '#0ea5e9')
  page.drawText('G', { x: logoX + 9, y: topY(logoTop + 20), font: helveticaBold, size: 18, color: rgb(1,1,1) })
  page.drawText('GIGVA',  { x: logoX + 42, y: topY(logoTop + 16), font: helveticaBold, size: 14, color: rgb(0.055, 0.647, 0.914) })
  page.drawText('KENYA',  { x: logoX + 42, y: topY(logoTop + 28), font: helvetica, size: 7.5, color: rgb(0.39, 0.45, 0.55) })

  // Divider
  page.drawLine({ start: { x: margin, y: topY(headerTop + 58) }, end: { x: margin + contentW, y: topY(headerTop + 58) }, thickness: 0.8, color: rgb(0.88, 0.9, 0.92) })

  // ── SALARY SLIP TITLE BAR ──
  const titleTop = headerTop + 64
  drawRect(page, margin, topY(titleTop + 18), contentW, 18, '#1a56db')
  const titleText = 'Salary Slip of ' + emp.name + ' for ' + monthName + ' ' + slip.period_year
  page.drawText(titleText, {
    x: margin + contentW / 2 - helveticaBold.widthOfTextAtSize(titleText, 10) / 2,
    y: topY(titleTop + 13), font: helveticaBold, size: 10, color: rgb(1,1,1)
  })

  // ── PERSONAL DETAILS ──
  const pdTop = titleTop + 24
  drawRect(page, margin, topY(pdTop + 14), contentW, 14, '#1a56db')
  page.drawText('Personal Details', { x: margin + 5, y: topY(pdTop + 10), font: helveticaBold, size: 8.5, color: rgb(1,1,1) })

  const col3 = contentW / 3
  const cellH = 13
  function drawPdCell(label, value, cx, cy) {
    page.drawText(label + ':', { x: cx + 3, y: topY(cy + 9), font: helveticaBold, size: 7, color: rgb(0.1, 0.34, 0.86) })
    const lw = helveticaBold.widthOfTextAtSize(label + ': ', 7)
    page.drawText((value || '\u2014').substring(0, 28), { x: cx + 3 + lw, y: topY(cy + 9), font: helvetica, size: 7, color: rgb(0.07, 0.09, 0.15) })
  }
  const pdRows = [
    [
      { label: 'EMP NAME',     value: emp.name || '\u2014' },
      { label: 'DEPT',         value: emp.department || '\u2014' },
      { label: 'REF',          value: slip.ref_code || emp.employee_id || '\u2014' },
    ],[
      { label: 'ADDRESS',      value: emp.address || '\u2014' },
      { label: 'DESIGNATION',  value: emp.designation || emp.role || '\u2014' },
      { label: 'PERIOD START', value: slip.leave_from || '' },
    ],[
      { label: 'PHONE',        value: emp.phone || '\u2014' },
      { label: 'ID NO',        value: emp.id_number || '\u2014' },
      { label: 'PERIOD END',   value: slip.leave_to || '' },
    ],[
      { label: 'EMAIL',         value: emp.email || '\u2014' },
      { label: 'DATE EMPLOYED', value: emp.date_employed || emp.hire_date || '\u2014' },
      { label: 'BANK ACCOUNT',  value: emp.bank_account || '\u2014' },
    ],[
      { label: 'MARITAL STATUS', value: emp.marital_status || '\u2014' },
      { label: '',               value: '' },
      { label: 'BANK NAME',      value: (emp.bank_name || '\u2014') + (emp.bank_code ? ' | CODE: ' + emp.bank_code : '') },
    ],
  ]
  const pdDataTop = pdTop + 14
  pdRows.forEach((row, ri) => {
    const cy = pdDataTop + ri * cellH
    const bg = ri % 2 === 0 ? '#f7f9ff' : '#ffffff'
    drawRect(page, margin, topY(cy + cellH), contentW, cellH, bg)
    row.forEach((cell, ci) => drawPdCell(cell.label, cell.value, margin + ci * col3, cy))
    page.drawLine({ start: { x: margin, y: topY(cy + cellH) }, end: { x: margin + contentW, y: topY(cy + cellH) }, thickness: 0.3, color: rgb(0.82, 0.85, 0.9) })
  })
  page.drawRectangle({ x: margin, y: topY(pdDataTop + cellH * 5), width: contentW, height: cellH * 5, borderColor: rgb(0.82, 0.85, 0.9), borderWidth: 0.5 })
  page.drawLine({ start: { x: margin + col3, y: topY(pdDataTop) }, end: { x: margin + col3, y: topY(pdDataTop + cellH * 5) }, thickness: 0.3, color: rgb(0.82, 0.85, 0.9) })
  page.drawLine({ start: { x: margin + col3 * 2, y: topY(pdDataTop) }, end: { x: margin + col3 * 2, y: topY(pdDataTop + cellH * 5) }, thickness: 0.3, color: rgb(0.82, 0.85, 0.9) })

  // ── EARNINGS & DEDUCTIONS (side by side) ──
  const tableTop = pdDataTop + cellH * 5 + 10
  const halfW = contentW / 2 - 5
  const dxCol = margin + halfW + 10

  const earnings = [
    { code: 'BASIC_PAY',   name: 'Basic Pay',         amount: slip.basic_pay || 0,        bold: false },
    { code: 'HOUSE_ALLOW', name: 'Housing Allowance',  amount: slip.house_allowance || 0,  bold: false },
    { code: 'CAR_BENEFIT', name: 'Car Benefit',        amount: slip.car_benefit || 0,      bold: false },
    { code: 'OTHER_ALLOW', name: 'Other Allowances',   amount: slip.other_allowances || 0, bold: false },
    { code: 'GROSS_PAY',   name: 'Gross Pay',          amount: slip.gross_pay || 0,        bold: true  },
  ]
  const deductions = [
    { code: 'NSSF_T1',    name: 'NSSF Tier I (6% of first KES 6,000)',  amount: slip.nssf_tier1 || 0,         bold: false },
    { code: 'NSSF_T2',    name: 'NSSF Tier II (6% of next KES 12,000)', amount: slip.nssf_tier2 || 0,         bold: false },
    { code: healthCode,   name: healthLabel,                              amount: healthAmount,                  bold: false },
    { code: 'AHL',        name: 'Affordable Housing Levy (1.5%)',        amount: slip.housing_levy || 0,       bold: false },
    { code: 'PAYE',       name: 'Pay As You Earn (PAYE)',                amount: slip.paye || 0,               bold: false },
    { code: 'PER_RELIEF', name: 'Personal Tax Relief (Credit)',          amount: slip.personal_relief || 2400, bold: false },
    { code: 'NET_TAX',    name: 'Net Tax Payable',                       amount: slip.net_tax || 0,            bold: true  },
  ]

  // Earnings section
  drawRect(page, margin, topY(tableTop + 14), halfW, 14, '#1a56db')
  page.drawText('Earnings', { x: margin + 5, y: topY(tableTop + 10), font: helveticaBold, size: 9, color: rgb(1,1,1) })
  const eColHdrTop = tableTop + 14
  drawRect(page, margin, topY(eColHdrTop + 12), halfW, 12, '#1a56db')
  page.drawText('Code',         { x: margin + 3,              y: topY(eColHdrTop + 8), font: helveticaBold, size: 7, color: rgb(1,1,1) })
  page.drawText('Description',  { x: margin + halfW * 0.3,    y: topY(eColHdrTop + 8), font: helveticaBold, size: 7, color: rgb(1,1,1) })
  page.drawText('Amount (KES)', { x: margin + halfW - 54,     y: topY(eColHdrTop + 8), font: helveticaBold, size: 7, color: rgb(1,1,1) })
  let ey = eColHdrTop + 12
  earnings.forEach((row, i) => {
    drawRect(page, margin, topY(ey + 12), halfW, 12, i % 2 === 0 ? '#f0f5ff' : '#ffffff')
    const font = row.bold ? helveticaBold : helvetica
    const color = row.bold ? rgb(0.1,0.34,0.86) : rgb(0.22,0.27,0.36)
    page.drawText(row.code, { x: margin + 3, y: topY(ey + 9), font, size: 7, color })
    page.drawText(row.name, { x: margin + halfW * 0.3, y: topY(ey + 9), font, size: 7, color })
    const at = fmt(row.amount)
    page.drawText(at, { x: margin + halfW - helvetica.widthOfTextAtSize(at, 7) - 4, y: topY(ey + 9), font, size: 7, color })
    ey += 12
  })

  // Deductions section
  drawRect(page, dxCol, topY(tableTop + 14), halfW, 14, '#9b1c1c')
  page.drawText('Deductions', { x: dxCol + 5, y: topY(tableTop + 10), font: helveticaBold, size: 9, color: rgb(1,1,1) })
  drawRect(page, dxCol, topY(eColHdrTop + 12), halfW, 12, '#9b1c1c')
  page.drawText('Code',         { x: dxCol + 3,              y: topY(eColHdrTop + 8), font: helveticaBold, size: 7, color: rgb(1,1,1) })
  page.drawText('Description',  { x: dxCol + halfW * 0.3,    y: topY(eColHdrTop + 8), font: helveticaBold, size: 7, color: rgb(1,1,1) })
  page.drawText('Amount (KES)', { x: dxCol + halfW - 54,     y: topY(eColHdrTop + 8), font: helveticaBold, size: 7, color: rgb(1,1,1) })
  let dy2 = eColHdrTop + 12
  deductions.forEach((row, i) => {
    drawRect(page, dxCol, topY(dy2 + 12), halfW, 12, i % 2 === 0 ? '#fff5f5' : '#ffffff')
    const font = row.bold ? helveticaBold : helvetica
    const color = row.bold ? rgb(0.73,0.11,0.11) : rgb(0.22,0.27,0.36)
    page.drawText(row.code, { x: dxCol + 3, y: topY(dy2 + 9), font, size: 7, color })
    page.drawText(row.name.substring(0, 36), { x: dxCol + halfW * 0.3, y: topY(dy2 + 9), font, size: 7, color })
    const at = fmt(row.amount)
    page.drawText(at, { x: dxCol + halfW - helvetica.widthOfTextAtSize(at, 7) - 4, y: topY(dy2 + 9), font, size: 7, color })
    dy2 += 12
  })

  // ── NET PAY SUMMARY BAR ──
  const summaryTop = Math.max(ey, dy2) + 10
  const col3w = contentW / 3
  drawRect(page, margin,             topY(summaryTop + 28), col3w, 28, '#1a56db')
  drawRect(page, margin + col3w,     topY(summaryTop + 28), col3w, 28, '#1e3a8a')
  drawRect(page, margin + col3w * 2, topY(summaryTop + 28), col3w, 28, '#1e3a8a')

  page.drawText('GROSS PAY', { x: margin + 6, y: topY(summaryTop + 11), font: helveticaBold, size: 8, color: rgb(1,1,1) })
  page.drawText('KES ' + fmt(slip.gross_pay || 0), { x: margin + 6, y: topY(summaryTop + 23), font: helveticaBold, size: 10, color: rgb(1,1,1) })
  page.drawText('TOTAL DEDUCTIONS', { x: margin + col3w + 6, y: topY(summaryTop + 11), font: helveticaBold, size: 8, color: rgb(1,1,1) })
  page.drawText('KES ' + fmt(slip.total_deductions || 0), { x: margin + col3w + 6, y: topY(summaryTop + 23), font: helveticaBold, size: 10, color: rgb(1,1,1) })
  page.drawText('NET PAY', { x: margin + col3w * 2 + 6, y: topY(summaryTop + 11), font: helveticaBold, size: 8, color: rgb(1,1,1) })
  page.drawText('KES ' + fmt(slip.net_pay || 0), { x: margin + col3w * 2 + 6, y: topY(summaryTop + 23), font: helveticaBold, size: 10, color: rgb(0.98,0.75,0.14) })

  // ── PREPARED BY + STAMP + AUTHORIZED SIGNATURE ──
  const footerTop = summaryTop + 38
  page.drawText('Prepared By: FATUMA KAMAU', { x: margin, y: topY(footerTop + 12), font: helveticaBold, size: 9, color: rgb(0.07,0.09,0.15) })
  // Authorized signature line
  const sigX = margin + contentW - 200
  page.drawText('Authorized Signature:', { x: sigX, y: topY(footerTop + 62), font: helvetica, size: 8, color: rgb(0.22,0.27,0.36) })
  const sigLabelW2 = helvetica.widthOfTextAtSize('Authorized Signature: ', 8)
  page.drawLine({ start: { x: sigX + sigLabelW2, y: topY(footerTop + 62) }, end: { x: sigX + 190, y: topY(footerTop + 62) }, thickness: 0.7, color: rgb(0.22,0.27,0.36) })
  // Stamp image
  try {
    const siteBase = process.env.NEXT_PUBLIC_SITE_URL || 'https://gigva.co.ke'
    const stampRes = await fetch(siteBase + '/gigva-stamp.png')
    if (stampRes.ok) {
      const stampBytes = await stampRes.arrayBuffer()
      const stampImg   = await pdfDoc.embedPng(stampBytes)
      page.drawImage(stampImg, { x: margin, y: topY(footerTop + 88), width: 70, height: 70, opacity: 0.82 })
    }
  } catch (_) { /* stamp optional */ }

  // ── BOTTOM FOOTER ──
  const footDivTop = footerTop + 98
  page.drawLine({ start: { x: margin, y: topY(footDivTop) }, end: { x: margin + contentW, y: topY(footDivTop) }, thickness: 0.5, color: rgb(0.82,0.84,0.87) })
  const footText = 'Gigva Kenya  |  +254 701 443 444  |  hello@gigva.co.ke  |  www.gigva.co.ke'
  page.drawText(footText, {
    x: margin + contentW / 2 - helvetica.widthOfTextAtSize(footText, 8) / 2,
    y: topY(footDivTop + 12), font: helvetica, size: 8, color: rgb(0.42,0.45,0.50)
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

    // Store in sent_emails (first, for FK constraint), inbox_messages, and message_attachments
    try {
      const database = db()
      ensureInboxSchema(database)
      const now = new Date().toISOString()
      const msgId = 'payroll-' + (slip.id || slip.slip_ref || 'x') + '-' + Date.now().toString(36)

      // 1. Insert into sent_emails FIRST (message_attachments has FK → sent_emails.id)
      database.prepare(
        'INSERT OR IGNORE INTO sent_emails (id,from_email,to_email,subject,body_text,body_html,resend_id,sent_at) VALUES (?,?,?,?,?,?,?,?)'
      ).run(msgId, 'cto@gigva.co.ke', employee.email,
        'Your Payslip for ' + monthName + ' ' + slip.period_year + ' - Gigva Kenya',
        'Payslip for ' + monthName + ' ' + slip.period_year + '. See PDF attachment.',
        fullBody, data?.id || '', now)

      // 2. Insert into inbox_messages (same id as sent_emails for easy cross-reference)
      database.prepare(
        'INSERT OR IGNORE INTO inbox_messages (id,to_email,from_email,from_name,subject,body_text,body_html,message_id,is_read,created_at) VALUES (?,?,?,?,?,?,?,?,0,?)'
      ).run(msgId, employee.email, 'cto@gigva.co.ke', 'Gigva Payroll',
        'Your Payslip for ' + monthName + ' ' + slip.period_year + ' - Gigva Kenya',
        'Payslip for ' + monthName + ' ' + slip.period_year + '. See PDF attachment.',
        fullBody, data?.id || msgId, now)

      // 3. Insert attachment with message_id = msgId (satisfies FK → sent_emails.id)
      database.prepare(
        'INSERT OR IGNORE INTO message_attachments (id,message_id,filename,mime_type,size,data,created_at) VALUES (?,?,?,?,?,?,?)'
      ).run(msgId + '-a1', msgId, filename, 'application/pdf', pdfBuffer.length, pdfBuffer, now)
    } catch(e) {
      console.error('[payroll/email] db store error:', e.message)
    }

    return NextResponse.json({ ok: true, data })
  } catch(e) { return NextResponse.json({ ok: false, msg: e.message }, { status: 500 }) }
}
