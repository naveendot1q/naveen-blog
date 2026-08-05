'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Clock, HelpCircle, Search, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  tags: string[]
  created_at: string
  updated_at?: string
  quiz_data?: { questions: { q: string; options: string[]; answer: number; explain?: string }[] } | null
}

interface Props {
  posts: Post[]
  activityMap: Record<string, number>
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function generateHeatmapDates(): string[][] {
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

function getLevel(v: number): number {
  if (v <= 0) return 0
  if (v <= 0.25) return 1
  if (v <= 0.5) return 2
  if (v <= 0.75) return 3
  return 4
}

function readTime(excerpt: string): number {
  const words = excerpt?.split(/\s+/).length || 0
  return Math.max(1, Math.ceil(words / 40))
}

function logDate(d: string): string {
  const date = new Date(d)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function BlogListClient({ posts, activityMap: serverMap }: Props) {
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')
  const [todayProgress, setTodayProgress] = useState<number>(0)
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])

  useEffect(() => {
    const fetchToday = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) return
      const { data } = await supabase
        .from('blog_reads')
        .select('progress')
        .eq('reader_email', user.email)
        .eq('read_date', today)
      if (data && data.length > 0) {
        const total = data.reduce((sum: number, r: { progress: number }) => sum + Number(r.progress), 0)
        setTodayProgress(total)
      }
    }
    fetchToday()
  }, [today])

  const activityMap = useMemo(() => {
    const merged = { ...serverMap }
    if (todayProgress > (merged[today] || 0)) merged[today] = todayProgress
    return merged
  }, [serverMap, todayProgress, today])

  // All unique tags, sorted by frequency
  const allTags = useMemo(() => {
    const counts: Record<string, number> = {}
    posts.forEach(p => (p.tags || []).forEach(t => { counts[t] = (counts[t] || 0) + 1 }))
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([tag]) => tag)
  }, [posts])

  const toggleTag = (tag: string) => {
    setActiveTags(prev => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag)
      else next.add(tag)
      return next
    })
  }

  const filtered = useMemo(() => {
    let list = posts
    if (activeTags.size > 0) {
      list = list.filter(p => (p.tags || []).some(t => activeTags.has(t)))
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt?.toLowerCase().includes(q) ||
        (p.tags || []).some(t => t.toLowerCase().includes(q))
      )
    }
    return list
  }, [posts, activeTags, query])

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

  return (
    <div>
      {/* ── Signal strip: reading activity, framed as an uptime readout ── */}
      <div className="mb-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <span className="status-dot pulse" />
            <p className="mono text-[11px] text-[var(--muted)] tracking-[0.18em] uppercase">
              Signal — reading activity, last 365d
            </p>
          </div>
          <p className="mono text-[11px] text-[var(--signal)]">
            {activeDays} active day{activeDays !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="overflow-x-auto px-5 py-4">
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
                    const isToday = date === today
                    const level = getLevel(v)
                    const tooltip = isToday
                      ? v > 0 ? `Today (${date}): ${Math.min(100, Math.round(v*100))}% read` : `Today (${date}): no reading yet`
                      : v > 0 ? `${date}: ${Math.min(100, Math.round(v*100))}% read` : date
                    return (
                      <div key={date}
                        className={`heatmap-cell ${isToday ? 'ring-1 ring-[var(--signal)] ring-offset-1 ring-offset-[var(--surface)]' : ''}`}
                        data-level={level} title={tooltip} />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Search + filter chips ── */}
      <div className="mb-2 space-y-3">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="grep entries..."
            className="mono w-full text-sm pl-10 pr-9 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--signal)] transition-colors"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)]">
              <X size={14} />
            </button>
          )}
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTags(new Set())}
              className={`chip ${activeTags.size === 0 ? 'active' : ''}`}
            >
              all
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`chip ${activeTags.has(tag) ? 'active' : ''}`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── The log ── */}
      <div className="mt-6">
        {filtered.length === 0 ? (
          <div className="py-16 text-center border border-[var(--border)] rounded-xl">
            <p className="mono text-sm text-[var(--muted)]">
              {posts.length === 0 ? 'no entries yet.' : `no entries match "${query || [...activeTags].join(', ')}"`}
            </p>
          </div>
        ) : (
          filtered.map(post => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="log-row group">
              <span className="status-dot mt-[7px]" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1.5">
                  <span className="mono text-[11px] text-[var(--muted)] shrink-0">
                    {logDate(post.created_at)}
                  </span>
                  <h2 className="font-display font-semibold text-[15px] text-[var(--text)] group-hover:text-[var(--signal)] transition-colors leading-snug">
                    {post.title}
                  </h2>
                </div>
                <p className="text-[13px] text-[var(--muted)] leading-relaxed line-clamp-2 mb-2.5 max-w-2xl">
                  {post.excerpt}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  {post.tags?.slice(0, 4).map(t => (
                    <span key={t} className="tag">{t}</span>
                  ))}
                  <span className="mono text-[10px] text-[var(--muted)] flex items-center gap-1 ml-auto">
                    <Clock size={10} /> {readTime(post.excerpt)} min
                  </span>
                  {post.quiz_data?.questions?.length ? (
                    <span className="mono text-[10px] text-[var(--warn)] flex items-center gap-1">
                      <HelpCircle size={10} /> quiz · {post.quiz_data.questions.length}
                    </span>
                  ) : null}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
