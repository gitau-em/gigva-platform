import AdminLoginForm from '@/components/admin/AdminLoginForm'

export const metadata = {
  title: 'Staff Login — Gigva Admin',
  description: 'Authorised staff access only.',
  robots: { index: false, follow: false },
}

export default function AdminLoginPage() {
  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" viewBox="0 0 24 24"
                 stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">Gigva Kenya</p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Staff Login</h1>
          <p className="text-sm text-slate-500">Authorised personnel only</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-indigo-50">
            <h2 className="font-bold text-indigo-900 text-sm">Admin Console Access</h2>
            <p className="text-xs text-indigo-600 mt-0.5">Sign in with your staff credentials</p>
          </div>
          <div className="p-6">
            <AdminLoginForm />
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-5">
          Not staff?{' '}
          <a href="/" className="text-sky-600 hover:underline">Back to Gigva home</a>
        </p>
      </div>
    </section>
  )
}
