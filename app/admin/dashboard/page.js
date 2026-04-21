'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Mail, Calendar, Zap, LogOut, RefreshCw, Trash2, CheckCheck,
  MessageSquareReply, CheckCircle2, XCircle, PhoneCall,
  Loader2, ChevronDown, ChevronUp, Search, Users,
  ShieldCheck, ExternalLink, PlusCircle, UserX, Key,
  AlertCircle, Building2, UserCog, MailOpen
} from 'lucide-react'
import { ROLES } from '@/lib/roleConfig'

// ─── helpers ────────────────────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-KE', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function StatusBadge({ status }) {
  const map = {
    new: 'bg-blue-100 text-blue-700', read: 'bg-slate-100 text-slate-600',
    replied: 'bg-green-100 text-green-700', pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-sky-100 text-sky-700', completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700', approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700', active: 'bg-green-100 text-green-700',
    disabled: 'bg-slate-100 text-slate-500',
  }
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold capitalize
                      ${map[status] || 'bg-slate-100 text-slate-500'}`}>
      {status}
    </span>
  )
}

function RoleBadge({ role }) {
  const cfg = ROLES[role] || ROLES['people_ops']
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${cfg.badge}`}>
      {cfg.label}
    </span>
  )
}

function EmptyState({ icon: Icon, label }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
      <Icon size={36} className="mb-3 opacity-30" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  )
}

function Toast({ msg }) {
  if (!msg) return null
  return (
    <div className="fixed bottom-5 right-5 z-50 bg-slate-800 text-white text-sm
                    px-4 py-2.5 rounded-xl shadow-lg animate-fade-in">
      {msg}
    </div>
  )
}

// ─── Messages tab ────────────────────────────────────────────────────────────
function MessagesTab({ token }) {
  const [rows, setRows]       = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSel]    = useState(new Set())
  const [search, setSearch]   = useState('')
  const [expanded, setExp]    = useState(null)
  const [busy, setBusy]       = useState(null)
  const [toast, setToast]     = useState('')

  const notify = m => { setToast(m); setTimeout(() => setToast(''), 3000) }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/contacts', { headers: { Authorization: `Bearer ${token}` } })
      const d = await r.json()
      if (d.ok) setRows(d.contacts)
    } finally { setLoading(false) }
  }, [token])

  useEffect(() => { load() }, [load])

  const filtered = rows.filter(r =>
    (source === 'trial' ? r.source === 'trial' : r.source !== 'trial') &&
    (!search || [r.name, r.email, r.company, r.message]
      .some(v => v?.toLowerCase().includes(search.toLowerCase())))
  )

  const toggleSel = id => setSel(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const selAll    = ()  => setSel(s => s.size === filtered.length ? new Set() : new Set(filtered.map(r => r.id)))

  async function patch(id, status) {
    setBusy(id + status)
    await fetch('/api/admin/contacts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, status }),
    })
    setBusy(null); notify(`Marked as ${status}`); load()
  }

  async function del(ids) {
    await fetch('/api/admin/contacts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ids }),
    })
    setSel(new Set()); notify(`Deleted ${ids.length} message(s)`); load()
  }

  return (
    <div className="space-y-4">
      <Toast msg={toast} />
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="w-full pl-8 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Search messages…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {selected.size > 0 && (
          <button onClick={() => { if (confirm(`Delete ${selected.size} message(s)?`)) del([...selected]) }}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 font-medium">
            <Trash2 size={14} /> Delete ({selected.size})
          </button>
        )}
        <button onClick={load} className="flex items-center gap-1.5 px-3 py-2 text-sm bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 font-medium">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-indigo-400" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Mail} label="No messages found" />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-[2rem_1fr_1fr_1fr_5.5rem_8rem] gap-2 items-center px-4 py-2.5
                          bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
            <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0}
              onChange={selAll} className="rounded border-slate-300 accent-indigo-600" />
            <span>Sender</span><span>Company</span><span>Preview</span><span>Status</span><span>Actions</span>
          </div>

          {filtered.map(row => (
            <div key={row.id} className={`border-b border-slate-100 last:border-0 transition-colors
              ${expanded === row.id ? 'bg-indigo-50/40' : 'hover:bg-slate-50'}`}>
              <div className="grid grid-cols-[2rem_1fr_1fr_1fr_5.5rem_8rem] gap-2 items-center px-4 py-3">
                <input type="checkbox" checked={selected.has(row.id)} onChange={() => toggleSel(row.id)}
                  className="rounded border-slate-300 accent-indigo-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{row.name}</p>
                  <p className="text-xs text-slate-400">{row.email}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{fmtDate(row.created_at)}</p>
                </div>
                <p className="text-sm text-slate-600 truncate">{row.company || '—'}</p>
                <p className="text-sm text-slate-500 truncate cursor-pointer" onClick={() => setExp(expanded === row.id ? null : row.id)}>
                  {row.message}
                </p>
                <StatusBadge status={row.status} />
                <div className="flex items-center gap-1">
                  <button onClick={() => setExp(expanded === row.id ? null : row.id)} title="Expand"
                    className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500">
                    {expanded === row.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                  <button onClick={() => patch(row.id, 'read')} disabled={busy === row.id + 'read' || row.status === 'read'}
                    title="Mark read" className="p-1.5 rounded-lg hover:bg-sky-100 text-sky-600 disabled:opacity-40">
                    <CheckCheck size={13} />
                  </button>
                  <a href={`mailto:${row.email}?subject=Re: Your message to Gigva Kenya`}
                    onClick={() => patch(row.id, 'replied')} title="Reply"
                    className="p-1.5 rounded-lg hover:bg-green-100 text-green-600">
                    <MessageSquareReply size={13} />
                  </a>
                  <button onClick={() => { if (confirm('Delete this message?')) del([row.id]) }} title="Delete"
                    className="p-1.5 rounded-lg hover:bg-red-100 text-red-500">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              {expanded === row.id && (
                <div className="px-4 pb-4 pt-1 bg-indigo-50/30 border-t border-indigo-100">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Full message</p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap bg-white border border-slate-200 rounded-lg px-4 py-3 mb-3">
                    {row.message}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => patch(row.id, 'read')}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-sky-600 text-white rounded-lg hover:bg-sky-700 font-medium">
                      <CheckCheck size={12} /> Mark read
                    </button>
                    <a href={`mailto:${row.email}?subject=Re: Your message to Gigva Kenya`}
                      onClick={() => patch(row.id, 'replied')}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                      <MessageSquareReply size={12} /> Reply via email
                    </a>
                    <button onClick={() => { if (confirm('Delete?')) del([row.id]) }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Demos / Trials tab ───────────────────────────────────────────────────────
function DemosTab({ token, source }) {
  const [rows, setRows]       = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSel]    = useState(new Set())
  const [search, setSearch]   = useState('')
  const [expanded, setExp]    = useState(null)
  const [busy, setBusy]       = useState(null)
  const [toast, setToast]     = useState('')

  const notify = m => { setToast(m); setTimeout(() => setToast(''), 3000) }
  const isDemo = source === 'demo'

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch(`/api/admin/demos${source === 'trial' ? '?source=trial' : ''}`, { headers: { Authorization: `Bearer ${token}` } })
      const d = await r.json()
      if (d.ok) setRows(d.demos)
    } finally { setLoading(false) }
  }, [token, source])

  useEffect(() => { load() }, [load])

  const filtered = rows.filter(r =>
    !search || [r.name, r.email, r.company, r.business_type, r.message]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()))
  )
  const toggleSel = id => setSel(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const selAll    = ()  => setSel(s => s.size === filtered.length ? new Set() : new Set(filtered.map(r => r.id)))

  async function patch(id, status) {
    setBusy(id + status)
    await fetch('/api/admin/demos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, status }),
    })
    setBusy(null); notify(`Status → ${status}`); load()
  }
  async function del(ids) {
    await fetch('/api/admin/demos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ids }),
    })
    setSel(new Set()); notify(`Deleted ${ids.length}`); load()
  }

  return (
    <div className="space-y-4">
      <Toast msg={toast} />
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="w-full pl-8 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder={`Search ${isDemo ? 'bookings' : 'trial requests'}…`}
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {selected.size > 0 && (
          <button onClick={() => { if (confirm(`Delete ${selected.size} record(s)?`)) del([...selected]) }}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 font-medium">
            <Trash2 size={14} /> Delete ({selected.size})
          </button>
        )}
        <button onClick={load} className="flex items-center gap-1.5 px-3 py-2 text-sm bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 font-medium">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-indigo-400" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={isDemo ? Calendar : Zap} label={`No ${isDemo ? 'demo bookings' : 'trial requests'} yet`} />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-[2rem_1fr_1fr_1fr_5.5rem_10rem] gap-2 items-center px-4 py-2.5
                          bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
            <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0}
              onChange={selAll} className="rounded border-slate-300 accent-indigo-600" />
            <span>Contact</span><span>Business</span><span>Description</span><span>Status</span><span>Actions</span>
          </div>

          {filtered.map(row => (
            <div key={row.id} className={`border-b border-slate-100 last:border-0 transition-colors
              ${expanded === row.id ? 'bg-indigo-50/40' : 'hover:bg-slate-50'}`}>
              <div className="grid grid-cols-[2rem_1fr_1fr_1fr_5.5rem_10rem] gap-2 items-center px-4 py-3">
                <input type="checkbox" checked={selected.has(row.id)} onChange={() => toggleSel(row.id)}
                  className="rounded border-slate-300 accent-indigo-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{row.name}</p>
                  <p className="text-xs text-slate-400">{row.email}</p>
                  {row.phone && <p className="text-xs text-slate-400">{row.phone}</p>}
                  <p className="text-[10px] text-slate-400 mt-0.5">{fmtDate(row.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-700">{row.company || '—'}</p>
                  <p className="text-xs text-slate-400">{row.business_type || '—'}</p>
                </div>
                <p className="text-sm text-slate-500 truncate cursor-pointer" onClick={() => setExp(expanded === row.id ? null : row.id)}>
                  {row.message || '—'}
                </p>
                <StatusBadge status={row.status} />
                <div className="flex items-center gap-1 flex-wrap">
                  <button onClick={() => setExp(expanded === row.id ? null : row.id)} title="Expand"
                    className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500">
                    {expanded === row.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                  {isDemo ? (<>
                    <button onClick={() => patch(row.id, 'confirmed')} disabled={busy === row.id + 'confirmed' || row.status === 'confirmed'}
                      title="Confirm" className="p-1.5 rounded-lg hover:bg-sky-100 text-sky-600 disabled:opacity-40"><CheckCircle2 size={13} /></button>
                    <button onClick={() => patch(row.id, 'completed')} disabled={busy === row.id + 'completed' || row.status === 'completed'}
                      title="Complete" className="p-1.5 rounded-lg hover:bg-green-100 text-green-600 disabled:opacity-40"><CheckCheck size={13} /></button>
                    <button onClick={() => patch(row.id, 'cancelled')} disabled={busy === row.id + 'cancelled' || row.status === 'cancelled'}
                      title="Cancel" className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-600 disabled:opacity-40"><XCircle size={13} /></button>
                  </>) : (<>
                    <button onClick={() => patch(row.id, 'approved')} disabled={busy === row.id + 'approved' || row.status === 'approved'}
                      title="Approve" className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-600 disabled:opacity-40"><CheckCircle2 size={13} /></button>
                    <button onClick={() => patch(row.id, 'rejected')} disabled={busy === row.id + 'rejected' || row.status === 'rejected'}
                      title="Reject" className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 disabled:opacity-40"><XCircle size={13} /></button>
                  </>)}
                  <a href={`mailto:${row.email}`} title="Email" className="p-1.5 rounded-lg hover:bg-indigo-100 text-indigo-600"><Mail size={13} /></a>
                  {row.phone && <a href={`tel:${row.phone}`} title="Call" className="p-1.5 rounded-lg hover:bg-green-100 text-green-600"><PhoneCall size={13} /></a>}
                  <button onClick={() => { if (confirm('Delete?')) del([row.id]) }} title="Delete" className="p-1.5 rounded-lg hover:bg-red-100 text-red-500"><Trash2 size={13} /></button>
                </div>
              </div>
              {expanded === row.id && (
                <div className="px-4 pb-4 pt-1 bg-indigo-50/30 border-t border-indigo-100">
                  {row.message && (
                    <div className="mb-3">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Description / Notes</p>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap bg-white border border-slate-200 rounded-lg px-4 py-3">
                        {row.message}
                      </p>
                    </div>
                  )}
                  {row.interests?.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {row.interests.map((i, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-sky-100 text-sky-700 text-xs rounded-full font-medium">{i}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {isDemo ? (<>
                      <button onClick={() => patch(row.id, 'confirmed')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-sky-600 text-white rounded-lg hover:bg-sky-700 font-medium"><CheckCircle2 size={12} /> Confirm Booking</button>
                      <button onClick={() => patch(row.id, 'completed')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"><CheckCheck size={12} /> Mark Completed</button>
                      <button onClick={() => patch(row.id, 'cancelled')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium"><XCircle size={12} /> Cancel</button>
                    </>) : (<>
                      <button onClick={() => patch(row.id, 'approved')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"><CheckCircle2 size={12} /> Approve Trial</button>
                      <button onClick={() => patch(row.id, 'rejected')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"><XCircle size={12} /> Reject</button>
                    </>)}
                    <a href={`mailto:${row.email}`} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"><Mail size={12} /> Email</a>
                    {row.phone && <a href={`tel:${row.phone}`} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"><PhoneCall size={12} /> Call</a>}
                    <button onClick={() => { if (confirm('Delete?')) del([row.id]) }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"><Trash2 size={12} /> Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── SMTP Status Panel (superadmin only) ─────────────────────────────────────
function SmtpPanel({ token }) {
  const [result, setResult]   = useState(null)
  const [checking, setChecking] = useState(false)

  async function check() {
    setChecking(true)
    try {
      const r = await fetch('/api/admin/smtp-check', { headers: { Authorization: `Bearer ${token}` } })
      const d = await r.json()
      setResult(d)
    } catch (e) {
      setResult({ ok: false, status: 'error', msg: e.message })
    } finally { setChecking(false) }
  }

  const statusColor = {
    connected:      'bg-green-50 border-green-200 text-green-800',
    failed:         'bg-red-50 border-red-200 text-red-800',
    not_configured: 'bg-amber-50 border-amber-200 text-amber-800',
    error:          'bg-red-50 border-red-200 text-red-800',
  }

  return (
    <div className="mt-6 border border-slate-200 rounded-xl overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-slate-700">Email (SMTP) Connection</p>
          <p className="text-xs text-slate-400">Verify your Google Workspace or Zoho Mail configuration</p>
        </div>
        <button onClick={check} disabled={checking}
          className="flex items-center gap-1.5 px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg
                     hover:bg-indigo-700 font-bold disabled:opacity-60 transition-colors">
          {checking ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          {checking ? 'Checking…' : 'Test Connection'}
        </button>
      </div>
      <div className="px-5 py-4">
        {!result ? (
          <p className="text-sm text-slate-400">Click "Test Connection" to verify your SMTP setup.</p>
        ) : (
          <div className={`border rounded-lg px-4 py-3 text-sm ${statusColor[result.status] || statusColor.error}`}>
            <p className="font-bold mb-1">
              {result.status === 'connected' ? '✅' : result.status === 'not_configured' ? '⚠️' : '❌'}&nbsp;
              {result.msg}
            </p>
            {result.provider && <p className="text-xs opacity-80">Provider: {result.provider} · User: {result.user} · From: {result.from}</p>}
            {result.status === 'not_configured' && (
              <p className="text-xs mt-2 opacity-80">
                Add <code className="bg-amber-100 px-1 rounded">SMTP_HOST</code>,&nbsp;
                <code className="bg-amber-100 px-1 rounded">SMTP_USER</code>, and&nbsp;
                <code className="bg-amber-100 px-1 rounded">SMTP_PASS</code> to your <code className="bg-amber-100 px-1 rounded">.env.local</code> file,
                then restart the server.
              </p>
            )}
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-500">
          <div className="bg-sky-50 border border-sky-100 rounded-lg p-3">
            <p className="font-bold text-sky-700 mb-1">Google Workspace</p>
            <p>Host: <code>smtp.gmail.com</code> · Port: <code>587</code></p>
            <p className="mt-1">Requires a 16-char <strong>App Password</strong> from Google Account → Security → App passwords.</p>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3">
            <p className="font-bold text-indigo-700 mb-1">Zoho Mail</p>
            <p>Host: <code>smtp.zoho.com</code> · Port: <code>587</code></p>
            <p className="mt-1">Requires an <strong>App Password</strong> from Zoho Mail Settings → Security → App Passwords.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── User Management tab (superadmin only) ─────────────────────────────────
const ROLE_OPTIONS = ['ceo','cto','customer_success','product','engineering','operations','finance','people_ops']

function UsersTab({ token }) {
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast]     = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm]       = useState({ name:'', email:'', role:'customer_success', company:'Gigva Kenya' })
  const [creating, setCreating] = useState(false)
  const [editId, setEditId]   = useState(null)
  const [editForm, setEditForm] = useState({})

  const notify = m => { setToast(m); setTimeout(() => setToast(''), 3000) }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } })
      const d = await r.json()
      if (d.ok) setUsers(d.users)
    } finally { setLoading(false) }
  }, [token])

  useEffect(() => { load() }, [load])

  async function createUser(e) {
    e.preventDefault()
    setCreating(true)
    const r = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    })
    const d = await r.json()
    setCreating(false)
    if (d.ok) {
      setShowCreate(false)
      setForm({ name:'', email:'', role:'customer_success', company:'Gigva Kenya' })
      notify('User created — welcome email sent')
      load()
    } else {
      notify(`Error: ${d.msg}`)
    }
  }

  async function resetPassword(id) {
    if (!confirm('Reset this user\'s password to blue1ocean?')) return
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, password: 'blue1ocean' }),
    })
    notify('Password reset to blue1ocean')
  }

  async function toggleStatus(user) {
    const newStatus = user.status === 'active' ? 'disabled' : 'active'
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: user.id, status: newStatus }),
    })
    notify(`User ${newStatus}`)
    load()
  }

  async function deleteUser(id) {
    if (!confirm('Permanently delete this user? This cannot be undone.')) return
    await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ids: [id] }),
    })
    notify('User deleted')
    load()
  }

  async function saveEdit(id) {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, ...editForm }),
    })
    setEditId(null)
    notify('User updated')
    load()
  }

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))
  const ef = k => e => setEditForm(p => ({ ...p, [k]: e.target.value }))

  const inputCls = 'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400'

  return (
    <div className="space-y-4">
      <Toast msg={toast} />

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{users.length} staff account{users.length !== 1 ? 's' : ''}</p>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-1.5 px-3 py-2 text-sm bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 font-medium">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => setShowCreate(v => !v)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold">
            <PlusCircle size={14} /> New Staff Account
          </button>
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
          <p className="text-sm font-bold text-indigo-800 mb-4">Create new staff account</p>
          <form onSubmit={createUser} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Full name</label>
              <input className={inputCls} placeholder="Jane Otieno" value={form.name} onChange={f('name')} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email address</label>
              <input className={inputCls} type="email" placeholder="jane.otieno@gigva.co.ke" value={form.email} onChange={f('email')} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Role</label>
              <select className={inputCls} value={form.role} onChange={f('role')}>
                {ROLE_OPTIONS.map(r => (
                  <option key={r} value={r}>{ROLES[r]?.label || r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Company</label>
              <input className={inputCls} placeholder="Gigva Kenya" value={form.company} onChange={f('company')} />
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-slate-500 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                ⚠️ Default password: <strong>blue1ocean</strong> — a welcome email with login details will be sent to the staff member.
              </p>
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={creating}
                className="flex items-center gap-1.5 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold disabled:opacity-60">
                {creating ? <Loader2 size={14} className="animate-spin" /> : <PlusCircle size={14} />} Create Account
              </button>
              <button type="button" onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 font-medium">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-indigo-400" /></div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-[1fr_1fr_1fr_5.5rem_9rem] gap-2 items-center px-4 py-2.5
                          bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
            <span>Name</span><span>Email</span><span>Role</span><span>Status</span><span>Actions</span>
          </div>

          {users.map(user => (
            <div key={user.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
              {editId === user.id ? (
                <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input className={inputCls} defaultValue={user.name} onChange={ef('name')} placeholder="Name" />
                  <select className={inputCls} defaultValue={user.role} onChange={ef('role')}>
                    {ROLE_OPTIONS.map(r => <option key={r} value={r}>{ROLES[r]?.label || r}</option>)}
                  </select>
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(user.id)}
                      className="flex-1 px-3 py-2 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold">Save</button>
                    <button onClick={() => setEditId(null)}
                      className="px-3 py-2 text-xs bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 font-medium">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-[1fr_1fr_1fr_5.5rem_9rem] gap-2 items-center px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                    <p className="text-[10px] text-slate-400">{fmtDate(user.created_at)}</p>
                  </div>
                  <p className="text-sm text-slate-600 truncate">{user.email}</p>
                  <div>
                    {user.is_admin
                      ? <span className="inline-block px-2 py-0.5 bg-indigo-600 text-white text-[11px] font-bold rounded-full">Super Admin</span>
                      : <RoleBadge role={user.role} />
                    }
                  </div>
                  <StatusBadge status={user.status} />
                  <div className="flex items-center gap-1">
                    {!user.is_admin && (<>
                      <button onClick={() => { setEditId(user.id); setEditForm({ name: user.name, role: user.role }) }}
                        title="Edit" className="p-1.5 rounded-lg hover:bg-indigo-100 text-indigo-600"><UserCog size={13} /></button>
                      <button onClick={() => toggleStatus(user)} title={user.status === 'active' ? 'Disable' : 'Enable'}
                        className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-600"><UserX size={13} /></button>
                      <button onClick={() => resetPassword(user.id)} title="Reset password"
                        className="p-1.5 rounded-lg hover:bg-sky-100 text-sky-600"><Key size={13} /></button>
                      <button onClick={() => deleteUser(user.id)} title="Delete"
                        className="p-1.5 rounded-lg hover:bg-red-100 text-red-500"><Trash2 size={13} /></button>
                    </>)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <SmtpPanel token={token} />
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className={`bg-white border rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm ${color}`}>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-current/10 flex-shrink-0">
        <Icon size={20} className="opacity-80" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs font-medium opacity-70 mt-0.5">{label}</p>
      </div>
    </div>
  )
}

// ── Inbox Tab ────────────────────────────────────────────────────────────────
function InboxTab({ token, user }) {
    const [messages, setMessages]   = useState([])
    const [selected, setSelected]   = useState(null)
    const [loading,  setLoading]    = useState(true)
    const [search,   setSearch]     = useState('')
    const [replying,     setReplying]     = useState(false)
    const [replyText,    setReplyText]    = useState('')
    const [replyStatus,  setReplyStatus]  = useState(null)

    const h = { Authorization: `Bearer ${token}` }

    const load = useCallback(() => {
          setLoading(true)
          fetch('/api/admin/inbox', { headers: h })
            .then(r => r.json())
            .then(d => { setMessages(d.messages || []); setLoading(false) })
            .catch(() => setLoading(false))
    }, [token])

    useEffect(() => { load() }, [load])

    function markRead(msg) {
          if (msg.is_read) return
          fetch('/api/admin/inbox', {
                  method: 'PATCH',
                  headers: { ...h, 'Content-Type': 'application/json' },
                  body: JSON.stringify({ id: msg.id, is_read: 1 }),
          }).then(() => {
                  setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: 1 } : m))
          })
    }

    function deleteMsg(id) {
          fetch('/api/admin/inbox', {
                  method: 'DELETE',
                  headers: { ...h, 'Content-Type': 'application/json' },
                  body: JSON.stringify({ id }),
          }).then(() => {
                  setMessages(prev => prev.filter(m => m.id !== id))
                  if (selected?.id === id) setSelected(null)
          })
    }

    async function sendReply(messageId, replyText) {
      if (!replyText.trim()) return
      setReplyStatus('sending')
      try {
        const res = await fetch('/api/admin/inbox/reply', {
          method: 'POST',
          headers: { ...h, 'Content-Type': 'application/json' },
          body: JSON.stringify({ messageId, replyText }),
        })
        const data = await res.json()
        if (data.ok) {
          setReplyStatus('sent')
          setReplyText('')
          setReplying(false)
          setMessages(prev => prev.map(m => m.id === messageId ? { ...m, replied: 1 } : m))
          if (selected?.id === messageId) setSelected(prev => ({ ...prev, replied: 1 }))
          setTimeout(() => setReplyStatus(null), 3000)
        } else {
          setReplyStatus('error: ' + (data.msg || 'Failed to send'))
        }
      } catch (err) {
        setReplyStatus('error: ' + err.message)
      }
    }

    function openMsg(msg) {
          setSelected(msg)
          markRead(msg)
    }

    const filtered = messages.filter(m => {
          if (!search) return true
          const q = search.toLowerCase()
          return m.subject?.toLowerCase().includes(q) ||
                       m.from_email?.toLowerCase().includes(q) ||
                       m.from_name?.toLowerCase().includes(q) ||
                       m.body_text?.toLowerCase().includes(q)
    })

    const unread = messages.filter(m => !m.is_read).length

    return (
          <div className="space-y-4">
    {/* Header */}
        <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-800">Inbox</h2>
  {unread > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white text-xs font-bold">
  {unread}
    </span>
             )}
            <span className="text-xs text-slate-400">({user?.email})</span>
  </div>
        <button onClick={load}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      <RefreshCw size={13} /> Refresh
            </button>
            </div>

{/* Search */}
      <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Search inbox..."
          className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
            </div>

{loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-indigo-400" />
  </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <MailOpen size={36} className="mb-3 opacity-40" />
            <p className="text-sm">{search ? 'No messages match your search.' : 'Your inbox is empty.'}</p>
          <p className="text-xs mt-1 text-slate-300">
              Emails sent to {user?.email} via the portal will appear here.
  </p>
  </div>
       ) : (
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
         {/* Message list */}
           <div className="lg:col-span-1 border border-slate-200 rounded-xl overflow-hidden">
           {filtered.map(msg => (
                           <button key={msg.id} onClick={() => openMsg(msg)}
                className={`w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors
                                  ${selected?.id === msg.id ? 'bg-indigo-50 border-l-2 border-l-indigo-500' : ''}
                                                    ${!msg.is_read ? 'bg-blue-50/40' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                      <p className={`text-sm truncate ${!msg.is_read ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
{msg.from_name || msg.from_email}
</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{msg.subject}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{msg.body_text?.substring(0, 60)}</p>
  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">{fmtDate(msg.created_at)}</span>
{!msg.is_read && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
  </div>
  </div>
  </button>
             ))}
</div>

{/* Message detail */}
          <div className="lg:col-span-2 border border-slate-200 rounded-xl">
          {selected ? (
                          <div className="p-5 space-y-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-slate-900">{selected.subject}</h3>
                                <p className="text-sm text-slate-500 mt-0.5">
                                  From: {selected.from_name ? `${selected.from_name} <${selected.from_email}>` : selected.from_email}
</p>
                    <p className="text-xs text-slate-400 mt-0.5">To: {selected.to_email} · {fmtDate(selected.created_at)}</p>
  </div>
                  <button onClick={() => setReplying(r => !r)}
                    className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-400 hover:text-indigo-600 transition-colors"
                    title="Reply to message">
                    <MessageSquareReply size={15} />
                  </button>
                  <button onClick={() => deleteMsg(selected.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                    title="Delete message">
                                          <Trash2 size={15} />
                      </button>
                      </div>
                <div className="border-t border-slate-100 pt-4">
                    {selected.body_html ? (
                                          <div className="prose prose-sm max-w-none text-slate-700"
                                            dangerouslySetInnerHTML={{ __html: selected.body_html }} />
                  ) : (
                                        <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans">{selected.body_text}</pre>
                  )}
</div>
                {/* Reply Form */}
                {replying && (
                  <div className="border-t border-indigo-100 pt-4 mt-4">
                    <p className="text-xs font-medium text-slate-500 mb-2">
                      Replying to: <span className="text-indigo-600">{selected.from_email}</span>
                    </p>
                    <textarea
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      rows={4}
                      placeholder="Type your reply..."
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <div>
                        {replyStatus && (
                          <span className={'text-xs ' + (replyStatus === 'sent' ? 'text-green-600' : replyStatus === 'sending' ? 'text-slate-400' : 'text-red-500')}>
                            {replyStatus === 'sent' ? 'Reply sent!' : replyStatus === 'sending' ? 'Sending...' : replyStatus}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setReplying(false); setReplyText(''); setReplyStatus(null) }}
                          className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                          Cancel
                        </button>
                        <button onClick={() => sendReply(selected.id, replyText)}
                          disabled={!replyText.trim() || replyStatus === 'sending'}
                          className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-1">
                          <MessageSquareReply size={12} /> Send Reply
                        </button>
                      </div>
                    </div>
                  </div>
                )}
  </div>
            ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                              <MailOpen size={32} className="mb-2 opacity-40" />
                              <p className="text-sm">Select a message to read</p>
              </div>
            )}
              </div>
              </div>
      )}
        </div>
  )
}

// ─── Webmail button ───────────────────────────────────────────────────────────
function WebmailButton({ email }) {
  const webmailUrl = process.env.NEXT_PUBLIC_WEBMAIL_URL || 'https://mail.google.com'
  return (
    <a
      href={webmailUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold
                 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
      title={`Open webmail for ${email}`}
    >
      <MailOpen size={14} />
      My Inbox
      <ExternalLink size={12} className="opacity-70" />
    </a>
  )
}

// ─── Main dashboard ───────────────────────────────────────────────────────────
const ALL_TABS = [
  { id: 'messages', label: 'Messages',           icon: Mail     },
  { id: 'demos',    label: 'Demo Bookings',       icon: Calendar },
  { id: 'trials',   label: 'Free Trial Requests', icon: Zap      },
  { id: 'users',    label: 'User Management',     icon: Users    },
  { id: 'inbox',   label: 'Inbox',            icon: MailOpen },
]

export default function AdminDashboard() {
  const router = useRouter()
  const [token, setToken]         = useState(null)
  const [user, setUser]           = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [tab, setTab]             = useState(null)
  const [counts, setCounts]       = useState({ messages: 0, demos: 0, trials: 0, users: 0, inbox: 0  })

  // ── Auth check ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('gigva_token') : null
    if (!t) { router.replace('/admin/login'); return }
    try {
      const payload = JSON.parse(atob(t.split('.')[1]))
      const hasAccess = payload.is_admin || payload.role
      if (!hasAccess || payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('gigva_token')
        router.replace('/admin/login')
        return
      }
      setToken(t)
      setUser(payload)
      // Set default tab to first allowed tab for this role
      const role    = payload.is_admin ? 'superadmin' : payload.role
      const roleConfig = ROLES[role] || ROLES['people_ops']
      setTab(roleConfig.tabs[0])
    } catch {
      router.replace('/admin/login')
    } finally {
      setAuthLoading(false)
    }
  }, [router])

  // ── Load counts ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return
    const h = { Authorization: `Bearer ${token}` }
    Promise.all([
      fetch('/api/admin/contacts',           { headers: h }).then(r => r.json()),
      fetch('/api/admin/demos',              { headers: h }).then(r => r.json()),
      fetch('/api/admin/demos',              { headers: h }).then(r => r.json()),
      user?.is_admin
        ? fetch('/api/admin/users', { headers: h }).then(r => r.json())
        : Promise.resolve({ users: [] }),
            fetch('/api/admin/inbox',         { headers: h }).then(r => r.json()),
    ]).then(([c, d, tr, u, ix]) => {
      setCounts({
        messages: c.contacts?.length  ?? 0,
        demos:    d.demos?.filter(x => x.source !== 'trial').length ?? 0,
        trials:   tr.demos?.filter(x => x.source === 'trial').length ?? 0,
        users:    u.users?.length      ?? 0,
                  inbox:   ix.unread         ?? 0,
      })
    }).catch(() => {})
  }, [token, user])

  function handleLogout() {
    localStorage.removeItem('gigva_token')
    router.push('/admin/login')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 size={36} className="animate-spin text-indigo-400" />
      </div>
    )
  }
  if (!token || !user) return null

  const roleKey    = user.is_admin ? 'superadmin' : (user.role || 'people_ops')
  const roleConfig = ROLES[roleKey] || ROLES['people_ops']
  const allowedTabs = ALL_TABS.filter(t => roleConfig.tabs.includes(t.id))

  const countFor = id => ({
    messages: counts.messages,
    demos:    counts.demos,
    trials:   counts.trials,
    users:    counts.users,
            inbox:   counts.inbox,
  })[id] ?? 0

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Top bar */}
      <div className={`${roleConfig.headerColor} px-5 py-3 flex items-center justify-between sticky top-16 z-40`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <ShieldCheck size={16} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-white">{user.name || 'Staff'}</p>
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white`}>
                {roleConfig.label}
              </span>
            </div>
            <p className="text-xs text-white/70">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
                    <button onClick={() => setTab('inbox')}
                                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                                                    <MailOpen size={14} /> My Inbox
                                    </button>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-medium">
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Role description + stats */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mb-0.5">Your workspace</p>
            <p className="text-sm text-slate-600">{roleConfig.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard icon={Mail}     label="Messages"           value={counts.messages} color="text-indigo-600 border-indigo-100" />
            <StatCard icon={Calendar} label="Demo Bookings"       value={counts.demos}    color="text-sky-600 border-sky-100" />
            <StatCard icon={Zap}      label="Trial Requests"      value={counts.trials}   color="text-emerald-600 border-emerald-100" />
                        <StatCard icon={MailOpen}  label="Inbox (Unread)"  value={counts.inbox}  color="text-violet-600 border-violet-100" />
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-200 overflow-x-auto">
            {allowedTabs.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap
                            border-b-2 transition-colors duration-150 flex-1 justify-center
                            ${tab === id
                              ? roleConfig.tabActiveClass
                              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                <Icon size={15} />
                {label}
                <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold
                  ${tab === id ? roleConfig.badge : 'bg-slate-200 text-slate-500'}`}>
                  {countFor(id)}
                </span>
              </button>
            ))}
          </div>

          <div className="p-4 sm:p-6">
            {tab === 'messages' && <MessagesTab token={token} />}
            {tab === 'demos'    && <DemosTab   token={token} source="demo"  />}
            {tab === 'trials'   && <DemosTab   token={token} source="trial" />}
            {tab === 'users'    && user.is_admin && <UsersTab token={token} />}
             {tab === 'inbox'   && <InboxTab token={token} user={user} />}
            {tab === 'users'    && !user.is_admin && (
              <div className="flex items-center gap-3 text-slate-500 py-8">
                <AlertCircle size={20} /> <p>User management requires superadmin access.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
