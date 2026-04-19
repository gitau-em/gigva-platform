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

export default function ContactForm() {
  const [form, setForm] = useState({
    name:         '',
    email:        '',
    company:      '',
    businessType: '',
    role:         '',
    message:      '',
  })
  const [status, setStatus] = useState('idle')
  const [error, setError]   = useState('')

  function set(k) { return e => setForm(f => ({ ...f, [k]: e.target.value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.name.trim())         { setError('Please enter your name.');             return }
    if (!form.email.includes('@')) { setError('Please enter a valid email address.'); return }
    if (!form.message.trim())      { setError('Please enter a message.');             return }

    setStatus('loading')
    try {
      // API accepts: name, email, company, role, message
      // We send role (person's title) + append businessType to company context
      const payload = {
        name:    form.name.trim(),
        email:   form.email.trim(),
        company: form.company.trim()
          ? form.businessType
            ? `${form.company.trim()} (${form.businessType})`
            : form.company.trim()
          : form.businessType || '',
        role:    form.role,
        message: form.message.trim(),
      }
      const res  = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      const data = await res.json()
      if (!data.ok) { setError(data.msg || 'Submission failed. Please try again.'); setStatus('idle'); return }
      setStatus('success')
    } catch {
      setError('Network error. Please check your connection and try again.')
      setStatus('idle')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-10">
        <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-3" />
        <h3 className="font-bold text-lg text-slate-900 mb-1">Message sent</h3>
        <p className="text-slate-600 text-sm leading-relaxed max-w-xs mx-auto">
          We will get back to you within one business day (Mon–Fri, EAT).
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">

      {/* Name + Company */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="c-name">
            Full name <span className="text-red-500">*</span>
          </label>
          <input
            id="c-name"
            className="input"
            placeholder="Your name"
            value={form.name}
            onChange={set('name')}
            autoComplete="name"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="c-company">
            Business name
          </label>
          <input
            id="c-company"
            className="input"
            placeholder="e.g. Kamau Hardware"
            value={form.company}
            onChange={set('company')}
            autoComplete="organization"
          />
        </div>
      </div>

      {/* Email + Role */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="c-email">
            Email address <span className="text-red-500">*</span>
          </label>
          <input
            id="c-email"
            className="input"
            type="email"
            placeholder="you@business.co.ke"
            value={form.email}
            onChange={set('email')}
            autoComplete="email"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="c-role">
            Your role
          </label>
          <select
            id="c-role"
            className="input"
            value={form.role}
            onChange={set('role')}
          >
            <option value="">Select your role…</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {/* Business type */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="c-biztype">
          Business type
        </label>
        <select
          id="c-biztype"
          className="input"
          value={form.businessType}
          onChange={set('businessType')}
        >
          <option value="">Select your business type…</option>
          {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Message */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="c-message">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="c-message"
          className="input resize-none"
          rows={4}
          placeholder="What can we help you with? For example: your business type, current payment volume, or a specific question about Gigva."
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
        className="btn-primary w-full justify-center py-2.5"
      >
        {status === 'loading'
          ? <><Loader2 size={15} className="animate-spin" /> Sending…</>
          : <>Send message <ArrowRight size={15} /></>}
      </button>

      <p className="text-[11px] text-slate-400 text-center">
        We respond within one business day, Monday to Friday (EAT). No automated replies.
      </p>
    </form>
  )
}
