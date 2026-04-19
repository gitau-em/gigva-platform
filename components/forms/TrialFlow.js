'use client'
import { useState } from 'react'
import {
  ArrowRight, CheckCircle2, Loader2, AlertCircle,
  User, Building2, Phone, Mail, FileText, ChevronRight
} from 'lucide-react'

const BUSINESS_TYPES = [
  'Retail',
  'Logistics',
  'Restaurant / F&B',
  'Service Business',
  'Other',
]

export default function TrialFlow() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    businessName: '',
    businessType: '',
    description: '',
  })
  const [errors, setErrors]   = useState({})
  const [error, setError]     = useState('')
  const [status, setStatus]   = useState('idle') // idle | loading | success
  const [submitted, setSubmitted] = useState(false)

  function set(k) {
    return e => {
      setForm(f => ({ ...f, [k]: e.target.value }))
      if (errors[k]) setErrors(er => ({ ...er, [k]: '' }))
    }
  }

  function validate() {
    const e = {}
    if (!form.fullName.trim())     e.fullName     = 'Please enter your full name.'
    if (!form.email.includes('@'))  e.email        = 'Please enter a valid email address.'
    if (!form.phone.trim())        e.phone        = 'Please enter your phone number.'
    if (!form.businessName.trim()) e.businessName = 'Please enter your business name.'
    if (!form.businessType)        e.businessType = 'Please select your business type.'
    if (!form.description.trim())  e.description  = 'Please briefly describe your business.'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitted) return

    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setStatus('loading')
    setSubmitted(true)

    try {
      const res  = await fetch('/api/trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!data.ok) { setError(data.msg || 'Submission failed. Please try again.'); setStatus('idle'); setSubmitted(false); return }
      setStatus('success')
    } catch {
      setError('Network error — please check your connection and try again.')
      setStatus('idle')
      setSubmitted(false)
    }
  }

  /* ── Step 2: Success ── */
  if (status === 'success') {
    return (
      <div className="max-w-lg mx-auto">
        {/* Progress bar — complete */}
        <div className="flex items-center gap-2 mb-10">
          <StepDot n={1} state="done" />
          <div className="flex-1 h-0.5 bg-sky-400 rounded-full" />
          <StepDot n={2} state="active" />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-emerald-500 px-8 py-7 text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={36} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-1">You're on the list.</h2>
            <p className="text-emerald-100 text-sm">Access request received</p>
          </div>

          <div className="px-8 py-8 text-center">
            <p className="text-slate-800 font-semibold text-base mb-2">
              Thank you, {form.fullName.split(' ')[0]}.
            </p>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Our team will review your request and help you connect your system within{' '}
              <strong className="text-slate-800">24 hours.</strong>
            </p>

            <div className="bg-sky-50 border border-sky-100 rounded-xl px-5 py-4 mb-6 text-left">
              <p className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-3">What happens next</p>
              <ol className="space-y-2.5">
                {[
                  'We review your request and confirm your business details',
                  'Our team reaches out via email or phone within 24 hours',
                  'We guide you through connecting your M-Pesa Daraja API',
                  'Your dashboard goes live — you\'re up and running',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-sky-200 text-sky-700 flex items-center justify-center
                                     font-bold text-[10px] flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <p className="text-xs text-slate-400">
              We'll contact you at <strong className="text-slate-600">{form.email}</strong> or via phone.
            </p>
          </div>
        </div>
      </div>
    )
  }

  /* ── Step 1: Create Account ── */
  return (
    <div className="max-w-lg mx-auto">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        <StepDot n={1} state="active" />
        <div className="flex-1 h-0.5 bg-slate-200 rounded-full" />
        <StepDot n={2} state="upcoming" />
      </div>

      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-2">Free Trial</p>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Create your account</h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          Tell us about yourself and your business. Our team will help you get connected within 24 hours.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

          {/* Personal Information */}
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-sky-100 flex items-center justify-center">
                <User size={13} className="text-sky-600" />
              </div>
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Personal Information</h2>
            </div>
          </div>

          <div className="px-6 py-5 space-y-4 border-b border-slate-100">
            <Field
              label="Full Name"
              id="fullName"
              required
              error={errors.fullName}
            >
              <input
                id="fullName"
                className={`input ${errors.fullName ? 'border-red-300 focus:ring-red-400 focus:border-red-400' : ''}`}
                placeholder="e.g. Jane Mwangi"
                value={form.fullName}
                onChange={set('fullName')}
                autoComplete="name"
              />
            </Field>

            <Field
              label="Email Address"
              id="email"
              required
              error={errors.email}
            >
              <input
                id="email"
                type="email"
                className={`input ${errors.email ? 'border-red-300 focus:ring-red-400 focus:border-red-400' : ''}`}
                placeholder="you@business.co.ke"
                value={form.email}
                onChange={set('email')}
                autoComplete="email"
              />
            </Field>

            <Field
              label="Phone Number"
              id="phone"
              required
              error={errors.phone}
            >
              <input
                id="phone"
                type="tel"
                className={`input ${errors.phone ? 'border-red-300 focus:ring-red-400 focus:border-red-400' : ''}`}
                placeholder="+254 7xx xxx xxx"
                value={form.phone}
                onChange={set('phone')}
                autoComplete="tel"
              />
            </Field>
          </div>

          {/* Business Information */}
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-sky-100 flex items-center justify-center">
                <Building2 size={13} className="text-sky-600" />
              </div>
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Business Information</h2>
            </div>
          </div>

          <div className="px-6 py-5 space-y-4">
            <Field
              label="Business Name"
              id="businessName"
              required
              error={errors.businessName}
            >
              <input
                id="businessName"
                className={`input ${errors.businessName ? 'border-red-300 focus:ring-red-400 focus:border-red-400' : ''}`}
                placeholder="e.g. Kamau Hardware Ltd"
                value={form.businessName}
                onChange={set('businessName')}
                autoComplete="organization"
              />
            </Field>

            <Field
              label="Business Type"
              id="businessType"
              required
              error={errors.businessType}
            >
              <select
                id="businessType"
                className={`input ${errors.businessType ? 'border-red-300 focus:ring-red-400 focus:border-red-400' : ''}`}
                value={form.businessType}
                onChange={set('businessType')}
              >
                <option value="">Select your business type…</option>
                {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>

            <Field
              label="Business Description"
              id="description"
              required
              error={errors.description}
              hint="Briefly describe your business and how you receive payments"
            >
              <textarea
                id="description"
                rows={3}
                className={`input resize-none ${errors.description ? 'border-red-300 focus:ring-red-400 focus:border-red-400' : ''}`}
                placeholder="e.g. We run a wholesale hardware shop in Nairobi and receive 80–100 M-Pesa payments daily from contractors and walk-in customers."
                value={form.description}
                onChange={set('description')}
              />
            </Field>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6">
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600
                       text-white font-bold text-sm py-4 px-6 rounded-xl
                       transition-all duration-150 active:scale-[0.99]
                       disabled:opacity-60 disabled:cursor-not-allowed
                       focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2"
          >
            {status === 'loading' ? (
              <><Loader2 size={16} className="animate-spin" /> Submitting your request…</>
            ) : (
              <>Request Access <ArrowRight size={15} /></>
            )}
          </button>

          <p className="text-[11px] text-slate-400 text-center mt-3 leading-relaxed">
            By requesting access you agree to our{' '}
            <a href="/terms" className="text-sky-500 hover:underline">Terms of Service</a> and{' '}
            <a href="/privacy" className="text-sky-500 hover:underline">Privacy Policy</a>.
            No credit card required.
          </p>
        </div>

        {/* Trust strip */}
        <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2">
          {[
            '3 months free',
            'Guided setup included',
            'Kenya-hosted data',
            'Cancel any time',
          ].map(p => (
            <div key={p} className="flex items-center gap-1.5 text-xs text-slate-400">
              <CheckCircle2 size={11} className="text-emerald-500 flex-shrink-0" />
              {p}
            </div>
          ))}
        </div>
      </form>
    </div>
  )
}

/* ── Sub-components ── */

function Field({ label, id, required, error, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor={id}>
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {hint && <p className="text-[11px] text-slate-400 mb-1.5">{hint}</p>}
      {children}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-red-600 mt-1.5">
          <AlertCircle size={11} className="flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}

function StepDot({ n, state }) {
  const base = 'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 flex-shrink-0'
  if (state === 'done')
    return <div className={`${base} bg-sky-500 text-white`}><CheckCircle2 size={14} /></div>
  if (state === 'active')
    return <div className={`${base} bg-sky-500 text-white ring-4 ring-sky-100`}>{n}</div>
  return <div className={`${base} bg-slate-100 text-slate-400`}>{n}</div>
}
