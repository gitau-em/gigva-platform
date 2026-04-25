import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/db'
import PDFDocument from 'pdfkit'

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

// Generate PDF payslip buffer
async function buildPayslipPdf(slip, emp) {
  const monthName = MONTHS[(slip.period_month||1)-1]
  const shifApplies = usesSHIF(slip.period_month, slip.period_year)
  const healthLabel = shifApplies ? 'Social Health Insurance Fund (SHIF 2.75%)' : 'National Hospital Insurance Fund (NHIF)'
  const healthCode  = shifApplies ? 'SHIF' : 'NHIF'
  const healthAmount = shifApplies ? (slip.shif || 0) : (slip.nhif || 0)

  const annualEntitlement = slip.annual_leave_entitlement || 25
  const annualTaken       = slip.annual_leave_taken || 0
  const annualBalance     = slip.annual_leave_balance !== undefined ? slip.annual_leave_balance : (annualEntitlement - annualTaken)
  const sickEntitlement   = slip.sick_leave_entitlement || 10
  const sickTaken         = slip.sick_leave_taken || 0
  const sickBalance       = slip.sick_leave_balance !== undefined ? slip.sick_leave_balance : (sickEntitlement - sickTaken)

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' })
    const chunks = []
    doc.on('data', chunk => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const BLUE    = '#1a56db'
    const RED     = '#b91c1c'
    const GRAY    = '#6b7280'
    const BLACK   = '#111827'
    const pageW   = doc.page.width - 80

    // Header
    doc.rect(40, 40, pageW, 50).fill(BLUE)
    doc.fontSize(20).fillColor('#ffffff').font('Helvetica-Bold')
      .text('GIGVA KENYA', 40, 52, { width: pageW, align: 'center' })
    doc.fontSize(9).fillColor('#93c5fd').font('Helvetica')
      .text('Westlands Business Park, Nairobi, Kenya  |  +254 701 443 444  |  hello@gigva.co.ke', 40, 75, { width: pageW, align: 'center' })

    doc.y = 105

    // Title
    doc.fontSize(14).fillColor(BLUE).font('Helvetica-Bold')
      .text('PAYSLIP', 40, doc.y, { width: pageW, align: 'center' })
    doc.fontSize(10).fillColor(GRAY).font('Helvetica')
      .text('Salary Slip of ' + emp.name + ' for ' + monthName + ' ' + slip.period_year, 40, doc.y + 2, { width: pageW, align: 'center' })

    doc.moveDown(1)
    const y0 = doc.y

    // Employee Details
    doc.rect(40, y0, pageW, 16).fill(BLUE)
    doc.fontSize(9).fillColor('#ffffff').font('Helvetica-Bold')
      .text('Employee Details', 45, y0 + 4)

    const col3 = pageW / 3
    const detY = y0 + 20

    function cell(label, value, x, y) {
      doc.fontSize(7.5).font('Helvetica-Bold').fillColor(BLUE).text(label + ':', x, y, { width: 55 })
      doc.fontSize(7.5).font('Helvetica').fillColor(BLACK).text(value || '-', x + 57, y, { width: col3 - 62 })
    }

    cell('NAME', emp.name, 40, detY)
    cell('DEPT', emp.department, 40 + col3, detY)
    cell('REF', slip.slip_ref, 40 + col3*2, detY)
    cell('EMAIL', emp.email, 40, detY + 14)
    cell('DESIGNATION', emp.designation, 40 + col3, detY + 14)
    cell('PERIOD', monthName + ' ' + slip.period_year, 40 + col3*2, detY + 14)
    cell('BANK ACC', emp.bank_account, 40, detY + 28)
    cell('BANK NAME', emp.bank_name, 40 + col3, detY + 28)
    cell('STATUS', emp.marital_status || 'Single', 40 + col3*2, detY + 28)

    doc.y = detY + 44

    // Leave Summary
    const leaveY = doc.y
    doc.rect(40, leaveY, pageW, 14).fill(BLUE)
    doc.fontSize(9).fillColor('#ffffff').font('Helvetica-Bold').text('Leave Summary', 45, leaveY + 3)

    const col6 = pageW / 3
    function leaveCell(label, val, x, y) {
      doc.fontSize(7.5).font('Helvetica-Bold').fillColor(BLUE).text(label + ':', x, y, { width: 80 })
      doc.fontSize(7.5).font('Helvetica').fillColor(BLACK).text(String(val), x + 82, y, { width: col6 - 87 })
    }

    leaveCell('Annual Entitlement', annualEntitlement + ' days', 40, leaveY + 18)
    leaveCell('Annual Taken', annualTaken + ' days', 40 + col6, leaveY + 18)
    leaveCell('Annual Balance', annualBalance + ' days', 40 + col6*2, leaveY + 18)
    leaveCell('Sick Entitlement', sickEntitlement + ' days', 40, leaveY + 32)
    leaveCell('Sick Taken', sickTaken + ' days', 40 + col6, leaveY + 32)
    leaveCell('Sick Balance', sickBalance + ' days', 40 + col6*2, leaveY + 32)

    doc.y = leaveY + 48

    // Earnings & Deductions
    const tableY = doc.y
    const halfW  = (pageW - 10) / 2

    // Earnings header
    doc.rect(40, tableY, halfW, 14).fill(BLUE)
    doc.fontSize(9).fillColor('#ffffff').font('Helvetica-Bold').text('Earnings', 45, tableY + 3)

    const earnings = [
      { code: 'BASIC_PAY',   name: 'Basic Pay',         amount: slip.basic_pay || 0, bold: false },
      { code: 'HOUSE_ALLOW', name: 'Housing Allowance',  amount: slip.house_allowance || 0, bold: false },
      { code: 'CAR_BENEFIT', name: 'Car Benefit',        amount: slip.car_benefit || 0, bold: false },
      { code: 'OTHER_ALLOW', name: 'Other Allowances',   amount: slip.other_allowances || 0, bold: false },
      { code: 'GROSS_PAY',   name: 'Gross Pay',          amount: slip.gross_pay || 0, bold: true },
    ]

    let ey = tableY + 18
    earnings.forEach((item, i) => {
      if (i % 2 === 0) doc.rect(40, ey, halfW, 13).fill('#f0f5ff')
      doc.fontSize(7.5).font(item.bold ? 'Helvetica-Bold' : 'Helvetica').fillColor(item.bold ? BLUE : BLACK)
        .text(item.code, 43, ey + 3, { width: 55 })
        .text(item.name, 100, ey + 3, { width: halfW - 120 })
        .text('KES ' + fmt(item.amount), 40 + halfW - 78, ey + 3, { width: 74, align: 'right' })
      ey += 13
    })

    // Deductions header
    const dx = 40 + halfW + 10
    doc.rect(dx, tableY, halfW, 14).fill(RED)
    doc.fontSize(9).fillColor('#ffffff').font('Helvetica-Bold').text('Deductions', dx + 5, tableY + 3)

    const deductions = [
      { code: 'NSSF_T1', name: 'NSSF Tier I (6% x KES 6,000)',  amount: slip.nssf_tier1 || 0, bold: false },
      { code: 'NSSF_T2', name: 'NSSF Tier II (6% x KES 12,000)',amount: slip.nssf_tier2 || 0, bold: false },
      { code: healthCode, name: healthLabel,                       amount: healthAmount, bold: false },
      { code: 'AHL',     name: 'Affordable Housing Levy (1.5%)',  amount: slip.housing_levy || 0, bold: false },
      { code: 'PAYE',    name: 'Pay As You Earn (PAYE)',          amount: slip.paye || 0, bold: false },
      { code: 'RELIEF',  name: 'Personal Tax Relief',             amount: slip.personal_relief || 0, bold: false },
      { code: 'NET_TAX', name: 'Net Tax Payable',                 amount: slip.net_tax || 0, bold: true },
    ].filter(r => r.amount > 0)

    let dy2 = tableY + 18
    deductions.forEach((item, i) => {
      if (i % 2 === 0) doc.rect(dx, dy2, halfW, 13).fill('#fff5f5')
      doc.fontSize(7.5).font(item.bold ? 'Helvetica-Bold' : 'Helvetica').fillColor(item.bold ? RED : BLACK)
        .text(item.code, dx + 3, dy2 + 3, { width: 48 })
        .text(item.name, dx + 52, dy2 + 3, { width: halfW - 125 })
        .text('KES ' + fmt(item.amount), dx + halfW - 78, dy2 + 3, { width: 74, align: 'right' })
      dy2 += 13
    })

    const summaryY = Math.max(ey, dy2) + 8

    // Net Pay bar
    doc.rect(40, summaryY, pageW, 22).fill(BLUE)
    const s = summaryY + 6
    doc.fontSize(9).fillColor('#ffffff').font('Helvetica-Bold').text('GROSS PAY', 45, s, { width: 75 })
    doc.fontSize(9).fillColor('#e0f2fe').font('Helvetica').text('KES ' + fmt(slip.gross_pay), 120, s, { width: pageW/3 - 80 })
    doc.fontSize(9).fillColor('#ffffff').font('Helvetica-Bold').text('DEDUCTIONS', 40 + pageW/3, s, { width: 80 })
    doc.fontSize(9).fillColor('#fca5a5').font('Helvetica').text('KES ' + fmt(slip.total_deductions||(slip.gross_pay-slip.net_pay)), 40 + pageW/3 + 82, s, { width: pageW/3 - 82 })
    doc.fontSize(10).fillColor('#fbbf24').font('Helvetica-Bold').text('NET PAY: KES ' + fmt(slip.net_pay), 40 + pageW*0.67, s - 1, { width: pageW * 0.31, align: 'right' })

    // Footer
    const footerY = summaryY + 30
    doc.moveTo(40, footerY).lineTo(40 + pageW, footerY).strokeColor('#d1d5db').lineWidth(0.5).stroke()
    doc.fontSize(8).fillColor(GRAY).font('Helvetica')
      .text('Prepared By: GIGVA HR  |  System-generated payslip', 40, footerY + 8, { width: pageW/2 })
      .text('Gigva Kenya | +254 701 443 444 | hello@gigva.co.ke', 40 + pageW/2, footerY + 8, { width: pageW/2, align: 'right' })

    doc.end()
  })
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
    '<tr><td colspan="2" style="padding:10px 14px;font-weight:bold;color:#fff;background:#1a56db;font-size:13px;">Payslip Summary &mdash; ' + monthName + ' ' + slip.period_year + '</td></tr>' +
    '<tr><td style="padding:6px 14px;">Gross Pay</td><td style="padding:6px 14px;font-weight:bold;text-align:right;">KES ' + fmtH(slip.gross_pay) + '</td></tr>' +
    '<tr style="background:#e8f0fe;"><td style="padding:6px 14px;">Total Deductions</td><td style="padding:6px 14px;font-weight:bold;text-align:right;color:#b91c1c;">KES ' + fmtH(total) + '</td></tr>' +
    '<tr style="background:#dbeafe;"><td style="padding:8px 14px;font-weight:bold;font-size:15px;">NET PAY</td><td style="padding:8px 14px;font-weight:bold;text-align:right;color:#1a56db;font-size:16px;">KES ' + fmtH(slip.net_pay) + '</td></tr>' +
    '</table>' +
    '<div style="background:#ecfdf5;border:2px solid #10b981;border-radius:6px;padding:12px 16px;margin:12px 0;">' +
    '<p style="margin:0;font-size:14px;"><strong>&#128196; PDF Attachment:</strong> Your full payslip is attached as <strong>' + filename + '</strong>.</p>' +
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

    // Generate PDF
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
