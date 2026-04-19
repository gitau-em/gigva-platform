'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react'

export default function LoginForm() {
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
        setError(data.msg || 'Incorrect email or password.')
        setStatus('idle')
        return
      }
      localStorage.setItem('gigva_token', data.token)
      // Admins land on the admin dashboard; regular users on /dashboard
      router.push(data.user?.is_admin ? '/admin/dashboard' : '/dashboard')
    } catch {
      setError('Network error — please check your connection and try again.')
      setStatus('idle')
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="login-email">
          Email address
        </label>
        <input
          id="login-email"
          type="email"
          className="input"
          placeholder="you@business.co.ke"
          value={form.email}
          onChange={set('email')}
          autoComplete="email"
          autoFocus
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-slate-600" htmlFor="login-password">
            Password
          </label>
          <a href="mailto:hello@gigvakenya.co.ke?subject=Password reset request"
             className="text-[11px] text-sky-600 hover:underline">
            Forgot password?
          </a>
        </div>
        <div className="relative">
          <input
            id="login-password"
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
        className="btn-primary w-full justify-center py-3 text-sm font-bold"
      >
        {status === 'loading'
          ? <><Loader2 size={15} className="animate-spin" /> Signing in…</>
          : <>Sign in <ArrowRight size={15} /></>}
      </button>
    </form>
  )
}
