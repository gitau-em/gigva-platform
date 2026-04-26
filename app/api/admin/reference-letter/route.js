import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/db'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

// Only CTO can generate reference letters
function checkAccess(user) {
  return user && user.role === 'cto'
}

function fmt(d) {
  if (!d) return new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })
  return new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })
}

function topY(pageH, offset) { return pageH - offset }

function drawRect(page, x, y, w, h, r, g, b) {
  page.drawRectangle({ x, y, width: w, height: h, color: rgb(r, g, b) })
}

async function buildRefLetterPdf(emp, opts) {
  const {
    letterDate = new Date().toISOString(),
    recipientName = '',
    recipientTitle = '',
    recipientOrg = '',
    purpose = 'general',
    customBody = '',
  } = opts

  const pdfDoc = await PDFDocument.create()
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const pageW = 595.28
  const pageH = 841.89
  const page = pdfDoc.addPage([pageW, pageH])
  const margin = 60
  const contentW = pageW - margin * 2

  function tY(top) { return pageH - top }

  // --- LOGO at top ---
  try {
    const siteBase = process.env.NEXT_PUBLIC_SITE_URL || 'https://gigva.co.ke'
    const logoRes = await fetch(siteBase + '/gigva-logo.png')
    if (logoRes.ok) {
      const logoBytes = await logoRes.arrayBuffer()
      const logoImg = await pdfDoc.embedPng(logoBytes)
      page.drawImage(logoImg, { x: margin, y: tY(32 + 50), width: 120, height: 50 })
    }
  } catch (_) {}

  // Company info right
  const ciLines = [
    { text: 'Gigva Kenya Limited', bold: true, size: 8.5 },
    { text: 'Westlands Business Park, Nairobi', bold: false, size: 7.5 },
    { text: 'P.O box 13878-00100 Nairobi', bold: false, size: 7.5 },
    { text: '+254 701 443 444  |  hello@gigva.co.ke', bold: false, size: 7.5 },
    { text: 'www.gigva.co.ke', bold: false, size: 7.5 },
  ]
  ciLines.forEach((l, i) => {
    const tw = (l.bold ? helveticaBold : helvetica).widthOfTextAtSize(l.text, l.size)
    page.drawText(l.text, {
      x: margin + contentW - tw, y: tY(36 + i * 11),
      font: l.bold ? helveticaBold : helvetica,
      size: l.size, color: rgb(0.22, 0.27, 0.36)
    })
  })

  // Divider
  page.drawLine({ start: { x: margin, y: tY(98) }, end: { x: margin + contentW, y: tY(98) }, thickness: 0.7, color: rgb(0.78, 0.82, 0.9) })

  // Date
  page.drawText(fmt(letterDate), { x: margin, y: tY(118), font: helvetica, size: 10, color: rgb(0.3, 0.3, 0.3) })

  // Recipient
  let ry = 148
  if (recipientName) {
    page.drawText(recipientName, { x: margin, y: tY(ry), font: helveticaBold, size: 10, color: rgb(0.07, 0.09, 0.15) })
    ry += 14
  }
  if (recipientTitle) {
    page.drawText(recipientTitle, { x: margin, y: tY(ry), font: helvetica, size: 10, color: rgb(0.3, 0.3, 0.3) })
    ry += 14
  }
  if (recipientOrg) {
    page.drawText(recipientOrg, { x: margin, y: tY(ry), font: helvetica, size: 10, color: rgb(0.3, 0.3, 0.3) })
    ry += 14
  }
  ry += 10

  // RE: line
  const reText = 'RE: LETTER OF REFERENCE - ' + (emp.name || '').toUpperCase()
  page.drawText(reText, { x: margin, y: tY(ry), font: helveticaBold, size: 11, color: rgb(0.055, 0.647, 0.914) })
  ry += 20

  // Salutation
  const salutation = recipientName ? 'Dear ' + recipientName + ',' : 'To Whom It May Concern,'
  page.drawText(salutation, { x: margin, y: tY(ry), font: helvetica, size: 10.5, color: rgb(0.07, 0.09, 0.15) })
  ry += 20

  // Body paragraphs
  const empName = emp.name || 'the above-named individual'
  const designation = emp.designation || emp.role || 'Staff'
  const dept = emp.department || 'our organization'
  const dateEmployed = emp.date_employed ? fmt(emp.date_employed) : 'the commencement of their employment'

  let bodyText = ''
  if (customBody) {
    bodyText = customBody
  } else if (purpose === 'bank') {
    bodyText = 'This is to confirm that ' + empName + ' is a valued employee of Gigva Kenya Limited, holding the position of ' + designation + ' in the ' + dept + ' department. ' + empName + ' has been employed with us since ' + dateEmployed + '.' +
      '\n\nWe confirm that ' + empName + ' is in active employment with our organization and is a person of good character and standing. Their gross monthly salary is KES ' + Number(emp.basic_pay || 0).toLocaleString('en-KE') + '.' +
      '\n\nWe have no objection to ' + empName + ' engaging in banking transactions and we recommend them to you without reservation.'
  } else if (purpose === 'visa') {
    bodyText = 'This letter serves to confirm that ' + empName + ' is a permanent employee of Gigva Kenya Limited, holding the position of ' + designation + ' in the ' + dept + ' department, effective ' + dateEmployed + '.' +
      '\n\nWe fully support ' + empName + ' in their travel plans and confirm that they will return to their duties upon completion of travel. During their absence, their position and remuneration will be maintained.' +
      '\n\nWe provide this reference letter in full confidence and vouch for their character and professional standing.'
  } else if (purpose === 'tenancy') {
    bodyText = 'This is to confirm that ' + empName + ' is employed by Gigva Kenya Limited as ' + designation + ' in the ' + dept + ' department since ' + dateEmployed + '.' +
      '\n\nTheir gross monthly salary is KES ' + Number(emp.basic_pay || 0).toLocaleString('en-KE') + '. We confirm that they are a responsible and trustworthy individual who is capable of meeting their financial obligations.' +
      '\n\nWe recommend ' + empName + ' for tenancy without any reservation.'
  } else {
    bodyText = 'This is to confirm that ' + empName + ' is employed by Gigva Kenya Limited as ' + designation + ' in the ' + dept + ' department. They have been a member of our team since ' + dateEmployed + '.' +
      '\n\nDuring their time with us, ' + empName + ' has demonstrated exemplary professionalism, dedication and integrity. We hold them in high regard and recommend them unconditionally.' +
      '\n\nFeel free to contact us at hello@gigva.co.ke for any further clarification.'
  }

  // Draw body text with word wrap
  function wrapText(text, font, size, maxW) {
    const paras = text.split('\n')
    const lines = []
    for (const para of paras) {
      if (para.trim() === '') { lines.push(''); continue }
      const words = para.split(' ')
      let line = ''
      for (const word of words) {
        const test = line ? line + ' ' + word : word
        if (font.widthOfTextAtSize(test, size) <= maxW) { line = test }
        else { if (line) lines.push(line); line = word }
      }
      if (line) lines.push(line)
      lines.push('')
    }
    return lines
  }

  const bodyLines = wrapText(bodyText, helvetica, 10.5, contentW)
  const lineH = 16
  for (const line of bodyLines) {
    if (ry > pageH - 120) break
    if (line) {
      page.drawText(line, { x: margin, y: tY(ry), font: helvetica, size: 10.5, color: rgb(0.12, 0.14, 0.2) })
    }
    ry += lineH
  }

  ry += 10
  // Closing
  page.drawText('Yours faithfully,', { x: margin, y: tY(ry), font: helvetica, size: 10.5, color: rgb(0.12, 0.14, 0.2) })
  ry += 50
  // Signature line
  page.drawLine({ start: { x: margin, y: tY(ry) }, end: { x: margin + 150, y: tY(ry) }, thickness: 0.7, color: rgb(0.3, 0.3, 0.3) })
  ry += 12
  page.drawText('Aisha Waweru', { x: margin, y: tY(ry), font: helveticaBold, size: 10.5, color: rgb(0.07, 0.09, 0.15) })
  ry += 14
  page.drawText('Chief Technology Officer', { x: margin, y: tY(ry), font: helvetica, size: 10, color: rgb(0.3, 0.3, 0.3) })
  ry += 14
  page.drawText('Gigva Kenya Limited', { x: margin, y: tY(ry), font: helvetica, size: 10, color: rgb(0.3, 0.3, 0.3) })
  ry += 14
  page.drawText('+254 701 443 444  |  cto@gigva.co.ke', { x: margin, y: tY(ry), font: helvetica, size: 9, color: rgb(0.4, 0.4, 0.4) })

  // Stamp
  try {
    const siteBase = process.env.NEXT_PUBLIC_SITE_URL || 'https://gigva.co.ke'
    const stampRes = await fetch(siteBase + '/gigva-stamp.png')
    if (stampRes.ok) {
      const stampBytes = await stampRes.arrayBuffer()
      const stampImg = await pdfDoc.embedPng(stampBytes)
      page.drawImage(stampImg, { x: margin + 180, y: tY(ry - 10), width: 80, height: 80, opacity: 0.85 })
    }
  } catch (_) {}

  // Footer divider
  page.drawLine({ start: { x: margin, y: margin + 22 }, end: { x: margin + contentW, y: margin + 22 }, thickness: 0.5, color: rgb(0.88, 0.9, 0.92) })
  const footText = 'Gigva Kenya Limited  *  Westlands Business Park, Nairobi  *  hello@gigva.co.ke  *  www.gigva.co.ke'
  const ftW = helvetica.widthOfTextAtSize(footText, 7)
  page.drawText(footText, { x: margin + contentW / 2 - ftW / 2, y: margin + 8, font: helvetica, size: 7, color: rgb(0.5, 0.5, 0.55) })

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}

export async function POST(req) {
  const auth = req.headers.get('authorization') || ''
  const user = verifyToken(auth.replace('Bearer ', '').trim())
  if (!user || !checkAccess(user)) {
    return NextResponse.json({ ok: false, msg: 'Access denied - CTO only' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { employeeId, letterDate, recipientName, recipientTitle, recipientOrg, purpose, customBody, sendEmail } = body

    if (!employeeId) return NextResponse.json({ ok: false, msg: 'employeeId is required' }, { status: 400 })

    // Fetch employee from DB
    const database = db()
    const emp = database.prepare('SELECT * FROM payroll_employees WHERE id = ? AND is_active = 1').get(employeeId)
    if (!emp) return NextResponse.json({ ok: false, msg: 'Employee not found' }, { status: 404 })

    const opts = { letterDate, recipientName, recipientTitle, recipientOrg, purpose, customBody }
    const pdfBuffer = await buildRefLetterPdf(emp, opts)
    const pdfBase64 = pdfBuffer.toString('base64')

    const filename = 'ReferenceLetterGigva_' + (emp.name || 'Staff').replace(/\s+/g, '_') + '_' + new Date().toISOString().slice(0, 10) + '.pdf'

    // Optionally email the letter to the employee
    if (sendEmail && emp.email) {
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: 'Gigva CTO <cto@gigva.co.ke>',
          to: [emp.email],
          subject: 'Your Reference Letter - Gigva Kenya',
          html: '<div style="font-family:Arial,sans-serif;padding:24px;"><p>Dear ' + emp.name + ',</p><p>Please find your reference letter attached as a PDF.</p><p>Best regards,<br><b>Aisha Waweru</b><br>Chief Technology Officer, Gigva Kenya</p></div>',
          attachments: [{ filename, content: pdfBase64 }],
        })
      } catch (emailErr) {
        console.error('[reference-letter] email error:', emailErr.message)
      }
    }

    return NextResponse.json({ ok: true, pdf: pdfBase64, filename })
  } catch (e) {
    return NextResponse.json({ ok: false, msg: e.message }, { status: 500 })
  }
}

export async function GET(req) {
  const auth = req.headers.get('authorization') || ''
  const user = verifyToken(auth.replace('Bearer ', '').trim())
  if (!user || !checkAccess(user)) {
    return NextResponse.json({ ok: false, msg: 'Access denied - CTO only' }, { status: 403 })
  }
  // Return list of payroll employees
  const emps = db().prepare('SELECT id, name, designation, department, email, basic_pay, date_employed FROM payroll_employees WHERE is_active = 1 ORDER BY name').all()
  return NextResponse.json({ ok: true, employees: emps })
}
