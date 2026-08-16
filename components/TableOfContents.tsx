'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'

interface Heading {
  id: string
  text: string
  level: number
}

export default function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? '')
  const tocRef = useRef<HTMLDivElement>(null)
  const headingTopsRef = useRef<{ id: string; top: number }[]>([])

  // Build a map of heading positions and find the active one on scroll
  // This is more reliable than IntersectionObserver for long sections
  const updateActive = useCallback(() => {
    const scrollY = window.scrollY + 100 // 100px offset below navbar+header
    const tops = headingTopsRef.current

    if (tops.length === 0) return

    // Find the last heading whose top is above the current scroll position
    let active = tops[0].id
    for (const { id, top } of tops) {
      if (top <= scrollY) active = id
    }
    setActiveId(active)
  }, [])

  // Measure heading positions (re-measure on mount and resize)
  const measureHeadings = useCallback(() => {
    headingTopsRef.current = headings
      .map(({ id }) => {
        const el = document.getElementById(id)
        if (!el) return null
        return { id, top: el.getBoundingClientRect().top + window.scrollY }
      })
      .filter(Boolean) as { id: string; top: number }[]
    updateActive()
  }, [headings, updateActive])

  useEffect(() => {
    // Wait a tick for the DOM to settle
    const timer = setTimeout(measureHeadings, 100)
    window.addEventListener('scroll', updateActive, { passive: true })
    window.addEventListener('resize', measureHeadings, { passive: true })
    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', updateActive)
      window.removeEventListener('resize', measureHeadings)
    }
  }, [measureHeadings, updateActive])

  // Auto-scroll the TOC to keep active item visible
  useEffect(() => {
    if (!activeId || !tocRef.current) return
    const activeBtn = tocRef.current.querySelector(`[data-id="${activeId}"]`) as HTMLElement
    if (!activeBtn) return
    const container = tocRef.current
    const btnTop = activeBtn.offsetTop
    const btnBottom = btnTop + activeBtn.offsetHeight
    const containerTop = container.scrollTop
    const containerBottom = containerTop + container.clientHeight
    if (btnTop < containerTop + 20) {
      container.scrollTo({ top: btnTop - 20, behavior: 'smooth' })
    } else if (btnBottom > containerBottom - 20) {
      container.scrollTo({ top: btnBottom - container.clientHeight + 20, behavior: 'smooth' })
    }
  }, [activeId])

  const handleClick = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' })
    setActiveId(id)
  }

  if (headings.length === 0) return null

  return (
    <aside className="hidden xl:flex xl:flex-col w-[20%] shrink-0 self-start sticky top-14 h-[calc(100vh-56px)]">
      {/* Header — flush to top */}
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <p className="mono text-[11px] text-[var(--muted)] tracking-[0.25em] uppercase font-semibold">
          On this page
        </p>
      </div>

      {/* Scrollable nav — auto-scrolls to keep active item visible */}
      <div
        ref={tocRef}
        className="flex-1 overflow-y-auto py-3 px-3"
        style={{ scrollBehavior: 'smooth' }}
      >
        <nav className="space-y-0.5">
          {headings.map((h) => {
            const isActive = activeId === h.id
            const indent = h.level === 3 ? 'pl-4' : h.level >= 4 ? 'pl-7' : 'pl-0'

            return (
              <button
                key={h.id}
                data-id={h.id}
                onClick={() => handleClick(h.id)}
                className={[
                  'w-full text-left flex items-start gap-2.5 py-1.5 pr-2 rounded-md transition-all duration-200 group',
                  indent,
                  isActive
                    ? 'text-[var(--accent)]'
                    : 'text-[var(--text)] hover:text-[var(--accent)]',
                ].join(' ')}
              >
                {/* Dot indicator */}
                <span className={[
                  'shrink-0 rounded-full mt-[7px] transition-all duration-200',
                  h.level <= 2 ? 'w-[6px] h-[6px]' : 'w-1 h-1',
                  isActive
                    ? 'bg-[var(--accent)] scale-125'
                    : 'bg-[var(--border)] group-hover:bg-[var(--muted)]',
                ].join(' ')} />
                <span className={[
                  'leading-snug transition-colors duration-200',
                  h.level === 1 ? 'text-sm font-bold' :
                  h.level === 2 ? 'text-sm font-semibold' : 'text-xs font-medium',
                  isActive ? 'text-[var(--accent)]' : '',
                ].join(' ')}>
                  {h.text}
                </span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Footer — flush to bottom */}
      <div className="px-4 py-3 border-t border-[var(--border)]">
        <p className="mono text-[9px] text-[var(--muted)] opacity-40 tracking-widest uppercase">
          scroll to navigate
        </p>
      </div>
    </aside>
  )
}
