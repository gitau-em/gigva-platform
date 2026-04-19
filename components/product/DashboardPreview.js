'use client'
import { useState, useMemo } from 'react'
import { CheckCircle2, AlertCircle, Clock, XCircle, TrendingUp, TrendingDown, Filter, Download } from 'lucide-react'

const ALL_TRANSACTIONS = [
  { id: 'TXN-8841', ref: 'QHJ2KXPL7', date: 'Today, 08:14', from: 'James Mwangi', phone: '0712 3XX XXX', amount: 15500, status: 'success', invoice: 'INV-0041', type: 'C2B' },
  { id: 'TXN-8840', ref: 'QHK9MPRT2', date: 'Today, 08:52', from: 'Sarah Kamau',  phone: '0722 4XX XXX', amount: 8200,  status: 'success', invoice: 'INV-0038', type: 'C2B' },
  { id: 'TXN-8839', ref: 'QHL4NWVS8', date: 'Today, 09:30', from: 'Peter Otieno', phone: '0700 9XX XXX', amount: 32000, status: 'flagged', invoice: null,       type: 'C2B' },
  { id: 'TXN-8838', ref: 'QHM7PXQK1', date: 'Today, 10:05', from: 'Ann Wanjiru',  phone: '0733 1XX XXX', amount: 5750,  status: 'success', invoice: 'INV-0045', type: 'C2B' },
  { id: 'TXN-8837', ref: 'QHN1RYUT5', date: 'Today, 10:41', from: 'David Kamau',  phone: '0711 8XX XXX', amount: 12300, status: 'pending', invoice: 'INV-0043', type: 'C2B' },
  { id: 'TXN-8836', ref: 'QHP3STMK9', date: 'Today, 11:02', from: 'Grace Muthoni', phone: '0728 2XX XXX', amount: 4500,  status: 'failed',  invoice: 'INV-0040', type: 'C2B' },
  { id: 'TXN-8835', ref: 'QHQ6UVNL2', date: 'Today, 11:38', from: 'John Kipchoge', phone: '0719 5XX XXX', amount: 21000, status: 'success', invoice: 'INV-0047', type: 'C2B' },
]

const STATUS_CONFIG = {
  success: { label: 'Reconciled', icon: CheckCircle2, bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  flagged: { label: 'Unmatched',  icon: AlertCircle,   bg: 'bg-amber-500/10',   text: 'text-amber-400',   dot: 'bg-amber-400'   },
  pending: { label: 'Pending',    icon: Clock,          bg: 'bg-slate-500/10',   text: 'text-slate-400',   dot: 'bg-slate-400'   },
  failed:  { label: 'Failed',     icon: XCircle,        bg: 'bg-red-500/10',     text: 'text-red-400',     dot: 'bg-red-400'     },
}

const METRICS = [
  { label: "Today's revenue",    value: 'KSh 99,250', delta: '+12%',   positive: true,  sub: '7 transactions' },
  { label: 'Successfully reconciled', value: '5 / 7',  delta: '71%',    positive: true,  sub: '2 need attention' },
  { label: 'Flagged / unmatched', value: '1',         delta: 'Review',  positive: false, sub: 'KSh 32,000' },
  { label: 'Failed payments',    value: '1',          delta: 'Alert',   positive: false, sub: 'INV-0040 outstanding' },
]

export default function DashboardPreview() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch]             = useState('')

  const filtered = useMemo(() => {
    return ALL_TRANSACTIONS.filter(tx => {
      const matchStatus = statusFilter === 'all' || tx.status === statusFilter
      const matchSearch = !search || tx.from.toLowerCase().includes(search.toLowerCase()) || tx.ref.toLowerCase().includes(search.toLowerCase())
      return matchStatus && matchSearch
    })
  }, [statusFilter, search])

  return (
    <section className="section bg-slate-900">
      <div className="inner">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-3">Live Dashboard</p>
          <h2 className="text-3xl md:text-4xl font-display text-white mb-4">
            Every M-Pesa payment your business receives — organised automatically
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
            Retail shops, logistics firms, and SMEs across Nairobi use Gigva to replace spreadsheet 
            reconciliation with a real-time dashboard. Below is what their screen looks like.
          </p>
          <p className="text-xs text-slate-600 mt-2 italic">Sample data for illustration — your real transactions will appear here</p>
        </div>

        {/* Dashboard shell */}
        <div className="bg-[#0f172a] rounded-2xl border border-slate-700/60 overflow-hidden shadow-2xl">

          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-800 bg-slate-950/60">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
            </div>
            <div className="flex-1 mx-3 bg-slate-800 rounded px-3 py-0.5 text-[11px] text-slate-500 font-mono">
              app.gigvakenya.co.ke/dashboard
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </div>
          </div>

          {/* Top nav inside app */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-900/80">
            <div className="flex items-center gap-1">
              {['Overview', 'Transactions', 'Invoices', 'Reports'].map((tab, i) => (
                <span key={tab} className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-default
                  ${i === 1 ? 'bg-sky-500/20 text-sky-400' : 'text-slate-500'}`}>
                  {tab}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">Today</span>
              <div className="w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center text-[10px] font-bold text-white">J</div>
            </div>
          </div>

          {/* Summary metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-800/40 border-b border-slate-800">
            {METRICS.map(m => (
              <div key={m.label} className="bg-slate-900 px-5 py-4">
                <div className="text-[11px] text-slate-500 mb-1.5 font-medium">{m.label}</div>
                <div className="font-display font-bold text-xl text-white leading-none mb-1">{m.value}</div>
                <div className={`flex items-center gap-1 text-[11px] font-semibold ${m.positive ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {m.positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {m.delta}
                  <span className="text-slate-600 font-normal ml-1">{m.sub}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Filters row */}
          <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-1.5">
              <Filter size={12} className="text-slate-500" />
              <span className="text-xs text-slate-500 font-medium">Filter:</span>
            </div>
            {[
              { key: 'all',     label: 'All' },
              { key: 'success', label: 'Reconciled' },
              { key: 'flagged', label: 'Unmatched' },
              { key: 'pending', label: 'Pending' },
              { key: 'failed',  label: 'Failed' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all
                  ${statusFilter === f.key
                    ? 'bg-sky-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
              >
                {f.label}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <input
                className="bg-slate-800 border border-slate-700 rounded px-3 py-1 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-sky-500 w-40"
                placeholder="Search name or ref..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <button className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-400 hover:text-slate-200 transition-colors">
                <Download size={11} />
                Export
              </button>
            </div>
          </div>

          {/* Transaction table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40">
                  {['Transaction ID', 'Date & Time', 'Sender', 'Amount (KSh)', 'Invoice', 'Type', 'Status'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(tx => {
                  const cfg = STATUS_CONFIG[tx.status]
                  const Icon = cfg.icon
                  return (
                    <tr key={tx.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-slate-400">{tx.ref}</td>
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{tx.date}</td>
                      <td className="px-4 py-3">
                        <div className="text-slate-200 font-medium">{tx.from}</div>
                        <div className="text-slate-600 text-[10px]">{tx.phone}</div>
                      </td>
                      <td className="px-4 py-3 font-display font-bold text-white">
                        {tx.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        {tx.invoice
                          ? <span className="text-sky-400 font-mono">{tx.invoice}</span>
                          : <span className="text-amber-400 font-medium">— unmatched</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px] font-semibold">{tx.type}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${cfg.bg} ${cfg.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-600 text-xs">
                      No transactions match your filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer bar */}
          <div className="flex items-center justify-between px-5 py-2.5 border-t border-slate-800 bg-slate-950/40">
            <span className="text-[11px] text-slate-600">
              Showing {filtered.length} of {ALL_TRANSACTIONS.length} transactions
            </span>
            <span className="text-[11px] text-slate-600">
              Last synced: <span className="text-emerald-500">2 seconds ago</span> via Daraja API
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
