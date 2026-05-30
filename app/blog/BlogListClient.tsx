'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Calendar } from 'lucide-react'

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

// Generate last 52 weeks of dates
function generateHeatmapDates() {
  const weeks: string[][] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  // Start from the Sunday 52 weeks ago
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - 364 - today.getDay())

  let current = new Date(startDate)
  let week: string[] = []

  while (current <= today) {
    week.push(current.toISOString().slice(0, 10))
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
    current.setDate(current.getDate() + 1)
  }
  if (week.length) weeks.push(week)
  return weeks
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function BlogListClient({ posts, activityMap }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>('all')

  // Extract all unique tags as categories
  const categories = useMemo(() => {
    const all = posts.flatMap((p) => p.tags || [])
    const counts: Record<string, number> = {}
    all.forEach((t) => { counts[t] = (counts[t] || 0) + 1 })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }))
  }, [posts])

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return posts
    return posts.filter((p) => p.tags?.includes(activeCategory))
  }, [posts, activeCategory])

  const weeks = useMemo(() => generateHeatmapDates(), [])

  // Month labels: find first week of each month
  const monthLabels = useMemo(() => {
    const labels: { label: string; col: number }[] = []
    let lastMonth = -1
    weeks.forEach((week, col) => {
      const d = new Date(week[0])
      const m = d.getMonth()
      if (m !== lastMonth) {
        labels.push({ label: MONTHS[m], col })
        lastMonth = m
      }
    })
    return labels
  }, [weeks])

  function getLevel(date: string): number {
    const v = activityMap[date] || 0
    if (v === 0) return 0
    if (v < 1) return 1
    if (v === 1) return 2
    if (v <= 2) return 3
    return 4
  }

  const totalPosts = posts.length

  return (
    <div>
      {/* Heatmap */}
      <div className="mb-10 p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-semibold text-[var(--text)] text-sm">Writing consistency</p>
            <p className="mono text-xs text-[var(--muted)] mt-0.5">{totalPosts} post{totalPosts !== 1 ? 's' : ''} in the last year</p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-[var(--muted)] mono">
            <span>less</span>
            {[0,1,2,3,4].map(l => (
              <div key={l} className="heatmap-cell" data-level={l} style={{width:12,height:12}} />
            ))}
            <span>more</span>
          </div>
        </div>

        {/* Month labels */}
        <div className="overflow-x-auto">
          <div className="relative" style={{ minWidth: weeks.length * 15 }}>
            {/* Month labels row */}
            <div className="flex mb-1" style={{ paddingLeft: 0 }}>
              {monthLabels.map(({ label, col }) => (
                <div key={`${label}-${col}`}
                  className="mono text-[9px] text-[var(--muted)] absolute"
                  style={{ left: col * 15 }}>
                  {label}
                </div>
              ))}
            </div>
            {/* Grid */}
            <div className="flex gap-[3px] mt-4">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map((date) => {
                    const level = getLevel(date)
                    const count = activityMap[date] || 0
                    return (
                      <div
                        key={date}
                        className="heatmap-cell"
                        data-level={level}
                        title={count > 0 ? `${date}: ${count} post${count !== 1 ? 's' : ''}` : date}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${
            activeCategory === 'all'
              ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-md'
              : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
          }`}>
          All <span className="ml-1 opacity-70">{posts.length}</span>
        </button>
        {categories.map(({ tag, count }) => (
          <button key={tag}
            onClick={() => setActiveCategory(tag)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${
              activeCategory === tag
                ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-md'
                : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
            }`}>
            {tag} <span className="ml-1 opacity-70">{count}</span>
          </button>
        ))}
      </div>

      {/* Posts list */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 border border-[var(--border)] rounded-2xl">
          <p className="text-[var(--muted)] text-sm">No posts in this category yet.</p>
        </div>
      ) : (
        <div className="space-y-px border border-[var(--border)] rounded-2xl overflow-hidden">
          {filtered.map((post, index) => (
            <Link key={post.id} href={`/blog/${post.slug}`}
              className={`group flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-[var(--surface)] hover:bg-[var(--surface2)] transition-colors ${
                index !== filtered.length - 1 ? 'border-b border-[var(--border)]' : ''
              }`}>
              <div className="mono text-xs text-[var(--muted)] shrink-0 w-24">
                {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-[var(--text)] text-sm group-hover:text-[var(--accent)] transition-colors mb-1 leading-snug">
                  {post.title}
                </h2>
                <p className="text-xs text-[var(--muted)] line-clamp-2 leading-relaxed">{post.excerpt}</p>
              </div>
              {post.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 shrink-0">
                  {post.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
