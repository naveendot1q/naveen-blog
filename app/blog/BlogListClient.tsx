'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import BlogQuiz from '@/components/BlogQuiz'
import { Calendar, Clock } from 'lucide-react'
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
  activityMap: Record<string, number>  // server-fetched reading data (date → summed progress)
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
  // Always push the partial last week so today is always in the grid
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

function readTime(excerpt: string): string {
  const words = excerpt?.split(/\s+/).length || 0
  return `${Math.max(1, Math.ceil(words / 40))} min`
}

export default function BlogListClient({ posts, activityMap: serverMap }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>('all')
  // Client-side overlay — lets us update today's cell without a full page reload
  const [todayProgress, setTodayProgress] = useState<number>(0)
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])

  // On mount: fetch today's total reading progress from Supabase so the
  // heatmap reflects any reading done earlier in the session
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

  // Merge server map with live today progress
  const activityMap = useMemo(() => {
    const merged = { ...serverMap }
    // Live today value always wins if it's higher
    if (todayProgress > (merged[today] || 0)) {
      merged[today] = todayProgress
    }
    return merged
  }, [serverMap, todayProgress, today])

  const categories = useMemo(() => {
    const counts: Record<string,number> = {}
    posts.flatMap(p => p.tags || []).forEach(t => { counts[t] = (counts[t]||0)+1 })
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

  return (
    <div>
      {/* ── Reading heatmap ── */}
      <div className="mb-10 p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-[var(--text)]">Reading consistency</p>
            <p className="mono text-xs text-[var(--muted)] mt-0.5">
              {activeDays} day{activeDays !== 1 ? 's' : ''} with reading activity in the last year
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
            {/* Month labels */}
            <div className="relative h-4 mb-1">
              {monthLabels.map(({ label, col }) => (
                <span
                  key={`${label}-${col}`}
                  className="mono text-[9px] text-[var(--muted)] absolute"
                  style={{ left: col * 15 }}
                >
                  {label}
                </span>
              ))}
            </div>

            {/* Grid */}
            <div className="flex gap-[3px]">
              {weeks.map((wk, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {wk.map(date => {
                    const v = activityMap[date] || 0
                    const isToday = date === today
                    const level = getLevel(v)
                    const tooltip = isToday
                      ? v > 0
                        ? `Today (${date}): ${Math.min(100, Math.round(v*100))}% read`
                        : `Today (${date}): no reading yet`
                      : v > 0
                        ? `${date}: ${Math.min(100, Math.round(v*100))}% read`
                        : date

                    return (
                      <div
                        key={date}
                        className={`heatmap-cell ${isToday ? 'ring-1 ring-[var(--accent)] ring-offset-1 ring-offset-[var(--surface)]' : ''}`}
                        data-level={level}
                        title={tooltip}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 pt-3 border-t border-[var(--border)] flex flex-wrap gap-x-5 gap-y-1">
          {[
            { l: 0, t: 'not read' },
            { l: 1, t: '≤25%' },
            { l: 2, t: '~50%' },
            { l: 3, t: '~75%' },
            { l: 4, t: 'full read' },
          ].map(({ l, t }) => (
            <div key={l} className="flex items-center gap-1.5">
              <div className="heatmap-cell" data-level={l} />
              <span className="mono text-[10px] text-[var(--muted)]">{t}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 ml-auto">
            <div className="heatmap-cell ring-1 ring-[var(--accent)] ring-offset-1 ring-offset-[var(--surface)]" data-level={getLevel(activityMap[today] || 0)} />
            <span className="mono text-[10px] text-[var(--accent)]">today</span>
          </div>
        </div>
      </div>

      {/* ── Category filter ── */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1 rounded-md border text-xs font-medium transition-all ${
            activeCategory === 'all'
              ? 'border-[var(--accent)] text-[var(--accent)]'
              : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--muted)]'
          }`}
        >
          All <span className="opacity-60 ml-1">{posts.length}</span>
        </button>
        {categories.map(({ tag, count }) => (
          <button
            key={tag}
            onClick={() => setActiveCategory(tag)}
            className={`px-3 py-1 rounded-md border text-xs font-medium transition-all ${
              activeCategory === tag
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--muted)]'
            }`}
          >
            {tag} <span className="opacity-60 ml-1">{count}</span>
          </button>
        ))}
      </div>

      {/* ── Tile grid ── */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center border border-[var(--border)] rounded-xl">
          <p className="text-sm text-[var(--muted)]">No posts in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex flex-col p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] transition-all duration-200"
            >
              {/* Tags */}
              {post.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {post.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              )}

              {/* Title */}
              <h2 className="font-semibold text-[var(--text)] text-sm group-hover:text-[var(--accent)] transition-colors leading-snug mb-2 flex-1">
                {post.title}
              </h2>

              {/* Excerpt */}
              <p className="text-xs text-[var(--muted)] leading-relaxed line-clamp-3 mb-4">
                {post.excerpt}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-[var(--border)] mt-auto">
                <span className="mono text-[10px] text-[var(--muted)] flex items-center gap-1">
                  <Calendar size={10} />
                  {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="mono text-[10px] text-[var(--muted)] flex items-center gap-1">
                  <Clock size={10} />
                  {readTime(post.excerpt)}
                </span>
              </div>
              <BlogQuiz quizData={post.quiz_data ?? null} inline />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
