import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service',
  description: 'Gigva Kenya Limited Terms of Service — the legal agreement governing use of the Gigva platform.',
}

const SECTIONS = [
  {
    id: '1',
    heading: '1. Acceptance of these Terms',
    content: [
      `These Terms of Service ("Terms") constitute a binding legal agreement between you ("you", "your", or "the Customer") and Gigva Kenya Limited ("Gigva", "we", "us", or "our"), a company registered in Kenya.`,
      `By creating a Gigva account, clicking "I agree", or using the Gigva platform in any capacity, you confirm that you have read, understood, and agree to be bound by these Terms. If you are using Gigva on behalf of a business or organisation, you confirm that you have authority to bind that entity to these Terms, and that your acceptance is on behalf of that entity.`,
      `If you do not agree to these Terms, you may not create an account or use the platform. We recommend that you read these Terms in full before proceeding. If any part is unclear, contact us at hello@gigva.co.ke before creating an account.`,
      `These Terms were last updated on 1 January 2026 and supersede all previous versions.`,
    ],
  },
  {
    id: '2',
    heading: '2. Description of the service',
    content: [
      `Gigva provides a cloud-based platform for Kenyan small and medium businesses that enables:`,
    ],
    bullets: [
      'Real-time M-Pesa payment tracking via the Safaricom Daraja v2 C2B webhook integration',
      'Automated matching of incoming M-Pesa payments to invoices (reconciliation)',
      'Transaction dashboards showing payment activity, outstanding invoices, and reconciliation status',
      'Revenue analytics and reporting, including daily, weekly, and monthly summaries',
      'Configurable alerts for payment anomalies, duplicate references, and revenue changes',
      'REST API and outbound webhook integrations with third-party accounting and business tools',
    ],
    content2: [
      `The platform is provided as a software-as-a-service (SaaS) subscription, accessible via web browser at gigvakenya.co.ke. We do not provide accounting, legal, or financial advisory services. Gigva is a data processing and management tool — it does not provide professional advice, and outputs from the platform should be reviewed by a qualified accountant for final financial reporting.`,
      `We reserve the right to modify, add to, or remove features from the platform with reasonable notice. We will notify active account holders by email at least 14 days before removing a feature that is in active use, except where changes are required immediately for security, compliance, or legal reasons.`,
    ],
  },
  {
    id: '3',
    heading: '3. Account registration and security',
    content: [
      `To use the Gigva platform, you must create an account by providing accurate and complete information, including your name, email address, and business details. You are responsible for keeping your account information accurate and up to date.`,
      `You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. You must not share your login credentials with any person who is not an authorised user of your account. If you wish to give team members access, use the account's user management function to add them with appropriate permission levels.`,
      `If you suspect that your account has been accessed without authorisation, or that your credentials have been compromised, you must notify us immediately at hello@gigva.co.ke and change your password. Gigva is not liable for losses arising from your failure to secure your credentials.`,
      `You must be at least 18 years old and legally capable of entering into contracts under Kenyan law to create a Gigva account.`,
    ],
  },
  {
    id: '4',
    heading: '4. User responsibilities',
    content: [
      `You are responsible for:`,
    ],
    bullets: [
      'Ensuring that all data you input into Gigva — including invoice details, customer references, and business information — is accurate and lawfully obtained',
      'Complying with Safaricom\'s Daraja API terms and conditions in connection with your M-Pesa Paybill or Till number',
      'Ensuring that your use of Gigva complies with applicable Kenyan law, including the Data Protection Act 2019, the Kenya Revenue Authority regulations, and any sector-specific regulations applicable to your business',
      'Obtaining any consents required from your own customers in relation to processing their M-Pesa payment data through the Gigva platform',
      'Reviewing and verifying reconciliation outputs before relying on them for accounting, tax, or legal purposes',
      'Maintaining appropriate backup or export copies of your data, as Gigva does not guarantee data retention beyond the periods stated in our Privacy Policy',
    ],
    content2: [
      `You understand that automated reconciliation, while accurate in the majority of cases, depends on the quality and consistency of the reference data provided in M-Pesa transactions. Gigva does not guarantee that every payment will be automatically reconciled to the correct invoice, and reconciliation outputs should be reviewed by a qualified person before being used for statutory or financial reporting purposes.`,
    ],
  },
  {
    id: '5',
    heading: '5. Prohibited uses',
    content: [
      `You must not use the Gigva platform for any of the following purposes:`,
    ],
    bullets: [
      'Inputting, processing, or tracking payments that are the proceeds of fraud, money laundering, or any unlawful activity',
      'Attempting to gain unauthorised access to any part of the Gigva platform, including other customers\' accounts or Gigva\'s backend infrastructure',
      'Reverse engineering, decompiling, or attempting to extract the source code of the Gigva platform',
      'Sending automated requests to the Gigva API at volumes that exceed your plan\'s stated rate limits or that cause degraded performance for other users',
      'Using the platform to store or process data for which you do not have lawful authority, including personal data of individuals who have not consented to its processing',
      'Reselling, white-labelling, or sublicensing access to the Gigva platform without Gigva\'s prior written consent',
      'Inputting false invoice data or manipulating reconciliation records for the purpose of misrepresenting your financial position',
    ],
    content2: [
      `Violation of any of these prohibitions may result in immediate account suspension or termination without refund, and may be reported to relevant authorities where required by law.`,
    ],
  },
  {
    id: '6',
    heading: '6. Subscription and payment terms',
    content: [
      `Access to the Gigva platform is provided on a monthly subscription basis. Subscription plans and their associated transaction volume limits and pricing are published at gigvakenya.co.ke/pricing and may be updated from time to time with reasonable notice.`,
      `Subscription fees are billed at the start of each billing period (calendar month) and are payable in advance. Gigva currently accepts payment via M-Pesa Paybill and major credit or debit cards, as specified at the time of checkout.`,
      `If payment for a billing period fails, Gigva will attempt to collect payment again within 3 business days. If payment continues to fail, access to the platform may be suspended until the outstanding balance is settled. Data is retained during a suspension period of up to 30 days.`,
      `Subscriptions automatically renew at the end of each billing period unless you cancel before the renewal date. Cancellation takes effect at the end of the current billing period; no partial-month refunds are provided. You retain full access to the platform and your data until the end of the paid period.`,
      `If you exceed your plan's transaction volume limit in a given month, we will notify you and, with your agreement, apply the next plan tier's pricing for that billing period. We will not automatically upgrade your plan without notification.`,
      `Prices are stated in Kenyan Shillings (KSh) and are inclusive of any applicable VAT unless otherwise stated.`,
    ],
  },
  {
    id: '7',
    heading: '7. Data ownership and usage',
    content: [
      `You retain full ownership of all data you input into the Gigva platform, including invoice data, customer records, and any configuration data you create. Gigva does not claim any ownership interest in your data.`,
      `Gigva processes your data only to provide the services described in these Terms and our Privacy Policy. We do not sell your data to third parties. We do not use your transaction data, invoice data, or customer data to train machine learning or AI models, to serve advertising, or for any purpose other than operating the platform on your behalf.`,
      `By connecting your M-Pesa Paybill or Till to Gigva via the Daraja API, you grant Gigva permission to receive and process the transaction data delivered by Safaricom's webhook in order to provide the reconciliation and analytics services. This permission can be withdrawn at any time by disconnecting the integration, in which case no further transaction data will be received.`,
      `You grant Gigva a limited, non-exclusive licence to use your data for the sole purpose of providing, operating, and improving the services provided to you under these Terms. This licence does not extend to sharing your data with other Gigva customers or using it for any purpose unrelated to your account.`,
    ],
  },
  {
    id: '8',
    heading: '8. Service availability and disclaimers',
    content: [
      `Gigva aims to maintain platform availability of at least 99% uptime, measured on a monthly basis, excluding scheduled maintenance. We will give at least 48 hours' notice of scheduled maintenance that affects platform availability, except in cases of emergency security patches.`,
      `Gigva depends on the Safaricom Daraja API for real-time M-Pesa transaction delivery. We are not responsible for delays, failures, or data inaccuracies caused by Safaricom system outages, API changes, or M-Pesa service disruptions. If Daraja delivery fails, payments may appear in Gigva with a delay once the Safaricom service recovers.`,
      `The platform is provided "as is" and "as available". To the fullest extent permitted by Kenyan law, we exclude all warranties, express or implied, including warranties of merchantability, fitness for a particular purpose, and accuracy of outputs. You are responsible for reviewing reconciliation and reporting outputs before relying on them for financial, legal, or tax purposes.`,
      `Gigva does not warrant that the platform will be error-free or that all reconciliation matches will be accurate. The accuracy of automated reconciliation depends on the quality and consistency of the reference data in incoming M-Pesa payments, which is outside Gigva's control.`,
    ],
  },
  {
    id: '9',
    heading: '9. Limitation of liability',
    content: [
      `To the fullest extent permitted by the laws of Kenya, Gigva's total aggregate liability to you for any claims arising out of or related to these Terms or your use of the platform — whether in contract, tort, or otherwise — is limited to the total subscription fees you paid to Gigva in the 3 calendar months immediately preceding the event giving rise to the claim.`,
      `Gigva is not liable for:`,
    ],
    bullets: [
      'Loss of revenue, profits, or business opportunity arising from platform downtime, reconciliation errors, or incorrect reporting outputs',
      'Losses arising from Safaricom M-Pesa service disruptions, Daraja API failures, or changes to the Daraja API that affect Gigva\'s integration',
      'Losses arising from your failure to review and verify reconciliation and reporting outputs before relying on them',
      'Data loss resulting from events outside Gigva\'s reasonable control, including hardware failure, natural disasters, or cyberattacks of a scale that could not be reasonably mitigated',
      'Any indirect, consequential, incidental, or punitive damages, even if we have been advised of the possibility of such damages',
    ],
    content2: [
      `Nothing in these Terms limits liability that cannot be excluded under Kenyan law, including liability for fraud, gross negligence, or wilful misconduct.`,
    ],
  },
  {
    id: '10',
    heading: '10. Intellectual property',
    content: [
      `The Gigva platform, including all software, design, documentation, and proprietary reconciliation logic, is owned by Gigva Kenya Limited and is protected by Kenyan intellectual property law. Nothing in these Terms transfers any ownership of the platform or its components to you.`,
      `You are granted a limited, non-exclusive, non-transferable licence to use the platform for your internal business purposes during the term of your subscription. This licence does not include the right to copy, modify, distribute, reverse engineer, or create derivative works based on the platform.`,
    ],
  },
  {
    id: '11',
    heading: '11. Termination',
    content: [
      `You may cancel your Gigva subscription at any time from within your account settings. Cancellation takes effect at the end of the current billing period. You retain full access to the platform and your data until that date.`,
      `Gigva may suspend or terminate your account with immediate effect if:`,
    ],
    bullets: [
      'You breach any material provision of these Terms and fail to remedy the breach within 7 days of written notice',
      'We have reasonable grounds to believe your account is being used for fraudulent or unlawful activity',
      'Payment for your subscription has failed and remains outstanding for more than 30 days',
      'Continued provision of services to you would expose Gigva to legal, regulatory, or reputational risk',
    ],
    content2: [
      `In the event of termination by Gigva for breach, no refund of subscription fees will be provided for the remaining period.`,
      `Following account cancellation or termination, your data will be retained for the periods described in our Privacy Policy. You may export your transaction and invoice data in CSV format at any time while your account is active. After account closure, data export may not be available.`,
    ],
  },
  {
    id: '12',
    heading: '12. Governing law and dispute resolution',
    content: [
      `These Terms are governed by and construed in accordance with the laws of the Republic of Kenya. Any disputes arising out of or in connection with these Terms — including disputes about their formation, validity, or termination — will be resolved under Kenyan law.`,
      `Before initiating formal proceedings, both parties agree to attempt to resolve any dispute through good-faith negotiation for a period of 30 days from the date one party notifies the other of the dispute in writing. To initiate this process, email hello@gigva.co.ke with a written description of the dispute and your proposed resolution.`,
      `If the dispute cannot be resolved through negotiation within 30 days, it will be submitted to the jurisdiction of the courts of Kenya. Both parties consent to the exclusive jurisdiction of the Kenyan courts for the resolution of disputes arising under these Terms.`,
      `Nothing in this clause prevents either party from seeking emergency injunctive or interim relief from a Kenyan court where necessary to protect confidential information, intellectual property rights, or other legitimate interests pending resolution of a dispute.`,
    ],
  },
  {
    id: '13',
    heading: '13. Changes to these Terms',
    content: [
      `We may update these Terms from time to time. When we do, we will update the "Last updated" date at the top of this page.`,
      `For material changes — such as changes to payment terms, liability limits, or your core rights — we will notify active account holders by email at least 14 days before the change takes effect. If you do not agree to the updated Terms, you may cancel your account before the effective date. Continued use of the platform after the effective date constitutes acceptance of the updated Terms.`,
      `Minor changes, such as clarifications of existing provisions, corrections of typographical errors, or updates to contact details, may be made without prior notice.`,
    ],
  },
  {
    id: '14',
    heading: '14. General provisions',
    content: [
      `Entire agreement: These Terms, together with the Privacy Policy, constitute the entire agreement between you and Gigva in relation to your use of the platform and supersede all prior agreements, representations, and understandings.`,
      `Severability: If any provision of these Terms is found to be unenforceable or invalid under Kenyan law, that provision will be modified to the minimum extent necessary to make it enforceable, and the remaining provisions will continue in full force.`,
      `No waiver: Gigva's failure to enforce any provision of these Terms does not constitute a waiver of its right to enforce that provision or any other provision in the future.`,
      `Assignment: You may not assign or transfer your rights or obligations under these Terms without Gigva's prior written consent. Gigva may assign its rights and obligations under these Terms in connection with a merger, acquisition, or sale of substantially all of its assets, with notice to you.`,
      `Force majeure: Neither party is liable for failure to perform obligations under these Terms to the extent that such failure is caused by circumstances beyond their reasonable control, including natural disasters, acts of government, civil unrest, or infrastructure failures, provided the affected party gives prompt notice and takes reasonable steps to mitigate the impact.`,
    ],
  },
  {
    id: '15',
    heading: '15. Contact',
    content: [
      `For questions about these Terms, contact us at:`,
      `Email: hello@gigva.co.ke`,
      `Post: Gigva Kenya Limited, Westlands, Nairobi, Kenya`,
    ],
  },
]

export default function TermsPage() {
  return (
    <section className="section bg-white">
      <div className="inner max-w-3xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-display text-slate-900 mb-2">Terms of Service</h1>
          <p className="text-sm text-slate-500 mb-4">Last updated: 1 January 2026</p>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">
            Please read these Terms carefully before creating a Gigva account. By using the platform,
            you agree to be bound by these Terms. If you have questions, email us at{' '}
            <a href="mailto:hello@gigva.co.ke" className="text-sky-600 hover:underline font-medium">
              hello@gigva.co.ke
            </a>{' '}
            before proceeding.
          </div>
        </div>

        {/* Table of contents */}
        <div className="mb-10 bg-slate-50 border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Contents</p>
          <ol className="space-y-1.5">
            {SECTIONS.map(s => (
              <li key={s.id}>
                <a href={`#term-${s.id}`} className="text-sm text-sky-600 hover:underline">
                  {s.heading}
                </a>
              </li>
            ))}
          </ol>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          {SECTIONS.map(s => (
            <div key={s.id} id={`term-${s.id}`} className="scroll-mt-20">
              <h2 className="font-display font-bold text-lg text-slate-900 mb-3 pb-2 border-b border-slate-100">
                {s.heading}
              </h2>

              {s.content && s.content.map((p, i) => (
                <p key={i} className="text-sm text-slate-700 leading-relaxed mb-4">{p}</p>
              ))}

              {s.bullets && (
                <ul className="space-y-2 mb-4 pl-4">
                  {s.bullets.map((b, i) => (
                    <li key={i} className="text-sm text-slate-700 leading-relaxed list-disc list-outside ml-2">{b}</li>
                  ))}
                </ul>
              )}

              {s.content2 && s.content2.map((p, i) => (
                <p key={i} className="text-sm text-slate-700 leading-relaxed mb-4">{p}</p>
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Questions about these Terms?{' '}
            <a href="mailto:hello@gigva.co.ke" className="text-sky-600 hover:underline">
              hello@gigva.co.ke
            </a>
            {' '}·{' '}
            <Link href="/privacy" className="text-sky-600 hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </section>
  )
}
