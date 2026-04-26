'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Download, Send, ChevronLeft, Loader2, Users, AlertCircle } from 'lucide-react'

const PURPOSE_OPTIONS = [
  { value: 'general',  label: 'General Reference Letter' },
  { value: 'bank',     label: 'Bank / Financial Reference' },
  { value: 'visa',     label: 'Visa / Travel Support Letter' },
  { value: 'tenancy',  label: 'Tenancy / Rental Reference' },
  { value: 'custom',   label: 'Custom (write your own body)' },
]

export default function ReferenceLetterPage() {
  const router = useRouter()
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState('success')

  const [form, setForm] = useState({
    employeeId: '',
    letterDate: new Date().toISOString().slice(0, 10),
    recipientName: '',
    recipientTitle: '',
    recipientOrg: '',
    purpose: 'general',
    customBody: '',
    sendEmail: false,
  })

  // Auth check - CTO only
  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('gigva_token') : null
    if (!t) { router.push('/admin/login'); return }
    try {
      const payload = JSON.parse(atob(t.split('.')[1]))
      if (payload.role !== 'cto' && !payload.is_admin) {
        router.push('/admin/dashboard'); return
      }
      setToken(t)
      setUser(payload)
    } catch { router.push('/admin/login') }
  }, [])

  // Load employees
  useEffect(() => {
    if (!token) return
    const hdr = { Authorization: 'Bearer ' + token }
    setLoading(true)
    fetch('/api/admin/reference-letter', { headers: hdr })
      .then(r => r.json())
      .then(d => { if (d.ok) setEmployees(d.employees || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  const hdr = token ? { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' } : {}

  const handleGenerate = async (action) => {
    if (!form.employeeId) { setMsg('Please select an employee'); setMsgType('error'); return }
    setGenerating(true); setMsg('')
    try {
      const body = { ...form, sendEmail: action === 'email' }
      const r = await fetch('/api/admin/reference-letter', { method: 'POST', headers: hdr, body: JSON.stringify(body) })
      const d = await r.json()
      if (!d.ok) { setMsg(d.msg || 'Failed to generate'); setMsgType('error'); return }

      // Download PDF
      const bytes = Uint8Array.from(atob(d.pdf), c => c.charCodeAt(0))
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = d.filename; a.click()
      setTimeout(() => URL.revokeObjectURL(url), 2000)

      setMsg(action === 'email' ? 'Reference letter generated, downloaded and emailed!' : 'Reference letter generated and downloaded!')
      setMsgType('success')
    } catch (e) { setMsg('Error: ' + e.message); setMsgType('error') }
    setGenerating(false)
  }

  const field = (label, key, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
      />
    </div>
  )

  if (!user) return <div className="min-h-screen flex items-center justify-center"><Loader2 size={32} className="animate-spin text-blue-600" /></div>

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-blue-700 px-5 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/admin/dashboard')} className="flex items-center gap-1 text-white/80 hover:text-white text-sm">
            <ChevronLeft size={16} /> Dashboard
          </button>
          <span className="text-white/40">|</span>
          <FileText size={16} className="text-white" />
          <span className="text-sm font-bold text-white">Reference Letter Generator</span>
          <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-semibold ml-1">CTO Only</span>
        </div>
        <div className="text-xs text-white/70">{user.name || user.email}</div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {msg && (
          <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-lg ${msgType === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
            <AlertCircle size={15} />
            {msg}
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2"><Users size={17} className="text-blue-600" /> Select Employee</h2>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Employee *</label>
            {loading ? (
              <div className="flex items-center gap-2 text-slate-500 text-sm"><Loader2 size={15} className="animate-spin" /> Loading employees...</div>
            ) : (
              <select
                value={form.employeeId}
                onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Select Employee --</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.name} — {e.designation || 'Staff'} ({e.department || 'N/A'})</option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
          <h2 className="text-base font-bold text-slate-800">Letter Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field('Letter Date', 'letterDate', 'date')}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Purpose / Letter Type *</label>
              <select
                value={form.purpose}
                onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                {PURPOSE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
          <h2 className="text-base font-bold text-slate-800">Recipient Details <span className="text-xs font-normal text-slate-400">(optional)</span></h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {field('Recipient Name', 'recipientName', 'text', 'e.g. The Manager')}
            {field('Recipient Title', 'recipientTitle', 'text', 'e.g. Branch Manager')}
            {field('Organization', 'recipientOrg', 'text', 'e.g. KCB Bank Nairobi')}
          </div>
        </div>

        {form.purpose === 'custom' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3">
            <h2 className="text-base font-bold text-slate-800">Custom Letter Body</h2>
            <p className="text-xs text-slate-500">Write the full body text of the letter. Use empty lines to separate paragraphs.</p>
            <textarea
              value={form.customBody}
              onChange={e => setForm(f => ({ ...f, customBody: e.target.value }))}
              rows={8}
              placeholder="Type the body of the reference letter here..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-y"
            />
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.sendEmail}
              onChange={e => setForm(f => ({ ...f, sendEmail: e.target.checked }))}
              className="w-4 h-4 rounded border-slate-300 text-blue-600"
            />
            <span className="text-sm text-slate-700">Also email the letter to the employee's work email</span>
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleGenerate('download')}
            disabled={generating}
            className="flex items-center gap-2 px-6 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 disabled:opacity-60 text-sm"
          >
            <Download size={15} />
            {generating ? 'Generating...' : 'Generate & Download PDF'}
          </button>
          {form.sendEmail && (
            <button
              onClick={() => handleGenerate('email')}
              disabled={generating}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-60 text-sm"
            >
              <Send size={15} />
              Generate, Download & Email
            </button>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs font-bold text-blue-700 uppercase mb-2">How it works</p>
          <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
            <li>Select an employee from the payroll database</li>
            <li>Choose the letter purpose (bank, visa, tenancy, or general)</li>
            <li>Add optional recipient details for a personalised letter</li>
            <li>Click Generate to create a signed PDF on company letterhead</li>
            <li>Optionally email the letter directly to the employee</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
