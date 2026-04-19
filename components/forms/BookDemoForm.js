'use client'
import { useState } from 'react'
import { ArrowRight, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'

const BUSINESS_TYPES = [
  'Retail / wholesale shop',
  'Logistics / courier',
  'Restaurant / food service',
  'Professional services',
  'Healthcare / clinic',
  'School / education',
  'Other',
]

const ROLES = [
  'Owner / Founder',
  'CEO / Managing Director',
  'Finance Manager',
  'Operations Manager',
  'Accountant',
  'IT / Systems Manager',
  'Other',
]

export default function BookDemoForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    businessType: '',
    role: '',
    message: '',
  })
  const [status, setStatus] = useState('idle')
  const [error, setError]   = useState('')

  function set(k) { return e => setForm(f => ({ ...f, [k]: e.target.value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.name.trim())    { setError('Please enter your name.'); return }
    if (!form.email.includes('@')) { setError('Please enter a valid email address.'); return }
    if (!form.company.trim()) { setError('Please enter your business name.'); return }
    if (!form.role)           { setError('Please select your role.'); return }

    setStatus('loading')
    try {
      const res  = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source: 'book-demo' }),
      })
      const data = await res.json()
      if (!data.ok) { setError(data.msg || 'Submission failed. Please try again.'); setStatus('idle'); return }
      setStatus('success')
    } catch {
      setError('Network error — please check your connection and try again.')
      setStatus('idle')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-10">
        <CheckCircle2 size={44} className="text-emerald-500 mx-auto mb-4" />
        <h3 className="font-bold text-xl text-slate-900 mb-2">Demo request received</h3>
        <p className="text-slate-600 text-sm leading-relaxed max-w-xs mx-auto">
          We'll get back to you within one business day to confirm a time.
          Check your email — including spam.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">

      {/* Name + Company */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="bd-name">
            Full name <span className="text-red-500">*</span>
          </label>
          <input
            id="bd-name"
            className="input"
            placeholder="Your name"
            value={form.name}
            onChange={set('name')}
            autoComplete="name"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="bd-company">
            Business name <span className="text-red-500">*</span>
          </label>
          <input
            id="bd-company"
            className="input"
            placeholder="e.g. Kamau Hardware"
            value={form.company}
            onChange={set('company')}
            autoComplete="organization"
          />
        </div>
      </div>

      {/* Email + Phone */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="bd-email">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="bd-email"
            className="input"
            type="email"
            placeholder="you@business.co.ke"
            value={form.email}
            onChange={set('email')}
            autoComplete="email"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="bd-phone">
            Phone number
          </label>
          <input
            id="bd-phone"
            className="input"
            type="tel"
            placeholder="+254 7xx xxx xxx"
            value={form.phone}
            onChange={set('phone')}
            autoComplete="tel"
          />
        </div>
      </div>

      {/* Business type + Role */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="bd-type">
            Business type
          </label>
          <select
            id="bd-type"
            className="input"
            value={form.businessType}
            onChange={set('businessType')}
          >
            <option value="">Select type…</option>
            {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="bd-role">
            Your role <span className="text-red-500">*</span>
          </label>
          <select
            id="bd-role"
            className="input"
            value={form.role}
            onChange={set('role')}
          >
            <option value="">Select your role…</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {/* Message */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="bd-msg">
          Brief message (optional)
        </label>
        <textarea
          id="bd-msg"
          className="input resize-none"
          rows={3}
          placeholder="e.g. We process ~200 M-Pesa payments a day and currently reconcile manually in Excel. Looking for a better solution."
          value={form.message}
          onChange={set('message')}
        />
      </div>

      {error && (
        <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="btn-primary w-full justify-center py-3 text-sm font-bold"
      >
        {status === 'loading'
          ? <><Loader2 size={15} className="animate-spin" /> Submitting…</>
          : <>Submit demo request <ArrowRight size={15} /></>}
      </button>

      <p className="text-[11px] text-slate-400 text-center">
        We respond within one business day. No spam, no automated sales sequences.
      </p>
    </form>
  )
}
