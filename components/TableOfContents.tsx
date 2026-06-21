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
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
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
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' })
    setActiveId(id)
  }

  if (headings.length === 0) return null

  return (
    // self-start + sticky top-0: sticks from the very top of the viewport
    // (pt-20 on the page already handles the navbar clearance for content;
    //  the TOC column itself starts flush and fills top-to-bottom)
    <aside className="hidden xl:flex xl:flex-col w-[20%] shrink-0 self-start sticky top-14 h-[calc(100vh-56px)]">
      {/* Header — flush to top */}
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <p className="mono text-[11px] text-[var(--muted)] tracking-[0.25em] uppercase font-semibold">
          On this page
        </p>
      </div>

      {/* Scrollable nav */}
      <div
        ref={tocRef}
        className="toc-scroll flex-1 overflow-y-hidden hover:overflow-y-auto py-3 px-4"
      >
        <nav className="space-y-0.5">
          {headings.map((h) => {
            const isActive = activeId === h.id
            const indent = h.level === 3 ? 'pl-4' : h.level >= 4 ? 'pl-7' : 'pl-0'

            return (
              <button
                key={h.id}
                onClick={() => handleClick(h.id)}
                className={[
                  'w-full text-left flex items-start gap-2.5 py-1.5 pr-2 rounded-md transition-all duration-150 group',
                  indent,
                  isActive
                    ? 'text-[var(--accent)]'
                    : 'text-[var(--text)] hover:text-[var(--accent)]',
                ].join(' ')}
              >
                {/* dot indicator */}
                <span className={[
                  'shrink-0 rounded-full mt-[7px] transition-all',
                  h.level <= 2 ? 'w-[6px] h-[6px]' : 'w-1 h-1',
                  isActive ? 'bg-[var(--accent)]' : 'bg-[var(--border)] group-hover:bg-[var(--accent)]',
                ].join(' ')} />
                <span className={[
                  'leading-snug',
                  h.level === 1 ? 'text-sm font-bold' : h.level === 2 ? 'text-sm font-semibold' : 'text-xs font-medium',
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
          hover to scroll
        </p>
      </div>
    </aside>
  )
}
