'use client'

import React, { useEffect, useRef, useState } from 'react'
import { List } from 'lucide-react'

interface Heading {
  id: string
  text: string
  level: number
}

export default function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>('')
  const tocRef = useRef<HTMLDivElement>(null)

  // Track active heading via IntersectionObserver
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
    const top = el.getBoundingClientRect().top + window.scrollY - 90
    window.scrollTo({ top, behavior: 'smooth' })
    setActiveId(id)
  }

  if (headings.length === 0) return null

  return (
    <>
      {/* 
        True fixed sidebar — sits in its own fixed layer, 
        completely independent of the article scroll flow.
        Only visible on xl screens (≥1280px).
      */}
      <aside className="hidden xl:block fixed top-24 right-0 w-72 h-[calc(100vh-96px)] pointer-events-none z-30">
        {/* Inner box — right-aligned, with padding from viewport edge */}
        <div className="absolute right-6 top-0 w-60 pointer-events-auto">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--border)]">
            <List size={13} className="text-[var(--accent)]" />
            <p className="mono text-[10px] text-[var(--muted)] tracking-[0.25em] uppercase font-medium">
              On this page
            </p>
          </div>

          {/* Scrollable nav — only scrolls when mouse is on it */}
          <div
            ref={tocRef}
            className="toc-scroll max-h-[calc(100vh-180px)] overflow-y-hidden"
          >
            <nav className="border-l border-[var(--border)]">
              {headings.map((h) => {
                const isActive = activeId === h.id
                const indent =
                  h.level === 1 ? 'pl-3' :
                  h.level === 2 ? 'pl-3' :
                  h.level === 3 ? 'pl-6' : 'pl-9'

                return (
                  <button
                    key={h.id}
                    onClick={() => handleClick(h.id)}
                    className={[
                      'w-full text-left block py-1.5 pr-2 text-xs leading-snug transition-all duration-150',
                      indent,
                      isActive
                        ? 'text-[var(--accent)] font-semibold border-l-2 border-[var(--accent)] -ml-px'
                        : 'text-[var(--muted)] hover:text-[var(--text)]',
                      h.level === 1 ? 'font-medium' : '',
                    ].join(' ')}
                  >
                    {h.text}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>
      </aside>
    </>
  )
}
