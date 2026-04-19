'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2, AlertCircle, Eye, EyeOff, Lock } from 'lucide-react'

export default function AdminLoginForm() {
  const router = useRouter()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [status, setStatus]   = useState('idle')
  const [error, setError]     = useState('')

  function set(k) { return e => setForm(f => ({ ...f, [k]: e.target.value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.email.includes('@')) { setError('Please enter a valid email address.'); return }
    if (!form.password)             { setError('Please enter your password.');         return }

    setStatus('loading')
    try {
      const res  = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      })
      const data = await res.json()

      if (!data.ok) {
        setError(data.msg || 'Invalid credentials.')
        setStatus('idle')
        return
      }

      // Accept superadmin AND any staff member with a role assigned
      const hasAccess = data.user?.is_admin || data.user?.role
      if (!hasAccess) {
        setError('No staff access found for this account. Contact your administrator.')
        setStatus('idle')
        return
      }

      localStorage.setItem('gigva_token', data.token)
      router.push('/admin/dashboard')
    } catch {
      setError('Network error — please check your connection and try again.')
      setStatus('idle')
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="admin-email">
          Staff email
        </label>
        <input
          id="admin-email"
          type="email"
          className="input"
          placeholder="yourname@gigva.co.ke"
          value={form.email}
          onChange={set('email')}
          autoComplete="email"
          autoFocus
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="admin-password">
          Password
        </label>
        <div className="relative">
          <input
            id="admin-password"
            type={showPwd ? 'text' : 'password'}
            className="input pr-10"
            placeholder="Your password"
            value={form.password}
            onChange={set('password')}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPwd(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label={showPwd ? 'Hide password' : 'Show password'}
          >
            {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-lg">
          <AlertCircle size={14} className="flex-shrink-0" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700
                   disabled:opacity-60 text-white font-bold text-sm py-3 px-4 rounded-xl
                   transition-colors duration-150"
      >
        {status === 'loading'
          ? <><Loader2 size={15} className="animate-spin" /> Signing in…</>
          : <><Lock size={14} /> Sign in to Staff Portal</>}
      </button>
    </form>
  )
}
