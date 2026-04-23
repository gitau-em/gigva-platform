'use client'

import { useEffect, useRef, useState } from 'react'

function CounterCard({ target, suffix, label, icon, duration = 2000 }) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    let startTime = null
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
      else setCount(target)
    }
    requestAnimationFrame(step)
  }, [started, target, duration])

  return (
    <div ref={ref} className="flex flex-col items-center justify-center bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-4xl font-extrabold text-sky-600 leading-none tabular-nums">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-slate-500 mt-2 font-medium leading-snug">{label}</div>
    </div>
  )
}

export default function SocialProof() {
  return (
    <section className="section bg-white border-t border-slate-200">
      <div className="inner">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <p className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-3">Trusted in Nairobi</p>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Built in Nairobi. Tested by real businesses.
          </h2>
          <p className="text-slate-600 leading-relaxed">
            Gigva has operated in Kenya&apos;s M-Pesa payment space since 2012. We work directly
            with retail shops, logistics operators, and service businesses — and every
            feature in the product has been shaped by how those businesses actually work.
          </p>
        </div>

        {/* Counter stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <CounterCard
            target={120}
            suffix="+"
            label="Businesses on Gigva Software"
            icon="🏢"
            duration={1800}
          />
          <CounterCard
            target={23}
            suffix=""
            label="Kenyan Counties with Active Users"
            icon="📍"
            duration={2000}
          />
          <CounterCard
            target={99}
            suffix="%"
            label="Platform Uptime SLA Guarantee"
            icon="⚡"
            duration={1600}
          />
          <div className="flex flex-col items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-50 border border-sky-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-center">
            <div className="text-3xl mb-2">🏆</div>
            <div className="text-sm font-bold text-indigo-700 leading-snug">Top Fintech Startup</div>
            <div className="text-xs text-slate-500 mt-1 leading-snug">Kenya Startup Awards 2024 — Best SME Finance Tool</div>
          </div>
        </div>
      </div>
    </section>
  )
}
