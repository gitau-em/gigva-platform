'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  CheckCircle2, Clock, Mail, ArrowRight, LogOut,
  Loader2, Calendar, MessageSquare, ShieldCheck
} from 'lucide-react'

export default function CustomerDashboard() {
  const router  = useRouter()
  const [user, setUser]           = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('gigva_token') : null
    if (!token) { router.replace('/login'); return }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('gigva_token')
        router.replace('/login')
        return
      }
      // Admins and staff should be in the admin dashboard
      if (payload.is_admin || payload.role) {
        router.replace('/admin/dashboard')
        return
      }
      setUser(payload)
    } catch {
      router.replace('/login')
    } finally {
      setAuthLoading(false)
    }
  }, [router])

  function handleLogout() {
    localStorage.removeItem('gigva_token')
    router.push('/')
  }

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-sky-400" />
      </div>
    )
  }
  if (!user) return null

  const firstName = user.name?.split(' ')[0] || 'there'

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between sticky top-16 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center">
            <ShieldCheck size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{user.name}</p>
            <p className="text-xs text-slate-400">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-500
                     hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-12">

        {/* Status card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="bg-sky-500 px-8 py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <Clock size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Welcome, {firstName}.
            </h1>
            <p className="text-sky-100 text-sm">Your access request is being reviewed.</p>
          </div>

          <div className="px-8 py-8">
            <p className="text-slate-700 text-sm leading-relaxed mb-6">
              Our team reviews every trial request personally. You will receive an email at{' '}
              <strong className="text-slate-900">{user.email}</strong> within{' '}
              <strong className="text-slate-900">one business day</strong> with your access
              details and a guide to connecting your M-Pesa Paybill.
            </p>

            {/* What happens next */}
            <div className="bg-sky-50 border border-sky-100 rounded-xl p-5 mb-6">
              <p className="text-xs font-bold text-sky-700 uppercase tracking-widest mb-4">
                What happens next
              </p>
              <ol className="space-y-3">
                {[
                  { done: true,  text: 'Trial request submitted' },
                  { done: false, text: 'Our team reviews your business details' },
                  { done: false, text: 'You receive access credentials by email' },
                  { done: false, text: 'We help you connect your M-Pesa Daraja API' },
                  { done: false, text: 'Your live dashboard goes active' },
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                      ${step.done ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                      {step.done
                        ? <CheckCircle2 size={12} className="text-white" />
                        : <span className="text-[9px] font-bold text-slate-500">{i + 1}</span>}
                    </div>
                    <span className={`text-sm ${step.done ? 'text-emerald-700 font-medium' : 'text-slate-600'}`}>
                      {step.text}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 text-sm text-amber-800">
              <strong>Check your inbox</strong> — including your spam folder.
              Our reply will come from <span className="font-mono text-xs">samuel.otieno@gigva.co.ke</span>.
            </div>
          </div>
        </div>

        {/* While you wait */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-4">
          <h2 className="font-bold text-slate-900 mb-4">While you wait</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link href="/product"
              className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-sky-300 hover:bg-sky-50 transition-colors group">
              <div className="w-9 h-9 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={16} className="text-sky-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 group-hover:text-sky-700">Explore the platform</p>
                <p className="text-xs text-slate-500 mt-0.5">See how reconciliation and reporting work</p>
              </div>
            </Link>

            <Link href="/book-demo"
              className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-sky-300 hover:bg-sky-50 transition-colors group">
              <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <Calendar size={16} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 group-hover:text-sky-700">Book a guided demo</p>
                <p className="text-xs text-slate-500 mt-0.5">30 minutes with our team before you go live</p>
              </div>
            </Link>

            <Link href="/contact"
              className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-sky-300 hover:bg-sky-50 transition-colors group">
              <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <MessageSquare size={16} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 group-hover:text-sky-700">Ask a question</p>
                <p className="text-xs text-slate-500 mt-0.5">Send us a message — we respond same day</p>
              </div>
            </Link>

            <a href="mailto:samuel.otieno@gigva.co.ke?subject=Trial access question"
              className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-sky-300 hover:bg-sky-50 transition-colors group">
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Mail size={16} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 group-hover:text-sky-700">Email Samuel directly</p>
                <p className="text-xs text-slate-500 mt-0.5">Head of Customer Success</p>
              </div>
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400">
          Having trouble?{' '}
          <a href="mailto:hello@gigvakenya.co.ke" className="text-sky-600 hover:underline">
            hello@gigvakenya.co.ke
          </a>
        </p>
      </div>
    </div>
  )
}
