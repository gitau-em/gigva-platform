import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/db'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

const resend = new Resend(process.env.RESEND_API_KEY)

function checkAccess(user) { return user && ['cto','people_ops','superadmin'].includes(user.role) }
function fmt(n) { return Number(n||0).toLocaleString('en-KE',{minimumFractionDigits:2,maximumFractionDigits:2}) }

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function usesSHIF(month, year) {
  if (year > 2024) return true
  if (year === 2024 && month >= 12) return true
  return false
}

// AHL rule: apply only if payslip date is on or after March 2024 (March 19 2024)
// Since we only have month/year (not exact day), March 2024 is treated as applying
// (conservative: AHL was gazetted March 19 2024; whole-month granularity = include March 2024+)
function appliesToAHL(month, year) {
  if (year > 2024) return true
  if (year === 2024 && month >= 3) return true
  return false
}

// Ensure messaging tables exist
function ensureInboxSchema(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS inbox_messages (
      id TEXT PRIMARY KEY,
      to_email TEXT NOT NULL,
      from_email TEXT NOT NULL DEFAULT '',
      from_name TEXT NOT NULL DEFAULT '',
      subject TEXT NOT NULL DEFAULT '',
      body_text TEXT NOT NULL DEFAULT '',
      body_html TEXT NOT NULL DEFAULT '',
      message_id TEXT NOT NULL DEFAULT '',
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS sent_emails (
      id TEXT PRIMARY KEY,
      from_email TEXT NOT NULL,
      to_email TEXT NOT NULL,
      subject TEXT NOT NULL DEFAULT '',
      body_text TEXT NOT NULL DEFAULT '',
      body_html TEXT NOT NULL DEFAULT '',
      resend_id TEXT NOT NULL DEFAULT '',
      sent_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS message_attachments (
      id TEXT PRIMARY KEY,
      message_id TEXT NOT NULL,
      filename TEXT NOT NULL,
      mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
      size INTEGER NOT NULL DEFAULT 0,
      data BLOB,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
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
  // Override address and bank details for Edward
  if (emp.name && emp.name.toLowerCase().includes('edward')) {
    emp = { ...emp,
      address: 'Unity Homes, Tatu City, Ruiru - Kiambu, Kenya',
      bank_account: '2048413202',
      bank_name: 'ABSA- market branch'
    }
  }

  const monthName = MONTHS[(slip.period_month||1)-1]
  const shifApplies = usesSHIF(slip.period_month, slip.period_year)
  const ahlApplies = appliesToAHL(slip.period_month, slip.period_year)
  const healthLabel = shifApplies ? 'SHIF (2.75%)' : 'NHIF'
  const healthCode = shifApplies ? 'SHIF' : 'NHIF'
  const healthAmount = shifApplies ? (slip.shif || 0) : (slip.nhif || 0)

  const annualEntitlement = slip.annual_leave_entitlement || 25
  const annualTaken = slip.annual_leave_taken || 0
  const annualBalance = slip.annual_leave_balance !== undefined ? slip.annual_leave_balance : (annualEntitlement - annualTaken)
  const sickEntitlement = slip.sick_leave_entitlement || 10
  const sickTaken = slip.sick_leave_taken || 0
  const sickBalance = slip.sick_leave_balance !== undefined ? slip.sick_leave_balance : (sickEntitlement - sickTaken)

  const pdfDoc = await PDFDocument.create()
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  // A4: 595.28 x 841.89 pt. pdf-lib origin = bottom-left.
  const pageW_pt = 595.28
  const pageH_pt = 841.89
  const page = pdfDoc.addPage([pageW_pt, pageH_pt])
  const margin = 36
  const contentW = pageW_pt - margin * 2

  // Helper: topY converts top-down offset to pdf-lib bottom-up y
  function topY(topOffset) { return pageH_pt - topOffset }

  // -- HEADER: Logo left | Company details right --
  // Logo dimensions: 160pt wide, maintain aspect ratio (logo is ~4:3 ratio => ~120pt tall)
  const logoW = 140 // Standard LOGO_WIDTH per branding system (px -> pt for PDF)
  const logoH = 37  // Standard aspect ratio: 140 * (80/304) rounded
  const headerTop = 40  // 40pt from top = ~14mm (professional top margin)
  const headerContentH = logoH + 12  // header content height
  const headerTotalH = headerContentH + 20  // with padding below

  // Draw logo top-left
  try {
    const siteBase = process.env.NEXT_PUBLIC_SITE_URL || 'https://gigva.co.ke'
    const logoRes = await fetch(siteBase + '/gigva-logo.png')
    if (logoRes.ok) {
      const logoBytes = await logoRes.arrayBuffer()
      const logoImg = await pdfDoc.embedPng(logoBytes)
      // Get actual dimensions to preserve aspect ratio
      const imgDims = logoImg.scale(1)
      const aspectRatio = imgDims.height / imgDims.width
      const finalLogoH = Math.round(logoW * aspectRatio)
      page.drawImage(logoImg, {
        x: margin,
        y: topY(headerTop + finalLogoH),
        width: logoW,
        height: finalLogoH,
      })
    }
  } catch (_) { /* logo optional */ }

  // Company details - RIGHT side of header
  const companyDetails = [
    { text: 'GIGVA KENYA', bold: true, size: 12, color: rgb(0.08, 0.30, 0.65) },
    { text: 'Westlands Business Park, Nairobi', bold: false, size: 8, color: rgb(0.25, 0.25, 0.25) },
    { text: 'P.O Box 13878-00100, Nairobi, Kenya', bold: false, size: 8, color: rgb(0.25, 0.25, 0.25) },
    { text: '+254 701 443 444', bold: false, size: 8, color: rgb(0.25, 0.25, 0.25) },
    { text: 'hello@gigva.co.ke', bold: false, size: 8, color: rgb(0.25, 0.25, 0.25) },
    { text: 'www.gigva.co.ke', bold: false, size: 8, color: rgb(0.25, 0.25, 0.25) },
  ]
  const companyX = margin + logoW + 20  // start after logo with 20pt gap
  companyDetails.forEach((d, i) => {
    const lineY = topY(headerTop + (i === 0 ? 14 : 18 + i * 11))
    const textW = (d.bold ? helveticaBold : helvetica).widthOfTextAtSize(d.text, d.size)
    page.drawText(d.text, {
      x: margin + contentW - textW,  // right-aligned
      y: lineY,
      font: d.bold ? helveticaBold : helvetica,
      size: d.size,
      color: d.color,
    })
  })

  // Bold horizontal divider line under header
  const dividerY = topY(headerTop + headerTotalH)
  page.drawLine({
    start: { x: margin, y: dividerY },
    end: { x: margin + contentW, y: dividerY },
    thickness: 1.5, color: rgb(0.08, 0.30, 0.65)
  })
  // Thin second line for double-rule effect
  page.drawLine({
    start: { x: margin, y: dividerY - 3 },
    end: { x: margin + contentW, y: dividerY - 3 },
    thickness: 0.5, color: rgb(0.08, 0.30, 0.65)
  })

  // -- SALARY SLIP TITLE BAR --
  const titleTop = headerTop + headerTotalH + 8
  drawRect(page, margin, topY(titleTop + 18), contentW, 18, '#0f2d5c')
  const titleText = 'SALARY SLIP  |  ' + emp.name + '  |  ' + monthName.toUpperCase() + ' ' + slip.period_year
  const titleW = helveticaBold.widthOfTextAtSize(titleText, 9)
  page.drawText(titleText, {
    x: margin + contentW / 2 - titleW / 2, y: topY(titleTop + 12.5),
    font: helveticaBold, size: 9, color: rgb(1,1,1)
  })

// -- PERSONAL DETAILS --
  const pdTop = titleTop + 23
  // Payment date = last day of the payroll month
  const lastDay = new Date(slip.period_year, slip.period_month, 0).getDate()
  const paymentDate = lastDay + ' ' + monthName + ' ' + slip.period_year
  const empWorkId = emp.employee_id || ('GV-' + slip.period_year + '-' + String(emp.id || 0).padStart(3, '0'))

  drawRect(page, margin, topY(pdTop + 13), contentW, 13, '#0f2d5c')
  page.drawText('Personal Details', { x: margin + 5, y: topY(pdTop + 9), font: helveticaBold, size: 8, color: rgb(1,1,1) })

  const halfW2 = contentW / 2
  const cellH = 13
  // 5-row x 2-column personal details
  const pdRows = [
    [ { label: 'EMPLOYEE NAME', value: emp.name || '-' }, { label: 'EMPLOYEE ID', value: empWorkId }, ],
    [ { label: 'DESIGNATION', value: emp.designation || emp.role || '-' }, { label: 'PAYMENT DATE', value: paymentDate }, ],
    [ { label: 'EMAIL', value: emp.email || '-' }, { label: 'ADDRESS', value: emp.address || '-' }, ],
    [ { label: 'BANK ACCOUNT', value: emp.bank_account || '-' }, { label: 'BANK NAME', value: emp.bank_name || '-' }, ],
    [ { label: 'REF', value: slip.slip_ref || slip.ref_code || empWorkId }, { label: '', value: '' }, ],
  ]
  const pdDataTop = pdTop + 13
  pdRows.forEach((row, ri) => {
    const cy = pdDataTop + ri * cellH
    const bg = ri % 2 === 0 ? '#f7f9ff' : '#ffffff'
    drawRect(page, margin, topY(cy + cellH), contentW, cellH, bg)
    row.forEach((cell, ci) => {
      if (!cell.label) return
      const cx = margin + ci * halfW2
      page.drawText(cell.label + ':', {
        x: cx + 3, y: topY(cy + 9),
        font: helveticaBold, size: 6.5, color: rgb(0.1, 0.34, 0.86)
      })
      const lw = helveticaBold.widthOfTextAtSize(cell.label + ': ', 6.5)
      const val = (cell.value || '-').substring(0, 32)
      page.drawText(val, {
        x: cx + 3 + lw, y: topY(cy + 9),
        font: helvetica, size: 6.5, color: rgb(0.07, 0.09, 0.15)
      })
    })
    page.drawLine({
      start: { x: margin, y: topY(cy + cellH) },
      end: { x: margin + contentW, y: topY(cy + cellH) },
      thickness: 0.25, color: rgb(0.82, 0.85, 0.9)
    })
  })
  page.drawRectangle({
    x: margin, y: topY(pdDataTop + cellH * 5),
    width: contentW, height: cellH * 5,
    borderColor: rgb(0.82, 0.85, 0.9), borderWidth: 0.4
  })
  page.drawLine({
    start: { x: margin + halfW2, y: topY(pdDataTop) },
    end: { x: margin + halfW2, y: topY(pdDataTop + cellH * 5) },
    thickness: 0.25, color: rgb(0.82, 0.85, 0.9)
  })

  // -- EARNINGS & DEDUCTIONS --
  const tableTop = pdDataTop + cellH * 5 + 8
  const halfW = contentW / 2 - 4
  const dxCol = margin + halfW + 8

  const earnings = [
    { code: 'BASIC_PAY', name: 'Basic Pay', amount: slip.basic_pay || 0, bold: false },
    { code: 'HOUSE_ALLOW', name: 'Housing Allowance', amount: slip.house_allowance || 0, bold: false },
    { code: 'CAR_BENEFIT', name: 'Car Benefit', amount: slip.car_benefit || 0, bold: false },
    { code: 'OTHER_ALLOW', name: 'Other Allowances', amount: slip.other_allowances || 0, bold: false },
    { code: 'GROSS_PAY', name: 'Gross Pay', amount: slip.gross_pay || 0, bold: true },
  ]

  // Build deductions array - AHL only if payslip date is on/after March 2024
  const deductions = [
    { code: 'NSSF_T1', name: 'NSSF Tier I (6% x KES 6,000)', amount: slip.nssf_tier1 || 0, bold: false },
    { code: 'NSSF_T2', name: 'NSSF Tier II (6% x KES 12,000)', amount: slip.nssf_tier2 || 0, bold: false },
    { code: healthCode, name: healthLabel, amount: healthAmount, bold: false },
  ]
  if (ahlApplies) {
    deductions.push({ code: 'AHL', name: 'Housing Levy (1.5%)', amount: slip.housing_levy || 0, bold: false })
  }
  deductions.push(
    { code: 'PAYE', name: 'Pay As You Earn (PAYE)', amount: slip.paye || 0, bold: false },
    { code: 'PER_RELIEF', name: 'Personal Tax Relief', amount: slip.personal_relief||2400, bold: false },
    { code: 'NET_TAX', name: 'Net Tax Payable', amount: slip.net_tax || 0, bold: true }
  )

  function drawTableSection(startX, startW, title, rows, headerColor, evenColor, boldColor) {
    drawRect(page, startX, topY(tableTop + 13), startW, 13, headerColor)
    page.drawText(title, { x: startX + 4, y: topY(tableTop + 9), font: helveticaBold, size: 8, color: rgb(1,1,1) })
    const colHdrTop = tableTop + 13
    drawRect(page, startX, topY(colHdrTop + 11), startW, 11, headerColor)
    page.drawText('Code', { x: startX + 3, y: topY(colHdrTop + 7.5), font: helveticaBold, size: 6, color: rgb(1,1,1) })
    page.drawText('Description', { x: startX + startW * 0.28, y: topY(colHdrTop + 7.5), font: helveticaBold, size: 6, color: rgb(1,1,1) })
    page.drawText('Amount (KES)', { x: startX + startW - 50, y: topY(colHdrTop + 7.5), font: helveticaBold, size: 6, color: rgb(1,1,1) })
    let ry = colHdrTop + 11
    rows.forEach((row, i) => {
      drawRect(page, startX, topY(ry + 11), startW, 11, i % 2 === 0 ? evenColor : '#ffffff')
      const font = row.bold ? helveticaBold : helvetica
      const color = row.bold ? boldColor : rgb(0.22, 0.27, 0.36)
      page.drawText(row.code, { x: startX + 3, y: topY(ry + 8), font, size: 6.5, color })
      page.drawText(row.name.substring(0,26),{ x: startX + startW * 0.28, y: topY(ry + 8), font, size: 6.5, color })
      const at = fmt(row.amount)
      page.drawText(at, { x: startX + startW - helvetica.widthOfTextAtSize(at, 6.5) - 3, y: topY(ry + 8), font, size: 6.5, color })
      ry += 11
    })
    page.drawRectangle({
      x: startX, y: topY(colHdrTop + 11 + rows.length * 11),
      width: startW, height: rows.length * 11,
      borderColor: rgb(0.82, 0.85, 0.9), borderWidth: 0.3
    })
    return ry
  }

  const earningsEnd = drawTableSection(margin, halfW, 'Earnings', earnings, '#0f2d5c', '#f0f5ff', rgb(0.1,0.34,0.86))
  const deductsEnd = drawTableSection(dxCol, halfW, 'Deductions', deductions, '#9b1c1c', '#fff5f5', rgb(0.73,0.11,0.11))

  // -- LEAVE SUMMARY --
  const leaveTop = Math.max(earningsEnd, deductsEnd) + 8
  drawRect(page, margin, topY(leaveTop + 13), contentW, 13, '#0f2d5c')
  page.drawText('Leave Summary', { x: margin + 5, y: topY(leaveTop + 9), font: helveticaBold, size: 8, color: rgb(1,1,1) })

  // Header row
  const leaveHdrTop = leaveTop + 13
  drawRect(page, margin, topY(leaveHdrTop + 11), contentW, 11, '#e8f0fe')
  const leaveCol = contentW / 4
  page.drawText('Leave Type', { x: margin + 4, y: topY(leaveHdrTop + 7.5), font: helveticaBold, size: 7, color: rgb(0.12, 0.23, 0.54) })
  page.drawText('Entitlement (Days)', { x: margin + leaveCol + 4, y: topY(leaveHdrTop + 7.5), font: helveticaBold, size: 7, color: rgb(0.12, 0.23, 0.54) })
  page.drawText('Taken (Days)', { x: margin + leaveCol * 2 + 4, y: topY(leaveHdrTop + 7.5), font: helveticaBold, size: 7, color: rgb(0.12, 0.23, 0.54) })
  page.drawText('Balance (Days)', { x: margin + leaveCol * 3 + 4, y: topY(leaveHdrTop + 7.5), font: helveticaBold, size: 7, color: rgb(0.12, 0.23, 0.54) })

  // Annual leave row
  const annualLY = leaveHdrTop + 11
  drawRect(page, margin, topY(annualLY + 11), contentW, 11, '#f7f9ff')
  page.drawText('Annual Leave', { x: margin + 4, y: topY(annualLY + 7.5), font: helveticaBold, size: 7, color: rgb(0.22,0.27,0.36) })
  page.drawText(String(annualEntitlement), { x: margin + leaveCol + 4, y: topY(annualLY + 7.5), font: helvetica, size: 7, color: rgb(0.22,0.27,0.36) })
  page.drawText(String(annualTaken), { x: margin + leaveCol * 2 + 4, y: topY(annualLY + 7.5), font: helvetica, size: 7, color: rgb(0.22,0.27,0.36) })
  page.drawText(String(annualBalance), { x: margin + leaveCol * 3 + 4, y: topY(annualLY + 7.5), font: helveticaBold, size: 7, color: rgb(0.1,0.34,0.86) })

  // Sick leave row
  const sickLY = annualLY + 11
  drawRect(page, margin, topY(sickLY + 11), contentW, 11, '#ffffff')
  page.drawText('Sick Leave', { x: margin + 4, y: topY(sickLY + 7.5), font: helveticaBold, size: 7, color: rgb(0.22,0.27,0.36) })
  page.drawText(String(sickEntitlement), { x: margin + leaveCol + 4, y: topY(sickLY + 7.5), font: helvetica, size: 7, color: rgb(0.22,0.27,0.36) })
  page.drawText(String(sickTaken), { x: margin + leaveCol * 2 + 4, y: topY(sickLY + 7.5), font: helvetica, size: 7, color: rgb(0.22,0.27,0.36) })
  page.drawText(String(sickBalance), { x: margin + leaveCol * 3 + 4, y: topY(sickLY + 7.5), font: helveticaBold, size: 7, color: rgb(0.1,0.34,0.86) })

  page.drawRectangle({
    x: margin, y: topY(sickLY + 11),
    width: contentW, height: 33,
    borderColor: rgb(0.79, 0.85, 0.97), borderWidth: 0.4
  })

  // -- NET PAY SUMMARY BAR --
  const summaryTop = sickLY + 11 + 8
  const col3w = contentW / 3
  drawRect(page, margin, topY(summaryTop + 26), col3w, 26, '#0f2d5c')
  drawRect(page, margin + col3w, topY(summaryTop + 26), col3w, 26, '#1e3a8a')
  drawRect(page, margin + col3w * 2, topY(summaryTop + 26), col3w, 26, '#1e3a8a')
  page.drawText('GROSS PAY', { x: margin + 5, y: topY(summaryTop + 10), font: helveticaBold, size: 7.5, color: rgb(1,1,1) })
  page.drawText('KES ' + fmt(slip.gross_pay || 0), { x: margin + 5, y: topY(summaryTop + 22), font: helveticaBold, size: 9, color: rgb(1,1,1) })
  page.drawText('TOTAL DEDUCTIONS',{ x: margin + col3w + 5, y: topY(summaryTop + 10), font: helveticaBold, size: 7.5, color: rgb(1,1,1) })
  page.drawText('KES ' + fmt(slip.total_deductions || 0), { x: margin + col3w + 5, y: topY(summaryTop + 22), font: helveticaBold, size: 9, color: rgb(1,1,1) })
  page.drawText('NET PAY', { x: margin + col3w * 2 + 5, y: topY(summaryTop + 10), font: helveticaBold, size: 7.5, color: rgb(1,1,1) })
  page.drawText('KES ' + fmt(slip.net_pay || 0), { x: margin + col3w * 2 + 5, y: topY(summaryTop + 22), font: helveticaBold, size: 9, color: rgb(0.98,0.75,0.14) })

  // -- PREPARED BY + STAMP + AUTHORIZED SIGNATURE --
  const footerTop = summaryTop + 36
  page.drawText('Prepared By: FATUMA KAMAU', {
    x: margin, y: topY(footerTop + 11),
    font: helveticaBold, size: 8.5, color: rgb(0.07,0.09,0.15)
  })
  const sigX = margin + contentW - 190
  page.drawText('Authorized Signature:', {
    x: sigX, y: topY(footerTop + 60),
    font: helvetica, size: 8, color: rgb(0.22,0.27,0.36)
  })
  const sigLW = helvetica.widthOfTextAtSize('Authorized Signature: ', 8)
  page.drawLine({
    start: { x: sigX + sigLW, y: topY(footerTop + 60) },
    end: { x: sigX + 185, y: topY(footerTop + 60) },
    thickness: 0.7, color: rgb(0.22,0.27,0.36)
  })

  // Stamp
  try {
    const siteBase = process.env.NEXT_PUBLIC_SITE_URL || 'https://gigva.co.ke'
    const stampRes = await fetch(siteBase + '/gigva-stamp.png')
    if (stampRes.ok) {
      const stampBytes = await stampRes.arrayBuffer()
      const stampImg = await pdfDoc.embedPng(stampBytes)
      page.drawImage(stampImg, { x: margin, y: topY(footerTop + 85), width: 68, height: 68, opacity: 0.82 })
    }
  } catch (_) { /* stamp optional */ }

  // -- BOTTOM FOOTER: pinned to bottom of A4 --
  const footerLineY = margin + 14
  const footerTextY = margin + 3
  page.drawLine({
    start: { x: margin, y: footerLineY },
    end: { x: margin + contentW, y: footerLineY },
    thickness: 0.5, color: rgb(0.88,0.9,0.92)
  })
  const footText = 'Gigva Kenya * +254 701 443 444 * hello@gigva.co.ke * www.gigva.co.ke'
  const ftW = helvetica.widthOfTextAtSize(footText, 7)
  page.drawText(footText, {
    x: margin + contentW / 2 - ftW / 2, y: footerTextY,
    font: helvetica, size: 7, color: rgb(0.42,0.47,0.53)
  })

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}

function buildEmailBodyHtml(slip, employee, monthName, filename) {
  const LOGO = '<svg width="152" height="40" viewBox="0 0 152 40" xmlns="http://www.w3.org/2000/svg"><g><rect x="0" y="0" width="40" height="40" rx="9" fill="#0ea5e9"/><path d="M28.5 10.5 A10.5 10.5 0 1 0 28.5 29.5" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none"/><line x1="28.5" y1="20" x2="20.5" y2="20" stroke="#fff" stroke-width="4" stroke-linecap="round"/><line x1="28.5" y1="29.5" x2="28.5" y2="24" stroke="#fff" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="7" r="2.5" fill="#7dd3fc"/></g><text x="49" y="24" font-family="system-ui,sans-serif" font-weight="800" font-size="18" fill="#0ea5e9">GIGVA</text><text x="50" y="35" font-family="system-ui,sans-serif" font-weight="700" font-size="7.5" fill="#7dd3fc" letter-spacing="3.5">KENYA</text></svg>'
  function fmtH(n) { return Number(n||0).toLocaleString('en-KE',{minimumFractionDigits:2,maximumFractionDigits:2}) }
  const total = slip.total_deductions || (slip.gross_pay - slip.net_pay)
  return '<div style="font-family:Arial,sans-serif;font-size:14px;color:#333;max-width:600px;margin:0 auto;padding:24px;">'
    + '<div style="text-align:center;margin-bottom:16px;">' + LOGO + '</div>'
    + '<p>Dear ' + employee.name + ',</p>'
    + '<p>Please find your payslip for <strong>' + monthName + ' ' + slip.period_year + '</strong> attached as a PDF to this email.</p>'
    + '<table style="width:100%;border-collapse:collapse;background:#f0f5ff;border:2px solid #0f2d5c;margin:12px 0;">'
    + '<tr><td colspan="2" style="padding:10px 14px;font-weight:bold;color:#fff;background:#0f2d5c;font-size:13px;">Payslip Summary - ' + monthName + ' ' + slip.period_year + '</td></tr>'
    + '<tr><td style="padding:6px 14px;">Gross Pay</td><td style="padding:6px 14px;font-weight:bold;text-align:right;">KES ' + fmtH(slip.gross_pay) + '</td></tr>'
    + '<tr style="background:#e8f0fe;"><td style="padding:6px 14px;">Total Deductions</td><td style="padding:6px 14px;font-weight:bold;text-align:right;color:#b91c1c;">KES ' + fmtH(total) + '</td></tr>'
    + '<tr style="background:#dbeafe;"><td style="padding:8px 14px;font-weight:bold;font-size:15px;">NET PAY</td><td style="padding:8px 14px;font-weight:bold;text-align:right;color:#0f2d5c;font-size:16px;">KES ' + fmtH(slip.net_pay) + '</td></tr>'
    + '</table>'
    + '<div style="background:#ecfdf5;border:2px solid #10b981;border-radius:6px;padding:12px 16px;margin:12px 0;">'
    + '<p style="margin:0;font-size:14px;"><strong>PDF Attachment:</strong> Your full payslip is attached as <strong>' + filename + '</strong>.</p>'
    + '<p style="margin:6px 0 0;font-size:12px;color:#059669;">Open the attached PDF to view all earnings, deductions, and leave details. You can also download it from your inbox.</p>'
    + '</div>'
    + '<p style="font-size:12px;color:#666;">For questions contact HR: <a href="mailto:hello@gigva.co.ke">hello@gigva.co.ke</a></p>'
    + '<p>Best regards,<br><b>Gigva HR &amp; People Team</b></p></div>'
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
    const filename = 'Payslip_' + employee.name.replace(/\s+/g,'_') + '_' + monthName + '_' + slip.period_year + '.pdf'

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

      // 1. Insert into sent_emails FIRST
      database.prepare(
        'INSERT OR IGNORE INTO sent_emails (id,from_email,to_email,subject,body_text,body_html,resend_id,sent_at) VALUES (?,?,?,?,?,?,?,?)'
      ).run(msgId, 'cto@gigva.co.ke', employee.email,
        'Your Payslip for ' + monthName + ' ' + slip.period_year + ' - Gigva Kenya',
        'Payslip for ' + monthName + ' ' + slip.period_year + '. See PDF attachment.',
        fullBody, data?.id || '', now)

      // 2. Insert into inbox_messages
      database.prepare(
        'INSERT OR IGNORE INTO inbox_messages (id,to_email,from_email,from_name,subject,body_text,body_html,message_id,is_read,created_at) VALUES (?,?,?,?,?,?,?,?,0,?)'
      ).run(msgId, employee.email, 'cto@gigva.co.ke', 'Gigva Payroll',
        'Your Payslip for ' + monthName + ' ' + slip.period_year + ' - Gigva Kenya',
        'Payslip for ' + monthName + ' ' + slip.period_year + '. See PDF attachment.',
        fullBody, data?.id || msgId, now)

      // 3. Insert attachment with message_id = msgId
      database.prepare(
        'INSERT OR IGNORE INTO message_attachments (id,message_id,filename,mime_type,size,data,created_at) VALUES (?,?,?,?,?,?,?)'
      ).run(msgId + '-a1', msgId, filename, 'application/pdf', pdfBuffer.length, pdfBuffer, now)
    } catch(e) {
      console.error('[payroll/email] db store error:', e.message)
    }

    return NextResponse.json({ ok: true, data })
  } catch(e) {
    return NextResponse.json({ ok: false, msg: e.message }, { status: 500 })
  }
}
