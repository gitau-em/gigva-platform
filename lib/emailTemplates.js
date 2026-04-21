/**
 * lib/emailTemplates.js
 * HTML email templates for outbound notifications.
 * All templates return { subject, html } objects.
 *
 * Design philosophy: clean, readable, text-heavy.
 * No external image dependencies — renders in any mail client.
 */

const BRAND_COLOR  = '#0ea5e9'   // sky-500
const BRAND_DARK   = '#0284c7'   // sky-600
const FOOTER_COLOR = '#64748b'   // slate-500

function baseLayout(content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Gigva Kenya</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:12px;
             border:1px solid #e2e8f0;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background:${BRAND_COLOR};padding:20px 28px;">
            <span style="color:#fff;font-size:20px;font-weight:800;letter-spacing:-0.5px;">GIGVA</span>
            <span style="color:#bae6fd;font-size:9px;font-weight:700;letter-spacing:4px;
                         display:block;margin-top:2px;">KENYA</span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:28px;">
            ${content}
          </td>
        </tr>

        <!-- Email Signature Footer -->
        <tr>
          <td style="background:#000000;padding:24px 28px;border-top:3px solid #0ea5e9;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-bottom:16px;">
                  <!-- Logo block -->
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background:#0ea5e9;border-radius:7px;padding:8px 10px;vertical-align:middle;">
                        <span style="color:#fff;font-size:16px;font-weight:800;letter-spacing:-0.5px;font-family:system-ui,sans-serif;">GIGVA</span>
                        <span style="color:#bae6fd;font-size:7px;font-weight:700;letter-spacing:3.5px;display:block;margin-top:1px;font-family:system-ui,sans-serif;">KENYA</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding-bottom:12px;">
                  <p style="margin:0;font-size:13px;font-style:italic;color:#7dd3fc;font-family:system-ui,sans-serif;line-height:1.5;">
                    Powering Innovation with Smart Software Solutions in Kenya
                  </p>
                </td>
              </tr>
              <tr>
                <td style="border-top:1px solid #1e293b;padding-top:12px;">
                  <p style="margin:0;font-size:11px;color:#64748b;line-height:1.6;font-family:system-ui,sans-serif;">
                    Gigva Kenya Limited &nbsp;·&nbsp; Nairobi, Kenya<br/>
                    <a href="https://gigva.co.ke" style="color:#0ea5e9;text-decoration:none;">gigva.co.ke</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        </table>
</body>
</html>`
}

function field(label, value) {
  if (!value) return ''
  return `
    <tr>
      <td style="padding:4px 0;vertical-align:top;width:130px;">
        <span style="font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;
                     letter-spacing:0.5px;">${label}</span>
      </td>
      <td style="padding:4px 0 4px 8px;vertical-align:top;">
        <span style="font-size:13px;color:#1e293b;">${value}</span>
      </td>
    </tr>`
}

function badge(text, color) {
  const colors = {
    blue:   '#dbeafe:#1d4ed8',
    green:  '#dcfce7:#15803d',
    violet: '#ede9fe:#7c3aed',
    amber:  '#fef3c7:#b45309',
  }
  const [bg, fg] = (colors[color] || colors.blue).split(':')
  return `<span style="display:inline-block;padding:3px 10px;background:${bg};color:${fg};
                font-size:11px;font-weight:700;border-radius:20px;text-transform:uppercase;
                letter-spacing:0.5px;">${text}</span>`
}

function actionButton(label, href) {
  return `
    <a href="${href}" style="display:inline-block;margin-top:20px;padding:10px 22px;
       background:${BRAND_COLOR};color:#fff;font-size:13px;font-weight:700;
       border-radius:8px;text-decoration:none;">${label}</a>`
}

// ── Template: Contact message received ───────────────────────────────────────
export function contactReceivedStaff({ name, email, company, role, message }) {
  return {
    subject: `📬 New message from ${name}${company ? ` — ${company}` : ''}`,
    html: baseLayout(`
      <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:${BRAND_COLOR};
                text-transform:uppercase;letter-spacing:0.5px;">New Contact Message</p>
      <h2 style="margin:0 0 20px;font-size:20px;font-weight:800;color:#0f172a;">
        Message from ${name}
      </h2>

      <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:20px;">
        ${field('Name',    name)}
        ${field('Email',   `<a href="mailto:${email}" style="color:${BRAND_COLOR};">${email}</a>`)}
        ${field('Company', company || '—')}
        ${field('Role',    role    || '—')}
      </table>

      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;
                  padding:16px;margin-bottom:20px;">
        <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#94a3b8;
                  text-transform:uppercase;letter-spacing:0.5px;">Message</p>
        <p style="margin:0;font-size:13px;color:#1e293b;line-height:1.7;
                  white-space:pre-wrap;">${message}</p>
      </div>

      ${actionButton('Reply to ' + name, `mailto:${email}?subject=Re: Your message to Gigva Kenya`)}
    `),
  }
}

// Auto-reply to the person who sent the message
export function contactAutoReply({ name }) {
  return {
    subject: 'Thanks for reaching out — Gigva Kenya',
    html: baseLayout(`
      <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:${BRAND_COLOR};
                text-transform:uppercase;letter-spacing:0.5px;">Message received</p>
      <h2 style="margin:0 0 16px;font-size:20px;font-weight:800;color:#0f172a;">
        Hi ${name}, we've got your message
      </h2>
      <p style="margin:0 0 14px;font-size:14px;color:#475569;line-height:1.7;">
        Thanks for getting in touch with Gigva Kenya. Our team typically responds
        within one business day.
      </p>
      <p style="margin:0 0 14px;font-size:14px;color:#475569;line-height:1.7;">
        In the meantime, feel free to explore our
        <a href="https://gigvakenya.co.ke/product" style="color:${BRAND_COLOR};">platform features</a>
        or
        <a href="https://gigvakenya.co.ke/book-demo" style="color:${BRAND_COLOR};">book a demo</a>.
      </p>
      <p style="margin:0;font-size:14px;color:#475569;">— The Gigva Kenya team</p>
    `),
  }
}

// ── Template: Demo booking received ──────────────────────────────────────────
export function demoBookedStaff({ name, email, company, phone, businessType, interests, message }) {
  const interestList = Array.isArray(interests) && interests.length
    ? interests.join(', ')
    : '—'
  return {
    subject: `📅 Demo booking — ${name} / ${company}`,
    html: baseLayout(`
      <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:${BRAND_COLOR};
                text-transform:uppercase;letter-spacing:0.5px;">Demo Booking</p>
      <h2 style="margin:0 0 20px;font-size:20px;font-weight:800;color:#0f172a;">
        ${name} has booked a demo
      </h2>

      ${badge('Pending confirmation', 'amber')}

      <table cellpadding="0" cellspacing="0" width="100%" style="margin:20px 0;">
        ${field('Name',          name)}
        ${field('Email',         `<a href="mailto:${email}" style="color:${BRAND_COLOR};">${email}</a>`)}
        ${field('Business',      company)}
        ${field('Phone',         phone || '—')}
        ${field('Business type', businessType || '—')}
        ${field('Interests',     interestList)}
      </table>

      ${message ? `
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;
                  padding:16px;margin-bottom:20px;">
        <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#94a3b8;
                  text-transform:uppercase;letter-spacing:0.5px;">Notes from applicant</p>
        <p style="margin:0;font-size:13px;color:#1e293b;line-height:1.7;">${message}</p>
      </div>` : ''}

      ${actionButton('Confirm booking via email', `mailto:${email}?subject=Your Gigva demo booking confirmation`)}
    `),
  }
}

export function demoBookedAutoReply({ name, company }) {
  return {
    subject: 'Your Gigva demo request — we\'ll be in touch',
    html: baseLayout(`
      <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:${BRAND_COLOR};
                text-transform:uppercase;letter-spacing:0.5px;">Demo request received</p>
      <h2 style="margin:0 0 16px;font-size:20px;font-weight:800;color:#0f172a;">
        Hi ${name}, your demo is lined up
      </h2>
      <p style="margin:0 0 14px;font-size:14px;color:#475569;line-height:1.7;">
        Thanks for requesting a demo for <strong>${company}</strong>.
        Our customer success team will contact you within one business day
        to schedule a convenient time.
      </p>
      <p style="margin:0 0 14px;font-size:14px;color:#475569;line-height:1.7;">
        The demo is tailored to your business type and will walk you through
        M-Pesa reconciliation, live transaction ingestion, and our reporting suite.
      </p>
      <p style="margin:0;font-size:14px;color:#475569;">— Samuel Otieno, Customer Success · Gigva Kenya</p>
    `),
  }
}

// ── Template: Free trial request received ────────────────────────────────────
export function trialRequestedStaff({ fullName, email, phone, businessName, businessType, description }) {
  return {
    subject: `🚀 Free trial request — ${fullName} / ${businessName}`,
    html: baseLayout(`
      <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:${BRAND_COLOR};
                text-transform:uppercase;letter-spacing:0.5px;">Free Trial Request</p>
      <h2 style="margin:0 0 20px;font-size:20px;font-weight:800;color:#0f172a;">
        ${fullName} wants to trial Gigva
      </h2>

      ${badge('Pending review', 'violet')}

      <table cellpadding="0" cellspacing="0" width="100%" style="margin:20px 0;">
        ${field('Name',          fullName)}
        ${field('Email',         `<a href="mailto:${email}" style="color:${BRAND_COLOR};">${email}</a>`)}
        ${field('Business',      businessName)}
        ${field('Phone',         phone || '—')}
        ${field('Business type', businessType || '—')}
      </table>

      ${description ? `
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;
                  padding:16px;margin-bottom:20px;">
        <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#94a3b8;
                  text-transform:uppercase;letter-spacing:0.5px;">Business description</p>
        <p style="margin:0;font-size:13px;color:#1e293b;line-height:1.7;">${description}</p>
      </div>` : ''}

      ${actionButton('Approve & respond', `mailto:${email}?subject=Your Gigva free trial – next steps`)}
    `),
  }
}

export function trialRequestedAutoReply({ fullName, businessName }) {
  return {
    subject: 'Your free trial request — Gigva Kenya',
    html: baseLayout(`
      <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:${BRAND_COLOR};
                text-transform:uppercase;letter-spacing:0.5px;">Trial request received</p>
      <h2 style="margin:0 0 16px;font-size:20px;font-weight:800;color:#0f172a;">
        Hi ${fullName}, you're on the list
      </h2>
      <p style="margin:0 0 14px;font-size:14px;color:#475569;line-height:1.7;">
        We've received your free trial request for <strong>${businessName}</strong>.
        Our team will review your application and send access details within
        two business days.
      </p>
      <p style="margin:0 0 14px;font-size:14px;color:#475569;line-height:1.7;">
        The 3-month free trial includes full access to the Gigva dashboard,
        M-Pesa statement parsing, live reconciliation, and reporting.
        No setup fee required.
      </p>
      <p style="margin:0;font-size:14px;color:#475569;">— The Gigva Kenya team</p>
    `),
  }
}

// ── Template: New staff account created ──────────────────────────────────────
export function newStaffAccount({ name, email, role, tempPassword, webmailUrl }) {
  return {
    subject: 'Your Gigva staff account is ready',
    html: baseLayout(`
      <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:${BRAND_COLOR};
                text-transform:uppercase;letter-spacing:0.5px;">Staff account created</p>
      <h2 style="margin:0 0 16px;font-size:20px;font-weight:800;color:#0f172a;">
        Welcome, ${name}
      </h2>
      <p style="margin:0 0 16px;font-size:14px;color:#475569;line-height:1.7;">
        Your Gigva staff account has been created. Use the credentials below
        to sign in to the staff portal.
      </p>

      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;
                  padding:16px 20px;margin-bottom:20px;">
        <table cellpadding="0" cellspacing="0" width="100%">
          ${field('Portal URL',  '<a href="https://gigvakenya.co.ke/admin" style="color:' + BRAND_COLOR + ';">gigvakenya.co.ke/admin</a>')}
          ${field('Email',       email)}
          ${field('Password',    `<code style="background:#e2e8f0;padding:2px 6px;border-radius:4px;font-size:13px;">${tempPassword}</code>`)}
          ${field('Your role',   role)}
        </table>
      </div>

      <p style="margin:0 0 16px;font-size:13px;color:#ef4444;font-weight:600;">
        ⚠️ Please change your password after your first login.
      </p>

      ${webmailUrl ? `<p style="margin:0 0 14px;font-size:13px;color:#475569;">
        Your company email (${email}) is accessible at
        <a href="${webmailUrl}" style="color:${BRAND_COLOR};">${webmailUrl}</a>.
      </p>` : ''}

      ${actionButton('Go to staff portal', 'https://gigvakenya.co.ke/admin')}
    `),
  }
}
