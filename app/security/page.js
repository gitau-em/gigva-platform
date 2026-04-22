import Link from 'next/link'
import {
  Shield, Lock, Server, Eye, Database, Key,
  Activity, FileCheck, ArrowRight, CheckCircle2
} from 'lucide-react'

export const metadata = {
  title: 'Security',
  description: 'How Gigva protects your M-Pesa transaction data. Encryption, access controls, compliance, and infrastructure security for Kenyan businesses.',
}

export default function SecurityPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-800 pt-16 pb-14 px-5 md:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl bg-sky-500/20 border border-sky-400/30
                          flex items-center justify-center mx-auto mb-6">
            <Shield size={28} className="text-sky-400" />
          </div>
          <p className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-3">Security</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight tracking-tight">
            Your data is protected<br />
            <span className="text-sky-400">by design, not as an afterthought.</span>
          </h1>
          <p className="text-slate-300 text-base leading-relaxed max-w-2xl mx-auto">
            Gigva has handled financial transaction data since 2012. Every security measure below
            is structural — built into how the platform works, not bolted on afterwards.
          </p>
        </div>
      </section>

      {/* Core security measures */}
      <section className="section bg-white border-t border-slate-200">
        <div className="inner max-w-4xl">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-2">Data Protection</p>
            <h2 className="text-2xl font-bold text-slate-900">How we protect your data</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {[
              {
                icon: Server,
                title: 'Kenya-hosted data',
                badge: 'Compliance',
                body: 'All customer transaction data is stored on servers physically located in Kenya. No financial or personal data leaves Kenya without your explicit written consent. Fully compliant with the Kenya Data Protection Act 2019.',
              },
              {
                icon: Lock,
                title: 'AES-256 encryption at rest',
                badge: 'Encryption',
                body: 'Sensitive data in the database — including transaction records, personal information, and financial reports — is encrypted at rest using AES-256. Even if the storage medium were compromised, the data remains unreadable.',
              },
              {
                icon: Shield,
                title: 'TLS 1.3 in transit',
                badge: 'Transport',
                body: 'Every request between your browser and Gigva servers is encrypted using TLS 1.3 — the latest and most secure transport protocol. Unencrypted HTTP connections are rejected outright.',
              },
              {
                icon: Key,
                title: 'bcrypt password hashing',
                badge: 'Credentials',
                body: 'Your password is never stored in readable form. We store a bcrypt hash with cost factor 12. Even Gigva engineers cannot read your password. If our database were leaked, your credentials remain protected.',
              },
              {
                icon: Database,
                title: 'Parameterised queries',
                badge: 'Application',
                body: 'Every database query throughout the application uses parameterised prepared statements. SQL injection is structurally prevented at the code level — not filtered or sanitised as an afterthought.',
              },
              {
                icon: Activity,
                title: 'Access logging & audit trail',
                badge: 'Audit',
                body: 'All account access events and data modification operations are logged with timestamps and IP addresses. Logs are retained for 12 months to support security audits and compliance requirements.',
              },
              {
                icon: Eye,
                title: 'Role-based access control',
                badge: 'Access',
                body: 'Access to customer data within Gigva is restricted by role. Engineers have no routine access to production data. All access to sensitive systems requires multi-factor authentication and is logged.',
              },
              {
                icon: FileCheck,
                title: 'Data Protection Act compliance',
                badge: 'Legal',
                body: 'Gigva operates fully within the Kenya Data Protection Act 2019. Our Privacy Policy describes exactly what data we collect, how it is used, and your rights as a data subject under Kenyan law.',
              },
            ].map(({ icon: Icon, title, badge, body }) => (
              <div key={title} className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-9 h-9 bg-sky-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-sky-600" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {badge}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-2">{title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Infrastructure */}
      <section className="section bg-slate-50 border-t border-slate-200">
        <div className="inner max-w-3xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Infrastructure & reliability</h2>
          <div className="space-y-5 text-slate-700 leading-relaxed text-sm">
            <p>
              The Gigva platform is hosted on dedicated infrastructure in Kenya. We operate
              separate environments for development, staging, and production. No customer data
              is present in development or staging environments.
            </p>
            <p>
              The Daraja API integration uses dedicated, credentialed connections per customer
              account. Your Safaricom M-Pesa Daraja credentials are stored encrypted and are
              never exposed in API responses, logs, or error messages.
            </p>
            <p>
              The reconciliation engine processes incoming C2B webhook events with idempotency
              guarantees — duplicate webhook deliveries from Safaricom do not result in
              duplicate transaction records. All webhook endpoints validate the source and
              signature before processing.
            </p>
          </div>

          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            {[
              { label: 'Uptime SLA', value: '99.9%', sub: 'Platform availability' },
              { label: 'Webhook latency', value: '<5s', sub: 'Transaction capture time' },
              { label: 'Data retention', value: '12 mo', sub: 'Access log retention' },
            ].map(({ label, value, sub }) => (
              <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-sky-500 mb-1">{value}</div>
                <div className="text-xs font-semibold text-slate-700">{label}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Responsible disclosure */}
      <section className="section bg-white border-t border-slate-200">
        <div className="inner max-w-3xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Responsible disclosure</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-5">
            If you believe you have found a security vulnerability in Gigva, please contact our
            security team directly. We take every report seriously, investigate promptly, and
            aim to communicate resolution timelines within 48 hours of receiving a valid report.
          </p>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="section bg-sky-50 border-t border-sky-100">
        <div className="inner max-w-xl text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Questions about security?</h2>
          <p className="text-sm text-slate-600 mb-6">
            Read our Privacy Policy for full details on data handling, or get in touch with our team.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/privacy" className="btn-primary">
              Read Privacy Policy <ArrowRight size={14} />
            </Link>
            <Link href="/contact" className="btn-secondary">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
