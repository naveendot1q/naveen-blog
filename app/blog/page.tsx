import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import BlogListClient from './BlogListClient'

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

async function getData() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // First try: fetch with quiz_data (works after migration is run)
    // If column doesn't exist yet, Supabase returns error — catch and retry without it
    let postsData: Post[] = []
    const postsWithQuiz = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, tags, created_at, updated_at, quiz_data')
      .eq('published', true)
      .order('created_at', { ascending: false })

    if (!postsWithQuiz.error) {
      postsData = (postsWithQuiz.data || []) as Post[]
    } else {
      // Column not yet added — fall back without quiz_data
      const postsBasic = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, tags, created_at, updated_at')
        .eq('published', true)
        .order('created_at', { ascending: false })
      postsData = (postsBasic.data || []) as Post[]
    }

    const [, readsRes] = await Promise.all([
      Promise.resolve(null),
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

    return { posts: postsData, activityMap }
  } catch {
    return { posts: [], activityMap: {} }
  }
}

export default async function BlogPage() {
  const { posts, activityMap } = await getData()

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-xs text-[var(--muted)] hover:text-[var(--signal)] transition-colors mb-8 font-medium">
            <ArrowLeft size={13} /> Back home
          </Link>
          <div className="flex items-center gap-2.5 mb-3">
            <span className="status-dot pulse" />
            <p className="mono text-xs text-[var(--signal)] tracking-[0.3em] uppercase">log · live</p>
          </div>
          <h1 className="font-display text-4xl font-bold text-[var(--text)] mb-2">Signal Log</h1>
          <p className="text-[var(--muted)] text-sm max-w-xl">
            {posts.length} entr{posts.length === 1 ? 'y' : 'ies'} on cloud infrastructure, networking, and DevOps —
            filed as they happen.
          </p>
        </div>

        <BlogListClient posts={posts} activityMap={activityMap} />
      </div>
    </div>
  )
}
