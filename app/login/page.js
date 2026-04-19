import LoginForm from '@/components/forms/LoginForm'
import Link from 'next/link'

export const metadata = {
  title: 'Sign In',
  description: 'Sign in to your Gigva account to access your M-Pesa payment dashboard.',
}

export default function LoginPage() {
  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-sky-50 to-white flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-2">Gigva</p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Sign in to your account</h1>
          <p className="text-sm text-slate-500">
            Don't have an account?{' '}
            <Link href="/trial" className="text-sky-600 hover:underline font-medium">
              Request free trial access
            </Link>
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
            <h2 className="font-bold text-slate-800 text-sm">Account login</h2>
            <p className="text-xs text-slate-500 mt-0.5">Enter your email and password below</p>
          </div>
          <div className="p-6">
            <LoginForm />
          </div>
        </div>

        {/* Footer links */}
        <div className="flex items-center justify-between mt-5 text-xs text-slate-400">
          <Link href="/contact" className="hover:text-sky-600 transition-colors">Need help?</Link>
          <Link href="/privacy" className="hover:text-sky-600 transition-colors">Privacy Policy</Link>
        </div>
      </div>
    </section>
  )
}
