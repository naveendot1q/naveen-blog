'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

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
  const today = new Date(); today.setHours(0,0,0,0)
  const start = new Date(today); start.setDate(today.getDate() - 364 - today.getDay())
  let cur = new Date(start); let week: string[] = []
  while (cur <= today) {
    week.push(cur.toISOString().slice(0,10))
    if (week.length === 7) { weeks.push(week); week = [] }
    cur.setDate(cur.getDate() + 1)
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
    const counts: Record<string,number> = {}
    posts.flatMap(p => p.tags || []).forEach(t => { counts[t] = (counts[t] || 0) + 1 })
    return Object.entries(counts).sort((a,b) => b[1]-a[1]).map(([tag,count]) => ({ tag, count }))
  }, [posts])

  const filtered = useMemo(() =>
    activeCategory === 'all' ? posts : posts.filter(p => p.tags?.includes(activeCategory))
  , [posts, activeCategory])

  const weeks = useMemo(() => generateHeatmapDates(), [])

  const monthLabels = useMemo(() => {
    const labels: { label: string; col: number }[] = []
    let last = -1
    weeks.forEach((wk, col) => {
      const m = new Date(wk[0]).getMonth()
      if (m !== last) { labels.push({ label: MONTHS[m], col }); last = m }
    })
    return labels
  }, [weeks])

  const activeDays = Object.values(activityMap).filter(v => v > 0).length

  // Split posts for newspaper layout: featured (first) + rest
  const [featured, ...rest] = filtered

  return (
    <div>
      {/* ── Reading heatmap ── */}
      <div className="mb-8 p-4 border border-[var(--border)] rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-semibold text-[var(--text)] uppercase tracking-widest" style={{ fontFamily: 'Georgia, serif' }}>
              Reading Log
            </p>
            <p className="mono text-[10px] text-[var(--muted)] mt-0.5">
              {activeDays} day{activeDays !== 1 ? 's' : ''} of reading in the last year
            </p>
          </div>
          <div className="flex items-center gap-1 mono text-[10px] text-[var(--muted)]">
            <span>less</span>
            {[0,1,2,3,4].map(l => <div key={l} className="heatmap-cell" data-level={l} />)}
            <span>more</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <div className="relative" style={{ minWidth: weeks.length * 15 }}>
            <div className="relative h-4 mb-1">
              {monthLabels.map(({ label, col }) => (
                <span key={`${label}-${col}`} className="mono text-[9px] text-[var(--muted)] absolute" style={{ left: col * 15 }}>{label}</span>
              ))}
            </div>
            <div className="flex gap-[3px]">
              {weeks.map((wk, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {wk.map(date => {
                    const v = activityMap[date] || 0
                    return <div key={date} className="heatmap-cell" data-level={getLevel(v)} title={v > 0 ? `${date}: ${Math.min(100, Math.round(v * 100))}% read` : date} />
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Category filter — newspaper "section" style ── */}
      {categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-1 gap-y-2 mb-6 border-b border-[var(--border)] pb-4">
          <span className="mono text-[10px] text-[var(--muted)] uppercase tracking-widest mr-2">Section:</span>
          {['all', ...categories.map(c => c.tag)].map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveCategory(tag)}
              className={`mono text-[10px] uppercase tracking-widest px-2 py-0.5 transition-all ${
                activeCategory === tag
                  ? 'text-[var(--bg)] bg-[var(--text)]'
                  : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              {tag === 'all' ? `All (${posts.length})` : `${tag} (${categories.find(c=>c.tag===tag)?.count ?? 0})`}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="py-16 text-center border border-[var(--border)]">
          <p className="text-sm text-[var(--muted)]" style={{ fontFamily: 'Georgia, serif' }}>
            No articles in this section yet.
          </p>
        </div>
      ) : (
        <div>
          {/* ── Featured article (first post) ── */}
          {featured && (
            <Link href={`/blog/${featured.slug}`} className="group block mb-8 pb-8 border-b border-[var(--border)]">
              <div className="flex items-start gap-2 mb-2">
                {featured.tags?.slice(0,1).map(t => (
                  <span key={t} className="mono text-[10px] text-[var(--accent)] uppercase tracking-widest font-medium">{t}</span>
                ))}
                <span className="mono text-[10px] text-[var(--muted)] uppercase tracking-widest">
                  · {new Date(featured.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <h2
                className="text-3xl font-black text-[var(--text)] group-hover:text-[var(--accent)] transition-colors leading-tight mb-3"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {featured.title}
              </h2>
              <p className="text-sm text-[var(--muted)] leading-relaxed max-w-2xl">
                {featured.excerpt}
              </p>
              <span className="inline-block mt-3 mono text-xs text-[var(--accent)] group-hover:underline">
                Read article →
              </span>
            </Link>
          )}

          {/* ── Rest: two-column newspaper grid ── */}
          {rest.length > 0 && (
            <div className="columns-1 sm:columns-2 gap-0">
              {rest.map((post, i) => {
                const isLast = i === rest.length - 1
                const isOdd = rest.length % 2 !== 0
                return (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className={`group break-inside-avoid block border-[var(--border)] p-0 ${
                      i % 2 === 0 ? 'sm:border-r' : ''
                    } ${!isLast && !(isOdd && i === rest.length - 1) ? 'border-b' : ''} px-0 py-5 sm:px-5`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      {post.tags?.slice(0,1).map(t => (
                        <span key={t} className="mono text-[10px] text-[var(--accent)] uppercase tracking-widest">{t}</span>
                      ))}
                      <span className="mono text-[10px] text-[var(--muted)]">
                        · {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <h3
                      className="font-bold text-[var(--text)] text-base group-hover:text-[var(--accent)] transition-colors leading-snug mb-2"
                      style={{ fontFamily: 'Georgia, serif' }}
                    >
                      {post.title}
                    </h3>
                    <p className="text-xs text-[var(--muted)] leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                    {post.tags && post.tags.length > 1 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {post.tags.slice(1, 3).map(t => (
                          <span key={t} className="tag" style={{ fontSize: 10 }}>{t}</span>
                        ))}
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
