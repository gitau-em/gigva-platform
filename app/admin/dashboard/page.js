'use client'
// Build: v3-payroll
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Mail, Calendar, Zap, LogOut, RefreshCw, Trash2, CheckCheck, Send, Paperclip,
  MessageSquareReply, CheckCircle2, XCircle, PhoneCall,
  Loader2, ChevronDown, ChevronUp, Search, Users,
  ShieldCheck, ExternalLink, PlusCircle, UserX, Key,
  AlertCircle, Building2, UserCog, MailOpen, X, PenSquare,
  DollarSign, FileText, Download, Printer, ChevronLeft, UserPlus, Edit3, Eye
} from 'lucide-react'
import { ROLES } from '@/lib/roleConfig'

// ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ helpers ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ
function fmtDate(iso) {
  if (!iso) return 'ÃÂ¢ÃÂÃÂ'
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

// ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ Messages tab ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ
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
    !search || [r.name, r.email, r.company, r.message]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()))
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
            placeholder="Search messages..." value={search} onChange={e => setSearch(e.target.value)} />
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
                <p className="text-sm text-slate-600 truncate">{row.company || 'ÃÂ¢ÃÂÃÂ'}</p>
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

// ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ Demos / Trials tab ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ
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
    (source === 'trial' ? r.source === 'trial' : r.source !== 'trial') &&
    (!search || [r.name, r.email, r.company, r.business_type, r.message]
      .some(v => v?.toLowerCase().includes(search.toLowerCase())))
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
    setBusy(null); notify(`Status ÃÂ¢ÃÂÃÂ ${status}`); load()
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
            placeholder={`Search ${isDemo ? 'bookings' : 'trial requests'}...`}
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
                  <p className="text-sm text-slate-700">{row.company || 'ÃÂ¢ÃÂÃÂ'}</p>
                  <p className="text-xs text-slate-400">{row.business_type || 'ÃÂ¢ÃÂÃÂ'}</p>
                </div>
                <p className="text-sm text-slate-500 truncate cursor-pointer" onClick={() => setExp(expanded === row.id ? null : row.id)}>
                  {row.message || 'ÃÂ¢ÃÂÃÂ'}
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

// ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ SMTP Status Panel (superadmin only) ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ
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
          {checking ? 'Checking...' : 'Test Connection'}
        </button>
      </div>
      <div className="px-5 py-4">
        {!result ? (
          <p className="text-sm text-slate-400">Click "Test Connection" to verify your SMTP setup.</p>
        ) : (
          <div className={`border rounded-lg px-4 py-3 text-sm ${statusColor[result.status] || statusColor.error}`}>
            <p className="font-bold mb-1">
              {result.status === 'connected' ? 'ÃÂ¢ÃÂÃÂ' : result.status === 'not_configured' ? 'ÃÂ¢ÃÂÃÂ ÃÂ¯ÃÂ¸ÃÂ' : 'ÃÂ¢ÃÂÃÂ'}&nbsp;
              {result.msg}
            </p>
            {result.provider && <p className="text-xs opacity-80">Provider: {result.provider} ÃÂÃÂ· User: {result.user} ÃÂÃÂ· From: {result.from}</p>}
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
            <p>Host: <code>smtp.gmail.com</code> ÃÂÃÂ· Port: <code>587</code></p>
            <p className="mt-1">Requires a 16-char <strong>App Password</strong> from Google Account ÃÂ¢ÃÂÃÂ Security ÃÂ¢ÃÂÃÂ App passwords.</p>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3">
            <p className="font-bold text-indigo-700 mb-1">Zoho Mail</p>
            <p>Host: <code>smtp.zoho.com</code> ÃÂÃÂ· Port: <code>587</code></p>
            <p className="mt-1">Requires an <strong>App Password</strong> from Zoho Mail Settings ÃÂ¢ÃÂÃÂ Security ÃÂ¢ÃÂÃÂ App Passwords.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ User Management tab (superadmin only) ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ
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
      notify('User created ÃÂ¢ÃÂÃÂ welcome email sent')
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
                ÃÂ¢ÃÂÃÂ ÃÂ¯ÃÂ¸ÃÂ Default password: <strong>blue1ocean</strong> ÃÂ¢ÃÂÃÂ a welcome email with login details will be sent to the staff member.
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

// ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ Stat card ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ
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

// ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ Inbox Tab ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ
// Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ Sent Tab Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ

// ─── ComposeModal ─────────────────────────────────────────────────────────────
function ComposeModal({ token, user, onClose, onSent }) {
  const [to,        setTo]        = useState('')
  const [cc,        setCc]        = useState('')
  const [bcc,       setBcc]       = useState('')
  const [subject,   setSubject]   = useState('')
  const [bodyText,  setBodyText]  = useState('')
  const [files,     setFiles]     = useState([])
  const [status,    setStatus]    = useState(null) // null | 'sending' | 'sent' | string(error)
  const [showCcBcc, setShowCcBcc] = useState(false)
  const MAX_MB = 25

  function handleFiles(e) {
    const chosen = Array.from(e.target.files || [])
    const total = [...files, ...chosen].reduce((sum, f) => sum + f.size, 0)
    if (total > MAX_MB * 1024 * 1024) {
      setStatus('Total attachments exceed ' + MAX_MB + ' MB limit')
      return
    }
    setFiles(prev => [...prev, ...chosen])
  }

  function removeFile(idx) {
    setFiles(prev => prev.filter((_, i) => i !== idx))
  }

  function formatSize(bytes) {
    if (bytes < 1024)       return bytes + ' B'
    if (bytes < 1048576)    return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1048576).toFixed(1) + ' MB'
  }

  async function handleSend() {
    if (!to.trim())       { setStatus('Recipient (To) is required'); return }
    if (!subject.trim())  { setStatus('Subject is required'); return }
    if (!bodyText.trim()) { setStatus('Message body is required'); return }
    setStatus('sending')
    try {
      let body, headers = { Authorization: `Bearer ${token}` }
      if (files.length > 0) {
        const fd = new FormData()
        fd.append('to', to)
        fd.append('cc', cc)
        fd.append('bcc', bcc)
        fd.append('subject', subject)
        fd.append('bodyText', bodyText)
        files.forEach(f => fd.append('attachments', f))
        body = fd
      } else {
        headers['Content-Type'] = 'application/json'
        body = JSON.stringify({ to, cc, bcc, subject, bodyText })
      }
      const res  = await fetch('/api/admin/inbox/compose', { method: 'POST', headers, body })
      const data = await res.json()
      if (data.ok) {
        setStatus('sent')
        if (onSent) onSent()
        setTimeout(() => onClose(), 1500)
      } else {
        setStatus(data.msg || 'Failed to send')
      }
    } catch (err) {
      setStatus(err.message || 'Network error')
    }
  }

  const totalSize = files.reduce((s, f) => s + f.size, 0)
  const overLimit = totalSize > MAX_MB * 1024 * 1024

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <PenSquare size={18} className="text-blue-600" />
            <span className="font-semibold text-slate-800">New Email</span>
            <span className="text-xs text-slate-400">from {user.email}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Fields */}
        <div className="flex flex-col divide-y divide-slate-100 overflow-y-auto flex-1">
          {/* To */}
          <div className="flex items-center px-5 py-2.5 gap-3">
            <span className="text-xs font-medium text-slate-500 w-10 flex-shrink-0">To</span>
            <input
              className="flex-1 text-sm text-slate-800 placeholder-slate-400 outline-none"
              placeholder="Recipients (comma-separated)"
              value={to} onChange={e => setTo(e.target.value)}
            />
            <button onClick={() => setShowCcBcc(v => !v)} className="text-xs text-blue-500 hover:text-blue-700 flex-shrink-0">
              {showCcBcc ? 'Hide' : 'Cc/Bcc'}
            </button>
          </div>

          {/* CC / BCC */}
          {showCcBcc && (
            <>
              <div className="flex items-center px-5 py-2.5 gap-3">
                <span className="text-xs font-medium text-slate-500 w-10 flex-shrink-0">Cc</span>
                <input
                  className="flex-1 text-sm text-slate-800 placeholder-slate-400 outline-none"
                  placeholder="Cc recipients (comma-separated)"
                  value={cc} onChange={e => setCc(e.target.value)}
                />
              </div>
              <div className="flex items-center px-5 py-2.5 gap-3">
                <span className="text-xs font-medium text-slate-500 w-10 flex-shrink-0">Bcc</span>
                <input
                  className="flex-1 text-sm text-slate-800 placeholder-slate-400 outline-none"
                  placeholder="Bcc recipients (comma-separated)"
                  value={bcc} onChange={e => setBcc(e.target.value)}
                />
              </div>
            </>
          )}

          {/* Subject */}
          <div className="flex items-center px-5 py-2.5 gap-3">
            <span className="text-xs font-medium text-slate-500 w-10 flex-shrink-0">Sub</span>
            <input
              className="flex-1 text-sm text-slate-800 placeholder-slate-400 outline-none font-medium"
              placeholder="Subject"
              value={subject} onChange={e => setSubject(e.target.value)}
            />
          </div>

          {/* Body */}
          <div className="px-5 py-3 flex-1 min-h-[200px]">
            <textarea
              className="w-full h-full min-h-[200px] text-sm text-slate-800 placeholder-slate-400 outline-none resize-none"
              placeholder="Write your message here..."
              value={bodyText} onChange={e => setBodyText(e.target.value)}
            />
          </div>

          {/* Attachments list */}
          {files.length > 0 && (
            <div className="px-5 py-3 bg-slate-50">
              <p className="text-xs font-medium text-slate-500 mb-2">
                Attachments · {formatSize(totalSize)} / {MAX_MB} MB
              </p>
              <div className="flex flex-wrap gap-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700">
                    <Paperclip size={11} className="text-slate-400" />
                    <span className="max-w-[140px] truncate">{f.name}</span>
                    <span className="text-slate-400">({formatSize(f.size)})</span>
                    <button onClick={() => removeFile(i)} className="text-slate-400 hover:text-red-500 ml-1">
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
              {overLimit && <p className="text-xs text-red-500 mt-1">Total size exceeds {MAX_MB} MB limit</p>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-white rounded-b-2xl">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-500 hover:text-blue-600 transition-colors">
            <Paperclip size={16} />
            <span className="text-xs font-medium">Attach file</span>
            <input type="file" multiple className="hidden" onChange={handleFiles} />
          </label>

          <div className="flex items-center gap-3">
            {status && status !== 'sending' && status !== 'sent' && (
              <p className="text-xs text-red-500 max-w-[200px] truncate">{status}</p>
            )}
            {status === 'sent' && <p className="text-xs text-green-600 font-medium">Sent!</p>}
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Discard
            </button>
            <button
              onClick={handleSend}
              disabled={status === 'sending' || overLimit}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {status === 'sending' ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {status === 'sending' ? 'Sending…' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SentTab({ token, user }) {
  const [emails, setEmails]   = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [search, setSearch]   = useState('')
  const [checkedSent, setCheckedSent] = useState(new Set())
  const [composing,   setComposing]   = useState(false)

  const h = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    if (!token) return
    fetch('/api/admin/sent', { headers: h })
      .then(r => r.json())
      .then(d => { setEmails(d.emails || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [token])

  const filtered = emails.filter(e => {
    if (!search) return true
    const q = search.toLowerCase()
    return e.subject?.toLowerCase().includes(q) ||
           e.to_email?.toLowerCase().includes(q) ||
           e.from_email?.toLowerCase().includes(q) ||
           e.body_text?.toLowerCase().includes(q)
  })

  if (loading) return (
    <div className="flex justify-center items-center h-40">
      <Loader2 className="animate-spin text-slate-400" size={24} />
    </div>
  )

  return (
    <>
    {composing && (
      <ComposeModal
        token={token}
        user={user}
        onClose={() => setComposing(false)}
        onSent={() => {
          fetch('/api/admin/sent', { headers: h })
            .then(r => r.json())
            .then(d => setEmails(d.emails || []))
        }}
      />
    )}
    <div className="flex h-[calc(100vh-160px)]">
      {/* List panel */}
      <div className="w-72 border-r border-slate-200 bg-white flex flex-col flex-shrink-0">
        <div className="p-3 border-b border-slate-100">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5">
            <Search size={13} className="text-slate-400 flex-shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search sent..." className="text-sm bg-transparent outline-none w-full placeholder-slate-400" />
          </div>
          <button
            onClick={() => setComposing(true)}
            className="mt-2 flex items-center justify-center gap-1.5 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg py-1.5 transition-colors"
          >
            <PenSquare size={13} /> Compose
          </button>
        </div>
        {checkedSent.size > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border-b border-red-200">
            <span className="text-xs text-red-700 font-medium">{checkedSent.size} selected</span>
            <button onClick={() => { checkedSent.forEach(id => { fetch('/api/admin/sent', { method: 'DELETE', headers: { ...h, 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }).then(() => setEmails(prev => prev.filter(e => e.id !== id))) }); setCheckedSent(new Set()); if (checkedSent.has(selected?.id)) setSelected(null) }}
              className="ml-auto flex items-center gap-1 text-xs bg-red-500 text-white px-2.5 py-1 rounded-lg hover:bg-red-600">
              <Trash2 size={12} /> Delete selected
            </button>
          </div>
        )}
        {filtered.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 bg-slate-50">
            <input type="checkbox" className="w-3.5 h-3.5 accent-indigo-600 cursor-pointer"
              checked={checkedSent.size === filtered.length && filtered.length > 0}
              onChange={ev => setCheckedSent(ev.target.checked ? new Set(filtered.map(x => x.id)) : new Set())} />
            <span className="text-[10px] text-slate-400">Select all</span>
          </div>
        )}
        <div className="overflow-y-auto flex-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-sm">No sent emails yet</div>
          ) : filtered.map(e => (
            <div key={e.id} className={`flex items-start border-b border-slate-100 hover:bg-slate-50 transition-colors ${checkedSent.has(e.id) ? 'bg-indigo-50/60' : ''}`}>
              <div className="flex items-center pl-3 pt-3 pb-2.5">
                <input type="checkbox" className="w-3.5 h-3.5 accent-indigo-600 cursor-pointer flex-shrink-0"
                  checked={checkedSent.has(e.id)}
                  onChange={ev => { ev.stopPropagation(); setCheckedSent(prev => { const n = new Set(prev); n.has(e.id) ? n.delete(e.id) : n.add(e.id); return n }) }} />
              </div>
              <button className={`flex-1 text-left px-3 py-2.5 ${selected?.id === e.id ? 'bg-indigo-50' : ''}`} onClick={() => setSelected(e)}>
                <div className="flex items-start justify-between gap-1">
                  <span className="font-medium text-slate-700 text-xs truncate">{e.to_email}</span>
                  <span className="text-[10px] text-slate-400 flex-shrink-0">{e.sent_at ? new Date(e.sent_at).toLocaleDateString('en-KE', { month: 'short', day: '2-digit' }) : ''}</span>
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">{e.subject}</p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{e.body_text?.substring(0, 60)}</p>
              </button>
            </div>
          ))}
        </div>
      </div>
      {/* Detail panel */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        {!selected ? (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">
            <div className="text-center">
              <Send size={32} className="mx-auto mb-2 opacity-40" />
              <p>Select a sent email to view</p>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <h2 className="text-base font-bold text-slate-800 mb-3">{selected.subject}</h2>
            <div className="flex gap-4 text-xs text-slate-500 mb-4 flex-wrap">
              <span><span className="font-medium text-slate-600">From:</span> {selected.from_email}</span>
              <span><span className="font-medium text-slate-600">To:</span> {selected.to_email}</span>
              <span><span className="font-medium text-slate-600">Sent:</span> {selected.sent_at ? new Date(selected.sent_at).toLocaleString('en-KE') : 'Ã¢ÂÂ'}</span>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {selected.body_text || selected.body_html?.replace(/<[^>]+>/g, '') || '(no content)'}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  )
}

function InboxTab({ token, user }) {
    const [messages, setMessages]   = useState([])
    const [selected, setSelected]   = useState(null)
    const [loading,  setLoading]    = useState(true)
    const [attachments, setAttachments] = useState([])
    const [search,   setSearch]     = useState('')
    const [replying,     setReplying]     = useState(false)
    const [replyText,    setReplyText]    = useState('')
    const [replyStatus,  setReplyStatus]  = useState(null)
    const [expandedSender, setExpandedSender] = useState(null)
    const [checkedInbox, setCheckedInbox] = useState(new Set())
    const [composing,    setComposing]    = useState(false)

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

    async function sendReply(messageId, replyText, attachedFiles) {
      if (!replyText.trim()) return
      setReplyStatus('sending')
      try {
        let body, headers = { ...h }
        if (attachedFiles && attachedFiles.length > 0) {
          const fd = new FormData()
          fd.append('messageId', messageId)
          fd.append('replyText', replyText)
          attachedFiles.forEach(f => fd.append('attachments', f))
          body = fd
        } else {
          headers['Content-Type'] = 'application/json'
          body = JSON.stringify({ messageId, replyText })
        }
        const res = await fetch('/api/admin/inbox/reply', {
          method: 'POST',
          headers,
          body,
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

    // Group filtered messages by sender (from_email) for conversation threading
    const threads = Object.values(
      filtered.reduce((acc, m) => {
        const key = (m.from_email || 'unknown').toLowerCase()
        if (!acc[key]) acc[key] = { key, name: m.from_name || m.from_email, email: m.from_email, msgs: [] }
        acc[key].msgs.push(m)
        return acc
      }, {})
    ).sort((a, b) => {
      // Sort threads by most recent message
      const aLast = a.msgs[0]?.created_at || ''
      const bLast = b.msgs[0]?.created_at || ''
      return bLast.localeCompare(aLast)
    })

    const unread = messages.filter(m => !m.is_read).length

    return (
    <>
    {composing && (
      <ComposeModal
        token={token}
        user={user}
        onClose={() => setComposing(false)}
        onSent={() => load()}
      />
    )}
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

{/* Search + Compose */}
      <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Search inbox..."
          className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
            </div>
            <button
              onClick={() => setComposing(true)}
              className="mt-2 flex items-center justify-center gap-1.5 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg py-1.5 transition-colors"
            >
              <PenSquare size={13} /> Compose
            </button>

{loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-indigo-400" />
  </div>
        ) : threads.length === 0 ? (
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
           {/* Inbox bulk action bar */}
           {checkedInbox.size > 0 && (
             <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border-b border-red-200">
               <span className="text-xs text-red-700 font-medium">{checkedInbox.size} selected</span>
               <div className="ml-auto flex items-center gap-2">
                 <button onClick={() => { const firstId = [...checkedInbox][0]; const msg = messages.find(m => m.id === firstId); if (msg) { setSelected(msg); setReplying(true) } setCheckedInbox(new Set()) }}
                   className="flex items-center gap-1 text-xs bg-indigo-600 text-white px-2.5 py-1 rounded-lg hover:bg-indigo-700">
                   <MessageSquareReply size={12} /> Reply
                 </button>
                 <button onClick={() => { checkedInbox.forEach(id => { fetch('/api/admin/inbox', { method: 'DELETE', headers: { ...h, 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }).then(() => { setMessages(prev => prev.filter(m => m.id !== id)); if (selected?.id === id) setSelected(null) }) }); setCheckedInbox(new Set()) }}
                   className="flex items-center gap-1 text-xs bg-red-500 text-white px-2.5 py-1 rounded-lg hover:bg-red-600">
                   <Trash2 size={12} /> Delete selected
                 </button>
               </div>
             </div>
           )}
           {threads.length > 0 && (
             <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 bg-slate-50">
               <input type="checkbox" className="w-3.5 h-3.5 accent-indigo-600 cursor-pointer"
                 checked={checkedInbox.size === messages.length && messages.length > 0}
                 onChange={ev => setCheckedInbox(ev.target.checked ? new Set(messages.map(m => m.id)) : new Set())} />
               <span className="text-[10px] text-slate-400">Select all</span>
             </div>
           )}
           {threads.map(thread => {
              const hasUnread = thread.msgs.some(m => !m.is_read)
              const isExpanded = expandedSender === thread.key
              const latestMsg = thread.msgs[0]
              const count = thread.msgs.length
              const threadChecked = thread.msgs.some(m => checkedInbox.has(m.id))
              return (
                <div key={thread.key}>
                  <div className={`flex items-center ${checkedInbox.size > 0 || threadChecked ? '' : ''}`}>
                  <div className="flex items-center pl-3 flex-shrink-0">
                    <input type="checkbox" className="w-3.5 h-3.5 accent-indigo-600 cursor-pointer"
                      checked={threadChecked}
                      onChange={ev => { ev.stopPropagation(); setCheckedInbox(prev => { const n = new Set(prev); thread.msgs.forEach(m => ev.target.checked ? n.add(m.id) : n.delete(m.id)); return n }) }} />
                  </div>
                  <button
                    onClick={() => setExpandedSender(isExpanded ? null : thread.key)}
                    className={`flex-1 text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors ${hasUnread ? 'bg-blue-50/40' : ''} ${isExpanded ? 'bg-indigo-50 border-l-2 border-l-indigo-400' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm truncate ${hasUnread ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                            {thread.name}
                          </p>
                          {count > 1 && (
                            <span className="text-xs bg-slate-200 text-slate-600 rounded-full px-1.5 py-0.5 font-medium">{count}</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{latestMsg?.subject}</p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{latestMsg?.body_text?.substring(0, 60)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <p className="text-xs text-slate-400">{latestMsg?.created_at ? new Date(latestMsg.created_at).toLocaleDateString() : ''}</p>
                        {hasUnread && <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />}
                      </div>
                    </div>
                  </button>
                  </div>
                  {/* Expanded: show all messages in thread */}
                  {isExpanded && (
                    <div className="bg-slate-50 border-l-2 border-l-indigo-300">
                      {[...thread.msgs].reverse().map(msg => (
                        <button
                          key={msg.id}
                          onClick={() => openMsg(msg)}
                          className={`w-full text-left px-6 py-2.5 border-b border-slate-100 hover:bg-white transition-colors ${selected?.id === msg.id ? 'bg-indigo-50' : ''} ${!msg.is_read ? 'bg-blue-50/30' : ''}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className={`text-xs truncate ${!msg.is_read ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>{msg.subject}</p>
                              <p className="text-xs text-slate-400 truncate">{msg.body_text?.substring(0, 50)}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <p className="text-xs text-slate-400">{msg.created_at ? new Date(msg.created_at).toLocaleDateString() : ''}</p>
                              {msg.replied && <span className="text-xs text-green-600">ÃÂ¢ÃÂÃÂ replied</span>}
                              {!msg.is_read && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
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
                    <p className="text-xs text-slate-400 mt-0.5">To: {selected.to_email} ÃÂÃÂ· {fmtDate(selected.created_at)}</p>
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
                <div className="border-t border-slate-100 pt-4 space-y-4">
                    {/* Email body */}
                    {selected.body_html ? (
                      <div className="prose prose-sm max-w-none text-slate-700"
                        dangerouslySetInnerHTML={{ __html: selected.body_html }} />
                    ) : selected.body_text ? (
                      <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans">{selected.body_text}</pre>
                    ) : (
                      <p className="text-sm text-slate-400 italic">Email body not available ÃÂ¢ÃÂÃÂ message subject: {selected.subject}</p>
                    )}
                    {/* Staff reply (if any) */}
                    {selected.reply_text && (
                      <div className="mt-4 border-t border-slate-100 pt-3">
                        <p className="text-xs font-semibold text-indigo-600 mb-1">Your reply:</p>
                        <pre className="whitespace-pre-wrap text-sm text-slate-600 font-sans bg-indigo-50 rounded-lg p-3">{selected.reply_text}</pre>
                      </div>
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
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <label className="flex items-center gap-1 cursor-pointer text-xs text-slate-500 hover:text-indigo-600 px-2 py-1 border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors">
                        <Paperclip size={13} />
                        <span>Attach files</span>
                        <input type="file" multiple className="hidden" onChange={e => setAttachments(Array.from(e.target.files))} />
                      </label>
                      {attachments.map((f, i) => (
                        <span key={i} className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                          {f.name}
                          <button onClick={() => setAttachments(p => p.filter((_, j) => j !== i))} className="hover:text-red-500 font-bold">ÃÂ</button>
                        </span>
                      ))}
                    </div>
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
                        <button onClick={() => { sendReply(selected.id, replyText, attachments); setAttachments([]) }}
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
    </>
  )
}

// ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ Webmail button ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ
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

// ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ Main dashboard ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ
const ALL_TABS = [
  { id: 'messages', label: 'Messages',           icon: Mail     },
  { id: 'demos',    label: 'Demo Bookings',       icon: Calendar },
  { id: 'trials',   label: 'Free Trial Requests', icon: Zap      },
  { id: 'users',    label: 'User Management',     icon: Users    },
  { id: 'inbox',   label: 'Inbox',            icon: MailOpen },
  { id: 'sent', label: 'Sent', icon: Send },
  { id: 'payroll', label: 'Payroll', icon: DollarSign },
]


// ═══════════════════════════════════════════════════════════════
// PAYROLL SYSTEM
// ═══════════════════════════════════════════════════════════════

const MONTHS = ['January','February','March','April','May','June',
  'July','August','September','October','November','December']

function fmtKsh(n) {
  return Number(n || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Kenyan PAYE tax calculation
function calcPAYE(taxable) {
  let tax = 0
  if (taxable <= 24000) tax = taxable * 0.10
  else if (taxable <= 32333) tax = 2400 + (taxable - 24000) * 0.25
  else if (taxable <= 500000) tax = 2400 + 2083.25 + (taxable - 32333) * 0.30
  else if (taxable <= 800000) tax = 2400 + 2083.25 + 140300.1 + (taxable - 500000) * 0.325
  else tax = 2400 + 2083.25 + 140300.1 + 97500 + (taxable - 800000) * 0.35
  return Math.max(0, tax)
}

function calcNHIF(gross) {
  if (gross < 5999) return 150; if (gross < 7999) return 300; if (gross < 11999) return 400
  if (gross < 14999) return 500; if (gross < 19999) return 600; if (gross < 24999) return 750
  if (gross < 29999) return 850; if (gross < 34999) return 900; if (gross < 39999) return 950
  if (gross < 44999) return 1000; if (gross < 49999) return 1100; if (gross < 59999) return 1200
  if (gross < 69999) return 1300; if (gross < 79999) return 1400; if (gross < 89999) return 1500
  if (gross < 99999) return 1600; return 1700
}

function calcPayroll(basic, house, car, other, pension=0, mortgageInterest=0) {
  const grossPay = basic + house + car + other
  const nssf = Math.min(grossPay * 0.06, 1080)
  const grossTaxable = grossPay + house
  const netTaxable = grossTaxable - nssf - pension - mortgageInterest
  const payeGross = calcPAYE(netTaxable)
  const personalRelief = 2400
  const netTax = Math.max(0, payeGross - personalRelief)
  const nhif = calcNHIF(grossPay)
  const netPay = grossPay - nssf - netTax - nhif
  return { grossPay, nssf, grossTaxable, netTaxable, paye: payeGross, personalRelief, netTax, nhif, netPay }
}

function PayslipDocument({ slip, emp }) {
  if (!slip || !emp) return null
  const items = [
    { code: 'BASIC_PAY', name: 'Basic Pay', amount: slip.basic_pay },
    { code: 'GROSS_PAY', name: 'Gross Pay', amount: slip.gross_pay },
    { code: 'CAR', name: 'Car Benefit', amount: slip.car_benefit },
    { code: 'HOUSE', name: 'Housing Allowance', amount: slip.house_allowance },
    { code: 'GROSS_TAXABLE', name: 'Gross Taxable Pay', amount: slip.gross_taxable },
    { code: 'NSSF', name: 'National Social Security Fund', amount: slip.nssf },
    { code: 'PENS_PROV', name: 'Pension/Provident Fund Scheme', amount: slip.pension_provident },
    { code: 'HOSP_MI', name: 'Home Ownership/Mortgage Interest', amount: slip.hosp_mortgage_interest },
    { code: 'NET_TAXABLE', name: 'Net Taxable Pay', amount: slip.net_taxable },
    { code: 'PAYE', name: 'Pay As You Earn', amount: slip.paye },
    { code: 'PER_RELIEF', name: 'Personal Tax Relief', amount: slip.personal_relief },
    { code: 'NET_TAX', name: 'Net Tax', amount: slip.net_tax },
    { code: 'NHIF', name: 'National Hospital Insurance Fund', amount: slip.nhif },
    { code: 'NET_PAY', name: 'Net Pay', amount: slip.net_pay },
  ]
  const monthName = MONTHS[(slip.period_month || 1) - 1]
  const tdStyle = { padding: '5px 8px', border: '1px solid #d0d8e8', fontSize: '12px' }
  const hdStyle = { padding: '6px 8px', border: '1px solid #4a7ae8', backgroundColor: '#1a56db', color: '#fff', fontSize: '12px', fontWeight: 'bold' }
  return (
    <div id="payslip-print-area" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#222', padding: '24px', maxWidth: '800px', margin: '0 auto', backgroundColor: '#fff' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div>
          <div style={{ fontSize: '11px', color: '#444', lineHeight: '1.6' }}>
            <div style={{ fontWeight: 'bold' }}>Westlands Business Park, Nairobi</div>
            <div>P.O Box 00100</div>
            <div>Kenya</div>
            <div>+254 701 443 444</div>
            <div>hello@gigva.co.ke</div>
            <div>www.gigva.co.ke</div>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ backgroundColor: '#1a56db', color: '#fff', padding: '6px 24px', fontWeight: 'bold', fontSize: '16px', borderRadius: '4px', marginBottom: '8px' }}>Payslip</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <img src="/logo.png" alt="Gigva" style={{ height: '52px' }} />
          <div style={{ fontSize: '11px', color: '#1a56db', fontWeight: 'bold', marginTop: '2px' }}>GIGVA KENYA</div>
        </div>
      </div>
      <hr style={{ borderColor: '#1a56db', marginBottom: '12px' }} />

      {/* Title */}
      <h3 style={{ textAlign: 'center', backgroundColor: '#1a56db', color: '#fff', padding: '7px', margin: '0 0 4px', fontSize: '13px' }}>
        Salary Slip of {emp.name} for {monthName}–{slip.period_year}
      </h3>

      {/* Personal Details */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
        <thead><tr><th colSpan={3} style={{ ...hdStyle, textAlign: 'left' }}>Personal Details</th></tr></thead>
        <tbody>
          <tr>
            <td style={tdStyle}><b>EMP NAME:</b> {emp.name}</td>
            <td style={tdStyle}><b>DEPT:</b> {emp.department || ''}</td>
            <td style={tdStyle}><b>REF:</b> {slip.slip_ref || ''}</td>
          </tr>
          <tr>
            <td style={tdStyle}><b>ADDRESS:</b> {emp.address || '—'}</td>
            <td style={tdStyle}><b>DESIGNATION:</b> {emp.designation || ''}</td>
            <td style={tdStyle}><b>PERIOD START:</b> {slip.period_start || ''}</td>
          </tr>
          <tr>
            <td style={tdStyle}><b>PHONE:</b> {emp.phone || '—'}</td>
            <td style={tdStyle}><b>ID NO:</b> {emp.id_number || '—'}</td>
            <td style={tdStyle}><b>PERIOD END:</b> {slip.period_end || ''}</td>
          </tr>
          <tr>
            <td style={tdStyle}><b>EMAIL:</b> {emp.email || ''}</td>
            <td style={tdStyle}><b>DATE EMPLOYED:</b> {emp.date_employed || '—'}</td>
            <td style={tdStyle}><b>BANK ACCOUNT:</b> {emp.bank_account || '—'}</td>
          </tr>
          <tr>
            <td style={tdStyle}><b>MARITAL STATUS:</b> {emp.marital_status || 'Single'}</td>
            <td style={tdStyle}></td>
            <td style={tdStyle}><b>BANK NAME:</b> {emp.bank_name || '—'} &nbsp; <b>CODE:</b> {emp.bank_code || '—'}</td>
          </tr>
        </tbody>
      </table>

      {/* Leave Details */}
      {(slip.leave_balance_days > 0 || slip.leave_from) && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
          <thead><tr><th colSpan={3} style={{ ...hdStyle, textAlign: 'left' }}>Leave Details</th></tr></thead>
          <tbody>
            <tr>
              <td style={tdStyle}><b>Leave Balance:</b> {slip.leave_balance_days || 0} days</td>
              <td style={tdStyle}><b>Leave Taken:</b> {slip.leave_from || '—'} to {slip.leave_to || '—'}</td>
              <td style={tdStyle}><b>Days Taken:</b> {slip.leave_days_taken || 0}</td>
            </tr>
          </tbody>
        </table>
      )}

      {/* Earnings/Deductions Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr>
            <th style={hdStyle}>Item</th>
            <th style={hdStyle}>Code</th>
            <th style={{ ...hdStyle, width: '35%' }}>Name</th>
            <th style={hdStyle}>Quantity/Rate</th>
            <th style={hdStyle}>Amount</th>
            <th style={hdStyle}>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={it.code} style={{ backgroundColor: i % 2 === 0 ? '#f0f5ff' : '#fff' }}>
              <td style={{ ...tdStyle, textAlign: 'center' }}>{i + 1}</td>
              <td style={tdStyle}>{it.code}</td>
              <td style={tdStyle}>{it.name}</td>
              <td style={{ ...tdStyle, textAlign: 'right' }}>1.00</td>
              <td style={{ ...tdStyle, textAlign: 'right' }}>{fmtKsh(it.amount)} KSh</td>
              <td style={{ ...tdStyle, textAlign: 'right', fontWeight: it.code === 'NET_PAY' ? 'bold' : 'normal', backgroundColor: it.code === 'NET_PAY' ? '#e8f0fe' : 'inherit' }}>{fmtKsh(it.amount)} KSh</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '16px' }}>
        <div>
          <p style={{ fontSize: '12px', marginBottom: '6px' }}><b>Prepared By: FATUMA KAMAU</b></p>
          <img src="/gigva-stamp.png" alt="Gigva Official Stamp" style={{ height: '90px', opacity: 0.85 }} />
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '12px' }}>Authorized Signature: ___________________________</p>
        </div>
      </div>
      <hr style={{ borderColor: '#1a56db', marginTop: '16px' }} />
      <div style={{ textAlign: 'center', fontSize: '11px', color: '#666', marginTop: '6px' }}>
        Gigva Kenya &bull; +254 701 443 444 &bull; hello@gigva.co.ke &bull; www.gigva.co.ke
      </div>
    </div>
  )
}

function PayrollTab({ token, user }) {
  const [view, setView] = useState('staff') // 'staff' | 'generate' | 'payslip' | 'addStaff' | 'editStaff' | 'history'
  const [employees, setEmployees] = useState([])
  const [selectedEmp, setSelectedEmp] = useState(null)
  const [payslips, setPayslips] = useState([])
  const [currentSlip, setCurrentSlip] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [emailing, setEmailing] = useState(false)

  // Payslip form state
  const [slipForm, setSlipForm] = useState({
    period_month: new Date().getMonth() + 1,
    period_year: new Date().getFullYear(),
    basic_pay: '', house_allowance: '', car_benefit: '', other_allowances: '',
    pension_provident: '0', hosp_mortgage_interest: '0',
    leave_balance_days: '', leave_from: '', leave_to: '', leave_days_taken: '0', notes: ''
  })

  // Employee form state
  const [empForm, setEmpForm] = useState({
    name: '', employee_id: '', department: '', designation: '', email: '', phone: '',
    address: '', date_employed: '', marital_status: 'Single', id_number: '',
    bank_name: '', bank_account: '', bank_code: '',
    basic_pay: '0', house_allowance: '0', car_benefit: '0', other_allowances: '0'
  })

  const hdr = { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }

  const loadEmployees = async () => {
    setLoading(true)
    try {
      // First ensure tables exist
      await fetch('/api/admin/payroll/setup', { method: 'POST', headers: hdr })
      const r = await fetch('/api/admin/payroll/staff', { headers: hdr })
      const d = await r.json()
      if (d.ok) {
        if ((d.employees || []).length === 0) {
          // Seed initial staff
          await fetch('/api/admin/payroll/seed', { method: 'POST', headers: hdr })
          const r2 = await fetch('/api/admin/payroll/staff', { headers: hdr })
          const d2 = await r2.json()
          if (d2.ok) setEmployees(d2.employees || [])
        } else {
          setEmployees(d.employees)
        }
      }
    } catch(e) { setMsg('Error loading employees') }
    setLoading(false)
  }

  const loadPayslips = async (empId) => {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/payroll/payslips?employee_id=' + empId, { headers: hdr })
      const d = await r.json()
      if (d.ok) setPayslips(d.payslips || [])
    } catch(e) {}
    setLoading(false)
  }

  useEffect(() => { loadEmployees() }, [])

  // Live payroll calculation preview
  const liveCalc = (() => {
    const b = parseFloat(slipForm.basic_pay) || 0
    const h = parseFloat(slipForm.house_allowance) || 0
    const c = parseFloat(slipForm.car_benefit) || 0
    const o = parseFloat(slipForm.other_allowances) || 0
    const p = parseFloat(slipForm.pension_provident) || 0
    const mi = parseFloat(slipForm.hosp_mortgage_interest) || 0
    return calcPayroll(b, h, c, o, p, mi)
  })()

  const handleSaveEmployee = async () => {
    setSaving(true); setMsg('')
    try {
      const method = empForm.id ? 'PUT' : 'POST'
      const body = empForm.id ? empForm : { ...empForm }
      const r = await fetch('/api/admin/payroll/staff', { method, headers: hdr, body: JSON.stringify(body) })
      const d = await r.json()
      if (d.ok) {
        setMsg('Employee saved successfully')
        loadEmployees()
        setView('staff')
      } else setMsg(d.msg || 'Save failed')
    } catch(e) { setMsg('Error saving employee') }
    setSaving(false)
  }

  const handleGenerateSlip = async () => {
    if (!selectedEmp) return
    setSaving(true); setMsg('')
    try {
      const b = parseFloat(slipForm.basic_pay) || selectedEmp.basic_pay || 0
      const h = parseFloat(slipForm.house_allowance) || selectedEmp.house_allowance || 0
      const c = parseFloat(slipForm.car_benefit) || selectedEmp.car_benefit || 0
      const o = parseFloat(slipForm.other_allowances) || selectedEmp.other_allowances || 0
      const calc = calcPayroll(b, h, c, o, parseFloat(slipForm.pension_provident)||0, parseFloat(slipForm.hosp_mortgage_interest)||0)
      const slipCount = payslips.length + 1
      const body = {
        employee_id: selectedEmp.id,
        period_month: parseInt(slipForm.period_month),
        period_year: parseInt(slipForm.period_year),
        basic_pay: b, house_allowance: h, car_benefit: c, other_allowances: o,
        pension_provident: parseFloat(slipForm.pension_provident)||0,
        hosp_mortgage_interest: parseFloat(slipForm.hosp_mortgage_interest)||0,
        leave_balance_days: parseInt(slipForm.leave_balance_days)||0,
        leave_from: slipForm.leave_from||null, leave_to: slipForm.leave_to||null,
        leave_days_taken: parseInt(slipForm.leave_days_taken)||0,
        notes: slipForm.notes, slip_number: slipCount,
        ...calc
      }
      const r = await fetch('/api/admin/payroll/payslips', { method: 'POST', headers: hdr, body: JSON.stringify(body) })
      const d = await r.json()
      if (d.ok) {
        const slip = d.payslip
        const emp = slip.payroll_employees || selectedEmp
        setCurrentSlip({ slip, emp })
        setView('payslip')
        loadPayslips(selectedEmp.id)
      } else setMsg(d.msg || 'Generation failed')
    } catch(e) { setMsg('Error generating payslip') }
    setSaving(false)
  }

  const handleEmailSlip = async () => {
    if (!currentSlip) return
    setEmailing(true); setMsg('')
    try {
      const r = await fetch('/api/admin/payroll/email', {
        method: 'POST', headers: hdr,
        body: JSON.stringify({ slip: currentSlip.slip, employee: currentSlip.emp })
      })
      const d = await r.json()
      if (d.ok) setMsg('Payslip emailed to ' + currentSlip.emp.email)
      else setMsg(d.msg || 'Email failed')
    } catch(e) { setMsg('Error sending email') }
    setEmailing(false)
  }

  const handleDownloadPDF = () => {
    const el = document.getElementById('payslip-print-area')
    if (!el) return
    const printWindow = window.open('', '_blank', 'width=900,height=700')
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Payslip</title>
<style>
  @media print { body { margin: 0; } }
  body { font-family: Arial, sans-serif; }
</style></head><body>`)
    printWindow.document.write(el.outerHTML)
    printWindow.document.write('</body></html>')
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => { printWindow.print(); }, 500)
  }

  const handleDownloadWord = () => {
    const el = document.getElementById('payslip-print-area')
    if (!el) return
    const monthName = MONTHS[(currentSlip.slip.period_month||1)-1]
    const filename = `Payslip_${currentSlip.emp.name.replace(/ /g,'_')}_${monthName}_${currentSlip.slip.period_year}.doc`
    const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'><head><meta charset='utf-8'><title>Payslip</title></head><body>` + el.outerHTML + `</body></html>`
    const blob = new Blob([html], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = filename; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const openEditEmp = (emp) => {
    setEmpForm({ ...emp, id: emp.id })
    setView('editStaff')
  }

  const openGenerate = (emp) => {
    setSelectedEmp(emp)
    setSlipForm(f => ({ ...f,
      basic_pay: emp.basic_pay || '', house_allowance: emp.house_allowance || '',
      car_benefit: emp.car_benefit || '', other_allowances: emp.other_allowances || ''
    }))
    loadPayslips(emp.id)
    setView('generate')
  }

  const yearOptions = []
  for (let y = new Date().getFullYear(); y >= 2012; y--) yearOptions.push(y)

  const th = 'px-3 py-2 text-left text-xs font-semibold text-white bg-blue-700 uppercase'
  const td = 'px-3 py-2 text-sm border-b border-slate-100'

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {view !== 'staff' && (
            <button onClick={() => { setView('staff'); setMsg(''); setCurrentSlip(null) }}
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
              <ChevronLeft size={16} /> Back
            </button>
          )}
          <h2 className="text-lg font-bold text-slate-800">
            {view === 'staff' ? 'Payroll — Staff' :
             view === 'generate' ? `Generate Payslip — ${selectedEmp?.name}` :
             view === 'payslip' ? 'Payslip Preview' :
             view === 'history' ? `Payslip History — ${selectedEmp?.name}` :
             view === 'addStaff' ? 'Add Payroll Employee' : 'Edit Employee'}
          </h2>
        </div>
        {view === 'staff' && (
          <button onClick={() => { setEmpForm({ name:'',employee_id:'',department:'',designation:'',email:'',phone:'',address:'',date_employed:'',marital_status:'Single',id_number:'',bank_name:'',bank_account:'',bank_code:'',basic_pay:'0',house_allowance:'0',car_benefit:'0',other_allowances:'0' }); setView('addStaff') }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white text-sm font-semibold rounded-lg hover:bg-blue-800">
            <UserPlus size={15} /> Add Employee
          </button>
        )}
        {view === 'payslip' && (
          <div className="flex items-center gap-2">
            <button onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">
              <Printer size={14} /> PDF / Print
            </button>
            <button onClick={handleDownloadWord}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
              <Download size={14} /> Word (.doc)
            </button>
            <button onClick={handleEmailSlip} disabled={emailing}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-60">
              <Send size={14} /> {emailing ? 'Sending…' : 'Email to Staff'}
            </button>
          </div>
        )}
      </div>

      {msg && <div className={`text-sm px-4 py-2 rounded-lg ${msg.includes('Error')||msg.includes('failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{msg}</div>}

      {/* STAFF LIST VIEW */}
      {view === 'staff' && (
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-500"><Loader2 size={20} className="animate-spin mr-2" /> Loading employees…</div>
          ) : employees.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Users size={40} className="mx-auto mb-3 text-slate-300" />
              <p className="font-medium">No payroll employees yet</p>
              <p className="text-sm">Add employees to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className={th}>#</th>
                    <th className={th}>Name</th>
                    <th className={th}>Designation</th>
                    <th className={th}>Department</th>
                    <th className={th}>Email</th>
                    <th className={th}>Basic Pay (KSh)</th>
                    <th className={th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.filter(e => e.is_active !== false).map((emp, i) => (
                    <tr key={emp.id} className="hover:bg-blue-50 transition-colors">
                      <td className={td + ' text-slate-400'}>{i+1}</td>
                      <td className={td + ' font-semibold text-slate-800'}>{emp.name}</td>
                      <td className={td}>{emp.designation || '—'}</td>
                      <td className={td}>{emp.department || '—'}</td>
                      <td className={td + ' text-slate-500'}>{emp.email}</td>
                      <td className={td + ' font-mono'}>{fmtKsh(emp.basic_pay)}</td>
                      <td className={td}>
                        <div className="flex items-center gap-2">
                          <button onClick={() => openGenerate(emp)}
                            className="flex items-center gap-1 px-2 py-1 bg-blue-700 text-white text-xs rounded hover:bg-blue-800">
                            <FileText size={12} /> Generate
                          </button>
                          <button onClick={() => { setSelectedEmp(emp); loadPayslips(emp.id); setView('history') }}
                            className="flex items-center gap-1 px-2 py-1 bg-slate-600 text-white text-xs rounded hover:bg-slate-700">
                            <Eye size={12} /> History
                          </button>
                          <button onClick={() => openEditEmp(emp)}
                            className="flex items-center gap-1 px-2 py-1 bg-amber-600 text-white text-xs rounded hover:bg-amber-700">
                            <Edit3 size={12} /> Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ADD / EDIT EMPLOYEE FORM */}
      {(view === 'addStaff' || view === 'editStaff') && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              ['Name *','name','text'],['Employee ID','employee_id','text'],
              ['Department','department','text'],['Designation','designation','text'],
              ['Email *','email','email'],['Phone','phone','tel'],
              ['Address','address','text'],['Date Employed','date_employed','date'],
              ['ID Number','id_number','text'],['Bank Name','bank_name','text'],
              ['Bank Account','bank_account','text'],['Bank Code','bank_code','text'],
            ].map(([label, field, type]) => (
              <div key={field}>
                <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
                <input type={type} value={empForm[field]||''} onChange={e => setEmpForm(f => ({ ...f, [field]: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Marital Status</label>
              <select value={empForm.marital_status} onChange={e => setEmpForm(f => ({ ...f, marital_status: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                <option>Single</option><option>Married</option><option>Divorced</option><option>Widowed</option>
              </select>
            </div>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-xs font-bold text-blue-700 mb-3 uppercase">Default Salary Components (KSh)</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[['Basic Pay','basic_pay'],['House Allowance','house_allowance'],['Car Benefit','car_benefit'],['Other Allowances','other_allowances']].map(([l,f]) => (
                <div key={f}>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{l}</label>
                  <input type="number" value={empForm[f]||0} onChange={e => setEmpForm(f2 => ({ ...f2, [f]: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSaveEmployee} disabled={saving}
              className="px-6 py-2 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 disabled:opacity-60 text-sm">
              {saving ? 'Saving…' : view === 'addStaff' ? 'Add Employee' : 'Save Changes'}
            </button>
            <button onClick={() => { setView('staff'); setMsg('') }}
              className="px-6 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* GENERATE PAYSLIP FORM */}
      {view === 'generate' && selectedEmp && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase mb-4">Pay Period</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Month</label>
                <select value={slipForm.period_month} onChange={e => setSlipForm(f => ({ ...f, period_month: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
                  {MONTHS.map((m,i) => <option key={m} value={i+1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Year</label>
                <select value={slipForm.period_year} onChange={e => setSlipForm(f => ({ ...f, period_year: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
                  {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase mb-4">Salary Components (KSh)</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[['Basic Pay *','basic_pay'],['House Allowance','house_allowance'],['Car Benefit','car_benefit'],['Other Allowances','other_allowances'],['Pension/Provident','pension_provident'],['Mortgage Interest','hosp_mortgage_interest']].map(([l,f]) => (
                <div key={f}>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{l}</label>
                  <input type="number" value={slipForm[f]||''} onChange={e => setSlipForm(f2 => ({ ...f2, [f]: e.target.value }))}
                    placeholder="0"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase mb-4">Leave Details</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Leave Balance (days)</label>
                <input type="number" value={slipForm.leave_balance_days} onChange={e => setSlipForm(f => ({ ...f, leave_balance_days: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Leave From</label>
                <input type="date" value={slipForm.leave_from} onChange={e => setSlipForm(f => ({ ...f, leave_from: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Leave To</label>
                <input type="date" value={slipForm.leave_to} onChange={e => setSlipForm(f => ({ ...f, leave_to: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Days Taken</label>
                <input type="number" value={slipForm.leave_days_taken} onChange={e => setSlipForm(f => ({ ...f, leave_days_taken: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Notes</label>
              <textarea value={slipForm.notes} onChange={e => setSlipForm(f => ({ ...f, notes: e.target.value }))}
                rows={2} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          {/* Live Calculation Preview */}
          {(parseFloat(slipForm.basic_pay) > 0) && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 shadow-sm">
              <p className="text-xs font-bold text-blue-700 uppercase mb-3">Live Payroll Calculation Preview</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  ['Gross Pay', liveCalc.grossPay],
                  ['NSSF', liveCalc.nssf],
                  ['NHIF', liveCalc.nhif],
                  ['PAYE (Tax)', liveCalc.paye],
                  ['Personal Relief', liveCalc.personalRelief],
                  ['Net Tax', liveCalc.netTax],
                  ['Net Taxable', liveCalc.netTaxable],
                  ['NET PAY', liveCalc.netPay],
                ].map(([label, val]) => (
                  <div key={label} className={`bg-white rounded-lg p-3 border ${label==='NET PAY' ? 'border-blue-500 col-span-2 sm:col-span-1' : 'border-blue-100'}`}>
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className={`font-bold ${label==='NET PAY' ? 'text-blue-700 text-base' : 'text-slate-800 text-sm'}`}>KSh {fmtKsh(val)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={handleGenerateSlip} disabled={saving}
              className="px-6 py-2 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 disabled:opacity-60 text-sm">
              {saving ? 'Generating…' : 'Generate & Preview Payslip'}
            </button>
          </div>
        </div>
      )}

      {/* PAYSLIP HISTORY */}
      {view === 'history' && selectedEmp && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-500"><Loader2 size={20} className="animate-spin mr-2" /> Loading…</div>
          ) : payslips.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No payslips generated yet for {selectedEmp.name}</div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={th}>Ref</th><th className={th}>Period</th><th className={th}>Gross Pay</th>
                  <th className={th}>Net Pay</th><th className={th}>Generated</th><th className={th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {payslips.map(slip => (
                  <tr key={slip.id} className="hover:bg-blue-50">
                    <td className={td + ' font-mono text-xs'}>{slip.slip_ref}</td>
                    <td className={td}>{MONTHS[(slip.period_month||1)-1]} {slip.period_year}</td>
                    <td className={td + ' font-mono'}>KSh {fmtKsh(slip.gross_pay)}</td>
                    <td className={td + ' font-bold font-mono text-blue-700'}>KSh {fmtKsh(slip.net_pay)}</td>
                    <td className={td + ' text-xs text-slate-400'}>{slip.generated_by}</td>
                    <td className={td}>
                      <button onClick={() => {
                        const emp = slip.payroll_employees || selectedEmp
                        setCurrentSlip({ slip, emp }); setView('payslip')
                      }}
                        className="flex items-center gap-1 px-2 py-1 bg-blue-700 text-white text-xs rounded hover:bg-blue-800">
                        <Eye size={12} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* PAYSLIP PREVIEW */}
      {view === 'payslip' && currentSlip && (
        <div>
          <style>{`
            @media print {
              body > * { display: none !important; }
              #payslip-print-area { display: block !important; }
              #payslip-print-area, #payslip-print-area * { visibility: visible !important; }
            }
          `}</style>
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <PayslipDocument slip={currentSlip.slip} emp={currentSlip.emp} />
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminDashboard() {
  const router = useRouter()
  const [token, setToken]         = useState(null)
  const [user, setUser]           = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [tab, setTab]             = useState(null)
  const [counts, setCounts]       = useState({ messages: 0, demos: 0, trials: 0, users: 0, inbox: 0  })

  // ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ Auth check ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ
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

  // ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ Load counts ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ
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
             {tab === 'inbox' && <InboxTab token={token} user={user} />}
              {tab === 'sent'  && <SentTab  token={token} user={user} />}
              {tab === 'payroll' && (user.role === 'cto' || user.role === 'people_ops' || user.role === 'superadmin') && <PayrollTab token={token} user={user} />}
              {tab === 'payroll' && user.role !== 'cto' && user.role !== 'people_ops' && user.role !== 'superadmin' && (
                <div className="flex items-center gap-3 text-slate-500 py-8"><AlertCircle size={20} /> <p>Payroll access is restricted to CTO and People &amp; Operations staff.</p></div>
              )}
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
