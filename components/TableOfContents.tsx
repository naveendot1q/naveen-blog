'use client'

import { useEffect, useRef, useState } from 'react'
import { List } from 'lucide-react'

interface Heading {
  id: string
  text: string
  level: number
}

export default function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>('')
  const [isScrollable, setIsScrollable] = useState(false)
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

  useEffect(() => {
    const el = tocRef.current
    if (!el) return
    const check = () => setIsScrollable(el.scrollHeight > el.clientHeight)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
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
    <aside className="hidden xl:block w-64 shrink-0">
      <div className="sticky top-24">
        <div className="flex items-center gap-2 mb-3">
          <List size={13} className="text-[var(--accent)]" />
          <p className="mono text-[10px] text-[var(--muted)] tracking-[0.25em] uppercase font-medium">
            On this page
          </p>
        </div>

        {/* Use a className-only approach — no inline style with non-standard props */}
        <div
          ref={tocRef}
          className="toc-scroll max-h-[calc(100vh-140px)] pr-1 overflow-y-hidden"
        >
          <nav className="space-y-0.5 border-l border-[var(--border)]">
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
                    'w-full text-left block py-1.5 text-xs leading-snug transition-all duration-150',
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

        {isScrollable && (
          <p className="mono text-[9px] text-[var(--muted)] opacity-40 mt-2 text-center">
            hover to scroll
          </p>
        )}
      </div>
    </aside>
  )
}
