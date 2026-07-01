import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import BlogListClient from './BlogListClient'

async function getData() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // First try: fetch with quiz_data (works after migration is run)
    // If column doesn't exist yet, Supabase returns error — catch and retry without it
    let postsData: Record<string, unknown>[] = []
    const postsWithQuiz = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, tags, created_at, updated_at, quiz_data')
      .eq('published', true)
      .order('created_at', { ascending: false })

    if (!postsWithQuiz.error) {
      postsData = (postsWithQuiz.data || []) as Record<string, unknown>[]
    } else {
      // Column not yet added — fall back without quiz_data
      const postsBasic = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, tags, created_at, updated_at')
        .eq('published', true)
        .order('created_at', { ascending: false })
      postsData = (postsBasic.data || []) as Record<string, unknown>[]
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
          <Link href="/" className="inline-flex items-center gap-2 text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors mb-8 font-medium">
            <ArrowLeft size={13} /> Back home
          </Link>
          <p className="mono text-xs text-[var(--accent)] tracking-[0.3em] uppercase mb-2">~/blog</p>
          <h1 className="text-4xl font-bold text-[var(--text)] mb-2">Writing</h1>
          <p className="text-[var(--muted)] text-sm">
            Thoughts on cloud infrastructure, networking, DevOps, and the occasional rabbit hole.
          </p>
        </div>

        <BlogListClient posts={posts} activityMap={activityMap} />
      </div>
    </div>
  )
}
