'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import BlogQuiz from '@/components/BlogQuiz'
import { Calendar, Clock, Folder, FolderOpen, ChevronRight, FileText } from 'lucide-react'
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

function readTime(excerpt: string): string {
  const words = excerpt?.split(/\s+/).length || 0
  return `${Math.max(1, Math.ceil(words / 40))} min`
}

export default function BlogListClient({ posts, activityMap: serverMap }: Props) {
  // openFolders: set of tag names whose folder is expanded
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set())
  // view: 'folders' = tag folder view, 'all' = flat tile grid
  const [view, setView] = useState<'folders' | 'all'>('folders')

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

  // Build folder structure: each unique tag → posts that have that tag
  // Sorted by post count desc, then alphabetically
  const folders = useMemo(() => {
    const map: Record<string, Post[]> = {}
    posts.forEach(post => {
      (post.tags || []).forEach(tag => {
        if (!map[tag]) map[tag] = []
        // avoid duplicates (post can appear in multiple folders)
        if (!map[tag].find(p => p.id === post.id)) map[tag].push(post)
      })
    })
    // Sort posts inside each folder by date desc
    Object.values(map).forEach(arr => arr.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ))
    // Sort folders: most posts first, then alphabetically
    return Object.entries(map)
      .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
      .map(([tag, folderPosts]) => ({ tag, posts: folderPosts }))
  }, [posts])

  // Posts without any tag go into an "Uncategorised" folder
  const uncategorised = useMemo(() =>
    posts.filter(p => !p.tags || p.tags.length === 0)
  , [posts])

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

  const toggleFolder = (tag: string) => {
    setOpenFolders(prev => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag)
      else next.add(tag)
      return next
    })
  }

  const expandAll = () => {
    setOpenFolders(new Set([...folders.map(f => f.tag), 'uncategorised']))
  }

  const collapseAll = () => setOpenFolders(new Set())

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
                        className={`heatmap-cell ${isToday ? 'ring-1 ring-[var(--accent)] ring-offset-1 ring-offset-[var(--surface)]' : ''}`}
                        data-level={level} title={tooltip} />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-[var(--border)] flex flex-wrap gap-x-5 gap-y-1">
          {[{l:0,t:'not read'},{l:1,t:'≤25%'},{l:2,t:'~50%'},{l:3,t:'~75%'},{l:4,t:'full read'}].map(({l,t}) => (
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

      {/* ── View toggle + controls ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1 p-1 rounded-lg border border-[var(--border)] bg-[var(--surface)]">
          <button
            onClick={() => setView('folders')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              view === 'folders' ? 'bg-[var(--accent)] text-white' : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            <Folder size={12} /> Folders
          </button>
          <button
            onClick={() => setView('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              view === 'all' ? 'bg-[var(--accent)] text-white' : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            <FileText size={12} /> All posts
          </button>
        </div>

        {view === 'folders' && (
          <div className="flex items-center gap-3">
            <button onClick={expandAll} className="mono text-[10px] text-[var(--muted)] hover:text-[var(--accent)] transition-colors">
              expand all
            </button>
            <span className="text-[var(--border)]">·</span>
            <button onClick={collapseAll} className="mono text-[10px] text-[var(--muted)] hover:text-[var(--accent)] transition-colors">
              collapse all
            </button>
          </div>
        )}
      </div>

      {/* ── FOLDER VIEW ── */}
      {view === 'folders' && (
        <div className="space-y-3">
          {[...folders, ...(uncategorised.length > 0 ? [{ tag: 'uncategorised', posts: uncategorised }] : [])].map(({ tag, posts: folderPosts }) => {
            const isOpen = openFolders.has(tag)
            return (
              <div key={tag} className="border border-[var(--border)] rounded-xl overflow-hidden">
                {/* Folder header — clickable */}
                <button
                  onClick={() => toggleFolder(tag)}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-[var(--surface)] hover:bg-[var(--surface2)] transition-colors text-left"
                >
                  <div className="shrink-0">
                    {isOpen
                      ? <FolderOpen size={18} className="text-[var(--accent)]" />
                      : <Folder size={18} className="text-[var(--accent)]" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-[var(--text)] text-sm capitalize">{tag}</span>
                    <span className="mono text-[10px] text-[var(--muted)] ml-2">
                      {folderPosts.length} post{folderPosts.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <ChevronRight
                    size={14}
                    className={`text-[var(--muted)] transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-90' : ''}`}
                  />
                </button>

                {/* Folder contents — tile grid */}
                {isOpen && (
                  <div className="border-t border-[var(--border)] p-4 bg-[var(--bg)]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {folderPosts.map(post => (
                        <Link
                          key={post.id}
                          href={`/blog/${post.slug}`}
                          className="group flex flex-col p-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] transition-all duration-200"
                        >
                          {/* Other tags (not the current folder tag) */}
                          {post.tags?.filter(t => t !== tag).length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {post.tags.filter(t => t !== tag).slice(0, 2).map(t => (
                                <span key={t} className="tag">{t}</span>
                              ))}
                            </div>
                          )}

                          <h3 className="font-semibold text-[var(--text)] text-sm group-hover:text-[var(--accent)] transition-colors leading-snug mb-2 flex-1">
                            {post.title}
                          </h3>

                          <p className="text-xs text-[var(--muted)] leading-relaxed line-clamp-2 mb-3">
                            {post.excerpt}
                          </p>

                          <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] mt-auto">
                            <span className="mono text-[10px] text-[var(--muted)] flex items-center gap-1">
                              <Calendar size={9} />
                              {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className="mono text-[10px] text-[var(--muted)] flex items-center gap-1">
                              <Clock size={9} />
                              {readTime(post.excerpt)}
                            </span>
                          </div>
                          <BlogQuiz quizData={post.quiz_data ?? null} inline />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {folders.length === 0 && uncategorised.length === 0 && (
            <div className="py-16 text-center border border-[var(--border)] rounded-xl">
              <p className="text-sm text-[var(--muted)]">No posts yet.</p>
            </div>
          )}
        </div>
      )}

      {/* ── ALL POSTS VIEW (flat tile grid) ── */}
      {view === 'all' && (
        posts.length === 0 ? (
          <div className="py-16 text-center border border-[var(--border)] rounded-xl">
            <p className="text-sm text-[var(--muted)]">No posts yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map(post => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] transition-all duration-200"
              >
                {post.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {post.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
                <h2 className="font-semibold text-[var(--text)] text-sm group-hover:text-[var(--accent)] transition-colors leading-snug mb-2 flex-1">
                  {post.title}
                </h2>
                <p className="text-xs text-[var(--muted)] leading-relaxed line-clamp-3 mb-4">
                  {post.excerpt}
                </p>
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
        )
      )}
    </div>
  )
}
