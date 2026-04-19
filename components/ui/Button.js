import Link from 'next/link'
import { clsx } from 'clsx'

export function Button({ variant = 'primary', size = 'md', href, className, children, ...props }) {
  const base = 'inline-flex items-center gap-2 font-bold rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2'
  const variants = {
    primary:   'bg-sky-500 text-white border border-sky-500 hover:bg-sky-600 focus:ring-sky-400',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:border-sky-400 hover:text-sky-600 focus:ring-sky-400',
    ghost:     'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:ring-slate-400',
    danger:    'bg-red-500 text-white border border-red-500 hover:bg-red-600 focus:ring-red-400',
  }
  const sizes = {
    sm: 'px-3.5 py-2 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }
  const cls = clsx(base, variants[variant], sizes[size], className)
  if (href) return <Link href={href} className={cls} {...props}>{children}</Link>
  return <button className={cls} {...props}>{children}</button>
}

export function Badge({ variant = 'blue', children, className }) {
  const variants = {
    blue:   'bg-sky-50 text-sky-700 border border-sky-200',
    green:  'bg-emerald-50 text-emerald-700 border border-emerald-200',
    yellow: 'bg-amber-50 text-amber-700 border border-amber-200',
    red:    'bg-red-50 text-red-700 border border-red-200',
    slate:  'bg-slate-100 text-slate-600 border border-slate-200',
  }
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', variants[variant], className)}>
      {children}
    </span>
  )
}
