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

    // Build activityMap: date -> highest progress reading that day (across all posts)
    // Level 1 = 0.25 (25%), 2 = 0.5 (50%), 3 = 0.75 (75%), 4 = 1.0 (100%)
    const activityMap: Record<string, number> = {}
    const reads = (readsRes as { data: { read_date: string; progress: number }[] | null }).data || []
    reads.forEach((r) => {
      const d = r.read_date
      // Sum progress across posts read that day (multiple reads = brighter cell)
      activityMap[d] = (activityMap[d] || 0) + r.progress
    })

    return { posts: postsRes.data || [], activityMap }
  } catch {
    return { posts: [], activityMap: {} }
  }
}

export default async function BlogPage() {
  const { posts, activityMap } = await getData()

  return (
    <div className="min-h-screen pt-24">
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
