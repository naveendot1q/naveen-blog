import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import BlogListClient from './BlogListClient'

async function getData() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const [postsRes, readsRes] = await Promise.all([
      supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, tags, created_at, updated_at')
        .eq('published', true)
        .order('created_at', { ascending: false }),
      user?.email
        ? supabase
            .from('blog_reads')
            .select('read_date, progress')
            .eq('reader_email', user.email)
        : Promise.resolve({ data: [] }),
    ])

    const activityMap: Record<string, number> = {}
    const reads = (readsRes as { data: { read_date: string; progress: number }[] | null }).data || []
    reads.forEach((r) => {
      activityMap[r.read_date] = (activityMap[r.read_date] || 0) + r.progress
    })

    return { posts: postsRes.data || [], activityMap }
  } catch {
    return { posts: [], activityMap: {} }
  }
}

export default async function BlogPage() {
  const { posts, activityMap } = await getData()
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-2">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors font-medium">
            <ArrowLeft size={12} /> Back home
          </Link>
        </div>

        {/* Newspaper masthead */}
        <header className="border-y border-[var(--text)] py-5 mb-1">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="mono text-[10px] text-[var(--muted)] tracking-[0.3em] uppercase mb-1">
                Cloud · DevOps · Networking
              </p>
              <h1 className="text-5xl font-black text-[var(--text)] tracking-tight leading-none" style={{ fontFamily: 'Georgia, serif' }}>
                The Naveen Post
              </h1>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-[var(--muted)]">{dateStr}</p>
              <p className="mono text-[10px] text-[var(--muted)] mt-1">{posts.length} article{posts.length !== 1 ? 's' : ''} published</p>
            </div>
          </div>
        </header>
        <div className="h-[2px] bg-[var(--text)] mb-8" />

        <BlogListClient posts={posts} activityMap={activityMap} />
      </div>
    </div>
  )
}
