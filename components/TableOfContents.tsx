'use client'

import React, { useEffect, useRef, useState } from 'react'

interface Heading {
  id: string
  text: string
  level: number
}

export default function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>('')
  const tocRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (headings.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-96px 0px -60% 0px', threshold: 0 }
    )
    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [headings])

  const handleClick = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - 96
    window.scrollTo({ top, behavior: 'smooth' })
    setActiveId(id)
  }

  if (headings.length === 0) return null

  return (
    <aside className="hidden xl:flex xl:flex-col w-[22%] shrink-0 self-start sticky top-24">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--accent)] bg-opacity-10 border border-[var(--accent)] border-opacity-20">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="1" width="4" height="1" rx="0.5" fill="currentColor" className="text-[var(--accent)]"/>
            <rect x="0" y="4" width="10" height="1" rx="0.5" fill="currentColor" className="text-[var(--accent)] opacity-60"/>
            <rect x="0" y="7" width="7" height="1" rx="0.5" fill="currentColor" className="text-[var(--accent)] opacity-40"/>
          </svg>
          <span className="mono text-[10px] text-[var(--accent)] font-medium tracking-widest uppercase">
            On this page
          </span>
        </div>
      </div>

      {/* TOC nav — scrolls only when hovered */}
      <div
        ref={tocRef}
        className="toc-scroll max-h-[calc(100vh-200px)] overflow-y-hidden"
      >
        <nav className="space-y-0.5">
          {headings.map((h) => {
            const isActive = activeId === h.id
            const isH1 = h.level === 1
            const isH2 = h.level === 2
            const isH3 = h.level === 3

            return (
              <button
                key={h.id}
                onClick={() => handleClick(h.id)}
                className={[
                  'w-full text-left flex items-start gap-2 py-1 pr-2 rounded-md transition-all duration-150 group',
                  isH3 ? 'pl-4' : isH1 || isH2 ? 'pl-0' : 'pl-6',
                  isActive
                    ? 'text-[var(--accent)]'
                    : 'text-[var(--muted)] hover:text-[var(--text)]',
                ].join(' ')}
              >
                {/* Active indicator dot / indent guide */}
                <span className={[
                  'mt-1.5 shrink-0 rounded-full transition-all duration-150',
                  isH3 ? 'w-1 h-1' : 'w-1.5 h-1.5',
                  isActive
                    ? 'bg-[var(--accent)]'
                    : 'bg-[var(--border)] group-hover:bg-[var(--muted)]',
                ].join(' ')} />
                <span className={[
                  'text-xs leading-snug',
                  isH1 ? 'font-semibold' : isH2 ? 'font-medium' : 'font-normal opacity-85',
                  isActive ? 'text-[var(--accent)]' : '',
                ].join(' ')}>
                  {h.text}
                </span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Progress hint at bottom */}
      <div className="mt-4 pt-3 border-t border-[var(--border)]">
        <p className="mono text-[9px] text-[var(--muted)] opacity-50 tracking-wider uppercase">
          hover to scroll
        </p>
      </div>
    </aside>
  )
}
