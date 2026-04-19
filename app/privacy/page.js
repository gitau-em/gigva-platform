import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy',
  description: 'Gigva Kenya Limited Privacy Policy — how we collect, use, store, and protect your personal and business data.',
}

const SECTIONS = [
  {
    id: '1',
    heading: '1. Introduction and who we are',
    content: [
      `Gigva Kenya Limited ("Gigva", "we", "us", or "our") is a software company registered in Kenya. We operate the Gigva platform, accessible at gigvakenya.co.ke and its subdomains, which provides M-Pesa payment tracking, automated reconciliation, analytics, and related services to Kenyan small and medium businesses.`,
      `This Privacy Policy explains what personal and business data we collect when you use the Gigva platform, how we use that data, how we store and protect it, and what rights you have under the Kenya Data Protection Act 2019 (DPA 2019). It applies to all users of the Gigva platform, including account holders, authorised team members added to an account, and visitors to our website.`,
      `By creating a Gigva account or using the platform in any capacity, you confirm that you have read and understood this Privacy Policy. If you are using Gigva on behalf of a business, you confirm that you have authority to agree to this policy on that business's behalf.`,
    ],
  },
  {
    id: '2',
    heading: '2. Information we collect',
    subsections: [
      {
        title: '2.1 Account and personal information',
        items: [
          'Full name and email address, provided during account registration',
          'Business name, business type, and business location, provided during onboarding',
          'Your role within the business (e.g. Finance Manager, Owner), if provided',
          'Phone number, if provided voluntarily in a contact form or demo request',
          'Password, stored only as a bcrypt hash (cost factor 12) — the plaintext is never retained',
          'Account activity logs: login timestamps, IP addresses, and session identifiers',
        ],
      },
      {
        title: '2.2 M-Pesa transaction data',
        items: [
          'Transaction reference number (M-Pesa transaction ID)',
          'Payment amount (KSh)',
          'Sender MSISDN (phone number of the customer who paid)',
          'Timestamp of the transaction',
          'Paybill or Till number the payment was directed to',
          'Account reference and transaction description provided by the sender',
          'Reconciliation status and the invoice ID the payment was matched against',
          'Any manual notes or corrections applied to the transaction by your team',
        ],
        note: `This data is received via the Safaricom Daraja v2 API webhook when your M-Pesa Paybill or Till is registered with Gigva. You remain the data controller for your customers' transaction data; Gigva acts as a data processor on your behalf.`,
      },
      {
        title: '2.3 Invoice and business operational data',
        items: [
          'Invoice numbers, amounts, due dates, and descriptions you create in Gigva',
          'Customer names, account references, and contact details you enter',
          'Reconciliation rules and preferences you configure',
          'Reports you generate and any data you export',
        ],
      },
      {
        title: '2.4 Usage and technical data',
        items: [
          'Pages visited within the platform and actions taken (e.g. reports viewed, alerts configured)',
          'Browser type, operating system, and device type',
          'IP address and approximate geographic location (country and city level)',
          'Session duration and frequency of use',
          'Error logs and performance data used to diagnose platform issues',
        ],
        note: `This data is collected automatically through our platform infrastructure and is used solely for service operation, security monitoring, and product improvement. It is not sold or shared with advertising networks.`,
      },
      {
        title: '2.5 Contact and communications data',
        items: [
          'Name, email, and message content submitted through our contact or demo request forms',
          'Email correspondence with our team',
          'Notes from demo calls, if you consent to them being recorded',
        ],
      },
    ],
  },
  {
    id: '3',
    heading: '3. How we use your data',
    content: [
      `We use your data only for the purposes described below. We do not sell your data, use it for advertising, or use your transaction data to train machine learning or AI models.`,
    ],
    subsections: [
      {
        title: '3.1 Platform operation',
        plain: `Your account data enables us to authenticate your identity and give you access to your Gigva account. Your M-Pesa transaction data is the core input that Gigva processes to reconcile payments, generate reports, and trigger alerts. Without this data, the service cannot function.`,
      },
      {
        title: '3.2 Reconciliation and analytics',
        plain: `Transaction data, invoice data, and reconciliation rules are used to match incoming M-Pesa payments to open invoices, calculate revenue totals, produce aging reports, and generate the analytical outputs visible in your dashboard. All analytics outputs are derived from your own business data — Gigva does not combine your data with data from other businesses.`,
      },
      {
        title: '3.3 Alerts and notifications',
        plain: `Your transaction data and the alert thresholds you configure are used to detect anomalies, trigger notifications, and send alert emails. These notifications are sent only to users you have authorised on your account.`,
      },
      {
        title: '3.4 Platform improvement',
        plain: `Aggregated, anonymised usage data (not individual transaction records) may be used to identify how users interact with the platform, which features are most used, and where friction exists. This helps us prioritise product development. This analysis does not involve identifying individual users or businesses.`,
      },
      {
        title: '3.5 Support and communications',
        plain: `Contact form submissions and support emails are used to respond to your enquiry. We retain this correspondence to maintain continuity in our support relationship with you.`,
      },
      {
        title: '3.6 Legal and compliance obligations',
        plain: `We may process and retain data to comply with applicable Kenyan laws, respond to lawful requests from regulatory or law enforcement authorities, or protect our legal rights in the event of a dispute.`,
      },
    ],
  },
  {
    id: '4',
    heading: '4. Legal basis for processing (DPA 2019)',
    content: [
      `Under the Kenya Data Protection Act 2019, we process your personal data on the following legal bases:`,
      `Contractual necessity: Processing your account data, transaction data, and invoice data is necessary to deliver the Gigva service you have subscribed to. Without this processing, we cannot fulfil our contractual obligations to you.`,
      `Legitimate interests: Processing usage data for platform improvement, security monitoring, and fraud detection is in our legitimate interest as a platform operator. We balance these interests against your rights and have determined they are proportionate.`,
      `Consent: Where we collect optional data — such as your phone number in a demo form, or notes from a call — we do so based on your voluntary provision of that information.`,
      `Legal obligation: We may process and retain data where required to comply with Kenyan law, including financial record-keeping requirements.`,
    ],
  },
  {
    id: '5',
    heading: '5. Data storage and security',
    content: [
      `All Gigva platform data — including transaction records, account information, and invoice data — is stored on servers located in Kenya. No financial data or personal transaction data is transferred to servers outside Kenya without your explicit consent.`,
      `The following security measures are in place:`,
    ],
    bullets: [
      { label: 'Encryption in transit', detail: 'All data transmitted between your browser and the Gigva platform is encrypted using TLS 1.3. Unencrypted connections are rejected.' },
      { label: 'Encryption at rest', detail: 'Sensitive data stored in the database, including transaction records and personal information, is encrypted at rest using AES-256.' },
      { label: 'Password security', detail: 'Passwords are never stored in readable form. We store a bcrypt hash with cost factor 12. Gigva staff cannot read your password.' },
      { label: 'Parameterised queries', detail: 'All database queries use parameterised prepared statements throughout the application, structurally preventing SQL injection attacks.' },
      { label: 'Access controls', detail: 'Access to production systems and customer data is restricted to authorised Gigva technical staff on a need-to-access basis.' },
      { label: 'Access logging', detail: 'All account access events, data exports, and modifications are logged with timestamps and IP addresses, retained for 12 months.' },
    ],
    content2: [
      `No security system is entirely impenetrable. In the event of a data breach that affects your personal or transaction data, we will notify affected account holders within 72 hours of becoming aware of the breach, in accordance with our obligations under the DPA 2019.`,
    ],
  },
  {
    id: '6',
    heading: '6. Third-party services',
    content: [
      `Gigva integrates with the following third-party services to operate the platform. Each service processes data only to the extent necessary for its function:`,
    ],
    bullets: [
      { label: 'Safaricom Daraja API', detail: 'Used to receive M-Pesa payment notifications via C2B webhook. Transaction data received from Daraja is governed by Safaricom\'s terms. Gigva does not store your Safaricom API credentials beyond what is necessary to maintain the webhook connection.' },
      { label: 'Email delivery provider', detail: 'Used to send transactional emails: account notifications, alerts, and support responses. Email delivery providers process the recipient email address and message content only.' },
      { label: 'Tawk.to (live chat)',     detail: 'We use Tawk.to to provide live chat support on our website. If you start a chat, your name, email address, and the content of your conversation are processed by Tawk.to. Chat sessions are not stored in Gigva\'s own database. You can review Tawk.to\'s privacy policy at tawk.to/privacy-policy. You may opt out of chat at any time by not initiating a session.' },
      { label: 'Hosting infrastructure', detail: 'Our Kenya-based hosting provider operates the servers on which Gigva data is stored. This provider is bound by data processing agreements that restrict their use of data to infrastructure operation only.' },
    ],
    content2: [
      `We do not use third-party analytics platforms that track your individual behaviour across other websites. We do not use advertising networks or permit third parties to place tracking cookies on the Gigva platform.`,
      `If you use Gigva's integration features to connect to third-party accounting software (such as QuickBooks or Xero), data you export from Gigva is governed by that third party's privacy policy from the point of export.`,
    ],
  },
  {
    id: '7',
    heading: '7. Your rights under the DPA 2019',
    content: [
      `Under the Kenya Data Protection Act 2019, you have the following rights in relation to your personal data:`,
    ],
    bullets: [
      { label: 'Right of access', detail: 'You may request a copy of the personal data we hold about you. We will provide this within 21 days of a verified request.' },
      { label: 'Right to rectification', detail: 'If any personal data we hold is inaccurate or incomplete, you may request that we correct it.' },
      { label: 'Right to erasure', detail: 'You may request deletion of your personal data. We will delete account and contact data within 30 days of account cancellation, subject to our retention obligations for financial records (see section 9).' },
      { label: 'Right to object', detail: 'You may object to processing of your personal data where we rely on legitimate interests as our legal basis.' },
      { label: 'Right to data portability', detail: 'You may request an export of your data in a machine-readable format. Transaction and invoice data is exportable from the platform at any time in CSV format.' },
      { label: 'Right to withdraw consent', detail: 'Where processing is based on consent, you may withdraw it at any time without affecting the lawfulness of prior processing.' },
    ],
    content2: [
      `To exercise any of these rights, email privacy@gigvakenya.co.ke with the subject line "Data Rights Request" and a description of your request. We will respond within 21 days. We may ask you to verify your identity before processing the request.`,
      `If you are not satisfied with our response, you have the right to lodge a complaint with the Office of the Data Protection Commissioner of Kenya (ODPC).`,
    ],
  },
  {
    id: '8',
    heading: '8. Cookies and session data',
    content: [
      `Gigva uses only strictly necessary cookies required for the platform to function. These include:`,
    ],
    bullets: [
      { label: 'Session cookie', detail: 'A JWT-based session token that keeps you logged in during your browser session. This cookie is HttpOnly and Secure, meaning it cannot be read by JavaScript and is only transmitted over encrypted connections.' },
      { label: 'CSRF token', detail: 'A cross-site request forgery prevention token used to validate form submissions and API requests.' },
    ],
    content2: [
      `We do not use advertising cookies, cross-site tracking cookies, or analytics cookies that report your behaviour to third-party services. We do not use Google Analytics, Meta Pixel, or any equivalent tracking service.`,
      `You may disable cookies in your browser, but doing so will prevent you from logging in to the Gigva platform.`,
    ],
  },
  {
    id: '9',
    heading: '9. Data retention',
    content: [
      `We retain different categories of data for different periods, based on the purpose of the data and applicable legal requirements:`,
    ],
    bullets: [
      { label: 'Account and personal data', detail: 'Retained for the duration of your subscription. If you cancel, account data is deleted within 30 days, unless you request earlier deletion.' },
      { label: 'M-Pesa transaction records', detail: 'Retained for 7 years from the date of the transaction to satisfy Kenyan financial record-keeping requirements. These records are anonymised after account deletion where technically feasible.' },
      { label: 'Invoice and reconciliation data', detail: 'Retained for 7 years for audit and accounting purposes.' },
      { label: 'Contact form submissions', detail: 'Retained for 2 years from the date of submission to maintain continuity in support relationships.' },
      { label: 'Usage and access logs', detail: 'Retained for 12 months for security monitoring and incident investigation.' },
    ],
    content2: [
      `If you cancel your Gigva subscription and wish to retain a copy of your data, you should export it before cancellation. Transaction and invoice data is exportable in CSV format from the platform at any time.`,
    ],
  },
  {
    id: '10',
    heading: '10. Data of your customers',
    content: [
      `When Gigva receives M-Pesa transaction data via the Daraja webhook, that data includes the phone number (MSISDN) of the customer who made the payment. This is your customer's personal data.`,
      `In this context, you are the data controller for your customers' data — you determine the purposes and means of processing. Gigva acts as a data processor on your behalf, processing your customers' payment data only to deliver the reconciliation and analytics service you have subscribed to.`,
      `You are responsible for ensuring that your collection and use of your customers' M-Pesa payment data complies with applicable data protection law, including obtaining any consents required by the DPA 2019. Gigva does not independently contact your customers or use their data for any purpose other than the service we provide to you.`,
    ],
  },
  {
    id: '11',
    heading: '11. Changes to this Privacy Policy',
    content: [
      `We may update this Privacy Policy from time to time to reflect changes in how we operate the platform or to meet new legal requirements. When we make changes, we will update the "Last updated" date at the top of this page.`,
      `For material changes — such as changes to the categories of data we collect, how we use data, or who we share it with — we will notify active account holders by email at least 14 days before the change takes effect. Continued use of the platform after notification constitutes acceptance of the updated policy.`,
      `We encourage you to review this policy periodically.`,
    ],
  },
  {
    id: '12',
    heading: '12. Contact for privacy concerns',
    content: [
      `If you have questions, concerns, or requests relating to this Privacy Policy or Gigva's data handling practices, contact us at:`,
      `Email: privacy@gigvakenya.co.ke`,
      `Post: Gigva Kenya Limited, Westlands, Nairobi, Kenya`,
      `We aim to respond to all privacy enquiries within 5 business days and to resolve substantive requests within 21 days. If you are not satisfied with our response, you may escalate to the Office of the Data Protection Commissioner of Kenya.`,
    ],
  },
]

export default function PrivacyPage() {
  return (
    <section className="section bg-white">
      <div className="inner max-w-3xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-display text-slate-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-slate-500 mb-4">Last updated: 1 January 2026</p>
          <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">
            This Privacy Policy applies to all users of the Gigva platform (gigvakenya.co.ke).
            It is written to be read — not to be hidden. If any part of this policy is unclear,
            email us at{' '}
            <a href="mailto:privacy@gigvakenya.co.ke" className="text-sky-600 hover:underline font-medium">
              privacy@gigvakenya.co.ke
            </a>
            {' '}and we will explain it plainly.
          </div>
        </div>

        {/* Table of contents */}
        <div className="mb-10 bg-slate-50 border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Contents</p>
          <ol className="space-y-1.5">
            {SECTIONS.map(s => (
              <li key={s.id}>
                <a href={`#section-${s.id}`} className="text-sm text-sky-600 hover:underline">
                  {s.heading}
                </a>
              </li>
            ))}
          </ol>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          {SECTIONS.map(s => (
            <div key={s.id} id={`section-${s.id}`} className="scroll-mt-20">
              <h2 className="font-display font-bold text-lg text-slate-900 mb-3 pb-2 border-b border-slate-100">
                {s.heading}
              </h2>

              {/* Intro content */}
              {s.content && s.content.map((p, i) => (
                <p key={i} className="text-sm text-slate-700 leading-relaxed mb-4">{p}</p>
              ))}

              {/* Bullet list */}
              {s.bullets && (
                <ul className="space-y-3 mb-4">
                  {s.bullets.map(b => (
                    <li key={b.label} className="flex gap-3 text-sm text-slate-700">
                      <span className="font-semibold text-slate-900 min-w-[160px] flex-shrink-0">{b.label}:</span>
                      <span className="leading-relaxed">{b.detail}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Subsections */}
              {s.subsections && s.subsections.map(sub => (
                <div key={sub.title} className="mb-5">
                  <h3 className="font-semibold text-slate-900 text-sm mb-2">{sub.title}</h3>
                  {sub.plain
                    ? <p className="text-sm text-slate-700 leading-relaxed">{sub.plain}</p>
                    : (
                      <ul className="space-y-1.5 pl-4">
                        {sub.items && sub.items.map(item => (
                          <li key={item} className="text-sm text-slate-700 leading-relaxed list-disc list-outside ml-2">
                            {item}
                          </li>
                        ))}
                      </ul>
                    )
                  }
                  {sub.note && (
                    <p className="text-xs text-slate-500 leading-relaxed mt-2 italic">{sub.note}</p>
                  )}
                </div>
              ))}

              {/* Post-list content */}
              {s.content2 && s.content2.map((p, i) => (
                <p key={i} className="text-sm text-slate-700 leading-relaxed mb-4">{p}</p>
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Questions about this policy?{' '}
            <a href="mailto:privacy@gigvakenya.co.ke" className="text-sky-600 hover:underline">
              privacy@gigvakenya.co.ke
            </a>
            {' '}·{' '}
            <Link href="/terms" className="text-sky-600 hover:underline">Terms of Service</Link>
          </p>
        </div>
      </div>
    </section>
  )
}
