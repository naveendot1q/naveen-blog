'use client'

import { useEffect, useState, useRef } from 'react'

export default function SignalMeter() {
  const [progress, setProgress] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const article = document.getElementById('blog-article')
    if (!article) return

    const compute = () => {
      const rect = article.getBoundingClientRect()
      const articleHeight = article.offsetHeight
      const scrolled = Math.max(0, window.innerHeight - rect.top)
      const raw = Math.min(1, Math.max(0, scrolled / articleHeight))
      setProgress(raw)
    }

    const handleScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(compute)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    compute()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const pct = Math.round(progress * 100)

  return (
    <div className="sticky top-14 z-20 bg-[var(--bg)]">
      <div className="signal-meter-track">
        <div className="signal-meter-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-end px-1">
        <span className="mono text-[9px] text-[var(--muted)] tracking-wider py-1">
          SIGNAL {pct}%
        </span>
      </div>
    </div>
  )
}
