'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Home, Package, Zap, Info, Shield, Calendar, Mail, ArrowRight, LogIn, Lock, Users } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/',           label: 'Home',        icon: Home     },
  { href: '/product',    label: 'Product',     icon: Package  },
  { href: '/features',   label: 'Features',    icon: Zap      },
  { href: '/for',        label: 'Who It’s For', icon: Users    },
  { href: '/about',      label: 'About Us',    icon: Info     },
  { href: '/security',   label: 'Security',    icon: Shield   },
  { href: '/book-demo',  label: 'Book a Demo', icon: Calendar },
  { href: '/contact',    label: 'Contact Us',  icon: Mail     },
  { href: '/login',      label: 'Sign In',     icon: LogIn    },
]

export default function Navbar() {
  const [open, setOpen]         = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname                = usePathname()
  const drawerRef               = useRef(null)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])

  // Trap focus and close on Escape
  useEffect(() => {
    if (!open) return
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 h-16 transition-all duration-200
        ${scrolled
          ? 'bg-white/98 backdrop-blur-md shadow-sm border-b border-slate-200'
          : 'bg-white/90 backdrop-blur-sm'}`}>
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-full flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="logo-wrap" aria-label="Gigva home">
            <svg width="152" height="40" style={{ pointerEvents: 'none' }} viewBox="0 0 152 40" xmlns="http://www.w3.org/2000/svg">
              <g className="nl-glow">
                <rect className="nl-box" x="0" y="0" width="40" height="40" rx="9" fill="#0ea5e9"/>
                <path className="nl-arc" d="M28.5 10.5 A10.5 10.5 0 1 0 28.5 29.5" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none"/>
                <line className="nl-bar" x1="28.5" y1="20" x2="20.5" y2="20" stroke="#fff" strokeWidth="4" strokeLinecap="round"/>
                <line className="nl-tick" x1="28.5" y1="29.5" x2="28.5" y2="24" stroke="#fff" strokeWidth="4" strokeLinecap="round"/>
                <circle className="nl-dot" cx="32" cy="7" r="2.5" fill="#7dd3fc"/>
              </g>
              <text className="nl-word" x="49" y="24" fontFamily="system-ui,sans-serif" fontWeight="800" fontSize="18" fill="#0ea5e9" letterSpacing="-.5">GIGVA</text>
              <text className="nl-sub" x="50" y="35" fontFamily="system-ui,sans-serif" fontWeight="700" fontSize="7.5" fill="#7dd3fc" letterSpacing="3.5">KENYA</text>
            </svg>
          </Link>

          {/* Hamburger — always on right */}
          <button
            onClick={() => setOpen(v => !v)}
            aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={open}
            aria-controls="nav-drawer"
            className="relative z-[60] flex flex-col items-center justify-center w-10 h-10 rounded-lg
                       text-slate-600 hover:bg-slate-100 transition-colors duration-150 focus:outline-none
                       focus:ring-2 focus:ring-sky-400 focus:ring-offset-2"
          >
            <span className={`block w-5 h-0.5 bg-current rounded-full transition-all duration-300
              ${open ? 'translate-y-[3px] rotate-45' : '-translate-y-[3px]'}`} />
            <span className={`block w-5 h-0.5 bg-current rounded-full transition-all duration-300
              ${open ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'}`} />
            <span className={`block w-5 h-0.5 bg-current rounded-full transition-all duration-300
              ${open ? '-translate-y-[3px] -rotate-45' : 'translate-y-[3px]'}`} />
          </button>
        </div>
      </header>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-[55] bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300
          ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Drawer — slides in from right */}
      <div
        id="nav-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        className={`fixed top-0 right-0 bottom-0 z-[60] w-72 bg-white shadow-2xl
                    flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                    ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Navigation</span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500
                       hover:bg-slate-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-3 px-3" aria-label="Main navigation">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium
                            transition-colors duration-150 mb-0.5
                            ${active
                              ? 'text-sky-600 bg-sky-50 font-semibold'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
              >
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                  ${active ? 'bg-sky-100' : 'bg-slate-100'}`}>
                  <Icon size={15} className={active ? 'text-sky-600' : 'text-slate-500'} />
                </span>
                {label}
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-500" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Staff Login section */}
        <div className="px-3 pb-2">
          <div className="flex items-center gap-2 px-3 py-1.5 mb-1">
            <span className="h-px flex-1 bg-slate-100" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Staff Access</span>
            <span className="h-px flex-1 bg-slate-100" />
          </div>
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium
                        transition-colors duration-150 mb-0.5 border border-slate-200
                        ${pathname.startsWith('/admin')
                          ? 'text-indigo-700 bg-indigo-50 border-indigo-200 font-semibold'
                          : 'text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 hover:border-indigo-200'}`}
          >
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
              ${pathname.startsWith('/admin') ? 'bg-indigo-100' : 'bg-slate-100'}`}>
              <Lock size={15} className={pathname.startsWith('/admin') ? 'text-indigo-700' : 'text-slate-500'} />
            </span>
            Staff Login
            <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-600 font-bold">Admin</span>
          </Link>
        </div>

        {/* Bottom CTA */}
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <Link
            href="/trial"
            className="flex items-center justify-center gap-2 w-full bg-sky-500 hover:bg-sky-600
                       text-white font-bold text-sm py-3 px-4 rounded-xl transition-colors duration-150"
          >
            Start Free Trial
            <ArrowRight size={15} />
          </Link>
          <p className="text-[10px] text-slate-400 text-center mt-2">No setup fee · 30 days free</p>
        </div>
      </div>
    </>
  )
}
