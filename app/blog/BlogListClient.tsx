'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  tags: string[]
  created_at: string
  updated_at?: string
}

interface Props {
  posts: Post[]
  activityMap: Record<string, number>
}

function generateHeatmapDates() {
  const weeks: string[][] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - 364 - today.getDay())
  let current = new Date(startDate)
  let week: string[] = []
  while (current <= today) {
    week.push(current.toISOString().slice(0, 10))
    if (week.length === 7) { weeks.push(week); week = [] }
    current.setDate(current.getDate() + 1)
  }
  if (week.length) weeks.push(week)
  return weeks
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function getLevel(v: number): number {
  if (v <= 0) return 0
  if (v <= 0.25) return 1
  if (v <= 0.5) return 2
  if (v <= 0.75) return 3
  return 4
}

export default function BlogListClient({ posts, activityMap }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const categories = useMemo(() => {
    const counts: Record<string, number> = {}
    posts.flatMap(p => p.tags || []).forEach(t => { counts[t] = (counts[t] || 0) + 1 })
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([tag, count]) => ({ tag, count }))
  }, [posts])

  const filtered = useMemo(() =>
    activeCategory === 'all' ? posts : posts.filter(p => p.tags?.includes(activeCategory)),
  [posts, activeCategory])

  const weeks = useMemo(() => generateHeatmapDates(), [])

  const monthLabels = useMemo(() => {
    const labels: { label: string; col: number }[] = []
    let lastMonth = -1
    weeks.forEach((week, col) => {
      const m = new Date(week[0]).getMonth()
      if (m !== lastMonth) { labels.push({ label: MONTHS[m], col }); lastMonth = m }
    })
    return labels
  }, [weeks])

  const activeDays = Object.values(activityMap).filter(v => v > 0).length

  return (
    <div>
      {/* ── Heatmap ── */}
      <div className="mb-10 p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-[var(--text)]">Reading consistency</p>
            <p className="mono text-xs text-[var(--muted)] mt-0.5">
              {activeDays} day{activeDays !== 1 ? 's' : ''} with reading activity
            </p>
          </div>
          <div className="flex items-center gap-1.5 mono text-[10px] text-[var(--muted)]">
            <span>less</span>
            {[0,1,2,3,4].map(l => <div key={l} className="heatmap-cell" data-level={l} />)}
            <span>more</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="relative" style={{ minWidth: weeks.length * 15 }}>
            <div className="relative h-4 mb-1">
              {monthLabels.map(({ label, col }) => (
                <span key={`${label}-${col}`} className="mono text-[9px] text-[var(--muted)] absolute" style={{ left: col * 15 }}>
                  {label}
                </span>
              ))}
            </div>
            <div className="flex gap-[3px]">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map(date => {
                    const v = activityMap[date] || 0
                    return (
                      <div
                        key={date}
                        className="heatmap-cell"
                        data-level={getLevel(v)}
                        title={v > 0 ? `${date}: ${Math.min(100, Math.round(v * 100))}% read` : date}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-[var(--border)] flex flex-wrap gap-x-5 gap-y-1">
          {[{l:1,t:'≤25% read'},{l:2,t:'~50% read'},{l:3,t:'~75% read'},{l:4,t:'full read'}].map(({l,t}) => (
            <div key={l} className="flex items-center gap-1.5">
              <div className="heatmap-cell" data-level={l} />
              <span className="mono text-[10px] text-[var(--muted)]">{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Category filter ── */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-all border ${
            activeCategory === 'all'
              ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--surface)]'
              : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--muted)]'
          }`}
        >
          All <span className="opacity-60 ml-1">{posts.length}</span>
        </button>
        {categories.map(({ tag, count }) => (
          <button
            key={tag}
            onClick={() => setActiveCategory(tag)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all border ${
              activeCategory === tag
                ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--surface)]'
                : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--muted)]'
            }`}
          >
            {tag} <span className="opacity-60 ml-1">{count}</span>
          </button>
        ))}
      </div>

      {/* ── Posts list ── */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center border border-[var(--border)] rounded-xl">
          <p className="text-sm text-[var(--muted)]">No posts in this category yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-xl overflow-hidden">
          {filtered.map((post) => {
            const date = new Date(post.created_at)
            const mon = date.toLocaleDateString('en-US', { month: 'short' })
            const day = date.toLocaleDateString('en-US', { day: '2-digit' })
            const yr  = date.getFullYear()

            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex items-start gap-5 px-5 py-4 bg-[var(--surface)] hover:bg-[var(--surface2)] transition-colors"
              >
                {/* Date column */}
                <div className="shrink-0 w-14 text-right pt-0.5">
                  <p className="mono text-xs text-[var(--accent)] font-medium leading-none">{mon} {day}</p>
                  <p className="mono text-[10px] text-[var(--muted)] mt-0.5">{yr}</p>
                </div>

                {/* Divider */}
                <div className="shrink-0 w-px self-stretch bg-[var(--border)] mt-1" />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-[var(--text)] text-sm group-hover:text-[var(--accent)] transition-colors leading-snug mb-1">
                    {post.title}
                  </h2>
                  <p className="text-xs text-[var(--muted)] line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                  {post.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {post.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Arrow */}
                <ArrowRight
                  size={14}
                  className="shrink-0 text-[var(--border)] group-hover:text-[var(--accent)] transition-colors mt-0.5"
                />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
