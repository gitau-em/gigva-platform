/**
 * lib/emailSignature.js
 * Centralized email signature utility for all Gigva outgoing emails.
 * Import and call appendSignature(htmlBody) before sending any email.
 */

const SIGNATURE_SENTINEL = 'data-gigva-sig="1"'

/**
 * Returns the canonical Gigva HTML email signature block.
 * Uses inline CSS for maximum email client compatibility (Gmail, Outlook, mobile).
 */
export function getSignatureHtml() {
  return `<div data-gigva-sig="1" style="margin-top:24px;padding-top:16px;border-top:1px solid #e2e8f0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#444;line-height:1.5;">
  <table cellpadding="0" cellspacing="0" border="0" style="max-width:420px;">
    <tr>
      <td style="padding-right:16px;vertical-align:middle;">
        <img src="https://gigva.co.ke/gigva-logo.png" alt="Gigva Kenya" width="110" height="auto" style="display:block;width:110px;" />
      </td>
      <td style="vertical-align:middle;border-left:2px solid #0ea5e9;padding-left:14px;">
        <div style="font-weight:700;font-size:14px;color:#0f2d5c;margin-bottom:2px;">Gigva Kenya</div>
        <div style="font-size:12px;color:#555;margin-bottom:1px;">
          Email: <a href="mailto:hello@gigva.co.ke" style="color:#0ea5e9;text-decoration:none;">hello@gigva.co.ke</a>
        </div>
        <div style="font-size:12px;color:#555;">
          Website: <a href="https://gigva.co.ke" style="color:#0ea5e9;text-decoration:none;">www.gigva.co.ke</a>
        </div>
      </td>
    </tr>
  </table>
</div>`
}

/**
 * Appends the Gigva signature to an HTML email body.
 * Safe to call on every outgoing email — detects existing signature to prevent duplicates.
 *
 * @param {string} htmlBody  - The existing HTML email body
 * @returns {string}         - The email body with signature appended
 */
export function appendSignature(htmlBody) {
  // Prevent duplicate signatures (e.g. on forwarded/replied emails)
  if (htmlBody && htmlBody.includes(SIGNATURE_SENTINEL)) {
    return htmlBody
  }
  return (htmlBody || '') + getSignatureHtml()
}
